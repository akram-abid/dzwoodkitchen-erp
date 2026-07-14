import { prisma } from "../../lib/prisma";

async function getAllWorkers() {
    const workers = await prisma.workers.findMany({
        include: {
            attendance: true
        }
    })


    return workers.map((w) => ({
        ...w,
        attendance: w.attendance.reduce((acc, record) => {
            acc[record.date.toISOString().split("T")[0]] = record.status
            return acc
        }, {}),
        shortName: w.full_name.split(' ')[0][0].toUpperCase() + '. ' + w.full_name.split(' ')[1],
        initials: w.full_name.split(' ')[0][0].toUpperCase() + w.full_name.split(' ')[1][0].toUpperCase()
    }))
}



export {
    getAllWorkers
}