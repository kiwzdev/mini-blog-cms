import { NextResponse } from "next/server";
import { sendVerificationEmail } from "@/lib/email/sendVerificationEmail";
import { v4 as uuidv4 } from "uuid";
import { PrismaClient } from "@prisma/client";
import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import prisma from "@/lib/db";

// Send Verification Email API
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    // ตรวจสอบว่ามี token ที่ยังใช้ได้อยู่หรือไม่
    const existingToken = await prisma.verificationEmailToken.findFirst({
      where: {
        email,
        expires: { gt: new Date() },
      },
    });

    if (existingToken) {
      // หากมี token ที่ยังใช้ได้ ให้ส่งอีเมลใหม่ด้วย token เดิม
      await sendVerificationEmail(email, existingToken.token);

      return createSuccessResponse({
        message: "Verification email sent successfully",
        data: {
          tokenExpiry: existingToken.expires,
        },
      });
    }

    // สร้าง token ใหม่
    const token = uuidv4();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 ชั่วโมง

    // ลบ token เก่าที่หมดอายุ
    await prisma.verificationEmailToken.deleteMany({
      where: {
        email,
        expires: { lt: new Date() },
      },
    });

    // สร้าง token ใหม่
    await prisma.verificationEmailToken.create({
      data: {
        email: email.toLowerCase(),
        token,
        expires,
      },
    });

    // ส่งอีเมล
    await sendVerificationEmail(email, token);

    return createSuccessResponse({
      message: "Verification email sent successfully",
      data: {
        tokenExpiry: expires,
      },
    });
  } catch (error) {
    console.error("Error sending verification email:", error);
    return createErrorResponse({
      code: "SEND_VERIFICATION_EMAIL_ERROR",
      message: "Error sending verification email",
    });
  } finally {
    await prisma.$disconnect();
  }
}
