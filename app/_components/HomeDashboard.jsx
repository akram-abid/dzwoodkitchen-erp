"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// ─── API helpers (same imports as the source pages) ───────────
import {
  getAllMaterialsClient,
  createMaterialClient,
  adjustStockClient,
} from "../../lib/api_helpers/materials";
import {
  getSuppliers,
  createSupplierClient,
} from "../../lib/api_helpers/supplier";
import {
  fetchOrders,
  createOrderClient,
  patchOrderClient,
} from "../api/orders/orders";
import { createPaymentClient } from "../api/payments/payments";
import { fetchWorkers } from "../api/workers/workers";
import { batchUpdateAttendance } from "../../lib/api_helpers/workers";
import {
  fetchLedgerEntries,
  createLedgerEntry,
  fetchLedgerReferenceData,
} from "../../lib/api_helpers/ledger";
import { getSupplierPurchasesClient } from "../../lib/api_helpers/supplier";

/* ────────────────────────────────────────────────────────────────
   GLOBAL STYLES — local classes only; design tokens are inherited
   from the app shell (--accent, --surface, --panel, .btn-primary, etc.)
   ──────────────────────────────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    .kpi-card { transition: transform .15s ease, border-color .15s ease; }
    .kpi-card:hover { transform: translateY(-1px); border-color: var(--accent) !important; }
    .ring-pulse::before {
      content: ''; position: absolute; inset: -3px; border-radius: 9999px;
      border: 2px solid currentColor; opacity: .35; animation: ringPulse 1.8s ease-out infinite;
    }
    @keyframes ringPulse {
      0%   { transform: scale(.9); opacity: .55; }
      100% { transform: scale(1.6); opacity: 0;   }
    }
    .bar-fill, .line-path, .donut-arc { transition: all .6s cubic-bezier(.2,.7,.2,1); }
    .check-row:hover { background: var(--surface-2); }
    .scroll-x { overflow-x: auto; -ms-overflow-style: none; scrollbar-width: none; }
    .scroll-x::-webkit-scrollbar { display: none; }

    /* popover */
    .popover {
      position: absolute; z-index: 50;
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 10px; box-shadow: 0 12px 30px rgba(0,0,0,.45);
      padding: 4px; min-width: 200px;
      animation: popIn .12s ease-out;
    }
    @keyframes popIn { from { opacity: 0; transform: translateY(-4px) scale(.98); } to { opacity: 1; transform: none; } }
    .popover-item { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 6px; cursor: pointer; font-size: 12px; color: var(--ink); }
    .popover-item:hover { background: var(--surface-2); }
    .popover-item.selected { background: var(--accent-soft); color: var(--accent); }
    .popover-item.danger { color: var(--stage-contract); }
    .popover-item.danger:hover { background: rgba(239,68,68,0.12); }

    /* modal */
    .modal-backdrop { position: fixed; inset: 0; z-index: 100; background: rgba(0,0,0,.6); backdrop-filter: blur(4px); animation: fadeIn .15s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .modal {
      position: fixed; top: 50%; left: 50%; z-index: 101;
      transform: translate(-50%, -50%);
      width: min(520px, calc(100vw - 32px));
      max-height: calc(100vh - 64px); overflow: auto;
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 14px; box-shadow: 0 24px 60px rgba(0,0,0,.6);
      animation: modalIn .18s ease-out;
    }
    @keyframes modalIn { from { opacity: 0; transform: translate(-50%, -48%) scale(.96); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }

    /* compact form — mirrors the style of the source pages' forms */
    .f-input, .f-select, .f-textarea {
      width: 100%; padding: 9px 12px; border-radius: 8px;
      background: var(--surface-2); border: 1px solid var(--border);
      color: var(--ink); font-size: 13px; font-family: inherit;
      transition: border-color .15s ease;
    }
    .f-input:focus, .f-select:focus, .f-textarea:focus { outline: none; border-color: var(--accent); }
    .f-label { display: block; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .04em; color: var(--ink-muted); margin-bottom: 6px; }
    .f-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .f-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
    .f-err { color: var(--stage-contract); font-size: 11px; margin-top: 6px; }
    .f-hint { color: var(--ink-muted); font-size: 11px; margin-top: 6px; }

    /* toast */
    .toast-stack { position: fixed; bottom: 24px; right: 24px; z-index: 200; display: flex; flex-direction: column; gap: 8px; pointer-events: none; }
    .toast {
      pointer-events: auto;
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 10px; padding: 10px 14px;
      display: flex; align-items: center; gap: 10px;
      font-size: 13px; min-width: 260px; max-width: 380px;
      box-shadow: 0 8px 24px rgba(0,0,0,.4);
      animation: toastIn .2s ease-out;
    }
    @keyframes toastIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: none; } }
    .toast.success { border-left: 3px solid var(--stage-completed); }
    .toast.error   { border-left: 3px solid var(--stage-contract); }
    .toast.info    { border-left: 3px solid var(--stage-appointment); }

    /* loading skeleton */
    .skeleton { background: linear-gradient(90deg, var(--surface-2) 25%, var(--surface) 50%, var(--surface-2) 75%); background-size: 200% 100%; animation: shimmer 1.4s ease-in-out infinite; border-radius: 6px; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

    /* chart bits */
    .chart-grid line { stroke: var(--border); stroke-dasharray: 2 4; }
    .chart-axis text { fill: var(--ink-muted); font-size: 10px; }
    .chart-line { fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
    .chart-area { opacity: .15; }
    .chart-dot { transition: r .15s ease; }
    .chart-bar { transition: width .5s cubic-bezier(.2,.7,.2,1); }
    .chart-legend { display: flex; gap: 12px; font-size: 11px; color: var(--ink-muted); }
    .chart-legend-dot { display: inline-block; width: 8px; height: 8px; border-radius: 2px; margin-right: 5px; vertical-align: middle; }
  `}</style>
);

/* ─── Stage / status / role constants (copied from source) ─── */
const STAGE_MAP = {
  APPOINTMENT: { color: "var(--stage-appointment)", label: "Appointment" },
  CONTRACT: { color: "var(--stage-contract)", label: "Contract" },
  IN_PRODUCTION: { color: "var(--stage-production)", label: "In Production" },
  READY_TO_DELIVER: { color: "var(--stage-ready)", label: "Ready" },
  COMPLETED: { color: "var(--stage-completed)", label: "Completed" },
};
const STAGE_ORDER = [
  "APPOINTMENT",
  "CONTRACT",
  "IN_PRODUCTION",
  "READY_TO_DELIVER",
  "COMPLETED",
];

const ATTENDANCE_OPTIONS = [
  { value: "PRESENT", label: "Present", dot: "●" },
  { value: "ABSENT", label: "Absent", dot: "○" },
];
const cycleAttendance = (current) => {
  if (current === "PRESENT") return "ABSENT";
  if (current === "ABSENT") return undefined; // clear -> "Not set"
  return "PRESENT";
};
const LEDGER_TYPES = [
  { value: "INCOME", label: "Income", color: "#22c55e" },
  { value: "WORKER_PAYMENT", label: "Worker payment", color: "var(--accent)" },
  { value: "MATERIAL_PURCHASE", label: "Material purchase", color: "#a855f7" },
  {
    value: "OTHER_EXPENSE",
    label: "Other expense",
    color: "var(--stage-contract)",
  },
];
const WORKER_ROLES = [
  "Carpenter",
  "Finisher",
  "Helper",
  "CNC Op.",
  "Upholsterer",
  "Apprentice",
  "Designer",
  "Installer",
];
const MATERIAL_UNITS = [
  "sheet",
  "m",
  "m²",
  "m³",
  "kg",
  "liter",
  "pcs",
  "box",
  "roll",
];

/* ─── Reusable badges ─── */
const StageBadge = ({ stage, onClick }) => {
  const s = STAGE_MAP[stage] || {
    color: "var(--ink-muted)",
    label: stage || "—",
  };
  return (
    <span
      className="badge"
      onClick={onClick}
      style={{
        background: `${s.color}15`,
        color: s.color,
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <span style={{ fontSize: 10 }}>●</span> {s.label}
      {onClick && <span style={{ marginLeft: 2, opacity: 0.6 }}>▾</span>}
    </span>
  );
};
const AttendanceBadge = ({ status, onCycle }) => {
  const map = {
    PRESENT: { color: "#16a34a", label: "Present" },
    ABSENT: { color: "#dc2626", label: "Absent" },
  };
  const s = map[status] || { color: "var(--ink-muted)", label: "Not Set" };
  return (
    <button
      onClick={onCycle}
      className="text-[11px] font-bold px-2.5 py-1 rounded-lg"
      style={{ background: s.color, color: "#fff", opacity: status ? 1 : 0.55 }}
    >
      {s.label}
    </button>
  );
};

/* ─── Icons ─── */
const Icons = {
  workers: () => (
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
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="17" x2="22" y1="8" y2="13" />
      <line x1="22" x2="17" y1="8" y2="13" />
    </svg>
  ),
  cog: () => (
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
      <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
      <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
      <path d="M12 2v2" />
      <path d="M12 22v-2" />
      <path d="m17 20.66-1-1.73" />
      <path d="M11 10.27 7 3.34" />
      <path d="m20.66 17-1.73-1" />
      <path d="m3.34 7 1.73 1" />
      <path d="m14 12h8" />
      <path d="M2 12h2" />
      <path d="m20.66 7-1.73 1" />
      <path d="m3.34 17 1.73-1" />
      <path d="m17 3.34-1 1.73" />
      <path d="m11 13.73-4 6.93" />
    </svg>
  ),
  orders: () => (
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
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  ),
  ledger: () => (
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
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
    </svg>
  ),
  chart: () => (
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
      <line x1="12" x2="12" y1="20" y2="10" />
      <line x1="18" x2="18" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="16" />
    </svg>
  ),
  truck: () => (
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
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <path d="M15 18H9" />
      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
      <circle cx="17" cy="18" r="2" />
      <circle cx="7" cy="18" r="2" />
    </svg>
  ),
  package: () => (
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
  clock: () => (
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
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  calendar: () => (
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
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
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
  check: () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
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
  arrowUp: () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="18 15 12 9 6 15" />
    </svg>
  ),
  chevron: () => (
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
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  money: () => (
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
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
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
  refresh: () => (
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
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10" />
      <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14" />
    </svg>
  ),
  trash: () => (
    <svg
      width="12"
      height="12"
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
  arrowRight: () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="5" x2="19" y1="12" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  logIn: () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" x2="3" y1="12" y2="12" />
    </svg>
  ),
  logOut: () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  ),
};

/* ─── helpers ─── */
const fmtDZD = (n) => `${(n || 0).toLocaleString("en-US")} DZD`;
const fmtDZDCompact = (n) => {
  if (!n && n !== 0) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M DZD`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k DZD`;
  return `${n} DZD`;
};
const todayLabel = () =>
  new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
const todayISO = () => new Date().toISOString().slice(0, 10);
const currentYM = () => {
  const d = new Date();
  return { month: d.getMonth(), year: d.getFullYear() };
};
const thisMonthKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};
const initials = (name) =>
  (name || "?")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
const safe = (v, fb = []) => (Array.isArray(v) ? v : fb);

/* DB `order_state` enum <-> UI stage constant (mirrors OrdersClient.jsx —
   these don't map 1:1 via simple case conversion, e.g. READY_TO_DELIVER vs
   ready_to_delivery) */
const DB_STATE_TO_STAGE = {
  appointment: "APPOINTMENT",
  contract: "CONTRACT",
  in_production: "IN_PRODUCTION",
  ready_to_delivery: "READY_TO_DELIVER",
  completed: "COMPLETED",
};
const dbStateToStage = (state) =>
  DB_STATE_TO_STAGE[state] ?? (state || "appointment").toUpperCase();

/* The orders/workers/ledger endpoints all return raw DB-shaped records
   wrapped in { data: [...] }. This turns one raw order row into the flat
   shape this dashboard's UI expects (same mapping as normalizeOrder in
   OrdersClient.jsx) so stage/amount/dueDate/client/payments actually populate. */
const normalizeOrderLite = (o) => {
  const payments = safe(o.payments).map((p) => ({
    id: p.id,
    date: p.payment_date ? String(p.payment_date).slice(0, 10) : "",
    amount: Number(p.amount) || 0,
    note: p.note ?? "",
  }));
  const paid = payments.reduce((s, p) => s + p.amount, 0);
  return {
    id: o.id,
    client: o.clients?.full_name ?? o.client ?? "",
    stage: o.state ? dbStateToStage(o.state) : o.stage || "APPOINTMENT",
    amount: Number(o.total_amount ?? o.amount) || 0,
    paid,
    dueDate: o.due_date ? String(o.due_date).slice(0, 10) : o.dueDate || "",
    createdAt: o.created_at
      ? String(o.created_at).slice(0, 10)
      : o.createdAt || "",
    payments,
  };
};

/* ════════════════════════════════════════════════════════════════
   CHART COMPONENTS (pure inline SVG, no deps)
   ════════════════════════════════════════════════════════════════ */
const LineChart = ({ data, width = 700, height = 200 }) => {
  if (!data || data.length === 0) return null;
  const pad = { top: 16, right: 12, bottom: 24, left: 44 };
  const w = width - pad.left - pad.right;
  const h = height - pad.top - pad.bottom;
  const max = Math.max(
    1,
    Math.ceil(
      Math.max(...data.flatMap((d) => [d.income, d.expenses])) / 100_000,
    ) * 100_000,
  );
  const step = data.length > 1 ? w / (data.length - 1) : w;
  const yAt = (v) => h - (v / max) * h;
  const xAt = (i) => i * step;
  const linePath = (key) =>
    data
      .map((d, i) => `${i === 0 ? "M" : "L"} ${xAt(i)} ${yAt(d[key])}`)
      .join(" ");
  const areaPath = (key) => {
    const top = data
      .map((d, i) => `${i === 0 ? "M" : "L"} ${xAt(i)} ${yAt(d[key])}`)
      .join(" ");
    return `${top} L ${xAt(data.length - 1)} ${h} L ${xAt(0)} ${h} Z`;
  };
  const yTicks = 4;
  const ticks = Array.from({ length: yTicks + 1 }, (_, i) =>
    Math.round((max / yTicks) * i),
  );

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      preserveAspectRatio="none"
      style={{ display: "block" }}
    >
      <g transform={`translate(${pad.left},${pad.top})`}>
        <g className="chart-grid">
          {ticks.map((t, i) => (
            <line key={i} x1="0" x2={w} y1={yAt(t)} y2={yAt(t)} />
          ))}
        </g>
        <g className="chart-axis">
          {ticks.map((t, i) => (
            <text key={i} x="-8" y={yAt(t) + 3} textAnchor="end">
              {t >= 1000 ? `${Math.round(t / 1000)}k` : t}
            </text>
          ))}
          {data.map((d, i) => (
            <text key={i} x={xAt(i)} y={h + 16} textAnchor="middle">
              {d.label}
            </text>
          ))}
        </g>
        <path
          className="chart-area line-path"
          d={areaPath("income")}
          fill="#22c55e"
        />
        <path
          className="chart-area line-path"
          d={areaPath("expenses")}
          fill="#f59e0b"
        />
        <path
          className="chart-line line-path"
          d={linePath("income")}
          stroke="#22c55e"
        />
        <path
          className="chart-line line-path"
          d={linePath("expenses")}
          stroke="#f59e0b"
        />
        {data.map((d, i) => (
          <g key={i}>
            <circle
              className="chart-dot"
              cx={xAt(i)}
              cy={yAt(d.income)}
              r="3"
              fill="#22c55e"
            />
            <circle
              className="chart-dot"
              cx={xAt(i)}
              cy={yAt(d.expenses)}
              r="3"
              fill="#f59e0b"
            />
          </g>
        ))}
      </g>
    </svg>
  );
};

const PipelineChart = ({ counts, width = 320, height = 180 }) => {
  if (!counts || counts.length === 0) return null;
  const total = counts.reduce((s, c) => s + c.value, 0) || 1;
  const rowH = 24,
    gap = 8,
    labelW = 110,
    valueW = 36;
  const barMaxW = width - labelW - valueW - 8;
  const maxV = Math.max(1, ...counts.map((x) => x.value));

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      style={{ display: "block" }}
    >
      {counts.map((c, i) => {
        const y = i * (rowH + gap);
        const w = (c.value / maxV) * barMaxW;
        return (
          <g key={c.key} transform={`translate(0, ${y})`}>
            <text
              x="0"
              y={rowH / 2 + 4}
              className="chart-axis"
              style={{ fill: "var(--ink)" }}
            >
              {c.label}
            </text>
            <rect
              x={labelW}
              y="4"
              width={barMaxW}
              height={rowH - 8}
              rx="4"
              fill="var(--surface-2)"
            />
            <rect
              className="chart-bar"
              x={labelW}
              y="4"
              width={Math.max(w, 4)}
              height={rowH - 8}
              rx="4"
              fill={c.color}
            />
            <text
              x={width - 4}
              y={rowH / 2 + 4}
              textAnchor="end"
              className="chart-axis"
              style={{ fill: "var(--ink)", fontWeight: 600 }}
            >
              {c.value}
            </text>
          </g>
        );
      })}
      <text x="0" y={counts.length * (rowH + gap) + 12} className="chart-axis">
        {total} total this month
      </text>
    </svg>
  );
};

const DonutChart = ({ data, size = 140, thickness = 22 }) => {
  if (!data || data.length === 0) return null;
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const cx = size / 2,
    cy = size / 2;
  const r = (size - thickness) / 2;
  let cumulative = 0;
  const polar = (a) => ({
    x: cx + r * Math.cos(((a - 90) * Math.PI) / 180),
    y: cy + r * Math.sin(((a - 90) * Math.PI) / 180),
  });
  const arc = (start, end) => {
    const s = polar(end),
      e = polar(start);
    const large = end - start > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y}`;
  };
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      style={{ display: "block" }}
    >
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="var(--surface-2)"
        strokeWidth={thickness}
      />
      {data.map((d, i) => {
        const start = (cumulative / total) * 360;
        cumulative += d.value;
        const end = (cumulative / total) * 360;
        if (end - start <= 0) return null;
        return (
          <path
            key={i}
            className="donut-arc"
            d={arc(start, end)}
            fill="none"
            stroke={d.color}
            strokeWidth={thickness}
          />
        );
      })}
      <text
        x={cx}
        y={cy - 4}
        textAnchor="middle"
        style={{ fill: "var(--ink)", fontSize: 14, fontWeight: 700 }}
      >
        {fmtDZDCompact(total)}
      </text>
      <text
        x={cx}
        y={cy + 12}
        textAnchor="middle"
        style={{ fill: "var(--ink-muted)", fontSize: 10 }}
      >
        Expenses
      </text>
    </svg>
  );
};

/* ════════════════════════════════════════════════════════════════
   POPOVER / MODAL / TOAST
   ════════════════════════════════════════════════════════════════ */
const Popover = ({ open, onClose, children, align = "right" }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (!ref.current?.contains(e.target)) onClose();
    };
    const onKey = (e) => e.key === "Escape" && onClose();
    setTimeout(() => document.addEventListener("mousedown", onDoc), 0);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      ref={ref}
      className="popover"
      style={{ top: "calc(100% + 6px)", [align]: 0 }}
    >
      {children}
    </div>
  );
};

const Modal = ({ open, onClose, title, children, footer }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal">
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <h3 className="text-base font-semibold">{title}</h3>
          <button className="btn-ghost" onClick={onClose} aria-label="Close">
            <Icons.x />
          </button>
        </div>
        <div className="p-5">{children}</div>
        {footer && (
          <div
            className="flex items-center justify-end gap-2 px-5 py-3"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            {footer}
          </div>
        )}
      </div>
    </>
  );
};

const ToastStack = ({ toasts, onDismiss }) => (
  <div className="toast-stack">
    {toasts.map((t) => (
      <div
        key={t.id}
        className={`toast ${t.type}`}
        onClick={() => onDismiss(t.id)}
      >
        <span
          style={{
            color:
              t.type === "success"
                ? "var(--stage-completed)"
                : t.type === "error"
                  ? "var(--stage-contract)"
                  : "var(--stage-appointment)",
          }}
        >
          {t.type === "success" ? (
            <Icons.check />
          ) : t.type === "error" ? (
            <Icons.x />
          ) : (
            <Icons.alert />
          )}
        </span>
        <span className="flex-1">{t.message}</span>
        <Icons.x />
      </div>
    ))}
  </div>
);
const useToasts = () => {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      3200,
    );
  }, []);
  const dismiss = useCallback(
    (id) => setToasts((prev) => prev.filter((t) => t.id !== id)),
    [],
  );
  return { toasts, push, dismiss };
};

/* ════════════════════════════════════════════════════════════════
   COMPACT FORMS — payload shape copied from source pages,
   but only the "util" fields shown in the popover
   ════════════════════════════════════════════════════════════════ */

/* New Order — payload shape from c772f4f7 (order page) */
const NewOrderForm = ({ onSubmit, onCancel, existingWorkers = [] }) => {
  const [client, setClient] = useState("");
  const [project, setProject] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState(todayISO());
  const [worker, setWorker] = useState("Unassigned");
  const [err, setErr] = useState("");
  const submit = () => {
    if (!client.trim()) return setErr("Client is required");
    onSubmit({
      client: client.trim(),
      project: project.trim(),
      amount: Number(amount) || 0,
      dueDate,
      worker,
      stage: "APPOINTMENT",
    });
  };
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="space-y-3"
    >
      <div>
        <label className="f-label">Client *</label>
        <input
          className="f-input"
          autoFocus
          placeholder="e.g. M. Belkacem"
          value={client}
          onChange={(e) => setClient(e.target.value)}
        />
      </div>
      <div>
        <label className="f-label">Project</label>
        <input
          className="f-input"
          placeholder="e.g. Cuisine Villa Hydra"
          value={project}
          onChange={(e) => setProject(e.target.value)}
        />
      </div>
      <div className="f-row">
        <div>
          <label className="f-label">Amount (DZD)</label>
          <input
            className="f-input"
            type="number"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div>
          <label className="f-label">Delivery</label>
          <input
            className="f-input"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="f-label">Worker</label>
        <select
          className="f-select"
          value={worker}
          onChange={(e) => setWorker(e.target.value)}
        >
          <option>Unassigned</option>
          {existingWorkers.map((w) => (
            <option key={w.id} value={w.full_name || w.shortName || w.name}>
              {w.full_name || w.shortName || w.name}
            </option>
          ))}
        </select>
        <div className="f-hint">
          Add items, payments, and technical details from the order page.
        </div>
      </div>
      {err && <div className="f-err">{err}</div>}
      <div className="flex gap-2 justify-end pt-2">
        <button type="button" onClick={onCancel} className="btn-ghost text-xs">
          Cancel
        </button>
        <button type="submit" className="btn-primary text-xs">
          <Icons.check /> Create Order
        </button>
      </div>
    </form>
  );
};

/* New Material — payload shape from d9978c6e (materials page), only util fields */
const NewMaterialForm = ({ onSubmit, onCancel, suppliers = [] }) => {
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("sheet");
  const [minStock, setMinStock] = useState(1);
  const [maxStock, setMaxStock] = useState(10);
  const [supplierId, setSupplierId] = useState("");
  const [err, setErr] = useState("");
  const submit = () => {
    if (!name.trim()) return setErr("Name is required");
    if (Number(minStock) >= Number(maxStock))
      return setErr("Min stock must be less than max stock");
    onSubmit({
      name: name.trim(),
      unit,
      stock: 0,
      minStock: Number(minStock),
      maxStock: Number(maxStock),
      supplierId: supplierId ? Number(supplierId) : null,
      categoryId: null,
      price: 0,
      location: null,
    });
  };
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="space-y-3"
    >
      <div>
        <label className="f-label">Material Name *</label>
        <input
          className="f-input"
          autoFocus
          placeholder="e.g. MDF Panel 18mm"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="f-row-3">
        <div>
          <label className="f-label">Unit</label>
          <select
            className="f-select"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
          >
            {MATERIAL_UNITS.map((u) => (
              <option key={u}>{u}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="f-label">Min stock</label>
          <input
            className="f-input"
            type="number"
            min="0"
            value={minStock}
            onChange={(e) => setMinStock(e.target.value)}
          />
        </div>
        <div>
          <label className="f-label">Max stock</label>
          <input
            className="f-input"
            type="number"
            min="1"
            value={maxStock}
            onChange={(e) => setMaxStock(e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="f-label">Supplier (optional)</label>
        <select
          className="f-select"
          value={supplierId}
          onChange={(e) => setSupplierId(e.target.value)}
        >
          <option value="">— None —</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <div className="f-hint">
          Set category, price, and location from the materials page later.
        </div>
      </div>
      {err && <div className="f-err">{err}</div>}
      <div className="flex gap-2 justify-end pt-2">
        <button type="button" onClick={onCancel} className="btn-ghost text-xs">
          Cancel
        </button>
        <button type="submit" className="btn-primary text-xs">
          <Icons.check /> Add Material
        </button>
      </div>
    </form>
  );
};

/* New Supplier — payload shape from 221517d7 (supplier page), only util fields */
const NewSupplierForm = ({ onSubmit, onCancel }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState("");
  const submit = () => {
    if (!name.trim()) return setErr("Name is required");
    onSubmit({
      name: name.trim(),
      phone: phone.trim() || null,
      address: null,
      nif: null,
      rc: null,
      status: "ACTIVE",
    });
  };
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="space-y-3"
    >
      <div>
        <label className="f-label">Supplier Name *</label>
        <input
          className="f-input"
          autoFocus
          placeholder="e.g. Bois & Dérivés Alger"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label className="f-label">Phone</label>
        <input
          className="f-input"
          placeholder="0555 12 34 56"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>
      <div className="f-hint">
        Add NIF, RC, and full address from the suppliers page later.
      </div>
      {err && <div className="f-err">{err}</div>}
      <div className="flex gap-2 justify-end pt-2">
        <button type="button" onClick={onCancel} className="btn-ghost text-xs">
          Cancel
        </button>
        <button type="submit" className="btn-primary text-xs">
          <Icons.check /> Add Supplier
        </button>
      </div>
    </form>
  );
};

/* New Ledger Entry — payload shape from b05ed057 (ledger page), only util fields */
const NewLedgerForm = ({ onSubmit, onCancel, workers = [] }) => {
  const [type, setType] = useState("OTHER_EXPENSE");
  const [date, setDate] = useState(todayISO());
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [worker, setWorker] = useState("");
  const [err, setErr] = useState("");
  const submit = () => {
    if (!amount || Number(amount) <= 0) return setErr("Amount is required");
    onSubmit({
      type,
      date,
      amount: Number(amount),
      note: note.trim() || null,
      reference: null,
      worker: worker || null,
      supplier: null,
    });
  };
  const needsWorker = type === "WORKER_PAYMENT";
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="space-y-3"
    >
      <div className="f-row">
        <div>
          <label className="f-label">Type</label>
          <select
            className="f-select"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {LEDGER_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="f-label">Date</label>
          <input
            className="f-input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>
      {needsWorker && (
        <div>
          <label className="f-label">Worker</label>
          <select
            className="f-select"
            value={worker}
            onChange={(e) => setWorker(e.target.value)}
          >
            <option value="">— Select —</option>
            {workers.map((w) => (
              <option key={w.id} value={w.full_name || w.shortName}>
                {w.full_name || w.shortName}
              </option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label className="f-label">Amount (DZD) *</label>
        <input
          className="f-input"
          type="number"
          autoFocus={!needsWorker}
          placeholder="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <div>
        <label className="f-label">Note</label>
        <input
          className="f-input"
          placeholder="Optional"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
      {err && <div className="f-err">{err}</div>}
      <div className="flex gap-2 justify-end pt-2">
        <button type="button" onClick={onCancel} className="btn-ghost text-xs">
          Cancel
        </button>
        <button type="submit" className="btn-primary text-xs">
          <Icons.check /> Add Entry
        </button>
      </div>
    </form>
  );
};

/* Add Worker — no public create endpoint; this creates a placeholder
   that you can finish from the workers page (matches the worker page fields) */
const NewWorkerForm = ({ onSubmit, onCancel }) => {
  const [name, setName] = useState("");
  const [role, setRole] = useState("Carpenter");
  const submit = () => onSubmit({ name: name.trim(), role });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (name.trim()) submit();
      }}
      className="space-y-3"
    >
      <div>
        <label className="f-label">Full Name *</label>
        <input
          className="f-input"
          autoFocus
          placeholder="e.g. A. Boudjellal"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label className="f-label">Role</label>
        <select
          className="f-select"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          {WORKER_ROLES.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </div>
      <div className="f-hint">
        Set phone, payment rate, and skills from the workers page.
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <button type="button" onClick={onCancel} className="btn-ghost text-xs">
          Cancel
        </button>
        <button
          type="submit"
          disabled={!name.trim()}
          className="btn-primary text-xs disabled:opacity-50"
        >
          <Icons.check /> Add
        </button>
      </div>
    </form>
  );
};

/* Reorder — adjustStock via API (uses adjustStockClient from materials) */
const ReorderForm = ({ material, onSubmit, onCancel }) => {
  const [qty, setQty] = useState(
    material ? Math.max(1, material.maxStock - material.stock) : 1,
  );
  if (!material) return null;
  const submit = () => onSubmit(Number(qty));
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="space-y-3"
    >
      <div
        className="p-3 rounded-lg flex items-center justify-between"
        style={{ background: "var(--surface-2)" }}
      >
        <div>
          <div className="text-[11px]" style={{ color: "var(--ink-muted)" }}>
            {material.name}
          </div>
          <div
            className="text-lg font-bold"
            style={{ color: "var(--stage-contract)" }}
          >
            {material.stock}{" "}
            <span
              className="text-xs font-normal"
              style={{ color: "var(--ink-muted)" }}
            >
              / {material.maxStock} {material.unit}
            </span>
          </div>
        </div>
        <div
          className="text-right text-[11px]"
          style={{ color: "var(--ink-muted)" }}
        >
          min {material.minStock} {material.unit}
        </div>
      </div>
      <div>
        <label className="f-label">Restock to max (suggested)</label>
        <input
          className="f-input"
          type="number"
          min="1"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          autoFocus
        />
        <div className="f-hint">
          Will add{" "}
          <strong>
            {qty} {material.unit}
          </strong>{" "}
          via the supplier "{material.supplier || "—"}".
        </div>
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <button type="button" onClick={onCancel} className="btn-ghost text-xs">
          Cancel
        </button>
        <button type="submit" className="btn-primary text-xs">
          <Icons.check /> Restock
        </button>
      </div>
    </form>
  );
};

/* ════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════════ */
export default function HomeDashboard() {
  /* ─────── data state ─────── */
  const [workers, setWorkers] = useState([]); // from fetchWorkers
  const [attendance, setAttendance] = useState({}); // {workerId: status}
  const [orders, setOrders] = useState([]); // from fetchOrders
  const [materials, setMaterials] = useState([]); // from getAllMaterialsClient
  const [suppliers, setSuppliers] = useState([]); // from getSuppliers
  const [ledger, setLedger] = useState([]); // from fetchLedgerEntries
  const [ledgerRefs, setLedgerRefs] = useState({ workers: [], suppliers: [] });
  const [recentPO, setRecentPO] = useState(null); // last PO across all suppliers
  const [tasks, setTasks] = useState([
    { id: 1, text: "Morning toolbox check", done: true, urgent: false },
    { id: 2, text: "Review this week deliveries", done: false, urgent: false },
  ]);

  /* ─────── ui state ─────── */
  const [filter, setFilter] = useState("ALL");
  const [activePop, setActivePop] = useState(null);
  const [modal, setModal] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loadingAll, setLoadingAll] = useState(true);
  const { toasts, push, dismiss } = useToasts();

  /* ─────── data loaders ─────── */
  const loadAll = useCallback(async () => {
    setLoadingAll(true);
    try {
      const ym = currentYM();
      const monthKey = thisMonthKey();
      const [w, o, m, s, l, refs] = await Promise.allSettled([
        fetchWorkers(),
        fetchOrders({ page: 1, pageSize: 100 }),
        getAllMaterialsClient(),
        getSuppliers(),
        fetchLedgerEntries({ pageSize: 500 }),
        fetchLedgerReferenceData(),
      ]);

      if (w.status === "fulfilled") setWorkers(safe(w.value?.data ?? w.value));
      if (o.status === "fulfilled")
        setOrders(safe(o.value?.data ?? o.value).map(normalizeOrderLite));
      if (m.status === "fulfilled") setMaterials(safe(m.value));
      if (s.status === "fulfilled") setSuppliers(safe(s.value));
      if (l.status === "fulfilled") {
        const list = safe(l.value?.data ?? l.value);
        setLedger(list);
      }
      if (refs.status === "fulfilled")
        setLedgerRefs(refs.value || { workers: [], suppliers: [] });
      if (w.status === "rejected")
        console.error("fetchWorkers failed:", w.reason);
      if (o.status === "rejected")
        console.error("fetchOrders failed:", o.reason);
      if (m.status === "rejected")
        console.error("getAllMaterialsClient failed:", m.reason);
      if (s.status === "rejected")
        console.error("getSuppliers failed:", s.reason);
      if (l.status === "rejected")
        console.error("fetchLedgerEntries failed:", l.reason);

      // NOTE: fetchWorkers() does not return today's attendance/time-entry data
      // (the real DB worker row is just id/full_name/phone/hire_date/payment_type),
      // so we can't pre-populate today's status here. Workers start as "Not Set"
      // and marking them calls the same batchUpdateAttendance write the workers
      // page uses — it persists for real, but this dashboard can't read last
      // session's marks back until an attendance-read endpoint is wired in too.

      // Aggregate last PO across all suppliers for the current month
      if (s.status === "fulfilled") {
        const supList = safe(s.value);
        const results = await Promise.allSettled(
          supList.map((sup) =>
            getSupplierPurchasesClient(sup.id, {
              year: ym.year,
              month: ym.month + 1,
            }).catch(() => null),
          ),
        );
        let latest = null;
        results.forEach((r, i) => {
          if (r.status === "fulfilled" && r.value) {
            const list = safe(r.value?.operations);
            list.forEach((po) => {
              if (!latest || new Date(po.date) > new Date(latest.date))
                latest = { ...po, supplier: supList[i].name };
            });
          }
        });
        setRecentPO(latest);
      }
    } catch (e) {
      push("Failed to load some data", "error");
      console.error(e);
    } finally {
      setLoadingAll(false);
    }
  }, [push]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  /* ─────── derived ─────── */
  const ordersThisMonth = useMemo(() => {
    const mk = thisMonthKey();
    return orders.filter(
      (o) =>
        (o.dueDate || o.deliveryDate || "").startsWith(mk) ||
        (o.createdAt || "").startsWith(mk),
    );
  }, [orders]);

  const ordersFiltered = useMemo(
    () =>
      filter === "ALL"
        ? ordersThisMonth
        : ordersThisMonth.filter((o) => o.stage === filter),
    [ordersThisMonth, filter],
  );

  const ledgerThisMonth = useMemo(() => {
    const mk = thisMonthKey();
    return ledger.filter((e) => (e.date || "").startsWith(mk));
  }, [ledger]);
  const monthIncome = ledgerThisMonth
    .filter((e) => e.type === "INCOME")
    .reduce((s, e) => s + Number(e.amount || 0), 0);
  const monthExpenses = ledgerThisMonth
    .filter((e) => e.type !== "INCOME")
    .reduce((s, e) => s + Number(e.amount || 0), 0);
  const monthProfit = monthIncome - monthExpenses;
  const monthMargin = monthIncome > 0 ? (monthProfit / monthIncome) * 100 : 0;

  /* 6-month series for the line chart */
  const ledgerSeries = useMemo(() => {
    const out = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const entries = ledger.filter((e) => (e.date || "").startsWith(k));
      out.push({
        label: d.toLocaleDateString("en-US", { month: "short" }),
        income: entries
          .filter((e) => e.type === "INCOME")
          .reduce((s, e) => s + Number(e.amount || 0), 0),
        expenses: entries
          .filter((e) => e.type !== "INCOME")
          .reduce((s, e) => s + Number(e.amount || 0), 0),
      });
    }
    return out;
  }, [ledger]);

  const expenseBreakdown = useMemo(() => {
    const totals = {};
    ledgerThisMonth
      .filter((e) => e.type !== "INCOME")
      .forEach((e) => {
        const k = e.type || "OTHER_EXPENSE";
        totals[k] = (totals[k] || 0) + Number(e.amount || 0);
      });
    return LEDGER_TYPES.filter((t) => t.value !== "INCOME")
      .map((t) => ({
        ...t,
        value: totals[t.value] || 0,
      }))
      .filter((t) => t.value > 0);
  }, [ledgerThisMonth]);

  const lowStockMaterials = useMemo(
    () => materials.filter((m) => Number(m.stock) <= Number(m.minStock)),
    [materials],
  );

  const upcomingDeliveries = useMemo(() => {
    const today = new Date(todayISO());
    const in7 = new Date(today);
    in7.setDate(in7.getDate() + 7);
    return orders
      .filter((o) => o.dueDate && o.stage !== "COMPLETED")
      .filter((o) => {
        const d = new Date(o.dueDate);
        return d <= in7; // include overdue too, so nothing due gets missed
      })
      .sort((a, b) => (a.dueDate || "").localeCompare(b.dueDate || ""));
  }, [orders]);

  const pendingPayments = useMemo(() => {
    const out = [];
    orders.forEach((o) => {
      if (o.stage === "COMPLETED") return;
      const balance = Number(o.amount || 0) - Number(o.paid || 0);
      if (balance > 0.01) {
        out.push({
          id: o.id,
          client: o.client,
          order: o.id,
          amount: balance,
          due: o.dueDate || "",
          overdue: !!(o.dueDate && new Date(o.dueDate) < new Date(todayISO())),
        });
      }
    });
    return out.sort((a, b) => (a.due || "9999").localeCompare(b.due || "9999"));
  }, [orders]);

  const workersPresent = Object.values(attendance).filter(
    (s) => s === "PRESENT",
  ).length;
  const workersAbsent = Object.values(attendance).filter(
    (s) => s === "ABSENT",
  ).length;
  const workersTotal = workers.length;
  const completedTasks = tasks.filter((t) => t.done).length;
  const taskProgress =
    tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const pipelineCounts = STAGE_ORDER.map((key) => ({
    key,
    label: STAGE_MAP[key].label,
    value: ordersThisMonth.filter((o) => o.stage === key).length,
    color: STAGE_MAP[key].color,
  }));

  /* ─────── handlers — wired to the real API helpers ─────── */
  const attendanceSaveTimer = useRef(null);
  const pendingAttendanceChanges = useRef([]);
  const setWorkerStatus = (workerId, status) => {
    const prevStatus = attendance[workerId];
    // 1. Instant UI feedback
    setAttendance((prev) => {
      const next = { ...prev };
      if (status === undefined) delete next[workerId];
      else next[workerId] = status;
      return next;
    });

    // 2. Queue + debounce the real DB write (same call the workers page uses)
    pendingAttendanceChanges.current.push({
      workerId,
      date: todayISO(),
      status,
    });
    if (attendanceSaveTimer.current) clearTimeout(attendanceSaveTimer.current);
    attendanceSaveTimer.current = setTimeout(async () => {
      const changes = pendingAttendanceChanges.current;
      pendingAttendanceChanges.current = [];
      try {
        const result = await batchUpdateAttendance(changes);
        if (result && result.success === false)
          throw new Error(result.error || "save failed");
        push(`Attendance saved (${changes.length})`, "success");
      } catch (e) {
        // roll back the optimistic update for this worker
        setAttendance((prev) => ({ ...prev, [workerId]: prevStatus }));
        console.error("batchUpdateAttendance failed:", e);
        push("Failed to save attendance", "error");
      }
    }, 800);
  };

  const setOrderStage = async (orderId, stage) => {
    const prevOrders = orders;
    setOrders((p) => p.map((o) => (o.id === orderId ? { ...o, stage } : o))); // optimistic
    setActivePop(null);
    try {
      const res = await patchOrderClient(orderId, { stage });
      const raw = res?.data ?? res;
      if (!raw || !raw.id)
        throw new Error("Server did not return the updated order");
      const confirmed = normalizeOrderLite(raw);
      setOrders((p) => p.map((o) => (o.id === orderId ? confirmed : o)));
      if (confirmed.stage !== stage) {
        // Server accepted the request but didn't actually change the stage —
        // surface this instead of silently showing the wrong thing.
        push(
          `Server kept order ${orderId} at ${STAGE_MAP[confirmed.stage]?.label || confirmed.stage}`,
          "error",
        );
      } else {
        push(`Order ${orderId} → ${STAGE_MAP[stage].label}`, "success");
      }
    } catch (e) {
      setOrders(prevOrders);
      console.error("patchOrderClient failed:", e);
      push("Failed to move order — change was not saved", "error");
    }
  };

  const toggleTask = (id) =>
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  const addTask = (text, urgent) => {
    if (!text.trim()) return;
    setTasks((prev) => [
      ...prev,
      { id: Date.now(), text: text.trim(), done: false, urgent },
    ]);
    push("Task added", "success");
  };
  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    push("Task removed", "info");
  };

  const recordPayment = async (orderId) => {
    const order = orders.find((o) => o.id === orderId);
    const balance = order
      ? Number(order.amount || 0) - Number(order.paid || 0)
      : 0;
    if (!order || balance <= 0) return;
    setBusy(true);
    try {
      await createPaymentClient(orderId, {
        amount: balance,
        payment_date: todayISO(),
        note: "Recorded from dashboard",
      });
      const fresh = await fetchOrders({ page: 1, pageSize: 100 });
      setOrders(safe(fresh?.data ?? fresh).map(normalizeOrderLite));
      push("Payment recorded", "success");
    } catch (e) {
      push("Failed to record payment", "error");
    } finally {
      setBusy(false);
    }
  };

  /* ── create handlers — call the real API + refresh the slice ── */
  const createOrder = async (data) => {
    setBusy(true);
    try {
      const payload = {
        client: data.client,
        project: data.project,
        amount: data.amount,
        dueDate: data.dueDate,
        stage: "APPOINTMENT",
        worker: data.worker,
        // items / payments / technical are added from the order page
        items: [],
        payments: [],
        missingItems: [],
        technical: { truckDistance: "", floor: "", fee: "" },
      };
      const res = await createOrderClient(payload);
      const created = normalizeOrderLite(res?.data ?? res);
      setOrders((prev) => [created, ...prev]);
      push(`Order ${created.id || ""} created`, "success");
      setModal(null);
    } catch (e) {
      push("Failed to create order", "error");
    } finally {
      setBusy(false);
    }
  };

  const createMaterial = async (data) => {
    setBusy(true);
    try {
      const created = await createMaterialClient(data);
      setMaterials((prev) => [created, ...prev]);
      push(`Material "${data.name}" added`, "success");
      setModal(null);
    } catch (e) {
      push("Failed to add material", "error");
    } finally {
      setBusy(false);
    }
  };

  const createSupplier = async (data) => {
    setBusy(true);
    try {
      const created = await createSupplierClient(data);
      setSuppliers((prev) => [...prev, created]);
      push(`Supplier "${data.name}" added`, "success");
      setModal(null);
    } catch (e) {
      push("Failed to add supplier", "error");
    } finally {
      setBusy(false);
    }
  };

  const createLedger = async (data) => {
    setBusy(true);
    try {
      const created = await createLedgerEntry(data);
      setLedger((prev) => [created, ...prev]);
      push("Ledger entry added", "success");
      setModal(null);
    } catch (e) {
      push("Failed to add entry", "error");
    } finally {
      setBusy(false);
    }
  };

  const reorder = async (material, qty) => {
    setBusy(true);
    try {
      // We bump stock directly via adjustStockClient from the materials helper —
      // matches the source page's "restock" action.
      await adjustStockClient(material.id, qty, "add");
      setMaterials((prev) =>
        prev.map((m) =>
          m.id === material.id ? { ...m, stock: Number(m.stock) + qty } : m,
        ),
      );
      push(`Restocked ${qty} ${material.unit} of ${material.name}`, "success");
      setModal(null);
    } catch (e) {
      push("Failed to restock", "error");
    } finally {
      setBusy(false);
    }
  };

  const addWorker = (data) => {
    // No public create endpoint in the API; mark as pending and toast
    push(
      `Worker "${data.name}" will appear after activation in workers page`,
      "info",
    );
    setModal(null);
  };

  /* ─────── UI bits ─────── */
  const SectionHead = ({ icon, title, action }) => (
    <div
      className="flex items-center justify-between px-5 py-4"
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      <h3 className="text-sm font-semibold flex items-center gap-2">
        {icon}
        {title}
      </h3>
      {action}
    </div>
  );

  const Skeleton = ({ w = "100%", h = 14 }) => (
    <div className="skeleton" style={{ width: w, height: h }} />
  );

  /* ════════════════ RENDER ════════════════ */
  return (
    <div className="p-6">
      <GlobalStyles />

      {/* HEADER */}
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <div
            className="text-xs font-medium mb-1"
            style={{ color: "var(--ink-muted)" }}
          >
            {todayLabel()}
          </div>
          <h1 className="text-2xl font-bold mb-1">Good afternoon, Amine 👋</h1>
          <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
            {completedTasks}/{tasks.length} daily tasks complete ·{" "}
            {taskProgress}% · {workersPresent}/{workersTotal} workers on the
            floor
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="btn-ghost text-xs flex items-center gap-1"
            onClick={loadAll}
            disabled={loadingAll}
          >
            <Icons.refresh /> {loadingAll ? "Loading…" : "Refresh"}
          </button>
          <button
            className="btn-primary text-xs flex items-center gap-1"
            onClick={() => setModal({ type: "NEW_ORDER" })}
          >
            <Icons.plus /> New Order
          </button>
        </div>
      </div>

      {/* KPI ROW */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[
          {
            label: "Revenue (MTD)",
            value: fmtDZDCompact(monthIncome),
            color: "var(--stage-completed)",
            icon: <Icons.trend />,
          },
          {
            label: "Expenses (MTD)",
            value: fmtDZDCompact(monthExpenses),
            color: "var(--stage-contract)",
            icon: <Icons.money />,
          },
          {
            label: "Net Profit",
            value: fmtDZDCompact(monthProfit),
            color: "var(--accent)",
            icon: <Icons.ledger />,
          },
          {
            label: "Orders · month",
            value: ordersThisMonth.length,
            color: "var(--stage-production)",
            icon: <Icons.orders />,
          },
          {
            label: "On the floor",
            value: `${workersPresent}/${workersTotal}`,
            color: "var(--stage-completed)",
            icon: <Icons.workers />,
          },
          {
            label: "Low stock",
            value: lowStockMaterials.length,
            color: "var(--stage-contract)",
            icon: <Icons.alert />,
          },
        ].map((k, i) => (
          <div
            key={i}
            className="kpi-card panel p-4 relative"
            style={{
              borderColor: "var(--border)",
              borderWidth: 1,
              borderStyle: "solid",
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className="text-[11px] font-medium uppercase tracking-wide"
                style={{ color: "var(--ink-muted)" }}
              >
                {k.label}
              </div>
              <div style={{ color: k.color }}>{k.icon}</div>
            </div>
            <div
              className="text-xl font-bold mb-1"
              style={{
                color: i === 0 || i === 2 || i === 5 ? k.color : "var(--ink)",
              }}
            >
              {k.value}
            </div>
            <div className="text-[11px]" style={{ color: "var(--ink-muted)" }}>
              {i === 0 && `${monthMargin.toFixed(1)}% margin`}
              {i === 1 && `${expenseBreakdown.length} categories`}
              {i === 2 && `${monthMargin.toFixed(1)}% margin`}
              {i === 3 &&
                `${ordersThisMonth.filter((o) => o.stage === "IN_PRODUCTION").length} in production`}
              {i === 4 &&
                `${workersAbsent} away · ${workersTotal - workersPresent - workersAbsent} not set`}
              {i === 5 &&
                `${lowStockMaterials.filter((m) => Number(m.stock) <= 0).length} critical`}
            </div>
          </div>
        ))}
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ═══ LEFT (2/3) ═══ */}
        <div className="lg:col-span-2 space-y-6">
          {/* Workers + Upcoming Deliveries */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Workers */}
            <div className="panel">
              <SectionHead
                icon={<Icons.workers />}
                title={`Workers Today (${workersTotal})`}
                action={
                  <button
                    className="btn-ghost text-xs flex items-center gap-1"
                    onClick={() => setModal({ type: "NEW_WORKER" })}
                  >
                    <Icons.plus /> Add
                  </button>
                }
              />
              <div className="p-2">
                {loadingAll && workers.length === 0 ? (
                  <div className="p-3 space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} h={56} />
                    ))}
                  </div>
                ) : workers.length === 0 ? (
                  <div
                    className="p-6 text-center text-sm"
                    style={{ color: "var(--ink-muted)" }}
                  >
                    No workers yet
                  </div>
                ) : (
                  workers.map((w) => {
                    const status = attendance[w.id]; // undefined = Not Set
                    const name =
                      w.full_name || w.shortName || w.name || "Worker";
                    return (
                      <div
                        key={w.id}
                        className="relative flex items-center gap-3 p-3 rounded-lg panel-hover"
                      >
                        <div className="relative shrink-0">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold"
                            style={{
                              background: "var(--surface-2)",
                              color: "var(--accent)",
                            }}
                          >
                            {initials(name)}
                          </div>
                          {status === "PRESENT" && (
                            <span
                              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-pulse"
                              style={{
                                background: "var(--stage-completed)",
                                color: "var(--stage-completed)",
                              }}
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-sm font-medium truncate">
                              {name}
                            </span>
                            <span
                              className="text-[11px]"
                              style={{ color: "var(--ink-muted)" }}
                            >
                              · {w.role || "—"}
                            </span>
                          </div>
                          <div
                            className="text-[11px] truncate"
                            style={{ color: "var(--ink-muted)" }}
                          >
                            {w.hire_date
                              ? `Joined ${new Date(w.hire_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`
                              : "No join date"}
                          </div>
                        </div>
                        <AttendanceBadge
                          status={status}
                          onCycle={() =>
                            setWorkerStatus(w.id, cycleAttendance(status))
                          }
                        />
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Upcoming Deliveries */}
            <div className="panel">
              <SectionHead
                icon={<Icons.calendar />}
                title={`Upcoming Deliveries (${upcomingDeliveries.length})`}
                action={
                  <span
                    className="text-[11px]"
                    style={{ color: "var(--ink-muted)" }}
                  >
                    next 7 days
                  </span>
                }
              />
              <div className="p-2">
                {loadingAll && orders.length === 0 ? (
                  <div className="p-3 space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} h={56} />
                    ))}
                  </div>
                ) : upcomingDeliveries.length === 0 ? (
                  <div
                    className="p-6 text-center text-sm"
                    style={{ color: "var(--ink-muted)" }}
                  >
                    Nothing due this week
                  </div>
                ) : (
                  upcomingDeliveries.map((o) => {
                    const isToday = o.dueDate === todayISO();
                    const isOver =
                      o.dueDate && new Date(o.dueDate) < new Date(todayISO());
                    return (
                      <div
                        key={o.id}
                        className="flex items-center gap-3 p-3 rounded-lg panel-hover"
                      >
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                          style={{
                            background: "var(--surface-2)",
                            color: "var(--accent)",
                          }}
                        >
                          {initials(o.client)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {o.client || `Order ${o.id}`}
                          </div>
                          <div
                            className="text-[11px]"
                            style={{ color: "var(--ink-muted)" }}
                          >
                            Order {o.id} · <StageBadge stage={o.stage} />
                          </div>
                        </div>
                        <span
                          className="text-xs shrink-0"
                          style={{
                            color: isOver
                              ? "var(--stage-contract)"
                              : isToday
                                ? "var(--accent)"
                                : "var(--ink-muted)",
                            fontWeight: isToday || isOver ? 600 : 400,
                          }}
                        >
                          {isToday
                            ? "Today"
                            : isOver
                              ? "Overdue"
                              : new Date(o.dueDate).toLocaleDateString(
                                  "en-US",
                                  { month: "short", day: "numeric" },
                                )}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Orders This Month */}
          <div className="panel">
            <SectionHead
              icon={<Icons.orders />}
              title={`Orders This Month (${ordersThisMonth.length})`}
              action={
                <div className="flex gap-1">
                  {[
                    "ALL",
                    "IN_PRODUCTION",
                    "READY_TO_DELIVER",
                    "COMPLETED",
                  ].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className="text-[11px] px-2.5 py-1 rounded-md transition-colors"
                      style={{
                        background:
                          filter === f ? "var(--accent-soft)" : "transparent",
                        color:
                          filter === f ? "var(--accent)" : "var(--ink-muted)",
                        fontWeight: filter === f ? 600 : 400,
                      }}
                    >
                      {f === "ALL"
                        ? "All"
                        : f === "IN_PRODUCTION"
                          ? "In Prod."
                          : f === "READY_TO_DELIVER"
                            ? "Ready"
                            : "Completed"}
                    </button>
                  ))}
                </div>
              }
            />
            <div className="scroll-x">
              <table className="w-full text-left text-sm min-w-[640px]">
                <thead>
                  <tr style={{ background: "var(--surface-2)" }}>
                    <th
                      className="px-5 py-3 text-[11px] font-medium"
                      style={{ color: "var(--ink-muted)" }}
                    >
                      Order
                    </th>
                    <th
                      className="px-5 py-3 text-[11px] font-medium"
                      style={{ color: "var(--ink-muted)" }}
                    >
                      Client
                    </th>
                    <th
                      className="px-5 py-3 text-[11px] font-medium"
                      style={{ color: "var(--ink-muted)" }}
                    >
                      Stage
                    </th>
                    <th
                      className="px-5 py-3 text-[11px] font-medium text-right"
                      style={{ color: "var(--ink-muted)" }}
                    >
                      Amount
                    </th>
                    <th
                      className="px-5 py-3 text-[11px] font-medium"
                      style={{ color: "var(--ink-muted)" }}
                    >
                      Delivery
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loadingAll && orders.length === 0 ? (
                    [1, 2, 3].map((i) => (
                      <tr
                        key={i}
                        style={{ borderTop: "1px solid var(--border)" }}
                      >
                        <td colSpan="5" className="px-5 py-3">
                          <Skeleton />
                        </td>
                      </tr>
                    ))
                  ) : ordersFiltered.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-5 py-8 text-center text-sm"
                        style={{ color: "var(--ink-muted)" }}
                      >
                        No orders for this filter
                      </td>
                    </tr>
                  ) : (
                    ordersFiltered.map((o) => {
                      const isToday = o.dueDate === todayISO();
                      const isOver =
                        o.dueDate &&
                        new Date(o.dueDate) < new Date(todayISO()) &&
                        o.stage !== "COMPLETED";
                      return (
                        <tr
                          key={o.id}
                          className="panel-hover transition-colors"
                          style={{ borderTop: "1px solid var(--border)" }}
                        >
                          <td className="px-5 py-3 font-medium">{o.id}</td>
                          <td className="px-5 py-3">{o.client}</td>
                          <td className="px-5 py-3">
                            <div className="relative inline-block">
                              <StageBadge
                                stage={o.stage}
                                onClick={() =>
                                  setActivePop(
                                    activePop?.type === "order" &&
                                      activePop.id === o.id
                                      ? null
                                      : { type: "order", id: o.id },
                                  )
                                }
                              />
                              <Popover
                                open={
                                  activePop?.type === "order" &&
                                  activePop.id === o.id
                                }
                                onClose={() => setActivePop(null)}
                              >
                                <div
                                  className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide"
                                  style={{ color: "var(--ink-muted)" }}
                                >
                                  Move to stage
                                </div>
                                {STAGE_ORDER.map((s) => (
                                  <div
                                    key={s}
                                    className={`popover-item ${o.stage === s ? "selected" : ""}`}
                                    onClick={() => setOrderStage(o.id, s)}
                                  >
                                    {STAGE_MAP[s].label}
                                  </div>
                                ))}
                              </Popover>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-right font-medium">
                            {fmtDZD(o.amount)}
                          </td>
                          <td className="px-5 py-3">
                            <span
                              className="text-xs"
                              style={{
                                color: isOver
                                  ? "var(--stage-contract)"
                                  : isToday
                                    ? "var(--accent)"
                                    : "var(--ink-muted)",
                                fontWeight: isToday || isOver ? 600 : 400,
                              }}
                            >
                              {isToday
                                ? "Today"
                                : o.dueDate
                                  ? new Date(o.dueDate).toLocaleDateString(
                                      "en-US",
                                      { month: "short", day: "numeric" },
                                    )
                                  : "—"}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div
              className="px-5 py-3 flex items-center justify-between"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <div
                className="text-[11px]"
                style={{ color: "var(--ink-muted)" }}
              >
                Showing {ordersFiltered.length} of {ordersThisMonth.length} ·
                Total{" "}
                {fmtDZD(
                  ordersFiltered.reduce((s, o) => s + Number(o.amount || 0), 0),
                )}
              </div>
            </div>
          </div>

          {/* Charts row */}
          <div className="panel">
            <SectionHead
              icon={<Icons.chart />}
              title="Revenue vs Expenses · 6 months"
              action={
                <div className="chart-legend">
                  <span>
                    <span
                      className="chart-legend-dot"
                      style={{ background: "#22c55e" }}
                    />{" "}
                    Income
                  </span>
                  <span>
                    <span
                      className="chart-legend-dot"
                      style={{ background: "#f59e0b" }}
                    />{" "}
                    Expenses
                  </span>
                </div>
              }
            />
            <div className="p-3">
              {loadingAll && ledger.length === 0 ? (
                <Skeleton h={200} />
              ) : (
                <LineChart data={ledgerSeries} width={700} height={200} />
              )}
            </div>
          </div>

          {/* Pipeline + Donut */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="panel">
              <SectionHead
                icon={<Icons.orders />}
                title="Pipeline"
                action={
                  <span
                    className="text-[11px]"
                    style={{ color: "var(--ink-muted)" }}
                  >
                    this month
                  </span>
                }
              />
              <div className="p-3">
                <PipelineChart
                  counts={pipelineCounts}
                  width={320}
                  height={180}
                />
              </div>
            </div>
            <div className="panel">
              <SectionHead icon={<Icons.ledger />} title="Expense Breakdown" />
              <div className="p-4 flex items-center gap-4">
                {expenseBreakdown.length > 0 ? (
                  <>
                    <DonutChart
                      data={expenseBreakdown.map((c) => ({
                        value: c.value,
                        color: c.color,
                      }))}
                      size={140}
                      thickness={22}
                    />
                    <div className="flex-1 space-y-2">
                      {expenseBreakdown.map((c, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-[11px]"
                        >
                          <span
                            className="chart-legend-dot"
                            style={{ background: c.color }}
                          />
                          <span
                            className="flex-1"
                            style={{ color: "var(--ink)" }}
                          >
                            {c.label}
                          </span>
                          <span style={{ color: "var(--ink-muted)" }}>
                            {(
                              (c.value / Math.max(1, monthExpenses)) *
                              100
                            ).toFixed(0)}
                            %
                          </span>
                          <span className="font-semibold w-16 text-right">
                            {fmtDZDCompact(c.value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div
                    className="flex-1 text-center text-sm py-6"
                    style={{ color: "var(--ink-muted)" }}
                  >
                    No expenses recorded this month
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Last PO + Pending payments */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="panel">
              <SectionHead
                icon={<Icons.package />}
                title="Last Purchase Order"
              />
              <div className="p-5">
                {!recentPO ? (
                  <div
                    className="text-center text-sm py-6"
                    style={{ color: "var(--ink-muted)" }}
                  >
                    No purchase orders this month
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-base font-semibold">
                          PO #{recentPO.id}
                        </div>
                        <div
                          className="text-xs mt-0.5"
                          style={{ color: "var(--ink-muted)" }}
                        >
                          {recentPO.supplier}
                        </div>
                        <div
                          className="text-[11px] mt-0.5 flex items-center gap-1"
                          style={{ color: "var(--ink-muted)" }}
                        >
                          <Icons.calendar />{" "}
                          {recentPO.date
                            ? new Date(recentPO.date).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )
                            : "—"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className="text-[11px] font-medium uppercase tracking-wide"
                          style={{ color: "var(--ink-muted)" }}
                        >
                          Total
                        </div>
                        <div
                          className="text-lg font-bold mt-0.5"
                          style={{ color: "var(--accent)" }}
                        >
                          {fmtDZD(recentPO.total)}
                        </div>
                      </div>
                    </div>
                    <div
                      className="text-[11px] font-medium uppercase tracking-wide mb-2"
                      style={{ color: "var(--ink-muted)" }}
                    >
                      Items ({safe(recentPO.items).length})
                    </div>
                    <div className="space-y-1.5">
                      {safe(recentPO.items).map((it, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 py-1.5 px-2 rounded"
                          style={{ background: "var(--surface-2)" }}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium truncate">
                              {it.material_name || it.name}
                            </div>
                            <div
                              className="text-[10px]"
                              style={{ color: "var(--ink-muted)" }}
                            >
                              {it.quantity} {it.unit} ×{" "}
                              {fmtDZD(it.unit_price || it.price)}
                            </div>
                          </div>
                          <div className="text-xs font-semibold shrink-0">
                            {fmtDZD(
                              Number(it.quantity || 0) *
                                Number(it.unit_price || it.price || 0),
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* <div className="panel">
              <SectionHead
                icon={<Icons.money />}
                title={`Pending Payments (${pendingPayments.length})`}
                action={
                  <button
                    className="btn-ghost text-xs flex items-center gap-1"
                    onClick={() => setModal({ type: "NEW_LEDGER" })}
                  >
                    <Icons.plus /> Add
                  </button>
                }
              />
              <div className="p-2">
                {pendingPayments.length === 0 ? (
                  <div
                    className="p-6 text-center text-sm"
                    style={{ color: "var(--stage-completed)" }}
                  >
                    ✓ All payments are up to date
                  </div>
                ) : (
                  pendingPayments.map((p) => {
                    const daysFromToday = p.due
                      ? Math.round(
                          (new Date(p.due) - new Date(todayISO())) / 86400000,
                        )
                      : 0;
                    const dueLabel =
                      daysFromToday < 0
                        ? `Overdue ${-daysFromToday}d`
                        : daysFromToday === 0
                          ? "Today"
                          : `In ${daysFromToday}d`;
                    return (
                      <div
                        key={p.id}
                        className="flex items-center gap-3 p-3 rounded-lg panel-hover"
                      >
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                          style={{
                            background: p.overdue
                              ? "rgba(239,68,68,0.12)"
                              : "var(--surface-2)",
                            color: p.overdue
                              ? "var(--stage-contract)"
                              : "var(--accent)",
                          }}
                        >
                          {initials(p.client)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {p.client}
                          </div>
                          <div
                            className="text-[11px] flex items-center gap-1.5"
                            style={{ color: "var(--ink-muted)" }}
                          >
                            <span>{p.order}</span>
                            <span>·</span>
                            <span
                              style={{
                                color: p.overdue
                                  ? "var(--stage-contract)"
                                  : "var(--ink-muted)",
                                fontWeight: p.overdue ? 600 : 400,
                              }}
                            >
                              {dueLabel}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-sm font-semibold">
                            {fmtDZDCompact(p.amount)}
                          </div>
                          <button
                            onClick={() => recordPayment(p.id)}
                            className="text-[10px] mt-0.5"
                            style={{ color: "var(--stage-completed)" }}
                          >
                            <Icons.check /> Mark paid
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div> */}
          </div>
        </div>

        {/* ═══ RIGHT (1/3) ═══ */}
        <div className="space-y-6">
          {/* Net this month */}
          <div className="panel">
            <SectionHead icon={<Icons.ledger />} title="Net · This Month" />
            <div className="p-5">
              <div className="flex items-end justify-between mb-3">
                <div>
                  <div
                    className="text-[11px] font-medium uppercase tracking-wide"
                    style={{ color: "var(--ink-muted)" }}
                  >
                    Profit
                  </div>
                  <div
                    className="text-2xl font-bold mt-1"
                    style={{ color: "var(--accent)" }}
                  >
                    {fmtDZDCompact(monthProfit)}
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className="text-[11px]"
                    style={{ color: "var(--ink-muted)" }}
                  >
                    {monthMargin.toFixed(1)}% margin
                  </div>
                </div>
              </div>
              <div className="space-y-2.5">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span style={{ color: "var(--stage-completed)" }}>
                      Income
                    </span>
                    <span className="font-semibold">{fmtDZD(monthIncome)}</span>
                  </div>
                  <div
                    className="h-2 rounded-full overflow-hidden"
                    style={{ background: "var(--surface-2)" }}
                  >
                    <div
                      className="h-full bar-fill"
                      style={{
                        width: monthIncome > 0 ? "100%" : "0%",
                        background: "var(--stage-completed)",
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span style={{ color: "var(--stage-contract)" }}>
                      Expenses
                    </span>
                    <span className="font-semibold">
                      {fmtDZD(monthExpenses)}
                    </span>
                  </div>
                  <div
                    className="h-2 rounded-full overflow-hidden"
                    style={{ background: "var(--surface-2)" }}
                  >
                    <div
                      className="h-full bar-fill"
                      style={{
                        width:
                          monthIncome > 0
                            ? `${(monthExpenses / monthIncome) * 100}%`
                            : "0%",
                        background: "var(--stage-contract)",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Low Stock */}
          <div className="panel">
            <SectionHead
              icon={<Icons.alert />}
              title={`Low Stock (${lowStockMaterials.length})`}
              action={
                <button
                  className="btn-ghost text-xs flex items-center gap-1"
                  onClick={() => setModal({ type: "NEW_MATERIAL" })}
                >
                  <Icons.plus />
                </button>
              }
            />
            <div className="p-3 space-y-2">
              {lowStockMaterials.length === 0 ? (
                <div
                  className="p-4 text-center text-xs"
                  style={{ color: "var(--stage-completed)" }}
                >
                  ✓ All stock levels healthy
                </div>
              ) : (
                lowStockMaterials.slice(0, 5).map((m) => {
                  const ratio = Math.min(
                    Number(m.stock) / Math.max(1, Number(m.maxStock)),
                    1,
                  );
                  const critical = Number(m.stock) <= 0;
                  const color = critical
                    ? "var(--stage-contract)"
                    : "var(--accent)";
                  return (
                    <div
                      key={m.id}
                      className="p-3 rounded-lg"
                      style={{ background: "var(--surface-2)" }}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="text-sm font-medium truncate">
                          {m.name}
                        </div>
                        <div
                          className="text-xs font-semibold shrink-0"
                          style={{ color }}
                        >
                          {m.stock}
                          <span
                            className="font-normal"
                            style={{ color: "var(--ink-muted)" }}
                          >
                            {" "}
                            / {m.maxStock} {m.unit}
                          </span>
                        </div>
                      </div>
                      <div
                        className="h-1.5 rounded-full overflow-hidden"
                        style={{ background: "var(--bg)" }}
                      >
                        <div
                          className="h-full bar-fill"
                          style={{
                            width: `${ratio * 100}%`,
                            background: color,
                          }}
                        />
                      </div>
                      <button
                        onClick={() =>
                          setModal({ type: "REORDER", payload: m })
                        }
                        className="text-[10px] mt-1.5 flex items-center gap-1"
                        style={{ color: "var(--accent)" }}
                      >
                        <Icons.arrowRight /> Reorder
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Tasks */}
          <div className="panel">
            <SectionHead
              icon={<Icons.check />}
              title="Daily Tasks"
              action={
                <div className="flex items-center gap-2">
                  <span
                    className="text-[11px]"
                    style={{ color: "var(--ink-muted)" }}
                  >
                    {completedTasks}/{tasks.length}
                  </span>
                  <button
                    className="btn-ghost text-xs"
                    onClick={() => setModal({ type: "NEW_TASK" })}
                  >
                    <Icons.plus />
                  </button>
                </div>
              }
            />
            <div className="p-3 space-y-1">
              {tasks.map((t) => (
                <div
                  key={t.id}
                  className="check-row group flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-colors"
                >
                  <div
                    onClick={() => toggleTask(t.id)}
                    className="w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors"
                    style={{
                      borderColor: t.done ? "var(--accent)" : "var(--border)",
                      background: t.done ? "var(--accent)" : "transparent",
                    }}
                  >
                    {t.done && <Icons.check />}
                  </div>
                  <div className="flex-1" onClick={() => toggleTask(t.id)}>
                    <div
                      className="text-xs"
                      style={{
                        color: t.done ? "var(--ink-muted)" : "var(--ink)",
                        textDecoration: t.done ? "line-through" : "none",
                      }}
                    >
                      {t.text}
                    </div>
                    {t.urgent && !t.done && (
                      <div
                        className="text-[10px] mt-0.5 font-semibold"
                        style={{ color: "var(--accent)" }}
                      >
                        Urgent
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => deleteTask(t.id)}
                    className="opacity-0 group-hover:opacity-100 text-[var(--ink-muted)] hover:text-[var(--stage-contract)] transition-opacity"
                  >
                    <Icons.trash />
                  </button>
                </div>
              ))}
            </div>
            <div
              className="h-1 rounded-full overflow-hidden mx-3 mb-3"
              style={{ background: "var(--surface-2)" }}
            >
              <div
                className="h-full bar-fill"
                style={{
                  width: `${taskProgress}%`,
                  background: "var(--accent)",
                }}
              />
            </div>
          </div>

          {/* Quick Actions — all wired to real modals */}
          <div className="panel p-4">
            <h3 className="text-sm font-semibold mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setModal({ type: "NEW_ORDER" })}
                className="btn-primary text-xs justify-center"
              >
                <Icons.plus /> New Order
              </button>
              <button
                onClick={() => setModal({ type: "NEW_LEDGER" })}
                className="btn-ghost text-xs justify-center border"
                style={{ borderColor: "var(--border)" }}
              >
                <Icons.money /> Ledger Entry
              </button>
              <button
                onClick={() => setModal({ type: "NEW_MATERIAL" })}
                className="btn-ghost text-xs justify-center border"
                style={{ borderColor: "var(--border)" }}
              >
                <Icons.package /> New Material
              </button>
              <button
                onClick={() => setModal({ type: "NEW_SUPPLIER" })}
                className="btn-ghost text-xs justify-center border"
                style={{ borderColor: "var(--border)" }}
              >
                <Icons.truck /> New Supplier
              </button>
              <button
                onClick={() => setModal({ type: "NEW_WORKER" })}
                className="btn-ghost text-xs justify-center border"
                style={{ borderColor: "var(--border)" }}
              >
                <Icons.workers /> Add Worker
              </button>
              <button
                onClick={() => setModal({ type: "NEW_TASK" })}
                className="btn-ghost text-xs justify-center border"
                style={{ borderColor: "var(--border)" }}
              >
                <Icons.check /> Add Task
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ MODALS ═══ */}
      <Modal
        open={modal?.type === "NEW_ORDER"}
        onClose={() => setModal(null)}
        title="New Order"
      >
        <NewOrderForm
          onSubmit={createOrder}
          onCancel={() => setModal(null)}
          existingWorkers={workers}
        />
      </Modal>
      <Modal
        open={modal?.type === "NEW_MATERIAL"}
        onClose={() => setModal(null)}
        title="New Material"
      >
        <NewMaterialForm
          onSubmit={createMaterial}
          onCancel={() => setModal(null)}
          suppliers={suppliers}
        />
      </Modal>
      <Modal
        open={modal?.type === "NEW_SUPPLIER"}
        onClose={() => setModal(null)}
        title="New Supplier"
      >
        <NewSupplierForm
          onSubmit={createSupplier}
          onCancel={() => setModal(null)}
        />
      </Modal>
      <Modal
        open={modal?.type === "NEW_LEDGER"}
        onClose={() => setModal(null)}
        title="New Ledger Entry"
      >
        <NewLedgerForm
          onSubmit={createLedger}
          onCancel={() => setModal(null)}
          workers={workers}
        />
      </Modal>
      <Modal
        open={modal?.type === "NEW_WORKER"}
        onClose={() => setModal(null)}
        title="Add Worker"
      >
        <NewWorkerForm onSubmit={addWorker} onCancel={() => setModal(null)} />
      </Modal>
      <Modal
        open={modal?.type === "NEW_TASK"}
        onClose={() => setModal(null)}
        title="New Task"
      >
        <TaskForm onSubmit={addTask} onCancel={() => setModal(null)} />
      </Modal>
      <Modal
        open={modal?.type === "REORDER"}
        onClose={() => setModal(null)}
        title={`Reorder · ${modal?.payload?.name || ""}`}
      >
        <ReorderForm
          material={modal?.payload}
          onSubmit={(qty) => reorder(modal.payload, qty)}
          onCancel={() => setModal(null)}
        />
      </Modal>

      {/* TOASTS */}
      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}

/* Task form (inline since it's tiny) */
const TaskForm = ({ onSubmit, onCancel }) => {
  const [text, setText] = useState("");
  const [urgent, setUrgent] = useState(false);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (text.trim()) onSubmit(text, urgent);
      }}
      className="space-y-3"
    >
      <div>
        <label className="f-label">Task</label>
        <input
          className="f-input"
          autoFocus
          placeholder="What needs to be done?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) =>
            e.key === "Enter" && text.trim() && onSubmit(text, urgent)
          }
        />
      </div>
      <label className="flex items-center gap-2 text-xs cursor-pointer">
        <input
          type="checkbox"
          checked={urgent}
          onChange={(e) => setUrgent(e.target.checked)}
        />
        Mark as urgent
      </label>
      <div className="flex gap-2 justify-end pt-2">
        <button type="button" onClick={onCancel} className="btn-ghost text-xs">
          Cancel
        </button>
        <button
          type="submit"
          disabled={!text.trim()}
          className="btn-primary text-xs disabled:opacity-50"
        >
          <Icons.check /> Add Task
        </button>
      </div>
    </form>
  );
};
