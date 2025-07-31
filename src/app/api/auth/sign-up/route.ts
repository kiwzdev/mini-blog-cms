import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, name, email, password } = body;

    if (!username || !email || name || !password) {
      return createErrorResponse({
        code: "MISSING_FIELDS",
        message: "Missing required fields",
        status: 400,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const normalizedEmail = email.toLowerCase();

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingEmail) {
      return createErrorResponse({
        code: "EMAIL_EXISTS",
        message: "Email already exists",
        status: 409,
      });
    }

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUsername) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "USERNAME_EXISTS",
            message: "Username already exists",
          },
        },
        { status: 409 }
      );
    }

    // Create new user
    await prisma.user.create({
      data: {
        username,
        name,
        email: normalizedEmail,
        password: hashedPassword,
      },
    });

    return createSuccessResponse({
      message: "Sign up successful",
      status: 201,
    });
  } catch (error) {
    console.error("Sign up failed:", error);
    return createErrorResponse({
      code: "SIGNUP_ERROR",
      message: "Sign up failed",
    });
  } finally {
    await prisma.$disconnect();
  }
}
