import { updateTrip } from "../../../services/vehiclesServices";

// PUT api/vehicles_trips/[id]
export async function PUT(request, { params }) {
    try {
        const { id } = await params;

        const body = await request.json();
        const trip = await updateTrip(id, body);
        return Response.json({ data: trip });
    } catch (error) {
        return Response.json({ error: "Failed to update trip" }, { status: 500 });
    }
}