"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// ─── API helpers (same imports as the source pages) ───────────
import {
  getAllMaterialsClient,
  createMaterialClient,
  adjustStockClient,
} from "../../lib/api_helpers/materials";
import {
  getSuppliers,
  createSupplierClient,
  getSupplierPurchasesClient,
} from "../../lib/api_helpers/supplier";
import {
  fetchOrders,
  createOrderClient,
} from "../api/orders/orders";
import { createPaymentClient } from "../api/payments/payments";
import { useRouter } from "next/navigation";
import { fetchWorkers } from "../api/workers/workers";
import { batchUpdateAttendance } from "../../lib/api_helpers/workers";
import {
  fetchLedgerEntries,
  createLedgerEntry,
  fetchLedgerReferenceData,
} from "../../lib/api_helpers/ledger";
import {
  fetchTasks,
  createTaskClient,
  patchTaskClient,
  deleteTaskClient,
  normalizeTask,
} from "../../lib/api_helpers/tasks";
import { OrderFormModal } from "../../lib/components/Orderformmodal";

/* ════════════════════════════════════════════════════════════════
   GLOBAL STYLES
   The .pwa-shell prefix scopes the mobile tab layout so it never
   collides with the original desktop grid below it.
   ════════════════════════════════════════════════════════════════ */
const GlobalStyles = () => (
  <style>{`
    /* ─── SHARED (desktop + mobile) ─────────────────── */
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

    /* compact form */
    .f-input, .f-select, .f-textarea {
      width: 100%; padding: 9px 12px; border-radius: 8px;
      background: var(--surface-2); border: 1px solid var(--border);
      color: var(--ink); font-size: 13px; font-family: inherit;
      transition: border-color .15s ease;
    }
    /* Native <select> popups render using the OS/browser's own theme,
       ignoring our CSS vars — this forces the dropdown list itself
       (not just the closed control) to render dark instead of white. */
    select.f-select, select { color-scheme: dark; }
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

    /* ═══ PWA / mobile (scoped to .pwa-shell) ═══ */
    .pwa-shell {
      min-height: 100vh;
      min-height: 100dvh;
      background: var(--bg);
      padding-bottom: calc(72px + env(safe-area-inset-bottom));
    }
    .pwa-shell .pwa-header {
      position: sticky; top: 0; z-index: 20;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      padding: 12px 16px;
      padding-top: calc(12px + env(safe-area-inset-top));
    }
    .pwa-shell .pwa-header-row {
      display: flex; align-items: center; gap: 10px;
      max-width: 720px; margin: 0 auto;
    }
    .pwa-shell .pwa-main {
      padding: 12px 12px 24px;
      max-width: 720px; margin: 0 auto;
    }

    /* bottom tab bar */
    .pwa-shell .pwa-tabbar {
      position: fixed; left: 0; right: 0; bottom: 0; z-index: 50;
      display: flex;
      background: var(--surface);
      border-top: 1px solid var(--border);
      padding-bottom: env(safe-area-inset-bottom);
      box-shadow: 0 -6px 20px rgba(0,0,0,.18);
    }
    .pwa-shell .tab-btn {
      flex: 1; min-height: 56px;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: 2px; padding: 8px 4px;
      background: none; border: none;
      color: var(--ink-muted);
      cursor: pointer;
      font-family: inherit; font-size: 10px; font-weight: 500;
      letter-spacing: .02em;
      position: relative;
      -webkit-tap-highlight-color: transparent;
      transition: color .15s ease;
    }
    .pwa-shell .tab-btn.active { color: var(--accent); }
    .pwa-shell .tab-btn.active .tab-dot {
      opacity: 1; transform: scaleX(1);
    }
    .pwa-shell .tab-dot {
      position: absolute; bottom: 6px; left: 50%; transform: translateX(-50%) scaleX(.2);
      width: 16px; height: 3px; border-radius: 2px;
      background: var(--accent);
      opacity: 0;
      transition: opacity .2s ease, transform .2s ease;
    }

    /* collapsible panel */
    .pwa-shell .panel {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 14px;
      overflow: hidden;
    }
    .pwa-shell .panel + .panel { margin-top: 10px; }
    .pwa-shell .panel-head {
      width: 100%;
      display: flex; align-items: center; gap: 10px;
      padding: 12px 14px;
      background: none; border: none; cursor: pointer;
      color: var(--ink);
      font-family: inherit; font-size: 14px; font-weight: 600;
      text-align: left; min-height: 48px;
      -webkit-tap-highlight-color: transparent;
    }
    .pwa-shell .panel-head:active { background: var(--surface-2); }
    .pwa-shell .panel-head .ph-icon {
      width: 28px; height: 28px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      background: var(--accent-soft); color: var(--accent);
      flex-shrink: 0;
    }
    .pwa-shell .panel-head .ph-title { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .pwa-shell .panel-head .ph-count {
      font-size: 11px; font-weight: 600;
      padding: 2px 8px; border-radius: 999px;
      background: var(--surface-2); color: var(--ink-muted);
    }
    .pwa-shell .panel-head .ph-chev {
      color: var(--ink-muted); transition: transform .2s ease;
      display: flex; align-items: center; flex-shrink: 0;
    }
    .pwa-shell .panel.collapsed .ph-chev { transform: rotate(-90deg); }
    .pwa-shell .panel-body { border-top: 1px solid var(--border); animation: panelIn .18s ease-out; }
    .pwa-shell .panel.collapsed .panel-body { display: none; }
    @keyframes panelIn { from { opacity: 0; transform: translateY(-3px); } to { opacity: 1; transform: none; } }

    .pwa-shell .list-item { padding: 12px 14px; border-top: 1px solid var(--border); }
    .pwa-shell .list-item:first-child { border-top: none; }
    .pwa-shell .list-empty {
      padding: 18px 14px; text-align: center;
      font-size: 12px; color: var(--ink-muted);
    }
    .pwa-shell .list-more {
      width: 100%; padding: 10px;
      background: none; border: none; cursor: pointer;
      color: var(--accent);
      font-family: inherit; font-size: 12px; font-weight: 600;
      text-align: center; min-height: 40px;
      border-top: 1px solid var(--border);
    }
    .pwa-shell .list-more:active { background: var(--surface-2); }

    /* Desktop "show more" control — used by panels that only render
       a handful of rows up front (tasks, workers, orders, low stock,
       etc.) and reveal the rest on click. */
    .show-more-btn {
      width: 100%; padding: 10px;
      background: none; border: none; cursor: pointer;
      color: var(--accent);
      font-family: inherit; font-size: 12px; font-weight: 600;
      text-align: center;
      border-top: 1px solid var(--border);
      margin-top: 4px;
      transition: background .15s ease;
    }
    .show-more-btn:hover { background: var(--surface-2); }

    .pwa-shell .tab-pane { animation: tabIn .18s ease-out; }
    @keyframes tabIn {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: none; }
    }

    .pwa-shell .kpi-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      margin-bottom: 10px;
    }
    .pwa-shell .kpi-card {
      padding: 12px;
      border-radius: 12px;
      background: var(--surface-2);
    }
    .pwa-shell .kpi-card .k-label {
      font-size: 10px; font-weight: 600; text-transform: uppercase;
      letter-spacing: .04em; color: var(--ink-muted);
    }
    .pwa-shell .kpi-card .k-value {
      font-size: 18px; font-weight: 700; color: var(--ink);
      margin-top: 4px;
    }
    .pwa-shell .kpi-card .k-sub { font-size: 10px; color: var(--ink-muted); margin-top: 2px; }

    .pwa-shell .chip-row {
      display: flex; gap: 6px; flex-wrap: wrap;
      padding: 10px 14px;
      border-top: 1px solid var(--border);
    }
    .pwa-shell .chip {
      padding: 6px 10px; border-radius: 999px;
      font-size: 11px; font-weight: 500;
      background: var(--surface-2); color: var(--ink-muted);
      border: 1px solid transparent; cursor: pointer;
      font-family: inherit; min-height: 28px;
    }
    .pwa-shell .chip.active {
      background: var(--accent-soft); color: var(--accent);
      border-color: var(--accent);
    }

    .pwa-shell .muted { color: var(--ink-muted); }
    .pwa-shell .row { display: flex; align-items: center; gap: 8px; }
    .pwa-shell .grow { flex: 1; min-width: 0; }
    .pwa-shell .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    .pwa-shell .pwa-cta {
      width: 100%;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      padding: 14px; border-radius: 12px;
      background: var(--accent); color: #fff;
      border: none; cursor: pointer;
      font-family: inherit; font-size: 14px; font-weight: 600;
      min-height: 48px;
      -webkit-tap-highlight-color: transparent;
    }
    .pwa-shell .pwa-cta:active { opacity: .9; }
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
  if (current === "ABSENT") return undefined;
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
const TASK_PRIORITIES = [
  { value: "LOW", label: "Low", color: "#22c55e" },
  { value: "MEDIUM", label: "Medium", color: "#eab308" },
  { value: "HIGH", label: "High", color: "#f97316" },
  { value: "URGENT", label: "Urgent", color: "#f43f5e" },
];
/* Blue palette for the Tasks feature. The high-priority badge above
   already swapped to #3b82f6, and the rest of the task UI leans on
   these tokens for date nav + time pills + progress bar. */
const TASK_BLUE = "#3b82f6";
const TASK_BLUE_SOFT = "rgba(59,130,246,0.12)";
/* Task priority drives the entire color system in the task manager:
   the priority chip, the left rail of each row, and the checkbox
   border all share the same color so the eye can sort by urgency
   without reading a single word. */
const TASK_PRIORITY_RANK = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
const TASK_FILTERS = ["ALL", "ACTIVE", "DONE", "OVERDUE"];
/* Priority filter chip row — "ALL" plus the four priority levels.
   "URGENT" is shown first so the most urgent quick-filter is closest
   to the search box. */
const TASK_PRIORITY_FILTERS = ["ALL", "URGENT", "HIGH", "MEDIUM", "LOW"];
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

/* ════════════════════════════════════════════════════════════════
   HARD-CODED PASSWORD to unlock money amounts
   ──────────────────────────────────────────────────────────────
   All monetary values (prices, totals, profit, expenses) are
   masked by default with •••. Click the eye icon in the header
   and enter this password to reveal them. Click again to re-lock.
   Change the value below to your own PIN.
   ════════════════════════════════════════════════════════════════ */
const MONEY_PASSWORD = "1234";

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
  bell: () => (
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
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  ),
  filter: () => (
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
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
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
  home: (p) => (
    <svg
      width={p?.size ?? 22}
      height={p?.size ?? 22}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  workshop: (p) => (
    <svg
      width={p?.size ?? 22}
      height={p?.size ?? 22}
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
  edit: () => (
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
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  ),
  search: () => (
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
      <circle cx="11" cy="11" r="8" />
      <line x1="21" x2="16.65" y1="21" y2="16.65" />
    </svg>
  ),
  eye: (p) => (
    <svg
      width={p?.size ?? 16}
      height={p?.size ?? 16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  eyeOff: (p) => (
    <svg
      width={p?.size ?? 16}
      height={p?.size ?? 16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" x2="23" y1="1" y2="23" />
    </svg>
  ),
  lock: (p) => (
    <svg
      width={p?.size ?? 22}
      height={p?.size ?? 22}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  unlock: (p) => (
    <svg
      width={p?.size ?? 22}
      height={p?.size ?? 22}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
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
/* money-masking helpers (depend on `moneyUnlocked` state — see below) */
const displayMoney = (unlocked, n) => (unlocked ? fmtDZD(n) : "•••• DZD");
const displayMoneyCompact = (unlocked, n) =>
  unlocked ? fmtDZDCompact(n) : "•••";
const maskChartValue = (unlocked, t) =>
  unlocked ? (t >= 1000 ? `${Math.round(t / 1000)}k` : t) : "•••";
const todayLabel = () =>
  new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
const todayISO = () => new Date().toISOString().slice(0, 10);
const shiftDateISO = (iso, days) => {
  if (!iso) return todayISO();
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return iso;
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
};
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

/* Pulls today's attendance status off of a raw worker record, trying
   every shape we've seen APIs use for this. This exists because the
   dashboard was writing attendance (batchUpdateAttendance) but never
   reading it back on load — so `attendance` state always started
   empty and every worker looked "not set" until you clicked one.
   If none of these match your API's shape, check the console.log
   below (fires once) to see the real field name and add it here. */
const ATTENDANCE_STATUS_SET = new Set(["PRESENT", "ABSENT"]);
const normalizeAttendanceStatus = (raw) => {
  if (!raw) return undefined;
  const v = String(raw).toUpperCase();
  if (ATTENDANCE_STATUS_SET.has(v)) return v;
  if (["PRESENT", "IN", "YES", "TRUE", "1"].includes(v)) return "PRESENT";
  if (["ABSENT", "OUT", "NO", "FALSE", "0"].includes(v)) return "ABSENT";
  return undefined;
};
const deriveWorkerAttendanceToday = (w) => {
  if (!w) return undefined;
  const today = todayISO();

  // Flat status fields directly on the worker record.
  const flatCandidates = [
    w.attendance_today,
    w.attendanceToday,
    w.today_status,
    w.todayStatus,
    w.status_today,
    w.attendance_status,
    w.attendanceStatus,
    // Only trust a bare `status`/`present` field if it actually looks
    // like an attendance value — workers can have unrelated `status`
    // fields (e.g. employment status) that would false-positive here.
    normalizeAttendanceStatus(w.status) ? w.status : undefined,
  ];
  for (const c of flatCandidates) {
    const n = normalizeAttendanceStatus(c);
    if (n) return n;
  }
  if (typeof w.present === "boolean") return w.present ? "PRESENT" : "ABSENT";
  if (typeof w.is_present === "boolean")
    return w.is_present ? "PRESENT" : "ABSENT";

  // A single nested "today" record: w.today_attendance / w.attendance (object)
  const nestedToday =
    w.today_attendance || w.todayAttendance || w.attendance_record;
  if (nestedToday && typeof nestedToday === "object") {
    const n = normalizeAttendanceStatus(nestedToday.status);
    if (n) return n;
  }
  if (
    w.attendance &&
    typeof w.attendance === "object" &&
    !Array.isArray(w.attendance)
  ) {
    const n = normalizeAttendanceStatus(
      w.attendance[today]?.status ?? w.attendance[today],
    );
    if (n) return n;
  }

  // An array of attendance records: w.attendances / w.attendance_records
  const list = w.attendances || w.attendance_records || w.attendanceRecords;
  if (Array.isArray(list)) {
    const rec = list.find(
      (r) => (r.date || r.attendance_date || "").slice(0, 10) === today,
    );
    if (rec) {
      const n = normalizeAttendanceStatus(rec.status);
      if (n) return n;
    }
  }

  return undefined;
};

const DB_STATE_TO_STAGE = {
  appointment: "APPOINTMENT",
  contract: "CONTRACT",
  in_production: "IN_PRODUCTION",
  ready_to_delivery: "READY_TO_DELIVER",
  completed: "COMPLETED",
};
const dbStateToStage = (state) =>
  DB_STATE_TO_STAGE[state] ?? (state || "appointment").toUpperCase();

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
   CHARTS (pure inline SVG, no deps)
   ════════════════════════════════════════════════════════════════ */
const LineChart = ({ data, width = 700, height = 200, formatAxis }) => {
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
  const fmtAxis =
    formatAxis || ((t) => (t >= 1000 ? `${Math.round(t / 1000)}k` : t));
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
              {fmtAxis(t)}
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

const DonutChart = ({ data, size = 140, thickness = 22, formatValue }) => {
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
  const fmt = formatValue || ((n) => fmtDZDCompact(n));
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
        {fmt(total)}
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
   FORMS — kept identical to the original (used by desktop + mobile)
   ════════════════════════════════════════════════════════════════ */
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

/* ════════════════════════════════════════════════════════════════
   PURE PRESENTATIONAL COMPONENTS — hoisted out of HomeDashboard
   These used to be declared *inside* HomeDashboard's function body.
   Every one of them only reads its own props (no closures over
   HomeDashboard's state), so nothing was gained by nesting them —
   except a bug: being redefined on every HomeDashboard render made
   React treat them as a brand-new component type each time, which
   force-remounted them (and any input/expand-collapse state inside,
   e.g. DesktopCollapsiblePanel/PwaPanel/PwaList/ExpandableSection's
   own useState) on every unrelated re-render. Living at module
   scope now, their identity is stable across renders.
   ════════════════════════════════════════════════════════════════ */
/* ─────── shared UI bits ─────── */
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

/* Desktop counterpart to PwaPanel: a `.panel` whose SectionHead
   doubles as a toggle button, with a chevron that rotates and the
   body hidden when closed. Used to make Recent Trips / Last 5
   Purchase Orders foldable on desktop the same way the mobile
   panels already are. */
const DesktopCollapsiblePanel = ({
  icon,
  title,
  action,
  defaultOpen = true,
  children,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="panel">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex items-center justify-between px-5 py-4 w-full"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          fontFamily: "inherit",
          borderBottom: open ? "1px solid var(--border)" : "none",
        }}
      >
        <h3 className="text-sm font-semibold flex items-center gap-2">
          {icon}
          {title}
        </h3>
        <span className="flex items-center gap-2">
          {action}
          <span
            style={{
              display: "inline-flex",
              color: "var(--ink-muted)",
              transition: "transform .15s ease",
              transform: open ? "rotate(0deg)" : "rotate(-90deg)",
              flexShrink: 0,
            }}
          >
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
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </span>
      </button>
      {open && children}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   PWA / MOBILE — collapsible panel + show-3-then-expand list
   (only used inside the .pwa-shell wrapper)
   ════════════════════════════════════════════════════════════ */
const PwaPanel = ({ title, icon, count, defaultOpen = true, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`panel ${open ? "" : "collapsed"}`}>
      <button
        className="panel-head"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="ph-icon">{icon}</span>
        <span className="ph-title">{title}</span>
        {count != null && <span className="ph-count">{count}</span>}
        <span className="ph-chev">
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
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>
      {open && <div className="panel-body">{children}</div>}
    </div>
  );
};

const PwaList = ({ items, render, empty, initial = 3, keyExtractor }) => {
  const [expanded, setExpanded] = useState(false);
  if (!items || items.length === 0) {
    return <div className="list-empty">{empty || "Nothing here yet"}</div>;
  }
  const visible = expanded ? items : items.slice(0, initial);
  return (
    <>
      {visible.map((item, i) => {
        const k = keyExtractor ? keyExtractor(item, i) : (item?.id ?? i);
        return <Fragment key={k}>{render(item, i)}</Fragment>;
      })}
      {items.length > initial && (
        <button className="list-more" onClick={() => setExpanded((e) => !e)}>
          {expanded ? "Show less" : `Show all (${items.length})`}
        </button>
      )}
    </>
  );
};

/* Desktop counterpart to PwaList: renders a `wrap`-supplied container
   (space-y-2 stack, table <tbody>, grid, etc.) with only the first
   `initial` items, plus a "Show more" button that reveals the rest.
   Each of the desktop panels below (Task Manager, Workers Today,
   Orders table, Low Stock) uses this instead of dumping every row
   into the DOM at once. */
const ExpandableSection = ({
  items,
  renderItem,
  initial = 5,
  keyExtractor,
  wrap,
  buttonWrap,
}) => {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, initial);
  const list = visible.map((item, i) => (
    <Fragment key={keyExtractor ? keyExtractor(item, i) : (item?.id ?? i)}>
      {renderItem(item, i)}
    </Fragment>
  ));
  const button = items.length > initial && (
    <button
      onClick={() => setExpanded((e) => !e)}
      className="w-full text-xs font-semibold py-2 rounded-md transition-colors"
      style={{ color: "var(--accent)", background: "var(--surface-2)" }}
    >
      {expanded ? "Show less" : `Show more (${items.length - initial})`}
    </button>
  );
  return (
    <>
      {wrap ? wrap(list) : list}
      {buttonWrap ? buttonWrap(button) : button}
    </>
  );
};

const PwaPipelineMini = ({ counts }) => {
  const total = counts.reduce((s, c) => s + c.value, 0) || 0;
  return (
    <div className="list-item" style={{ padding: 12 }}>
      <div
        style={{
          display: "flex",
          height: 8,
          borderRadius: 4,
          overflow: "hidden",
          background: "var(--surface-2)",
        }}
      >
        {counts.map((c) =>
          c.value > 0 ? (
            <div
              key={c.key}
              style={{
                width: `${(c.value / Math.max(1, total)) * 100}%`,
                background: c.color,
              }}
            />
          ) : null,
        )}
      </div>
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}
      >
        {counts.map((c) => (
          <div key={c.key} className="row" style={{ fontSize: 11 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 2,
                background: c.color,
                display: "inline-block",
              }}
            />
            <span className="muted">{c.label}</span>
            <span style={{ fontWeight: 600 }}>{c.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function HomeDashboard() {
  /* ─────── navigation ─────── */
  const router = useRouter();
  const openOrder = useCallback(
    (orderId) => {
      if (!orderId) return;
      router.push(`/orders?order=${encodeURIComponent(orderId)}`);
    },
    [router],
  );

  /* ─────── data state ─────── */
  const [workers, setWorkers] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [orders, setOrders] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [ledgerRefs, setLedgerRefs] = useState({ workers: [], suppliers: [] });
  const [recentPOs, setRecentPOs] = useState([]);
  const [tasks, setTasks] = useState([]);
  /* ── Fleet / trips ──
     The fleet page owns the full trip CRUD UI; the dashboard just shows
     a glance of the 5 most recent ones so the home view can answer
     "what's the truck been up to lately?" without a full route change. */
  const [vehicles, setVehicles] = useState([]);
  const [recentTrips, setRecentTrips] = useState([]);
  const [tripsLoading, setTripsLoading] = useState(false);

  /* ─────── ui state ─────── */
  const [filter, setFilter] = useState("ALL");
  const [taskFilter, setTaskFilter] = useState("ALL");
  const [taskPriorityFilter, setTaskPriorityFilter] = useState("ALL"); // ALL | URGENT | HIGH | MEDIUM | LOW
  const [taskSearch, setTaskSearch] = useState("");
  const [taskDay, setTaskDay] = useState(todayISO()); // selected day in task manager
  const [notifPermission, setNotifPermission] = useState("default"); // "default" | "granted" | "denied" | "unsupported"
  // activePop (order stage popover) was removed along with setOrderStage —
  // stage is read-only on this dashboard now.
  const [modal, setModal] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loadingAll, setLoadingAll] = useState(true);
  const { toasts, push, dismiss } = useToasts();

  /* ─────── money-mask state ─────── */
  const [moneyUnlocked, setMoneyUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const toggleMoneyLock = () => {
    if (moneyUnlocked) {
      setMoneyUnlocked(false);
      push("Amounts hidden", "info");
    } else {
      setPasswordInput("");
      setPasswordError("");
      setModal({ type: "PASSWORD" });
    }
  };
  const submitPassword = () => {
    if (passwordInput === MONEY_PASSWORD) {
      setMoneyUnlocked(true);
      setPasswordInput("");
      setPasswordError("");
      setModal(null);
      push("Amounts visible", "success");
    } else {
      setPasswordError("Wrong password");
      setPasswordInput("");
    }
  };

  /* ─────── mobile / pwa tab state ─────── */
  // isMobile MUST start as a value that matches what the server rendered
  // (the server has no `window`, so it always renders the desktop layout).
  // Reading window.innerWidth in the useState initializer caused a
  // hydration mismatch: the client's very first render already said
  // "mobile" while the server-sent HTML said "desktop", so React threw
  // away the whole tree and rebuilt it — that's the "renders 7 times"
  // loop. Keep this at false and only correct it in the effect below,
  // which only runs after hydration has completed.
  const [isMobile, setIsMobile] = useState(false);
  const [pwaTab, setPwaTab] = useState("home");
  useEffect(() => {
    if (typeof window === "undefined") return;
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* ─────── data loaders ─────── */
  const loadAll = useCallback(async () => {
    setLoadingAll(true);
    try {
      const ym = currentYM();
      const monthKey = thisMonthKey();
      const [w, o, m, s, l, refs, tk] = await Promise.allSettled([
        fetchWorkers(),
        fetchOrders({ page: 1, pageSize: 100 }),
        getAllMaterialsClient(),
        getSuppliers(),
        fetchLedgerEntries({ pageSize: 500 }),
        fetchLedgerReferenceData(),
        fetchTasks(),
      ]);
      if (w.status === "fulfilled") {
        const workerList = safe(w.value?.data ?? w.value);
        setWorkers(workerList);
        // One-time debug aid: log the raw shape of the first worker so
        // it's obvious in devtools which field actually carries today's
        // attendance, in case deriveWorkerAttendanceToday needs a new
        // field name added to it.
        if (workerList[0]) {
          console.log(
            "[attendance debug] sample worker record from fetchWorkers():",
            workerList[0],
          );
        }
        setAttendance((prev) => {
          const next = { ...prev };
          let foundAny = false;
          workerList.forEach((wk) => {
            // Don't clobber a status the user already set locally
            // this session (e.g. an optimistic update mid-save).
            if (next[wk.id] !== undefined) return;
            const derived = deriveWorkerAttendanceToday(wk);
            if (derived) {
              next[wk.id] = derived;
              foundAny = true;
            }
          });
          if (!foundAny && workerList.length > 0) {
            console.warn(
              "[attendance debug] Could not find today's attendance on any worker record. " +
                "Check the logged sample above for the real field name and add it to deriveWorkerAttendanceToday().",
            );
          }
          return next;
        });
      }
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
      if (tk.status === "fulfilled")
        setTasks(safe(tk.value?.data ?? tk.value).map(normalizeTask));
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
      if (tk.status === "rejected")
        console.error("fetchTasks failed:", tk.reason);

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
        const allPOs = [];
        results.forEach((r, i) => {
          if (r.status === "fulfilled" && r.value) {
            const list = safe(r.value?.operations);
            list.forEach((po) => {
              allPOs.push({ ...po, supplier: supList[i].name });
            });
          }
        });
        allPOs.sort((a, b) => new Date(b.date) - new Date(a.date));
        setRecentPOs(allPOs.slice(0, 5));
      }

      /* ── Recent trips across all vehicles ──
         The fleet page already calls /api/vehicles_trips?vehicleId=… to
         load a single truck's log, so we mirror that pattern here. We
         first pull the vehicle list, then fan out one trip fetch per
         vehicle, flatten, sort by date desc, and keep the top 5. The
         whole block is wrapped in its own try/catch so a flaky trip
         endpoint never breaks the rest of the dashboard load. */
      try {
        setTripsLoading(true);
        const vRes = await fetch("/api/vehicles");
        if (vRes.ok) {
          const vJson = await vRes.json();
          const vList = safe(vJson?.data ?? vJson?.vehicles ?? vJson ?? []).map(
            (v) => ({
              id: String(v.id),
              name: v.name || v.plate_number || `Vehicle #${v.id}`,
              plate: v.plate_number || v.identifier || "",
            }),
          );
          setVehicles(vList);

          if (vList.length > 0) {
            const tripResults = await Promise.allSettled(
              vList.map((v) =>
                fetch(`/api/vehicles_trips?vehicleId=${v.id}`)
                  .then((r) => (r.ok ? r.json() : null))
                  .then((d) => {
                    const list = safe(d?.data ?? d ?? []);
                    return list.map((t) => ({ ...t, truckId: v.id }));
                  })
                  .catch(() => []),
              ),
            );
            const merged = [];
            tripResults.forEach((r) => {
              if (r.status === "fulfilled" && Array.isArray(r.value)) {
                merged.push(...r.value);
              }
            });
            merged.sort((a, b) =>
              String(b.date || "").localeCompare(String(a.date || "")),
            );
            setRecentTrips(merged.slice(0, 5));
          } else {
            setRecentTrips([]);
          }
        }
      } catch (tripsErr) {
        console.error("loadRecentTrips failed:", tripsErr);
      } finally {
        setTripsLoading(false);
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
  const monthIncome = ordersThisMonth.reduce(
    (s, o) => s + Number(o.paid || 0),
    0,
  );
  const monthExpenses = ledgerThisMonth
    .filter((e) => e.type !== "INCOME")
    .reduce((s, e) => s + Number(e.amount || 0), 0);
  const monthProfit = monthIncome - monthExpenses;
  const monthMargin = monthIncome > 0 ? (monthProfit / monthIncome) * 100 : 0;

  const ledgerSeries = useMemo(() => {
    const out = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const entries = ledger.filter((e) => (e.date || "").startsWith(k));
      const monthOrders = orders.filter(
        (o) =>
          (o.dueDate || o.deliveryDate || "").startsWith(k) ||
          (o.createdAt || "").startsWith(k),
      );
      out.push({
        label: d.toLocaleDateString("en-US", { month: "short" }),
        income: monthOrders.reduce((s, o) => s + Number(o.paid || 0), 0),
        expenses: entries
          .filter((e) => e.type !== "INCOME")
          .reduce((s, e) => s + Number(e.amount || 0), 0),
      });
    }
    return out;
  }, [ledger, orders]);

  const expenseBreakdown = useMemo(() => {
    const totals = {};
    ledgerThisMonth
      .filter((e) => e.type !== "INCOME")
      .forEach((e) => {
        const k = e.type || "OTHER_EXPENSE";
        totals[k] = (totals[k] || 0) + Number(e.amount || 0);
      });
    return LEDGER_TYPES.filter((t) => t.value !== "INCOME")
      .map((t) => ({ ...t, value: totals[t.value] || 0 }))
      .filter((t) => t.value > 0);
  }, [ledgerThisMonth]);

  const lowStockMaterials = useMemo(
    () => materials.filter((m) => Number(m.stock) <= Number(m.minStock)),
    [materials],
  );

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
  const isTaskOverdue = (t) => !t.done && !!t.dueDate && t.dueDate < todayISO();
  const overdueTasks = tasks.filter(isTaskOverdue).length;
  const urgentTasks = tasks.filter(
    (t) => !t.done && t.priority === "URGENT",
  ).length;
  const dueTodayTasks = tasks.filter(
    (t) => !t.done && t.dueDate === todayISO(),
  ).length;
  const visibleTasks = useMemo(() => {
    const q = taskSearch.trim().toLowerCase();
    return tasks
      .filter((t) => {
        if (taskDay && t.dueDate && t.dueDate !== taskDay) return false;
        if (taskFilter === "ACTIVE" && t.done) return false;
        if (taskFilter === "DONE" && !t.done) return false;
        if (taskFilter === "OVERDUE" && !isTaskOverdue(t)) return false;
        if (taskPriorityFilter !== "ALL" && t.priority !== taskPriorityFilter)
          return false;
        if (q && !t.text.toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a, b) => {
        if (a.done !== b.done) return a.done ? 1 : -1;
        const pr =
          (TASK_PRIORITY_RANK[a.priority] ?? 9) -
          (TASK_PRIORITY_RANK[b.priority] ?? 9);
        if (pr !== 0) return pr;
        const aKey = `${a.dueDate || ""}T${a.dueTime || "99:99"}`;
        const bKey = `${b.dueDate || ""}T${b.dueTime || "99:99"}`;
        return aKey.localeCompare(bKey);
      });
  }, [tasks, taskFilter, taskPriorityFilter, taskSearch, taskDay]);

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
    setAttendance((prev) => {
      const next = { ...prev };
      if (status === undefined) delete next[workerId];
      else next[workerId] = status;
      return next;
    });
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
        setAttendance((prev) => ({ ...prev, [workerId]: prevStatus }));
        console.error("batchUpdateAttendance failed:", e);
        push("Failed to save attendance", "error");
      }
    }, 800);
  };

  // Note: order stage is intentionally read-only on this dashboard now —
  // there used to be a setOrderStage(orderId, stage) handler here wired
  // to a "move to stage" popover on both the mobile and desktop views;
  // both were removed on request, so this is gone too.

  const toggleTask = async (id) => {
    const prevTasks = tasks;
    const target = tasks.find((t) => t.id === id);
    if (!target) return;
    const nextDone = !target.done;
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: nextDone } : t)),
    );
    try {
      const res = await patchTaskClient(id, { done: nextDone });
      const confirmed = normalizeTask(res?.data ?? res);
      setTasks((prev) => prev.map((t) => (t.id === id ? confirmed : t)));
    } catch (e) {
      setTasks(prevTasks);
      console.error("patchTaskClient (toggle) failed:", e);
      push("Failed to update task — change was not saved", "error");
    }
  };

  const addTask = async (data) => {
    const text = (data.text || "").trim();
    if (!text) return;
    // Optimistic placeholder while the server assigns a real id.
    const tempId = `temp-${Date.now()}`;
    const optimisticTask = {
      id: tempId,
      text,
      done: false,
      priority: data.priority || "MEDIUM",
      dueDate: data.dueDate || "",
      dueTime: data.dueTime || null,
      assignee: data.assignee || null,
      notified: false,
    };
    setTasks((prev) => [...prev, optimisticTask]);
    try {
      const res = await createTaskClient({
        text,
        priority: data.priority || "MEDIUM",
        dueDate: data.dueDate || null,
        dueTime: data.dueTime || null,
        assignee: data.assignee || null,
      });
      const confirmed = normalizeTask(res?.data ?? res);
      setTasks((prev) => prev.map((t) => (t.id === tempId ? confirmed : t)));
      push("Task added", "success");
    } catch (e) {
      setTasks((prev) => prev.filter((t) => t.id !== tempId));
      console.error("createTaskClient failed:", e);
      push("Failed to add task", "error");
    }
  };

  const updateTaskDetails = async (id, data) => {
    const prevTasks = tasks;
    const current = tasks.find((t) => t.id === id);
    if (!current) return;
    // Reset notified flag if the time/date changed so the new
    // schedule can re-trigger an alert.
    const dueChanged =
      (data.dueTime ?? current.dueTime) !== current.dueTime ||
      (data.dueDate ?? current.dueDate) !== current.dueDate;
    const patch = { ...data, notified: dueChanged ? false : current.notified };
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    try {
      const res = await patchTaskClient(id, patch);
      const confirmed = normalizeTask(res?.data ?? res);
      setTasks((prev) => prev.map((t) => (t.id === id ? confirmed : t)));
      push("Task updated", "success");
    } catch (e) {
      setTasks(prevTasks);
      console.error("patchTaskClient (update) failed:", e);
      push("Failed to update task — change was not saved", "error");
    }
  };

  const deleteTask = async (id) => {
    const prevTasks = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await deleteTaskClient(id);
      push("Task removed", "info");
    } catch (e) {
      setTasks(prevTasks);
      console.error("deleteTaskClient failed:", e);
      push("Failed to remove task — change was not saved", "error");
    }
  };

  /* ─────── browser notifications for tasks ─────── */
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setNotifPermission("unsupported");
      return;
    }
    setNotifPermission(Notification.permission);
  }, []);
  const requestNotifPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setNotifPermission("unsupported");
      push("Notifications aren't supported here", "error");
      return;
    }
    try {
      const res = await Notification.requestPermission();
      setNotifPermission(res);
      if (res === "granted") {
        push("Notifications enabled", "success");
        new Notification("Notifications enabled", {
          body: "You'll be alerted when a task is due.",
        });
      } else if (res === "denied") {
        push("Notifications blocked in browser settings", "info");
      }
    } catch (e) {
      console.error("Notification.requestPermission failed", e);
    }
  };
  useEffect(() => {
    if (typeof window === "undefined") return;
    // Track which tasks we've already alerted on this session, so
    // we never fire the same notification twice (also covers React
    // StrictMode double-invokes of the effect).
    const firedRef = new Set();
    const fireTaskNotification = (t, when) => {
      const title = `Task: ${t.text}`;
      const body = `${when}${t.assignee ? " · " + t.assignee : ""}`;
      const key = `${t.id}::${when}`;
      if (firedRef.has(key)) return;
      firedRef.add(key);
      try {
        if (
          typeof window !== "undefined" &&
          "Notification" in window &&
          Notification.permission === "granted"
        ) {
          new Notification(title, { body, tag: `task-${t.id}` });
        }
      } catch (e) {
        console.error("Notification failed", e);
      }
      push(`${when} — ${t.text}`, "info");
    };
    const tick = () => {
      const now = new Date();
      const today = todayISO();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const cur = `${hh}:${mm}`;
      const toMarkNotified = [];
      tasks.forEach((t) => {
        if (t.done || t.notified) return;
        // Whole-day task: notify at 9:00 the day of.
        if (t.dueDate && !t.dueTime) {
          if (t.dueDate === today && cur === "09:00") {
            fireTaskNotification(t, "Due today");
            toMarkNotified.push(t.id);
          }
          return;
        }
        // Timed task: notify when the clock hits the time on the due day,
        // and ping the day before at 20:00 as a heads-up.
        if (t.dueDate && t.dueTime) {
          if (t.dueDate === today && cur >= t.dueTime) {
            fireTaskNotification(t, `Due now (${t.dueTime})`);
            toMarkNotified.push(t.id);
            return;
          }
          const tomorrow = shiftDateISO(today, 1);
          if (t.dueDate === tomorrow && cur === "20:00") {
            fireTaskNotification(t, "Due tomorrow");
            toMarkNotified.push(t.id);
            return;
          }
          const yest = shiftDateISO(today, -1);
          if (t.dueDate === yest && cur === "09:00") {
            fireTaskNotification(t, "Overdue (was due yesterday)");
            toMarkNotified.push(t.id);
          }
        }
      });
      if (toMarkNotified.length > 0) {
        setTasks((prev) =>
          prev.map((t) =>
            toMarkNotified.includes(t.id) ? { ...t, notified: true } : t,
          ),
        );
        // Fire-and-forget: persist so the reminder doesn't re-fire after
        // a reload. A failure here just means one extra notification
        // later — not worth blocking or rolling back the UI over.
        toMarkNotified.forEach((id) => {
          patchTaskClient(id, { notified: true }).catch((e) =>
            console.error("patchTaskClient (notified) failed:", e),
          );
        });
      }
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [tasks, push]);

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

  const createOrder = async (data) => {
    setBusy(true);
    try {
      const payload = {
        client: data.client,
        phone: data.phone || null,
        address: data.address || null,
        project: data.project,
        amount: Number(data.amount) || 0,
        dueDate: data.dueDate || null,
        stage: (data.stage || "APPOINTMENT").toUpperCase(),
        worker: data.worker || null,
        items: (data.items || []).map((i) => ({
          name: i.name,
          qty: Number(i.qty) || 1,
          unit: i.unit || "pcs",
          l: i.l === "" || i.l == null ? 0 : Number(i.l),
          w: i.w === "" || i.w == null ? 0 : Number(i.w),
          h: i.h === "" || i.h == null ? 0 : Number(i.h),
        })),
        payments: [],
        missingItems: [],
        technical: data.technical || { truckDistance: "", floor: "", fee: "" },
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
    push(
      `Worker "${data.name}" will appear after activation in workers page`,
      "info",
    );
    setModal(null);
  };


  /* ════════════════════════════════════════════════════════════
     RECENT TRIPS — last 5 across all vehicles
     The fleet page owns the full CRUD UI; the dashboard just shows
     a glance of the 5 most recent trips so the home view can answer
     "what's the truck been up to lately?" without route-hopping.
     `compact` flips between the desktop (panel-hover rows, full date
     + distance + cost) and the PWA (denser rows, less chrome) look.
     ════════════════════════════════════════════════════════════ */
  const TRIP_PURPOSE_META = {
    DELIVERY: { label: "Delivery", color: "#22c55e" },
    PICKUP: { label: "Pickup", color: "#3b82f6" },
    TRANSFER: { label: "Transfer", color: "#a855f7" },
    MAINTENANCE: { label: "Maintenance", color: "#f59e0b" },
    PERSONAL: { label: "Personal", color: "#94a3b8" },
  };
  const tripPurposeMeta = (p) =>
    TRIP_PURPOSE_META[p] || { label: p || "—", color: "var(--ink-muted)" };
  const tripDistance = (t) =>
    Math.max(0, (Number(t.endKm) || 0) - (Number(t.startKm) || 0));

  const RecentTripsList = ({ compact = false }) => {
    if (tripsLoading && recentTrips.length === 0) {
      return (
        <div className={compact ? "p-2 space-y-2" : "p-3 space-y-2"}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} h={compact ? 44 : 52} />
          ))}
        </div>
      );
    }
    if (recentTrips.length === 0) {
      return (
        <div
          className="p-6 text-center text-sm"
          style={{ color: "var(--ink-muted)" }}
        >
          No trips logged yet
        </div>
      );
    }
    return (
      <div>
        {recentTrips.map((t) => {
          const meta = tripPurposeMeta(t.purpose);
          const dist = tripDistance(t);
          const order = orders.find((o) => o.id === t.orderId);
          const vehicle = vehicles.find((v) => v.id === t.truckId);
          const secondary = order ? order.name : vehicle ? vehicle.name : "—";
          return (
            <div
              key={t.id}
              className={compact ? "list-item" : "panel-hover"}
              style={
                compact
                  ? undefined
                  : {
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 12px",
                      borderTop: "1px solid var(--border)",
                    }
              }
            >
              {/* Purpose chip — color is the same dot used in the
                 fleet page so the eye can scan the row without
                 reading the label. */}
              <div
                className="shrink-0 rounded-md flex items-center justify-center"
                style={{
                  width: compact ? 32 : 36,
                  height: compact ? 32 : 36,
                  background: `${meta.color}1a`,
                  color: meta.color,
                }}
              >
                <Icons.truck />
              </div>
              <div className="grow" style={{ minWidth: 0 }}>
                <div
                  className="row"
                  style={{ gap: 6, marginBottom: compact ? 2 : 3 }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: ".04em",
                      textTransform: "uppercase",
                      color: meta.color,
                    }}
                  >
                    {meta.label}
                  </span>
                  <span className="muted" style={{ fontSize: 11 }}>
                    ·
                  </span>
                  <span
                    className="truncate"
                    style={{
                      fontSize: compact ? 12 : 13,
                      fontWeight: 500,
                      color: "var(--ink)",
                    }}
                  >
                    {secondary}
                  </span>
                </div>
                <div className="row muted" style={{ fontSize: 11, gap: 6 }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Icons.calendar /> {t.date}
                  </span>
                  <span>·</span>
                  <span className="tabular-nums">{dist} km</span>
                  {!compact && t.notes ? (
                    <>
                      <span>·</span>
                      <span className="truncate">{t.notes}</span>
                    </>
                  ) : null}
                </div>
              </div>
              <div className="shrink-0" style={{ textAlign: "right" }}>
                <div
                  className="font-bold tabular-nums"
                  style={{
                    fontSize: compact ? 13 : 14,
                    color: "var(--stage-contract)",
                  }}
                >
                  {displayMoneyCompact(moneyUnlocked, t.cost)}
                </div>
                <div
                  className="muted"
                  style={{ fontSize: 10, letterSpacing: ".04em" }}
                >
                  DZD
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  /* Desktop shell: now a foldable DesktopCollapsiblePanel instead of a
     static SectionHead + panel, so it can be collapsed/expanded. */
  const RecentTripsPanelDesktop = () => (
    <DesktopCollapsiblePanel
      icon={<Icons.truck />}
      title={`Recent Trips (${recentTrips.length})`}
      defaultOpen
      action={
        <span
          className="text-[11px] font-semibold"
          style={{ color: "var(--ink-muted)" }}
        >
          Last 5 across fleet
        </span>
      }
    >
      {RecentTripsList({})}
    </DesktopCollapsiblePanel>
  );

  /* PWA shell: collapsible PwaPanel with chevron + count badge. */
  const RecentTripsPanelPwa = () => (
    <PwaPanel
      title="Recent Trips"
      icon={<Icons.truck />}
      count={recentTrips.length}
      defaultOpen
    >
      {RecentTripsList({ compact: true })}
    </PwaPanel>
  );

  /* ════════════════════════════════════════════════════════════
     PWA TABS
     ════════════════════════════════════════════════════════════ */

  const PwaHomeTab = () => {
    const greeting = (() => {
      const h = new Date().getHours();
      if (h < 12) return "Good morning";
      if (h < 18) return "Good afternoon";
      return "Good evening";
    })();
    return (
      <div className="tab-pane">
        {/* Greeting + date */}
        <div style={{ padding: "4px 4px 12px" }}>
          <div className="muted" style={{ fontSize: 11, fontWeight: 500 }}>
            {todayLabel()}
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: "2px 0 0" }}>
            {greeting}, Amine 👋
          </h2>
          <p className="muted" style={{ fontSize: 12, marginTop: 4 }}>
            {completedTasks}/{tasks.length} tasks · {workersPresent}/
            {workersTotal} on floor
          </p>
        </div>

        {/* New Order CTA — most important action */}
        <button
          className="pwa-cta"
          onClick={() => setModal({ type: "NEW_ORDER" })}
        >
          <Icons.plus /> New Order
        </button>

        {/* Task manager (full) — redesigned nav: search → day nav →
           combined status + priority filter row → list. */}
        <div style={{ marginTop: 12 }}>
          <PwaPanel
            title="Task Manager"
            icon={<Icons.check size={14} />}
            count={`${completedTasks}/${tasks.length}`}
            defaultOpen
          >
            {/* Search bar — full width, with a clear button that
               only appears when there's text. Stays inside the
               panel so it scrolls with the rest of the manager. */}
            <div
              style={{
                position: "relative",
                padding: "10px 12px 8px",
                borderTop: "1px solid var(--border)",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  left: 22,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--ink-muted)",
                  display: "flex",
                  alignItems: "center",
                  pointerEvents: "none",
                }}
              >
                <Icons.search />
              </span>
              <input
                type="text"
                placeholder="Search tasks…"
                value={taskSearch}
                onChange={(e) => setTaskSearch(e.target.value)}
                aria-label="Search tasks"
                style={{
                  width: "100%",
                  padding: "9px 32px 9px 32px",
                  borderRadius: 8,
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  color: "var(--ink)",
                  fontSize: 13,
                  fontFamily: "inherit",
                  WebkitAppearance: "none",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = "var(--accent)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "var(--border)")
                }
              />
              {taskSearch && (
                <button
                  type="button"
                  onClick={() => setTaskSearch("")}
                  aria-label="Clear search"
                  style={{
                    position: "absolute",
                    right: 18,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--ink-muted)",
                    width: 20,
                    height: 20,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 999,
                    WebkitTapHighlightColor: "transparent",
                    padding: 0,
                  }}
                >
                  <Icons.x />
                </button>
              )}
            </div>
            {/* Day nav — the new two-row pager + quick-jump pills. */}
            <TaskDayNav
              taskDay={taskDay}
              onChange={setTaskDay}
              notifPermission={notifPermission}
              onRequestNotif={requestNotifPermission}
              tasks={tasks}
            />
            {/* Combined filter strip — status chips on the left,
               priority chips on the right, with a divider. A
               small "Clear" link appears only when something is
               non-default, so the default state stays uncluttered. */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 12px",
                borderTop: "1px solid var(--border)",
                overflowX: "auto",
                msOverflowStyle: "none",
                scrollbarWidth: "none",
              }}
            >
              {TASK_FILTERS.map((f) => {
                const active = taskFilter === f;
                return (
                  <button
                    key={f}
                    onClick={() => setTaskFilter(f)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 500,
                      background: active
                        ? "var(--accent-soft)"
                        : "var(--surface-2)",
                      color: active ? "var(--accent)" : "var(--ink-muted)",
                      border: `1px solid ${active ? "var(--accent)" : "transparent"}`,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      minHeight: 28,
                      flexShrink: 0,
                    }}
                  >
                    {f === "ALL"
                      ? "All"
                      : f === "ACTIVE"
                        ? "Active"
                        : f === "DONE"
                          ? "Done"
                          : "Overdue"}
                  </button>
                );
              })}
              <span
                style={{
                  width: 1,
                  height: 14,
                  background: "var(--border)",
                  flexShrink: 0,
                  margin: "0 2px",
                }}
              />
              {TASK_PRIORITY_FILTERS.map((p) => {
                const isActive = taskPriorityFilter === p;
                const meta = TASK_PRIORITIES.find((x) => x.value === p);
                return (
                  <button
                    key={p}
                    onClick={() => setTaskPriorityFilter(p)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 500,
                      background:
                        isActive && meta
                          ? `${meta.color}1F`
                          : isActive
                            ? "var(--accent-soft)"
                            : "var(--surface-2)",
                      color:
                        isActive && meta
                          ? meta.color
                          : isActive
                            ? "var(--accent)"
                            : "var(--ink-muted)",
                      border: `1px solid ${
                        isActive && meta
                          ? `${meta.color}55`
                          : isActive
                            ? "var(--accent)"
                            : "transparent"
                      }`,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      minHeight: 28,
                      flexShrink: 0,
                    }}
                  >
                    {p === "ALL" ? "All priority" : meta?.label || p}
                  </button>
                );
              })}
              {(taskFilter !== "ALL" ||
                taskPriorityFilter !== "ALL" ||
                taskSearch) && (
                <button
                  type="button"
                  onClick={() => {
                    setTaskFilter("ALL");
                    setTaskPriorityFilter("ALL");
                    setTaskSearch("");
                  }}
                  style={{
                    flexShrink: 0,
                    marginLeft: "auto",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--ink-muted)",
                    fontFamily: "inherit",
                    fontSize: 10,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: ".04em",
                    padding: "4px 6px",
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  Clear
                </button>
              )}
            </div>
            <PwaList
              items={visibleTasks}
              empty={
                taskDay === todayISO()
                  ? "No tasks for today"
                  : taskDay === shiftDateISO(todayISO(), 1)
                    ? "No tasks for tomorrow"
                    : "No tasks for this day"
              }
              initial={3}
              render={(t) => {
                const prio =
                  TASK_PRIORITIES.find((p) => p.value === t.priority) ||
                  TASK_PRIORITIES[1];
                const overdue = isTaskOverdue(t);
                return (
                  <div
                    className="list-item row"
                    onClick={() => toggleTask(t.id)}
                    style={{
                      cursor: "pointer",
                      gap: 10,
                      // Priority color rail + subtle tint when not done.
                      borderLeft: `3px solid ${prio.color}`,
                      paddingLeft: 13,
                      paddingRight: 12,
                      paddingTop: 12,
                      paddingBottom: 12,
                      background: t.done ? "transparent" : `${prio.color}0A`,
                    }}
                  >
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTask(t.id);
                      }}
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 4,
                        flexShrink: 0,
                        border: "1.5px solid",
                        cursor: "pointer",
                        // Checkbox border matches the priority color
                        // so unchecked tasks already hint at urgency.
                        borderColor: t.done ? prio.color : prio.color + "55",
                        background: t.done ? prio.color : "transparent",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {t.done && <Icons.check />}
                    </div>
                    <div className="grow" style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          textDecoration: t.done ? "line-through" : "none",
                          color: t.done ? "var(--ink-muted)" : "var(--ink)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {t.text}
                      </div>
                      <div
                        className="row"
                        style={{
                          gap: 6,
                          marginTop: 5,
                          flexWrap: "wrap",
                          alignItems: "center",
                        }}
                      >
                        <PriorityChip priority={t.priority} dense />
                        {t.dueTime && (
                          <span
                            style={{
                              fontSize: 9,
                              fontWeight: 600,
                              padding: "1px 5px",
                              borderRadius: 4,
                              background: TASK_BLUE_SOFT,
                              color: TASK_BLUE,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 3,
                            }}
                          >
                            <Icons.clock /> {t.dueTime}
                          </span>
                        )}
                        {t.dueDate && overdue && (
                          <span
                            style={{
                              fontSize: 9,
                              fontWeight: 600,
                              padding: "1px 5px",
                              borderRadius: 4,
                              background: "rgba(239,68,68,0.12)",
                              color: "var(--stage-contract)",
                            }}
                          >
                            Overdue
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }}
            />
            <div
              className="list-more"
              onClick={() => setModal({ type: "NEW_TASK" })}
              style={{ borderTop: "1px solid var(--border)" }}
            >
              + Add Task
            </div>
          </PwaPanel>
        </div>
      </div>
    );
  };

  const PwaMoneyTab = () => (
    <div className="tab-pane">
      <div style={{ padding: "4px 4px 12px" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Money</h2>
        <p className="muted" style={{ fontSize: 12, marginTop: 2 }}>
          Income, expenses, and net profit
        </p>
      </div>

      <PwaPanel title="Net this month" icon={<Icons.money />} defaultOpen>
        <div className="list-item">
          <div className="row" style={{ marginBottom: 12 }}>
            <div className="grow">
              <div
                className="muted"
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: ".04em",
                }}
              >
                Profit
              </div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  marginTop: 4,
                  color:
                    monthProfit >= 0
                      ? "var(--stage-completed)"
                      : "var(--stage-contract)",
                }}
              >
                {displayMoneyCompact(moneyUnlocked, monthProfit)}{" "}
                <span style={{ fontSize: 12, fontWeight: 500 }}>DZD</span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="muted" style={{ fontSize: 11 }}>
                margin
              </div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>
                {monthIncome > 0 ? `${monthMargin.toFixed(0)}%` : "—"}
              </div>
            </div>
          </div>
          <div style={{ marginBottom: 8 }}>
            <div className="row" style={{ fontSize: 11, marginBottom: 4 }}>
              <span className="grow muted">Income</span>
              <span style={{ fontWeight: 600 }}>
                {displayMoneyCompact(moneyUnlocked, monthIncome)} DZD
              </span>
            </div>
            <div
              style={{
                height: 6,
                borderRadius: 3,
                background: "var(--surface-2)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background: "var(--stage-completed)",
                }}
              />
            </div>
          </div>
          <div>
            <div className="row" style={{ fontSize: 11, marginBottom: 4 }}>
              <span className="grow muted">Expenses</span>
              <span style={{ fontWeight: 600 }}>
                {displayMoneyCompact(moneyUnlocked, monthExpenses)} DZD
              </span>
            </div>
            <div
              style={{
                height: 6,
                borderRadius: 3,
                background: "var(--surface-2)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width:
                    monthIncome > 0
                      ? `${Math.min(100, (monthExpenses / monthIncome) * 100)}%`
                      : "0%",
                  height: "100%",
                  background: "var(--stage-contract)",
                }}
              />
            </div>
          </div>
        </div>
      </PwaPanel>

      <PwaPanel title="Revenue vs expenses" icon={<Icons.trend />} defaultOpen>
        <div
          className="list-item"
          style={{ paddingTop: 12, paddingBottom: 12 }}
        >
          <div
            className="chart-legend"
            style={{ marginBottom: 6, justifyContent: "flex-end" }}
          >
            <span>
              <span
                className="chart-legend-dot"
                style={{ background: "#22c55e" }}
              />
              Income
            </span>
            <span>
              <span
                className="chart-legend-dot"
                style={{ background: "#f59e0b" }}
              />
              Expenses
            </span>
          </div>
          <LineChart
            data={ledgerSeries}
            width={360}
            height={180}
            formatAxis={(t) => maskChartValue(moneyUnlocked, t)}
          />
        </div>
      </PwaPanel>

      {expenseBreakdown.length > 0 && (
        <PwaPanel
          title="Expense breakdown"
          icon={<Icons.cog />}
          defaultOpen={false}
        >
          <div className="list-item row" style={{ flexWrap: "wrap", gap: 16 }}>
            <DonutChart
              data={expenseBreakdown}
              size={120}
              thickness={18}
              formatValue={(n) => displayMoneyCompact(moneyUnlocked, n)}
            />
            <div className="grow">
              {expenseBreakdown.map((t) => (
                <div
                  key={t.label}
                  className="row"
                  style={{ fontSize: 12, marginBottom: 6 }}
                >
                  <span
                    className="chart-legend-dot"
                    style={{ background: t.color }}
                  />
                  <span className="grow muted">{t.label}</span>
                  <span style={{ fontWeight: 600 }}>
                    {displayMoneyCompact(moneyUnlocked, t.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </PwaPanel>
      )}

      <PwaPanel title="KPI overview" icon={<Icons.chart />} defaultOpen={false}>
        <div className="kpi-grid" style={{ margin: 10 }}>
          <div className="kpi-card">
            <div className="k-label">Revenue</div>
            <div className="k-value">
              {displayMoneyCompact(moneyUnlocked, monthIncome)}
            </div>
            <div className="k-sub">DZD this month</div>
          </div>
          <div className="kpi-card">
            <div className="k-label">Expenses</div>
            <div className="k-value">
              {displayMoneyCompact(moneyUnlocked, monthExpenses)}
            </div>
            <div className="k-sub">{expenseBreakdown.length} categories</div>
          </div>
          <div className="kpi-card">
            <div className="k-label">Net profit</div>
            <div
              className="k-value"
              style={{
                color:
                  monthProfit >= 0
                    ? "var(--stage-completed)"
                    : "var(--stage-contract)",
              }}
            >
              {displayMoneyCompact(moneyUnlocked, monthProfit)}
            </div>
            <div className="k-sub">
              {monthIncome > 0 ? `${monthMargin.toFixed(0)}% margin` : "—"}
            </div>
          </div>
          <div className="kpi-card">
            <div className="k-label">Orders · month</div>
            <div className="k-value">{ordersThisMonth.length}</div>
            <div className="k-sub">
              {
                ordersThisMonth.filter((o) => o.stage === "IN_PRODUCTION")
                  .length
              }{" "}
              in production
            </div>
          </div>
        </div>
      </PwaPanel>
    </div>
  );

  const PwaWorkshopTab = () => (
    <div className="tab-pane">
      <div style={{ padding: "4px 4px 12px" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Workshop</h2>
        <p className="muted" style={{ fontSize: 12, marginTop: 2 }}>
          Workers, stock, purchases, and trips
        </p>
      </div>

      <PwaPanel
        title="Workers"
        icon={<Icons.workers />}
        count={workers.length}
        defaultOpen
      >
        <PwaList
          items={workers}
          empty="No workers yet"
          initial={3}
          render={(w) => {
            const status = attendance[w.id];
            const name = w.full_name || w.shortName || w.name || "Worker";
            const isPresent = status === "PRESENT";
            const isAbsent = status === "ABSENT";
            return (
              <div className="list-item row">
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    background: "var(--surface-2)",
                    color: "var(--accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                    position: "relative",
                    flexShrink: 0,
                  }}
                >
                  {initials(name)}
                  {isPresent && (
                    <span
                      style={{
                        position: "absolute",
                        bottom: -1,
                        right: -1,
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        background: "var(--stage-completed)",
                        border: "2px solid var(--surface)",
                      }}
                    />
                  )}
                </div>
                <div className="grow" style={{ minWidth: 0 }}>
                  <div className="truncate" style={{ fontWeight: 500 }}>
                    {name}
                  </div>
                  <div className="muted truncate" style={{ fontSize: 11 }}>
                    {w.role || "—"}
                  </div>
                </div>
                <button
                  onClick={() => setWorkerStatus(w.id, cycleAttendance(status))}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 6,
                    border: "none",
                    cursor: "pointer",
                    background: isPresent
                      ? "var(--stage-completed)"
                      : isAbsent
                        ? "var(--stage-contract)"
                        : "var(--surface-2)",
                    color: status ? "#fff" : "var(--ink-muted)",
                    fontSize: 11,
                    fontWeight: 600,
                    fontFamily: "inherit",
                    minHeight: 32,
                    minWidth: 72,
                  }}
                >
                  {isPresent ? "Present" : isAbsent ? "Absent" : "Mark"}
                </button>
              </div>
            );
          }}
        />
      </PwaPanel>

      <PwaPanel
        title="Low stock"
        icon={<Icons.alert />}
        count={lowStockMaterials.length}
        defaultOpen
      >
        <PwaList
          items={lowStockMaterials}
          empty="All stock healthy"
          initial={3}
          render={(m) => {
            const ratio = Math.min(
              Number(m.stock) / Math.max(1, Number(m.maxStock)),
              1,
            );
            const critical = Number(m.stock) <= 0;
            return (
              <div className="list-item">
                <div className="row" style={{ marginBottom: 6 }}>
                  <div className="grow" style={{ minWidth: 0 }}>
                    <div className="truncate" style={{ fontWeight: 500 }}>
                      {m.name}
                    </div>
                    <div className="muted" style={{ fontSize: 11 }}>
                      {m.supplier || "No supplier"}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 13,
                        color: critical
                          ? "var(--stage-contract)"
                          : "var(--accent)",
                      }}
                    >
                      {m.stock}
                      <span
                        className="muted"
                        style={{ fontSize: 11, fontWeight: 400 }}
                      >
                        {" "}
                        / {m.maxStock} {m.unit}
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    height: 4,
                    borderRadius: 2,
                    background: "var(--surface-2)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${ratio * 100}%`,
                      height: "100%",
                      background: critical
                        ? "var(--stage-contract)"
                        : "var(--accent)",
                    }}
                  />
                </div>
              </div>
            );
          }}
        />
      </PwaPanel>

      <PwaPanel
        title="Stock overview"
        icon={<Icons.package />}
        count={materials.length}
        defaultOpen={false}
      >
        <div className="list-item row">
          <span className="grow muted">Total materials</span>
          <span style={{ fontWeight: 700 }}>{materials.length}</span>
        </div>
        <div className="list-item row">
          <span className="grow muted">Low stock</span>
          <span style={{ fontWeight: 700, color: "var(--stage-contract)" }}>
            {lowStockMaterials.length}
          </span>
        </div>
        <div className="list-item row">
          <span className="grow muted">Critical (empty)</span>
          <span style={{ fontWeight: 700, color: "var(--stage-contract)" }}>
            {lowStockMaterials.filter((m) => Number(m.stock) <= 0).length}
          </span>
        </div>
      </PwaPanel>

      <PwaPanel
        title="Recent purchases"
        icon={<Icons.truck />}
        defaultOpen={false}
      >
        {recentPOs.length === 0 ? (
          <div className="list-empty">No PO this month</div>
        ) : (
          <PwaList
            items={recentPOs}
            empty="No PO this month"
            initial={5}
            keyExtractor={(po) => po.id}
            render={(po) => (
              <div className="list-item">
                <div className="row" style={{ marginBottom: 8 }}>
                  <div className="grow">
                    <div style={{ fontWeight: 600 }}>PO #{po.id}</div>
                    <div className="muted" style={{ fontSize: 11 }}>
                      {po.supplier}
                    </div>
                    <div className="muted" style={{ fontSize: 11 }}>
                      {po.date
                        ? new Date(po.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      className="muted"
                      style={{
                        fontSize: 10,
                        textTransform: "uppercase",
                        letterSpacing: ".04em",
                      }}
                    >
                      Total
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>
                      {displayMoneyCompact(moneyUnlocked, po.total)}
                    </div>
                  </div>
                </div>
                <PwaList
                  items={safe(po.items)}
                  empty="No items"
                  initial={3}
                  render={(it) => (
                    <div
                      className="row"
                      style={{ padding: "6px 0", fontSize: 12 }}
                    >
                      <span className="grow truncate">
                        {it.material_name || it.name}
                      </span>
                      <span
                        className="muted"
                        style={{ fontSize: 11, marginRight: 8 }}
                      >
                        {it.quantity} {it.unit}
                      </span>
                      <span style={{ fontWeight: 600 }}>
                        {displayMoneyCompact(
                          moneyUnlocked,
                          Number(it.quantity || 0) *
                            Number(it.unit_price || it.price || 0),
                        )}
                      </span>
                    </div>
                  )}
                />
              </div>
            )}
          />
        )}
      </PwaPanel>

      {/* Recent Trips — same data as the desktop panel, but
          compact row layout to fit the narrow PWA column. */}
      {RecentTripsPanelPwa()}
    </div>
  );

  const PwaOrdersTab = () => (
    <div className="tab-pane">
      <div style={{ padding: "4px 4px 12px" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Orders</h2>
        <p className="muted" style={{ fontSize: 12, marginTop: 2 }}>
          Pipeline and order list
        </p>
      </div>

      <PwaPanel
        title="Pipeline"
        icon={<Icons.orders />}
        count={ordersThisMonth.length}
        defaultOpen
      >
        <PwaPipelineMini counts={pipelineCounts} />
      </PwaPanel>

      <PwaPanel
        title="Orders"
        icon={<Icons.orders />}
        count={ordersFiltered.length}
        defaultOpen
      >
        <div className="chip-row">
          {[
            "ALL",
            "APPOINTMENT",
            "CONTRACT",
            "IN_PRODUCTION",
            "READY_TO_DELIVER",
            "COMPLETED",
          ].map((f) => (
            <button
              key={f}
              className={`chip ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "ALL" ? "All" : STAGE_MAP[f].label}
            </button>
          ))}
        </div>
        <PwaList
          items={ordersFiltered}
          empty="No orders in this view"
          initial={3}
          render={(o) => {
            const isOver =
              o.dueDate &&
              new Date(o.dueDate) < new Date(todayISO()) &&
              o.stage !== "COMPLETED";
            return (
              <div
                className="list-item"
                role="button"
                tabIndex={0}
                onClick={() => openOrder(o.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openOrder(o.id);
                  }
                }}
                style={{ cursor: "pointer" }}
              >
                <div className="row" style={{ marginBottom: 6 }}>
                  <div className="grow" style={{ minWidth: 0 }}>
                    <div className="truncate" style={{ fontWeight: 600 }}>
                      {o.client}
                    </div>
                    <div className="muted truncate" style={{ fontSize: 11 }}>
                      Order #{o.id}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>
                      {displayMoneyCompact(moneyUnlocked, o.amount)}
                    </div>
                    <div className="muted" style={{ fontSize: 11 }}>
                      DZD
                    </div>
                  </div>
                </div>
                <div className="row">
                  {/* Stage is read-only on the home dashboard — change
                     it from the order's own page instead. */}
                  <StageBadge stage={o.stage} />
                  <div className="grow" />
                  <span
                    style={{
                      fontSize: 11,
                      color: isOver
                        ? "var(--stage-contract)"
                        : "var(--ink-muted)",
                      fontWeight: isOver ? 600 : 400,
                    }}
                  >
                    {o.dueDate
                      ? new Date(o.dueDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      : "—"}
                  </span>
                </div>
              </div>
            );
          }}
        />
      </PwaPanel>
    </div>
  );

  /* ════════════════════════════════════════════════════════════
     DESKTOP RENDER — restored 1:1 from the original
     NOTE: this is a JSX *variable*, not a component function.
     Defining it as `() => (...)` and rendering `<DesktopRender />`
     made React treat it as a brand-new component type on every
     single re-render (filter change, toast, 30s notification tick,
     etc.), which unmounted and remounted the ENTIRE dashboard each
     time — that's the "refreshing/rerendering itself" bug. Keeping
     it as plain JSX lets React reconcile normally.
     ════════════════════════════════════════════════════════════ */
  const desktopView = (
    <div className="p-6">
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
            onClick={toggleMoneyLock}
            title={moneyUnlocked ? "Hide amounts" : "Show amounts"}
            style={moneyUnlocked ? { color: "var(--accent)" } : undefined}
          >
            {moneyUnlocked ? <Icons.eyeOff /> : <Icons.eye />}
            {moneyUnlocked ? "Hide" : "Show"}
          </button>
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
            value: displayMoneyCompact(moneyUnlocked, monthIncome),
            color: "var(--stage-completed)",
            icon: <Icons.trend />,
          },
          {
            label: "Expenses (MTD)",
            value: displayMoneyCompact(moneyUnlocked, monthExpenses),
            color: "var(--stage-contract)",
            icon: <Icons.money />,
          },
          {
            label: "Net Profit",
            value: displayMoneyCompact(moneyUnlocked, monthProfit),
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

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 panel">
          <SectionHead
            icon={<Icons.chart />}
            title="Revenue vs Expenses (6 mo.)"
            action={
              <div className="chart-legend">
                <span>
                  <span
                    className="chart-legend-dot"
                    style={{ background: "#22c55e" }}
                  />
                  Income
                </span>
                <span>
                  <span
                    className="chart-legend-dot"
                    style={{ background: "#f59e0b" }}
                  />
                  Expenses
                </span>
              </div>
            }
          />
          <div className="p-4">
            {loadingAll &&
            ledgerSeries.every((d) => !d.income && !d.expenses) ? (
              <Skeleton h={200} />
            ) : (
              <LineChart
                data={ledgerSeries}
                width={700}
                height={220}
                formatAxis={(t) => maskChartValue(moneyUnlocked, t)}
              />
            )}
          </div>
        </div>
        <div className="panel">
          <SectionHead icon={<Icons.ledger />} title="Expense Breakdown" />
          <div className="p-4 flex flex-col items-center">
            {expenseBreakdown.length === 0 ? (
              <div
                className="p-6 text-center text-sm"
                style={{ color: "var(--ink-muted)" }}
              >
                No expenses logged this month
              </div>
            ) : (
              <>
                <DonutChart
                  data={expenseBreakdown}
                  size={140}
                  thickness={22}
                  formatValue={(n) => displayMoneyCompact(moneyUnlocked, n)}
                />
                <div className="w-full mt-4 space-y-1.5">
                  {expenseBreakdown.map((t) => (
                    <div
                      key={t.label}
                      className="flex items-center justify-between text-[11px]"
                    >
                      <span style={{ color: "var(--ink-muted)" }}>
                        <span
                          className="chart-legend-dot"
                          style={{ background: t.color }}
                        />
                        {t.label}
                      </span>
                      <span className="font-semibold">
                        {displayMoneyCompact(moneyUnlocked, t.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* TASK MANAGER */}
      <div className="panel mb-6">
        <SectionHead
          icon={<Icons.check />}
          title={`Task Manager (${completedTasks}/${tasks.length})`}
          action={
            <div className="flex items-center gap-3">
              {urgentTasks > 0 && (
                <span
                  className="text-[11px] font-semibold px-2 py-1 rounded-md"
                  style={{
                    background: "rgba(239,68,68,0.12)",
                    color: "var(--stage-contract)",
                  }}
                >
                  {urgentTasks} urgent
                </span>
              )}
              {overdueTasks > 0 && (
                <span
                  className="text-[11px] font-semibold px-2 py-1 rounded-md"
                  style={{
                    background: "var(--surface-2)",
                    color: "var(--stage-contract)",
                  }}
                >
                  {overdueTasks} overdue
                </span>
              )}
              <button
                className="btn-primary text-xs flex items-center gap-1"
                onClick={() => setModal({ type: "NEW_TASK" })}
              >
                <Icons.plus /> Add Task
              </button>
            </div>
          }
        />
        <div className="px-4 pt-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--ink-muted)" }}
            >
              <Icons.search />
            </span>
            <input
              className="f-input"
              style={{ paddingLeft: 32 }}
              placeholder="Search tasks…"
              value={taskSearch}
              onChange={(e) => setTaskSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-1">
            {TASK_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setTaskFilter(f)}
                className="text-[11px] px-2.5 py-1.5 rounded-md transition-colors"
                style={{
                  background:
                    taskFilter === f
                      ? "var(--accent-soft)"
                      : "var(--surface-2)",
                  color:
                    taskFilter === f ? "var(--accent)" : "var(--ink-muted)",
                  fontWeight: taskFilter === f ? 600 : 400,
                }}
              >
                {f === "ALL"
                  ? "All"
                  : f === "ACTIVE"
                    ? "Active"
                    : f === "DONE"
                      ? "Done"
                      : "Overdue"}
              </button>
            ))}
          </div>
        </div>

        <TaskDayNav
          taskDay={taskDay}
          onChange={setTaskDay}
          notifPermission={notifPermission}
          onRequestNotif={requestNotifPermission}
          tasks={tasks}
        />
        <div className="p-3 space-y-2">
          {loadingAll && tasks.length === 0 ? (
            <div className="p-2 space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} h={44} />
              ))}
            </div>
          ) : visibleTasks.length === 0 ? (
            <div
              className="p-6 text-center text-sm"
              style={{ color: "var(--ink-muted)" }}
            >
              {tasks.length === 0
                ? "No tasks yet — add one to get started"
                : "No tasks match this filter"}
            </div>
          ) : (
            <ExpandableSection
              items={visibleTasks}
              initial={5}
              keyExtractor={(t) => t.id}
              renderItem={(t) => {
                const prio =
                  TASK_PRIORITIES.find((p) => p.value === t.priority) ||
                  TASK_PRIORITIES[1];
                const overdue = isTaskOverdue(t);
                const isToday = !t.done && t.dueDate === todayISO();
                return (
                  <div
                    className="check-row group flex items-center gap-3 rounded-lg transition-colors"
                    style={{
                      // Priority color rail + subtle tint when not done.
                      borderLeft: `3px solid ${prio.color}`,
                      background: t.done ? "transparent" : `${prio.color}0A`,
                      padding: "12px 14px 12px 13px",
                    }}
                  >
                    <div
                      onClick={() => toggleTask(t.id)}
                      className="w-4 h-4 rounded border flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                      style={{
                        borderColor: t.done ? prio.color : prio.color + "55",
                        background: t.done ? prio.color : "transparent",
                      }}
                    >
                      {t.done && <Icons.check />}
                    </div>
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => toggleTask(t.id)}
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="text-sm"
                          style={{
                            color: t.done ? "var(--ink-muted)" : "var(--ink)",
                            textDecoration: t.done ? "line-through" : "none",
                          }}
                        >
                          {t.text}
                        </span>
                        <PriorityChip priority={t.priority} />
                        {t.dueTime && (
                          <span
                            className="text-[10px] font-semibold px-1.5 py-0.5 rounded inline-flex items-center gap-1"
                            style={{
                              background: TASK_BLUE_SOFT,
                              color: TASK_BLUE,
                            }}
                          >
                            <Icons.clock /> {t.dueTime}
                          </span>
                        )}
                      </div>
                      <div
                        className="flex items-center gap-2 mt-1.5 text-[11px]"
                        style={{ color: "var(--ink-muted)" }}
                      >
                        {t.assignee && <span>{t.assignee}</span>}
                        {t.assignee && t.dueDate && <span>·</span>}
                        {t.dueDate && (
                          <span
                            style={{
                              color: overdue
                                ? "var(--stage-contract)"
                                : isToday
                                  ? TASK_BLUE
                                  : "var(--ink-muted)",
                              fontWeight: overdue || isToday ? 600 : 400,
                            }}
                          >
                            {overdue
                              ? "Overdue"
                              : isToday
                                ? "Due today"
                                : `Due ${new Date(t.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() =>
                          setModal({ type: "EDIT_TASK", payload: t })
                        }
                        className="p-1.5 rounded"
                        style={{ color: "var(--ink-muted)" }}
                        aria-label="Edit task"
                      >
                        <Icons.edit />
                      </button>
                      <button
                        onClick={() => deleteTask(t.id)}
                        className="p-1.5 rounded"
                        style={{ color: "var(--ink-muted)" }}
                        aria-label="Delete task"
                      >
                        <Icons.trash />
                      </button>
                    </div>
                  </div>
                );
              }}
            />
          )}
        </div>
        <div
          className="h-1.5 rounded-full overflow-hidden mx-4 mb-4"
          style={{ background: "var(--surface-2)" }}
        >
          <div
            className="h-full bar-fill"
            style={{ width: `${taskProgress}%`, background: TASK_BLUE }}
          />
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT (2/3) */}
        <div className="lg:col-span-2 space-y-6">
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
                <ExpandableSection
                  items={workers}
                  initial={5}
                  keyExtractor={(w) => w.id}
                  renderItem={(w) => {
                    const status = attendance[w.id];
                    const name =
                      w.full_name || w.shortName || w.name || "Worker";
                    return (
                      <div className="relative flex items-center gap-3 p-3 rounded-lg panel-hover">
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
                  }}
                />
              )}
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
                    <ExpandableSection
                      items={ordersFiltered}
                      initial={5}
                      keyExtractor={(o) => o.id}
                      wrap={(list) => list}
                      buttonWrap={(button) =>
                        button && (
                          <tr>
                            <td colSpan={5} className="p-0">
                              {button}
                            </td>
                          </tr>
                        )
                      }
                      renderItem={(o) => {
                        const isToday = o.dueDate === todayISO();
                        const isOver =
                          o.dueDate &&
                          new Date(o.dueDate) < new Date(todayISO()) &&
                          o.stage !== "COMPLETED";
                        return (
                          <tr
                            className="panel-hover transition-colors"
                            style={{
                              borderTop: "1px solid var(--border)",
                              cursor: "pointer",
                            }}
                            onClick={() => openOrder(o.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                openOrder(o.id);
                              }
                            }}
                            tabIndex={0}
                          >
                            <td className="px-5 py-3 font-medium">{o.id}</td>
                            <td className="px-5 py-3">{o.client}</td>
                            <td className="px-5 py-3">
                              {/* Stage is read-only on the home dashboard —
                                 change it from the order's own page instead. */}
                              <StageBadge stage={o.stage} />
                            </td>
                            <td className="px-5 py-3 text-right font-medium">
                              {displayMoney(moneyUnlocked, o.amount)}
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
                      }}
                    />
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
                {displayMoney(
                  moneyUnlocked,
                  ordersFiltered.reduce((s, o) => s + Number(o.amount || 0), 0),
                )}
              </div>
            </div>
          </div>

          {/* Last 5 Purchase Orders + Recent Trips, side by side —
             both foldable now. */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DesktopCollapsiblePanel
              icon={<Icons.package />}
              title="Last 5 Purchase Orders"
              defaultOpen
            >
              <div className="p-5">
                {recentPOs.length === 0 ? (
                  <div
                    className="text-center text-sm py-6"
                    style={{ color: "var(--ink-muted)" }}
                  >
                    No purchase orders this month
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentPOs.map((po, idx) => (
                      <div
                        key={po.id ?? idx}
                        style={
                          idx > 0
                            ? {
                                borderTop: "1px solid var(--border)",
                                paddingTop: 16,
                              }
                            : undefined
                        }
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="text-base font-semibold">
                              PO #{po.id}
                            </div>
                            <div
                              className="text-xs mt-0.5"
                              style={{ color: "var(--ink-muted)" }}
                            >
                              {po.supplier}
                            </div>
                            <div
                              className="text-[11px] mt-0.5 flex items-center gap-1"
                              style={{ color: "var(--ink-muted)" }}
                            >
                              <Icons.calendar />{" "}
                              {po.date
                                ? new Date(po.date).toLocaleDateString(
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
                              {displayMoney(moneyUnlocked, po.total)}
                            </div>
                          </div>
                        </div>
                        <div
                          className="text-[11px] font-medium uppercase tracking-wide mb-2"
                          style={{ color: "var(--ink-muted)" }}
                        >
                          Items ({safe(po.items).length})
                        </div>
                        <div className="space-y-1.5">
                          {safe(po.items).map((it, i) => (
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
                                  {displayMoney(
                                    moneyUnlocked,
                                    it.unit_price || it.price,
                                  )}
                                </div>
                              </div>
                              <div className="text-xs font-semibold shrink-0">
                                {displayMoney(
                                  moneyUnlocked,
                                  Number(it.quantity || 0) *
                                    Number(it.unit_price || it.price || 0),
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </DesktopCollapsiblePanel>

            {/* Recent Trips — last 5 across the whole fleet, now
               beside Last 5 Purchase Orders instead of the right rail */}
            {RecentTripsPanelDesktop()}
          </div>
        </div>

        {/* RIGHT (1/3) */}
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
                    {displayMoneyCompact(moneyUnlocked, monthProfit)}
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
                    <span className="font-semibold">
                      {displayMoney(moneyUnlocked, monthIncome)}
                    </span>
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
                      {displayMoney(moneyUnlocked, monthExpenses)}
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
                <ExpandableSection
                  items={lowStockMaterials}
                  initial={5}
                  keyExtractor={(m) => m.id}
                  renderItem={(m) => {
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
                  }}
                />
              )}
            </div>
          </div>

          {/* Quick Actions */}
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
    </div>
  );

  /* ════════════════════════════════════════════════════════════
     PWA SHELL — 4 tabs: Home / Money / Workshop / Orders
     ════════════════════════════════════════════════════════════ */
  const PWA_TABS = [
    { id: "home", label: "Home", icon: Icons.home },
    { id: "money", label: "Money", icon: Icons.money },
    { id: "workshop", label: "Workshop", icon: Icons.workshop },
    { id: "orders", label: "Orders", icon: Icons.orders },
  ];

  const pwaView = (
    <div className="pwa-shell">
      <header className="pwa-header">
        <div className="pwa-header-row">
          <div className="grow" style={{ minWidth: 0 }}>
            <div className="muted" style={{ fontSize: 11, fontWeight: 500 }}>
              {todayLabel()}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, margin: "2px 0 0" }}>
              {PWA_TABS.find((t) => t.id === pwaTab)?.label || "Home"}
            </div>
          </div>
          <button
            onClick={toggleMoneyLock}
            className="row"
            title={moneyUnlocked ? "Hide amounts" : "Show amounts"}
            style={{
              padding: "8px 10px",
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: moneyUnlocked
                ? "var(--accent-soft)"
                : "var(--surface-2)",
              color: moneyUnlocked ? "var(--accent)" : "var(--ink)",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 12,
              fontWeight: 500,
              minHeight: 36,
            }}
          >
            {moneyUnlocked ? <Icons.eyeOff /> : <Icons.eye />}
          </button>
          <button
            onClick={loadAll}
            disabled={loadingAll}
            className="row"
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "var(--surface-2)",
              color: "var(--ink)",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 12,
              fontWeight: 500,
              minHeight: 36,
            }}
          >
            <Icons.refresh />
            <span style={{ marginLeft: 4 }}>
              {loadingAll ? "Loading…" : "Refresh"}
            </span>
          </button>
        </div>
      </header>

      <main className="pwa-main">
        {pwaTab === "home" && PwaHomeTab()}
        {pwaTab === "money" && PwaMoneyTab()}
        {pwaTab === "workshop" && PwaWorkshopTab()}
        {pwaTab === "orders" && PwaOrdersTab()}
      </main>

      <nav className="pwa-tabbar" role="tablist" aria-label="Main navigation">
        {PWA_TABS.map((t) => {
          const IconComp = t.icon;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={pwaTab === t.id}
              className={`tab-btn ${pwaTab === t.id ? "active" : ""}`}
              onClick={() => setPwaTab(t.id)}
            >
              <IconComp size={22} />
              <span>{t.label}</span>
              <span className="tab-dot" />
            </button>
          );
        })}
      </nav>
    </div>
  );

  /* ════════════════════════════════════════════════════════════
     TOP-LEVEL RETURN — pick layout by viewport
     ════════════════════════════════════════════════════════════ */
  return (
    <>
      <GlobalStyles />
      {isMobile ? pwaView : desktopView}

      {/* MODALS (shared by both layouts) */}
      <OrderFormModal
        isOpen={modal?.type === "NEW_ORDER"}
        onClose={() => setModal(null)}
        onSave={createOrder}
        workers={workers}
      />
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
        open={modal?.type === "NEW_TASK" || modal?.type === "EDIT_TASK"}
        onClose={() => setModal(null)}
        title={modal?.type === "EDIT_TASK" ? "Edit Task" : "New Task"}
      >
        <TaskForm
          initialData={modal?.type === "EDIT_TASK" ? modal.payload : null}
          workers={workers}
          onSubmit={(data) => {
            if (modal?.type === "EDIT_TASK")
              updateTaskDetails(modal.payload.id, data);
            else addTask(data);
            setModal(null);
          }}
          onCancel={() => setModal(null)}
        />
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

      {/* PASSWORD PROMPT — unlock money amounts */}
      <Modal
        open={modal?.type === "PASSWORD"}
        onClose={() => {
          setModal(null);
          setPasswordError("");
          setPasswordInput("");
        }}
        title="Unlock amounts"
      >
        <div style={{ textAlign: "center", padding: "4px 0 8px" }}>
          <div
            style={{
              display: "inline-flex",
              width: 56,
              height: 56,
              borderRadius: 28,
              background: "var(--accent-soft)",
              color: "var(--accent)",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
            }}
          >
            <Icons.lock />
          </div>
          <p
            style={{
              fontSize: 13,
              color: "var(--ink-muted)",
              margin: "0 0 16px",
            }}
          >
            Enter the password to reveal all money amounts on this dashboard.
          </p>
          <input
            type="password"
            className="f-input"
            autoFocus
            placeholder="Password"
            value={passwordInput}
            onChange={(e) => {
              setPasswordInput(e.target.value);
              setPasswordError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitPassword();
            }}
            style={{
              textAlign: "center",
              fontSize: 16,
              letterSpacing: "0.3em",
            }}
          />
          {passwordError && (
            <div
              className="f-err"
              style={{ textAlign: "center", marginTop: 8 }}
            >
              {passwordError}
            </div>
          )}
          <div className="flex gap-2 justify-end pt-4">
            <button
              type="button"
              onClick={() => {
                setModal(null);
                setPasswordError("");
                setPasswordInput("");
              }}
              className="btn-ghost text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submitPassword}
              className="btn-primary text-xs"
            >
              <Icons.unlock size={14} /> Unlock
            </button>
          </div>
        </div>
      </Modal>

      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </>
  );
}

/* ─── Task UI helper ───
   A small colored priority pill. The same color is also used as
   the left rail and the checkbox border on each task row so the
   urgency is scannable without reading the label. */
const PriorityChip = ({ priority, dense = false }) => {
  const p =
    TASK_PRIORITIES.find((x) => x.value === priority) || TASK_PRIORITIES[1];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: dense ? 9 : 10,
        fontWeight: 700,
        letterSpacing: ".02em",
        textTransform: "uppercase",
        padding: dense ? "1px 5px" : "2px 7px",
        borderRadius: 999,
        background: `${p.color}1F`,
        color: p.color,
        lineHeight: 1.4,
        whiteSpace: "nowrap",
        border: `1px solid ${p.color}33`,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 5,
          height: 5,
          borderRadius: 999,
          background: p.color,
        }}
      />
      {p.label}
    </span>
  );
};

/* Task form — original tight layout, only the fields that earn
   their space: text, priority, due date, assignee, optional time. */
const TaskForm = ({ onSubmit, onCancel, initialData, workers = [] }) => {
  const [text, setText] = useState(initialData?.text || "");
  const [priority, setPriority] = useState(initialData?.priority || "MEDIUM");
  const [dueDate, setDueDate] = useState(initialData?.dueDate || todayISO());
  const [dueTime, setDueTime] = useState(initialData?.dueTime || "");
  const [hasTime, setHasTime] = useState(Boolean(initialData?.dueTime));
  const [assignee, setAssignee] = useState(initialData?.assignee || "");

  const submit = () => {
    if (!text.trim()) return;
    onSubmit({
      text: text.trim(),
      priority,
      dueDate,
      dueTime: hasTime && dueTime ? dueTime : null,
      assignee: assignee || null,
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="space-y-2.5"
    >
      <div>
        <label className="f-label">Task</label>
        <input
          className="f-input"
          autoFocus
          placeholder="What needs to be done?"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>
      <div className="f-row">
        <div>
          <label className="f-label">Priority</label>
          <div
            className="f-select"
            style={{
              padding: 0,
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* Priority color dot — same color drives the row rail
               and the checkbox in the list, so the preview dot here
               tells the user exactly how the task will look. */}
            <span
              aria-hidden
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                width: 10,
                height: 10,
                borderRadius: 999,
                background: (
                  TASK_PRIORITIES.find((p) => p.value === priority) ||
                  TASK_PRIORITIES[1]
                ).color,
                pointerEvents: "none",
                boxShadow: `0 0 0 2px ${
                  (
                    TASK_PRIORITIES.find((p) => p.value === priority) ||
                    TASK_PRIORITIES[1]
                  ).color
                }22`,
              }}
            />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                color: "var(--ink)",
                fontSize: 13,
                fontFamily: "inherit",
                padding: "9px 12px 9px 28px",
                appearance: "none",
                WebkitAppearance: "none",
                MozAppearance: "none",
                cursor: "pointer",
              }}
            >
              {TASK_PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="f-label">Due date</label>
          <input
            type="date"
            className="f-input"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
      </div>
      <div className="f-row">
        <div>
          <label className="f-label">Assign to</label>
          <select
            className="f-select"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
          >
            <option value="">Unassigned</option>
            {workers.map((w) => {
              const wName = w.full_name || w.shortName || w.name || "Worker";
              return (
                <option key={w.id} value={wName}>
                  {wName}
                </option>
              );
            })}
          </select>
        </div>
        <div>
          <label className="f-label">Time</label>
          {hasTime ? (
            <div className="row" style={{ gap: 6 }}>
              <input
                type="time"
                className="f-input"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                style={{ flex: 1, minWidth: 0 }}
              />
              <button
                type="button"
                onClick={() => {
                  setHasTime(false);
                  setDueTime("");
                }}
                className="btn-ghost"
                style={{ padding: "6px 8px", color: "var(--ink-muted)" }}
                aria-label="Clear time"
                title="Clear time"
              >
                <Icons.x />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setHasTime(true)}
              className="f-input"
              style={{
                textAlign: "left",
                color: "var(--ink-muted)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Icons.clock /> Set a specific time
            </button>
          )}
        </div>
      </div>
      {hasTime && (
        <div className="f-hint" style={{ marginTop: 0 }}>
          You'll get a notification at this time on the chosen day.
        </div>
      )}
      <div className="flex gap-2 justify-end pt-1">
        <button type="button" onClick={onCancel} className="btn-ghost text-xs">
          Cancel
        </button>
        <button
          type="submit"
          disabled={!text.trim()}
          className="btn-primary text-xs disabled:opacity-50"
        >
          <Icons.check /> {initialData ? "Save Changes" : "Add Task"}
        </button>
      </div>
    </form>
  );
};

/* ════════════════════════════════════════════════════════════════
   TASK DAY NAVIGATOR + NOTIFICATION TOGGLE
   ════════════════════════════════════════════════════════════════ */
const TaskDayNav = ({
  taskDay,
  onChange,
  notifPermission,
  onRequestNotif,
  tasks = [],
}) => {
  const today = todayISO();
  const tomorrow = shiftDateISO(today, 1);
  const yesterday = shiftDateISO(today, -1);
  const isToday = taskDay === today;
  const isTomorrow = taskDay === tomorrow;
  const isYesterday = taskDay === yesterday;
  const labelDate = new Date(taskDay + "T00:00:00");
  const subLabel = isToday
    ? "Today"
    : isTomorrow
      ? "Tomorrow"
      : isYesterday
        ? "Yesterday"
        : labelDate.toLocaleDateString("en-US", { weekday: "long" });
  const mainLabel =
    isToday || isTomorrow || isYesterday
      ? labelDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      : labelDate.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        });
  // "Overdue" only makes sense if the selected day is in the past
  // AND the user explicitly chose to look at it (i.e. not the default
  // Today view) — otherwise the red treatment is just noise.
  const isOverdueView = !isToday && taskDay < today;
  const showBell =
    notifPermission === "default" || notifPermission === "denied";
  // Counts for the three quick-jump pills. Computed from the full
  // task list (not the visible one) so the badges reflect "what
  // would I see if I tapped this", regardless of the active
  // status / priority / search filters.
  const openCount = (iso) =>
    tasks.filter((t) => !t.done && t.dueDate === iso).length;
  const cY = openCount(yesterday);
  const cT = openCount(today);
  const cM = openCount(tomorrow);

  // Day label color: today → accent, past overdue → red, else ink.
  const dayColor = isToday
    ? "var(--accent)"
    : isOverdueView
      ? "var(--stage-contract)"
      : "var(--ink)";

  // Arrow button style — shared by prev/next.
  const arrowBtnStyle = {
    width: 36,
    height: 36,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    color: "var(--ink)",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: 16,
    fontWeight: 600,
    lineHeight: 1,
    flexShrink: 0,
    WebkitTapHighlightColor: "transparent",
    padding: 0,
  };

  // Round icon button (used for the calendar picker & notification bell).
  const pickBtnStyle = (extra = {}) => ({
    width: 30,
    height: 30,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: 999,
    color: "var(--ink-muted)",
    cursor: "pointer",
    flexShrink: 0,
    WebkitTapHighlightColor: "transparent",
    position: "relative",
    padding: 0,
    ...extra,
  });

  // Quick-jump pill. Active = filled accent, otherwise muted, and
  // when the day has open tasks we tint the badge accordingly.
  const renderPill = (iso, label, count) => {
    const active = taskDay === iso;
    const has = count > 0;
    const pillStyle = {
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 30,
      padding: "5px 8px",
      borderRadius: 999,
      background: active ? "var(--accent)" : "var(--surface-2)",
      color: active ? "#fff" : has ? "var(--ink)" : "var(--ink-muted)",
      fontFamily: "inherit",
      fontSize: 11,
      fontWeight: 600,
      border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
      cursor: "pointer",
      WebkitTapHighlightColor: "transparent",
      paddingTop: 5,
      paddingBottom: 5,
    };
    const countStyle = {
      marginLeft: 5,
      fontSize: 9,
      fontWeight: 700,
      padding: "1px 5px",
      borderRadius: 999,
      background: active ? "rgba(255,255,255,.22)" : "var(--surface)",
      color: active ? "#fff" : "var(--ink-muted)",
    };
    return (
      <button
        key={iso}
        type="button"
        onClick={() => onChange(iso)}
        style={pillStyle}
        aria-pressed={active}
      >
        {label}
        {has && <span style={countStyle}>{count}</span>}
      </button>
    );
  };

  return (
    <div
      style={{
        borderTop: "1px solid var(--border)",
        background: "var(--surface)",
      }}
    >
      {/* Row 1 — day pager: single prominent date with arrow buttons.
         The date label swaps "Today / Tomorrow / Yesterday" into the
         sub-line so the user always knows what context they're in. */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding: "10px 8px 6px",
        }}
      >
        <button
          type="button"
          onClick={() => onChange(shiftDateISO(taskDay, -1))}
          style={arrowBtnStyle}
          aria-label="Previous day"
        >
          ‹
        </button>
        <div
          style={{
            flex: 1,
            minWidth: 0,
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
          }}
        >
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: dayColor,
              letterSpacing: "-.01em",
              lineHeight: 1.1,
            }}
          >
            {mainLabel}
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "var(--ink-muted)",
              textTransform: "uppercase",
              letterSpacing: ".04em",
              lineHeight: 1,
            }}
          >
            {subLabel}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onChange(shiftDateISO(taskDay, 1))}
          style={arrowBtnStyle}
          aria-label="Next day"
        >
          ›
        </button>
      </div>
      {/* Row 2 — quick jumps: Yesterday / Today / Tomorrow, with open
         task counts so the user can see at a glance which day needs
         attention. The calendar icon on the right is a native date
         picker for jumping to any specific day. */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "0 10px 10px",
        }}
      >
        {renderPill(yesterday, "Yesterday", cY)}
        {renderPill(today, "Today", cT)}
        {renderPill(tomorrow, "Tomorrow", cM)}
        <label
          style={pickBtnStyle()}
          title="Jump to date"
          aria-label="Jump to date"
        >
          <Icons.calendar />
          {/* Hide the native date picker chrome but keep it functional.
              We render our own calendar icon as the visual affordance. */}
          <input
            type="date"
            value={taskDay}
            onChange={(e) => {
              if (e.target.value) onChange(e.target.value);
            }}
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0,
              width: "100%",
              height: "100%",
              cursor: "pointer",
              border: "none",
              padding: 0,
              colorScheme: "dark",
            }}
          />
        </label>
        {showBell && (
          <button
            type="button"
            onClick={onRequestNotif}
            style={pickBtnStyle({ color: TASK_BLUE })}
            title="Enable browser notifications"
            aria-label="Enable browser notifications"
          >
            <Icons.bell />
          </button>
        )}
      </div>
    </div>
  );
};