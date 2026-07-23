"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  getAllMaterialsClient,
  getMaterialByIdClient,
  createMaterialClient,
  adjustStockClient,
  addLeftoverClient,
  useLeftoverClient,
  deleteLeftoverClient,
} from "../../lib/api_helpers/materials";
import { getAllCategoriesClient } from "../../lib/api_helpers/categories";
import { getSuppliers } from "../../lib/api_helpers/supplier";

/* ─── Reusable UI ─── */
const StageBadge = ({ stage, size = "sm" }) => {
  const map = {
    IN_STOCK: { color: "var(--stage-completed)", label: "In Stock", dot: "●" },
    LOW_STOCK: { color: "var(--accent)", label: "Low Stock", dot: "●" },
    OUT_OF_STOCK: {
      color: "var(--stage-contract)",
      label: "Out of Stock",
      dot: "●",
    },
    ORDERED: { color: "var(--stage-ready)", label: "Ordered", dot: "●" },
  };
  const s = map[stage] || map.IN_STOCK;
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
      <span style={{ fontSize: size === "lg" ? 12 : 10 }}>{s.dot}</span>{" "}
      {s.label}
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
  package: () => (
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
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
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
  minus: () => (
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
  history: () => (
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
      <path d="M3 3v5h5" />
      <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
      <path d="M12 7v5l4 2" />
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
      <path d="M10 17h4V5H2v12h3" />
      <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5" />
      <path d="M14 17h1" />
      <circle cx="7.5" cy="17.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
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
  ruler: () => (
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
      <path d="M2 12h20" />
      <path d="M2 17h20" />
      <path d="M2 7h20" />
      <path d="M6 12v5" />
      <path d="M10 12v5" />
      <path d="M14 12v5" />
      <path d="M18 12v5" />
    </svg>
  ),
  scissors: () => (
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
      <circle cx="6" cy="6" r="3" />
      <path d="M8.12 8.12 12 12" />
      <path d="M20 4 8.12 15.88" />
      <circle cx="6" cy="18" r="3" />
      <path d="M14.8 14.8 20 20" />
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
      <path d="M21 12a9 9 0 1 1-3-6.7" />
      <path d="M21 4v5h-5" />
    </svg>
  ),
};

const STATUSES = ["All", "IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK", "ORDERED"];
const STATUS_DOT = {
  IN_STOCK: "var(--stage-completed)",
  LOW_STOCK: "var(--accent)",
  OUT_OF_STOCK: "var(--stage-contract)",
  ORDERED: "var(--stage-ready)",
};

const computeStatus = (stock, minStock, maxStock, manual) => {
  if (manual === "ORDERED") return "ORDERED";
  if (stock <= 0) return "OUT_OF_STOCK";
  if (stock <= minStock) return "LOW_STOCK";
  return "IN_STOCK";
};

const Modal = ({ title, onClose, children, footer, maxWidth = 520 }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{ background: "rgba(0,0,0,0.55)" }}
    onClick={onClose}
  >
    <div
      className="w-full rounded-xl shadow-2xl flex flex-col max-h-[90vh]"
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
      <div className="flex-1 overflow-y-auto p-5">{children}</div>
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

const Field = ({ label, children, hint }) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-xs font-medium" style={{ color: "var(--ink-muted)" }}>
      {label}
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

export default function MaterialsClient() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showHistory, setShowHistory] = useState(false);

  const [adjustQty, setAdjustQty] = useState("");

  const [showNewModal, setShowNewModal] = useState(false);
  const emptyForm = {
    name: "",
    categoryId: null,
    unit: "sheet",
    stock: 0,
    minStock: 1,
    maxStock: 10,
    supplierId: null,
    price: 0,
    location: "",
  };
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [showAddLeftover, setShowAddLeftover] = useState(false);
  const [leftoverForm, setLeftoverForm] = useState({
    description: "",
    dimensions: "",
    qty: 1,
  });
  const [leftoverSubmitting, setLeftoverSubmitting] = useState(false);

  const loadMaterials = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllMaterialsClient();
      setMaterials(data);
      setSelectedId((prev) => prev ?? data[0]?.id ?? null);
    } catch (err) {
      setError(err.message);
      console.error("loadMaterials", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDetail = useCallback(async (code) => {
    if (!code) return;
    try {
      setDetailLoading(true);
      setSelectedDetail(await getMaterialByIdClient(code));
    } catch (err) {
      console.error("loadDetail", err);
      setSelectedDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const loadLookups = useCallback(async () => {
    try {
      const [cats, sups] = await Promise.all([
        getAllCategoriesClient().catch(() => []),
        getSuppliers().catch(() => []),
      ]);
      setCategories(cats);
      setSuppliers(sups);
    } catch (err) {
      console.error("loadLookups", err);
    }
  }, []);

  useEffect(() => {
    loadMaterials();
    loadLookups();
  }, [loadMaterials, loadLookups]);
  useEffect(() => {
    loadDetail(selectedId);
  }, [selectedId, loadDetail]);

  const catNames = useMemo(
    () => ["All", ...categories.map((c) => c.name)],
    [categories],
  );
  const filtered = useMemo(
    () =>
      materials.filter((m) => {
        const haystack = `${m.id} ${m.name} ${m.supplier}`.toLowerCase();
        return (
          haystack.includes(search.toLowerCase()) &&
          (catFilter === "All" || m.category === catFilter) &&
          (statusFilter === "All" || m.status === statusFilter)
        );
      }),
    [materials, search, catFilter, statusFilter],
  );

  const lowStockCount = materials.filter(
    (m) => m.status === "LOW_STOCK",
  ).length;
  const outStockCount = materials.filter(
    (m) => m.status === "OUT_OF_STOCK",
  ).length;
  const totalValue = materials.reduce((sum, m) => sum + m.stock * m.price, 0);

  const selected = selectedDetail ?? materials.find((m) => m.id === selectedId);
  const stockPercent = selected
    ? Math.min(100, Math.round((selected.stock / selected.maxStock) * 100))
    : 0;
  const stockColor =
    stockPercent > 50
      ? "var(--stage-completed)"
      : stockPercent > 20
        ? "var(--accent)"
        : "var(--stage-contract)";

  const refreshAfterChange = async () => {
    await loadMaterials();
    if (selectedId) await loadDetail(selectedId);
  };

  const handleAdjust = async (type) => {
    const qty = parseInt(adjustQty);
    if (!qty || qty < 1 || !selectedId) return;
    try {
      await adjustStockClient(selectedId, {
        type: type === "in" ? "IN" : "OUT",
        quantity: qty,
      });
      setAdjustQty("");
      await refreshAfterChange();
    } catch (err) {
      alert(`Failed to adjust stock: ${err.message}`);
    }
  };

  const handleUseLeftover = async (row) => {
    try {
      await useLeftoverClient(selectedId, row.dbId);
      await refreshAfterChange();
    } catch (err) {
      alert(`Failed to use leftover: ${err.message}`);
    }
  };

  const handleDeleteLeftover = async (row) => {
    if (!confirm(`Delete leftover "${row.description}"?`)) return;
    try {
      await deleteLeftoverClient(selectedId, row.dbId);
      await refreshAfterChange();
    } catch (err) {
      alert(`Failed to delete leftover: ${err.message}`);
    }
  };

  const handleAddLeftover = async () => {
    if (!leftoverForm.description.trim() && !leftoverForm.dimensions.trim())
      return;
    if (!selectedId) return;
    try {
      setLeftoverSubmitting(true);
      await addLeftoverClient(selectedId, {
        description: leftoverForm.description,
        dimensions: leftoverForm.dimensions,
        quantity: leftoverForm.qty,
      });
      setLeftoverForm({ description: "", dimensions: "", qty: 1 });
      setShowAddLeftover(false);
      await refreshAfterChange();
    } catch (err) {
      alert(`Failed to add leftover: ${err.message}`);
    } finally {
      setLeftoverSubmitting(false);
    }
  };

  const handleCreateMaterial = async () => {
    setFormError("");
    if (!form.name.trim()) return setFormError("Name is required");
    if (!form.supplierId) return setFormError("Supplier is required");
    if (form.minStock >= form.maxStock)
      return setFormError("Min stock must be less than max stock");
    try {
      setFormSubmitting(true);
      const created = await createMaterialClient({
        name: form.name,
        categoryId: form.categoryId,
        unit: form.unit,
        stock: form.stock,
        minStock: form.minStock,
        maxStock: form.maxStock,
        supplierId: form.supplierId,
        price: form.price,
        location: form.location,
      });
      setMaterials((prev) => [created, ...prev]);
      setSelectedId(created.id);
      setForm(emptyForm);
      setShowNewModal(false);
      loadMaterials();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="flex h-full">
      {/* LEFT: Table + Filters */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {error && (
          <div
            className="flex items-center gap-3 px-4 py-3 shrink-0"
            style={{
              background: "var(--stage-contract)15",
              borderBottom: "1px solid rgba(220,38,38,0.2)",
              color: "var(--stage-contract)",
            }}
          >
            <Icons.alert />
            <span className="text-sm font-medium">{error}</span>
            <button
              onClick={loadMaterials}
              className="ml-auto btn-ghost text-xs flex items-center gap-1"
            >
              <Icons.refresh /> Retry
            </button>
          </div>
        )}

        {!loading && !error && (lowStockCount > 0 || outStockCount > 0) && (
          <div
            className="flex items-center gap-3 px-4 py-3 shrink-0"
            style={{
              background: "var(--accent-soft)",
              borderBottom: "1px solid rgba(254,189,17,0.2)",
            }}
          >
            <Icons.alert />
            <span
              className="text-sm font-medium"
              style={{ color: "var(--accent)" }}
            >
              {lowStockCount} low stock · {outStockCount} out of stock
            </span>
            <button
              onClick={() => setStatusFilter("LOW_STOCK")}
              className="ml-auto text-xs font-medium px-3 py-1 rounded-md"
              style={{ background: "var(--accent)", color: "var(--on-accent)" }}
            >
              View Low Stock
            </button>
          </div>
        )}

        <div
          className="flex items-center gap-3 p-4 shrink-0 flex-wrap"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-md focus-ring"
            style={{
              background: "var(--bg)",
              border: "1px solid var(--border)",
              width: 240,
            }}
          >
            <Icons.search />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search materials..."
              className="bg-transparent text-sm outline-none w-full placeholder:text-[var(--ink-muted)]"
              style={{ color: "var(--ink)" }}
            />
            {search && (
              <button onClick={() => setSearch("")} className="btn-ghost p-0.5">
                <Icons.x />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {catNames.map((c) => (
              <button
                key={c}
                onClick={() => setCatFilter(c)}
                className="text-xs font-medium px-3 py-1.5 rounded-md transition-colors"
                style={{
                  background:
                    catFilter === c ? "var(--surface-2)" : "transparent",
                  color: catFilter === c ? "var(--ink)" : "var(--ink-muted)",
                  border: `1px solid ${catFilter === c ? "var(--border)" : "transparent"}`,
                }}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-2 flex-wrap">
            {STATUSES.filter((s) => s !== "All").map((s) => {
              const count = materials.filter((m) => m.status === s).length;
              const active = statusFilter === s;
              return (
                <button
                  key={s}
                  onClick={() =>
                    setStatusFilter(statusFilter === s ? "All" : s)
                  }
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md transition-colors"
                  style={{
                    background: active ? `${STATUS_DOT[s]}15` : "transparent",
                    color: active ? STATUS_DOT[s] : "var(--ink-muted)",
                    border: `1px solid ${active ? `${STATUS_DOT[s]}40` : "transparent"}`,
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: STATUS_DOT[s] }}
                  />
                  {s.replace(/_/g, " ")}
                  <span
                    className="ml-1 px-1.5 py-0.5 rounded text-[10px]"
                    style={{
                      background: "var(--bg)",
                      color: "var(--ink-muted)",
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex-1" />
          <button
            onClick={loadMaterials}
            className="btn-ghost text-xs px-2 py-1.5"
            title="Refresh"
            disabled={loading}
          >
            <Icons.refresh />
          </button>
          <button
            onClick={() => setShowNewModal(true)}
            className="btn-primary text-xs px-3 py-1.5"
          >
            <Icons.plus /> New Material
          </button>
          <div className="text-xs" style={{ color: "var(--ink-muted)" }}>
            {filtered.length} items · {totalValue.toLocaleString()} DZD
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {loading ? (
            <div
              className="px-4 py-12 text-center text-sm"
              style={{ color: "var(--ink-muted)" }}
            >
              Loading materials…
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead
                className="sticky top-0 z-10"
                style={{ background: "var(--surface-2)" }}
              >
                <tr>
                  <th
                    className="px-4 py-3 text-xs font-medium"
                    style={{ color: "var(--ink-muted)" }}
                  >
                    ID
                  </th>
                  <th
                    className="px-4 py-3 text-xs font-medium"
                    style={{ color: "var(--ink-muted)" }}
                  >
                    Material
                  </th>
                  <th
                    className="px-4 py-3 text-xs font-medium"
                    style={{ color: "var(--ink-muted)" }}
                  >
                    Category
                  </th>
                  <th
                    className="px-4 py-3 text-xs font-medium"
                    style={{ color: "var(--ink-muted)" }}
                  >
                    Stock
                  </th>
                  <th
                    className="px-4 py-3 text-xs font-medium"
                    style={{ color: "var(--ink-muted)" }}
                  >
                    Status
                  </th>
                  <th
                    className="px-4 py-3 text-xs font-medium"
                    style={{ color: "var(--ink-muted)" }}
                  >
                    Leftovers
                  </th>
                  <th
                    className="px-4 py-3 text-xs font-medium"
                    style={{ color: "var(--ink-muted)" }}
                  >
                    Supplier
                  </th>
                  <th
                    className="px-4 py-3 text-xs font-medium text-right"
                    style={{ color: "var(--ink-muted)" }}
                  >
                    Unit Price
                  </th>
                  <th
                    className="px-4 py-3 text-xs font-medium text-center"
                    style={{ color: "var(--ink-muted)" }}
                  ></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => {
                  const isSel = selectedId === m.id;
                  const stockPct = Math.min(100, (m.stock / m.maxStock) * 100);
                  return (
                    <tr
                      key={m.id}
                      onClick={() => setSelectedId(m.id)}
                      className="cursor-pointer transition-colors"
                      style={{
                        background: isSel
                          ? "var(--accent-soft)"
                          : "transparent",
                        borderTop: "1px solid var(--border)",
                      }}
                    >
                      <td
                        className="px-4 py-3 font-medium text-xs"
                        style={{ color: "var(--ink-muted)" }}
                      >
                        {m.id}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-sm">{m.name}</div>
                        <div
                          className="text-xs"
                          style={{ color: "var(--ink-muted)" }}
                        >
                          {m.location}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs">{m.category}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium tabular-nums">
                            {m.stock}
                          </span>
                          <span
                            className="text-xs"
                            style={{ color: "var(--ink-muted)" }}
                          >
                            {m.unit}
                          </span>
                        </div>
                        <div
                          className="mt-1 h-1 w-16 rounded-full overflow-hidden"
                          style={{ background: "var(--surface-2)" }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${stockPct}%`,
                              background:
                                m.status === "OUT_OF_STOCK"
                                  ? "var(--stage-contract)"
                                  : m.status === "LOW_STOCK"
                                    ? "var(--accent)"
                                    : "var(--stage-completed)",
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StageBadge stage={m.status} />
                      </td>
                      <td className="px-4 py-3">
                        {m.leftoverCount > 0 ? (
                          <span
                            className="inline-flex items-center gap-1.5 text-xs font-medium"
                            style={{ color: "var(--ink-muted)" }}
                          >
                            <Icons.ruler />
                            <span className="tabular-nums">
                              {m.leftoverCount}
                            </span>
                            <span>piece{m.leftoverCount > 1 ? "s" : ""}</span>
                          </span>
                        ) : (
                          <span
                            className="text-xs"
                            style={{ color: "var(--ink-muted)" }}
                          >
                            —
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs">{m.supplier}</td>
                      <td className="px-4 py-3 text-right font-medium tabular-nums">
                        {m.price.toLocaleString()} DZD
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          className="btn-ghost p-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Icons.more />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && !loading && (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-12 text-center text-sm"
                      style={{ color: "var(--ink-muted)" }}
                    >
                      No materials match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* RIGHT: Detail Panel */}
      <div
        className="w-[400px] shrink-0 flex flex-col overflow-y-auto"
        style={{
          borderLeft: "1px solid var(--border)",
          background: "var(--surface)",
        }}
      >
        {!selected ? (
          <div
            className="flex-1 flex items-center justify-center text-sm"
            style={{ color: "var(--ink-muted)" }}
          >
            {detailLoading ? "Loading…" : "Select a material"}
          </div>
        ) : (
          <>
            <div
              className="p-5"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-xs font-medium"
                  style={{ color: "var(--ink-muted)" }}
                >
                  {selected.id}
                </span>
                <StageBadge stage={selected.status} size="lg" />
              </div>
              <h2 className="text-lg font-semibold">{selected.name}</h2>
              <div
                className="text-sm mt-1"
                style={{ color: "var(--ink-muted)" }}
              >
                {selected.category} · {selected.supplier}
              </div>
            </div>

            <div
              className="p-5"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <div className="flex items-end justify-between mb-2">
                <div>
                  <div className="text-3xl font-bold tabular-nums">
                    {selected.stock}
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: "var(--ink-muted)" }}
                  >
                    {selected.unit} in stock
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className="text-sm font-medium"
                    style={{ color: stockColor }}
                  >
                    {stockPercent}% capacity
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: "var(--ink-muted)" }}
                  >
                    Min: {selected.minStock} · Max: {selected.maxStock}
                  </div>
                </div>
              </div>
              <div
                className="h-2 w-full rounded-full overflow-hidden"
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${stockPercent}%`, background: stockColor }}
                />
              </div>
              <div
                className="flex justify-between mt-1 text-[10px] uppercase tracking-wider"
                style={{ color: "var(--ink-muted)" }}
              >
                <span>0</span>
                <span
                  style={{
                    color:
                      selected.stock < selected.minStock
                        ? "var(--accent)"
                        : undefined,
                  }}
                >
                  Min ({selected.minStock})
                </span>
                <span>Max ({selected.maxStock})</span>
              </div>
            </div>

            <div
              className="p-5 space-y-3"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <h3
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--ink-muted)" }}
              >
                Quick Adjust
              </h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  placeholder="Qty"
                  className="flex-1 px-3 py-2 rounded-md text-sm outline-none focus-ring tabular-nums"
                  style={inputStyle}
                />
                <button
                  onClick={() => handleAdjust("in")}
                  className="btn-primary px-4"
                >
                  <Icons.plus /> In
                </button>
                <button
                  onClick={() => handleAdjust("out")}
                  className="btn-ghost px-4 border"
                  style={{ borderColor: "var(--border)" }}
                >
                  <Icons.minus /> Out
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  className="btn-ghost flex-1 justify-center text-xs border"
                  style={{ borderColor: "var(--border)" }}
                >
                  <Icons.truck /> Order Restock
                </button>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="btn-ghost flex-1 justify-center text-xs border"
                  style={{
                    borderColor: "var(--border)",
                    color: showHistory ? "var(--accent)" : undefined,
                  }}
                >
                  <Icons.history /> {showHistory ? "Hide" : "Show"} History
                </button>
              </div>
            </div>

            <div
              className="p-5 space-y-3"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <div className="flex items-center justify-between">
                <h3
                  className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2"
                  style={{ color: "var(--ink-muted)" }}
                >
                  <Icons.ruler /> Leftovers
                  <span
                    className="px-1.5 py-0.5 rounded text-[10px] tabular-nums"
                    style={{
                      background: "var(--bg)",
                      color: "var(--ink-muted)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {(selected.leftovers ?? []).reduce((s, l) => s + l.qty, 0)}
                  </span>
                </h3>
                <button
                  onClick={() => setShowAddLeftover((s) => !s)}
                  className="text-xs font-medium flex items-center gap-1 px-2 py-1 rounded-md"
                  style={{
                    background: "var(--bg)",
                    color: "var(--ink)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <Icons.plus /> Add
                </button>
              </div>

              {showAddLeftover && (
                <div
                  className="p-3 rounded-lg space-y-2"
                  style={{
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <input
                    value={leftoverForm.description}
                    onChange={(e) =>
                      setLeftoverForm((f) => ({
                        ...f,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Description"
                    className="w-full px-2.5 py-1.5 rounded text-xs outline-none focus-ring"
                    style={inputStyle}
                  />
                  <div className="flex gap-2">
                    <input
                      value={leftoverForm.dimensions}
                      onChange={(e) =>
                        setLeftoverForm((f) => ({
                          ...f,
                          dimensions: e.target.value,
                        }))
                      }
                      placeholder="Dimensions (60 × 40 cm)"
                      className="flex-1 px-2.5 py-1.5 rounded text-xs outline-none focus-ring"
                      style={inputStyle}
                    />
                    <input
                      type="number"
                      min="1"
                      value={leftoverForm.qty}
                      onChange={(e) =>
                        setLeftoverForm((f) => ({ ...f, qty: e.target.value }))
                      }
                      className="w-16 px-2.5 py-1.5 rounded text-xs outline-none focus-ring tabular-nums text-center"
                      style={inputStyle}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => {
                        setShowAddLeftover(false);
                        setLeftoverForm({
                          description: "",
                          dimensions: "",
                          qty: 1,
                        });
                      }}
                      className="btn-ghost text-xs px-3 py-1"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddLeftover}
                      disabled={leftoverSubmitting}
                      className="btn-primary text-xs px-3 py-1 disabled:opacity-50"
                    >
                      <Icons.plus /> {leftoverSubmitting ? "Saving…" : "Save"}
                    </button>
                  </div>
                </div>
              )}

              {detailLoading && !selected.leftovers?.length ? (
                <div
                  className="text-center py-6 text-xs"
                  style={{ color: "var(--ink-muted)" }}
                >
                  Loading…
                </div>
              ) : (selected.leftovers ?? []).length === 0 ? (
                <div
                  className="text-center py-6 text-xs"
                  style={{ color: "var(--ink-muted)" }}
                >
                  No leftovers yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {(selected.leftovers ?? []).map((l) => (
                    <div
                      key={l.id}
                      className="p-3 rounded-lg flex items-center gap-3 group"
                      style={{
                        background: "var(--bg)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{
                          background: "var(--surface-2)",
                          color: "var(--accent)",
                        }}
                      >
                        <Icons.ruler />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {l.description}
                        </div>
                        <div
                          className="text-xs flex items-center gap-1.5"
                          style={{ color: "var(--ink-muted)" }}
                        >
                          {l.dimensions && <span>{l.dimensions}</span>}
                          {l.dimensions && <span>·</span>}
                          <span>{l.source}</span>
                          <span>·</span>
                          <span>{l.date}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-sm font-bold tabular-nums px-2 py-0.5 rounded"
                          style={{ background: "var(--surface-2)" }}
                        >
                          ×{l.qty}
                        </span>
                        <button
                          onClick={() => handleUseLeftover(l)}
                          className="btn-primary text-xs px-2.5 py-1.5"
                          title="Use one"
                        >
                          <Icons.scissors /> Use
                        </button>
                        <button
                          onClick={() => handleDeleteLeftover(l)}
                          className="btn-ghost p-1.5 opacity-50 hover:opacity-100"
                          title="Delete"
                        >
                          <Icons.trash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {showHistory && (
              <div
                className="p-5 space-y-3"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <h3
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "var(--ink-muted)" }}
                >
                  Recent Usage
                </h3>
                {detailLoading && !selected.usage?.length ? (
                  <div
                    className="text-xs text-center py-4"
                    style={{ color: "var(--ink-muted)" }}
                  >
                    Loading…
                  </div>
                ) : (selected.usage ?? []).length === 0 ? (
                  <div
                    className="text-xs text-center py-4"
                    style={{ color: "var(--ink-muted)" }}
                  >
                    No movements yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(selected.usage ?? []).map((u) => (
                      <div
                        key={u.id}
                        className="flex items-center gap-3 p-3 rounded-lg"
                        style={{
                          background: "var(--bg)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                          style={{
                            background: "var(--surface-2)",
                            color:
                              u.type === "in"
                                ? "var(--stage-completed)"
                                : "var(--accent)",
                          }}
                        >
                          {u.type === "in" ? <Icons.box /> : <Icons.package />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {u.order}
                          </div>
                          <div
                            className="text-xs"
                            style={{ color: "var(--ink-muted)" }}
                          >
                            {u.worker} · {u.date}
                          </div>
                        </div>
                        <div
                          className="text-sm font-bold tabular-nums"
                          style={{
                            color:
                              u.type === "in"
                                ? "var(--stage-completed)"
                                : "var(--accent)",
                          }}
                        >
                          {u.type === "in" ? "+" : "-"}
                          {u.qty}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div
              className="p-5 space-y-3"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <h3
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--ink-muted)" }}
              >
                Details
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div
                  className="p-3 rounded-lg"
                  style={{
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div
                    className="text-xs mb-1"
                    style={{ color: "var(--ink-muted)" }}
                  >
                    Location
                  </div>
                  <div className="text-sm font-medium">
                    {selected.location || "—"}
                  </div>
                </div>
                <div
                  className="p-3 rounded-lg"
                  style={{
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div
                    className="text-xs mb-1"
                    style={{ color: "var(--ink-muted)" }}
                  >
                    Last Used
                  </div>
                  <div className="text-sm font-medium">
                    {selected.lastUsed || "—"}
                  </div>
                </div>
              </div>
              <div
                className="flex justify-between text-sm py-2"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                <span style={{ color: "var(--ink-muted)" }}>
                  Inventory Value
                </span>
                <span className="font-semibold">
                  {(selected.stock * selected.price).toLocaleString()} DZD
                </span>
              </div>
            </div>

            <div className="p-5 mt-auto space-y-2">
              <button className="btn-primary w-full justify-center text-sm">
                <Icons.edit /> Edit Material
              </button>
              <button
                className="btn-ghost w-full justify-center text-sm border"
                style={{ borderColor: "var(--border)" }}
              >
                <Icons.truck /> Request Quote from{" "}
                {selected.supplier || "Supplier"}
              </button>
            </div>
          </>
        )}
      </div>

      {/* New Material Modal */}
      {showNewModal && (
        <Modal
          title="New Material"
          onClose={() => {
            setShowNewModal(false);
            setFormError("");
            setForm(emptyForm);
          }}
          footer={
            <>
              <button
                onClick={() => {
                  setShowNewModal(false);
                  setFormError("");
                  setForm(emptyForm);
                }}
                className="btn-ghost px-4 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateMaterial}
                disabled={formSubmitting}
                className="btn-primary px-4 text-sm disabled:opacity-50"
              >
                <Icons.plus /> {formSubmitting ? "Creating…" : "Create"}
              </button>
            </>
          }
        >
          <div className="grid grid-cols-2 gap-4">
            <Field label="Material Name *">
              <input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. Oak Plank 20mm"
                className="px-3 py-2 rounded-md text-sm outline-none focus-ring"
                style={inputStyle}
              />
            </Field>
            <Field label="Category *">
              <select
                value={form.categoryId ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    categoryId: e.target.value ? Number(e.target.value) : null,
                  }))
                }
                className="px-3 py-2 rounded-md text-sm outline-none focus-ring"
                style={inputStyle}
              >
                <option value="">— select —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Unit *">
              <select
                value={form.unit}
                onChange={(e) =>
                  setForm((f) => ({ ...f, unit: e.target.value }))
                }
                className="px-3 py-2 rounded-md text-sm outline-none focus-ring"
                style={inputStyle}
              >
                {[
                  "m²",
                  "sheet",
                  "pc",
                  "m",
                  "roll",
                  "can",
                  "pair",
                  "kg",
                  "L",
                ].map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>
            </Field>
            <Field label="Supplier *">
              <select
                value={form.supplierId ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    supplierId: e.target.value ? Number(e.target.value) : null,
                  }))
                }
                className="px-3 py-2 rounded-md text-sm outline-none focus-ring"
                style={inputStyle}
              >
                <option value="">— select —</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Location">
              <input
                value={form.location}
                onChange={(e) =>
                  setForm((f) => ({ ...f, location: e.target.value }))
                }
                placeholder="e.g. Shelf A1"
                className="px-3 py-2 rounded-md text-sm outline-none focus-ring"
                style={inputStyle}
              />
            </Field>
            <Field label="Unit Price (DZD)">
              <input
                type="number"
                min="0"
                value={form.price}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    price: parseInt(e.target.value) || 0,
                  }))
                }
                className="px-3 py-2 rounded-md text-sm outline-none focus-ring tabular-nums"
                style={inputStyle}
              />
            </Field>
            <Field label="Initial Stock">
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    stock: parseInt(e.target.value) || 0,
                  }))
                }
                className="px-3 py-2 rounded-md text-sm outline-none focus-ring tabular-nums"
                style={inputStyle}
              />
            </Field>
            <div />
            <Field label="Min Stock" hint="Below this = Low Stock">
              <input
                type="number"
                min="0"
                value={form.minStock}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    minStock: parseInt(e.target.value) || 0,
                  }))
                }
                className="px-3 py-2 rounded-md text-sm outline-none focus-ring tabular-nums"
                style={inputStyle}
              />
            </Field>
            <Field label="Max Stock" hint="Full capacity">
              <input
                type="number"
                min="1"
                value={form.maxStock}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    maxStock: parseInt(e.target.value) || 1,
                  }))
                }
                className="px-3 py-2 rounded-md text-sm outline-none focus-ring tabular-nums"
                style={inputStyle}
              />
            </Field>
          </div>

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

          <div
            className="mt-5 p-3 rounded-lg flex items-center justify-between"
            style={{
              background: "var(--bg)",
              border: "1px solid var(--border)",
            }}
          >
            <span className="text-xs" style={{ color: "var(--ink-muted)" }}>
              Computed status
            </span>
            <StageBadge
              stage={computeStatus(
                form.stock,
                form.minStock,
                form.maxStock,
                null,
              )}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
