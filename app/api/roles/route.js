import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import { createRole, listRoles } from "@/app/services/roleService";

export const GET = withAuth("admin", async () => NextResponse.json(await listRoles()));

export const POST = withAuth("admin", async (req) => {
  const { name } = await req.json();
  return NextResponse.json(await createRole(name), { status: 201 });
});
