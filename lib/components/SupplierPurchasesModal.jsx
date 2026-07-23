"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  getSupplierPurchasesClient,
  getSuppliers,
} from "../api_helpers/supplier.js";

import {
  updateMaterialPurchaseClient,
  deleteMaterialPurchaseClient,
  deleteMaterialPurchaseItemClient,
} from "../api_helpers/materialPurchase.js";

/* ─── icons (inline, no extra deps) ─── */

const Icons = {
  x: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  ),

  pencil: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  ),

  trash: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  ),

  check: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),

  plus: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  ),

  alert: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  ),

  calendar: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  ),

  box: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  ),
};

/* ─── color tokens (mirrors suppliers/page.jsx) ─── */

const C = {
  blue: "#2563eb",

  green: "#16a34a",

  red: "#dc2626",

  purple: "#9333ea",

  amber: "#ca8a04",

  gray: "#4b5563",
};

/* ─── drag-down-to-dismiss for mobile bottom sheets ───

   Attach `handleProps` to the small drag-handle bar and `sheetStyle`
   to the sheet's outer div. Dragging past `threshold` px slides the
   sheet the rest of the way down and then fires onClose; letting go
   early snaps it back to rest. No-op on desktop since the handle is
   hidden there (sm:hidden), so it never receives pointer events. */

const useDragToClose = (onClose, { threshold = 120 } = {}) => {
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [closing, setClosing] = useState(false);
  const startYRef = useRef(0);

  useEffect(() => {
    if (!closing) return;
    const t = setTimeout(onClose, 300);
    return () => clearTimeout(t);
  }, [closing, onClose]);

  const onPointerDown = (e) => {
    if (closing) return;
    setDragging(true);
    startYRef.current = e.clientY;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!dragging) return;
    const delta = e.clientY - startYRef.current;
    setDragY(delta > 0 ? delta : 0);
  };

  const endDrag = () => {
    if (!dragging) return;
    setDragging(false);
    if (dragY > threshold) {
      setClosing(true);
    } else {
      setDragY(0);
    }
  };

  const sheetStyle = closing
    ? { transform: "translateY(100%)" }
    : dragging
      ? { transform: `translateY(${dragY}px)`, transition: "none" }
      : { transform: `translateY(${dragY}px)` };

  const handleProps = {
    onPointerDown,
    onPointerMove,
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
    style: { touchAction: "none", cursor: dragging ? "grabbing" : "grab" },
  };

  return { sheetStyle, handleProps, closing };
};

/* ─── helpers ─── */

const formatDZD = (n) => `${(n ?? 0).toLocaleString("en-US")} DZD`;

const formatDate = (iso) => {
  if (!iso) return "—";

  const d = new Date(iso);

  if (isNaN(d.getTime())) return "—";

  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/* `<input type="date">` value: YYYY-MM-DD. The column is @db.Date

   (no time component) so a pure date string round-trips cleanly. */

const dateInputValue = (d) => {
  if (!d) return "";

  const date = d instanceof Date ? d : new Date(d);

  if (isNaN(date.getTime())) return "";

  // Use local components so the user sees the same calendar day they

  // submitted (avoids UTC-shift bugs around midnight in non-UTC zones).

  const y = date.getFullYear();

  const m = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${y}-${m}-${day}`;
};

/* ═══════════════════════════════════════════════════════════════════

   PER-PURCHASE EDIT MODAL

   header + items in one save. items can be edited / removed / added.

═══════════════════════════════════════════════════════════════════ */

/* Stable empty-row shape for "add new item" */

const newItemRow = () => ({
  __isNew: true,

  material_name: "",

  quantity: "",

  unit: "",

  unit_price: "",

  material_id: null,
});

function EditPurchaseModal({
  purchase,

  suppliers,

  onClose,

  onSaved,
}) {
  /* ── form state ── */

  const [date, setDate] = useState(dateInputValue(purchase.date));

  const [supplierId, setSupplierId] = useState(
    purchase.supplier_id ?? purchase.id /* fallback never used */,
  );

  // Try to use the supplier id from the parent modal if purchase doesn't carry it

  const [reference, setReference] = useState(purchase.reference ?? "");

  const [note, setNote] = useState(purchase.note ?? "");

  const [items, setItems] = useState(() => {
    const existing = (purchase.items || []).map((it) => ({
      id: it.id,

      material_id: it.material_id ?? null,

      material_name: it.material_name ?? it.material ?? "",

      quantity: it.quantity === 0 || it.quantity ? String(it.quantity) : "",

      unit: it.unit ?? "",

      unit_price:
        it.unit_price === 0 || it.unit_price ? String(it.unit_price) : "",
    }));

    return existing.length > 0 ? existing : [newItemRow()];
  });

  const [errors, setErrors] = useState({});

  const [topError, setTopError] = useState(null);

  const [submitting, setSubmitting] = useState(false);

  const setItem = (idx, patch) => {
    setItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)),
    );
  };

  const addItem = () => setItems((prev) => [...prev, newItemRow()]);

  const removeItem = (idx) => {
    setItems((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx),
    );
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();

    setTopError(null);

    setErrors({});

    /* ── client-side quick checks ── */

    const localErrors = {};

    if (!date) localErrors.date = "Date is required.";

    if (!supplierId) localErrors.supplier_id = "Supplier is required.";

    if (reference && reference.length > 100)
      localErrors.reference = "Reference must be 100 characters or fewer.";

    const itemErrors = [];

    items.forEach((it, idx) => {
      const errs = {};

      if (!it.material_name || !String(it.material_name).trim())
        errs.material_name = "Required.";

      if (
        it.quantity === "" ||
        it.quantity === null ||
        it.quantity === undefined ||
        Number(it.quantity) <= 0 ||
        Number.isNaN(Number(it.quantity))
      )
        errs.quantity = "Must be > 0.";

      if (!it.unit || !String(it.unit).trim()) errs.unit = "Required.";

      if (
        it.unit_price === "" ||
        it.unit_price === null ||
        it.unit_price === undefined ||
        Number(it.unit_price) < 0 ||
        Number.isNaN(Number(it.unit_price))
      )
        errs.unit_price = "Must be ≥ 0.";

      if (Object.keys(errs).length > 0)
        itemErrors.push({ index: idx, ...errs });
    });

    if (itemErrors.length > 0) localErrors.items = itemErrors;

    if (Object.keys(localErrors).length > 0) {
      setErrors(localErrors);

      return;
    }

    /* ── build payload in the server's canonical shape ── */

    const payload = {
      date,

      supplier_id: Number(supplierId),

      reference: reference.trim() || null,

      note: note.trim() || null,

      items: items.map((it) => {
        const out = {
          material_name: String(it.material_name).trim(),

          quantity: Number(it.quantity),

          unit: String(it.unit).trim(),

          unit_price: Number(it.unit_price),
        };

        if (it.material_id !== undefined && it.material_id !== null)
          out.material_id = Number(it.material_id);

        if (it.id) out.id = it.id;

        return out;
      }),
    };

    setSubmitting(true);

    try {
      const result = await updateMaterialPurchaseClient(purchase.id, payload);

      onSaved(result);
    } catch (err) {
      if (err.fields) setErrors(err.fields);

      setTopError(err.message || "Save failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const { sheetStyle, handleProps, closing } = useDragToClose(onClose);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4"
      style={{
        background: "rgba(15,15,20,0.55)",
        opacity: closing ? 0 : 1,
        transition: "opacity 0.28s ease-out",
      }}
      onClick={onClose}
    >
      <style>{`
        @keyframes editPurchaseSheetUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes editPurchaseSheetIn {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .edit-purchase-sheet { animation: editPurchaseSheetUp 0.22s ease-out; }
        @media (min-width: 640px) {
          .edit-purchase-sheet { animation: editPurchaseSheetIn 0.16s ease-out; }
        }
      `}</style>

      <div
        className="edit-purchase-sheet panel w-full sm:max-w-3xl max-h-[92dvh] sm:max-h-[90vh] rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden transition-transform duration-300 ease-out"
        style={sheetStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {/* drag handle — mobile only */}
        <div
          className="sm:hidden flex justify-center pt-3 pb-2 shrink-0"
          {...handleProps}
        >
          <span
            className="block w-9 h-1 rounded-full"
            style={{ background: "rgba(255,255,255,0.5)" }}
          />
        </div>

        {/* Header */}

        <div
          className="px-5 py-4 flex items-center justify-between shrink-0"
          style={{ background: C.purple, color: "white" }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "rgba(255,255,255,0.18)" }}
            >
              <Icons.pencil />
            </div>

            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">
                Edit Purchase #{purchase.id}
              </div>

              <div className="text-xs opacity-80 truncate">
                {purchase.reference || "No reference"} ·{" "}
                {formatDZD(purchase.total)}
              </div>
            </div>
          </div>

          <button
            className="p-2 -m-2 rounded-md shrink-0 active:opacity-70"
            onClick={onClose}
            style={{ color: "white" }}
            aria-label="Close"
          >
            <Icons.x />
          </button>
        </div>

        {topError && (
          <div
            className="px-5 py-3 flex items-center gap-2 text-sm shrink-0"
            style={{ background: C.red, color: "white" }}
          >
            <Icons.alert />

            <span className="flex-1">{topError}</span>

            <button
              onClick={() => setTopError(null)}
              style={{ color: "white" }}
              aria-label="Dismiss"
            >
              <Icons.x />
            </button>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-5 py-5 space-y-5"
        >
          {/* Header fields */}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                className="text-xs font-medium mb-1.5 block"
                style={{ color: "var(--ink-muted)" }}
              >
                Date
                <span
                  style={{ color: C.red, marginLeft: 4 }}
                  aria-hidden="true"
                >
                  *
                </span>
              </label>

              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{
                  background: "var(--surface-2)",

                  color: "var(--ink)",

                  border: `1px solid ${errors.date ? C.red : "var(--border)"}`,
                }}
              />

              {errors.date && (
                <div className="text-xs mt-1" style={{ color: C.red }}>
                  {errors.date}
                </div>
              )}
            </div>

            <div>
              <label
                className="text-xs font-medium mb-1.5 block"
                style={{ color: "var(--ink-muted)" }}
              >
                Supplier
                <span
                  style={{ color: C.red, marginLeft: 4 }}
                  aria-hidden="true"
                >
                  *
                </span>
              </label>

              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{
                  background: "var(--surface-2)",

                  color: "var(--ink)",

                  border: `1px solid ${errors.supplier_id ? C.red : "var(--border)"}`,
                }}
              >
                <option value="">— select —</option>

                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

              {errors.supplier_id && (
                <div className="text-xs mt-1" style={{ color: C.red }}>
                  {errors.supplier_id}
                </div>
              )}
            </div>
          </div>

          <div>
            <label
              className="text-xs font-medium mb-1.5 block"
              style={{ color: "var(--ink-muted)" }}
            >
              Reference
            </label>

            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. INV-2026-0042"
              maxLength={100}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{
                background: "var(--surface-2)",

                color: "var(--ink)",

                border: `1px solid ${errors.reference ? C.red : "var(--border)"}`,
              }}
            />

            {errors.reference && (
              <div className="text-xs mt-1" style={{ color: C.red }}>
                {errors.reference}
              </div>
            )}
          </div>

          <div>
            <label
              className="text-xs font-medium mb-1.5 block"
              style={{ color: "var(--ink-muted)" }}
            >
              Note
            </label>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{
                background: "var(--surface-2)",

                color: "var(--ink)",

                border: "1px solid var(--border)",

                resize: "vertical",
              }}
            />
          </div>

          {/* Items editor */}

          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                className="text-xs font-medium"
                style={{ color: "var(--ink-muted)" }}
              >
                Items
                <span
                  style={{ color: C.red, marginLeft: 4 }}
                  aria-hidden="true"
                >
                  *
                </span>
              </label>

              <button
                type="button"
                onClick={addItem}
                className="text-xs font-medium inline-flex items-center gap-1 px-3 py-1.5 rounded-md active:opacity-80"
                style={{ background: C.blue, color: "white" }}
              >
                <Icons.plus /> Add item
              </button>
            </div>

            <div className="space-y-2">
              {items.map((it, idx) => {
                const itemErrs = Array.isArray(errors.items)
                  ? errors.items.find((e) => e.index === idx) || {}
                  : {};

                return (
                  <div
                    key={it.id || `new-${idx}`}
                    className="p-3 rounded-lg space-y-2"
                    style={{
                      background: "var(--surface-2)",

                      border: `1px solid ${
                        Object.keys(itemErrs).length > 0
                          ? C.red
                          : "var(--border)"
                      }`,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={it.material_name}
                        onChange={(e) =>
                          setItem(idx, { material_name: e.target.value })
                        }
                        placeholder="Material name"
                        maxLength={150}
                        className="flex-1 px-2 py-2 sm:py-1.5 rounded-md text-sm outline-none"
                        style={{
                          background: "var(--surface)",

                          color: "var(--ink)",

                          border: `1px solid ${itemErrs.material_name ? C.red : "var(--border)"}`,
                        }}
                      />

                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="p-2 -m-0.5 rounded-md active:opacity-70"
                        title="Remove item"
                        style={{ color: C.red }}
                        disabled={items.length <= 1}
                      >
                        <Icons.trash />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={it.quantity}
                          onChange={(e) =>
                            setItem(idx, { quantity: e.target.value })
                          }
                          placeholder="Quantity"
                          className="w-full px-2 py-2 sm:py-1.5 rounded-md text-sm outline-none"
                          style={{
                            background: "var(--surface)",

                            color: "var(--ink)",

                            border: `1px solid ${itemErrs.quantity ? C.red : "var(--border)"}`,
                          }}
                        />

                        {itemErrs.quantity && (
                          <div
                            className="text-xs mt-1"
                            style={{ color: C.red }}
                          >
                            {itemErrs.quantity}
                          </div>
                        )}
                      </div>

                      <div>
                        <input
                          type="text"
                          value={it.unit}
                          onChange={(e) =>
                            setItem(idx, { unit: e.target.value })
                          }
                          placeholder="Unit (kg, m²)"
                          maxLength={20}
                          className="w-full px-2 py-2 sm:py-1.5 rounded-md text-sm outline-none"
                          style={{
                            background: "var(--surface)",

                            color: "var(--ink)",

                            border: `1px solid ${itemErrs.unit ? C.red : "var(--border)"}`,
                          }}
                        />

                        {itemErrs.unit && (
                          <div
                            className="text-xs mt-1"
                            style={{ color: C.red }}
                          >
                            {itemErrs.unit}
                          </div>
                        )}
                      </div>

                      <div>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={it.unit_price}
                          onChange={(e) =>
                            setItem(idx, { unit_price: e.target.value })
                          }
                          placeholder="Unit price"
                          className="w-full px-2 py-2 sm:py-1.5 rounded-md text-sm outline-none"
                          style={{
                            background: "var(--surface)",

                            color: "var(--ink)",

                            border: `1px solid ${itemErrs.unit_price ? C.red : "var(--border)"}`,
                          }}
                        />

                        {itemErrs.unit_price && (
                          <div
                            className="text-xs mt-1"
                            style={{ color: C.red }}
                          >
                            {itemErrs.unit_price}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </form>

        {/* Footer */}

        <div
          className="px-5 py-3 flex items-center justify-end gap-2 shrink-0"
          style={{
            borderTop: "1px solid var(--border)",
            paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
          }}
        >
          <button
            type="button"
            className="btn-ghost text-sm order-2 sm:order-1 px-3 py-2"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="order-1 sm:order-2 flex-1 sm:flex-none text-sm font-medium px-4 py-2.5 sm:py-1.5 rounded-lg inline-flex items-center justify-center gap-1.5 active:opacity-80"
            style={{
              background: C.purple,

              color: "white",

              opacity: submitting ? 0.6 : 1,
            }}
          >
            {submitting ? "…" : <Icons.check />}

            {submitting ? "Saving" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════

   TOP-LEVEL MODAL

   year/month nav, operations list with read view + per-row CRUD

   controls, per-item delete on the read view.

═══════════════════════════════════════════════════════════════════ */

export default function SupplierPurchasesModal({
  supplier,

  onClose,

  onEdit, // optional — passed through from the page

  onPurchaseChanged, // optional — refresh upstream + toast
}) {
  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const [year, setYear] = useState(new Date().getFullYear());

  const [month, setMonth] = useState(null);

  const [editing, setEditing] = useState(null); // purchase being edited

  const [editingSuppliers, setEditingSuppliers] = useState([]);

  // Inline confirm for whole-purchase delete

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const [deletingId, setDeletingId] = useState(null);

  // Inline confirm for per-item delete

  const [itemConfirmDeleteId, setItemConfirmDeleteId] = useState(null);

  const [itemDeletingId, setItemDeletingId] = useState(null);

  const [busy, setBusy] = useState(false);

  const [topError, setTopError] = useState(null);

  /* ── load purchases ── */

  const load = useCallback(async () => {
    setLoading(true);

    setError(null);

    try {
      const payload = await getSupplierPurchasesClient(supplier.id, {
        year,

        month,
      });

      setData(payload);
    } catch (e) {
      setError(e.message || "Failed to load purchases");
    } finally {
      setLoading(false);
    }
  }, [supplier.id, year, month]);

  useEffect(() => {
    load();
  }, [load]);

  /* ── list of suppliers (only fetched when the edit modal opens) ── */

  useEffect(() => {
    if (!editing) return;

    let alive = true;

    (async () => {
      try {
        const list = await getSuppliers();

        if (alive) setEditingSuppliers(list);
      } catch {
        if (alive) setEditingSuppliers([]);
      }
    })();

    return () => {
      alive = false;
    };
  }, [editing]);

  /* ── month nav ── */

  const monthNames = data?.monthNames;

  const operations = data?.operations || [];

  const summary = data?.summary || { count: 0, total: 0 };

  const byMonth = data?.byMonth;

  const goPrevYear = () => setYear((y) => y - 1);

  const goNextYear = () => setYear((y) => y + 1);

  const goThisYear = () => setYear(new Date().getFullYear());

  const selectMonth = (m) => setMonth((curr) => (curr === m ? null : m));

  const selectAllMonths = () => setMonth(null);

  /* ── delete whole purchase ── */

  const askDelete = (id) => setConfirmDeleteId(id);

  const cancelDelete = () => setConfirmDeleteId(null);

  const doDelete = async (id) => {
    setDeletingId(id);

    setTopError(null);

    try {
      await deleteMaterialPurchaseClient(id);

      setConfirmDeleteId(null);

      // refresh local list

      await load();

      // notify parent so ordersCount / totalSpent cards stay fresh

      onPurchaseChanged?.("Purchase deleted.");
    } catch (e) {
      setTopError(e.message || "Delete failed.");
    } finally {
      setDeletingId(null);
    }
  };

  /* ── delete single item (in READ view) ── */

  const askDeleteItem = (id) => setItemConfirmDeleteId(id);

  const cancelDeleteItem = () => setItemConfirmDeleteId(null);

  const doDeleteItem = async (id) => {
    setItemDeletingId(id);

    setTopError(null);

    try {
      await deleteMaterialPurchaseItemClient(id);

      setItemConfirmDeleteId(null);

      await load();
    } catch (e) {
      setTopError(e.message || "Item delete failed.");
    } finally {
      setItemDeletingId(null);
    }
  };

  /* ── edit purchase saved ── */

  const onEditSaved = async (saved) => {
    setEditing(null);

    setTopError(null);

    await load();

    onPurchaseChanged?.(`Purchase #${saved.id} updated.`);
  };

  const { sheetStyle, handleProps, closing } = useDragToClose(onClose);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      style={{
        background: "rgba(15,15,20,0.55)",
        opacity: closing ? 0 : 1,
        transition: "opacity 0.28s ease-out",
      }}
      onClick={onClose}
    >
      <style>{`
        @keyframes purchasesSheetUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes purchasesSheetIn {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .purchases-sheet { animation: purchasesSheetUp 0.22s ease-out; }
        @media (min-width: 640px) {
          .purchases-sheet { animation: purchasesSheetIn 0.16s ease-out; }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div
        className="purchases-sheet panel w-full sm:max-w-4xl max-h-[92dvh] sm:max-h-[90vh] rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden transition-transform duration-300 ease-out"
        style={sheetStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {/* drag handle — mobile only */}
        <div
          className="sm:hidden flex justify-center pt-3 pb-2 shrink-0"
          {...handleProps}
        >
          <span
            className="block w-9 h-1 rounded-full"
            style={{ background: "rgba(255,255,255,0.5)" }}
          />
        </div>

        {/* Header */}

        <div
          className="px-4 sm:px-5 py-4 flex items-center justify-between shrink-0 gap-2"
          style={{ background: C.blue, color: "white" }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "rgba(255,255,255,0.18)" }}
            >
              <Icons.box />
            </div>

            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">
                {supplier.name} — Purchase History
              </div>

              <div className="text-xs opacity-80 truncate">
                {year}
                {month
                  ? ` · ${monthNames?.full[month - 1] ?? ""}`
                  : " · Whole year"}
                {" · "}
                {summary.count} operation{summary.count === 1 ? "" : "s"}
                {" · "}
                {formatDZD(summary.total)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {onEdit && (
              <button
                className="p-2 rounded-md text-xs font-medium inline-flex items-center gap-1 active:opacity-70"
                onClick={onEdit}
                style={{
                  background: "rgba(255,255,255,0.18)",

                  color: "white",
                }}
                title="Edit supplier"
              >
                <Icons.pencil />
                <span className="hidden sm:inline">Edit supplier</span>
              </button>
            )}

            <button
              className="p-2 -m-1 rounded-md active:opacity-70"
              onClick={onClose}
              style={{ color: "white" }}
              aria-label="Close"
            >
              <Icons.x />
            </button>
          </div>
        </div>

        {topError && (
          <div
            className="px-5 py-3 flex items-center gap-2 text-sm shrink-0"
            style={{ background: C.red, color: "white" }}
          >
            <Icons.alert />

            <span className="flex-1">{topError}</span>

            <button
              onClick={() => setTopError(null)}
              style={{ color: "white" }}
              aria-label="Dismiss"
            >
              <Icons.x />
            </button>
          </div>
        )}

        {/* Year nav + month strip */}

        <div
          className="px-4 sm:px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 shrink-0"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-2 shrink-0">
            <button
              className="btn-ghost text-xs px-3 py-1.5 rounded-md active:opacity-70"
              onClick={goPrevYear}
            >
              ‹
            </button>

            <div className="text-sm font-semibold flex items-center gap-1.5">
              <Icons.calendar /> {year}
            </div>

            <button
              className="btn-ghost text-xs px-3 py-1.5 rounded-md active:opacity-70"
              onClick={goNextYear}
            >
              ›
            </button>

            <button
              className="text-xs px-2.5 py-1.5 rounded-md active:opacity-80"
              onClick={goThisYear}
              style={{
                background:
                  year === new Date().getFullYear()
                    ? C.blue
                    : "var(--surface-2)",

                color:
                  year === new Date().getFullYear() ? "white" : "var(--ink)",
              }}
            >
              This year
            </button>
          </div>

          {monthNames && (
            <div className="flex items-center gap-1 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap no-scrollbar">
              <button
                onClick={selectAllMonths}
                className="text-xs px-2.5 py-1.5 rounded-md shrink-0 active:opacity-80"
                style={{
                  background: month === null ? C.blue : "var(--surface-2)",

                  color: month === null ? "white" : "var(--ink)",
                }}
              >
                All
              </button>

              {monthNames.short.map((m, i) => {
                const idx = i + 1;

                return (
                  <button
                    key={idx}
                    onClick={() => selectMonth(idx)}
                    className="text-xs px-2.5 py-1.5 rounded-md shrink-0 active:opacity-80"
                    style={{
                      background: month === idx ? C.blue : "var(--surface-2)",

                      color: month === idx ? "white" : "var(--ink)",
                    }}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Body */}

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {loading && (
            <div
              className="text-sm text-center py-8"
              style={{ color: "var(--ink-muted)" }}
            >
              Loading purchases…
            </div>
          )}

          {error && !loading && (
            <div
              className="flex items-center justify-between gap-3 px-4 py-3 text-sm rounded-md"
              style={{ background: C.red, color: "white" }}
            >
              <span className="flex items-center gap-2">
                <Icons.alert /> {error}
              </span>

              <button
                className="text-xs underline"
                onClick={load}
                style={{ color: "white" }}
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && operations.length === 0 && (
            <div
              className="text-sm text-center py-8"
              style={{ color: "var(--ink-muted)" }}
            >
              No purchases recorded for this period.
            </div>
          )}

          {!loading &&
            !error &&
            operations.map((op) => {
              const isConfirming = confirmDeleteId === op.id;

              const isDeleting = deletingId === op.id;

              return (
                <div
                  key={op.id}
                  className="panel p-3 sm:p-4"
                  style={{ borderLeft: `3px solid ${C.blue}` }}
                >
                  {/* Operation header */}

                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3 mb-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="text-sm font-semibold">
                          {formatDate(op.date)}
                        </div>

                        {op.reference && (
                          <span
                            className="text-xs px-2 py-0.5 rounded"
                            style={{
                              background: "var(--surface-2)",
                              color: "var(--ink-muted)",
                            }}
                          >
                            {op.reference}
                          </span>
                        )}

                        <span
                          className="text-xs"
                          style={{ color: "var(--ink-muted)" }}
                        >
                          #{op.id}
                        </span>
                      </div>

                      {op.note && (
                        <div
                          className="text-xs mt-1 italic"
                          style={{ color: "var(--ink-muted)" }}
                        >
                          {op.note}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2 flex-wrap shrink-0">
                      <div
                        className="text-sm font-bold"
                        style={{ color: C.blue }}
                      >
                        {formatDZD(op.total)}
                      </div>

                      {!isConfirming ? (
                        <>
                          <button
                            className="p-2 rounded-md active:opacity-70"
                            onClick={() =>
                              setEditing({
                                ...op,

                                supplier_id: supplier.id,
                              })
                            }
                            disabled={isDeleting}
                            title="Edit purchase"
                            style={{ color: C.blue, background: "transparent" }}
                          >
                            <Icons.pencil />
                          </button>

                          <button
                            className="p-2 rounded-md active:opacity-70"
                            onClick={() => askDelete(op.id)}
                            disabled={isDeleting}
                            title="Delete purchase"
                            style={{ color: C.red, background: "transparent" }}
                          >
                            <Icons.trash />
                          </button>
                        </>
                      ) : (
                        <>
                          <span
                            className="text-xs"
                            style={{ color: "var(--ink-muted)" }}
                          >
                            Delete this purchase?
                          </span>

                          <button
                            className="px-2.5 py-1.5 rounded-md text-xs font-medium inline-flex items-center gap-1 active:opacity-80"
                            onClick={() => doDelete(op.id)}
                            disabled={isDeleting}
                            style={{ background: C.red, color: "white" }}
                          >
                            <Icons.check /> {isDeleting ? "…" : "Yes"}
                          </button>

                          <button
                            className="p-2 rounded-md active:opacity-70"
                            onClick={cancelDelete}
                            disabled={isDeleting}
                            title="Cancel"
                            style={{ color: "var(--ink-muted)" }}
                          >
                            <Icons.x />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Items table (read view) — tablet/desktop */}

                  {op.items && op.items.length > 0 && (
                    <div
                      className="hidden md:block rounded-md overflow-hidden"
                      style={{ border: "1px solid var(--border)" }}
                    >
                      <table className="w-full text-xs">
                        <thead style={{ background: "var(--surface-2)" }}>
                          <tr>
                            <th
                              className="text-left px-3 py-2 font-medium"
                              style={{ color: "var(--ink-muted)" }}
                            >
                              Material
                            </th>

                            <th
                              className="text-right px-3 py-2 font-medium"
                              style={{ color: "var(--ink-muted)" }}
                            >
                              Qty
                            </th>

                            <th
                              className="text-left px-3 py-2 font-medium"
                              style={{ color: "var(--ink-muted)" }}
                            >
                              Unit
                            </th>

                            <th
                              className="text-right px-3 py-2 font-medium"
                              style={{ color: "var(--ink-muted)" }}
                            >
                              Unit price
                            </th>

                            <th
                              className="text-right px-3 py-2 font-medium"
                              style={{ color: "var(--ink-muted)" }}
                            >
                              Line total
                            </th>

                            <th
                              className="px-3 py-2 w-8"
                              style={{ color: "var(--ink-muted)" }}
                            ></th>
                          </tr>
                        </thead>

                        <tbody>
                          {op.items.map((it) => {
                            const isItemConfirming =
                              itemConfirmDeleteId === it.id;

                            const isItemDeleting = itemDeletingId === it.id;

                            const materialLabel =
                              it.material_name ?? it.material ?? "—";

                            return (
                              <tr
                                key={it.id}
                                style={{ borderTop: "1px solid var(--border)" }}
                              >
                                <td className="px-3 py-2">{materialLabel}</td>

                                <td className="px-3 py-2 text-right">
                                  {Number(it.quantity ?? 0).toLocaleString(
                                    "en-US",
                                  )}
                                </td>

                                <td className="px-3 py-2">{it.unit}</td>

                                <td className="px-3 py-2 text-right">
                                  {formatDZD(it.unit_price)}
                                </td>

                                <td
                                  className="px-3 py-2 text-right font-medium"
                                  style={{ color: C.green }}
                                >
                                  {formatDZD(it.line_total)}
                                </td>

                                <td className="px-2 py-2 text-right">
                                  {!isItemConfirming ? (
                                    <button
                                      onClick={() => askDeleteItem(it.id)}
                                      disabled={isItemDeleting}
                                      title="Delete item"
                                      className="p-1 rounded-md"
                                      style={{
                                        color: C.red,
                                        background: "transparent",
                                      }}
                                    >
                                      <Icons.trash />
                                    </button>
                                  ) : (
                                    <div className="inline-flex items-center gap-1">
                                      <button
                                        className="px-1.5 py-0.5 rounded text-xs font-medium inline-flex items-center"
                                        onClick={() => doDeleteItem(it.id)}
                                        disabled={isItemDeleting}
                                        style={{
                                          background: C.red,
                                          color: "white",
                                        }}
                                        title="Confirm delete"
                                      >
                                        <Icons.check />
                                      </button>

                                      <button
                                        className="p-1 rounded-md"
                                        onClick={cancelDeleteItem}
                                        disabled={isItemDeleting}
                                        title="Cancel"
                                        style={{ color: "var(--ink-muted)" }}
                                      >
                                        <Icons.x />
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Items list (read view) — mobile */}

                  {op.items && op.items.length > 0 && (
                    <div
                      className="md:hidden rounded-md overflow-hidden"
                      style={{ border: "1px solid var(--border)" }}
                    >
                      {op.items.map((it, idx) => {
                        const isItemConfirming = itemConfirmDeleteId === it.id;
                        const isItemDeleting = itemDeletingId === it.id;
                        const materialLabel =
                          it.material_name ?? it.material ?? "—";

                        return (
                          <div
                            key={it.id}
                            className="px-3 py-2.5 flex items-center justify-between gap-2"
                            style={{
                              borderTop:
                                idx > 0 ? "1px solid var(--border)" : "none",
                              background:
                                idx % 2 === 1
                                  ? "var(--surface-2)"
                                  : "transparent",
                            }}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-medium truncate">
                                {materialLabel}
                              </div>
                              <div
                                className="text-[11px] mt-0.5"
                                style={{ color: "var(--ink-muted)" }}
                              >
                                {Number(it.quantity ?? 0).toLocaleString(
                                  "en-US",
                                )}{" "}
                                {it.unit} · {formatDZD(it.unit_price)}/unit
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <div
                                className="text-xs font-semibold"
                                style={{ color: C.green }}
                              >
                                {formatDZD(it.line_total)}
                              </div>

                              {!isItemConfirming ? (
                                <button
                                  onClick={() => askDeleteItem(it.id)}
                                  disabled={isItemDeleting}
                                  title="Delete item"
                                  className="p-2 rounded-md active:opacity-70"
                                  style={{
                                    color: C.red,
                                    background: "transparent",
                                  }}
                                >
                                  <Icons.trash />
                                </button>
                              ) : (
                                <div className="inline-flex items-center gap-1">
                                  <button
                                    className="px-2 py-1.5 rounded text-xs font-medium inline-flex items-center active:opacity-80"
                                    onClick={() => doDeleteItem(it.id)}
                                    disabled={isItemDeleting}
                                    style={{
                                      background: C.red,
                                      color: "white",
                                    }}
                                    title="Confirm delete"
                                  >
                                    <Icons.check />
                                  </button>

                                  <button
                                    className="p-2 rounded-md active:opacity-70"
                                    onClick={cancelDeleteItem}
                                    disabled={isItemDeleting}
                                    title="Cancel"
                                    style={{ color: "var(--ink-muted)" }}
                                  >
                                    <Icons.x />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* Nested edit-purchase modal */}

      {editing && (
        <EditPurchaseModal
          purchase={editing}
          suppliers={editingSuppliers}
          onClose={() => setEditing(null)}
          onSaved={onEditSaved}
        />
      )}
    </div>
  );
}
