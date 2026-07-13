import { prisma } from "../../lib/prisma";

async function getAllWorkers() {
    return await prisma.workers.findMany()
}



export {
    getAllWorkers
}