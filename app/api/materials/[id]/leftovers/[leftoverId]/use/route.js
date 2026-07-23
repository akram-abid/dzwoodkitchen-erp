import { NextResponse } from "next/server";
import { useLeftover } from "../../../../../services/materialServices";

export async function POST(_req, { params }) {
  try {
    const { id, leftoverId } = await params;
    const dbId = parseInt(leftoverId, 10);
    if (Number.isNaN(dbId))
      return NextResponse.json(
        { error: "Invalid leftover id" },
        { status: 400 },
      );
    const result = await useLeftover(id, dbId);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to use leftover" },
      { status: err.status || 500 },
    );
  }
}
