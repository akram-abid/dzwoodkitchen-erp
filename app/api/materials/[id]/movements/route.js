import { NextResponse } from "next/server";
import prisma from "../../../services/prisma";

export async function GET(_req, { params }) {
  try {
    const { id } = await params;
    const material = await prisma.material_catalog.findUnique({
      where: { code: id },
      include: {
        stock_movements: {
          orderBy: { date: "desc" },
          take: 100,
          include: {
            order: { select: { id: true, project_name: true } },
            worker: { select: { full_name: true } },
          },
        },
      },
    });
    if (!material)
      return NextResponse.json(
        { error: "Material not found" },
        { status: 404 },
      );
    return NextResponse.json(
      material.stock_movements.map((mv) => ({
        id: mv.id,
        date: new Date(mv.date).toISOString().slice(0, 10),
        order: mv.order
          ? `#${mv.order.id}${mv.order.project_name ? ` · ${mv.order.project_name}` : ""}`
          : (mv.note ?? "Manual"),
        worker: mv.worker?.full_name ?? "—",
        qty: Number(mv.quantity),
        type: mv.type === "IN" ? "in" : "out",
        note: mv.note ?? null,
      })),
    );
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to load movements" },
      { status: 500 },
    );
  }
}
