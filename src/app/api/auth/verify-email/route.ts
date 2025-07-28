import handleAPIError from "@/helpers/errorHandling";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// Verify Email API
export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Token ไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const tokenDoc = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!tokenDoc) {
      return NextResponse.json(
        { success: false, message: "Token ไม่ถูกต้องหรือไม่มีอยู่" },
        { status: 400 }
      );
    }

    if (tokenDoc.expires < new Date()) {
      // ลบ token ที่หมดอายุ
      await prisma.verificationToken.delete({ where: { token } });
      return NextResponse.json(
        { success: false, message: "Token หมดอายุแล้ว กรุณาขอ token ใหม่" },
        { status: 400 }
      );
    }

    // ตรวจสอบว่าผู้ใช้มีอยู่จริง
    const user = await prisma.user.findUnique({
      where: { email: tokenDoc.email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "ไม่พบผู้ใช้งาน" },
        { status: 404 }
      );
    }

    // ตรวจสอบว่าเคยยืนยันแล้วหรือไม่
    if (user.emailVerified) {
      await prisma.verificationToken.delete({ where: { token } });
      return NextResponse.json(
        { success: false, message: "อีเมลนี้ได้รับการยืนยันแล้ว" },
        { status: 400 }
      );
    }

    // อัปเดตสถานะการยืนยัน
    await prisma.user.update({
      where: { email: tokenDoc.email },
      data: { emailVerified: new Date() },
    });

    // ลบ token ที่ใช้แล้ว
    await prisma.verificationToken.delete({ where: { token } });

    return NextResponse.json({
      success: true,
      message: "ยืนยันอีเมลสำเร็จ!",
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
