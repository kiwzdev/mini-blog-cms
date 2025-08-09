import { createErrorResponse } from "@/lib/api-response";
import prisma from "@/lib/db";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

// Verify Email API
export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return createErrorResponse({
        code: "NO_TOKEN",
        message: "No token provided",
        status: 400,
      });
    }

    const tokenDoc = await prisma.verificationEmailToken.findUnique({
      where: { token },
    });

    if (!tokenDoc) {
      return createErrorResponse({
        code: "INVALID_TOKEN",
        message: "Token is invalid",
        status: 400,
      });
    }

    if (tokenDoc.expires < new Date()) {
      // ลบ token ที่หมดอายุ
      await prisma.verificationEmailToken.delete({ where: { token } });
      return createErrorResponse({
        code: "VERIFICATION_TOKEN_EXPIRED",
        message: "Token is expired",
        status: 400,
      });
    }

    // ตรวจสอบว่าผู้ใช้มีอยู่จริง
    const user = await prisma.user.findUnique({
      where: { email: tokenDoc.email },
    });

    if (!user) {
      return createErrorResponse({
        code: "USER_NOT_FOUND",
        message: "User not found",
        status: 404,
      });
    }

    // ตรวจสอบว่าเคยยืนยันแล้วหรือไม่
    if (user.emailVerified) {
      await prisma.verificationEmailToken.delete({ where: { token } });
      return createErrorResponse({
        code: "EMAIL_ALREADY_VERIFIED",
        message: "Email already verified",
        status: 400,
      });
    }

    // อัปเดตสถานะการยืนยัน
    await prisma.user.update({
      where: { email: tokenDoc.email },
      data: { emailVerified: new Date() },
    });

    // ลบ token ที่ใช้แล้ว
    await prisma.verificationEmailToken.delete({ where: { token } });

    return NextResponse.json(
      {
        success: true,
        message: "Email verified successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error verifying email:", error);
    return createErrorResponse({
      code: "VERIFY_EMAIL_ERROR",
      message: "Failed to verify email",
    });
  } finally {
    await prisma.$disconnect();
  }
}
