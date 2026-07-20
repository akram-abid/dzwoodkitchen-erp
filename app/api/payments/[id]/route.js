// app/api/payments/[id]/route.js
//
// PATCH / DELETE a single payment by its primary key.
// Wires up the updatePayment() and deletePayment() helpers that already
// exist in app/services/paymentServices.js.

import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { patchPaymentSchema } from "../../../../lib/validation/payment";
import {
  updatePayment,
  deletePayment,
} from "../../../../app/services/paymentService";

function parseId(idParam) {
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

export async function PATCH(req, { params }) {
  const { id: idParam } = await params;
  const paymentId = parseId(idParam);
  if (!paymentId) {
    return NextResponse.json(
      { error: "Invalid payment id" },
      { status: 400 },
    );
  }

  try {
    const body = await req.json();
    const data = patchPaymentSchema.parse(body);

    const updated = await updatePayment(paymentId, data);
    return NextResponse.json({ data: updated });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid payment data", details: err.errors },
        { status: 400 },
      );
    }
    if (err?.code === "P2025") {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 },
      );
    }
    console.error("[PATCH /api/payments/:id]", err);
    return NextResponse.json(
      { error: "Failed to update payment" },
      { status: 500 },
    );
  }
}

export async function DELETE(_req, { params }) {
  const { id: idParam } = await params;
  const paymentId = parseId(idParam);
  if (!paymentId) {
    return NextResponse.json(
      { error: "Invalid payment id" },
      { status: 400 },
    );
  }

  try {
    const result = await deletePayment(paymentId);
    return NextResponse.json({ data: result });
  } catch (err) {
    if (err?.code === "P2025") {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 },
      );
    }
    console.error("[DELETE /api/payments/:id]", err);
    return NextResponse.json(
      { error: "Failed to delete payment" },
      { status: 500 },
    );
  }
}
