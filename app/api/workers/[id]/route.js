import { NextResponse } from "next/server";
import { getWorkerById } from "../../../services/workersServices";


// GET /api/workers/id get worker by id
export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const worker = await getWorkerById(id);

        if (!worker) {
            return NextResponse.json(
                { error: "Worker not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ data: worker });
    } catch (error) {
        console.error("Error fetching worker:", error);
        return NextResponse.json(
            { error: "Failed to fetch worker" },
            { status: 500 }
        );
    }
}