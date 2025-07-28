import { NextResponse } from "next/server";
import { sendVerificationEmail } from "@/lib/email/sendVerificationEmail";
import { v4 as uuidv4 } from "uuid";
import { PrismaClient } from "@prisma/client";
import handleAPIError from "@/helpers/errorHandling";

const prisma = new PrismaClient();

// Send Verification Email API
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    // ตรวจสอบว่ามี token ที่ยังใช้ได้อยู่หรือไม่
    const existingToken = await prisma.verificationToken.findFirst({
      where: {
        email,
        expires: { gt: new Date() }
      }
    });

    if (existingToken) {
      // หากมี token ที่ยังใช้ได้ ให้ส่งอีเมลใหม่ด้วย token เดิม
      await sendVerificationEmail(email, existingToken.token);

      return NextResponse.json({
        success: true,
        message: "ส่งอีเมลยืนยันแล้ว กรุณาตรวจสอบกล่องจดหมายของคุณ",
        tokenExpiry: existingToken.expires,
      });
    }

    // สร้าง token ใหม่
    const token = uuidv4();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 ชั่วโมง

    // ลบ token เก่าที่หมดอายุ
    await prisma.verificationToken.deleteMany({
      where: {
        email,
        expires: { lt: new Date() }
      }
    });

    // สร้าง token ใหม่
    await prisma.verificationToken.create({
      data: {
        email: email.toLowerCase(),
        token,
        expires,
      }
    });

    // ส่งอีเมล
    await sendVerificationEmail(email, token);

    return NextResponse.json({
      success: true,
      message: "ส่งอีเมลยืนยันสำเร็จ กรุณาตรวจสอบกล่องจดหมายของคุณ",
      tokenExpiry: expires,
    });
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
