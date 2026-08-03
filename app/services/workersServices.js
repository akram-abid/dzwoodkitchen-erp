import { prisma } from "../../lib/prisma";
import bcrypt from "bcrypt";

async function getAllWorkers() {
    const workers = await prisma.workers.findMany({
        include: {
            attendance: true,
            timeEntries: true,
            assignments: true,
            workersPayments: true,

        }
    })


    return workers.map((w) => {
        const nameParts = w.full_name.trim().split(/\s+/);
        const first = nameParts[0] || "";
        const last = nameParts[1] || "";

        return {
            ...w,
            attendance: w.attendance.reduce((acc, record) => {
                acc[record.date.toISOString().split("T")[0]] = record.status
                return acc
            }, {}),
            shortName: first ? first[0].toUpperCase() + (last ? '. ' + last : '') : "",
            initials: (first[0] || "").toUpperCase() + (last[0] || "").toUpperCase(),
            payments: w.workersPayments,
            sold: w.sold || 0,
        };
    })
}


async function createWorker(data) {
    const password_hash = await bcrypt.hash(data.password, 10);

    const worker = await prisma.workers.create({
        data: {
            full_name: data.full_name,
            email: data.email,
            password_hash,
            phone: data.phone || null,
            payment_type: data.payment_type,
            hourlyRate: data.hourlyRate || null,
            meterRate: data.meterRate || null,
            hire_date: data.hire_date ? new Date(data.hire_date) : null,
            sold: data.sold || 0,
        },
    });

    return {
        id: worker.id,
        full_name: worker.full_name,
        email: worker.email,
        phone: worker.phone,
        payment_type: worker.payment_type,
        hourlyRate: worker.hourlyRate ? Number(worker.hourlyRate) : null,
        meterRate: worker.meterRate ? Number(worker.meterRate) : null,
        hire_date: worker.hire_date?.toISOString().split("T")[0] || null,
        sold: Number(worker.sold),
        created_at: worker.created_at,
        updated_at: worker.updated_at,
    };
}

async function createTimeEntry(workerId, data) {
    const { date, clockIn, clockOut, extraHours, extraNote } = data;

    const entry = await prisma.timeEntries.create({
        data: {
            workerId: Number(workerId),
            date: new Date(date),
            clockIn,
            clockOut,
            extraHours: extraHours || 0,
            extraNote: extraNote || "",
        },
    });

    await recalculateWorkerSold(workerId);

    return entry;
}

async function updateTimeEntry(timeEntryId, data) {
    const { date, clockIn, clockOut, extraHours, extraNote } = data;

    const entry = await prisma.timeEntries.update({
        where: { id: Number(timeEntryId) },
        data: {
            date: new Date(date),
            clockIn,
            clockOut,
            extraHours: extraHours || 0,
            extraNote: extraNote || "",
        },
    });

    await recalculateWorkerSold(entry.workerId);

    return entry;
}

async function deleteTimeEntry(timeEntryId) {
    const entry = await prisma.timeEntries.delete({
        where: { id: Number(timeEntryId) },
    });

    await recalculateWorkerSold(entry.workerId);

    return entry;
}


async function createPayment(workerId, data) {
    const { date, amount, note } = data;

    const payment = await prisma.workersPayments.create({
        data: {
            workerId: Number(workerId),
            amount,
            date: new Date(date),
            note: note || "",
        },
    });

    await recalculateWorkerSold(workerId);
    return payment;
}

async function deletePayment(paymentId) {
    const payment = await prisma.workersPayments.delete({
        where: { id: Number(paymentId) },
    });

    await recalculateWorkerSold(payment.workerId);
    return payment;
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



export async function recalculateWorkerSold(workerId) {
    const worker = await prisma.workers.findUnique({
        where: { id: parseInt(workerId) },
        include: {
            timeEntries: true,
            assignments: true,
            workersPayments: true,
        },
    });

    if (!worker) throw new Error("Worker not found");

    let totalEarnings = 0;

    if (worker.payment_type === "hours") {
        for (const entry of worker.timeEntries) {
            const [inH, inM] = entry.clockIn.split(":").map(Number);
            const [outH, outM] = entry.clockOut.split(":").map(Number);
            const hours = outH + outM / 60 - (inH + inM / 60) + (entry.extraHours || 0);
            totalEarnings += hours * (worker.hourlyRate || 0);
        }
    } else if (worker.payment_type === "meters") {
        for (const assignment of worker.assignments) {
            totalEarnings += assignment.meters * (worker.meterRate || 0);
        }
    }

    const totalPayments = worker.workersPayments.reduce(
        (sum, p) => sum + p.amount,
        0
    );

    // sold = previousSold + totalEarnings - totalPayments
    const sold = (worker.sold || 0) + totalEarnings - totalPayments;

    // Update worker
    await prisma.workers.update({
        where: { id: parseInt(workerId) },
        data: { sold },
    });

    return sold;
}

export {
    getAllWorkers,
    createWorker,
    createTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
    createPayment,
    deletePayment,
    updateAllWorkersSold
}
