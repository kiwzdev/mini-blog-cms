// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email/sendResetToken";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-response";
import prisma from "@/lib/db";

// Input validation schema
interface ForgotPasswordRequest {
  email: string;
}

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const { email }: ForgotPasswordRequest = body;

    // Input validation
    if (!email || typeof email !== "string") {
      return createErrorResponse({
        code: "INVALID_INPUT",
        message: "Valid email is required",
        status: 400
      });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    
    if (!validateEmail(normalizedEmail)) {
      return createErrorResponse({
        code: "INVALID_EMAIL",
        message: "Please provide a valid email address",
        status: 400
      });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({ 
      where: { email: normalizedEmail },
      select: { id: true, email: true } // Only select needed fields
    });

    if (!user) {
      // Return success even if user doesn't exist for security
      // This prevents email enumeration attacks
      return createSuccessResponse({
        message: "If an account with that email exists, a password reset link has been sent",
      });
    }

    // Clean up old tokens (delete expired ones first)
    await prisma.passwordResetToken.deleteMany({
      where: { 
        OR: [
          { userId: user.id },
          { expiresAt: { lt: new Date() } } // Also clean up expired tokens
        ]
      },
    });

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = await bcrypt.hash(resetToken, 12); // Increased salt rounds

    // Set expiration time (1 hour)
    const expirationTime = new Date(Date.now() + 60 * 60 * 1000);

    // Create reset token record
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: hashedToken,
        expiresAt: expirationTime,
      },
    });

    // Generate reset URL
    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL;
    if (!baseUrl) {
      throw new Error("Base URL not configured");
    }

    const resetUrl = `${baseUrl}/auth/reset-password?token=${resetToken}`;

    // Send reset email
    await sendPasswordResetEmail(user.email, resetUrl);

    // Log for development (remove in production)
    if (process.env.NODE_ENV === "development") {
      console.log("Password reset URL:", resetUrl);
    }

    return createSuccessResponse({
      message: "If an account with that email exists, a password reset link has been sent",
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    
    // Don't expose internal errors to client
    return createErrorResponse({
      code: "INTERNAL_ERROR",
      message: "Something went wrong. Please try again later",
    });
  } finally {
    await prisma.$disconnect();
  }
}

// Optional: Add rate limiting middleware or check
// You might want to add this to prevent abuse
export async function middleware(req: NextRequest) {
  // Rate limiting logic here
  // Example: max 5 requests per hour per IP
}