import { prisma } from "../../lib/prisma";


export async function getAllVehicles() {
    const vehicles = await prisma.vehicles.findMany({
        orderBy: { created_at: "desc" },
    });

    return vehicles.map(v => ({
        id: v.id,
        name: v.name,
        plate_number: v.plate_number,
        purchase_date: v.purchase_date?.toISOString().split("T")[0] || "",
        purchase_price: Number(v.purchase_price),
        daily_cost: Number(v.daily_cost),
        monthly_maint: Number(v.monthly_maint),
        current_km: Number(v.current_km),
        fuel_type: v.fuel_type,
        notes: v.notes,
    }));
}

export async function createVehicle(data) {
    const vehicle = await prisma.vehicles.create({
        data: {
            name: data.name,
            plate_number: data.plate_number,
            purchase_date: data.purchase_date ? new Date(data.purchase_date) : null,
            purchase_price: data.purchase_price,
            daily_cost: data.daily_cost,
            monthly_maint: data.monthly_maint || 0,
            current_km: data.current_km || 0,
            fuel_type: data.fuel_type || null,
            notes: data.notes || null,
        },
    });

    return {
        id: vehicle.id,
        name: vehicle.name,
        plate_number: vehicle.plate_number,
        purchase_date: vehicle.purchase_date?.toISOString().split("T")[0] || "",
        purchase_price: Number(vehicle.purchase_price),
        daily_cost: Number(vehicle.daily_cost),
        monthly_maint: Number(vehicle.monthly_maint),
        current_km: Number(vehicle.current_km),
        fuel_type: vehicle.fuel_type,
        notes: vehicle.notes,
    };
}

export async function updateVehicle(id, data) {
    const vehicle = await prisma.vehicles.update({
        where: { id: parseInt(id) },
        data: {
            name: data.name,
            plate_number: data.plate_number,
            purchase_date: data.purchase_date ? new Date(data.purchase_date) : null,
            purchase_price: data.purchase_price,
            daily_cost: data.daily_cost,
            monthly_maint: data.monthly_maint || 0,
            current_km: data.current_km || 0,
            fuel_type: data.fuel_type || null,
            notes: data.notes || null,
        },
    });

    return {
        id: vehicle.id,
        name: vehicle.name,
        plate_number: vehicle.plate_number,
        purchase_date: vehicle.purchase_date?.toISOString().split("T")[0] || "",
        purchase_price: Number(vehicle.purchase_price),
        daily_cost: Number(vehicle.daily_cost),
        monthly_maint: Number(vehicle.monthly_maint),
        current_km: Number(vehicle.current_km),
        fuel_type: vehicle.fuel_type,
        notes: vehicle.notes,
    };
}

export async function deleteVehicle(id) {
    await prisma.vehicles.delete({
        where: { id: parseInt(id) },
    });
    return { success: true };
}

export async function createTrip(data) {
    const trip = await prisma.vehicle_trips.create({
        data: {
            vehicle_id: parseInt(data.vehicleId),
            date: new Date(data.date),
            start_km: data.startKm,
            end_km: data.endKm,
            purpose: data.purpose,
            cost: data.cost,
            order_id: data.orderId ? parseInt(data.orderId) : null,
            notes: data.notes || null,
        },
    });

    // Update vehicle current_km
    if (data.endKm) {
        await prisma.vehicles.update({
            where: { id: parseInt(data.vehicleId) },
            data: { current_km: data.endKm },
        });
    }

    return {
        id: trip.id,
        date: trip.date.toISOString().split("T")[0],
        startKm: Number(trip.start_km),
        endKm: Number(trip.end_km),
        purpose: trip.purpose,
        cost: Number(trip.cost),
        orderId: trip.order_id,
        notes: trip.notes,
    };
}

export async function getTripsByVehicle(vehicleId) {
    const trips = await prisma.vehicle_trips.findMany({
        where: { vehicle_id: parseInt(vehicleId) },
        orderBy: { date: "desc" },
    });

    return trips.map(t => ({
        id: t.id,
        date: t.date.toISOString().split("T")[0],
        startKm: Number(t.start_km),
        endKm: Number(t.end_km),
        purpose: t.purpose,
        cost: Number(t.cost),
        orderId: t.order_id,
        notes: t.notes,
    }));
}