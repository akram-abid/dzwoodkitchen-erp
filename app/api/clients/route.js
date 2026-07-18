import { NextResponse } from "next/server";
import { getAllClients, createClient } from "../../services/clientsServices";

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

// POST /api/clients
export async function POST(request) {
    try {
        const body = await request.json();
        const client = await createClient(body);
        return NextResponse.json({ success: true, data: client });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to create client" },
            { status: 500 }
        );
    }
}