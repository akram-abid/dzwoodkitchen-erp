import { NextResponse } from "next/server";
import { createTimeEntry } from "../../../../services/workersServices";

// POST /api/workers/id/time-entries create timeEntry
export async function POST(request, { params }) {
    const { id } = await params;
    const body = await request.json();

    try {
        const entry = await createTimeEntry(id, body);

        return NextResponse.json({ success: true, data: entry });
    } catch (err) {

        return NextResponse.json(
            { error: err },
            { status: 500 }
        );
    }

}

