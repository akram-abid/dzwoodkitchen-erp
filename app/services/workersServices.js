import { prisma } from "../../lib/prisma";

async function getAllWorkers() {
    const workers = await prisma.workers.findMany()

    return workers.map((w) => ({
        ...w,
        shortName: w.full_name.split(' ')[0][0].toUpperCase() + '. ' + w.full_name.split(' ')[1],
        initials: w.full_name.split(' ')[0][0].toUpperCase() + w.full_name.split(' ')[1][0].toUpperCase()
    }))
}



export {
    getAllWorkers
}