import { NextResponse } from "next/server";
import { login } from "../../../services/workersServices";


export async function POST(request) {
  try {
    const { email, password } = await request.json();

    const { token, user } = await login({ email, password });

    return NextResponse.json({
      token,
      user,
    });
  } catch (error) {
    console.error("Worker login failed:", error);

    return NextResponse.json(
      {
        error: error.message || "Invalid credentials",
      },
      { status: 401 }
    );
  }
}
