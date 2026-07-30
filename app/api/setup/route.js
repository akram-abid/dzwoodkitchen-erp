import { NextResponse } from "next/server";
import { bootstrapAdmin } from "@/app/services/userAuthService";

export async function POST(req) {
  try {
    const body = await req.json();
    const admin = await bootstrapAdmin(body);
    return NextResponse.json({ id: admin.id, email: admin.email });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }
}
