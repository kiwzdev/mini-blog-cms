import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import handleAPIError from "@/helpers/errorHandling";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, email, password } = body;

    if (!username || !email || !password) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const normalizedEmail = email.toLowerCase();

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingEmail) {
      return NextResponse.json(
        { message: "Email already exists" },
        { status: 409 }
      );
    }

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUsername) {
      return NextResponse.json(
        { message: "Username already exists" },
        { status: 409 }
      );
    }

    // Create new user
    await prisma.user.create({
      data: {
        username,
        email: normalizedEmail,
        password: hashedPassword,
      }
    });

    return NextResponse.json({ message: "User created" }, { status: 201 });
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