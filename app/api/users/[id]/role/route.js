import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import { assignRole } from "@/app/services/userService";

export const PATCH = withAuth("admin", async (req, { params }) => {
  const { id } = await params;
  const { role_id } = await req.json();
  return NextResponse.json(await assignRole(Number(id), role_id));
});
