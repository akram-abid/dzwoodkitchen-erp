import { NextResponse } from "next/server";
import { updateAllWorkersSold } from "../../../services/workersServices";

export async function POST() {
    try {
        const result = await updateAllWorkersSold();
        return NextResponse.json({ success: true, ...result });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to update sold" },
            { status: 500 }
        );
    }
}