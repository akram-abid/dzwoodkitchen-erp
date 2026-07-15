import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/workers/id/attendance 
export async function POST(request) {

    try {
        const body = await request.json();
        const change = body; // Single change object

        // Check if it's a delete or upsert
        if (change.status === undefined) {
            // DELETE operation
            const deleted = await prisma.attendance.deleteMany({
                where: {
                    workerId: Number(change.workerId),
                    date: new Date(change.date),
                },
            });

            return NextResponse.json({
                success: true,
                message: "Attendance record deleted",
                deleted: deleted.count,
            });
        } else {
            // UPSERT operation
            const result = await prisma.attendance.upsert({
                where: {
                    workerId_date: {
                        workerId: Number(change.workerId),
                        date: new Date(change.date),
                    },
                },
                update: {
                    status: change.status,
                },
                create: {
                    workerId: Number(change.workerId),
                    date: new Date(change.date),
                    status: change.status,
                },
            });

            return NextResponse.json({
                success: true,
                message: "Attendance record saved",
                upserted: 1,
            });
        }

    } catch (error) {
        console.error("Attendance update error:", error);
        return NextResponse.json(
            { error: "Failed to update attendance record" },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}

// // ============ GET ============
// export async function GET(request) {
//     try {
//         // 1. Get query parameters
//         const { searchParams } = new URL(request.url);
//         const workerId = searchParams.get("workerId");
//         const startDate = searchParams.get("startDate");
//         const endDate = searchParams.get("endDate");

//         // 2. Build filters
//         const where = {};

//         if (workerId) {
//             where.workerId = Number(workerId);
//         }

//         if (startDate || endDate) {
//             where.date = {};
//             if (startDate) where.date.gte = new Date(startDate);
//             if (endDate) where.date.lte = new Date(endDate);
//         }

//         // 3. Query database
//         const records = await prisma.attendance.findMany({
//             where,
//             orderBy: [
//                 { workerId: "asc" },
//                 { date: "desc" }
//             ],
//             include: {
//                 worker: {
//                     select: {
//                         id: true,
//                         full_name: true,
//                     },
//                 },
//             },
//         });

//         // 4. Format dates
//         const formattedRecords = records.map((r) => ({
//             ...r,
//             date: r.date.toISOString().split("T")[0],
//         }));

//         // 5. Return response
//         return NextResponse.json({
//             success: true,
//             data: formattedRecords
//         });

//     } catch (error) {
//         console.error("Attendance query error:", error);
//         return NextResponse.json(
//             { error: "Failed to fetch attendance records" },
//             { status: 500 }
//         );
//     } finally {
//         await prisma.$disconnect();
//     }
// }