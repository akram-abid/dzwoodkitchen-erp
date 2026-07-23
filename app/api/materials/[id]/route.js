import { NextResponse } from "next/server";
import {
  getMaterialByCode,
  updateMaterial,
  deleteMaterial,
} from "../../../services/materialServices";

export async function GET(_req, { params }) {
  try {
    const { id } = await params;
    const m = await getMaterialByCode(id);
    if (!m)
      return NextResponse.json(
        { error: "Material not found" },
        { status: 404 },
      );
    return NextResponse.json(m);
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to load material" },
      { status: err.status || 500 },
    );
  }
}

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const patch = await req.json();
    const updated = await updateMaterial(id, patch);
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to update material" },
      { status: err.status || 500 },
    );
  }
}

export async function DELETE(_req, { params }) {
  try {
    const { id } = await params;
    const result = await deleteMaterial(id);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to delete material" },
      { status: err.status || 500 },
    );
  }
}
