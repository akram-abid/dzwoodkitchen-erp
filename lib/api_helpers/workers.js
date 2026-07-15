// lib/api/attendance.js
// Helper functions for managing attendance data

/**
 * Sends multiple attendance changes to the server in one request
 * This reduces network calls when users make many changes quickly
 * 
 * @param {Array} changes - List of attendance changes to save
 * @param {number|string} changes[].workerId - ID of the worker
 * @param {string} changes[].date - Date in "YYYY-MM-DD" format
 * @param {string} [changes[].status] - "PRESENT", "ABSENT", or undefined (to delete)
 * @returns {Promise<Object>} Result with success status and counts
 */

export async function batchUpdateAttendance(changes) {
    const results = [];
    let totalUpserted = 0;
    let totalDeleted = 0;
    let hasError = false;

    for (const change of changes) {
        try {
            const response = await fetch(`/api/workers/${change.workerId}/attendance`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    workerId: change.workerId,
                    date: change.date,
                    status: change.status
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed");
            }

            if (change.status === undefined) {
                totalDeleted++;
            } else {
                totalUpserted++;
            }

            results.push({ success: true, workerId: change.workerId });

        } catch (error) {
            hasError = true;
            results.push({
                success: false,
                workerId: change.workerId,
                error: error.message
            });
        }
    }

    return {
        success: !hasError,
        upserted: totalUpserted,
        deleted: totalDeleted,
        details: results
    };
}

/**
 * Gets attendance records from the server
 * You can filter by worker, date range, or get everything
 *
 * @param {Object} filters - Optional filters
 * @param {number|string} [filters.workerId] - Get records for specific worker
 * @param {string} [filters.startDate] - Get records from this date (YYYY-MM-DD)
 * @param {string} [filters.endDate] - Get records up to this date (YYYY-MM-DD)
 * @returns {Promise<Array>} List of attendance records
 *
 * @example
 * // Get all attendance for worker 123 in January 2024
 * const records = await fetchAttendance({
 *   workerId: 123,
 *   startDate: "2024-01-01",
 *   endDate: "2024-01-31"
 * });
 */

/**
 * Converts database records into a format easier for the UI to use
 * Structure: Map<workerId, Map<date, status>>
 * This makes it fast to check if a worker was present on a specific date
 *
 * @param {Array} records - Attendance records from the database
 * @returns {Map<string, Map<string, string>>}
 *   Key: worker ID as string
 *   Value: Map of date strings to status ("PRESENT" or "ABSENT")
 *
 * @example
 * const records = [
 *   { workerId: 1, date: "2024-01-01", status: "PRESENT" },
 *   { workerId: 1, date: "2024-01-02", status: "ABSENT" },
 *   { workerId: 2, date: "2024-01-01", status: "PRESENT" }
 * ];
 *
 * const attendanceMap = transformAttendanceForApp(records);
 * // attendanceMap.get("1").get("2024-01-01") === "PRESENT"
 */
// export function transformAttendanceForApp(records) {
//     const workerAttendance = new Map();

//     for (const record of records) {
//         // Use string for worker ID to keep it consistent
//         const workerId = String(record.workerId);

//         // If this worker isn't in our map yet, create an empty map for them
//         if (!workerAttendance.has(workerId)) {
//             workerAttendance.set(workerId, new Map());
//         }

//         // Get the date as a simple string (YYYY-MM-DD)
//         let dateString;
//         if (record.date instanceof Date) {
//             // If it's a Date object, convert to string
//             dateString = record.date.toISOString().split("T")[0];
//         } else {
//             // If it's already a string, use it directly
//             dateString = record.date;
//         }

//         // Store the status for this worker on this date
//         workerAttendance.get(workerId).set(dateString, record.status);
//     }

//     return workerAttendance;
// }