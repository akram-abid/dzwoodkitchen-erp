import { prisma } from "../../lib/prisma";


export async function getAllClients() {
    const clients = await prisma.clients.findMany({
        include: {
            orders: true,
        },
    });

    return clients;
}

export async function createClient(data) {
    return await prisma.clients.create({
        data: {
            name: data.name,
            type: data.type,
            status: data.status,
            phone: data.phone,
            email: data.email || null,
            city: data.city || null,
            district: data.district || null,
            address: data.address || null,
            notes: data.notes || null,
        },
    });
}