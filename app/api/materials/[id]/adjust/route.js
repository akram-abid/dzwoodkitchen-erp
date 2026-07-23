import { NextResponse } from "next/server";
import { adjustStock } from "../../../services/materialServices";

export async function POST(req, { params }) {
  try {
    const { id } = await params;
    const { type, quantity, note } = await req.json();
    const updated = await adjustStock(id, { type, quantity, note });
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to adjust stock" },
      { status: err.status || 500 },
    );
  }
}
