import { createTrip, getTripsByVehicle } from "../../services/vehiclesServices";


// POST api/vehicles_trips
export async function POST(request) {
    try {
        const body = await request.json();
        const trip = await createTrip(body);
        return Response.json({ data: trip });
    } catch (error) {
        return Response.json({ error: "Failed to create trip" }, { status: 500 });
    }
}

// get trip by vehicle id
export async function GET(request) {
    try {

        const { searchParams } = new URL(request.url);
        const vehicleId = searchParams.get('vehicleId');

        if (!vehicleId) {
            return Response.json({ error: "vehicleId required" }, { status: 400 });
        }

        const trips = await getTripsByVehicle(vehicleId);
        return Response.json({ data: trips });
    } catch (error) {
        return Response.json({ error: "Failed to fetch trips" }, { status: 500 });
    }
}