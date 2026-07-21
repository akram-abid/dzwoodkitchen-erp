// app/api/ledger/[id]/route.js

//

// Single entry per (type, id) — read/update/delete one treasury row.

// Type is passed via the query string:  /api/ledger/42?type=WORKER_PAYMENT

// The service handles the actual table routing — this file is just a

// thin pass-through. No `TYPES` constant needed here.


import { NextResponse } from "next/server";

import {

  getEntryById,

  updateEntry,

  deleteEntry,

} from "../../../services/ledgerService";


export async function GET(request, { params }) {

  try {

    const { searchParams } = new URL(request.url);

    const type = searchParams.get("type");

    const row = await getEntryById(type, Number(params.id));

    if (!row) {

      return NextResponse.json({ error: "Not found" }, { status: 404 });

    }

    return NextResponse.json(row);

  } catch (err) {

    console.error("[ledger/[id] GET]", err);

    return NextResponse.json(

      { error: err.message || "Internal error" },

      { status: 500 },

    );

  }

}


export async function PUT(request, { params }) {

  try {

    const { searchParams } = new URL(request.url);

    const type = searchParams.get("type");

    const body = await request.json();

    const updated = await updateEntry(type, Number(params.id), body);

    return NextResponse.json(updated);

  } catch (err) {

    console.error("[ledger/[id] PUT]", err);

    const status = err.code === "P2003" ? 400 : 500;

    return NextResponse.json(

      { error: err.message || "Internal error", code: err.code },

      { status },

    );

  }

}


export async function DELETE(request, { params }) {

  try {

    const { searchParams } = new URL(request.url);

    const type = searchParams.get("type");

    await deleteEntry(type, Number(params.id));

    return NextResponse.json({ ok: true });

  } catch (err) {

    console.error("[ledger/[id] DELETE]", err);

    return NextResponse.json(

      { error: err.message || "Internal error" },

      { status: 500 },

    );

  }

}

