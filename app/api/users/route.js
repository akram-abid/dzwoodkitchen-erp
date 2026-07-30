import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import { createUser, listUsers } from "@/app/services/userService";

export const GET = withAuth("admin", async () => NextResponse.json(await listUsers()));

export const POST = withAuth("admin", async (req) => {
  const body = await req.json();
  return NextResponse.json(await createUser(body), { status: 201 });
});
