import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import { resetUserPassword } from "@/app/services/userService";

export const POST = withAuth("admin", async (req, { params }) => {
  const { id } = await params;
  const { password } = await req.json();

  if (!password || password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }

  const result = await resetUserPassword(Number(id), password);
  return NextResponse.json(result);
});
