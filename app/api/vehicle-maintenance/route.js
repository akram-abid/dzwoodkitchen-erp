import { createMaintenance, getMaintenanceByVehicle } from "../../services/vehiclesServices";

// GET api/vehicle-maintenance getMaintenanceByVehicle
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const vehicleId = searchParams.get('vehicleId');

        if (!vehicleId) {
            return Response.json({ error: "vehicleId required" }, { status: 400 });
        }

        const maintenance = await getMaintenanceByVehicle(vehicleId);
        return Response.json({ data: maintenance });
    } catch (error) {
        return Response.json({ error: "Failed to fetch maintenance" }, { status: 500 });
    }
}

// POST  api/vehicle-maintenance create 
export async function POST(request) {
    try {
        const body = await request.json();
        const maint = await createMaintenance(body);
        return Response.json({ data: maint });
    } catch (error) {
        return Response.json({ error: "Failed to create maintenance" }, { status: 500 });
    }
}