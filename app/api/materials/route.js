import { NextResponse } from "next/server";
import { getAllMaterials, createMaterial } from "../../services/materialServices";

export async function GET() {
  try {
    const materials = await getAllMaterials();
    return NextResponse.json(materials);
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to load materials" },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const created = await createMaterial(body);
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to create material" },
      { status: err.status || 500 },
    );
  }
}
