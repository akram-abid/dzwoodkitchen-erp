import { NextResponse } from "next/server";
import { updateAllWorkersSold } from "../../services/workersServices";

// GET /api/cron/
export async function GET() {
    try {
        const result = await updateAllWorkersSold();
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            { error: "Cron job failed" },
            { status: 500 }
        );
    }
}