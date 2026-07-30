import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import { deleteRole } from "@/app/services/roleService";

export const DELETE = withAuth("admin", async (_req, { params }) => {
  const { id } = await params;
  return NextResponse.json(await deleteRole(Number(id)));
});
