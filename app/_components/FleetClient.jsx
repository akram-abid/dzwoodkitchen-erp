"use client";

import { useState, useMemo, useEffect, useRef } from "react";

/* ─── Icons ─── */
const Icons = {
  search: () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>),
  x: () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>),
  plus: () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>),
  edit: () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>),
  trash: () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>),
  alert: () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>),
  cal: () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M16 2v4" /><path d="M8 2v4" /><path d="M3 10h18" /></svg>),
  trend: () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>),
  truck: () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" /><path d="M15 18H9" /><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" /><circle cx="17" cy="18" r="2" /><circle cx="7" cy="18" r="2" /></svg>),
  cog: () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" /><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" /><path d="M12 2v2" /><path d="M12 22v-2" /><path d="m17 20.66-1-1.73" /><path d="M11 10.27 7 3.34" /><path d="m20.66 17-1.73-1" /><path d="m3.34 7 1.73 1" /><path d="m14 12h8" /><path d="M2 12h2" /><path d="m20.66 7-1.73 1" /><path d="m3.34 17 1.73-1" /><path d="m17 3.34-1 1.73" /><path d="m11 13.73-4 6.93" /></svg>),
  wrench: () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z" /></svg>),
  gauge: () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 14 4-4" /><path d="M3.34 19a10 10 0 1 1 17.32 0" /></svg>),
  road: () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22 6 2" /><path d="M18 2l2 20" /><path d="M12 2v6" /><path d="M12 14v4" /><path d="M12 22h.01" /></svg>),
  box: () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></svg>),
};

/* ─── Constants ─── */
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const formatDZD = (n) => `${(n || 0).toLocaleString()} DZD`;
const today = () => new Date().toISOString().slice(0, 10);
const currentYM = () => { const d = new Date(); return { month: d.getMonth(), year: d.getFullYear() }; };

const ASSET_META = {
  // TOOL: { color: "#f59e0b", label: "Tool", icon: Icons.wrench, categories: ["Power Tool", "Hand Tool", "Measuring", "Finishing", "Other"] },
  // MACHINE: { color: "#8b5cf6", label: "Machine", icon: Icons.cog, categories: ["Table Saw", "Miter Saw", "Planer", "CNC", "Band Saw", "Sander", "Jointer", "Other"] },
  TRUCK: { color: "#3b82f6", label: "Truck", icon: Icons.truck, categories: ["Delivery Van", "Pickup", "Box Truck"] },
};

const TRIP_PURPOSES = [
  { id: "DELIVERY", label: "Order Delivery", icon: Icons.truck },
  { id: "PICKUP", label: "Material Pickup", icon: Icons.box },
  { id: "TRANSFER", label: "Workshop Transfer", icon: Icons.road },
  { id: "MAINTENANCE", label: "Maintenance Run", icon: Icons.wrench },
  { id: "PERSONAL", label: "Personal / Other", icon: Icons.trend },
];

/* ─── Reference data ─── */
const SEED_ORDERS = [
  { id: "ORD-2026-0142", name: "Cuisine Villa Hydra", owner: "M. Belkacem", address: "Cité 1000 Logts, Hydra", deliveryDate: "2026-04-20", status: "Delivered" },
  { id: "ORD-2026-0158", name: "Dressing Chréa", owner: "Mme. Saidi", address: "Chréa, Blida", deliveryDate: "2026-05-05", status: "Delivered" },
  { id: "ORD-2026-0167", name: "Bureau Bouzaréah", owner: "Cabinet Dr. Ahmed", address: "Bouzaréah, Alger", deliveryDate: "2026-05-18", status: "Delivered" },
  { id: "ORD-2026-0171", name: "Cuisine Ben Aknoun", owner: "Famille Kaci", address: "Ben Aknoun, Alger", deliveryDate: "2026-06-02", status: "Delivered" },
  { id: "ORD-2026-0185", name: "Salon Birkhadem", owner: "M. Hamoudi", address: "Birkhadem, Alger", deliveryDate: "2026-06-22", status: "Delivered" },
  { id: "ORD-2026-0190", name: "Rangements Kouba", owner: "Mme. Zeroual", address: "Kouba, Alger", deliveryDate: "2026-07-03", status: "In Progress" },
  { id: "ORD-2026-0193", name: "Cuisine Bab Ezzouar", owner: "M. Taleb", address: "Bab Ezzouar, Alger", deliveryDate: "2026-07-08", status: "Pending" },
  { id: "ORD-2026-0201", name: "Bibliothèque El Harrach", owner: "M. Boudiaf", address: "El Harrach, Alger", deliveryDate: "2026-07-15", status: "Pending" },
];

// const SEED_ASSETS = [
//   { id: "AST-001", type: "TOOL", name: "DeWalt DWS779 Miter Saw", category: "Power Tool", identifier: "DW-779-2024-1842", purchaseDate: "2024-03-15", purchasePrice: 85000, dailyCost: 233, monthlyMaintEstimate: 1500, notes: "Heavy-duty sliding compound" },
//   { id: "AST-002", type: "TOOL", name: "DeWalt DCD996 Impact Drill", category: "Power Tool", identifier: "DW-996-2024-3104", purchaseDate: "2024-06-01", purchasePrice: 42000, dailyCost: 115, monthlyMaintEstimate: 800, notes: "Brushless 20V" },
//   { id: "AST-003", type: "MACHINE", name: "Table Saw 10\" Industrial", category: "Table Saw", identifier: "TS-IND-2023-0078", purchaseDate: "2023-01-20", purchasePrice: 320000, dailyCost: 877, monthlyMaintEstimate: 4500, notes: "Main cutting station" },
//   { id: "AST-004", type: "MACHINE", name: "CNC Router 4x8", category: "CNC", identifier: "CNC-AX-2025-001", purchaseDate: "2025-02-10", purchasePrice: 850000, dailyCost: 2330, monthlyMaintEstimate: 8000, notes: "Computer-controlled cutting" },
//   { id: "AST-005", type: "TOOL", name: "Festool RO 90 Multi Sander", category: "Power Tool", identifier: "FT-90-2025-024", purchaseDate: "2025-09-05", purchasePrice: 65000, dailyCost: 178, monthlyMaintEstimate: 1200, notes: "Precision sander" },
//   { id: "AST-006", type: "TOOL", name: "Makita HR2470 Rotary Hammer", category: "Power Tool", identifier: "MK-2470-2024-088", purchaseDate: "2024-08-12", purchasePrice: 38000, dailyCost: 104, monthlyMaintEstimate: 600, notes: "Masonry work" },
//   { id: "AST-007", type: "MACHINE", name: "DeWalt DWP849X Polisher", category: "Sander", identifier: "DW-849-2024-512", purchaseDate: "2024-04-03", purchasePrice: 55000, dailyCost: 151, monthlyMaintEstimate: 900, notes: "Finishing polisher" },
//   { id: "AST-010", type: "TRUCK", name: "Huanday H100 Daily Delivery Van", category: "Delivery Van", identifier: "00123-116-16", purchaseDate: "2022-11-01", purchasePrice: 1200000, dailyCost: 3288, monthlyMaintEstimate: 12000, currentKm: 87420, fuelType: "Diesel", notes: "Primary delivery vehicle" },
// ];

// const SEED_MAINTENANCE = [
//   { id: "MNT-001", assetId: "AST-001", date: "2026-06-15", description: "Blade replacement + alignment", cost: 3500 },
//   { id: "MNT-002", assetId: "AST-001", date: "2026-04-22", description: "Carbon brush replacement", cost: 1800 },
//   { id: "MNT-003", assetId: "AST-003", date: "2026-07-01", description: "Belt tension + dust extraction cleaning", cost: 2200 },
//   { id: "MNT-004", assetId: "AST-010", date: "2026-06-28", description: "Oil change + brake pads", cost: 18500 },
//   { id: "MNT-005", assetId: "AST-010", date: "2026-05-12", description: "Tire rotation + balancing", cost: 4500 },
// ];

const SEED_TRIPS = [
  { id: "TRP-001", truckId: "AST-010", date: "2026-04-20", distance: 85, purpose: "DELIVERY", cost: 2800, orderId: "ORD-2026-0142", notes: "Final delivery + on-site assembly" },
  { id: "TRP-002", truckId: "AST-010", date: "2026-05-05", distance: 85, purpose: "DELIVERY", cost: 3500, orderId: "ORD-2026-0158", notes: "Two helpers, dressing delivery" },
  { id: "TRP-003", truckId: "AST-010", date: "2026-05-15", distance: 85, purpose: "PICKUP", cost: 2200, orderId: null, notes: "Plywood from Bois du Nord" },
  { id: "TRP-004", truckId: "AST-010", date: "2026-05-18", distance: 85, purpose: "DELIVERY", cost: 3000, orderId: "ORD-2026-0167", notes: "Office furniture" },
  { id: "TRP-005", truckId: "AST-010", date: "2026-06-02", distance: 85, purpose: "DELIVERY", cost: 3200, orderId: "ORD-2026-0171", notes: "" },
  { id: "TRP-006", truckId: "AST-010", date: "2026-06-15", distance: 85, purpose: "DELIVERY", cost: 3800, orderId: null, notes: "Multi-stop" },
  { id: "TRP-007", truckId: "AST-010", date: "2026-06-22", distance: 85, purpose: "DELIVERY", cost: 3400, orderId: "ORD-2026-0185", notes: "Living room set" },
  { id: "TRP-008", truckId: "AST-010", date: "2026-06-28", distance: 85, purpose: "MAINTENANCE", cost: 1500, orderId: null, notes: "To mechanic, oil change" },
  { id: "TRP-009", truckId: "AST-010", date: "2026-07-03", distance: 85, purpose: "DELIVERY", cost: 3600, orderId: "ORD-2026-0190", notes: "" },
  { id: "TRP-010", truckId: "AST-010", date: "2026-07-05", distance: 85, purpose: "PICKUP", cost: 2800, orderId: null, notes: "Quartz slabs from Marbre Elite" },
];

/* ─── Helpers ─── */
const inMonth = (date, month, year) => { const d = new Date(date); return d.getMonth() === month && d.getFullYear() === year; };

const mapVehicle = (v) => ({
  id: String(v.id),
  type: "TRUCK",
  name: v.name,
  category: "Delivery Van",
  identifier: v.plate_number,
  purchaseDate: v.purchase_date,
  purchasePrice: v.purchase_price,
  dailyCost: v.daily_cost,
  monthlyMaintEstimate: v.monthly_maint,
  currentKm: v.current_km,
  fuelType: v.fuel_type,
  notes: v.notes || "",
});

/* ─── Modal ─── */
const Modal = ({ title, onClose, children, footer, maxWidth = 720 }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.55)" }} onClick={onClose}>
    <div className="w-full rounded-xl shadow-2xl flex flex-col max-h-[92vh]" style={{ background: "var(--surface)", border: "1px solid var(--border)", maxWidth }} onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between p-4 shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
        <h2 className="text-base font-semibold">{title}</h2>
        <button onClick={onClose} className="btn-ghost p-1" aria-label="Close"><Icons.x /></button>
      </div>
      <div className="flex-1 overflow-y-auto">{children}</div>
      {footer && <div className="flex items-center justify-end gap-2 p-4 shrink-0" style={{ borderTop: "1px solid var(--border)" }}>{footer}</div>}
    </div>
  </div>
);

const Field = ({ label, children, hint, required }) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-xs font-medium" style={{ color: "var(--ink-muted)" }}>
      {label}{required && <span style={{ color: "var(--stage-contract)" }}> *</span>}
    </span>
    {children}
    {hint && <span className="text-[11px]" style={{ color: "var(--ink-muted)" }}>{hint}</span>}
  </label>
);

const inputStyle = { background: "var(--bg)", border: "1px solid var(--border)", color: "var(--ink)" };

// const TypeBadge = ({ type }) => {
//   const meta = ASSET_META[type];
//   return <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wider" style={{ background: `${meta.color}15`, color: meta.color }}>{meta.label}</span>;
// };

/* ─── Order Picker ─── */
const OrderPicker = ({ value, onChange, orders }) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const recent = useMemo(() => {
    const cutoff = new Date(); cutoff.setMonth(cutoff.getMonth() - 3);
    return orders.filter((o) => new Date(o.deliveryDate) >= cutoff).sort((a, b) => b.deliveryDate.localeCompare(a.deliveryDate));
  }, [orders]);

  const matches = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.toLowerCase();
    return orders.filter((o) => (o.name || "").toLowerCase().includes(q) || (o.owner || "").toLowerCase().includes(q) || (o.address || "").toLowerCase().includes(q) || (o.id || "").toLowerCase().includes(q));
  }, [query, orders]);

  const list = matches ?? recent;
  const selected = orders.find((o) => o.id === value);

  return (
    <div className="relative" ref={ref}>
      <div className="px-3 py-2 rounded-md text-sm cursor-pointer flex items-center justify-between gap-2" style={{ background: "var(--bg)", border: "1px solid var(--border)" }} onClick={() => setOpen((v) => !v)}>
        {selected ? (
          <div className="min-w-0">
            <div className="font-medium truncate">{selected.name}</div>
            <div className="text-xs truncate" style={{ color: "var(--ink-muted)" }}>{selected.owner} · {selected.address}</div>
          </div>
        ) : (
          <span style={{ color: "var(--ink-muted)" }}>{recent.length > 0 ? `Select from ${recent.length} recent order${recent.length === 1 ? "" : "s"} or search…` : "Search for an order…"}</span>
        )}
        {value && <button onClick={(e) => { e.stopPropagation(); onChange(null); }} className="btn-ghost p-0.5 shrink-0" title="Clear"><Icons.x /></button>}
      </div>

      {open && (
        <div className="absolute z-30 w-full mt-1 rounded-md shadow-lg overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="p-2" style={{ borderBottom: "1px solid var(--border)" }}>
            <div className="flex items-center gap-2 px-2 py-1.5 rounded" style={{ background: "var(--bg)" }}>
              <Icons.search />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name, owner, address, ID…" className="bg-transparent text-sm outline-none w-full" style={{ color: "var(--ink)" }} autoFocus />
            </div>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {!query.trim() && recent.length > 0 && (
              <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider sticky top-0" style={{ color: "var(--ink-muted)", background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>Recent orders — last 3 months</div>
            )}
            {query.trim() && <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider sticky top-0" style={{ color: "var(--ink-muted)", background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>{matches.length} match{matches.length === 1 ? "" : "es"} across all orders</div>}
            <div onClick={() => { onChange(null); setOpen(false); setQuery(""); }} className="px-3 py-2 cursor-pointer text-sm" style={{ borderTop: "1px solid var(--border)", color: "var(--ink-muted)" }}>— No order / standalone trip —</div>
            {list.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm" style={{ color: "var(--ink-muted)" }}>No orders found. Try a different search.</div>
            ) : list.map((o) => (
              <div key={o.id} onClick={() => { onChange(o.id); setOpen(false); setQuery(""); }} className="px-3 py-2 cursor-pointer" style={{ borderTop: "1px solid var(--border)", background: value === o.id ? "var(--bg)" : "transparent" }}>
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium text-sm truncate">{o.name}</div>
                  <div className="text-[10px] tabular-nums shrink-0" style={{ color: "var(--ink-muted)" }}>{o.deliveryDate}</div>
                </div>
                <div className="text-xs mt-0.5 truncate" style={{ color: "var(--ink-muted)" }}>{o.owner} · {o.address}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Main ─── */
export default function FleetClient({ initialVehicles = [] }) {
  const [assets, setAssets] = useState(() => initialVehicles.map(mapVehicle));
  const [maintenance, setMaintenance] = useState([]);
  const [trips, setTrips] = useState([]);
  const [orders] = useState(SEED_ORDERS);

  const [tab, setTab] = useState("TRUCK");
  const [assetFilter, setAssetFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const [showAssetModal, setShowAssetModal] = useState(false);
  const [editingAssetId, setEditingAssetId] = useState(null);
  const [assetForm, setAssetForm] = useState({});
  const [assetError, setAssetError] = useState("");

  const [showMaintModal, setShowMaintModal] = useState(false);
  const [maintAssetId, setMaintAssetId] = useState(null);
  const [maintForm, setMaintForm] = useState({});
  const [maintError, setMaintError] = useState("");

  const [showMaintHistory, setShowMaintHistory] = useState(null);

  const [showTripModal, setShowTripModal] = useState(false);
  const [editingTripId, setEditingTripId] = useState(null);
  const [tripForm, setTripForm] = useState({});
  const [tripError, setTripError] = useState("");

  const { month: cm, year: cy } = currentYM();


  /* ─── Truck derived ─── */
  const [selectedTruckId, setSelectedTruckId] = useState(null);
  const trucks = useMemo(() => assets.filter((a) => a.type === "TRUCK"), [assets]);
  const truck = useMemo(() => trucks.find((t) => t.id === selectedTruckId) || trucks[0], [trucks, selectedTruckId]); const monthTrips = useMemo(() => trips.filter((t) => inMonth(t.date, cm, cy)), [trips, cm, cy]);
  useEffect(() => {
    if (truck) {
      fetch(`/api/vehicles_trips?vehicleId=${truck.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.data) {
            // ✅ Add truckId to each trip
            const mapped = data.data.map(t => ({
              ...t,
              truckId: truck.id
            }));
            setTrips(mapped);
          }
        })
        .catch(err => console.error("Failed to load trips:", err));

      fetch(`/api/vehicle-maintenance?vehicleId=${truck.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.data) {
            // ✅ Map vehicle_id to assetId for frontend
            const mapped = data.data.map(m => ({
              ...m,
              assetId: truck.id
            }));
            setMaintenance(mapped);
          }
        })
        .catch(err => console.error("Failed to load maintenance:", err));
    }
  }, [truck]);
  const truckStats = useMemo(() => {
    const monthMaint = maintenance
      .filter((m) => m.assetId === truck?.id && inMonth(m.date, cm, cy))
      .reduce((s, m) => s + m.cost, 0);
    const tripCost = monthTrips.reduce((s, t) => s + (t.cost || 0), 0);
    const tripKm = monthTrips.reduce((s, t) => s + (t.distance || 0), 0);
    const monthlyDeprec = (truck?.dailyCost || 0) * 30;
    return { tripCost, tripKm, count: monthTrips.length, monthMaint, monthlyDeprec, monthlyTotal: tripCost + monthMaint + monthlyDeprec };
  }, [truck, maintenance, monthTrips, cm, cy]);

  /* ─── Asset modal handlers ─── */
  const openNewAsset = (type) => {
    setEditingAssetId(null);
    setAssetForm({ type, name: "", category: ASSET_META[type].categories[0], identifier: "", purchaseDate: today(), purchasePrice: "", dailyCost: "", monthlyMaintEstimate: "", currentKm: type === "TRUCK" ? "" : undefined, fuelType: type === "TRUCK" ? "Diesel" : undefined, notes: "" });
    setAssetError(""); setShowAssetModal(true);
  };

  const openEditAsset = (a) => {
    setEditingAssetId(a.id);
    setAssetForm({
      ...a,
      purchasePrice: String(a.purchasePrice),
      dailyCost: String(a.dailyCost),
      monthlyMaintEstimate: String(a.monthlyMaintEstimate),
      currentKm: a.currentKm != null ? String(a.currentKm) : ""
    });
    setAssetError("");
    setShowAssetModal(true);
  };

  const saveAsset = async () => {
    if (!assetForm.name?.trim()) return setAssetError("Name is required");
    if (!assetForm.identifier?.trim()) return setAssetError("Plate number is required");
    const price = parseFloat(assetForm.purchasePrice);
    if (!price || price <= 0) return setAssetError("Purchase price must be > 0");
    const daily = parseFloat(assetForm.dailyCost);
    if (isNaN(daily) || daily < 0) return setAssetError("Daily cost must be ≥ 0");

    const entry = {
      name: assetForm.name,
      plate_number: assetForm.identifier,
      purchase_date: assetForm.purchaseDate,
      purchase_price: price,
      daily_cost: daily,
      monthly_maint: parseFloat(assetForm.monthlyMaintEstimate) || 0,
      current_km: assetForm.currentKm ? Number(assetForm.currentKm) : null,
      fuel_type: assetForm.fuelType || null,
      notes: assetForm.notes || null,
    };

    setAssetError("");

    try {
      let result;
      let url = "/api/vehicles";
      let method = "POST";

      if (editingAssetId) {
        // UPDATE
        url = `/api/vehicles/${editingAssetId}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });

      result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to save truck");

      const mapped = mapVehicle(result.data);

      if (editingAssetId) {
        // ✅ Update existing
        setAssets((prev) => prev.map((a) => (a.id === mapped.id ? mapped : a)));
      } else {
        // ✅ Add new
        setAssets((prev) => [...prev, mapped]);
      }

      setShowAssetModal(false);
    } catch (error) {
      setAssetError(error.message);
    }
  };
  const deleteAsset = async (id) => {
    if (!confirm("Delete this truck and all its history?")) return;

    try {
      const res = await fetch(`/api/vehicles/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || "Failed to delete truck");
      }

      // Remove from state
      setAssets((prev) => prev.filter((a) => a.id !== id));
      setMaintenance((prev) => prev.filter((m) => m.assetId !== id));
      setTrips((prev) => prev.filter((t) => t.truckId !== id));

      // If deleted truck was selected, select first available
      if (selectedTruckId === id) {
        const remaining = assets.filter((a) => a.id !== id);
        setSelectedTruckId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (error) {
      setAssetError(error.message);
      alert(error.message);
    }
  };

  const openAddMaint = (assetId) => {
    setMaintAssetId(assetId);
    setMaintForm({ date: today(), description: "", cost: "" });
    setMaintError("");
    setShowMaintModal(true);
  };
  const saveMaint = async () => {
    if (!maintForm.date) return setMaintError("Date is required");
    if (!maintForm.description?.trim()) return setMaintError("Description is required");
    const cost = parseFloat(maintForm.cost);
    if (isNaN(cost) || cost < 0) return setMaintError("Cost must be ≥ 0");

    const entry = {
      vehicleId: maintAssetId,
      date: maintForm.date,
      description: maintForm.description.trim(),
      cost: cost,
    };

    try {
      const res = await fetch("/api/vehicle-maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to save maintenance");

      // Add assetId to the new maintenance
      const newMaint = {
        ...result.data,
        assetId: maintAssetId
      };


      setMaintenance((prev) => [newMaint, ...prev]);
      setShowMaintModal(false);
    } catch (error) {
      setMaintError(error.message);
    }
  };
  const deleteMaint = async (id) => {
    if (!confirm("Delete this maintenance entry?")) return;

    try {
      const res = await fetch(`/api/vehicle-maintenance/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || "Failed to delete maintenance");
      }

      setMaintenance((prev) => prev.filter((m) => m.id !== id));
    } catch (error) {
      alert(error.message);
    }
  };
  const openNewTrip = () => {
    const lastTrip = [...trips].sort((a, b) => b.date.localeCompare(a.date))[0];
    setEditingTripId(null);
    setTripForm({
      date: today(),
      distance: "",
      purpose: "DELIVERY",
      cost: "",
      orderId: null,
      notes: ""
    });
    setTripError("");
    setShowTripModal(true);
  };
  const openEditTrip = (t) => {
    setEditingTripId(t.id);
    setTripForm({
      date: t.date,
      distance: String(t.distance),
      purpose: t.purpose,
      cost: String(t.cost),
      orderId: t.orderId || null,
      notes: t.notes || "",
    });
    setTripError("");
    setShowTripModal(true);
  };
  const saveTrip = async () => {
    if (!tripForm.date) return setTripError("Date is required");
    const distance = Number(tripForm.distance);
    if (isNaN(distance) || distance < 0) return setTripError("Distance must be ≥ 0");
    const cost = parseFloat(tripForm.cost);
    if (isNaN(cost) || cost < 0) return setTripError("Cost must be ≥ 0");

    const entry = {
      vehicleId: truck.id,
      date: tripForm.date,
      distance: distance,
      purpose: tripForm.purpose,
      cost: cost,
      orderId: tripForm.orderId || null,
      notes: tripForm.notes?.trim() || null,
    };

    setTripError("");

    try {
      let result;
      let url = "/api/vehicles_trips";
      let method = "POST";

      if (editingTripId) {
        url = `/api/vehicles_trips/${editingTripId}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });

      result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to save trip");

      const mapped = {
        id: result.data.id,
        truckId: truck.id,
        date: result.data.date,
        distance: result.data.distance,
        purpose: result.data.purpose,
        cost: result.data.cost,
        orderId: result.data.orderId,
        notes: result.data.notes,
      };

      if (editingTripId) {
        setTrips((prev) => prev.map((t) => (t.id === mapped.id ? mapped : t)));
      } else {
        setTrips((prev) => [mapped, ...prev]);
      }

      // Update vehicle current km - add distance
      if (distance > 0) {
        setAssets((prev) =>
          prev.map((a) =>
            a.id === truck.id ? { ...a, currentKm: (a.currentKm || 0) + distance } : a
          )
        );
      }

      setShowTripModal(false);
    } catch (error) {
      setTripError(error.message);
    }
  };
  const deleteTrip = async (id) => {
    if (!confirm("Delete this trip?")) return;

    try {
      const res = await fetch(`/api/vehicles_trips/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || "Failed to delete trip");
      }

      setTrips((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      alert(error.message);
    }
  };
  return (
    <div className="flex flex-col h-full">


      {/* ═══ TRUCK ═══ */}
      {tab === "TRUCK" && (
        <>
          {!truck ? (
            <div className="flex-1 flex items-center justify-center p-12">
              <div className="text-center">
                <Icons.truck />
                <p className="mt-3 text-sm" style={{ color: "var(--ink-muted)" }}>No delivery truck registered yet.</p>
                <button onClick={() => openNewAsset("TRUCK")} className="btn-primary text-xs mt-3 px-3 py-1.5"><Icons.plus /> Add Truck</button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between p-3 shrink-0" style={{ borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>Vehicles</span>
                  <button onClick={() => openNewAsset("TRUCK")} className="text-xs px-3 py-1.5 rounded-md font-medium flex items-center gap-1" style={{ background: "#3b82f6", color: "#fff" }}>
                    <Icons.plus /> Add Truck
                  </button>
                </div>
              </div>
              {/* Truck header */}
              <div className="p-3 shrink-0 grid grid-cols-1 lg:grid-cols-3 gap-3" style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
                <div className="lg:col-span-1 p-4 rounded-xl" style={{ background: "linear-gradient(135deg, #3b82f615, #3b82f605)", border: "1px solid #3b82f630" }}>
                  {trucks.length > 1 && (
                    <select
                      value={truck.id}
                      onChange={(e) => setSelectedTruckId(e.target.value)}
                      className="text-xs px-2 py-1 rounded-md mb-2"
                      style={inputStyle}
                    >
                      {trucks.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  )}
                  <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#3b82f6" }}><Icons.truck /> Delivery Truck</div>
                  <div className="text-lg font-bold mt-1 truncate">{truck.name}</div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--ink-muted)" }}>{truck.identifier} · {truck.fuelType || "—"}</div>
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
                    <div><div className="text-[10px] uppercase" style={{ color: "var(--ink-muted)" }}>Odometer</div><div className="text-sm font-bold tabular-nums">{(truck.currentKm || 0).toLocaleString()} km</div></div>
                    <div><div className="text-[10px] uppercase" style={{ color: "var(--ink-muted)" }}>Purchased</div><div className="text-sm font-bold tabular-nums">{truck.purchaseDate}</div></div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <button onClick={() => openEditAsset(truck)} className="text-xs px-2.5 py-1 rounded font-medium flex items-center gap-1" style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--ink)" }}>
                      <Icons.edit /> Edit
                    </button>
                    <button onClick={() => setShowMaintHistory(truck.id)} className="text-xs px-2.5 py-1 rounded font-medium flex items-center gap-1" style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--ink)" }}>
                      <Icons.wrench /> Maintenance History
                    </button>
                    <button onClick={() => deleteAsset(truck.id)} className="text-xs px-2.5 py-1 rounded font-medium flex items-center gap-1" style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--stage-contract)" }}>
                      <Icons.trash /> Delete
                    </button>
                  </div>

                </div>
                <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                  <StatCard label="Trips this month" value={String(truckStats.count)} sub={`${truckStats.tripKm.toLocaleString()} km`} color="#3b82f6" icon={Icons.road} />
                  <StatCard label="Trip cost" value={formatDZD(truckStats.tripCost)} sub="Fuel + driver" color="var(--stage-contract)" icon={Icons.truck} />
                  <StatCard label="Maintenance" value={formatDZD(truckStats.monthMaint)} sub={`Budget: ${formatDZD(truck.monthlyMaintEstimate)}`} color="#f59e0b" icon={Icons.wrench} />
                  <StatCard label="Total this month" value={formatDZD(truckStats.monthlyTotal)} sub={`Deprec ${formatDZD(truckStats.monthlyDeprec)}`} color="var(--ink)" icon={Icons.trend} highlight />
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 p-3 shrink-0 flex-wrap" style={{ borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md flex-1 min-w-[180px]" style={{ background: "var(--bg)", border: "1px solid var(--border)" }}>
                  <Icons.search />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search trips…" className="bg-transparent text-sm outline-none w-full placeholder:text-[var(--ink-muted)]" style={{ color: "var(--ink)" }} />
                  {search && <button onClick={() => setSearch("")} className="btn-ghost p-0.5"><Icons.x /></button>}
                </div>
                <button onClick={openNewTrip} className="btn-primary text-xs px-3 py-1.5"><Icons.plus /> Add Trip</button>
              </div>

              {/* Trips table */}
              <div className="flex-1 overflow-auto">
                <table className="w-full text-left text-sm" style={{ minWidth: 820 }}>
                  <thead className="sticky top-0 z-10" style={{ background: "var(--surface-2)" }}>
                    <tr><th className="px-4 py-3 text-xs font-medium" style={{ color: "var(--ink-muted)" }}>Date</th><th className="px-4 py-3 text-xs font-medium" style={{ color: "var(--ink-muted)" }}>Purpose</th><th className="px-4 py-3 text-xs font-medium text-right hidden md:table-cell" style={{ color: "var(--ink-muted)" }}>Distance</th><th className="px-4 py-3 text-xs font-medium" style={{ color: "var(--ink-muted)" }}>Order</th><th className="px-4 py-3 text-xs font-medium text-right" style={{ color: "var(--ink-muted)" }}>Cost</th><th className="px-4 py-3 text-xs font-medium text-center" style={{ color: "var(--ink-muted)" }}>Actions</th></tr>
                  </thead>
                  <tbody>
                    {trips
                      .filter((t) => t.truckId === truck.id)
                      .filter((t) => {
                        if (!search) return true;
                        const q = search.toLowerCase();
                        const order = orders.find((o) => o.id === t.orderId);
                        return `${t.id} ${t.purpose} ${t.notes || ""} ${order?.name || ""} ${order?.owner || ""}`.toLowerCase().includes(q);
                      })
                      .sort((a, b) => b.date.localeCompare(a.date))
                      .map((t) => {
                        const purpose = TRIP_PURPOSES.find((p) => p.id === t.purpose);
                        const order = orders.find((o) => o.id === t.orderId);
                        return (
                          <tr key={t.id} className="group" style={{ borderTop: "1px solid var(--border)" }}>
                            <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: "var(--ink-muted)" }}><div className="flex items-center gap-1.5"><Icons.cal />{t.date}</div></td>
                            <td className="px-4 py-3"><span className="text-xs font-medium px-2 py-0.5 rounded" style={{ background: "var(--bg)", border: "1px solid var(--border)" }}>{purpose?.label || t.purpose}</span></td>
                            <td className="px-4 py-3 text-xs tabular-nums text-right hidden md:table-cell" style={{ color: "var(--ink-muted)" }}>
                              {t.distance} km
                            </td>
                            <td className="px-4 py-3 text-xs">{order ? (<div><div className="font-medium" style={{ color: "var(--ink)" }}>{order.name}</div><div className="text-[10px]" style={{ color: "var(--ink-muted)" }}>{order.owner}</div></div>) : (<span style={{ color: "var(--ink-muted)" }}>—</span>)}</td>
                            <td className="px-4 py-3 text-right text-sm font-bold tabular-nums whitespace-nowrap" style={{ color: "var(--stage-contract)" }}>{formatDZD(t.cost)}</td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openEditTrip(t)} className="btn-ghost p-1.5" title="Edit"><Icons.edit /></button>
                                <button onClick={() => deleteTrip(t.id)} className="btn-ghost p-1.5 hover:text-[var(--stage-contract)]" title="Delete"><Icons.trash /></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    {trips.filter((t) => t.truckId === truck.id).length === 0 && (
                      <tr><td colSpan={6} className="px-4 py-12 text-center text-sm" style={{ color: "var(--ink-muted)" }}>No trips logged yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}

      {/* ═══ Asset Modal ═══ */}
      {showAssetModal && (
        <Modal
          title={editingAssetId ? `Edit ${ASSET_META[assetForm.type]?.label || "Asset"}` : `New ${ASSET_META[assetForm.type]?.label || "Asset"}`}
          onClose={() => setShowAssetModal(false)}
          footer={
            <>
              {editingAssetId && <button onClick={() => { deleteAsset(editingAssetId); setShowAssetModal(false); }} className="btn-ghost px-3 text-sm mr-auto" style={{ color: "var(--stage-contract)" }}><Icons.trash /> Delete</button>}
              <button onClick={() => setShowAssetModal(false)} className="btn-ghost px-4 text-sm">Cancel</button>
              <button onClick={saveAsset} className="btn-primary px-4 text-sm">{editingAssetId ? <Icons.edit /> : <Icons.plus />} {editingAssetId ? "Save Changes" : "Add Asset"}</button>
            </>
          }
        >
          <div className="p-5 space-y-4">
            <div className="flex items-center p-1 rounded-lg" style={{ background: "var(--bg)", border: "1px solid var(--border)" }}>
              {Object.entries(ASSET_META).map(([k, m]) => {
                const Icon = m.icon;
                const active = assetForm.type === k;
                return (
                  <button
                    key={k}
                    onClick={() => { if (editingAssetId) return; setAssetForm((f) => ({ ...f, type: k, category: m.categories[0] })); }}
                    disabled={!!editingAssetId}
                    className="flex-1 text-xs font-medium px-3 py-2 rounded-md flex items-center justify-center gap-1.5"
                    style={{ background: active ? "var(--surface)" : "transparent", color: active ? m.color : "var(--ink-muted)", border: active ? `1px solid ${m.color}30` : "1px solid transparent", opacity: editingAssetId && !active ? 0.4 : 1, cursor: editingAssetId ? "default" : "pointer" }}
                  >
                    <Icon /> {m.label}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label={assetForm.type === "TRUCK" ? "Truck name" : "Asset name"} required>
                <input value={assetForm.name || ""} onChange={(e) => setAssetForm((f) => ({ ...f, name: e.target.value }))} className="px-3 py-2 rounded-md text-sm outline-none focus-ring w-full" style={inputStyle} />
              </Field>
              <Field label={assetForm.type === "TRUCK" ? "Plate number" : "Serial number"} required>
                <input value={assetForm.identifier || ""} onChange={(e) => setAssetForm((f) => ({ ...f, identifier: e.target.value }))} className="px-3 py-2 rounded-md text-sm outline-none focus-ring w-full" style={inputStyle} />
              </Field>
              <Field label="Category" required>
                <select value={assetForm.category || ""} onChange={(e) => setAssetForm((f) => ({ ...f, category: e.target.value }))} className="px-3 py-2 rounded-md text-sm outline-none focus-ring w-full" style={inputStyle}>
                  {ASSET_META[assetForm.type]?.categories.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Purchase date" required>
                <input type="date" value={assetForm.purchaseDate || ""} onChange={(e) => setAssetForm((f) => ({ ...f, purchaseDate: e.target.value }))} className="px-3 py-2 rounded-md text-sm outline-none focus-ring w-full" style={inputStyle} />
              </Field>
              <Field label="Purchase price (DZD)" required>
                <input type="number" min="0" value={assetForm.purchasePrice || ""} onChange={(e) => {
                  const v = e.target.value;
                  setAssetForm((f) => {
                    const price = parseFloat(v);
                    const suggested = isNaN(price) ? "" : Math.round(price / 365);
                    return { ...f, purchasePrice: v, dailyCost: f.dailyCost === "" || f.dailyCost == null ? String(suggested) : f.dailyCost };
                  });
                }} className="px-3 py-2 rounded-md text-sm outline-none focus-ring tabular-nums w-full" style={inputStyle} />
              </Field>
              <Field label="Daily cost (DZD)" required hint="Auto = price ÷ 365. Edit anytime.">
                <input type="number" min="0" value={assetForm.dailyCost || ""} onChange={(e) => setAssetForm((f) => ({ ...f, dailyCost: e.target.value }))} className="px-3 py-2 rounded-md text-sm outline-none focus-ring tabular-nums w-full" style={inputStyle} />
              </Field>
              <Field label="Monthly maintenance budget (DZD)" hint="Estimated breakdown / repair budget per month">
                <input type="number" min="0" value={assetForm.monthlyMaintEstimate || ""} onChange={(e) => setAssetForm((f) => ({ ...f, monthlyMaintEstimate: e.target.value }))} className="px-3 py-2 rounded-md text-sm outline-none focus-ring tabular-nums w-full" style={inputStyle} />
              </Field>
              {assetForm.type === "TRUCK" && (
                <>
                  <Field label="Current odometer (km)">
                    <input type="number" min="0" value={assetForm.currentKm || ""} onChange={(e) => setAssetForm((f) => ({ ...f, currentKm: e.target.value }))} className="px-3 py-2 rounded-md text-sm outline-none focus-ring tabular-nums w-full" style={inputStyle} />
                  </Field>
                  <Field label="Fuel type">
                    <select value={assetForm.fuelType || "Diesel"} onChange={(e) => setAssetForm((f) => ({ ...f, fuelType: e.target.value }))} className="px-3 py-2 rounded-md text-sm outline-none focus-ring w-full" style={inputStyle}>
                      <option>Diesel</option><option>Gasoline</option><option>Electric</option><option>Hybrid</option>
                    </select>
                  </Field>
                </>
              )}
              <div className="sm:col-span-2">
                <Field label="Notes" hint="Optional">
                  <textarea rows={2} value={assetForm.notes || ""} onChange={(e) => setAssetForm((f) => ({ ...f, notes: e.target.value }))} className="px-3 py-2 rounded-md text-sm outline-none focus-ring w-full resize-none" style={inputStyle} />
                </Field>
              </div>
            </div>

            {assetError && <div className="px-3 py-2 rounded-md text-xs flex items-center gap-2" style={{ background: "var(--stage-contract)15", color: "var(--stage-contract)", border: "1px solid var(--stage-contract)40" }}><Icons.alert /> {assetError}</div>}
          </div>
        </Modal>
      )}

      {/* ═══ Maintenance Modal ═══ */}
      {showMaintModal && (
        <Modal title="Log Maintenance / Breakdown" onClose={() => setShowMaintModal(false)} footer={<><button onClick={() => setShowMaintModal(false)} className="btn-ghost px-4 text-sm">Cancel</button><button onClick={saveMaint} className="btn-primary px-4 text-sm"><Icons.plus /> Save</button></>}>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Date" required><input type="date" value={maintForm.date || ""} onChange={(e) => setMaintForm((f) => ({ ...f, date: e.target.value }))} className="px-3 py-2 rounded-md text-sm outline-none focus-ring w-full" style={inputStyle} /></Field>
            <Field label="Cost (DZD)" required><input type="number" min="0" value={maintForm.cost || ""} onChange={(e) => setMaintForm((f) => ({ ...f, cost: e.target.value }))} placeholder="0" className="px-3 py-2 rounded-md text-sm outline-none focus-ring tabular-nums w-full" style={inputStyle} /></Field>
            <div className="sm:col-span-2"><Field label="Description" required hint="What was repaired / replaced?"><input value={maintForm.description || ""} onChange={(e) => setMaintForm((f) => ({ ...f, description: e.target.value }))} placeholder="e.g. Blade replacement + alignment" className="px-3 py-2 rounded-md text-sm outline-none focus-ring w-full" style={inputStyle} /></Field></div>
            {maintError && <div className="sm:col-span-2 px-3 py-2 rounded-md text-xs flex items-center gap-2" style={{ background: "var(--stage-contract)15", color: "var(--stage-contract)", border: "1px solid var(--stage-contract)40" }}><Icons.alert /> {maintError}</div>}
          </div>
        </Modal>
      )}

      {/* ═══ Maintenance History Modal ═══ */}
      {showMaintHistory && (() => {
        const a = assets.find((x) => x.id === showMaintHistory);
        const events = maintenance
          .filter((m) => m.assetId === showMaintHistory)
          .sort((x, y) => y.date.localeCompare(x.date)); const totalAll = events.reduce((s, e) => s + e.cost, 0);
        const meta = a ? ASSET_META[a.type] : null;
        return (
          <Modal
            title={`${a?.name || "Asset"} — Maintenance History`}
            onClose={() => setShowMaintHistory(null)}
            maxWidth={620}
            footer={
              <>
                <button
                  onClick={() => {
                    setShowMaintHistory(null);
                    openAddMaint(showMaintHistory);
                  }}
                  className="btn-primary px-4 text-sm"
                >
                  <Icons.plus /> Log Maintenance
                </button>
                <button onClick={() => setShowMaintHistory(null)} className="btn-ghost px-4 text-sm">Close</button>
              </>
            }
          >
            <div className="p-5 space-y-3">
              {meta && (
                <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-md text-xs font-medium" style={{ background: `${meta.color}10`, color: meta.color, border: `1px solid ${meta.color}30` }}>
                  <span>Monthly budget: {formatDZD(a.monthlyMaintEstimate)}</span>
                  <span>Spent to date: {formatDZD(totalAll)}</span>
                </div>
              )}
              {events.length === 0 ? (
                <div className="py-12 text-center text-sm" style={{ color: "var(--ink-muted)" }}>No maintenance events logged yet.</div>
              ) : (
                <div className="space-y-2">
                  {events.map((e) => (
                    <div key={e.id} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: "var(--bg)", border: "1px solid var(--border)" }}>
                      <div className="text-xs shrink-0 w-24 flex items-center gap-1" style={{ color: "var(--ink-muted)" }}>
                        <Icons.cal /> {e.date}
                      </div>
                      <div className="flex-1 text-sm">{e.description}</div>
                      <div className="text-sm font-bold tabular-nums" style={{ color: "var(--stage-contract)" }}>
                        {formatDZD(e.cost)}
                      </div>
                      <button
                        onClick={() => deleteMaint(e.id)}
                        className="btn-ghost p-1 hover:text-[var(--stage-contract)]"
                        title="Delete"
                      >
                        <Icons.trash />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Modal>
        );
      })()}

      {/* ═══ Trip Modal ═══ */}
      {showTripModal && (
        <Modal
          title={editingTripId ? "Edit Trip" : "Register Trip"}
          onClose={() => setShowTripModal(false)}
          footer={<>
            {editingTripId && <button onClick={() => { deleteTrip(editingTripId); setShowTripModal(false); }} className="btn-ghost px-3 text-sm mr-auto" style={{ color: "var(--stage-contract)" }}><Icons.trash /> Delete</button>}
            <button onClick={() => setShowTripModal(false)} className="btn-ghost px-4 text-sm">Cancel</button>
            <button onClick={saveTrip} className="btn-primary px-4 text-sm">{editingTripId ? <Icons.edit /> : <Icons.plus />} {editingTripId ? "Save Changes" : "Add Trip"}</button>
          </>}
        >
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Date" required><input type="date" value={tripForm.date || ""} onChange={(e) => setTripForm((f) => ({ ...f, date: e.target.value }))} className="px-3 py-2 rounded-md text-sm outline-none focus-ring w-full" style={inputStyle} /></Field>
              <Field label="Distance (km)" required>
                <input type="number" min="0" value={tripForm.distance || ""} onChange={(e) => setTripForm((f) => ({ ...f, distance: e.target.value }))} className="px-3 py-2 rounded-md text-sm outline-none focus-ring tabular-nums w-full" style={inputStyle} />
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Purpose" required>
                <select value={tripForm.purpose || "DELIVERY"} onChange={(e) => setTripForm((f) => ({ ...f, purpose: e.target.value }))} className="px-3 py-2 rounded-md text-sm outline-none focus-ring w-full" style={inputStyle}>
                  {TRIP_PURPOSES.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
              </Field>
              <Field label="Trip cost (DZD)" required><input type="number" min="0" value={tripForm.cost || ""} onChange={(e) => setTripForm((f) => ({ ...f, cost: e.target.value }))} placeholder="0" className="px-3 py-2 rounded-md text-sm outline-none focus-ring tabular-nums w-full" style={inputStyle} /></Field>
            </div>

            <Field label="Linked order" hint={tripForm.purpose === "DELIVERY" ? "Recommended for deliveries" : "Optional"}>
              <OrderPicker value={tripForm.orderId} onChange={(v) => setTripForm((f) => ({ ...f, orderId: v }))} orders={orders} />
            </Field>

            <Field label="Notes" hint="Optional"><textarea rows={2} value={tripForm.notes || ""} onChange={(e) => setTripForm((f) => ({ ...f, notes: e.target.value }))} className="px-3 py-2 rounded-md text-sm outline-none focus-ring w-full resize-none" style={inputStyle} /></Field>

            {tripError && <div className="px-3 py-2 rounded-md text-xs flex items-center gap-2" style={{ background: "var(--stage-contract)15", color: "var(--stage-contract)", border: "1px solid var(--stage-contract)40" }}><Icons.alert /> {tripError}</div>}
          </div>
        </Modal>
      )}
    </div>
  );
}

const StatCard = ({ label, value, sub, color, icon: Icon, highlight }) => (
  <div className="p-3 rounded-xl flex items-center gap-3" style={{ background: highlight ? `${color}10` : "var(--bg)", border: `1px solid ${color}${highlight ? "50" : "30"}` }}>
    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}15`, color }}><Icon /></div>
    <div className="min-w-0 flex-1">
      <div className="text-[10px] uppercase tracking-wider whitespace-nowrap" style={{ color: "var(--ink-muted)" }}>{label}</div>
      <div className="text-sm sm:text-base font-bold tabular-nums truncate" style={{ color }}>{value}</div>
      {sub && <div className="text-[10px] truncate" style={{ color: "var(--ink-muted)" }}>{sub}</div>}
    </div>
  </div>
);