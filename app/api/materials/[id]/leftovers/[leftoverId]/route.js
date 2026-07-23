import { NextResponse } from "next/server";
import { deleteLeftover, updateLeftover } from "../../../../../services/materialServices";

export async function PATCH(req, { params }) {
  try {
    const { id, leftoverId } = await params;
    const dbId = parseInt(leftoverId, 10);
    if (Number.isNaN(dbId)) {
      return NextResponse.json(
        { error: "Invalid leftover id" },
        { status: 400 },
      );
    }
    const patch = await req.json();
    const updated = await updateLeftover(id, dbId, patch);
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to update leftover" },
      { status: err.status || 500 },
    );
  }
}

export async function DELETE(_req, { params }) {
  try {
    const { id, leftoverId } = await params;
    const dbId = parseInt(leftoverId, 10);
    if (Number.isNaN(dbId)) {
      return NextResponse.json(
        { error: "Invalid leftover id" },
        { status: 400 },
      );
    }
    const result = await deleteLeftover(id, dbId);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to delete leftover" },
      { status: err.status || 500 },
    );
  }
}

