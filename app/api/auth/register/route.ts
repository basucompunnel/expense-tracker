import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/src/models/User";
import { generateToken } from "@/src/utils/auth";
import { AuthResponse } from "@/src/types/auth";

export async function POST(req: NextRequest): Promise<NextResponse<AuthResponse>> {
  try {
    const { email, password, fullName } = await req.json();

    // Validation
    if (!email || !password || !fullName) {
      return NextResponse.json(
        {
          success: false,
          message: "Email, password, and full name are required",
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 6 characters",
        },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Email already in use",
        },
        { status: 409 }
      );
    }

    // Create new user
    const user = new User({ email, password, fullName });
    await user.save();

    // Generate JWT
    const token = generateToken(user._id.toString(), user.email);

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully",
        token,
        user: {
          _id: user._id.toString(),
          email: user.email,
          fullName: user.fullName,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
