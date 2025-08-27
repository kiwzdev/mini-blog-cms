// app/api/auth/reset-password/route.ts
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import prisma from "@/lib/db";

// Input validation interface
interface ResetPasswordRequest {
  token: string;
  password: string;
}

// Password validation function
const validatePassword = (
  password: string
): { isValid: boolean; message?: string } => {
  if (!password || typeof password !== "string") {
    return { isValid: false, message: "Password is required" };
  }

  if (password.length < 6) {
    return {
      isValid: false,
      message: "Password must be at least 6 characters long",
    };
  }

  if (password.length > 100) {
    return { isValid: false, message: "Password is too long" };
  }

  // Optional: Add more password strength requirements
  // const hasUpperCase = /[A-Z]/.test(password);
  // const hasLowerCase = /[a-z]/.test(password);
  // const hasNumbers = /\d/.test(password);
  // const hasNonalphas = /\W/.test(password);

  return { isValid: true };
};

export async function POST(req: NextRequest): Promise<Response> {
  try {
    // Parse and validate request body
    const body = await req.json();
    const { token, password }: ResetPasswordRequest = body;

    // Input validation
    if (!token || typeof token !== "string") {
      return createErrorResponse({
        code: "INVALID_INPUT",
        message: "Valid reset token is required",
        status: 400,
      });
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return createErrorResponse({
        code: "INVALID_PASSWORD",
        message: passwordValidation.message || "Invalid password",
        status: 400,
      });
    }

    // Clean up expired tokens first
    await prisma.passwordResetToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });

    // Find valid, unused reset tokens with user data
    const resetTokens = await prisma.passwordResetToken.findMany({
      where: {
        used: false,
        expiresAt: { gt: new Date() },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            password: true, // Need current password to check if it's different
          },
        },
      },
    });

    // Early return if no valid tokens exist
    if (resetTokens.length === 0) {
      return createErrorResponse({
        code: "INVALID_OR_EXPIRED_TOKEN",
        message: "Reset token is invalid or has expired",
        status: 400,
      });
    }

    let validTokenRecord = null;
    let targetUser = null;

    // Find matching token (constant time approach would be better for production)
    for (const resetTokenDoc of resetTokens) {
      try {
        const isValid = await bcrypt.compare(token, resetTokenDoc.token);
        if (isValid) {
          validTokenRecord = resetTokenDoc;
          targetUser = resetTokenDoc.user;
          break;
        }
      } catch (compareError) {
        // Continue to next token if comparison fails
        console.error("Token comparison error:", compareError);
        continue;
      }
    }

    if (!validTokenRecord || !targetUser || !targetUser.password) {
      return createErrorResponse({
        code: "INVALID_TOKEN",
        message: "Reset token is invalid or has expired",
        status: 400,
      });
    }

    // Check if new password is different from current password
    const isSamePassword = await bcrypt.compare(password, targetUser.password);
    if (isSamePassword) {
      return createErrorResponse({
        code: "SAME_PASSWORD",
        message: "New password must be different from your current password",
        status: 400,
      });
    }

    // Hash the new password with higher salt rounds
    const hashedPassword = await bcrypt.hash(password, 12);

    // Use transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      // Update user's password
      await tx.user.update({
        where: { id: targetUser.id },
        data: {
          password: hashedPassword,
          // Optional: Update updatedAt timestamp if you have one
          // updatedAt: new Date(),
        },
      });

      // Delete all reset tokens for this user (cleanup)
      await tx.passwordResetToken.deleteMany({
        where: { userId: targetUser.id },
      });
    });

    // Log successful password reset (without sensitive data)
    console.log(`Password reset successful for user: ${targetUser.email}`);

    return createSuccessResponse({
      message:
        "Password has been reset successfully. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Password reset error:", error);

    // Don't expose internal errors to client
    return createErrorResponse({
      code: "INTERNAL_ERROR",
      message: "Something went wrong. Please try again later.",
      status: 500,
    });
  } finally {
    await prisma.$disconnect();
  }
}

// Optional: You might want to add a GET endpoint to validate token before showing reset form
export async function GET(req: NextRequest): Promise<Response> {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return createErrorResponse({
        code: "MISSING_TOKEN",
        message: "Reset token is required",
        status: 400,
      });
    }

    // Clean up expired tokens
    await prisma.passwordResetToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });

    // Check if token exists and is valid (without exposing user data)
    const resetTokens = await prisma.passwordResetToken.findMany({
      where: {
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    let isValidToken = false;
    for (const resetTokenDoc of resetTokens) {
      const isValid = await bcrypt.compare(token, resetTokenDoc.token);
      if (isValid) {
        isValidToken = true;
        break;
      }
    }

    if (!isValidToken) {
      return createErrorResponse({
        code: "INVALID_TOKEN",
        message: "Reset token is invalid or has expired",
        status: 400,
      });
    }

    return createSuccessResponse({
      message: "Token is valid",
      data: { valid: true },
    });
  } catch (error) {
    console.error("Token validation error:", error);
    return createErrorResponse({
      code: "INTERNAL_ERROR",
      message: "Something went wrong",
      status: 500,
    });
  } finally {
    await prisma.$disconnect();
  }
}
