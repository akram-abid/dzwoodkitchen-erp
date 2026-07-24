import { updateVehicle } from "../../../services/vehiclesServices";


// PUT api/vehicles/[id]
export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const vehicle = await updateVehicle(id, body);
        return Response.json({ data: vehicle });
    } catch (error) {
        return Response.json({ error: "Failed to update vehicle" }, { status: 500 });
    }
}