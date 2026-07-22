"use client";

import { useState, useMemo, useEffect, useCallback } from "react";

import {
  fetchLedgerEntries,
  fetchLedgerReferenceData,
  createLedgerEntry,
  updateLedgerEntry,
  deleteLedgerEntry,
} from "../../lib/api_helpers/ledger";

/* ─── Reusable UI ─── */

const StageBadge = ({ stage, size = "sm", custom }) => {
  const map = {
    INCOME: { color: "#22c55e", label: "Income" },
    WORKER_PAYMENT: { color: "var(--accent)", label: "Worker" },
    MATERIAL_PURCHASE: { color: "#a855f7", label: "Material" },
    OTHER_EXPENSE: { color: "var(--stage-contract)", label: "Other" },
  };

  const s = custom || map[stage] || { color: "var(--ink-muted)", label: stage };

  return (
    <span
      className="badge"
      style={{
        background: `${s.color}15`,
        color: s.color,
        padding: size === "lg" ? "6px 14px" : undefined,
        fontSize: size === "lg" ? "13px" : undefined,
      }}
    >
      <span style={{ fontSize: size === "lg" ? 12 : 10 }}>●</span> {s.label}
    </span>
  );
};

/* ─── Icons ─── */

const Icons = {
  search: () => (
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
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  ),

  x: () => (
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
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  ),

  more: () => (
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
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
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

  edit: () => (
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
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  ),

  trash: () => (
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
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),

  arrowDown: () => (
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
      <path d="M12 5v14" />
      <path d="m19 12-7 7-7-7" />
    </svg>
  ),

  user: () => (
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
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),

  box: () => (
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
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  ),

  tag: () => (
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
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.6 2.6 0 0 0 3.678 0l5.426-5.426a2.6 2.6 0 0 0 0-3.678z" />
      <circle cx="7.5" cy="7.5" r=".5" />
    </svg>
  ),

  alert: () => (
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
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  ),

  trend: () => (
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
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  ),

  cal: () => (
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
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
    </svg>
  ),

  chevLeft: () => (
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
      <path d="m15 18-6-6 6-6" />
    </svg>
  ),

  chevRight: () => (
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
      <path d="m9 18 6-6-6-6" />
    </svg>
  ),

  printer: () => (
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
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect width="12" height="8" x="6" y="14" />
    </svg>
  ),

  wallet: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
    </svg>
  ),
};

/* ─── Type config ─── */

const TYPE_META = {
  INCOME: {
    color: "#22c55e",
    label: "Income",
    icon: Icons.trend,
    sign: "+",
  },
  WORKER_PAYMENT: {
    color: "var(--accent)",
    label: "Worker Payment",
    icon: Icons.user,
    sign: "-",
  },
  MATERIAL_PURCHASE: {
    color: "#a855f7",
    label: "Material Purchase",
    icon: Icons.box,
    sign: "-",
  },
  OTHER_EXPENSE: {
    color: "var(--stage-contract)",
    label: "Other Expense",
    icon: Icons.tag,
    sign: "-",
  },
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/* ─── Reference data (static) ─── */

const UNITS = ["m²", "sheet", "pc", "m", "roll", "can", "pair", "kg", "L"];

const MATERIAL_CATEGORIES = [
  "Wood",
  "Veneer",
  "Hardware",
  "Stone",
  "Electrical",
  "Adhesive",
  "Finish",
  "Other",
];

/* ─── Modal ─── */

const Modal = ({ title, onClose, children, footer, maxWidth = 720 }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{ background: "rgba(0,0,0,0.55)" }}
    onClick={onClose}
  >
    <div
      className="w-full rounded-xl shadow-2xl flex flex-col max-h-[92vh]"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        maxWidth,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="flex items-center justify-between p-4 shrink-0"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <h2 className="text-base font-semibold">{title}</h2>

        <button onClick={onClose} className="btn-ghost p-1" aria-label="Close">
          <Icons.x />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">{children}</div>

      {footer && (
        <div
          className="flex items-center justify-end gap-2 p-4 shrink-0"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          {footer}
        </div>
      )}
    </div>
  </div>
);

const Field = ({ label, children, hint, required }) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-xs font-medium" style={{ color: "var(--ink-muted)" }}>
      {label}
      {required && <span style={{ color: "var(--stage-contract)" }}> *</span>}
    </span>

    {children}

    {hint && (
      <span className="text-[11px]" style={{ color: "var(--ink-muted)" }}>
        {hint}
      </span>
    )}
  </label>
);

const inputStyle = {
  background: "var(--bg)",
  border: "1px solid var(--border)",
  color: "var(--ink)",
};

const formatDZD = (n) => `${(n || 0).toLocaleString()} DZD`;

const getAmount = (e) => {
  if (typeof e.amount === "number") return e.amount;

  if (e.type === "MATERIAL_PURCHASE") {
    return (e.items || []).reduce(
      (s, i) =>
        s + (parseFloat(i.quantity) || 0) * (parseFloat(i.unitPrice) || 0),
      0,
    );
  }

  return 0;
};

const describeEntry = (e) => {
  switch (e.type) {
    case "INCOME":
      return { main: e.reference || "Income", sub: e.note || "" };

    case "WORKER_PAYMENT":
      return {
        main: `Payment to ${e.worker || "—"}`,
        sub: e.note || "",
      };

    case "MATERIAL_PURCHASE": {
      const count = (e.items || []).length;
      const preview = (e.items || [])
        .slice(0, 2)
        .map((i) => `${i.quantity}${i.unit} ${i.materialName || i.material}`)
        .join(", ");
      const more = count > 2 ? ` +${count - 2} more` : "";

      return {
        main: `${count} item${count > 1 ? "s" : ""} from ${e.supplier || "—"}`,
        sub: preview + more,
      };
    }

    case "OTHER_EXPENSE":
      return { main: e.otherCategory || e.category || "—", sub: e.note || "" };

    default:
      return { main: "", sub: "" };
  }
};

// Map the API entry shape → form shape. The form still uses `material` for
// line items and `category` for OTHER_EXPENSE; the API uses `materialName`
// / `otherCategory`.
const formFromEntry = (entry) => {
  if (entry.type === "INCOME")
    return {
      date: entry.date,
      amount: String(entry.amount),
      reference: entry.reference || "",
      note: entry.note || "",
    };

  if (entry.type === "WORKER_PAYMENT")
    return {
      date: entry.date,
      amount: String(entry.amount),
      worker: entry.worker || "",
      note: entry.note || "",
    };

  if (entry.type === "MATERIAL_PURCHASE") {
    return {
      date: entry.date,
      supplier: entry.supplier || "",
      reference: entry.reference || "",
      note: entry.note || "",
      items: (entry.items || []).map((it, i) => ({
        id: i + 1,
        material: it.materialName || "",
        quantity: it.quantity,
        unit: it.unit,
        unitPrice: it.unitPrice,
      })),
    };
  }

  if (entry.type === "OTHER_EXPENSE") {
    return {
      date: entry.date,
      amount: String(entry.amount),
      category: entry.otherCategory || entry.category || "",
      note: entry.note || "",
    };
  }
};

const emptyFormForType = (type, refs) => {
  const today = new Date().toISOString().slice(0, 10);
  const firstWorker = refs.workers[0]?.full_name ?? "";
  const firstSupplier = refs.suppliers[0]?.name ?? "";

  if (type === "INCOME")
    return { date: today, amount: "", reference: "", note: "" };

  if (type === "WORKER_PAYMENT")
    return {
      date: today,
      amount: "",
      worker: firstWorker,
      note: "",
    };

  if (type === "MATERIAL_PURCHASE")
    return {
      date: today,
      supplier: firstSupplier,
      reference: "",
      note: "",
      items: [{ id: 1, material: "", quantity: 1, unit: "m²", unitPrice: 0 }],
    };

  if (type === "OTHER_EXPENSE")
    return { date: today, amount: "", category: "", note: "" };
};

const getWeekRange = (refDate = new Date()) => {
  const d = new Date(refDate);
  const day = d.getDay();
  const start = new Date(d);
  start.setDate(d.getDate() - day);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

/* ─── Main ─── */

export default function LedgerClient() {
  // ── Data state ──
  const [entries, setEntries] = useState([]);
  const [workers, setWorkers] = useState([]); // [{id, full_name}]
  const [suppliers, setSuppliers] = useState([]); // [{id, name}]
  const [materialCatalog, setMaterialCatalog] = useState([]); // [{id, name, category_id, default_unit}]
  const [otherCategories, setOtherCategories] = useState([]); // [{id, name}]

  // ── UI state ──
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [outcomeFilter, setOutcomeFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newType, setNewType] = useState("WORKER_PAYMENT");
  const [form, setForm] = useState({});
  const [formError, setFormError] = useState("");
  const [showNewMaterial, setShowNewMaterial] = useState(false);
  const [newMaterialForm, setNewMaterialForm] = useState({
    name: "",
    category: "Wood",
    unit: "m²",
  });

  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  /* ─── Load on mount ─── */

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [entriesRes, refs] = await Promise.all([
        fetchLedgerEntries({ pageSize: 500 }),
        fetchLedgerReferenceData(),
      ]);

      setEntries(entriesRes.data || []);
      setWorkers(refs.workers || []);
      setSuppliers(refs.suppliers || []);
      setMaterialCatalog(refs.materialCatalog || []);
      setOtherCategories(refs.otherCategories || []);
    } catch (err) {
      console.error("[LedgerClient] loadData:", err);
      setError(err.message || "Failed to load ledger data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* ─── Lookup helpers (name → id) for save payload ─── */

  const refs = useMemo(
    () => ({ workers, suppliers, materialCatalog, otherCategories }),
    [workers, suppliers, materialCatalog, otherCategories],
  );

  const workerIdByName = useMemo(
    () => new Map(workers.map((w) => [w.full_name, w.id])),
    [workers],
  );

  const supplierIdByName = useMemo(
    () => new Map(suppliers.map((s) => [s.name, s.id])),
    [suppliers],
  );

  const otherCatIdByName = useMemo(
    () => new Map(otherCategories.map((c) => [c.name, c.id])),
    [otherCategories],
  );

  const materialIdByName = useMemo(
    () => new Map(materialCatalog.map((m) => [m.name, m.id])),
    [materialCatalog],
  );

  const workerNameToId = (n) => workerIdByName.get(n) ?? null;
  const supplierNameToId = (n) => supplierIdByName.get(n) ?? null;
  const otherCatNameToId = (n) => otherCatIdByName.get(n) ?? null;
  const materialNameToId = (n) => materialIdByName.get(n) ?? null;

  /* ─── Totals (sum of ALL 3 outcomes, no income) ─── */

  const totals = useMemo(() => {
    const income = entries
      .filter((e) => e.type === "INCOME")
      .reduce((s, e) => s + getAmount(e), 0);

    const workers = entries
      .filter((e) => e.type === "WORKER_PAYMENT")
      .reduce((s, e) => s + getAmount(e), 0);

    const materials = entries
      .filter((e) => e.type === "MATERIAL_PURCHASE")
      .reduce((s, e) => s + getAmount(e), 0);

    const other = entries
      .filter((e) => e.type === "OTHER_EXPENSE")
      .reduce((s, e) => s + getAmount(e), 0);

    const total = workers + materials + other; // total spent, unchanged meaning

    return { income, workers, materials, other, total, net: income - total };
  }, [entries]);

  /* ─── Month entries (for the cards + table) ─── */

  const monthEntries = useMemo(() => {
    return entries.filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === viewMonth && d.getFullYear() === viewYear;
    });
  }, [entries, viewMonth, viewYear]);

  const monthTotals = useMemo(() => {
    const income = monthEntries
      .filter((e) => e.type === "INCOME")
      .reduce((s, e) => s + getAmount(e), 0);

    const workers = monthEntries
      .filter((e) => e.type === "WORKER_PAYMENT")
      .reduce((s, e) => s + getAmount(e), 0);

    const materials = monthEntries
      .filter((e) => e.type === "MATERIAL_PURCHASE")
      .reduce((s, e) => s + getAmount(e), 0);

    const other = monthEntries
      .filter((e) => e.type === "OTHER_EXPENSE")
      .reduce((s, e) => s + getAmount(e), 0);

    const total = workers + materials + other;

    return { income, workers, materials, other, total, net: income - total };
  }, [monthEntries]);

  /* ─── Filtered list — all 3 outcomes are expenses, no income to hide ─── */

  const filtered = useMemo(() => {
    return monthEntries
      .filter((e) => {
        if (outcomeFilter !== "ALL") {
          if (outcomeFilter === "INCOME" && e.type !== "INCOME") return false;
          if (outcomeFilter === "WORKER" && e.type !== "WORKER_PAYMENT")
            return false;
          if (outcomeFilter === "MATERIAL" && e.type !== "MATERIAL_PURCHASE")
            return false;
          if (outcomeFilter === "OTHER" && e.type !== "OTHER_EXPENSE")
            return false;
        }

        const itemText = (e.items || [])
          .map(
            (i) => `${i.materialName || ""} ${i.quantity || ""}${i.unit || ""}`,
          )
          .join(" ");

        const haystack =
          `${e.id} ${e.note || ""} ${e.worker || ""} ${e.supplier || ""} ${e.otherCategory || e.category || ""} ${e.reference || ""} ${itemText}`.toLowerCase();

        return haystack.includes(search.toLowerCase());
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [monthEntries, outcomeFilter, search]);

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };

  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  const goPrevYear = () => setViewYear((y) => y - 1);
  const goNextYear = () => setViewYear((y) => y + 1);

  const goToday = () => {
    setViewMonth(today.getMonth());
    setViewYear(today.getFullYear());
  };

  /* ─── Print weekly report — only the 3 outcomes now (no income section) ─── */

  const handlePrintWeekly = () => {
    const { start, end } = getWeekRange(today);

    const weekEntries = entries.filter((e) => {
      const d = new Date(e.date);
      return d >= start && d <= end;
    });

    const outcomes = weekEntries.sort((a, b) => a.date.localeCompare(b.date));

    const sum = (arr) => arr.reduce((s, e) => s + getAmount(e), 0);

    const workers = sum(outcomes.filter((e) => e.type === "WORKER_PAYMENT"));
    const materials = sum(
      outcomes.filter((e) => e.type === "MATERIAL_PURCHASE"),
    );
    const other = sum(outcomes.filter((e) => e.type === "OTHER_EXPENSE"));
    const totalOut = sum(outcomes);

    const fmtRange = `${start.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })} – ${end.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`;

    const outcomeRows = outcomes.length
      ? outcomes
          .map((e) => {
            const meta = TYPE_META[e.type];
            const desc = describeEntry(e);
            return `<tr>
            <td>${e.date}</td>
            <td><span class="badge" style="background:${meta.color}15;color:${meta.color}">${meta.label}</span></td>
            <td>${desc.main}${desc.sub ? `<div class="sub">${desc.sub}</div>` : ""}</td>
            <td style="text-align:right;font-weight:600;color:${meta.color}">${meta.sign}${getAmount(e).toLocaleString()} DZD</td>
          </tr>`;
          })
          .join("")
      : `<tr><td colspan="4" class="empty">No outcomes recorded this week.</td></tr>`;

    const w = window.open("", "_blank", "width=900,height=800");
    if (!w) return;

    w.document
      .write(`<!doctype html><html><head><meta charset="utf-8"><title>Weekly Report</title>
      <style>
        * { box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 32px; color: #111; margin: 0; }
        h1 { margin: 0 0 4px; font-size: 22px; }
        h2 { margin: 24px 0 8px; font-size: 14px; text-transform: uppercase; letter-spacing: .06em; padding-bottom: 6px; border-bottom: 2px solid; }
        h2.out { color: #dc2626; border-color: #dc2626; }
        .sub { color: #666; font-size: 13px; margin-bottom: 16px; }
        .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 16px 0 8px; }
        .card { border: 1px solid #e5e5e5; border-radius: 8px; padding: 12px; }
        .card .lbl { font-size: 11px; text-transform: uppercase; color: #888; letter-spacing: .04em; }
        .card .val { font-size: 17px; font-weight: 700; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 13px; }
        th, td { padding: 9px 8px; border-bottom: 1px solid #eee; text-align: left; vertical-align: top; }
        th { background: #f7f7f7; font-size: 11px; text-transform: uppercase; letter-spacing: .04em; color: #666; font-weight: 600; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
        .sub { color: #888; font-size: 11px; margin-top: 2px; }
        .empty { text-align: center; color: #999; padding: 18px; font-style: italic; }
        .subtotal td { background: #fafafa; font-weight: 600; }
        .grand td { font-weight: 700; border-top: 2px solid #111; border-bottom: none; padding-top: 12px; }
        .footer { margin-top: 24px; display: flex; justify-content: space-between; font-size: 12px; color: #666; padding-top: 12px; border-top: 1px solid #eee; }
        .no-print { margin-bottom: 16px; }
        .no-print button { padding: 8px 16px; background: #111; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; }
        @media print { body { padding: 16px; } .no-print { display: none; } }
      </style></head><body>
      <h1>Weekly Outcome Report</h1>
      <div class="sub">${fmtRange}</div>
      <div class="no-print"><button onclick="window.print()">🖨 Print</button></div>

      <div class="summary">
        <div class="card"><div class="lbl">Workers</div><div class="val" style="color:${TYPE_META.WORKER_PAYMENT.color}">-${workers.toLocaleString()} DZD</div></div>
        <div class="card"><div class="lbl">Materials</div><div class="val" style="color:${TYPE_META.MATERIAL_PURCHASE.color}">-${materials.toLocaleString()} DZD</div></div>
        <div class="card"><div class="lbl">Other</div><div class="val" style="color:${TYPE_META.OTHER_EXPENSE.color}">-${other.toLocaleString()} DZD</div></div>
        <div class="card"><div class="lbl">Total Out</div><div class="val" style="color:#dc2626">-${totalOut.toLocaleString()} DZD</div></div>
      </div>

      <h2 class="out">▼ Outcomes (${outcomes.length})</h2>
      <table>
        <thead><tr><th style="width:90px">Date</th><th style="width:140px">Category</th><th>Description</th><th style="width:130px;text-align:right">Amount</th></tr></thead>
        <tbody>
          ${outcomeRows}
          <tr class="subtotal"><td colspan="3" style="text-align:right">Workers</td><td style="text-align:right;color:${TYPE_META.WORKER_PAYMENT.color}">-${workers.toLocaleString()} DZD</td></tr>
          <tr class="subtotal"><td colspan="3" style="text-align:right">Materials</td><td style="text-align:right;color:${TYPE_META.MATERIAL_PURCHASE.color}">-${materials.toLocaleString()} DZD</td></tr>
          <tr class="subtotal"><td colspan="3" style="text-align:right">Other</td><td style="text-align:right;color:${TYPE_META.OTHER_EXPENSE.color}">-${other.toLocaleString()} DZD</td></tr>
          <tr class="grand"><td colspan="3" style="text-align:right">Total Outflows</td><td style="text-align:right">-${totalOut.toLocaleString()} DZD</td></tr>
        </tbody>
      </table>

      <div class="footer">
        <span>Printed on ${today.toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}</span>
        <span>Workshop Ledger · Weekly Report</span>
      </div>
      </body></html>`);

    w.document.close();
    setTimeout(() => w.print(), 250);
  };

  /* ─── Modal open/close ─── */

  const openCreate = (type) => {
    setEditingId(null);
    setNewType(type);
    setForm(emptyFormForType(type, refs));
    setFormError("");
    setShowNewMaterial(false);
    setShowModal(true);
  };

  const openEdit = (entry) => {
    setEditingId(entry.id);
    setNewType(entry.type);
    setForm(formFromEntry(entry));
    setFormError("");
    setShowNewMaterial(false);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormError("");
    setShowNewMaterial(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this entry? This cannot be undone.")) return;

    try {
      await deleteLedgerEntry(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
      if (editingId === id) closeModal();
    } catch (err) {
      setError(err.message || "Failed to delete entry");
    }
  };

  const updateItem = (id, patch) =>
    setForm((f) => ({
      ...f,
      items: f.items.map((i) => (i.id === id ? { ...i, ...patch } : i)),
    }));

  const addItem = () =>
    setForm((f) => ({
      ...f,
      items: [
        ...(f.items || []),
        { id: Date.now(), material: "", quantity: 1, unit: "m²", unitPrice: 0 },
      ],
    }));

  const removeItem = (id) =>
    setForm((f) => ({ ...f, items: f.items.filter((i) => i.id !== id) }));

  // Adding a new material here only updates local state for the datalist.
  // To persist, you'd POST to a /api/ledger/material-catalog endpoint (not built yet).
  const handleAddMaterial = () => {
    const name = newMaterialForm.name.trim();
    if (!name) return;

    if (!materialCatalog.find((m) => m.name === name)) {
      setMaterialCatalog((prev) => [
        ...prev,
        { id: 0, name, category_id: null, default_unit: newMaterialForm.unit },
      ]);
    }

    setNewMaterialForm({ name: "", category: "Wood", unit: "m²" });
    setShowNewMaterial(false);

    const emptyLine = (form.items || []).find((i) => !i.material);
    if (emptyLine)
      updateItem(emptyLine.id, { material: name, unit: newMaterialForm.unit });
  };

  /* ─── Save (create or update) ─── */

  const handleSave = async () => {
    if (!form.date) return setFormError("Date is required");

    setFormError("");
    setSaving(true);

    try {
      let payload;

      if (newType === "WORKER_PAYMENT") {
        const amt = parseFloat(form.amount);
        if (!amt || amt <= 0) throw new Error("Amount must be greater than 0");
        if (!form.worker) throw new Error("Worker is required");

        const workerId = workerNameToId(form.worker);
        if (!workerId)
          throw new Error(`Worker "${form.worker}" not found in database`);

        payload = {
          type: "WORKER_PAYMENT",
          date: form.date,
          amount: amt,
          workerId,
          note: form.note?.trim() || null,
        };
      } else if (newType === "MATERIAL_PURCHASE") {
        const items = (form.items || []).filter(
          (i) => i.material && i.quantity > 0,
        );

        if (items.length === 0)
          throw new Error("Add at least one material line");
        if (!form.supplier) throw new Error("Supplier is required");

        const supplierId = supplierNameToId(form.supplier);
        if (!supplierId)
          throw new Error(`Supplier "${form.supplier}" not found in database`);

        const total = items.reduce(
          (s, i) =>
            s + (parseFloat(i.quantity) || 0) * (parseFloat(i.unitPrice) || 0),
          0,
        );

        payload = {
          type: "MATERIAL_PURCHASE",
          date: form.date,
          supplierId,
          reference: form.reference?.trim() || null,
          note: form.note?.trim() || null,
          amount: total,
          items: items.map((it) => ({
            materialId: materialNameToId(it.material) || null,
            materialName: it.material,
            quantity: parseFloat(it.quantity),
            unit: it.unit,
            unitPrice: parseFloat(it.unitPrice),
          })),
        };
      } else if (newType === "OTHER_EXPENSE") {
        const amt = parseFloat(form.amount);
        if (!amt || amt <= 0) throw new Error("Amount must be greater than 0");
        if (!form.category?.trim()) throw new Error("Category is required");
        if (!form.note?.trim()) throw new Error("Note is required");

        const catId = otherCatNameToId(form.category.trim());
        if (!catId)
          throw new Error(
            `Category "${form.category}" not found — pick from the existing list`,
          );

        payload = {
          type: "OTHER_EXPENSE",
          date: form.date,
          amount: amt,
          otherCategoryId: catId,
          note: form.note.trim(),
        };
      } else if (newType === "INCOME") {
        const amt = parseFloat(form.amount);
        if (!amt || amt <= 0) throw new Error("Amount must be greater than 0");

        payload = {
          type: "INCOME",
          date: form.date,
          amount: amt,
          reference: form.reference?.trim() || null,
          note: form.note?.trim() || null,
        };
      }

      let saved;

      if (editingId) {
        saved = await updateLedgerEntry(editingId, payload);
        setEntries((prev) => prev.map((e) => (e.id === editingId ? saved : e)));
      } else {
        saved = await createLedgerEntry(payload);
        setEntries((prev) => [saved, ...prev]);
      }

      closeModal();
    } catch (err) {
      console.error("[LedgerClient] save:", err);
      setFormError(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const matTotal = (form.items || []).reduce(
    (s, i) =>
      s + (parseFloat(i.quantity) || 0) * (parseFloat(i.unitPrice) || 0),
    0,
  );

  const isCurrentMonth =
    viewMonth === today.getMonth() && viewYear === today.getFullYear();

  /* ─── Loading / error states ─── */

  if (loading) {
    return (
      <div
        className="flex flex-col items-center justify-center h-full gap-2"
        style={{ color: "var(--ink-muted)" }}
      >
        <Icons.trend />
        <p className="text-sm">Loading ledger data…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 p-4">
        <div
          className="flex items-center gap-2 text-sm"
          style={{ color: "var(--stage-contract)" }}
        >
          <Icons.alert /> {error}
        </div>
        <button onClick={loadData} className="btn-primary text-xs px-3 py-1.5">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* ─── BUDGET BANNER — five cards in one row ─── */}

      <div
        className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 p-3 shrink-0"
        style={{
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <BreakdownCard
          label="Current Sold"
          value={monthTotals.net}
          color={monthTotals.net >= 0 ? "#22c55e" : "var(--stage-contract)"}
          icon={Icons.wallet}
          onClick={() => openCreate("INCOME")}
          highlight
        />

        <BreakdownCard
          label="Income"
          value={monthTotals.income}
          color="#22c55e"
          icon={Icons.trend}
          onClick={() => openCreate("INCOME")}
        />

        <BreakdownCard
          label="Workers"
          value={monthTotals.workers}
          color="var(--accent)"
          icon={Icons.user}
          onClick={() => openCreate("WORKER_PAYMENT")}
        />

        <BreakdownCard
          label="Materials"
          value={monthTotals.materials}
          color="#a855f7"
          icon={Icons.box}
          onClick={() => openCreate("MATERIAL_PURCHASE")}
        />

        <BreakdownCard
          label="Other"
          value={monthTotals.other}
          color="var(--stage-contract)"
          icon={Icons.tag}
          onClick={() => openCreate("OTHER_EXPENSE")}
        />
      </div>
      {/* ─── Month/Year navigation + filters ─── */}

      <div
        className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 shrink-0 flex-wrap"
        style={{
          borderBottom: "1px solid var(--border)",
          background: "var(--surface)",
        }}
      >
        <div
          className="flex items-center gap-1 p-1 rounded-lg shrink-0"
          style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
        >
          <button
            onClick={goPrevYear}
            className="btn-ghost p-1.5"
            title="Previous year"
          >
            <Icons.chevLeft />
            <Icons.chevLeft />
          </button>
          <button
            onClick={goPrevMonth}
            className="btn-ghost p-1.5"
            title="Previous month"
          >
            <Icons.chevLeft />
          </button>

          <div
            className="flex items-center gap-2 px-3 py-1 rounded-md text-sm font-semibold tabular-nums min-w-[150px] justify-center"
            style={{ background: "var(--surface-2)", color: "var(--ink)" }}
          >
            <Icons.cal />
            {MONTHS[viewMonth]} {viewYear}
          </div>

          <button
            onClick={goNextMonth}
            className="btn-ghost p-1.5"
            title="Next month"
          >
            <Icons.chevRight />
          </button>
          <button
            onClick={goNextYear}
            className="btn-ghost p-1.5"
            title="Next year"
          >
            <Icons.chevRight />
            <Icons.chevRight />
          </button>
        </div>

        {!isCurrentMonth && (
          <button
            onClick={goToday}
            className="text-xs px-2.5 py-1.5 rounded-md font-medium"
            style={{
              background: "var(--bg)",
              border: "1px solid var(--border)",
              color: "var(--ink-muted)",
            }}
          >
            Today
          </button>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          {[
            { id: "ALL", label: "All" },
            { id: "INCOME", label: "Income", color: "#22c55e" },
            { id: "WORKER", label: "Workers", color: "var(--accent)" },
            { id: "MATERIAL", label: "Materials", color: "#a855f7" },
            { id: "OTHER", label: "Other", color: "var(--stage-contract)" },
          ].map((c) => {
            const active = outcomeFilter === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setOutcomeFilter(c.id)}
                className="text-xs font-medium px-2.5 py-1.5 rounded-md flex items-center gap-1.5 transition-colors"
                style={{
                  background: active
                    ? `${c.color || "var(--ink-muted)"}15`
                    : "transparent",
                  color: active ? c.color : "var(--ink-muted)",
                  border: `1px solid ${active ? `${c.color || "var(--ink-muted)"}40` : "transparent"}`,
                }}
              >
                {c.color && (
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: c.color }}
                  />
                )}
                {c.label}
              </button>
            );
          })}
        </div>

        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-md focus-ring flex-1 min-w-[180px]"
          style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
        >
          <Icons.search />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search outcomes..."
            className="bg-transparent text-sm outline-none w-full placeholder:text-[var(--ink-muted)]"
            style={{ color: "var(--ink)" }}
          />
          {search && (
            <button onClick={() => setSearch("")} className="btn-ghost p-0.5">
              <Icons.x />
            </button>
          )}
        </div>

        <button
          onClick={handlePrintWeekly}
          className="text-xs px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5"
          style={{
            background: "var(--bg)",
            border: "1px solid var(--border)",
            color: "var(--ink)",
          }}
          title="Print this week's expense report"
        >
          <Icons.printer /> Print Weekly Report
        </button>

        <button
          onClick={() => openCreate("WORKER_PAYMENT")}
          className="btn-primary text-xs px-3 py-1.5"
        >
          <Icons.plus /> New Entry
        </button>
      </div>

      {/* ─── Entries table ─── */}

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-sm" style={{ minWidth: 720 }}>
          <thead
            className="sticky top-0 z-10"
            style={{ background: "var(--surface-2)" }}
          >
            <tr>
              <th
                className="px-4 py-3 text-xs font-medium"
                style={{ color: "var(--ink-muted)" }}
              >
                Date
              </th>
              <th
                className="px-4 py-3 text-xs font-medium"
                style={{ color: "var(--ink-muted)" }}
              >
                Type
              </th>
              <th
                className="px-4 py-3 text-xs font-medium"
                style={{ color: "var(--ink-muted)" }}
              >
                Description
              </th>
              <th
                className="px-4 py-3 text-xs font-medium hidden md:table-cell"
                style={{ color: "var(--ink-muted)" }}
              >
                Reference
              </th>
              <th
                className="px-4 py-3 text-xs font-medium text-right"
                style={{ color: "var(--ink-muted)" }}
              >
                Amount
              </th>
              <th
                className="px-4 py-3 text-xs font-medium text-center"
                style={{ color: "var(--ink-muted)" }}
              >
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((e) => {
              const meta = TYPE_META[e.type];
              const desc = describeEntry(e);
              const Icon = meta.icon;

              return (
                <tr
                  key={`${e.type}-${e.id}`}
                  className="transition-colors group"
                  style={{ borderTop: "1px solid var(--border)" }}
                >
                  <td
                    className="px-4 py-3 text-xs whitespace-nowrap"
                    style={{ color: "var(--ink-muted)" }}
                  >
                    <div className="flex items-center gap-1.5">
                      <Icons.cal />
                      {e.date}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{
                          background: `${meta.color}15`,
                          color: meta.color,
                        }}
                      >
                        <Icon />
                      </span>
                      <StageBadge stage={e.type} />
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="font-medium text-sm">{desc.main}</div>
                    {desc.sub && (
                      <div
                        className="text-xs mt-0.5"
                        style={{ color: "var(--ink-muted)" }}
                      >
                        {desc.sub}
                      </div>
                    )}
                  </td>

                  <td
                    className="px-4 py-3 text-xs hidden md:table-cell"
                    style={{ color: "var(--ink-muted)" }}
                  >
                    {e.reference || "—"}
                  </td>

                  <td
                    className="px-4 py-3 text-right font-bold tabular-nums whitespace-nowrap"
                    style={{ color: meta.color }}
                  >
                    {meta.sign}
                    {getAmount(e).toLocaleString()}
                    <span
                      className="text-xs font-normal ml-1"
                      style={{ color: "var(--ink-muted)" }}
                    >
                      DZD
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(e)}
                        className="btn-ghost p-1.5"
                        title="Edit entry"
                      >
                        <Icons.edit />
                      </button>
                      <button
                        onClick={() => handleDelete(e.id)}
                        className="btn-ghost p-1.5 hover:text-[var(--stage-contract)]"
                        title="Delete entry"
                      >
                        <Icons.trash />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-16 text-center"
                  style={{ color: "var(--ink-muted)" }}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Icons.trend />
                    <p className="text-sm">
                      No outcomes in {MONTHS[viewMonth]} {viewYear}.
                    </p>
                    <button
                      onClick={() => openCreate("WORKER_PAYMENT")}
                      className="btn-primary text-xs mt-2"
                    >
                      <Icons.plus /> Add First Outcome
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {filtered.length > 0 && (
              <tr
                style={{
                  background: "var(--surface-2)",
                  borderTop: "2px solid var(--border)",
                }}
              >
                <td
                  colSpan={4}
                  className="px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "var(--ink-muted)" }}
                >
                  {MONTHS[viewMonth]} total spent
                </td>

                <td
                  className="px-4 py-3 text-right font-bold tabular-nums whitespace-nowrap"
                  style={{ color: "var(--ink)" }}
                >
                  {monthTotals.total.toLocaleString()}{" "}
                  <span
                    className="text-xs font-normal ml-1"
                    style={{ color: "var(--ink-muted)" }}
                  >
                    DZD
                  </span>
                </td>

                <td />
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ─── Modal ─── */}

      {showModal && (
        <Modal
          title={editingId ? "Edit Entry" : "New Ledger Entry"}
          onClose={closeModal}
          footer={
            <>
              {editingId && (
                <button
                  onClick={() => {
                    handleDelete(editingId);
                    closeModal();
                  }}
                  className="btn-ghost px-3 text-sm mr-auto"
                  style={{ color: "var(--stage-contract)" }}
                >
                  <Icons.trash /> Delete
                </button>
              )}

              <button
                onClick={closeModal}
                disabled={saving}
                className="btn-ghost px-4 text-sm"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary px-4 text-sm"
              >
                {saving ? (
                  "Saving…"
                ) : editingId ? (
                  <>
                    <Icons.edit /> Save Changes
                  </>
                ) : (
                  <>
                    <Icons.plus /> Add Entry
                  </>
                )}
              </button>
            </>
          }
        >
          <div
            className="flex items-center p-1 rounded-lg shrink-0 mx-4 mt-4"
            style={{
              background: "var(--bg)",
              border: "1px solid var(--border)",
            }}
          >
            {Object.entries(TYPE_META).map(([key, meta]) => {
              const Icon = meta.icon;
              const active = newType === key;
              const shortLabel = {
                INCOME: "Income",
                WORKER_PAYMENT: "Worker",
                MATERIAL_PURCHASE: "Material",
                OTHER_EXPENSE: "Other",
              }[key];

              return (
                <button
                  key={key}
                  onClick={() => {
                    if (editingId) return;
                    setNewType(key);
                    setForm(emptyFormForType(key, refs));
                    setFormError("");
                    setShowNewMaterial(false);
                  }}
                  className="flex-1 min-w-0 text-[11px] sm:text-xs font-medium px-1.5 sm:px-3 py-1.5 sm:py-2 rounded-md flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap transition-colors"
                  style={{
                    background: active ? "var(--surface)" : "transparent",
                    color: active ? meta.color : "var(--ink-muted)",
                    border: active
                      ? `1px solid ${meta.color}30`
                      : "1px solid transparent",
                    opacity: editingId && !active ? 0.4 : 1,
                    cursor: editingId ? "default" : "pointer",
                  }}
                  disabled={!!editingId}
                  title={editingId ? "Type cannot be changed when editing" : ""}
                >
                  <Icon /> {shortLabel}
                </button>
              );
            })}
          </div>

          <div className="p-5">
            {newType === "INCOME" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Amount" required>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={form.amount || ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, amount: e.target.value }))
                      }
                      placeholder="0"
                      className="w-full pl-3 pr-12 py-2 rounded-md text-sm outline-none focus-ring tabular-nums"
                      style={inputStyle}
                    />
                    <span
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                      style={{ color: "var(--ink-muted)" }}
                    >
                      DZD
                    </span>
                  </div>
                </Field>

                <Field label="Date" required>
                  <input
                    type="date"
                    value={form.date || ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, date: e.target.value }))
                    }
                    className="px-3 py-2 rounded-md text-sm outline-none focus-ring w-full"
                    style={inputStyle}
                  />
                </Field>

                <Field
                  label="Reference"
                  hint="Optional — invoice #, client, order ref..."
                >
                  <input
                    value={form.reference || ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, reference: e.target.value }))
                    }
                    placeholder="INV-2026-014"
                    className="px-3 py-2 rounded-md text-sm outline-none focus-ring w-full"
                    style={inputStyle}
                  />
                </Field>

                <div className="sm:col-span-2">
                  <Field label="Note" hint="Optional">
                    <input
                      value={form.note || ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, note: e.target.value }))
                      }
                      placeholder="Final payment / deposit / ..."
                      className="px-3 py-2 rounded-md text-sm outline-none focus-ring w-full"
                      style={inputStyle}
                    />
                  </Field>
                </div>
              </div>
            )}
            {newType === "WORKER_PAYMENT" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Worker" required>
                  <select
                    value={form.worker || ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, worker: e.target.value }))
                    }
                    className="px-3 py-2 rounded-md text-sm outline-none focus-ring w-full"
                    style={inputStyle}
                  >
                    {workers.length === 0 && (
                      <option value="">(no workers loaded)</option>
                    )}
                    {workers.map((w) => (
                      <option key={w.id} value={w.full_name}>
                        {w.full_name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Amount" required>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={form.amount || ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, amount: e.target.value }))
                      }
                      placeholder="0"
                      className="w-full pl-3 pr-12 py-2 rounded-md text-sm outline-none focus-ring tabular-nums"
                      style={inputStyle}
                    />
                    <span
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                      style={{ color: "var(--ink-muted)" }}
                    >
                      DZD
                    </span>
                  </div>
                </Field>

                <Field label="Date" required>
                  <input
                    type="date"
                    value={form.date || ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, date: e.target.value }))
                    }
                    className="px-3 py-2 rounded-md text-sm outline-none focus-ring w-full"
                    style={inputStyle}
                  />
                </Field>

                <div />

                <div className="sm:col-span-2">
                  <Field
                    label="Note"
                    hint="Optional — e.g. bi-weekly wage, advance, bonus"
                  >
                    <input
                      value={form.note || ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, note: e.target.value }))
                      }
                      placeholder="Bi-weekly wage / advance / bonus..."
                      className="px-3 py-2 rounded-md text-sm outline-none focus-ring w-full"
                      style={inputStyle}
                    />
                  </Field>
                </div>
              </div>
            )}

            {newType === "MATERIAL_PURCHASE" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Field label="Supplier" required>
                    <select
                      value={form.supplier || ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, supplier: e.target.value }))
                      }
                      className="px-3 py-2 rounded-md text-sm outline-none focus-ring w-full"
                      style={inputStyle}
                    >
                      {suppliers.length === 0 && (
                        <option value="">(no suppliers loaded)</option>
                      )}
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Date" required>
                    <input
                      type="date"
                      value={form.date || ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, date: e.target.value }))
                      }
                      className="px-3 py-2 rounded-md text-sm outline-none focus-ring w-full"
                      style={inputStyle}
                    />
                  </Field>

                  <Field label="Reference" hint="Supplier invoice / receipt #">
                    <input
                      value={form.reference || ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, reference: e.target.value }))
                      }
                      placeholder="FAC-2026-0200"
                      className="px-3 py-2 rounded-md text-sm outline-none focus-ring w-full"
                      style={inputStyle}
                    />
                  </Field>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4
                      className="text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "var(--ink-muted)" }}
                    >
                      Items purchased
                    </h4>
                    <span
                      className="text-xs"
                      style={{ color: "var(--ink-muted)" }}
                    >
                      {(form.items || []).length} line
                      {(form.items || []).length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div
                    className="hidden sm:grid grid-cols-12 gap-2 px-2 mb-1 text-[10px] font-medium uppercase tracking-wider"
                    style={{ color: "var(--ink-muted)" }}
                  >
                    <div className="col-span-5">Material</div>
                    <div className="col-span-2 text-right">Qty</div>
                    <div className="col-span-2">Unit</div>
                    <div className="col-span-2 text-right">Unit Price</div>
                    <div className="col-span-1"></div>
                  </div>

                  <div className="space-y-2">
                    {(form.items || []).map((it) => {
                      const lineTotal =
                        (parseFloat(it.quantity) || 0) *
                        (parseFloat(it.unitPrice) || 0);

                      return (
                        <div
                          key={it.id}
                          className="grid grid-cols-12 gap-2 items-center p-2 rounded-lg"
                          style={{
                            background: "var(--bg)",
                            border: "1px solid var(--border)",
                          }}
                        >
                          <div className="col-span-12 sm:col-span-5">
                            <input
                              list={`materials-${it.id}`}
                              value={it.material}
                              onChange={(e) =>
                                updateItem(it.id, { material: e.target.value })
                              }
                              placeholder="Material name..."
                              className="w-full px-2.5 py-1.5 rounded text-sm outline-none focus-ring"
                              style={inputStyle}
                            />
                            <datalist id={`materials-${it.id}`}>
                              {materialCatalog.map((m) => (
                                <option key={m.id} value={m.name} />
                              ))}
                            </datalist>
                          </div>

                          <div className="col-span-4 sm:col-span-2">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={it.quantity}
                              onChange={(e) =>
                                updateItem(it.id, { quantity: e.target.value })
                              }
                              className="w-full px-2.5 py-1.5 rounded text-sm outline-none focus-ring tabular-nums text-right"
                              style={inputStyle}
                            />
                          </div>

                          <div className="col-span-4 sm:col-span-2">
                            <select
                              value={it.unit}
                              onChange={(e) =>
                                updateItem(it.id, { unit: e.target.value })
                              }
                              className="w-full px-2 py-1.5 rounded text-sm outline-none focus-ring"
                              style={inputStyle}
                            >
                              {UNITS.map((u) => (
                                <option key={u}>{u}</option>
                              ))}
                            </select>
                          </div>

                          <div className="col-span-3 sm:col-span-2">
                            <input
                              type="number"
                              min="0"
                              value={it.unitPrice}
                              onChange={(e) =>
                                updateItem(it.id, { unitPrice: e.target.value })
                              }
                              className="w-full px-2.5 py-1.5 rounded text-sm outline-none focus-ring tabular-nums text-right"
                              style={inputStyle}
                            />
                          </div>

                          <div className="col-span-1 flex items-center justify-end gap-1">
                            <span
                              className="text-xs font-bold tabular-nums hidden sm:inline"
                              style={{
                                color: TYPE_META.MATERIAL_PURCHASE.color,
                              }}
                            >
                              {lineTotal > 0 ? lineTotal.toLocaleString() : "—"}
                            </span>
                            {(form.items || []).length > 1 && (
                              <button
                                onClick={() => removeItem(it.id)}
                                className="btn-ghost p-1 hover:text-[var(--stage-contract)]"
                                title="Remove line"
                              >
                                <Icons.trash />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={addItem}
                      className="btn-ghost text-xs px-3 py-1.5 border"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <Icons.plus /> Add Item
                    </button>

                    <button
                      onClick={() => setShowNewMaterial((s) => !s)}
                      className="text-xs px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5"
                      style={{
                        background: "#a855f715",
                        color: "#a855f7",
                        border: "1px solid #a855f740",
                      }}
                    >
                      <Icons.plus /> New Material
                    </button>
                  </div>

                  {showNewMaterial && (
                    <div
                      className="mt-3 p-3 rounded-lg space-y-2"
                      style={{
                        background: "#a855f708",
                        border: "1px solid #a855f730",
                      }}
                    >
                      <div
                        className="text-xs font-semibold uppercase tracking-wider"
                        style={{ color: "#a855f7" }}
                      >
                        Add new material to catalog
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          autoFocus
                          value={newMaterialForm.name}
                          onChange={(e) =>
                            setNewMaterialForm((f) => ({
                              ...f,
                              name: e.target.value,
                            }))
                          }
                          placeholder="e.g. Walnut Plank 25mm"
                          className="px-2.5 py-1.5 rounded text-sm outline-none focus-ring w-full"
                          style={inputStyle}
                        />

                        <select
                          value={newMaterialForm.category}
                          onChange={(e) =>
                            setNewMaterialForm((f) => ({
                              ...f,
                              category: e.target.value,
                            }))
                          }
                          className="px-2.5 py-1.5 rounded text-sm outline-none focus-ring"
                          style={inputStyle}
                        >
                          {MATERIAL_CATEGORIES.map((c) => (
                            <option key={c}>{c}</option>
                          ))}
                        </select>

                        <select
                          value={newMaterialForm.unit}
                          onChange={(e) =>
                            setNewMaterialForm((f) => ({
                              ...f,
                              unit: e.target.value,
                            }))
                          }
                          className="px-2.5 py-1.5 rounded text-sm outline-none focus-ring"
                          style={inputStyle}
                        >
                          {UNITS.map((u) => (
                            <option key={u}>{u}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setShowNewMaterial(false);
                            setNewMaterialForm({
                              name: "",
                              category: "Wood",
                              unit: "m²",
                            });
                          }}
                          className="btn-ghost text-xs px-3 py-1"
                        >
                          Cancel
                        </button>

                        <button
                          onClick={handleAddMaterial}
                          className="btn-primary text-xs px-3 py-1"
                        >
                          <Icons.plus /> Save Material
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div
                  className="p-4 rounded-lg flex items-center justify-between"
                  style={{
                    background: `${TYPE_META.MATERIAL_PURCHASE.color}10`,
                    border: `1px solid ${TYPE_META.MATERIAL_PURCHASE.color}30`,
                  }}
                >
                  <div>
                    <div
                      className="text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "var(--ink-muted)" }}
                    >
                      Purchase Total
                    </div>
                    <div
                      className="text-xs mt-0.5"
                      style={{ color: "var(--ink-muted)" }}
                    >
                      {(form.items || []).filter((i) => i.material).length}{" "}
                      valid line
                      {(form.items || []).filter((i) => i.material).length !== 1
                        ? "s"
                        : ""}
                    </div>
                  </div>

                  <div
                    className="text-2xl font-bold tabular-nums"
                    style={{ color: TYPE_META.MATERIAL_PURCHASE.color }}
                  >
                    {formatDZD(matTotal)}
                  </div>
                </div>

                <Field label="Note" hint="Optional">
                  <input
                    value={form.note || ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, note: e.target.value }))
                    }
                    placeholder="Restock / urgent order / ..."
                    className="px-3 py-2 rounded-md text-sm outline-none focus-ring w-full"
                    style={inputStyle}
                  />
                </Field>
              </div>
            )}

            {newType === "OTHER_EXPENSE" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Amount" required>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={form.amount || ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, amount: e.target.value }))
                      }
                      placeholder="0"
                      className="w-full pl-3 pr-12 py-2 rounded-md text-sm outline-none focus-ring tabular-nums"
                      style={inputStyle}
                    />
                    <span
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                      style={{ color: "var(--ink-muted)" }}
                    >
                      DZD
                    </span>
                  </div>
                </Field>

                <Field label="Date" required>
                  <input
                    type="date"
                    value={form.date || ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, date: e.target.value }))
                    }
                    className="px-3 py-2 rounded-md text-sm outline-none focus-ring w-full"
                    style={inputStyle}
                  />
                </Field>

                <Field
                  label="Category"
                  required
                  hint="Pick from existing categories"
                >
                  <input
                    list="other-categories-list"
                    value={form.category || ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, category: e.target.value }))
                    }
                    placeholder="Rent, Utilities, ..."
                    className="px-3 py-2 rounded-md text-sm outline-none focus-ring w-full"
                    style={inputStyle}
                  />
                  <datalist id="other-categories-list">
                    {otherCategories.map((c) => (
                      <option key={c.id} value={c.name} />
                    ))}
                  </datalist>
                </Field>

                <div />

                <div className="sm:col-span-2">
                  <Field
                    label="Note"
                    required
                    hint="What was this expense for?"
                  >
                    <input
                      value={form.note || ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, note: e.target.value }))
                      }
                      placeholder="Workshop rent — July"
                      className="px-3 py-2 rounded-md text-sm outline-none focus-ring w-full"
                      style={inputStyle}
                    />
                  </Field>
                </div>
              </div>
            )}

            {formError && (
              <div
                className="mt-4 px-3 py-2 rounded-md text-xs flex items-center gap-2"
                style={{
                  background: "var(--stage-contract)15",
                  color: "var(--stage-contract)",
                  border: "1px solid var(--stage-contract)40",
                }}
              >
                <Icons.alert /> {formError}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ─── Small UI helpers ─── */

const BreakdownCard = ({
  label,
  value,
  color,
  icon: Icon,
  onClick,
  highlight,
}) => (
  <button
    onClick={onClick}
    className="p-3 sm:p-4 rounded-xl text-left transition-colors panel-hover flex items-center gap-3"
    style={{
      background: highlight ? `${color}10` : "var(--bg)",
      border: `1px solid ${color}${highlight ? "50" : "30"}`,
    }}
  >
    <div
      className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0"
      style={{ background: `${color}15`, color }}
    >
      <Icon />
    </div>

    <div className="min-w-0 flex-1">
      <div
        className="text-[10px] sm:text-xs whitespace-nowrap"
        style={{ color: "var(--ink-muted)" }}
      >
        {label}
      </div>
      <div
        className="text-sm sm:text-base font-bold tabular-nums truncate"
        style={{ color }}
      >
        {formatDZD(value)}
      </div>
    </div>
  </button>
);
