import { NextResponse } from "next/server";
import { deletePayment } from "../../../../../services/workersServices";

// DELETE app/api/workers/[id]/payments/[paymentId]
export async function DELETE(request, { params }) {
    try {
        const { paymentId } = await params;

        await deletePayment(paymentId);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            { error: "Failed to delete payment" },
            { status: 500 }
        );
    }
}