// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import prisma from "@/lib/db";

// Password Reset Confirm API
export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return createErrorResponse({
        code: "NO_TOKEN_OR_PASSWORD",
        message: "No token or password provided",
        status: 400,
      });
    }

    // Find all reset tokens that are not used and not expired
    const resetTokens = await prisma.passwordResetToken.findMany({
      where: {
        used: false,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    let validToken = null;
    let user = null;

    // Check each token to find the matching one
    for (const resetTokenDoc of resetTokens) {
      const isValid = await bcrypt.compare(token, resetTokenDoc.token);
      if (isValid) {
        validToken = resetTokenDoc;
        user = resetTokenDoc.user;
        break;
      }
    }

    if (!user) {
      return createErrorResponse({
        code: "USER_NOT_FOUND",
        message: "User not found",
        status: 400,
      });
    }

    if (!validToken) {
      return createErrorResponse({
        code: "INVALID_TOKEN",
        message: "Invalid reset token",
        status: 400,
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user's password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Mark token as used
    await prisma.passwordResetToken.update({
      where: { id: validToken.id },
      data: { used: true },
    });

    // Delete all reset tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    return createSuccessResponse({
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    return createErrorResponse({
      code: "RESET_PASSWORD_ERROR",
      message: "Error resetting password",
    });
  } finally {
    await prisma.$disconnect();
  }
}
