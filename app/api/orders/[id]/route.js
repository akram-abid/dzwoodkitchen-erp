// app/api/orders/[id]/route.js

import { NextResponse } from "next/server";
import { updateOrderSchema, patchOrderSchema } from "../../../../lib/validation/order";
import { updateOrder, deleteOrder, patchOrder } from "../../../../app/services/ordersServices";

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

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;

    await deleteOrder(id);

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err.code === "P2025") {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    console.error("[DELETE /api/orders/:id] failed:", err);

    return NextResponse.json(
      { error: "Failed to delete order", details: err.message },

      { status: 500 },
    );
  }
}

// PATCH /api/orders/[id]  — partial update

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();
    console.log("🔍 PATCH body received:", JSON.stringify(body, null, 2));
    const data = patchOrderSchema.parse(body);
    console.log("✅ PATCH parsed OK");
    const updated = await patchOrder(id, data);
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("🔴 PATCH failed:", err.name, err.message, err.errors ?? err.issues ?? err);
    if (err.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid order data", details: err.errors ?? err.issues },
        { status: 400 },
      );
    }
    if (err.code === "P2025") {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    console.error("[PATCH /api/orders/:id] failed:", err);
    return NextResponse.json(
      { error: "Failed to update order", details: err.message },
      { status: 500 },
    );
  }
}
