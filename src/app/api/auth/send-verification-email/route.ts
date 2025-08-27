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

// Validation functions
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateUsername = (
  username: string
): { isValid: boolean; message?: string } => {
  if (!username || typeof username !== "string") {
    return { isValid: false, message: "Username is required" };
  }

  if (username.length < 3) {
    return {
      isValid: false,
      message: "Username must be at least 3 characters long",
    };
  }

  if (username.length > 30) {
    return {
      isValid: false,
      message: "Username must be less than 30 characters",
    };
  }

  // Allow only alphanumeric characters, underscores, and hyphens
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  if (!usernameRegex.test(username)) {
    return {
      isValid: false,
      message:
        "Username can only contain letters, numbers, underscores, and hyphens",
    };
  }

  return { isValid: true };
};

const validateName = (name: string): { isValid: boolean; message?: string } => {
  if (!name || typeof name !== "string") {
    return { isValid: false, message: "Name is required" };
  }

  const trimmedName = name.trim();
  if (trimmedName.length < 2) {
    return {
      isValid: false,
      message: "Name must be at least 2 characters long",
    };
  }

  if (trimmedName.length > 100) {
    return { isValid: false, message: "Name must be less than 100 characters" };
  }

  return { isValid: true };
};

const validatePassword = (
  password: string
): { isValid: boolean; message?: string } => {
  if (!password || typeof password !== "string") {
    return { isValid: false, message: "Password is required" };
  }

  if (password.length < 8) {
    return {
      isValid: false,
      message: "Password must be at least 8 characters long",
    };
  }

  if (password.length > 128) {
    return { isValid: false, message: "Password is too long" };
  }

  // Optional: Add password strength requirements
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);

  if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
    return {
      isValid: false,
      message:
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    };
  }

  return { isValid: true };
};

export async function POST(req: NextRequest) : Promise<Response>{
  try {
    // Parse and validate request body
    const body = await req.json();
    const { username, name, email, password }: SignUpRequest = body;

    // Remove console.log for production security
    if (process.env.NODE_ENV === "development") {
      console.log("Sign up attempt for:", { username, email, name });
    }

    // Input validation
    if (!username || !name || !email || !password) {
      return createErrorResponse({
        code: "MISSING_FIELDS",
        message: "All fields are required: username, name, email, password",
        status: 400,
      });
    }

    // Validate each field
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.isValid) {
      return createErrorResponse({
        code: "INVALID_USERNAME",
        message: usernameValidation.message || "Invalid username",
        status: 400,
      });
    }

    const nameValidation = validateName(name);
    if (!nameValidation.isValid) {
      return createErrorResponse({
        code: "INVALID_NAME",
        message: nameValidation.message || "Invalid name",
        status: 400,
      });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    if (!validateEmail(normalizedEmail)) {
      return createErrorResponse({
        code: "INVALID_EMAIL",
        message: "Please provide a valid email address",
        status: 400,
      });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return createErrorResponse({
        code: "INVALID_PASSWORD",
        message: passwordValidation.message || "Invalid password",
        status: 400,
      });
    }

    // Normalize username (lowercase for consistency)
    const normalizedUsername = username.toLowerCase().trim();

    // Check for existing email and username in a single query for better performance
    const existingUsers = await prisma.user.findMany({
      where: {
        OR: [{ email: normalizedEmail }, { username: normalizedUsername }],
      },
      select: { email: true, username: true },
    });

    // Check for conflicts
    const emailExists = existingUsers.some(
      (user) => user.email === normalizedEmail
    );
    const usernameExists = existingUsers.some(
      (user) => user.username === normalizedUsername
    );

    if (emailExists && usernameExists) {
      return createErrorResponse({
        code: "USER_EXISTS",
        message: "Both email and username are already taken",
        status: 409,
      });
    }

    if (emailExists) {
      return createErrorResponse({
        code: "EMAIL_EXISTS",
        message: "An account with this email already exists",
        status: 409,
      });
    }

    if (usernameExists) {
      return createErrorResponse({
        code: "USERNAME_EXISTS",
        message: "This username is already taken",
        status: 409,
      });
    }

    // Hash password with higher salt rounds for better security
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user with normalized data
    const newUser = await prisma.user.create({
      data: {
        username: normalizedUsername,
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        // Optional: Add default values if needed
        // emailVerified: null, // Will be set when email is verified
        // createdAt: new Date(), // Usually handled by Prisma defaults
        // updatedAt: new Date(),
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    // Log successful registration (without sensitive data)
    console.log(`New user registered: ${newUser.email} (${newUser.username})`);

    return createSuccessResponse({
      message:
        "Account created successfully. Please verify your email to complete registration.",
      data: {
        user: {
          id: newUser.id,
          username: newUser.username,
          name: newUser.name,
          email: newUser.email,
          emailVerified: newUser.emailVerified,
        },
      },
      status: 201,
    });
  } catch (error) {
    console.error("Sign up error:", error);

    // Handle specific database errors
    if (error instanceof Error) {
      // Handle unique constraint violations (fallback)
      if (error.message.includes("Unique constraint")) {
        if (error.message.includes("email")) {
          return createErrorResponse({
            code: "EMAIL_EXISTS",
            message: "An account with this email already exists",
            status: 409,
          });
        }
        if (error.message.includes("username")) {
          return createErrorResponse({
            code: "USERNAME_EXISTS",
            message: "This username is already taken",
            status: 409,
          });
        }
      }

      // Handle other database errors
      if (
        error.message.includes("database") ||
        error.message.includes("connection")
      ) {
        return createErrorResponse({
          code: "DATABASE_ERROR",
          message: "Database connection error. Please try again later.",
          status: 500,
        });
      }
    }

    // Generic error response
    return createErrorResponse({
      code: "SIGNUP_ERROR",
      message: "Something went wrong during registration. Please try again.",
      status: 500,
    });
  } finally {
    await prisma.$disconnect();
  }
}

// Optional: Add GET endpoint to check username/email availability
export async function GET(req: NextRequest): Promise<Response> {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");
    const email = searchParams.get("email");

    if (!username && !email) {
      return createErrorResponse({
        code: "MISSING_PARAMETER",
        message: "Either username or email parameter is required",
        status: 400,
      });
    }

    const checks: { [key: string]: { available: boolean; error?: string; valid?: boolean } } = {};

    if (username) {
      const normalizedUsername = username.toLowerCase().trim();
      const usernameValidation = validateUsername(normalizedUsername);

      if (!usernameValidation.isValid) {
        checks.username = {
          available: false,
          error: usernameValidation.message,
        };
      } else {
        const existingUsername = await prisma.user.findUnique({
          where: { username: normalizedUsername },
          select: { id: true },
        });

        checks.username = {
          available: !existingUsername,
          valid: true,
        };
      }
    }

    if (email) {
      const normalizedEmail = email.toLowerCase().trim();

      if (!validateEmail(normalizedEmail)) {
        checks.email = {
          available: false,
          error: "Invalid email format",
        };
      } else {
        const existingEmail = await prisma.user.findUnique({
          where: { email: normalizedEmail },
          select: { id: true },
        });

        checks.email = {
          available: !existingEmail,
          valid: true,
        };
      }
    }

    return createSuccessResponse({
      message: "Availability check completed",
      data: checks,
    });
  } catch (error) {
    console.error("Availability check error:", error);
    return createErrorResponse(
      {
        code: "INTERNAL_ERROR",
        message: "Failed to check availability",
        status: 500,
      },
    );
  } finally {
    await prisma.$disconnect();
  }
}
