import { updateVehicle, deleteVehicle } from "../../../services/vehiclesServices";


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

// DELETE api/vehicles/[id]
export async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        await deleteVehicle(id);
        return Response.json({ success: true });
    } catch (error) {
        return Response.json({ error: "Failed to delete vehicle" }, { status: 500 });
    }
}