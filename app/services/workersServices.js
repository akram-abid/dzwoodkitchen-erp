import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";


export async function login({ email, password }) {
    const worker = await prisma.workers.findUnique({
        where: { email },
    });

    if (!worker) throw new Error("Invalid credentials");

    const valid = await bcrypt.compare(password, worker.password_hash);
    if (!valid) throw new Error("Invalid credentials");

    const token = jwt.sign(
        {
            userId: worker.id,
            role: "WORKER",
        },
        JWT_SECRET,
        { expiresIn: "7d" }
    );

    return {
        token,
        user: {
            id: worker.id,
            name: worker.full_name,
            email: worker.email,
            role: "WORKER",
        },
    };
}


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

async function getWorkerById(id) {
    const worker = await prisma.workers.findUnique({
        where: { id: parseInt(id) },
        include: {
            attendance: true,
            timeEntries: true,
            assignments: true,
            workersPayments: true,
        }
    });

    if (!worker) return null;

    const nameParts = worker.full_name.trim().split(/\s+/);
    const first = nameParts[0] || "";
    const last = nameParts[1] || "";

    return {
        ...worker,
        attendance: worker.attendance.reduce((acc, record) => {
            acc[record.date.toISOString().split("T")[0]] = record.status;
            return acc;
        }, {}),
        shortName: first ? first[0].toUpperCase() + (last ? '. ' + last : '') : "",
        initials: (first[0] || "").toUpperCase() + (last[0] || "").toUpperCase(),
        payments: worker.workersPayments,
        sold: worker.sold || 0,
    };
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


    return entry;
}

async function deleteTimeEntry(timeEntryId) {
    const entry = await prisma.timeEntries.delete({
        where: { id: Number(timeEntryId) },
    });


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

    return payment;
}

async function deletePayment(paymentId) {
    const payment = await prisma.workersPayments.delete({
        where: { id: Number(paymentId) },
    });

    return payment;
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
    getWorkerById,
    createWorker,
    createTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
    createPayment,
    deletePayment,
}
