import { getAllVehicles } from "../../services/vehiclesServices";

// api/vehicles
export async function GET() {
    try {
        const vehicles = await getAllVehicles();
        return Response.json({ data: vehicles });
    } catch (error) {
        return Response.json({ error: "Failed to fetch vehicles" }, { status: 500 });
    }
}