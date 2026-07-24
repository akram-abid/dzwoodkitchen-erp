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