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