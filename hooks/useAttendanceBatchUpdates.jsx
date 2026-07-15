import { useRef, useState, useCallback, useEffect } from "react";

/* ─── Debounced Batch Update Hook ─── */
function useAttendanceBatchUpdates(onFlush, delay = 1000) {
    // Store all pending changes: Map<"workerId:date", AttendanceChange>
    const pendingRef = useRef(new Map());

    const timerRef = useRef(null);

    const [isSaving, setIsSaving] = useState(false);

    // Flush function: send ALL pending changes to server
    const flush = useCallback(async () => {
        if (pendingRef.current.size === 0) return;

        const changes = Array.from(pendingRef.current.values());
        pendingRef.current.clear();

        setIsSaving(true);
        try {
            await onFlush(changes);
        } finally {
            setIsSaving(false);
        }
    }, [onFlush]);

    // Add a change and schedule debounced flush
    const addChange = useCallback((change) => {
        // Accumulate: newer clicks override older ones for same worker+date
        const key = `${change.workerId}:${change.date}`;
        pendingRef.current.set(key, change);

        // Cancel existing timer
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        // Schedule new flush after delay
        timerRef.current = setTimeout(() => {
            flush();
        }, delay);
    }, [delay, flush]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    return { addChange, flush, isSaving };
}

export default useAttendanceBatchUpdates;