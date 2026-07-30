import { NextResponse } from "next/server";
import { login } from "@/app/services/userAuthService";

export async function POST(req) {
  try {
    return NextResponse.json(await login(await req.json()));
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}
