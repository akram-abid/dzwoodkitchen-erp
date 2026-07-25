"use client";

/* ════════════════════════════════════════════════════════════════
   OrderFormModal — the full "Create / Edit Order" modal, extracted
   from OrdersClient.jsx so it can be reused anywhere (e.g. the
   home dashboard's quick-action popover) with the exact same look,
   fields, and behavior as the Orders page.

   Usage:
     <OrderFormModal
       isOpen={modal?.type === "NEW_ORDER"}
       onClose={() => setModal(null)}
       onSave={createOrder}          // receives the raw form payload
       existingClients={clientList}  // optional, same shape as Orders page
       workers={workers}             // array of worker objects/strings
     />
   ════════════════════════════════════════════════════════════════ */

import { useState, useMemo, useEffect } from "react";

/* ─── Icons (subset needed by this form) ─── */
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
  plus: () => (
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
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  ),
  phone: () => (
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
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  mapPin: () => (
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
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
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
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
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
  userCheck: () => (
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
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <polyline points="16 11 18 13 22 9" />
    </svg>
  ),
  userPlus: () => (
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
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" x2="19" y1="8" y2="14" />
      <line x1="22" x2="16" y1="11" y2="11" />
    </svg>
  ),
};

/* ─── Defaults (can be overridden via props) ─── */
const DEFAULT_STAGES = [
  "APPOINTMENT",
  "CONTRACT",
  "IN_PRODUCTION",
  "READY_TO_DELIVER",
  "COMPLETED",
];

const formatDZD = (n) => `${(n || 0).toLocaleString()} DZD`;

/* Normalizes whatever worker shape is passed in (string, or object with
   full_name / shortName / name) down to a plain display string. */
const workerLabel = (w) =>
  typeof w === "string" ? w : w.full_name || w.shortName || w.name || "Worker";

/* ─── Generic modal shell (same chrome as the Orders page) ─── */
const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  accent = "accent",
  children,
  footer,
  maxWidth = "600px",
}) => {
  useEffect(() => {
    if (isOpen) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = orig;
      };
    }
  }, [isOpen]);
  if (!isOpen) return null;
  const accentColor = `var(--${accent})`;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl shadow-2xl w-full max-h-[92vh] overflow-hidden flex flex-col"
        style={{
          maxWidth,
          background: "var(--surface)",
          border: "1px solid var(--border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="relative px-5 sm:px-6 pt-5 sm:pt-6 pb-4 sm:pb-5 shrink-0"
          style={{
            background: `linear-gradient(135deg, ${accentColor}18 0%, ${accentColor}05 100%)`,
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div className="flex items-start gap-3">
            {icon && (
              <div
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                style={{ background: accentColor, color: "#fff" }}
              >
                {icon}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2
                className="text-base sm:text-lg font-bold leading-tight"
                style={{ color: "var(--ink)" }}
              >
                {title}
              </h2>
              {subtitle && (
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "var(--ink-muted)" }}
                >
                  {subtitle}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:opacity-70 transition-opacity shrink-0"
              style={{ color: "var(--ink-muted)", background: "var(--bg)" }}
            >
              <Icons.x />
            </button>
          </div>
        </div>
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">{children}</div>
        {footer && (
          <div
            className="px-5 sm:px-6 py-3 sm:py-4 shrink-0 flex items-center justify-end gap-2 flex-wrap"
            style={{
              background: "var(--bg)",
              borderTop: "1px solid var(--border)",
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

const Btn = ({
  children,
  variant = "primary",
  onClick,
  type = "button",
  disabled,
  className = "",
  style = {},
}) => {
  const variants = {
    primary: {
      background: "var(--accent)",
      color: "#fff",
      border: "1px solid var(--accent)",
    },
    ghost: {
      background: "transparent",
      color: "var(--ink)",
      border: "1px solid var(--border)",
    },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-bold transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 ${className}`}
      style={{ ...variants[variant], ...style }}
    >
      {children}
    </button>
  );
};

const emptyForm = () => ({
  client: "",
  phone: "",
  address: "",
  project: "",
  amount: "",
  dueDate: "",
  stage: "APPOINTMENT",
  worker: "Unassigned",
  items: [{ name: "", qty: 1, unit: "pcs", l: "", w: "", h: "" }],
  payments: [],
  missingItems: [],
  technical: { truckDistance: "", floor: "", fee: "" },
});

/* ════════════════════════════════════════════════════════════════
   OrderFormModal
   ════════════════════════════════════════════════════════════════ */
export const OrderFormModal = ({
  isOpen,
  onClose,
  onSave,
  initialData = null,
  existingClients = [],
  workers = [],
  stages = DEFAULT_STAGES,
}) => {
  const [formData, setFormData] = useState(emptyForm());
  const [useExistingClient, setUseExistingClient] = useState(false);
  const [clientSearch, setClientSearch] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...emptyForm(),
        ...initialData,
        amount: (initialData.amount ?? "").toString(),
        items:
          initialData.items && initialData.items.length
            ? initialData.items
            : [{ name: "", qty: 1, unit: "pcs", l: "", w: "", h: "" }],
        payments: initialData.payments || [],
        missingItems: initialData.missingItems || [],
        technical: initialData.technical || {
          truckDistance: "",
          floor: "",
          fee: "",
        },
      });
      const matched = existingClients.find(
        (c) => c.client === initialData.client,
      );
      setUseExistingClient(!!matched);
    } else {
      setFormData(emptyForm());
      setUseExistingClient(false);
    }
    setClientSearch("");
  }, [initialData, isOpen]);

  const handleChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData((prev) => ({ ...prev, items: newItems }));
  };
  const addItem = () =>
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { name: "", qty: 1, unit: "pcs", l: "", w: "", h: "" },
      ],
    }));
  const removeItem = (index) =>
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));

  const handlePickClient = (c) => {
    setFormData((prev) => ({
      ...prev,
      client: c.client,
      phone: c.phone,
      address: c.address,
    }));
    setUseExistingClient(true);
  };

  const filteredClients = useMemo(() => {
    if (!clientSearch.trim()) return existingClients;
    const q = clientSearch.toLowerCase();
    return existingClients.filter((c) =>
      `${c.client} ${c.phone} ${c.address}`.toLowerCase().includes(q),
    );
  }, [clientSearch, existingClients]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      amount: Number(formData.amount) || 0,
      items: formData.items.filter((i) => i.name),
      created: initialData
        ? initialData.created
        : new Date().toISOString().split("T")[0],
      id: initialData ? initialData.id : undefined,
      missingItems: formData.missingItems || [],
      completedAt: initialData?.completedAt || null,
    };
    onSave(data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Order" : "Create New Order"}
      subtitle={
        initialData
          ? `${initialData.id} · ${initialData.project}`
          : "Add a new client order"
      }
      icon={initialData ? <Icons.edit /> : <Icons.plus />}
      accent="accent"
      maxWidth="720px"
      footer={
        <>
          <Btn variant="ghost" onClick={onClose}>
            Cancel
          </Btn>
          <Btn variant="primary" onClick={handleSubmit}>
            {initialData ? "Save Changes" : "Create Order"}
          </Btn>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Existing client toggle */}
        {!initialData && existingClients.length > 0 && (
          <div className="space-y-2">
            <label
              className="flex items-center gap-2.5 p-3 rounded-lg cursor-pointer transition-colors"
              style={{
                background: useExistingClient
                  ? "var(--accent-soft)"
                  : "var(--bg)",
                border: `1px solid ${useExistingClient ? "var(--accent)" : "var(--border)"}`,
              }}
            >
              <input
                type="checkbox"
                checked={useExistingClient}
                onChange={(e) => {
                  setUseExistingClient(e.target.checked);
                  if (!e.target.checked) {
                    handleChange("client", "");
                    handleChange("phone", "");
                    handleChange("address", "");
                  }
                }}
                className="w-4 h-4 accent-blue-600"
              />
              <div className="flex items-center gap-2 flex-1">
                {useExistingClient ? <Icons.userCheck /> : <Icons.userPlus />}
                <div>
                  <div
                    className="text-sm font-bold"
                    style={{ color: "var(--ink)" }}
                  >
                    {useExistingClient ? "Existing client" : "New client"}
                  </div>
                  <div
                    className="text-[11px]"
                    style={{ color: "var(--ink-muted)" }}
                  >
                    {useExistingClient
                      ? "Pick from your previous customers (auto-fills contact info)"
                      : "First time working with this client"}
                  </div>
                </div>
              </div>
            </label>

            {useExistingClient && (
              <div
                className="rounded-xl overflow-hidden"
                style={{
                  border: "1px solid var(--accent)",
                  background: "var(--bg)",
                }}
              >
                <div
                  className="flex items-center gap-2 px-3 py-2.5"
                  style={{
                    background: "var(--surface-2)",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <Icons.search />
                  <input
                    autoFocus
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    placeholder="Search by name, phone, address…"
                    className="bg-transparent outline-none w-full text-sm"
                    style={{ color: "var(--ink)" }}
                  />
                  {clientSearch && (
                    <button
                      type="button"
                      onClick={() => setClientSearch("")}
                      className="p-0.5"
                      style={{ color: "var(--ink-muted)" }}
                    >
                      <Icons.x />
                    </button>
                  )}
                </div>
                <div
                  className="max-h-72 overflow-y-auto divide-y"
                  style={{ borderColor: "var(--border)" }}
                >
                  {filteredClients.length === 0 && (
                    <div
                      className="px-4 py-6 text-center text-sm"
                      style={{ color: "var(--ink-muted)" }}
                    >
                      No clients match "{clientSearch}".
                    </div>
                  )}
                  {filteredClients.map((c) => {
                    const selected = formData.client === c.client;
                    return (
                      <button
                        key={c.client}
                        type="button"
                        onClick={() => handlePickClient(c)}
                        className="w-full text-left p-3 transition-all hover:bg-[var(--accent-soft)]"
                        style={{
                          background: selected
                            ? "var(--accent-soft)"
                            : "transparent",
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                            style={{
                              background: "var(--accent)",
                              color: "#fff",
                            }}
                          >
                            {c.client
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <div
                                className="text-sm font-bold truncate"
                                style={{ color: "var(--ink)" }}
                              >
                                {c.client}
                              </div>
                              <span
                                className="text-[10px] px-1.5 py-0.5 rounded font-bold"
                                style={{
                                  background: "var(--bg)",
                                  color: "var(--ink-muted)",
                                }}
                              >
                                {c.orderCount} order
                                {c.orderCount === 1 ? "" : "s"}
                              </span>
                              <span
                                className="text-[10px] font-bold"
                                style={{ color: "var(--stage-completed)" }}
                              >
                                {formatDZD(c.totalSpent)} spent
                              </span>
                            </div>
                            <div
                              className="text-xs flex items-center gap-2 mt-0.5"
                              style={{ color: "var(--ink-muted)" }}
                            >
                              <span className="flex items-center gap-1">
                                <Icons.phone /> {c.phone}
                              </span>
                            </div>
                            <div
                              className="text-xs flex items-center gap-1 mt-0.5 truncate"
                              style={{ color: "var(--ink-muted)" }}
                            >
                              <Icons.mapPin /> {c.address}
                            </div>
                          </div>
                          {selected && (
                            <div
                              className="shrink-0 mt-1"
                              style={{ color: "var(--accent)" }}
                            >
                              <Icons.check />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-3">
          <h3
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: "var(--ink-muted)" }}
          >
            Client Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: "var(--ink-muted)" }}
              >
                Client Name
              </label>
              <input
                required
                readOnly={useExistingClient}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none read-only:opacity-80"
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  color: "var(--ink)",
                }}
                value={formData.client}
                onChange={(e) => handleChange("client", e.target.value)}
              />
            </div>
            <div>
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: "var(--ink-muted)" }}
              >
                Phone
              </label>
              <input
                readOnly={useExistingClient}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none read-only:opacity-80"
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  color: "var(--ink)",
                }}
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: "var(--ink-muted)" }}
              >
                Address
              </label>
              <input
                readOnly={useExistingClient}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none read-only:opacity-80"
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  color: "var(--ink)",
                }}
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: "var(--ink-muted)" }}
          >
            Project Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: "var(--ink-muted)" }}
              >
                Project Description
              </label>
              <input
                required
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  color: "var(--ink)",
                }}
                value={formData.project}
                onChange={(e) => handleChange("project", e.target.value)}
              />
            </div>
            <div>
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: "var(--ink-muted)" }}
              >
                Total Amount (DZD)
              </label>
              <input
                required
                type="number"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  color: "var(--ink)",
                }}
                value={formData.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
              />
            </div>
            <div>
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: "var(--ink-muted)" }}
              >
                Due Date
              </label>
              <input
                required
                type="date"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  color: "var(--ink)",
                }}
                value={formData.dueDate}
                onChange={(e) => handleChange("dueDate", e.target.value)}
              />
            </div>
            <div>
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: "var(--ink-muted)" }}
              >
                Stage
              </label>
              <select
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  color: "var(--ink)",
                }}
                value={formData.stage}
                onChange={(e) => handleChange("stage", e.target.value)}
              >
                {stages.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: "var(--ink-muted)" }}
              >
                Worker
              </label>
              <select
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  color: "var(--ink)",
                }}
                value={formData.worker}
                onChange={(e) => handleChange("worker", e.target.value)}
              >
                <option value="Unassigned">Unassigned</option>
                {workers.map((w) => {
                  const label = workerLabel(w);
                  const key = typeof w === "string" ? w : w.id ?? label;
                  return (
                    <option key={key} value={label}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: "var(--ink-muted)" }}
            >
              Items & Measurements
            </h3>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-all hover:brightness-110"
              style={{
                background: "var(--accent-soft)",
                color: "var(--accent)",
              }}
            >
              <Icons.plus /> Add Item
            </button>
          </div>
          <div className="space-y-2">
            {formData.items.map((item, index) => (
              <div
                key={index}
                className="p-3 rounded-lg space-y-2"
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                }}
              >
                <div className="flex gap-2">
                  <input
                    placeholder="Item Name"
                    className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                    style={{
                      border: "1px solid var(--border)",
                      color: "var(--ink)",
                      background: "var(--surface)",
                    }}
                    value={item.name}
                    onChange={(e) =>
                      handleItemChange(index, "name", e.target.value)
                    }
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="p-2 rounded-lg text-red-500 hover:opacity-70"
                  >
                    <Icons.trash />
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  <input
                    type="number"
                    placeholder="Qty"
                    className="px-2 py-2 rounded-lg text-sm outline-none text-center"
                    style={{
                      border: "1px solid var(--border)",
                      color: "var(--ink)",
                      background: "var(--surface)",
                    }}
                    value={item.qty}
                    onChange={(e) =>
                      handleItemChange(index, "qty", Number(e.target.value))
                    }
                  />
                  <select
                    className="px-2 py-2 rounded-lg text-sm outline-none"
                    style={{
                      border: "1px solid var(--border)",
                      color: "var(--ink)",
                      background: "var(--surface)",
                    }}
                    value={item.unit}
                    onChange={(e) =>
                      handleItemChange(index, "unit", e.target.value)
                    }
                  >
                    <option value="pcs">pcs</option>
                    <option value="m">m</option>
                    <option value="m²">m²</option>
                    <option value="set">set</option>
                  </select>
                  <input
                    type="number"
                    placeholder="L"
                    className="px-2 py-2 rounded-lg text-sm outline-none text-center"
                    style={{
                      border: "1px solid var(--border)",
                      color: "var(--ink)",
                      background: "var(--surface)",
                    }}
                    value={item.l}
                    onChange={(e) =>
                      handleItemChange(index, "l", Number(e.target.value))
                    }
                  />
                  <input
                    type="number"
                    placeholder="W"
                    className="px-2 py-2 rounded-lg text-sm outline-none text-center"
                    style={{
                      border: "1px solid var(--border)",
                      color: "var(--ink)",
                      background: "var(--surface)",
                    }}
                    value={item.w}
                    onChange={(e) =>
                      handleItemChange(index, "w", Number(e.target.value))
                    }
                  />
                  <input
                    type="number"
                    placeholder="H"
                    className="px-2 py-2 rounded-lg text-sm outline-none text-center"
                    style={{
                      border: "1px solid var(--border)",
                      color: "var(--ink)",
                      background: "var(--surface)",
                    }}
                    value={item.h}
                    onChange={(e) =>
                      handleItemChange(index, "h", Number(e.target.value))
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default OrderFormModal;