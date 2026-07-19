import { NextResponse } from "next/server";
import { updateClient } from "../../../services/clientsServices";

// PUT /api/clients/clientId
export async function PUT(request, { params }) {
    try {
        const { clientId } = await params;
        const body = await request.json();
        const client = await updateClient(Number(clientId), body);
        return NextResponse.json({ success: true, data: client });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to update client" },
            { status: 500 }
        );
    }
}