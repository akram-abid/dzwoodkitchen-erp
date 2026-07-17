import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createPayment } from "../../../../services/workersServices";

// POST /api/workers/[id]/payments
export async function POST(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { date, amount, note } = body;

        const payment = await createPayment(id, { date, amount, note });

        return NextResponse.json({ success: true, data: payment });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            { error: "Failed to create payment" },
            { status: 500 }
        );
    }
}