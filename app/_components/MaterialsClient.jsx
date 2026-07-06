'use client';

import { useState, useMemo } from 'react';

/* ─── Reusable UI ─── */
const StageBadge = ({ stage, size = 'sm' }) => {
  const map = {
    IN_STOCK: { color: 'var(--stage-completed)', label: 'In Stock', dot: '●' },
    LOW_STOCK: { color: 'var(--accent)', label: 'Low Stock', dot: '●' },
    OUT_OF_STOCK: { color: 'var(--stage-contract)', label: 'Out of Stock', dot: '●' },
    ORDERED: { color: 'var(--stage-ready)', label: 'Ordered', dot: '●' },
  };
  const s = map[stage] || map.IN_STOCK;
  return (
    <span className="badge" style={{ background: `${s.color}15`, color: s.color, padding: size === 'lg' ? '6px 14px' : undefined, fontSize: size === 'lg' ? '13px' : undefined }}>
      <span style={{ fontSize: size === 'lg' ? 12 : 10 }}>{s.dot}</span> {s.label}
    </span>
  );
};

/* ─── Icons ─── */
const Icons = {
  search: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  x: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
  more: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>,
  package: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>,
  plus: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>,
  minus: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/></svg>,
  edit: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>,
  history: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/><path d="M12 7v5l4 2"/></svg>,
  alert: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>,
  truck: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5"/><path d="M14 17h1"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>,
  box: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>,
};

/* ─── Data ─── */
const MATERIALS = [
  { id: 'MAT-001', name: 'Oak Plank 20mm', category: 'Wood', unit: 'm²', stock: 45, minStock: 20, maxStock: 100, supplier: 'Bois du Nord', price: 2800, location: 'Warehouse A', lastUsed: '2026-07-03', status: 'IN_STOCK', usage: [
    { date: '2026-07-03', order: '#2041', worker: 'R. Said', qty: 8, type: 'out' },
    { date: '2026-07-01', order: '#2038', worker: 'A. Benali', qty: 5, type: 'out' },
    { date: '2026-06-28', order: 'Restock', worker: '—', qty: 50, type: 'in' },
  ]},
  { id: 'MAT-002', name: 'MDF Board 18mm', category: 'Wood', unit: 'sheet', stock: 12, minStock: 15, maxStock: 60, supplier: 'Placo Algérie', price: 1800, location: 'Warehouse A', lastUsed: '2026-07-04', status: 'LOW_STOCK', usage: [
    { date: '2026-07-04', order: '#2041', worker: 'R. Said', qty: 3, type: 'out' },
    { date: '2026-06-25', order: '#2040', worker: 'K. Amrani', qty: 8, type: 'out' },
  ]},
  { id: 'MAT-003', name: 'Walnut Veneer', category: 'Veneer', unit: 'm²', stock: 0, minStock: 10, maxStock: 40, supplier: 'Bois du Nord', price: 4500, location: 'Warehouse B', lastUsed: '2026-06-20', status: 'OUT_OF_STOCK', usage: [
    { date: '2026-06-20', order: '#2035', worker: 'M. Draoui', qty: 6, type: 'out' },
    { date: '2026-06-15', order: 'Restock', worker: '—', qty: 20, type: 'in' },
  ]},
  { id: 'MAT-004', name: 'Blum Hinge Soft-Close', category: 'Hardware', unit: 'pc', stock: 120, minStock: 50, maxStock: 300, supplier: 'Quincaillerie Pro', price: 450, location: 'Shelf C3', lastUsed: '2026-07-05', status: 'IN_STOCK', usage: [
    { date: '2026-07-05', order: '#2041', worker: 'R. Said', qty: 24, type: 'out' },
  ]},
  { id: 'MAT-005', name: 'Quartz Countertop White', category: 'Stone', unit: 'm²', stock: 8, minStock: 5, maxStock: 20, supplier: 'Marbre Elite', price: 15000, location: 'Warehouse B', lastUsed: '2026-06-30', status: 'IN_STOCK', usage: [
    { date: '2026-06-30', order: '#2042', worker: 'R. Said', qty: 2, type: 'out' },
  ]},
  { id: 'MAT-006', name: 'Plywood Marine 12mm', category: 'Wood', unit: 'sheet', stock: 3, minStock: 10, maxStock: 40, supplier: 'Bois du Nord', price: 3200, location: 'Warehouse A', lastUsed: '2026-06-15', status: 'LOW_STOCK', usage: [
    { date: '2026-06-15', order: '#2038', worker: 'A. Benali', qty: 4, type: 'out' },
  ]},
  { id: 'MAT-007', name: 'LED Strip Warm White 5m', category: 'Electrical', unit: 'roll', stock: 0, minStock: 5, maxStock: 25, supplier: 'Electro Dépôt', price: 1200, location: 'Shelf D1', lastUsed: '2026-06-10', status: 'ORDERED', usage: [
    { date: '2026-06-10', order: '#2032', worker: 'A. Benali', qty: 2, type: 'out' },
    { date: '2026-07-02', order: 'PO-089', worker: '—', qty: 15, type: 'in' },
  ]},
  { id: 'MAT-008', name: 'Drawer Slide Heavy Duty', category: 'Hardware', unit: 'pair', stock: 34, minStock: 20, maxStock: 80, supplier: 'Quincaillerie Pro', price: 850, location: 'Shelf C4', lastUsed: '2026-07-02', status: 'IN_STOCK', usage: [
    { date: '2026-07-02', order: '#2041', worker: 'R. Said', qty: 8, type: 'out' },
  ]},
  { id: 'MAT-009', name: 'Oak Edge Banding 22mm', category: 'Veneer', unit: 'm', stock: 150, minStock: 50, maxStock: 300, supplier: 'Bois du Nord', price: 180, location: 'Shelf A1', lastUsed: '2026-07-04', status: 'IN_STOCK', usage: [
    { date: '2026-07-04', order: '#2041', worker: 'R. Said', qty: 24, type: 'out' },
  ]},
  { id: 'MAT-010', name: 'Contact Cement 5L', category: 'Adhesive', unit: 'can', stock: 2, minStock: 4, maxStock: 15, supplier: 'Placo Algérie', price: 3500, location: 'Shelf B2', lastUsed: '2026-07-01', status: 'LOW_STOCK', usage: [
    { date: '2026-07-01', order: '#2038', worker: 'A. Benali', qty: 1, type: 'out' },
  ]},
];

const CATEGORIES = ['All', 'Wood', 'Veneer', 'Hardware', 'Stone', 'Electrical', 'Adhesive'];
const STATUSES = ['All', 'IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK', 'ORDERED'];
const STATUS_DOT = { IN_STOCK:'var(--stage-completed)', LOW_STOCK:'var(--accent)', OUT_OF_STOCK:'var(--stage-contract)', ORDERED:'var(--stage-ready)' };

export default function MaterialsClient() {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedId, setSelectedId] = useState(MATERIALS[0].id);
  const [adjustQty, setAdjustQty] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const selected = MATERIALS.find(m => m.id === selectedId) || MATERIALS[0];

  const filtered = useMemo(() => {
    return MATERIALS.filter(m => {
      const haystack = `${m.id} ${m.name} ${m.supplier}`.toLowerCase();
      return haystack.includes(search.toLowerCase()) &&
             (catFilter === 'All' || m.category === catFilter) &&
             (statusFilter === 'All' || m.status === statusFilter);
    });
  }, [search, catFilter, statusFilter]);

  const lowStockCount = MATERIALS.filter(m => m.status === 'LOW_STOCK').length;
  const outStockCount = MATERIALS.filter(m => m.status === 'OUT_OF_STOCK').length;
  const totalValue = MATERIALS.reduce((sum, m) => sum + (m.stock * m.price), 0);

  const stockPercent = Math.min(100, Math.round((selected.stock / selected.maxStock) * 100));
  const stockColor = stockPercent > 50 ? 'var(--stage-completed)' : stockPercent > 20 ? 'var(--accent)' : 'var(--stage-contract)';

  const handleAdjust = (type) => {
    const qty = parseInt(adjustQty);
    if (!qty || qty < 1) return;
    // In real app: API call here
    setAdjustQty('');
  };

  return (
    <div className="flex h-full">
      {/* ─── Left: Table + Filters ─── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Alert Banner */}
        {(lowStockCount > 0 || outStockCount > 0) && (
          <div className="flex items-center gap-3 px-4 py-3 shrink-0" style={{ background: 'var(--accent-soft)', borderBottom: '1px solid rgba(254,189,17,0.2)' }}>
            <Icons.alert />
            <span className="text-sm font-medium" style={{ color: 'var(--accent)' }}>
              {lowStockCount} low stock · {outStockCount} out of stock
            </span>
            <button 
              onClick={() => setStatusFilter('LOW_STOCK')}
              className="ml-auto text-xs font-medium px-3 py-1 rounded-md"
              style={{ background: 'var(--accent)', color: 'var(--on-accent)' }}
            >
              View Low Stock
            </button>
          </div>
        )}

        {/* Filter bar */}
        <div className="flex items-center gap-3 p-4 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md focus-ring" style={{ background: 'var(--bg)', border: '1px solid var(--border)', width: 240 }}>
            <Icons.search />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search materials..."
              className="bg-transparent text-sm outline-none w-full placeholder:text-[var(--ink-muted)]"
              style={{ color: 'var(--ink)' }}
            />
            {search && <button onClick={() => setSearch('')} className="btn-ghost p-0.5"><Icons.x /></button>}
          </div>

          <div className="flex items-center gap-2">
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setCatFilter(c)}
                className="text-xs font-medium px-3 py-1.5 rounded-md transition-colors"
                style={{
                  background: catFilter === c ? 'var(--surface-2)' : 'transparent',
                  color: catFilter === c ? 'var(--ink)' : 'var(--ink-muted)',
                  border: `1px solid ${catFilter === c ? 'var(--border)' : 'transparent'}`,
                }}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-2">
            {STATUSES.filter(s => s !== 'All').map(s => {
              const count = MATERIALS.filter(m => m.status === s).length;
              const active = statusFilter === s;
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(statusFilter === s ? 'All' : s)}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md transition-colors"
                  style={{
                    background: active ? `${STATUS_DOT[s]}15` : 'transparent',
                    color: active ? STATUS_DOT[s] : 'var(--ink-muted)',
                    border: `1px solid ${active ? `${STATUS_DOT[s]}40` : 'transparent'}`,
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_DOT[s] }} />
                  {s.replace(/_/g, ' ')}
                  <span className="ml-1 px-1.5 py-0.5 rounded text-[10px]" style={{ background: 'var(--bg)', color: 'var(--ink-muted)' }}>{count}</span>
                </button>
              );
            })}
          </div>

          <div className="flex-1" />
          <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>
            {filtered.length} items · {totalValue.toLocaleString()} DZD total value
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 z-10" style={{ background: 'var(--surface-2)' }}>
              <tr>
                <th className="px-4 py-3 text-xs font-medium" style={{ color: 'var(--ink-muted)' }}>ID</th>
                <th className="px-4 py-3 text-xs font-medium" style={{ color: 'var(--ink-muted)' }}>Material</th>
                <th className="px-4 py-3 text-xs font-medium" style={{ color: 'var(--ink-muted)' }}>Category</th>
                <th className="px-4 py-3 text-xs font-medium" style={{ color: 'var(--ink-muted)' }}>Stock</th>
                <th className="px-4 py-3 text-xs font-medium" style={{ color: 'var(--ink-muted)' }}>Status</th>
                <th className="px-4 py-3 text-xs font-medium" style={{ color: 'var(--ink-muted)' }}>Supplier</th>
                <th className="px-4 py-3 text-xs font-medium text-right" style={{ color: 'var(--ink-muted)' }}>Unit Price</th>
                <th className="px-4 py-3 text-xs font-medium text-center" style={{ color: 'var(--ink-muted)' }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => {
                const isSel = selectedId === m.id;
                const stockPct = Math.min(100, (m.stock / m.maxStock) * 100);
                return (
                  <tr
                    key={m.id}
                    onClick={() => setSelectedId(m.id)}
                    className="cursor-pointer transition-colors"
                    style={{
                      background: isSel ? 'var(--accent-soft)' : 'transparent',
                      borderTop: '1px solid var(--border)',
                    }}
                  >
                    <td className="px-4 py-3 font-medium text-xs" style={{ color: 'var(--ink-muted)' }}>{m.id}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-sm">{m.name}</div>
                      <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>{m.location}</div>
                    </td>
                    <td className="px-4 py-3 text-xs">{m.category}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium tabular-nums">{m.stock}</span>
                        <span className="text-xs" style={{ color: 'var(--ink-muted)' }}>{m.unit}</span>
                      </div>
                      <div className="mt-1 h-1 w-16 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
                        <div className="h-full rounded-full" style={{ width: `${stockPct}%`, background: m.status === 'OUT_OF_STOCK' ? 'var(--stage-contract)' : m.status === 'LOW_STOCK' ? 'var(--accent)' : 'var(--stage-completed)' }} />
                      </div>
                    </td>
                    <td className="px-4 py-3"><StageBadge stage={m.status} /></td>
                    <td className="px-4 py-3 text-xs">{m.supplier}</td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums">{m.price.toLocaleString()} DZD</td>
                    <td className="px-4 py-3 text-center">
                      <button className="btn-ghost p-1" onClick={e => e.stopPropagation()}><Icons.more /></button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-sm" style={{ color: 'var(--ink-muted)' }}>No materials match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Right: Detail Panel ─── */}
      <div className="w-[380px] shrink-0 flex flex-col overflow-y-auto" style={{ borderLeft: '1px solid var(--border)', background: 'var(--surface)' }}>

        {/* Header */}
        <div className="p-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium" style={{ color: 'var(--ink-muted)' }}>{selected.id}</span>
            <StageBadge stage={selected.status} size="lg" />
          </div>
          <h2 className="text-lg font-semibold">{selected.name}</h2>
          <div className="text-sm mt-1" style={{ color: 'var(--ink-muted)' }}>{selected.category} · {selected.supplier}</div>
        </div>

        {/* Stock Visual */}
        <div className="p-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-end justify-between mb-2">
            <div>
              <div className="text-3xl font-bold tabular-nums">{selected.stock}</div>
              <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>{selected.unit} in stock</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium" style={{ color: stockColor }}>{stockPercent}% capacity</div>
              <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>Min: {selected.minStock} · Max: {selected.maxStock}</div>
            </div>
          </div>
          <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${stockPercent}%`, background: stockColor }} />
          </div>
          <div className="flex justify-between mt-1 text-[10px] uppercase tracking-wider" style={{ color: 'var(--ink-muted)' }}>
            <span>0</span>
            <span style={{ color: selected.stock < selected.minStock ? 'var(--accent)' : undefined }}>Min ({selected.minStock})</span>
            <span>Max ({selected.maxStock})</span>
          </div>
        </div>

        {/* Quick Adjust */}
        <div className="p-5 space-y-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--ink-muted)' }}>Quick Adjust</h3>
          <div className="flex gap-2">
            <input
              type="number"
              value={adjustQty}
              onChange={e => setAdjustQty(e.target.value)}
              placeholder="Qty"
              className="flex-1 px-3 py-2 rounded-md text-sm outline-none focus-ring tabular-nums"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--ink)' }}
            />
            <button onClick={() => handleAdjust('in')} className="btn-primary px-4"><Icons.plus /> In</button>
            <button onClick={() => handleAdjust('out')} className="btn-ghost px-4 border" style={{ borderColor: 'var(--border)' }}><Icons.minus /> Out</button>
          </div>
          <div className="flex gap-2">
            <button className="btn-ghost flex-1 justify-center text-xs border" style={{ borderColor: 'var(--border)' }}>
              <Icons.truck /> Order Restock
            </button>
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="btn-ghost flex-1 justify-center text-xs border"
              style={{ borderColor: 'var(--border)', color: showHistory ? 'var(--accent)' : undefined }}
            >
              <Icons.history /> {showHistory ? 'Hide' : 'Show'} History
            </button>
          </div>
        </div>

        {/* Usage History */}
        {showHistory && (
          <div className="p-5 space-y-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--ink-muted)' }}>Recent Usage</h3>
            <div className="space-y-2">
              {selected.usage.map((u, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${u.type === 'in' ? 'text-green-400' : 'text-yellow-400'}`} style={{ background: 'var(--surface-2)' }}>
                    {u.type === 'in' ? <Icons.box /> : <Icons.package />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{u.order}</div>
                    <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>{u.worker} · {u.date}</div>
                  </div>
                  <div className={`text-sm font-bold tabular-nums ${u.type === 'in' ? 'text-green-400' : 'text-yellow-400'}`}>
                    {u.type === 'in' ? '+' : '-'}{u.qty}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="p-5 space-y-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--ink-muted)' }}>Details</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
              <div className="text-xs mb-1" style={{ color: 'var(--ink-muted)' }}>Location</div>
              <div className="text-sm font-medium">{selected.location}</div>
            </div>
            <div className="p-3 rounded-lg" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
              <div className="text-xs mb-1" style={{ color: 'var(--ink-muted)' }}>Last Used</div>
              <div className="text-sm font-medium">{selected.lastUsed}</div>
            </div>
          </div>
          <div className="flex justify-between text-sm py-2" style={{ borderTop: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--ink-muted)' }}>Inventory Value</span>
            <span className="font-semibold">{(selected.stock * selected.price).toLocaleString()} DZD</span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-5 mt-auto space-y-2">
          <button className="btn-primary w-full justify-center text-sm"><Icons.edit /> Edit Material</button>
          <button className="btn-ghost w-full justify-center text-sm border" style={{ borderColor: 'var(--border)' }}>
            <Icons.truck /> Request Quote from {selected.supplier}
          </button>
        </div>
      </div>
    </div>
  );
}