// prisma/seed.js
//
// Converted from seed.sql — trimmed to 3 workers + 3 clients.
//
// ⚠️ IMPORTANT: model/property names below (prisma.workers, prisma.clients,
// prisma.other_expense_categories, ...) are guesses based on your seed.sql
// table names. Open your prisma/schema.prisma and confirm each model name
// matches — if a model is declared as `model OtherExpenseCategory` with
// `@@map("other_expense_categories")`, the Prisma Client property will be
// `prisma.otherExpenseCategory`, not `prisma.other_expense_categories`.
// Search-and-replace as needed; the shape of the data/logic won't change.

import { PrismaClient, worker_payment_type } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const SALT_ROUNDS = 10;

// Plaintext seed passwords — dev/staging only. Change these (and rotate any
// real accounts that reuse them) before this ever touches a shared env.
// Rachid Said  -> Rachid#2019!
// Amine Benali -> Amine#2020!
// Karim Amrani -> Karim#2021!

// NOTE: no NODE_ENV=production guard here on purpose — you said this runs
// automatically on every deploy, including against a freshly-reset prod DB.
// The count-based guard in main() below is what makes that safe: it only
// ever writes when workers + clients are both empty.

async function main() {
    console.log("[seed] Starting...");

    // ===========================================================
    // GUARD: skip entirely if the DB already has data.
    // Checked OUTSIDE the transaction, before any writes/deletes happen —
    // if workers or clients already exist, we assume this deployment's
    // data is real (or was already seeded) and bail out untouched.
    // ===========================================================
    const [existingWorkers, existingClients, existingOtherCategories] =
        await Promise.all([
            prisma.workers.count(),
            prisma.clients.count(),
            prisma.other_expense_categories.count(),
        ]);

    if (existingWorkers > 0 || existingClients > 0 || existingOtherCategories > 0) {
        console.log(
            `[seed] Data already present (workers: ${existingWorkers}, ` +
            `clients: ${existingClients}, other_expense_categories: ${existingOtherCategories}). ` +
            `Skipping seed — nothing was reset or reinserted.`,
        );
        return; // prisma.$disconnect() runs in the .finally() below
    }

    console.log("[seed] Database is empty — proceeding with seed.");

    await prisma.$transaction(
        async (tx) => {
            // ===========================================================
            // 0) SAFETY NET, not a real reset path.
            //
            // Because of the guard above, we only ever reach this line when
            // workers AND clients were both confirmed empty. These deleteMany
            // calls are a defensive no-op for that case (in case some other
            // table — e.g. incomes — has leftover rows from a partial/failed
            // previous run) so a retry doesn't collide on unique constraints.
            //
            // Do NOT remove the guard above and rely on this block to "clean
            // and reseed" a populated database — that's a different feature
            // (a real reset command) and should be a separate, explicitly
            // invoked script, not something that runs on every deploy.
            // ===========================================================
            await tx.material_stock_movements?.deleteMany?.({});
            await tx.material_leftovers?.deleteMany?.({});
            await tx.material_purchase_items?.deleteMany?.({});
            await tx.material_purchases?.deleteMany?.({});
            await tx.other_expenses?.deleteMany?.({});
            await tx.payments?.deleteMany?.({});
            await tx.checklist_items?.deleteMany?.({});
            await tx.delivery_notes?.deleteMany?.({});
            await tx.order_items?.deleteMany?.({});
            await tx.order_photos?.deleteMany?.({});
            await tx.orders?.deleteMany?.({});
            await tx.workersPayments?.deleteMany?.({}); // "WorkersPayments"
            await tx.assignment?.deleteMany?.({}); // "Assignment"
            await tx.timeEntries?.deleteMany?.({}); // "TimeEntries"
            await tx.attendance?.deleteMany?.({}); // "Attendance"
            await tx.purchase_order_items?.deleteMany?.({});
            await tx.purchase_orders?.deleteMany?.({});
            await tx.material_catalog?.deleteMany?.({});
            await tx.incomes?.deleteMany?.({});
            // workers/clients themselves are already confirmed empty — no need
            // to delete them again here.

            // Reference/lookup tables — upsert instead of wipe+reinsert, see
            // suggestion #2 below for why this matters.
            // (material_categories / other_expense_categories / suppliers handled
            // via upsert further down, not deleted here.)

            // ===========================================================
            // 1) WORKERS (trimmed to 3)
            // ===========================================================
            const workerData = [
                {
                    full_name: "Rachid Said",
                    email: "rachid.said@dzwoodkitchen.local",
                    password: "Rachid#2019!", // plaintext — hashed below, never stored raw
                    phone: "0551 23 45 67",
                    hire_date: new Date("2019-03-15"),
                    payment_type: "meters",
                    meterRate: 5000,
                },
                {
                    full_name: "Amine Benali",
                    email: "amine.benali@dzwoodkitchen.local",
                    password: "Amine#2020!",
                    phone: "0770 88 99 00",
                    hire_date: new Date("2020-06-01"),
                    payment_type: "hours",
                    hourlyRate: 1100,
                },
                {
                    full_name: "Karim Amrani",
                    email: "karim.amrani@dzwoodkitchen.local",
                    password: "Karim#2021!",
                    phone: "0540 11 22 33",
                    hire_date: new Date("2021-01-10"),
                    payment_type: "meters",
                    meterRate: 5000,
                },
            ];

            const workers = {};
            for (const { password, ...w } of workerData) {
                const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
                workers[w.full_name] = await tx.workers.create({
                    data: { ...w, password_hash },
                });
            }
            console.log(`[seed] workers: ${Object.keys(workers).length}`);

            // ===========================================================
            // 2) CLIENTS (trimmed to 3)
            // ===========================================================
            const clientData = [
                { name: "A. Benali", type: "Individual", phone: "0551 23 45 67" },
                { name: "K. Amrani", type: "Individual", phone: "0770 88 99 00" },
                { name: "S. Merzoug", type: "Individual", phone: "0540 11 22 33" },
            ];

            const clients = {};
            for (const c of clientData) {
                clients[c.name] = await tx.clients.create({ data: c });
            }
            console.log(`[seed] clients: ${Object.keys(clients).length}`);

            // ===========================================================
            // 3) REFERENCE DATA — upserted by NAME, not recreated by ID.
            //    This is the fix for the FK bug from before: any code that
            //    creates an other_expenses row should look up the category
            //    by name (or slug), never assume a specific numeric id.
            // ===========================================================
            const materialCategoryNames = [
                "Wood",
                "Veneer",
                "Hardware",
                "Stone",
                "Electrical",
                "Adhesive",
                "Finish",
                "Other",
            ];
            const materialCategories = {};
            for (const name of materialCategoryNames) {
                materialCategories[name] = await tx.material_categories.upsert({
                    where: { name },
                    update: {},
                    create: { name },
                });
            }

            const otherExpenseCategoryNames = [
                "Rent",
                "Utilities",
                "Tools & Equipment",
                "Transport",
                "Marketing",
                "Maintenance",
                "Office",
                "Misc",
            ];
            const otherExpenseCategories = {};
            for (const name of otherExpenseCategoryNames) {
                otherExpenseCategories[name] = await tx.other_expense_categories.upsert({
                    where: { name },
                    update: {},
                    create: { name },
                });
            }
            console.log(
                `[seed] material_categories: ${materialCategoryNames.length}, ` +
                `other_expense_categories: ${otherExpenseCategoryNames.length}`,
            );

            // A single supplier so ORDERS/material purchases below have something
            // to reference — trim further if you don't need it.
            const supplier = await tx.suppliers.upsert({
                where: { name: "Bois & Panneaux El Djazair" },
                update: {},
                create: {
                    name: "Bois & Panneaux El Djazair",
                    phone: "0555 12 34 56",
                    nif: "000123456789012",
                    rc: "16/00-1234567 B 21",
                    status: "ACTIVE",
                },
            });

            // ===========================================================
            // 4) ORDERS — one per client, tied to one of the 3 workers
            // ===========================================================
            const orderData = [
                {
                    client: "A. Benali",
                    worker: "Rachid Said",
                    project_name: "Kitchen cabinets + island",
                    total_amount: 45000,
                    due_date: new Date("2026-07-05"),
                    state: "in_production",
                    address: "Hydra, Algiers",
                },
                {
                    client: "K. Amrani",
                    worker: "Amine Benali",
                    project_name: "Dining table + 6 chairs",
                    total_amount: 62000,
                    due_date: new Date("2026-07-06"),
                    state: "in_production",
                    address: "Bab Ezzouar",
                },
                {
                    client: "S. Merzoug",
                    worker: "Karim Amrani",
                    project_name: "Full kitchen renovation",
                    total_amount: 128000,
                    due_date: new Date("2026-07-20"),
                    state: "contract",
                    address: "Staoueli",
                },
            ];

            const orders = {};
            for (const o of orderData) {
                orders[o.project_name] = await tx.orders.create({
                    data: {
                        client_id: clients[o.client].id,
                        worker_id: workers[o.worker].id,
                        project_name: o.project_name,
                        total_amount: o.total_amount,
                        due_date: o.due_date,
                        state: o.state,
                        address: o.address,
                        is_fully_completed: false,
                    },
                });
            }
            console.log(`[seed] orders: ${Object.keys(orders).length}`);

            // ===========================================================
            // 5) PAYMENTS (deposits against the 3 orders)
            // ===========================================================
            await tx.payments.createMany({
                data: [
                    {
                        order_id: orders["Kitchen cabinets + island"].id,
                        amount: 15000,
                        payment_date: new Date("2026-06-20"),
                        note: "Deposit",
                    },
                    {
                        order_id: orders["Dining table + 6 chairs"].id,
                        amount: 31000,
                        payment_date: new Date("2026-06-15"),
                        note: "Deposit",
                    },
                ],
            });

            // ===========================================================
            // 6) INCOMES (kept small — treasury allocations)
            // ===========================================================
            await tx.incomes.createMany({
                data: [
                    {
                        date: new Date("2026-07-01"),
                        amount: 500000,
                        reference: "TR-2026-008",
                        note: "July treasury allocation",
                    },
                    {
                        date: new Date("2026-08-01"),
                        amount: 500000,
                        reference: "TR-2026-010",
                        note: "August treasury allocation",
                    },
                ],
            });

            // ===========================================================
            // 7) OTHER EXPENSES — this was commented out in seed.sql and is
            //    exactly the table that hit the FK error in production.
            //    Looked up by category NAME, never a hardcoded id.
            // ===========================================================
            await tx.other_expenses.createMany({
                data: [
                    {
                        other_category_id: otherExpenseCategories["Rent"].id,
                        date: new Date("2026-07-01"),
                        amount: 80000,
                        note: "Workshop rent — July",
                    },
                    {
                        other_category_id: otherExpenseCategories["Transport"].id,
                        date: new Date("2026-07-04"),
                        amount: 8500,
                        note: "Delivery van fuel + material pickup",
                    },
                    {
                        other_category_id: otherExpenseCategories["Utilities"].id,
                        date: new Date("2026-07-15"),
                        amount: 6000,
                        note: "Internet bill — July",
                    },
                ],
            });

            console.log("[seed] payments, incomes, other_expenses done");
        },
        { timeout: 30000 },
    );

    console.log("[seed] Done.");
}

main()
    .catch((err) => {
        console.error("[seed] Failed:", err);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
