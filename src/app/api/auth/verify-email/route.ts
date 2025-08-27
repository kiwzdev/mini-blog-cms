// app/api/auth/verify-email/route.ts
import { NextRequest } from "next/server";
import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import prisma from "@/lib/db";

// Input validation interface
interface VerifyEmailRequest {
  token: string;
}

export async function POST(req: NextRequest) : Promise<Response>{
  try {
    // Parse and validate request body
    const body = await req.json();
    const { token }: VerifyEmailRequest = body;

    // Input validation
    if (!token || typeof token !== "string") {
      return createErrorResponse({
        code: "INVALID_INPUT",
        message: "Valid verification token is required",
        status: 400,
      });
    }

    // Trim token to remove any whitespace
    const trimmedToken = token.trim();

    if (trimmedToken.length === 0) {
      return createErrorResponse({
        code: "EMPTY_TOKEN",
        message: "Verification token cannot be empty",
        status: 400,
      });
    }

    // Clean up expired tokens first (optimization)
    await prisma.verificationEmailToken.deleteMany({
      where: { expires: { lt: new Date() } },
    });

    // Find verification token
    const tokenDoc = await prisma.verificationEmailToken.findUnique({
      where: { token: trimmedToken },
      select: {
        id: true,
        email: true,
        expires: true,
        token: true,
      },
    });

    if (!tokenDoc) {
      return createErrorResponse({
        code: "INVALID_TOKEN",
        message: "Verification token is invalid or has expired",
        status: 400,
      });
    }

    // Check if token has expired
    if (tokenDoc.expires < new Date()) {
      // Delete expired token
      await prisma.verificationEmailToken.delete({
        where: { id: tokenDoc.id },
      });

      return createErrorResponse({
        code: "TOKEN_EXPIRED",
        message:
          "Verification token has expired. Please request a new verification email.",
        status: 400,
      });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: tokenDoc.email },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        username: true,
        name: true,
      },
    });

    if (!user) {
      // Clean up orphaned token
      await prisma.verificationEmailToken.delete({
        where: { id: tokenDoc.id },
      });

      return createErrorResponse({
        code: "USER_NOT_FOUND",
        message: "User account not found",
        status: 400,
      });
    }

    // Check if email is already verified
    if (user.emailVerified) {
      // Clean up token since email is already verified
      await prisma.verificationEmailToken.delete({
        where: { id: tokenDoc.id },
      });

      return createErrorResponse({
        code: "EMAIL_ALREADY_VERIFIED",
        message: "Email address is already verified",
        status: 400,
      });
    }

    // Use transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      // Update user's email verification status
      await tx.user.update({
        where: { id: user.id },
        data: {
          emailVerified: new Date(),
          // Optional: update other fields if needed
          // updatedAt: new Date(),
        },
      });

      // Delete the used verification token
      await tx.verificationEmailToken.delete({
        where: { id: tokenDoc.id },
      });

      // Optional: Delete all other verification tokens for this email (cleanup)
      await tx.verificationEmailToken.deleteMany({
        where: { email: tokenDoc.email },
      });
    });

    // Log successful verification (without sensitive data)
    console.log(`Email verified successfully for user: ${user.email}`);

    return createSuccessResponse({
      message:
        "Email verified successfully! You can now log in to your account.",
      data: {
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          emailVerified: true,
        },
      },
    });
  } catch (error) {
    console.error("Email verification error:", error);

    // Handle specific database errors
    if (error instanceof Error) {
      if (
        error.message.includes("database") ||
        error.message.includes("connection")
      ) {
        return createErrorResponse({
          code: "DATABASE_ERROR",
          message: "Database connection error. Please try again later.",
          status: 503,
        });
      }

      if (error.message.includes("transaction")) {
        return createErrorResponse({
          code: "TRANSACTION_ERROR",
          message: "Failed to complete verification. Please try again.",
          status: 500,
        });
      }
    }

    // Generic error response
    return createErrorResponse({
      code: "VERIFICATION_ERROR",
      message: "Something went wrong during verification. Please try again.",
      status: 500,
    });
  } finally {
    await prisma.$disconnect();
  }
}

// Optional: Add GET endpoint to check token validity before verification
export async function GET(req: NextRequest): Promise<Response> {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return createErrorResponse({
        code: "MISSING_TOKEN",
        message: "Verification token is required",
        status: 400,
      });
    }

    // Clean up expired tokens
    await prisma.verificationEmailToken.deleteMany({
      where: { expires: { lt: new Date() } },
    });

    // Check if token exists and is valid
    const tokenDoc = await prisma.verificationEmailToken.findUnique({
      where: { token: token.trim() },
      select: {
        email: true,
        expires: true,
      },
    });

    if (!tokenDoc) {
      return createErrorResponse({
        code: "INVALID_TOKEN",
        message: "Verification token is invalid or has expired",
        status: 400,
      });
    }

    if (tokenDoc.expires < new Date()) {
      return createErrorResponse({
        code: "TOKEN_EXPIRED",
        message: "Verification token has expired",
        status: 400,
      });
    }

    // Check if user exists and email verification status
    const user = await prisma.user.findUnique({
      where: { email: tokenDoc.email },
      select: { emailVerified: true },
    });

    if (!user) {
      return createErrorResponse({
        code: "USER_NOT_FOUND",
        message: "User not found",
        status: 404,
      });
    }

    if (user.emailVerified) {
      return createErrorResponse({
        code: "EMAIL_ALREADY_VERIFIED",
        message: "Email is already verified",
        status: 400,
      });
    }

    return createSuccessResponse({
      message: "Token is valid and ready for verification",
      data: {
        valid: true,
        email: tokenDoc.email,
        expiresAt: tokenDoc.expires,
      },
    });
  } catch (error) {
    console.error("Token validation error:", error);
    return createErrorResponse({
      code: "VALIDATION_ERROR",
      message: "Failed to validate token",
      status: 500,
    });
  } finally {
    await prisma.$disconnect();
  }
}
