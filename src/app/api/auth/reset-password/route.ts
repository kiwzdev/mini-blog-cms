// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import handleAPIError from "@/helpers/errorHandling";

const prisma = new PrismaClient();

// Password Reset Confirm API
export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Find all reset tokens that are not used and not expired
    const resetTokens = await prisma.passwordResetToken.findMany({
      where: {
        used: false,
        expiresAt: { gt: new Date() }
      },
      include: { user: true }
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

    if (!validToken || !user) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user's password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    // Mark token as used
    await prisma.passwordResetToken.update({
      where: { id: validToken.id },
      data: { used: true }
    });

    // Delete all reset tokens for this user
    await prisma.passwordResetToken.deleteMany({ 
      where: { userId: user.id }
    });

    return NextResponse.json(
      { message: "Password reset successful" },
      { status: 200 }
    );
  } catch (error) {
    const { message, status, code } = handleAPIError(error);
    return NextResponse.json(
      { success: false, error: message, code },
      { status }
    );
  } finally {
    await prisma.$disconnect();
  }
}