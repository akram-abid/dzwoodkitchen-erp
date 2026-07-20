// app/api/orders/[id]/route.js

import { NextResponse } from "next/server";
import { updateOrderSchema } from "../../../../lib/validation/order";
import { updateOrder } from "../../../../app/services/ordersServices";

// PUT /api/orders/[id]
export async function PUT(req, { params }) {
  try {
    const { id } = await params; // ← unwrap the Promise

    const body = await req.json();

    const data = updateOrderSchema.parse(body);

    const updated = await updateOrder(id, data);

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    if (err.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid order data", details: err.errors },
        { status: 400 },
      );
    }
    if (err.code === "P2025") {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    console.error("[PUT /api/orders/:id] failed:", err);
    return NextResponse.json(
      { error: "Failed to update order", details: err.message },
      { status: 500 },
    );
  }
}
