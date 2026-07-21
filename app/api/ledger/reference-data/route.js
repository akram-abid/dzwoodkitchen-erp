// app/api/ledger/reference-data/route.js

//

// Returns the static-ish lookup data the LedgerClient needs to render

// the entry modal: workers, suppliers, material catalog, other

// expense categories. All from real schema tables — no fabricated data.

import { NextResponse } from "next/server";

import { prisma } from "../../../../lib/prisma";

export async function GET() {
  try {
    const [
      workers,
      suppliers,
      materialCategories,
      materialCatalog,
      otherCategories,
    ] = await Promise.all([
      prisma.workers.findMany({
        select: { id: true, full_name: true },

        orderBy: { full_name: "asc" },
      }),

      prisma.suppliers.findMany({
        select: { id: true, name: true },

        where: { status: "ACTIVE" },

        orderBy: { name: "asc" },
      }),

      prisma.material_categories.findMany({
        select: { id: true, name: true },

        orderBy: { name: "asc" },
      }),

      prisma.material_catalog.findMany({
        select: {
          id: true,

          name: true,

          category_id: true,

          default_unit: true,
        },

        orderBy: { name: "asc" },
      }),

      prisma.other_expense_categories.findMany({
        select: { id: true, name: true },

        orderBy: { name: "asc" },
      }),
    ]);

    return NextResponse.json({
      workers,

      suppliers,

      materialCategories,

      materialCatalog,

      otherCategories,
    });
  } catch (err) {
    console.error("[ledger/reference-data GET]", err);

    return NextResponse.json(
      { error: err.message || "Internal error" },

      { status: 500 },
    );
  }
}
