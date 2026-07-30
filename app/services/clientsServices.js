import { prisma } from "../../lib/prisma";


export async function getAllClients() {
    const clients = await prisma.clients.findMany({
        include: {
            orders: true,
        },
    });

    return clients.map((c) => ({
        ...c,
        orders: c.orders.map((o) => ({
            ...o,
            total_amount: Number(o.total_amount),
            lift_cost: Number(o.lift_cost) || 0,
            meters: Number(o.meters) || 0,
        })),
    }));
}

export async function createClient(data) {
    return await prisma.clients.create({
        data: {
            name: data.name,
            type: data.type,
            phone: data.phone,
            email: data.email || null,
            city: data.city || null,
            district: data.district || null,
            address: data.address || null,
            notes: data.notes || null,
        },
        include: {
            orders: true
        }
    });
}

export async function updateClient(clientId, data) {
    return await prisma.clients.update({
        where: { id: clientId },
        data: {
            name: data.name,
            type: data.type,
            phone: data.phone,
            email: data.email || null,
            city: data.city || null,
            district: data.district || null,
            address: data.address || null,
            notes: data.notes || null,
        },
        include: {
            orders: true
        }
    });
}

export async function deleteClient(clientId) {
    return await prisma.clients.delete({
        where: { id: clientId },
    });
}