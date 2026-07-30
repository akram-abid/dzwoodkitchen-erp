import { NextResponse } from "next/server";
import { updateUser, deleteUser } from "@/app/services/userService";
import { withAuth } from "@/lib/auth";

export const PATCH = withAuth("admin", async (req, { params }) => {
  const { id } = await params;
  const patch = await req.json();
  const user = await updateUser(Number(id), patch);
  return NextResponse.json(user);
});

export const DELETE = withAuth("admin", async (req, { params }) => {
  const { id } = await params;
  const result = await deleteUser(Number(id));
  return NextResponse.json(result);
});
