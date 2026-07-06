'use client';

import { useState, useMemo } from 'react';

/* ─── Reusable UI (extract to app/_components/ui/ later) ─── */
const StageBadge = ({ stage, size = 'sm' }) => {
  const map = {
    APPOINTMENT: { color: 'var(--stage-appointment)', label: 'Appointment', dot: '●' },
    CONTRACT: { color: 'var(--stage-contract)', label: 'Contract', dot: '●' },
    IN_PRODUCTION: { color: 'var(--stage-production)', label: 'In Production', dot: '●' },
    READY_TO_DELIVER: { color: 'var(--stage-ready)', label: 'Ready', dot: '●' },
    COMPLETED: { color: 'var(--stage-completed)', label: 'Completed', dot: '✓' },
  };
  const s = map[stage] || map.APPOINTMENT;
  return (
    <span className="badge" style={{ background: `${s.color}15`, color: s.color, padding: size === 'lg' ? '6px 14px' : undefined, fontSize: size === 'lg' ? '13px' : undefined }}>
      <span style={{ fontSize: size === 'lg' ? 12 : 10 }}>{s.dot}</span> {s.label}
    </span>
  );
};

const Stepper = ({ currentStage }) => {
  const stages = ['APPOINTMENT', 'CONTRACT', 'IN_PRODUCTION', 'READY_TO_DELIVER', 'COMPLETED'];
  const idx = stages.indexOf(currentStage);
  const Check = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
  return (
    <div className="flex items-center w-full">
      {stages.map((s, i) => (
        <div key={s} className="flex items-center flex-1">
          <div className={`step-node ${i < idx ? 'completed' : i === idx ? 'current' : 'future'}`}>
            {i < idx ? <Check /> : i + 1}
          </div>
          {i < stages.length - 1 && <div className={`step-line ${i < idx ? 'completed' : ''}`} />}
        </div>
      ))}
    </div>
  );
};

/* ─── Icons ─── */
const Icons = {
  search: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  x: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
  more: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>,
  phone: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  mapPin: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
  package: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>,
  edit: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>,
  print: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>,
  trash: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>,
};

/* ─── Data ─── */
const ALL_ORDERS = [
  { id: '#2041', client: 'A. Benali', phone: '0551 23 45 67', address: 'Hydra, Algiers', project: 'Kitchen cabinets + island', stage: 'IN_PRODUCTION', worker: 'R. Said', amount: 45000, paid: 22500, dueDate: '2026-07-05', created: '2026-06-20', items: ['Cabinet carcasses x12', 'Island frame', 'Hardware set'] },
  { id: '#2038', client: 'K. Amrani', phone: '0770 88 99 00', address: 'Bab Ezzouar', project: 'Dining table + 6 chairs', stage: 'IN_PRODUCTION', worker: 'A. Benali', amount: 62000, paid: 31000, dueDate: '2026-07-06', created: '2026-06-15', items: ['Oak table top', 'Chair frames x6', 'Upholstery'] },
  { id: '#2045', client: 'S. Merzoug', phone: '0540 11 22 33', address: 'Staoueli', project: 'Full kitchen renovation', stage: 'CONTRACT', worker: 'Unassigned', amount: 128000, paid: 0, dueDate: '2026-07-20', created: '2026-07-01', items: ['Cabinets x20', 'Countertop', 'Sink & faucet'] },
  { id: '#2042', client: 'F. Hadj', phone: '0555 44 55 66', address: 'El Biar', project: 'Wardrobe + vanity', stage: 'READY_TO_DELIVER', worker: 'R. Said', amount: 34000, paid: 34000, dueDate: '2026-07-05', created: '2026-06-25', items: ['Wardrobe carcass', 'Mirror door', 'Drawers x4'] },
  { id: '#2035', client: 'M. Boudiaf', phone: '0661 77 88 99', address: 'Oran — Es Sénia', project: 'Office desk set', stage: 'COMPLETED', worker: 'M. Draoui', amount: 28000, paid: 28000, dueDate: '2026-06-28', created: '2026-06-10', items: ['Desk frame', 'Drawer units x2'] },
  { id: '#2048', client: 'L. Zertal', phone: '0790 12 34 56', address: 'Constantine', project: 'Bookshelves x3', stage: 'APPOINTMENT', worker: 'Unassigned', amount: 18500, paid: 0, dueDate: '2026-07-12', created: '2026-07-03', items: ['Shelf units x3', 'Brackets'] },
  { id: '#2040', client: 'Y. Kessous', phone: '0550 98 76 54', address: 'Boumerdès', project: 'TV wall unit', stage: 'IN_PRODUCTION', worker: 'K. Amrani', amount: 52000, paid: 26000, dueDate: '2026-07-08', created: '2026-06-22', items: ['Wall frame', 'Floating shelves', 'LED strip'] },
  { id: '#2032', client: 'R. Larbi', phone: '0777 33 44 55', address: 'Blida', project: 'Bathroom vanity', stage: 'COMPLETED', worker: 'A. Benali', amount: 22000, paid: 22000, dueDate: '2026-06-25', created: '2026-06-05', items: ['Vanity carcass', 'Marble top'] },
  { id: '#2049', client: 'N. Hamidi', phone: '0560 66 77 88', address: 'Tipaza', project: 'Outdoor kitchen', stage: 'APPOINTMENT', worker: 'Unassigned', amount: 95000, paid: 0, dueDate: '2026-07-25', created: '2026-07-04', items: ['Weatherproof cabinets', 'Grill station', 'Concrete top'] },
  { id: '#2039', client: 'D. Mansouri', phone: '0544 99 00 11', address: 'Algiers — Bir Mourad Raïs', project: 'Closet system', stage: 'CONTRACT', worker: 'Unassigned', amount: 41000, paid: 15000, dueDate: '2026-07-15', created: '2026-06-18', items: ['Closet frames', 'Shelving', 'Shoe rack'] },
];

const STATUSES = ['All', 'APPOINTMENT', 'CONTRACT', 'IN_PRODUCTION', 'READY_TO_DELIVER', 'COMPLETED'];
const STAGE_DOT = { APPOINTMENT:'var(--stage-appointment)', CONTRACT:'var(--stage-contract)', IN_PRODUCTION:'var(--stage-production)', READY_TO_DELIVER:'var(--stage-ready)', COMPLETED:'var(--stage-completed)' };

export default function OrdersClient() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedId, setSelectedId] = useState(ALL_ORDERS[0].id);
  const [sortKey, setSortKey] = useState('created');
  const [sortDir, setSortDir] = useState('desc');

  const today = new Date().setHours(0,0,0,0);

  const filtered = useMemo(() => {
    let rows = ALL_ORDERS.filter(o => {
      const haystack = `${o.id} ${o.client} ${o.project}`.toLowerCase();
      return haystack.includes(search.toLowerCase()) &&
             (statusFilter === 'All' || o.stage === statusFilter);
    });
    rows.sort((a, b) => {
      let av = a[sortKey], bv = b[sortKey];
      if (typeof av === 'string') { av = av.toLowerCase(); bv = bv.toLowerCase(); }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return rows;
  }, [search, statusFilter, sortKey, sortDir]);

  const selected = ALL_ORDERS.find(o => o.id === selectedId) || ALL_ORDERS[0];
  const totalAmount = filtered.reduce((sum, o) => sum + o.amount, 0);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <span className="ml-1" style={{ color: 'var(--ink-muted)', fontSize: 10 }}>↕</span>;
    return <span className="ml-1" style={{ color: 'var(--accent)', fontSize: 10 }}>{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="flex h-full">
      {/* ─── Left: Table + Filters ─── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Filter bar */}
        <div className="flex items-center gap-3 p-4 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md focus-ring" style={{ background: 'var(--bg)', border: '1px solid var(--border)', width: 260 }}>
            <Icons.search />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search orders..."
              className="bg-transparent text-sm outline-none w-full placeholder:text-[var(--ink-muted)]"
              style={{ color: 'var(--ink)' }}
            />
            {search && <button onClick={() => setSearch('')} className="btn-ghost p-0.5"><Icons.x /></button>}
          </div>

          <div className="flex items-center gap-2">
            {STATUSES.map(s => {
              const active = statusFilter === s;
              const count = s === 'All' ? ALL_ORDERS.length : ALL_ORDERS.filter(o => o.stage === s).length;
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md transition-colors"
                  style={{
                    background: active ? 'var(--accent-soft)' : 'transparent',
                    color: active ? 'var(--accent)' : 'var(--ink-muted)',
                    border: `1px solid ${active ? 'rgba(254,189,17,0.3)' : 'var(--border)'}`,
                  }}
                >
                  {s !== 'All' && <span className="w-1.5 h-1.5 rounded-full" style={{ background: STAGE_DOT[s] }} />}
                  {s === 'All' ? 'All' : s.replace(/_/g, ' ')}
                  <span className="ml-1 px-1.5 py-0.5 rounded text-[10px]" style={{ background: 'var(--bg)', color: 'var(--ink-muted)' }}>{count}</span>
                </button>
              );
            })}
          </div>

          <div className="flex-1" />
          <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>
            {filtered.length} orders · {totalAmount.toLocaleString()} DZD
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 z-10" style={{ background: 'var(--surface-2)' }}>
              <tr>
                {[
                  { key: 'id', label: 'Order' },
                  { key: 'client', label: 'Client' },
                  { key: null, label: 'Project' },
                  { key: 'stage', label: 'Status' },
                  { key: 'worker', label: 'Worker' },
                  { key: 'amount', label: 'Amount', right: true },
                  { key: 'dueDate', label: 'Due' },
                ].map(col => (
                  <th
                    key={col.label}
                    className={`px-4 py-3 text-xs font-medium ${col.key ? 'cursor-pointer select-none' : ''}`}
                    style={{ color: 'var(--ink-muted)' }}
                    onClick={col.key ? () => toggleSort(col.key) : undefined}
                  >
                    <span className={col.right ? 'flex justify-end items-center' : 'flex items-center'}>
                      {col.label} {col.key && <SortIcon col={col.key} />}
                    </span>
                  </th>
                ))}
                <th className="px-4 py-3 text-xs font-medium text-center" style={{ color: 'var(--ink-muted)' }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => {
                const isSel = selectedId === o.id;
                const isOverdue = new Date(o.dueDate).getTime() < today && o.stage !== 'COMPLETED';
                return (
                  <tr
                    key={o.id}
                    onClick={() => setSelectedId(o.id)}
                    className="cursor-pointer transition-colors"
                    style={{
                      background: isSel ? 'var(--accent-soft)' : 'transparent',
                      borderTop: '1px solid var(--border)',
                    }}
                  >
                    <td className="px-4 py-3 font-medium">{o.id}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-sm">{o.client}</div>
                      <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>{o.phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm truncate max-w-[180px]">{o.project}</div>
                    </td>
                    <td className="px-4 py-3"><StageBadge stage={o.stage} /></td>
                    <td className="px-4 py-3">
                      <span style={{ color: o.worker === 'Unassigned' ? 'var(--stage-contract)' : 'var(--ink)' }}>{o.worker}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums">{o.amount.toLocaleString()} DZD</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs ${isOverdue ? 'font-semibold' : ''}`} style={{ color: isOverdue ? 'var(--accent)' : 'var(--ink-muted)' }}>
                        {o.dueDate}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button className="btn-ghost p-1" onClick={e => e.stopPropagation()}><Icons.more /></button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-sm" style={{ color: 'var(--ink-muted)' }}>No orders match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Right: Detail Panel ─── */}
      <div className="w-[380px] shrink-0 flex flex-col overflow-y-auto" style={{ borderLeft: '1px solid var(--border)', background: 'var(--surface)' }}>

        {/* Header */}
        <div className="p-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">{selected.id}</h2>
            <StageBadge stage={selected.stage} size="lg" />
          </div>
          <p className="text-sm mb-4" style={{ color: 'var(--ink-muted)' }}>{selected.project}</p>
          <Stepper currentStage={selected.stage} />
          <div className="flex justify-between mt-2 text-[10px] uppercase tracking-wider font-medium" style={{ color: 'var(--ink-muted)' }}>
            <span>Appt</span><span>Contract</span>
            <span style={{ color: selected.stage === 'IN_PRODUCTION' ? 'var(--accent)' : undefined }}>Production</span>
            <span>Ready</span><span>Done</span>
          </div>
        </div>

        {/* Client */}
        <div className="p-5 space-y-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: 'var(--surface-2)', color: 'var(--accent)' }}>
              {selected.client.split(' ').map(n => n[0]).join('').slice(0,2)}
            </div>
            <div>
              <div className="text-sm font-medium">{selected.client}</div>
              <div className="text-xs flex items-center gap-1" style={{ color: 'var(--ink-muted)' }}><Icons.phone /> {selected.phone}</div>
            </div>
          </div>
          <div className="text-xs flex items-start gap-1" style={{ color: 'var(--ink-muted)' }}><Icons.mapPin /> {selected.address}</div>
        </div>

        {/* Meta */}
        <div className="p-5 grid grid-cols-2 gap-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="p-3 rounded-lg" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
            <div className="text-xs mb-1" style={{ color: 'var(--ink-muted)' }}>Assigned</div>
            <div className="text-sm font-medium" style={{ color: selected.worker === 'Unassigned' ? 'var(--stage-contract)' : 'var(--ink)' }}>{selected.worker}</div>
          </div>
          <div className="p-3 rounded-lg" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
            <div className="text-xs mb-1" style={{ color: 'var(--ink-muted)' }}>Due Date</div>
            <div className="text-sm font-medium">{selected.dueDate}</div>
          </div>
        </div>

        {/* Financial */}
        <div className="p-5 space-y-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--ink-muted)' }}>Financial</h3>
          <div className="flex justify-between text-sm"><span style={{ color: 'var(--ink-muted)' }}>Total</span><span className="font-semibold">{selected.amount.toLocaleString()} DZD</span></div>
          <div className="flex justify-between text-sm"><span style={{ color: 'var(--ink-muted)' }}>Paid</span><span style={{ color: 'var(--stage-completed)' }}>{selected.paid.toLocaleString()} DZD</span></div>
          <div className="flex justify-between text-sm">
            <span style={{ color: 'var(--ink-muted)' }}>Remaining</span>
            <span className="font-semibold" style={{ color: selected.amount - selected.paid > 0 ? 'var(--accent)' : 'var(--stage-completed)' }}>
              {(selected.amount - selected.paid).toLocaleString()} DZD
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
            <div className="h-full rounded-full" style={{ width: `${(selected.paid / selected.amount) * 100}%`, background: selected.paid === selected.amount ? 'var(--stage-completed)' : 'var(--accent)' }} />
          </div>
        </div>

        {/* Items */}
        <div className="p-5 space-y-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--ink-muted)' }}>Items</h3>
          {selected.items.map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <span style={{ color: 'var(--ink-muted)' }}><Icons.package /></span>
              <span>{item}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="p-5 mt-auto space-y-2">
          <button className="btn-primary w-full justify-center text-sm"><Icons.edit /> Edit Order</button>
          <div className="flex gap-2">
            <button className="btn-ghost flex-1 justify-center text-sm border" style={{ borderColor: 'var(--border)' }}><Icons.print /> Print</button>
            <button className="btn-ghost flex-1 justify-center text-sm border" style={{ borderColor: 'var(--border)' }}><Icons.trash /> Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
}