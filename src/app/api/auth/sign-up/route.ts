import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/db/mongodb";
import bcrypt from "bcryptjs";
import User from "@/models/user";
import handleAPIError from "@/helpers/error";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, email, password } = body;

    if (!username || !email || !password) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await connectMongoDB();

    const normalizedEmail = email.toLowerCase();

    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return NextResponse.json(
        { message: "Email already exists" },
        { status: 409 }
      );
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      // Username already exists
      return NextResponse.json(
        { message: "Username already exists" },
        { status: 409 }
      );
    }

    await User.create({
      username,
      email,
      password: hashedPassword,
    });

    return NextResponse.json({ message: "User created" }, { status: 201 });
  } catch (error) {
    const { message, status, code } = handleAPIError(error);
    return NextResponse.json(
      { success: false, error: message, code },
      { status }
    );
  }
}
