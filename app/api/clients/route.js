import { NextResponse } from "next/server";
import { getAllClients } from "../../services/clientsServices";

// GET /api/clients
export async function GET() {
    try {
        const clients = await getAllClients();
        return NextResponse.json({ success: true, data: clients });
    } catch (error) {
        console.error("Error fetching clients:", error);
        return NextResponse.json(
            { error: "Failed to fetch clients" },
            { status: 500 }
        );
    }
}