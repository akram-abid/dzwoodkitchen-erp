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

// updating attendances
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

// create time entries
export async function createTimeEntry(workerId, entry) {

    const response = await fetch(`/api/workers/${workerId}/time-entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
}

// update time entries
export async function updateTimeEntry(workerId, timeEntryId, entry) {
    const response = await fetch(`/api/workers/${workerId}/time-entries/${timeEntryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.error);
    return data;
}

// delete time entries
export async function deleteTimeEntryApiCall(workerId, timeEntryId) {
    const response = await fetch(`/api/workers/${workerId}/time-entries/${timeEntryId}`, {
        method: "DELETE",
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
}

// create a payment
export async function createPayment(workerId, payment) {
    const response = await fetch(`/api/workers/${workerId}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payment),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
}

// delete payement 
export async function deletePaymentApiCall(workerId, paymentId) {
    const response = await fetch(`/api/workers/${workerId}/payments/${paymentId}`, {
        method: "DELETE",
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
}