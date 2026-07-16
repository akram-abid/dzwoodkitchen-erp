import { prisma } from "../../lib/prisma";

async function getAllWorkers() {
    const workers = await prisma.workers.findMany({
        include: {
            attendance: true,
            timeEntries: true
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

async function createTimeEntry(workerId, data) {
    const { date, clockIn, clockOut, extraHours, extraNote } = data;

    return await prisma.timeEntries.create({
        data: {
            workerId: Number(workerId),
            date: new Date(date),
            clockIn,
            clockOut,
            extraHours: extraHours || 0,
            extraNote: extraNote || "",
        },
    });
}

export {
    getAllWorkers,
    createTimeEntry
}