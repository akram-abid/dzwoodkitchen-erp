"use client";

import { useEffect, useMemo, useState } from "react";

import {
  getSuppliers,
  createSupplierClient,
  updateSupplierClient,
  deleteSupplierClient,
} from "../../lib/api_helpers/supplier.js";

import SupplierPurchasesModal from "../../lib/components/SupplierPurchasesModal.jsx";

/* ─── icons ─── */

const Icons = {
  suppliers: () => (
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
      <path d="M3 9 12 2l9 7" />
      <path d="M4 10v10a1 1 0 0 0 1 1h4v-6h6v6h4a1 1 0 0 0 1-1V10" />
    </svg>
  ),

  phone: () => (
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
      <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465a2 2 0 0 1 2.828-.395l2.318 1.856a1 1 0 0 1 .06 1.508l-1.834 1.834a2 2 0 0 1-1.79.558C13.483 20.531 8.5 15.549 7.964 12.196a2 2 0 0 1 .557-1.79l1.834-1.834a1 1 0 0 1 1.508.06l1.856 2.318a2 2 0 0 1-.396 2.828l-.464.355a1 1 0 0 0-.303 1.212" />
    </svg>
  ),

  receipt: () => (
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
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
      <path d="M8 7h8M8 11h8M8 15h5" />
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
      <path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-1" />
      <path d="M22 12a2 2 0 0 0-2-2h-3a2 2 0 0 0 0 4h3a2 2 0 0 0 2-2Z" />
    </svg>
  ),

  truck: () => (
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
      <path d="M14 18V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h1" />
      <path d="M15 18H9" />
      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
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
      <path d="m21 21-4.3-4.3" />
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
};

/* ─── solid color palette ─── */

const C = {
  blue: "#2563eb",

  green: "#16a34a",

  red: "#dc2626",

  purple: "#9333ea",

  amber: "#ca8a04",

  gray: "#4b5563",
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

const initials = (name) => (name || "?").trim().slice(0, 2).toUpperCase();

const statusColor = (s) => (s === "ACTIVE" ? C.green : C.gray);

/* ─── badges — solid bg + white text ─── */

const SupplierStatusBadge = ({ status }) => {
  const isActive = status === "ACTIVE";

  return (
    <span
      className="badge"
      style={{
        background: isActive ? C.green : C.gray,

        color: "white",

        fontWeight: 600,

        letterSpacing: 0.2,
      }}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
};

/* ─── form modal — create + edit, mode-switched ─── */

const EMPTY_FORM = {
  name: "",
  phone: "",
  address: "",
  nif: "",
  rc: "",
  status: "ACTIVE",
};

const SupplierFormModal = ({ mode, initial, onClose, onSaved }) => {
  const isEdit = mode === "edit";

  const [form, setForm] = useState(() => ({
    name: initial?.name ?? "",

    phone: initial?.phone ?? "",

    address: initial?.address ?? "",

    nif: initial?.nif ?? "",

    rc: initial?.rc ?? "",

    status: initial?.status ?? "ACTIVE",
  }));

  const [errors, setErrors] = useState({});

  const [submitting, setSubmitting] = useState(false);

  const [topError, setTopError] = useState(null);

  const setField = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));

    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setTopError(null);

    // Client-side quick check (server re-validates)

    const localErrors = {};

    if (!form.name.trim()) localErrors.name = "Name is required.";

    if (Object.keys(localErrors).length > 0) {
      setErrors(localErrors);

      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name: form.name.trim(),

        phone: form.phone.trim() || null,

        address: form.address.trim() || null,

        nif: form.nif.trim() || null,

        rc: form.rc.trim() || null,

        status: form.status,
      };

      const result = isEdit
        ? await updateSupplierClient(initial.id, payload)
        : await createSupplierClient(payload);

      onSaved(result, isEdit ? "updated" : "created");
    } catch (err) {
      if (err.fields) {
        setErrors(err.fields);
      }

      setTopError(err.message || "Save failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,15,20,0.55)" }}
      onClick={onClose}
    >
      <div
        className="panel w-full max-w-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}

        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{ background: isEdit ? C.purple : C.blue, color: "white" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "rgba(255,255,255,0.18)" }}
            >
              {isEdit ? <Icons.pencil /> : <Icons.plus />}
            </div>

            <div>
              <div className="text-sm font-semibold">
                {isEdit ? "Edit Supplier" : "New Supplier"}
              </div>

              <div className="text-xs opacity-80">
                {isEdit
                  ? `Editing #${initial.id} · ${initial.name}`
                  : "Add a new supplier to your database"}
              </div>
            </div>
          </div>

          <button
            className="p-1 rounded-md"
            onClick={onClose}
            style={{ color: "white" }}
            aria-label="Close"
          >
            <Icons.x />
          </button>
        </div>

        {/* Top error banner */}

        {topError && (
          <div
            className="px-5 py-3 flex items-center gap-2 text-sm"
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

        {/* Form */}

        <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
          {/* Name — full width, required */}

          <Field label="Name" required error={errors.name}>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="e.g. Bois & Panneaux El Djazair"
              autoFocus
              maxLength={150}
            />
          </Field>

          {/* Two-column row */}

          <div className="grid grid-cols-2 gap-4">
            <Field label="Phone" error={errors.phone}>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
                placeholder="0555 12 34 56"
                maxLength={30}
              />
            </Field>

            <Field label="NIF" error={errors.nif}>
              <input
                type="text"
                value={form.nif}
                onChange={(e) => setField("nif", e.target.value)}
                placeholder="000123456789012"
                maxLength={20}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="RC" error={errors.rc}>
              <input
                type="text"
                value={form.rc}
                onChange={(e) => setField("rc", e.target.value)}
                placeholder="16/00-1234567 B 21"
                maxLength={30}
              />
            </Field>

            <Field label="Address" error={errors.address}>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setField("address", e.target.value)}
                placeholder="Zone industrielle, Alger"
                maxLength={255}
              />
            </Field>
          </div>

          {/* Status — pill toggle */}

          <div>
            <label
              className="text-xs font-medium mb-2 block"
              style={{ color: "var(--ink-muted)" }}
            >
              Status
            </label>

            <div className="flex gap-2">
              <Pill
                selected={form.status === "ACTIVE"}
                color={C.green}
                onClick={() => setField("status", "ACTIVE")}
              >
                Active
              </Pill>

              <Pill
                selected={form.status === "INACTIVE"}
                color={C.gray}
                onClick={() => setField("status", "INACTIVE")}
              >
                Inactive
              </Pill>
            </div>
          </div>
        </form>

        {/* Footer */}

        <div
          className="px-5 py-3 flex items-center justify-end gap-2"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <button
            type="button"
            className="btn-ghost text-sm"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="text-sm font-medium px-4 py-1.5 rounded-lg inline-flex items-center gap-1.5"
            style={{
              background: isEdit ? C.purple : C.blue,
              color: "white",
              opacity: submitting ? 0.6 : 1,
            }}
          >
            {submitting ? "…" : <Icons.check />}

            {submitting
              ? "Saving"
              : isEdit
                ? "Save changes"
                : "Create supplier"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── small form helpers ── */

const Field = ({ label, required, error, children }) => (
  <div>
    <label
      className="text-xs font-medium mb-1.5 block"
      style={{ color: "var(--ink-muted)" }}
    >
      {label}

      {required && (
        <span style={{ color: C.red, marginLeft: 4 }} aria-hidden="true">
          *
        </span>
      )}
    </label>

    {/* clone the child to inject shared styling + invalid state */}

    {children && typeof children === "object" && children.type === "input" ? (
      <input
        {...children.props}
        className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors"
        style={{
          background: "var(--surface-2)",

          color: "var(--ink)",

          border: `1px solid ${error ? C.red : "var(--border)"}`,

          ...(children.props.style || {}),
        }}
      />
    ) : (
      children
    )}

    {error && (
      <div className="text-xs mt-1" style={{ color: C.red }}>
        {error}
      </div>
    )}
  </div>
);

const Pill = ({ selected, color, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
    style={{
      background: selected ? color : "var(--surface-2)",

      color: selected ? "white" : "var(--ink-muted)",

      border: `1px solid ${selected ? color : "var(--border)"}`,
    }}
  >
    {children}
  </button>
);

/* ═══════════════════════════════════════════════════════════════════

   Page

═══════════════════════════════════════════════════════════════════ */

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const [query, setQuery] = useState("");

  const [selectedSupplier, setSelectedSupplier] = useState(null);

  // Delete UX

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const [deletingId, setDeletingId] = useState(null);

  // Form modal UX: null | 'create' | { mode: 'edit', id }

  const [formMode, setFormMode] = useState(null);

  const [editingSupplier, setEditingSupplier] = useState(null);

  // Toast

  const [notification, setNotification] = useState(null);

  /* ── data fetching ── */

  const loadSuppliers = async () => {
    setLoading(true);

    setError(null);

    try {
      const data = await getSuppliers();

      setSuppliers(data);
    } catch (e) {
      setError(e.message || "Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  /* ── delete flow ── */

  const askDelete = (id) => setConfirmDeleteId(id);

  const cancelDelete = () => setConfirmDeleteId(null);

  const confirmDelete = async (id) => {
    setDeletingId(id);

    try {
      await deleteSupplierClient(id);

      setSuppliers((prev) => prev.filter((s) => s.id !== id));

      setNotification({ kind: "success", message: "Supplier deleted." });
    } catch (e) {
      setNotification({
        kind: "error",
        message: e.message || "Delete failed.",
      });
    } finally {
      setDeletingId(null);

      setConfirmDeleteId(null);
    }
  };

  /* ── create / edit flow ── */

  const openCreate = () => {
    setEditingSupplier(null);

    setFormMode("create");
  };

  const openEdit = (supplier) => {
    setEditingSupplier(supplier);

    setFormMode("edit");

    setSelectedSupplier(null); // close detail modal if it was open
  };

  const closeForm = () => {
    setFormMode(null);

    setEditingSupplier(null);
  };

  const onFormSaved = (saved, kind) => {
    if (kind === "created") {
      setSuppliers((prev) => [saved, ...prev]);

      setNotification({
        kind: "success",
        message: `Supplier "${saved.name}" created.`,
      });
    } else {
      setSuppliers((prev) => prev.map((s) => (s.id === saved.id ? saved : s)));

      // keep detail modal in sync if it's open for the same supplier

      setSelectedSupplier((curr) =>
        curr && curr.id === saved.id ? saved : curr,
      );

      setNotification({
        kind: "success",
        message: `Supplier "${saved.name}" updated.`,
      });
    }

    closeForm();
  };

  /* ── purchase-changed callback for the modal ── */

  // When the user edits or deletes a material purchase inside the

  // purchases modal, the supplier's ordersCount / totalSpent may change.

  // We don't need to wait for the network call — the modal handles its

  // own state; we just kick a background refresh so the supplier cards

  // stay accurate next time the user looks at the page.

  const onPurchaseChanged = () => {
    loadSuppliers();
  };

  /* ── auto-dismiss toast ── */

  useEffect(() => {
    if (!notification) return;

    const t = setTimeout(() => setNotification(null), 3500);

    return () => clearTimeout(t);
  }, [notification]);

  /* ── derived ── */

  const filtered = useMemo(
    () =>
      (suppliers || []).filter(
        (s) =>
          (s.name || "").toLowerCase().includes(query.toLowerCase()) ||
          (s.phone || "").includes(query),
      ),

    [suppliers, query],
  );

  const activeCount = (suppliers || []).filter(
    (s) => s.status === "ACTIVE",
  ).length;

  const totalSpent = (suppliers || []).reduce(
    (sum, s) => sum + (s.totalSpent || 0),
    0,
  );

  const stats = [
    {
      label: "Total Suppliers",
      value: (suppliers || []).length,
      sub: `${activeCount} active`,
      icon: Icons.suppliers,
      color: C.blue,
    },

    {
      label: "Total Spent",
      value: formatDZD(totalSpent),
      sub: "all time",
      icon: Icons.wallet,
      color: C.green,
    },

    {
      label: "Inactive",
      value: (suppliers || []).length - activeCount,
      sub: "archived",
      icon: Icons.receipt,
      color: C.gray,
    },
  ];

  return (
    <div className="p-6">
      {/* Page header */}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold mb-1">Suppliers</h2>

          <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
            {(suppliers || []).length} suppliers · {activeCount} active
            <span className="ml-2 text-xs opacity-75">
              — click any row to view purchase history
            </span>
          </p>
        </div>

        <button
          className="text-sm font-medium px-3 py-2 rounded-lg inline-flex items-center gap-1.5"
          style={{ background: C.blue, color: "white" }}
          onClick={openCreate}
        >
          <Icons.plus /> New Supplier
        </button>
      </div>

      {/* Stats — solid colored top stripes + solid icon tiles */}

      <div className="grid grid-cols-3 gap-4 mb-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="panel p-4 panel-hover cursor-default"
            style={{ borderTop: `3px solid ${stat.color}` }}
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className="text-xs font-medium"
                style={{ color: "var(--ink-muted)" }}
              >
                {stat.label}
              </div>

              <div
                className="w-8 h-8 rounded-md flex items-center justify-center"
                style={{ background: stat.color, color: "white" }}
              >
                <stat.icon />
              </div>
            </div>

            <div
              className="text-2xl font-bold mb-1"
              style={{ color: "var(--ink)" }}
            >
              {stat.value}
            </div>

            <div className="text-xs" style={{ color: "var(--ink-muted)" }}>
              {stat.sub}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main column — suppliers table */}

        <div className="col-span-2 space-y-6">
          <div className="panel">
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <span style={{ color: C.blue }}>
                  <Icons.suppliers />
                </span>{" "}
                All Suppliers
              </h3>

              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                style={{ background: "var(--surface-2)" }}
              >
                <Icons.search />

                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search suppliers..."
                  className="text-xs bg-transparent outline-none w-36"
                  style={{ color: "var(--ink)" }}
                />
              </div>
            </div>

            {error && (
              <div
                className="flex items-center justify-between gap-3 px-5 py-3 text-sm"
                style={{ background: C.red, color: "white" }}
              >
                <span className="flex items-center gap-2">
                  <Icons.alert /> {error}
                </span>

                <button
                  className="btn-ghost text-xs"
                  style={{ color: "white" }}
                  onClick={loadSuppliers}
                >
                  Retry
                </button>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr style={{ background: "var(--surface-2)" }}>
                    <th
                      className="px-5 py-3 text-xs font-medium"
                      style={{ color: "var(--ink-muted)" }}
                    >
                      Supplier
                    </th>

                    <th
                      className="px-5 py-3 text-xs font-medium"
                      style={{ color: "var(--ink-muted)" }}
                    >
                      Contact
                    </th>

                    <th
                      className="px-5 py-3 text-xs font-medium"
                      style={{ color: "var(--ink-muted)" }}
                    >
                      NIF / RC
                    </th>

                    <th
                      className="px-5 py-3 text-xs font-medium text-right"
                      style={{ color: "var(--ink-muted)" }}
                    >
                      Orders
                    </th>

                    <th
                      className="px-5 py-3 text-xs font-medium text-right"
                      style={{ color: "var(--ink-muted)" }}
                    >
                      Total Spent
                    </th>

                    <th
                      className="px-5 py-3 text-xs font-medium"
                      style={{ color: "var(--ink-muted)" }}
                    >
                      Status
                    </th>

                    <th
                      className="px-5 py-3 text-xs font-medium text-right"
                      style={{ color: "var(--ink-muted)" }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loading &&
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr
                        key={`sk-${i}`}
                        style={{ borderTop: "1px solid var(--border)" }}
                      >
                        {Array.from({ length: 7 }).map((__, j) => (
                          <td key={j} className="px-5 py-3">
                            <div
                              className="h-3 rounded"
                              style={{
                                background: "var(--surface-2)",
                                width: j === 0 ? "60%" : "40%",
                              }}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}

                  {!loading &&
                    filtered.map((s) => {
                      const isConfirming = confirmDeleteId === s.id;

                      const isDeleting = deletingId === s.id;

                      return (
                        <tr
                          key={s.id}
                          className="panel-hover transition-colors cursor-pointer"
                          style={{ borderTop: "1px solid var(--border)" }}
                          onClick={() => setSelectedSupplier(s)}
                        >
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white"
                                style={{ background: statusColor(s.status) }}
                              >
                                {initials(s.name)}
                              </div>

                              <div className="min-w-0">
                                <div className="font-medium truncate">
                                  {s.name}
                                </div>

                                {s.address && (
                                  <div
                                    className="text-xs truncate"
                                    style={{ color: "var(--ink-muted)" }}
                                  >
                                    {s.address}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-3">
                            {s.phone ? (
                              <div
                                className="flex items-center gap-1.5"
                                style={{ color: "var(--ink-muted)" }}
                              >
                                <Icons.phone /> {s.phone}
                              </div>
                            ) : (
                              <span style={{ color: "var(--ink-muted)" }}>
                                —
                              </span>
                            )}
                          </td>

                          <td
                            className="px-5 py-3 text-xs"
                            style={{ color: "var(--ink-muted)" }}
                          >
                            <div>{s.nif || "—"}</div>

                            <div>{s.rc || "—"}</div>
                          </td>

                          <td className="px-5 py-3 text-right">
                            {s.ordersCount ?? 0}
                          </td>

                          <td className="px-5 py-3 text-right font-medium">
                            {formatDZD(s.totalSpent)}
                          </td>

                          <td className="px-5 py-3">
                            <SupplierStatusBadge status={s.status} />
                          </td>

                          <td
                            className="px-5 py-3 text-right"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {!isConfirming ? (
                              <div className="inline-flex items-center gap-1">
                                <button
                                  className="p-1.5 rounded-md inline-flex"
                                  onClick={() => openEdit(s)}
                                  disabled={isDeleting}
                                  title="Edit supplier"
                                  style={{
                                    color: C.blue,
                                    background: "transparent",
                                  }}
                                >
                                  <Icons.pencil />
                                </button>

                                <button
                                  className="p-1.5 rounded-md inline-flex"
                                  onClick={() => askDelete(s.id)}
                                  disabled={isDeleting}
                                  title="Delete supplier"
                                  style={{
                                    color: C.red,
                                    background: "transparent",
                                  }}
                                >
                                  <Icons.trash />
                                </button>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1.5">
                                <span
                                  className="text-xs"
                                  style={{ color: "var(--ink-muted)" }}
                                >
                                  Sure?
                                </span>

                                <button
                                  className="px-2 py-1 rounded-md text-xs font-medium inline-flex items-center gap-1"
                                  onClick={() => confirmDelete(s.id)}
                                  disabled={isDeleting}
                                  style={{ background: C.red, color: "white" }}
                                >
                                  <Icons.check /> {isDeleting ? "…" : "Yes"}
                                </button>

                                <button
                                  className="p-1 rounded-md inline-flex"
                                  onClick={cancelDelete}
                                  disabled={isDeleting}
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

                  {!loading && !error && filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-5 py-8 text-center text-sm"
                        style={{ color: "var(--ink-muted)" }}
                      >
                        {query
                          ? `No suppliers match "${query}".`
                          : 'No suppliers yet — click "New Supplier" to add one.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right column */}

        <div className="space-y-6">
          <div className="panel p-5">
            <h3 className="text-sm font-semibold mb-4">Quick Actions</h3>

            <div className="space-y-2">
              <button
                className="w-full text-sm font-medium px-3 py-2 rounded-lg inline-flex items-center justify-center gap-1.5"
                style={{ background: C.blue, color: "white" }}
                onClick={openCreate}
              >
                <Icons.plus /> New Supplier
              </button>

              <button
                className="btn-ghost w-full text-sm border rounded-md"
                style={{ borderColor: "var(--border)" }}
              >
                Record a Payment to Supplier
              </button>

              <button
                className="btn-ghost w-full text-sm border rounded-md"
                style={{ borderColor: "var(--border)" }}
              >
                Export Supplier List
              </button>
            </div>
          </div>

          {/* Status legend — solid color swatches */}

          <div className="panel p-5">
            <h3 className="text-sm font-semibold mb-3">Status Legend</h3>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-sm shrink-0"
                  style={{ background: C.green }}
                />

                <span>Active — order from them</span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-sm shrink-0"
                  style={{ background: C.gray }}
                />

                <span>Inactive — archived / no longer used</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}

      {notification && (
        <div
          className="fixed bottom-6 right-6 panel px-4 py-3 flex items-center gap-2 text-sm z-50"
          style={{
            background: notification.kind === "success" ? C.green : C.red,

            color: "white",

            borderLeft: `3px solid ${notification.kind === "success" ? "#15803d" : "#991b1b"}`,

            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          }}
        >
          {notification.kind === "success" ? <Icons.check /> : <Icons.alert />}

          <span>{notification.message}</span>
        </div>
      )}

      {/* Purchases popup — read + edit + delete */}

      {selectedSupplier && (
        <SupplierPurchasesModal
          supplier={selectedSupplier}
          onClose={() => setSelectedSupplier(null)}
          onEdit={() => openEdit(selectedSupplier)}
          onPurchaseChanged={onPurchaseChanged}
        />
      )}

      {/* Form modal — create + edit */}

      {formMode && (
        <SupplierFormModal
          mode={formMode}
          initial={editingSupplier}
          onClose={closeForm}
          onSaved={onFormSaved}
        />
      )}
    </div>
  );
}
