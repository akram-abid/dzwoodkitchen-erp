import { NextResponse } from "next/server";

import { getSupplierPurchases } from "../../../../services/supplierService";

/* In Next.js 15, `params` is a Promise that must be awaited.

   In Next.js 14, `params` is a plain object — `await` on a non-thenable

   just returns the value, so this works on both versions. */

async function resolveId(params) {
  const resolved =
    params && typeof params.then === "function" ? await params : params;

  return resolved?.id;
}

export async function GET(request, { params }) {
  try {
    const id = await resolveId(params);

    const { searchParams } = new URL(request.url);

    const year = searchParams.get("year");

    const month = searchParams.get("month");

    const data = await getSupplierPurchases(id, {
      year: year ?? undefined,

      month: month ?? undefined,
    });

    return NextResponse.json(data);
  } catch (err) {
    if (err.status) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }

    console.error("GET /api/suppliers/:id/purchases failed:", err);

    return NextResponse.json(
      { error: "Failed to load supplier purchases" },

      { status: 500 },
    );
  }
}
