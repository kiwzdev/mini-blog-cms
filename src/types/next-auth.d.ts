import { DefaultSession, DefaultUser } from "next-auth";

// ขยาย (augment) type ของ next-auth module เพื่อเพิ่มฟิลด์ `id` และ `username`
// ใน session.user และ user object ของระบบ NextAuth
declare module "next-auth" {
  interface Session {
    user: {
      // เพิ่มฟิลด์ id และ username ให้กับ session.user
      id: string;
      email: string;
      username: string;
      image?: string;
      role: string;
      emailVerified?: Date;
    } & DefaultSession["user"]; // รวมกับฟิลด์ default ของ session.user เช่น email, name, image
  }

  interface User extends DefaultUser {
    // เพิ่มฟิลด์ id และ username ให้กับ User type ที่ใช้ภายในระบบ NextAuth
    id: string;
    email: string;
    username: string;
    image?: string;
    role: string;
    emailVerified?: Date;
  }
}

// ขยาย type ของ JWT token ที่ NextAuth ใช้ในการจัดการ session แบบ JWT
declare module "next-auth/jwt" {
  interface JWT {
    // เพิ่มฟิลด์ id และ username ใน JWT payload
    id: string;
    email: string;
    username: string;
    image?: string;
    role: string;
    emailVerified?: Date;
  }
}
// การ augment module แบบนี้ช่วยให้ TypeScript รู้จักฟิลด์พิเศษที่เราเพิ่มเอง (เช่น username และ id) ในระบบ NextAuth
// ช่วยลด error และเพิ่มความปลอดภัยของโค้ดในระยะยาว
// ทำให้การเข้าถึงข้อมูลผู้ใช้ใน session, jwt, user เป็นไปอย่างถูกต้องและมี IntelliSense รองรับใน editor
