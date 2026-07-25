import { deleteMaintenance } from "../../../services/vehiclesServices";


export async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        await deleteMaintenance(id);
        return Response.json({ success: true });
    } catch (error) {
        return Response.json({ error: "Failed to delete maintenance" }, { status: 500 });
    }
}