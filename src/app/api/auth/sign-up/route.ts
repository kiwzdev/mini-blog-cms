// app/api/auth/signup/route.ts
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import prisma from "@/lib/db";

// Input validation interface
interface SignUpRequest {
  username: string;
  name: string;
  email: string;
  password: string;
}

// Basic validation functions
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (
  password: string
): { isValid: boolean; message?: string } => {
  if (password.length < 8) {
    return {
      isValid: false,
      message: "Password must be at least 8 characters long",
    };
  }
  if (password.length > 128) {
    return { isValid: false, message: "Password is too long" };
  }
  return { isValid: true };
};

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    const { username, name, email, password }: SignUpRequest = body;

    // Log only in development
    if (process.env.NODE_ENV === "development") {
      console.log("Sign up attempt:", { username, email, name });
    }

    // Basic validation
    if (!username || !email || !name || !password) {
      return createErrorResponse({
        code: "MISSING_FIELDS",
        message: "All fields are required",
        status: 400,
      });
    }

    // Validate input types
    if (
      typeof username !== "string" ||
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return createErrorResponse({
        code: "INVALID_INPUT_TYPE",
        message: "All fields must be strings",
        status: 400,
      });
    }

    // Normalize data
    const normalizedEmail = email.toLowerCase().trim();
    const trimmedUsername = username.trim();
    const trimmedName = name.trim();

    // Validate email format
    if (!validateEmail(normalizedEmail)) {
      return createErrorResponse({
        code: "INVALID_EMAIL",
        message: "Please provide a valid email address",
        status: 400,
      });
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return createErrorResponse({
        code: "INVALID_PASSWORD",
        message: passwordValidation.message || "Invalid password",
        status: 400,
      });
    }

    // Validate username length
    if (trimmedUsername.length < 3 || trimmedUsername.length > 30) {
      return createErrorResponse({
        code: "INVALID_USERNAME",
        message: "Username must be between 3 and 30 characters",
        status: 400,
      });
    }

    // Validate name length
    if (trimmedName.length < 2 || trimmedName.length > 100) {
      return createErrorResponse({
        code: "INVALID_NAME",
        message: "Name must be between 2 and 100 characters",
        status: 400,
      });
    }

    // Check for existing users with single query (more efficient)
    const existingUsers = await prisma.user.findMany({
      where: {
        OR: [{ email: normalizedEmail }, { username: trimmedUsername }],
      },
      select: { email: true, username: true },
    });

    // Check for conflicts
    const emailExists = existingUsers.some(
      (user) => user.email === normalizedEmail
    );
    const usernameExists = existingUsers.some(
      (user) => user.username === trimmedUsername
    );

    if (emailExists) {
      return createErrorResponse({
        code: "EMAIL_EXISTS",
        message: "Email already exists",
        status: 409,
      });
    }

    if (usernameExists) {
      return createErrorResponse({
        code: "USERNAME_EXISTS",
        message: "Username already exists",
        status: 409,
      });
    }

    // Hash password with better security
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        username: trimmedUsername,
        name: trimmedName,
        email: normalizedEmail,
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    // Log successful registration
    console.log(`New user registered: ${newUser.email}`);

    return createSuccessResponse({
      message: "Sign up successful",
      data: {
        user: {
          id: newUser.id,
          username: newUser.username,
          name: newUser.name,
          email: newUser.email,
        },
      },
      status: 201,
    });
  } catch (error) {
    console.error("Sign up error:", error);

    // Handle specific database errors
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      if (error.message.includes("email")) {
        return createErrorResponse({
          code: "EMAIL_EXISTS",
          message: "Email already exists",
          status: 409,
        });
      }
      if (error.message.includes("username")) {
        return createErrorResponse({
          code: "USERNAME_EXISTS",
          message: "Username already exists",
          status: 409,
        });
      }
    }

    // Generic error response
    return createErrorResponse({
      code: "SIGNUP_ERROR",
      message: "Sign up failed. Please try again.",
      status: 500,
    });
  } finally {
    await prisma.$disconnect();
  }
}
