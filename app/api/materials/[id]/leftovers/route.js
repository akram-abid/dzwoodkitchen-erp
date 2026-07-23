import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { addLeftover } from "../../../../services/materialServices";

export async function GET(_req, { params }) {
  try {
    const { id } = await params;
    const material = await prisma.material_catalog.findUnique({
      where: { code: id },
      include: { leftovers: { orderBy: { date: "desc" } } },
    });
    if (!material)
      return NextResponse.json(
        { error: "Material not found" },
        { status: 404 },
      );
    return NextResponse.json(
      material.leftovers.map((l) => ({
        id: `L-${l.id}`,
        dbId: l.id,
        description: l.description,
        dimensions: l.dimensions ?? "",
        qty: l.quantity,
        date: new Date(l.date).toISOString().slice(0, 10),
        source: l.source_order_id ? `#${l.source_order_id}` : "Manual",
      })),
    );
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to load leftovers" },
      { status: 500 },
    );
  }
}

export async function POST(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const created = await addLeftover(id, body);
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to add leftover" },
      { status: err.status || 500 },
    );
  }
}