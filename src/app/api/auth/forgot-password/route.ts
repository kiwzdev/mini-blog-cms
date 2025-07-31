// app/api/auth/forgowt-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email/sendResetToken"; // You'll need to implement this
import { PrismaClient } from "@prisma/client";
import { createSuccessResponse } from "@/lib/api-response";
import { createErrorResponse } from "@/lib/api-response";

const prisma = new PrismaClient();

// Password Reset Request API
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Return success even if user doesn't exist for security
      return createSuccessResponse({
        message: "Password reset email sent successfully",
      });
    }

    // Delete any existing reset tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = await bcrypt.hash(resetToken, 10);

    // Create reset token record
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: hashedToken,
        expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
      },
    });

    // Send reset email
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;

    await sendPasswordResetEmail(user.email, resetUrl);

    // For development, log the reset URL
    console.log("Password reset URL:", resetUrl);

    return createSuccessResponse({
      message: "Password reset email sent successfully",
    });
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return createErrorResponse({
      code: "FORGOT_PASSWORD_ERROR",
      message: "Error sending password reset email",
    });
  } finally {
    await prisma.$disconnect();
  }
}
