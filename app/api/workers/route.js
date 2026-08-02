import { NextResponse } from "next/server";
import { createWorker, getAllWorkers } from "../../services/workersServices";

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

// POST /api/workers
export async function POST(request) {
    try {
        const body = await request.json();

        const worker = await createWorker(body)
        return NextResponse.json({ data: worker });
    } catch (error) {
        console.error("Failed to create worker:", error);
        return NextResponse.json(
            { error: error.message || "Failed to create worker" },
            { status: 500 }
        );
    }
}


