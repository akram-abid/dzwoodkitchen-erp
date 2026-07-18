import { prisma } from "../../lib/prisma";


export async function getAllClients() {
    const clients = await prisma.clients.findMany({
        include: {
            orders: true,
        },
    });

    return clients;
}