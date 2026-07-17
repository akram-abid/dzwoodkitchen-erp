import { prisma } from "../../lib/prisma";

async function getAllWorkers() {
    const workers = await prisma.workers.findMany({
        include: {
            attendance: true,
            timeEntries: true,
            assignments: true,
            workersPayments: true,

        }
    })


    return workers.map((w) => ({
        ...w,
        attendance: w.attendance.reduce((acc, record) => {
            acc[record.date.toISOString().split("T")[0]] = record.status
            return acc
        }, {}),
        shortName: w.full_name.split(' ')[0][0].toUpperCase() + '. ' + w.full_name.split(' ')[1],
        initials: w.full_name.split(' ')[0][0].toUpperCase() + w.full_name.split(' ')[1][0].toUpperCase(),
        payments: w.workersPayments,
        sold: w.sold || 0,
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

async function updateTimeEntry(timeEntryId, data) {
    const { date, clockIn, clockOut, extraHours, extraNote } = data;

    return await prisma.timeEntries.update({
        where: { id: Number(timeEntryId) },
        data: {
            date: new Date(date),
            clockIn,
            clockOut,
            extraHours: extraHours || 0,
            extraNote: extraNote || "",
        },
    });
}

async function deleteTimeEntry(timeEntryId) {
    return await prisma.timeEntries.delete({
        where: { id: Number(timeEntryId) },
    });
}


async function createPayment(workerId, data) {
    const { date, amount, note } = data;

    return await prisma.workersPayments.create({
        data: {
            workerId: Number(workerId),
            amount,
            date: new Date(date),
            note: note || "",
        },
    });
}

async function deletePayment(paymentId) {
    return await prisma.workersPayments.delete({
        where: { id: Number(paymentId) },
    });
}

async function updateAllWorkersSold() {
    const now = new Date();
    const prevMonthKey = formatDate(now).slice(0, 7);

    // Check if already updated this month
    const config = await prisma.systemConfig.findUnique({
        where: { id: "soldUpdate" }
    });

    if (config?.lastUpdate === prevMonthKey) {
        return { success: true, message: `Already updated for ${prevMonthKey}` };
    }

    // Get all workers with their data
    const workers = await prisma.workers.findMany({
        include: {
            timeEntries: true,
            workersPayments: true
        }
    });

    // For each worker, calculate and update
    for (const worker of workers) {
        const earned = getMonthlyEarnings(worker, prevMonthKey);
        const paid = getMonthlyPayments(worker, prevMonthKey);
        const balance = earned - paid;

        await prisma.workers.update({
            where: { id: worker.id },
            data: { sold: worker.sold + balance }
        });
    }

    // Save last update
    await prisma.systemConfig.upsert({
        where: { id: "soldUpdate" },
        update: { lastUpdate: prevMonthKey },
        create: { lastUpdate: prevMonthKey }
    });

    return { success: true, updated: workers.length };
}

// helper functions 
// from lib/prisma/workers.js 

const formatDate = (d) => {
    if (typeof d === "string") return d;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const calcEntryHours = (e) => {
    const [inH, inM] = e.clockIn.split(":").map(Number);
    const [outH, outM] = e.clockOut.split(":").map(Number);
    return outH + outM / 60 - (inH + inM / 60) + (e.extraHours || 0);
};

const getMonthlyTimeEntries = (w, vKey) => {
    return (w.timeEntries || []).filter((e) => formatDate(e.date).startsWith(vKey));
};

const getMonthlyHours = (w, vKey) => {
    return getMonthlyTimeEntries(w, vKey).reduce((sum, e) => sum + calcEntryHours(e), 0);
};

const getMonthlyMetersData = (w, vKey) => {
    const assignments = (w.assignments || []).filter((a) =>
        formatDate(a.date).startsWith(vKey)
    );
    return {
        totalMeters: assignments.reduce((s, a) => s + a.meters, 0),
        kitchens: assignments.map((a) => ({
            name: a.project,
            orderId: a.id,
            meters: a.meters,
            amount: Math.round(a.meters * (w.meterRate || 0)),
        })),
        source: "assignments",
    };
};

const getMonthlyEarnings = (w, vKey) => {
    if (w.payment_type === "meters") {
        return Math.round(
            getMonthlyMetersData(w, vKey).totalMeters * (w.meterRate || 0)
        );
    }
    return Math.round(getMonthlyHours(w, vKey) * w.hourlyRate);
};

const getMonthlyPayments = (w, vKey) =>
    (w.workersPayments || [])
        .filter((p) => formatDate(p.date).startsWith(vKey))
        .reduce((s, p) => s + p.amount, 0);


export {
    getAllWorkers,
    createTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
    createPayment,
    deletePayment,
    updateAllWorkersSold
}