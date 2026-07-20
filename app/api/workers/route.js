import { NextResponse } from "next/server";
import { getAllWorkers } from "../../services/workersServices";

// GET  /api/workers
export async function GET() {
    try {
        const workers = await getAllWorkers();
        return NextResponse.json({ success: true, data: workers });
    } catch (error) {
        console.error("Error fetching workers:", error);
        return NextResponse.json(
            { error: "Failed to fetch workers" },
            { status: 500 }
        );
    }
}