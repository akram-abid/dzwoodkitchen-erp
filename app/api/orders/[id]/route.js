// app/api/payments/[paymentId]/route.js

//

// PATCH  /api/payments/[id]   — update a single payment (amount, date, note)

// DELETE /api/payments/[id]   — remove a single payment

//

// The route is keyed on the payment's own primary key (not the order),

// because the UI only knows the payment id once it has been created.


import { NextResponse } from "next/server";

import { patchPaymentSchema } from "../../../../../lib/validation/payment";

import {

  updatePayment,

  deletePayment,

} from "../../../../../app/services/paymentServices";


// PATCH /api/payments/[paymentId]

export async function PATCH(req, { params }) {

  try {

    const { paymentId } = await params;


    const body = await req.json();

    const data = patchPaymentSchema.parse(body);


    const updated = await updatePayment(paymentId, data);


    return NextResponse.json({ success: true, data: updated });

  } catch (err) {

    if (err.name === "ZodError") {

      return NextResponse.json(

        { error: "Invalid payment data", details: err.errors ?? err.issues },

        { status: 400 },

      );

    }

    if (err.code === "P2025") {

      return NextResponse.json(

        { error: "Payment not found" },

        { status: 404 },

      );

    }

    console.error("[PATCH /api/payments/:id] failed:", err);

    return NextResponse.json(

      { error: "Failed to update payment", details: err.message },

      { status: 500 },

    );

  }

}


// DELETE /api/payments/[paymentId]

export async function DELETE(req, { params }) {

  try {

    const { paymentId } = await params;


    await deletePayment(paymentId);


    return NextResponse.json({ success: true });

  } catch (err) {

    if (err.code === "P2025") {

      return NextResponse.json(

        { error: "Payment not found" },

        { status: 404 },

      );

    }

    console.error("[DELETE /api/payments/:id] failed:", err);

    return NextResponse.json(

      { error: "Failed to delete payment", details: err.message },

      { status: 500 },

    );

  }

}

