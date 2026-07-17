import { NextResponse } from "next/server";
import { updateTimeEntry } from "@/app/services/workersServices";

// PUT /api/workers/id/time-entries/timeEntryId
export async function PUT(request, { params }) {
    try {
        const { id, timeEntryId } = await params;
        const body = await request.json();
        const { date, clockIn, clockOut, extraHours, extraNote } = body;

        const entry = await updateTimeEntry(timeEntryId, body)

        return NextResponse.json({ success: true, data: { ...entry, id: entry.id } });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            { error: "Failed to update time entry" },
            { status: 500 }
        );
    }
}