import { NextResponse } from "next/server";

import {

  deleteMaterialPurchase,

  updateMaterialPurchase,

} from "../../../services/materialPurchaseService";


/* In Next.js 15, `params` is a Promise that must be awaited.

   In Next.js 14, `params` is a plain object — `await` on a non-thenable

   just returns the value, so this works on both versions. */

async function resolveId(params) {

  const resolved =

    params && typeof params.then === "function" ? await params : params;

  return resolved?.id;

}


export async function PATCH(request, { params }) {

  try {

    const id = await resolveId(params);

    const body = await request.json().catch(() => ({}));

    const updated = await updateMaterialPurchase(id, body);

    return NextResponse.json(updated);

  } catch (err) {

    if (err.status) {

      return NextResponse.json(

        { error: err.message, fields: err.fields },

        { status: err.status },

      );

    }

    console.error("PATCH /api/material_purchases/:id failed:", err);

    return NextResponse.json(

      { error: "Failed to update material purchase" },

      { status: 500 },

    );

  }

}


export async function DELETE(_req, { params }) {

  try {

    const id = await resolveId(params);

    const result = await deleteMaterialPurchase(id);

    return NextResponse.json(result);

  } catch (err) {

    if (err.status) {

      return NextResponse.json(

        { error: err.message, fields: err.fields },

        { status: err.status },

      );

    }

    console.error("DELETE /api/material_purchases/:id failed:", err);

    return NextResponse.json(

      { error: "Failed to delete material purchase" },

      { status: 500 },

    );

  }

}

