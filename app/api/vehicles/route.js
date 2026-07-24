import { getAllVehicles, createVehicle } from "../../services/vehiclesServices";

// GET  api/vehicles
export async function GET() {
    try {
        const vehicles = await getAllVehicles();
        return Response.json({ data: vehicles });
    } catch (error) {
        return Response.json({ error: "Failed to fetch vehicles" }, { status: 500 });
    }
}

// POST api/vehicles
export async function POST(request) {
    try {
        const body = await request.json();
        const vehicle = await createVehicle(body);
        return Response.json({ data: vehicle });
    } catch (error) {
        return Response.json({ error: "Failed to create vehicle" }, { status: 500 });
    }
}