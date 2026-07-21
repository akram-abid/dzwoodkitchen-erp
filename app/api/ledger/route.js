// app/api/ledger/route.js
//
// Collection endpoint — list entries (GET) and create a new one (POST).
// Delegates all table-routing logic to ledgerService.

import { NextResponse } from "next/server";
import { getEntries, createEntry } from "../../services/ledgerService";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const result = await getEntries({
      page: searchParams.get("page") ?? undefined,
      pageSize: searchParams.get("pageSize") ?? undefined,
      type: searchParams.get("type") ?? undefined,
      month: searchParams.get("month") ?? undefined,
      year: searchParams.get("year") ?? undefined,
      search: searchParams.get("search") ?? undefined,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("[ledger GET]", err);
    return NextResponse.json(
      { error: err.message || "Internal error" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const created = await createEntry(body);
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("[ledger POST]", err);
    const status = err.code === "P2003" ? 400 : 500;
    return NextResponse.json(
      { error: err.message || "Internal error", code: err.code },
      { status },
    );
  }
}