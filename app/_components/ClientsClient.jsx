'use client';

import { useState, useMemo } from 'react';

/* ─── Reusable UI ─── */
const StageBadge = ({ stage, size = 'sm', custom }) => {
  const map = {
    QUOTE:        { color: 'var(--ink-muted)',          label: 'Quote' },
    IN_PROGRESS:  { color: 'var(--accent)',             label: 'In Progress' },
    READY:        { color: 'var(--stage-ready)',        label: 'Ready' },
    DELIVERED:    { color: 'var(--stage-completed)',    label: 'Delivered' },
    CANCELLED:    { color: 'var(--stage-contract)',     label: 'Cancelled' },
    NEW:          { color: '#3b82f6',                   label: 'New' },
    ACTIVE:       { color: 'var(--stage-completed)',    label: 'Active' },
    VIP:          { color: 'var(--accent)',             label: 'VIP' },
    INACTIVE:     { color: 'var(--ink-muted)',          label: 'Inactive' },
    IN_STOCK:     { color: 'var(--stage-completed)',    label: 'In Stock' },
    LOW_STOCK:    { color: 'var(--accent)',             label: 'Low Stock' },
    OUT_OF_STOCK: { color: 'var(--stage-contract)',     label: 'Out of Stock' },
    ORDERED:      { color: 'var(--stage-ready)',        label: 'Ordered' },
  };
  const s = custom || map[stage] || { color: 'var(--ink-muted)', label: stage };
  return (
    <span
      className="badge"
      style={{
        background: `${s.color}15`,
        color: s.color,
        padding: size === 'lg' ? '6px 14px' : undefined,
        fontSize: size === 'lg' ? '13px' : undefined,
      }}
    >
      <span style={{ fontSize: size === 'lg' ? 12 : 10 }}>●</span> {s.label}
    </span>
  );
};

/* ─── Icons ─── */
const Icons = {
  search: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  x: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
  more: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>,
  plus: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>,
  edit: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>,
  phone: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  mail: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>,
  pin: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 7-8 13-8 13s-8-6-8-13a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
  user: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  building: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>,
  inbox: () => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>,
  arrowRight: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>,
  cal: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>,
  tag: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.6 2.6 0 0 0 3.678 0l5.426-5.426a2.6 2.6 0 0 0 0-3.678z"/><circle cx="7.5" cy="7.5" r=".5"/></svg>,
  alert: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>,
  back: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>,
  copy: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>,
  check: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
};

/* ─── Data ─── */
const SEED_CLIENTS = [
  {
    id: 'CLT-001', name: 'Karim Boudiaff', type: 'Individual', status: 'VIP',
    phone: '+213 555 12 34 56', email: 'karim.boudiaf@example.dz',
    city: 'Algiers', district: 'Hydra', address: '12 Rue des Frères Moulay',
    joined: '2024-03-12', notes: 'Prefers walnut finish. Always pays on delivery.',
    orders: [
      { id: '#2042', date: '2026-07-05', deliveryDate: '2026-07-25', status: 'IN_PROGRESS', items: 4, total: 285000, worker: 'R. Said', description: 'Kitchen — walnut finish, quartz countertop' },
      { id: '#2038', date: '2026-06-15', deliveryDate: '2026-07-02', status: 'DELIVERED',  items: 2, total:  95000, worker: 'A. Benali', description: 'Bedroom wardrobe + side tables' },
      { id: '#2025', date: '2026-04-20', deliveryDate: '2026-05-15', status: 'DELIVERED',  items: 6, total: 420000, worker: 'R. Said', description: 'Full living room built-ins' },
    ],
  },
  {
    id: 'CLT-002', name: 'Restaurant Le Cèdre', type: 'Company', status: 'ACTIVE',
    phone: '+213 21 63 45 67', email: 'contact@lecedre.dz',
    city: 'Algiers', district: 'Kouba', address: 'Zone industrielle, Lot 24',
    joined: '2025-01-08', notes: 'Commercial contract — net 30.',
    orders: [
      { id: '#2041', date: '2026-07-04', deliveryDate: '2026-07-30', status: 'IN_PROGRESS', items: 8, total: 680000, worker: 'R. Said', description: 'Bar counter + back shelving' },
      { id: '#2030', date: '2026-05-12', deliveryDate: '2026-06-10', status: 'DELIVERED',   items: 5, total: 410000, worker: 'K. Amrani', description: 'Dining tables ×3 + host stand' },
    ],
  },
  {
    id: 'CLT-003', name: 'Yasmine Hadj', type: 'Individual', status: 'ACTIVE',
    phone: '+213 666 88 22 11', email: 'yasmine.h@example.dz',
    city: 'Boumerdès', district: 'Boumerdès Centre', address: 'Cité 200 Logts, Bât. 4',
    joined: '2025-08-22', notes: '',
    orders: [
      { id: '#2040', date: '2026-06-25', deliveryDate: '2026-07-18', status: 'READY',       items: 3, total: 145000, worker: 'M. Draoui', description: 'Office desk + bookshelf' },
      { id: '#2028', date: '2026-03-10', deliveryDate: '2026-04-05', status: 'DELIVERED',   items: 2, total:  78000, worker: 'A. Benali', description: 'Bathroom vanity' },
    ],
  },
  {
    id: 'CLT-004', name: 'Hôtel Tassili', type: 'Company', status: 'VIP',
    phone: '+213 29 74 12 90', email: 'projects@tassili-hotel.dz',
    city: 'Ghardaïa', district: 'Centre-ville', address: 'Avenue de l\'Indépendance',
    joined: '2023-11-04', notes: 'Ongoing multi-year contract. 6 rooms renovated per year.',
    orders: [
      { id: '#2035', date: '2026-06-20', deliveryDate: '2026-08-15', status: 'IN_PROGRESS', items: 12, total: 1850000, worker: 'R. Said', description: 'Suite renovation — phase 2' },
      { id: '#2018', date: '2026-02-14', deliveryDate: '2026-03-30', status: 'DELIVERED',   items: 10, total: 1620000, worker: 'K. Amrani', description: 'Suite renovation — phase 1' },
      { id: '#2005', date: '2025-10-08', deliveryDate: '2025-11-25', status: 'DELIVERED',   items:  8, total: 1280000, worker: 'R. Said', description: 'Lobby reception desk' },
    ],
  },
  {
    id: 'CLT-005', name: 'Mohamed Cherif', type: 'Individual', status: 'NEW',
    phone: '+213 770 11 22 33', email: 'm.cherif@example.dz',
    city: 'Blida', district: 'Béni Tamou', address: 'Rue des Martyrs, N°8',
    joined: '2026-06-30', notes: 'First-time client. Quote sent, awaiting confirmation.',
    orders: [
      { id: '#2043', date: '2026-07-06', deliveryDate: '—', status: 'QUOTE', items: 1, total: 85000, worker: '—', description: 'Walk-in closet — quoted' },
    ],
  },
  {
    id: 'CLT-006', name: 'Café El Bahia', type: 'Company', status: 'ACTIVE',
    phone: '+213 555 77 88 99', email: 'bahia.cafe@example.dz',
    city: 'Oran', district: 'Sidi El Houari', address: 'Front de mer, N°3',
    joined: '2025-04-18', notes: '',
    orders: [
      { id: '#2039', date: '2026-06-22', deliveryDate: '2026-07-15', status: 'DELIVERED', items: 4, total: 195000, worker: 'M. Draoui', description: 'Café counter + display shelves' },
      { id: '#2022', date: '2026-01-30', deliveryDate: '2026-02-28', status: 'DELIVERED', items: 6, total: 240000, worker: 'A. Benali', description: 'Complete interior fit-out' },
    ],
  },
  {
    id: 'CLT-007', name: 'Nadia Belkacem', type: 'Individual', status: 'INACTIVE',
    phone: '+213 661 44 55 66', email: '—',
    city: 'Tipaza', district: 'Cherchell', address: 'Cité Boudouaou, N°14',
    joined: '2024-09-10', notes: 'Last order 8+ months ago. Follow up?',
    orders: [
      { id: '#1987', date: '2025-11-02', deliveryDate: '2025-12-01', status: 'DELIVERED', items: 3, total: 110000, worker: 'A. Benali', description: 'Kitchen cabinets' },
    ],
  },
  {
    id: 'CLT-008', name: 'Bureau d\'Architecture ARBA', type: 'Company', status: 'ACTIVE',
    phone: '+213 21 54 32 10', email: 'contact@arba-archi.dz',
    city: 'Algiers', district: 'El Mouradia', address: 'Rue Didouche Mourad, N°45',
    joined: '2025-06-01', notes: 'Refers clients to us regularly.',
    orders: [
      { id: '#2037', date: '2026-06-18', deliveryDate: '2026-07-20', status: 'IN_PROGRESS', items: 5, total: 320000, worker: 'R. Said', description: 'Custom reception furniture' },
      { id: '#2029', date: '2026-04-02', deliveryDate: '2026-05-10', status: 'DELIVERED',   items: 3, total: 175000, worker: 'K. Amrani', description: 'Conference table' },
    ],
  },
];

const TYPES = ['All', 'Individual', 'Company'];

/* ─── Modal ─── */
const Modal = ({ title, onClose, children, footer, maxWidth = 560 }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{ background: 'rgba(0,0,0,0.55)' }}
    onClick={onClose}
  >
    <div
      className="w-full rounded-xl shadow-2xl flex flex-col max-h-[90vh]"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)', maxWidth }}
      onClick={e => e.stopPropagation()}
    >
      <div className="flex items-center justify-between p-4 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="text-base font-semibold">{title}</h2>
        <button onClick={onClose} className="btn-ghost p-1" aria-label="Close"><Icons.x /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-5">{children}</div>
      {footer && (
        <div className="flex items-center justify-end gap-2 p-4 shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
          {footer}
        </div>
      )}
    </div>
  </div>
);

const Field = ({ label, children, hint }) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-xs font-medium" style={{ color: 'var(--ink-muted)' }}>{label}</span>
    {children}
    {hint && <span className="text-[11px]" style={{ color: 'var(--ink-muted)' }}>{hint}</span>}
  </label>
);

const inputStyle = {
  background: 'var(--bg)',
  border: '1px solid var(--border)',
  color: 'var(--ink)',
};

const initials = (name) =>
  name.split(' ').filter(Boolean).slice(0, 2).map(s => s[0]).join('').toUpperCase();

const formatDZD = (n) => `${n.toLocaleString()} DZD`;

/* ─── Copy button ─── */
const CopyButton = ({ value, id, copiedId, onCopy, className = '', size = 12 }) => (
  <button
    onClick={(e) => { e.stopPropagation(); onCopy(value, id); }}
    className={`inline-flex items-center justify-center p-1 rounded transition-colors ${className}`}
    style={{
      background: copiedId === id ? 'var(--stage-completed)20' : 'transparent',
      color: copiedId === id ? 'var(--stage-completed)' : 'var(--ink-muted)',
    }}
    title={copiedId === id ? 'Copied!' : 'Copy'}
  >
    {copiedId === id ? <Icons.check /> : <Icons.copy />}
  </button>
);

/* ─── Main ─── */
export default function ClientsClient() {
  const [clients, setClients] = useState(SEED_CLIENTS);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [selectedId, setSelectedId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const [showNewModal, setShowNewModal] = useState(false);
  const emptyForm = {
    name: '', type: 'Individual', status: 'NEW',
    phone: '', email: '', city: '', district: '', address: '', notes: '',
  };
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');

  const selected = clients.find(c => c.id === selectedId);

  const filtered = useMemo(() => {
    return clients.filter(c => {
      const haystack = `${c.id} ${c.name} ${c.email} ${c.phone} ${c.city}`.toLowerCase();
      return haystack.includes(search.toLowerCase()) &&
        (typeFilter === 'All' || c.type === typeFilter);
    });
  }, [clients, search, typeFilter]);

  const stats = useMemo(() => {
    const total = clients.length;
    const vip = clients.filter(c => c.status === 'VIP').length;
    const newCount = clients.filter(c => c.status === 'NEW').length;
    const inactive = clients.filter(c => c.status === 'INACTIVE').length;
    return { total, vip, newCount, inactive };
  }, [clients]);

  const handleCopy = (value, id) => {
    if (!value || value === '—') return;
    if (navigator.clipboard) navigator.clipboard.writeText(value).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1200);
  };

  const handleCreateClient = () => {
    if (!form.name.trim()) return setFormError('Name is required');
    if (!form.phone.trim()) return setFormError('Phone is required');
    setFormError('');
    const nextId = `CLT-${String(clients.length + 1).padStart(3, '0')}`;
    const newClient = {
      ...form,
      id: nextId,
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || '—',
      joined: new Date().toISOString().slice(0, 10),
      orders: [],
    };
    setClients(prev => [newClient, ...prev]);
    setSelectedId(nextId);
    setForm(emptyForm);
    setShowNewModal(false);
  };

  /* ─── Right panel content (no outer wrapper so it can be reused on mobile) ─── */
  const RightPanelContent = () => {
    if (!selected) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-10 text-center">
          <div style={{ color: 'var(--ink-muted)' }}><Icons.inbox /></div>
          <h3 className="mt-4 text-base font-semibold">Select a client</h3>
          <p className="mt-1 text-sm max-w-xs" style={{ color: 'var(--ink-muted)' }}>
            Click a client on the left to see their full order history, contact info and notes.
          </p>
        </div>
      );
    }

    const totalSpent = selected.orders.reduce((s, o) => s + o.total, 0);
    const lastOrder = selected.orders.slice().sort((a, b) => b.date.localeCompare(a.date))[0];
    const openOrders = selected.orders.filter(o => ['QUOTE', 'IN_PROGRESS', 'READY'].includes(o.status));

    return (
      <div>
        {/* Header */}
        <div className="p-5 sm:p-6" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-sm sm:text-base font-bold shrink-0"
              style={{ background: 'var(--surface-2)', color: 'var(--accent)' }}
            >
              {initials(selected.name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs font-medium" style={{ color: 'var(--ink-muted)' }}>{selected.id}</span>
                <StageBadge stage={selected.status} />
                <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'var(--surface-2)', color: 'var(--ink-muted)' }}>
                  {selected.type}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-semibold">{selected.name}</h2>

              {/* Contact — phone on one line with copy */}
              <div className="mt-3 space-y-1.5">
                <ContactRow
                  icon={<Icons.phone />}
                  value={selected.phone}
                  copyId={`detail-phone-${selected.id}`}
                  copiedId={copiedId}
                  onCopy={handleCopy}
                />
                {selected.email !== '—' && (
                  <ContactRow
                    icon={<Icons.mail />}
                    value={selected.email}
                    copyId={`detail-email-${selected.id}`}
                    copiedId={copiedId}
                    onCopy={handleCopy}
                  />
                )}
                <div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--ink-muted)' }}>
                  <Icons.pin />
                  <span className="truncate">{selected.city}{selected.district ? `, ${selected.district}` : ''}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button className="btn-primary text-sm px-4 flex-1 sm:flex-none"><Icons.plus /> New Order</button>
            <button className="btn-ghost text-sm px-4 border flex-1 sm:flex-none" style={{ borderColor: 'var(--border)' }}><Icons.edit /> Edit</button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-5 sm:p-6" style={{ borderBottom: '1px solid var(--border)' }}>
          <Stat label="Total Orders" value={selected.orders.length} icon={Icons.tag} />
          <Stat label="Open Orders" value={openOrders.length} accent={openOrders.length > 0 ? 'var(--accent)' : undefined} icon={Icons.tag} />
          <Stat label="Total Spent" value={formatDZD(totalSpent)} icon={Icons.tag} />
          <Stat label="Last Order" value={lastOrder?.date || '—'} icon={Icons.cal} />
        </div>

        {/* Orders */}
        <div className="p-5 sm:p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--ink-muted)' }}>
              Order History
            </h3>
            <span className="text-xs" style={{ color: 'var(--ink-muted)' }}>{selected.orders.length} total</span>
          </div>

          {selected.orders.length === 0 ? (
            <div className="text-center py-12 rounded-lg" style={{ background: 'var(--bg)', border: '1px dashed var(--border)' }}>
              <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>No orders yet for this client.</p>
              <button className="btn-primary text-xs mt-3"><Icons.plus /> Create First Order</button>
            </div>
          ) : (
            <div className="space-y-2">
              {[...selected.orders].sort((a, b) => b.date.localeCompare(a.date)).map(o => (
                <div
                  key={o.id}
                  className="p-3 sm:p-4 rounded-lg flex items-center gap-3 sm:gap-4 panel-hover cursor-pointer"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: 'var(--surface-2)', color: 'var(--accent)' }}
                  >
                    <Icons.tag />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="font-semibold text-sm">{o.id}</span>
                      <StageBadge stage={o.status} />
                    </div>
                    <div className="text-sm truncate">{o.description}</div>
                    <div className="flex items-center gap-3 mt-1 text-xs flex-wrap" style={{ color: 'var(--ink-muted)' }}>
                      <span className="flex items-center gap-1 whitespace-nowrap"><Icons.cal /> {o.date}</span>
                      {o.deliveryDate !== '—' && <span className="whitespace-nowrap">→ {o.deliveryDate}</span>}
                      <span className="whitespace-nowrap">· {o.items} item{o.items > 1 ? 's' : ''}</span>
                      <span className="whitespace-nowrap">· {o.worker}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold tabular-nums whitespace-nowrap">{formatDZD(o.total)}</div>
                    <button className="text-xs mt-1 flex items-center gap-1 whitespace-nowrap" style={{ color: 'var(--accent)' }}>
                      View <Icons.arrowRight />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        {selected.notes && (
          <div className="p-5 sm:p-6" style={{ borderTop: '1px solid var(--border)' }}>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--ink-muted)' }}>Notes</h3>
            <p className="text-sm p-3 rounded-lg" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
              {selected.notes}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-full">
      {/* ─── Left: Clients list ─── */}
      <div className={`flex-1 flex-col min-w-0 overflow-hidden ${selected ? 'hidden lg:flex' : 'flex'}`}>
        {/* Stats bar */}
        <div
          className="flex items-center gap-2 sm:gap-3 px-4 py-3 shrink-0 overflow-x-auto"
          style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}
        >
          <StatChip label="Total" value={stats.total} />
          <StatChip label="VIP" value={stats.vip} color="var(--accent)" />
          <StatChip label="New" value={stats.newCount} color="#3b82f6" />
          <StatChip label="Inactive" value={stats.inactive} color="var(--ink-muted)" />
        </div>

        {/* Filter bar */}
        <div
          className="flex items-center gap-2 sm:gap-3 p-4 shrink-0 flex-wrap"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          {/* Search — always visible, prominent */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-md focus-ring flex-1 min-w-[200px]"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
          >
            <Icons.search />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search clients by name, phone, city..."
              className="bg-transparent text-sm outline-none w-full placeholder:text-[var(--ink-muted)]"
              style={{ color: 'var(--ink)' }}
            />
            {search && <button onClick={() => setSearch('')} className="btn-ghost p-0.5"><Icons.x /></button>}
          </div>

          <div className="flex items-center gap-2">
            {TYPES.map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className="text-xs font-medium px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5"
                style={{
                  background: typeFilter === t ? 'var(--surface-2)' : 'transparent',
                  color: typeFilter === t ? 'var(--ink)' : 'var(--ink-muted)',
                  border: `1px solid ${typeFilter === t ? 'var(--border)' : 'transparent'}`,
                }}
              >
                {t === 'Individual' && <Icons.user />}
                {t === 'Company' && <Icons.building />}
                {t}
              </button>
            ))}
          </div>

          <button onClick={() => setShowNewModal(true)} className="btn-primary text-xs px-3 py-1.5">
            <Icons.plus /> New Client
          </button>
          <div className="text-xs hidden sm:block" style={{ color: 'var(--ink-muted)' }}>
            {filtered.length} shown
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm" style={{ minWidth: 720 }}>
            <thead className="sticky top-0 z-10" style={{ background: 'var(--surface-2)' }}>
              <tr>
                <th className="px-4 py-3 text-xs font-medium" style={{ color: 'var(--ink-muted)' }}>Client</th>
                <th className="px-4 py-3 text-xs font-medium hidden md:table-cell" style={{ color: 'var(--ink-muted)' }}>Type</th>
                <th className="px-4 py-3 text-xs font-medium hidden sm:table-cell" style={{ color: 'var(--ink-muted)' }}>Contact</th>
                <th className="px-4 py-3 text-xs font-medium hidden lg:table-cell" style={{ color: 'var(--ink-muted)' }}>Status</th>
                <th className="px-4 py-3 text-xs font-medium text-right" style={{ color: 'var(--ink-muted)' }}>Orders</th>
                <th className="px-4 py-3 text-xs font-medium text-right hidden lg:table-cell" style={{ color: 'var(--ink-muted)' }}>Total Spent</th>
                <th className="px-4 py-3 text-xs font-medium text-center" style={{ color: 'var(--ink-muted)' }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const isSel = selectedId === c.id;
                const totalSpent = c.orders.reduce((s, o) => s + o.total, 0);
                return (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    className="cursor-pointer transition-colors"
                    style={{
                      background: isSel ? 'var(--accent-soft)' : 'transparent',
                      borderTop: '1px solid var(--border)',
                    }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                          style={{ background: 'var(--surface-2)', color: 'var(--accent)' }}
                        >
                          {initials(c.name)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-sm truncate">{c.name}</div>
                          <div className="text-xs truncate hidden sm:block" style={{ color: 'var(--ink-muted)' }}>
                            {c.id} · {c.city}
                          </div>
                          <div className="text-xs truncate sm:hidden" style={{ color: 'var(--ink-muted)' }}>{c.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="inline-flex items-center gap-1.5 text-xs">
                        {c.type === 'Individual' ? <Icons.user /> : <Icons.building />}
                        {c.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="flex items-center gap-1.5 whitespace-nowrap text-xs" style={{ color: 'var(--ink-muted)' }}>
                        <Icons.phone />
                        <span className="tabular-nums">{c.phone}</span>
                        <CopyButton
                          value={c.phone}
                          id={`row-phone-${c.id}`}
                          copiedId={copiedId}
                          onCopy={handleCopy}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell"><StageBadge stage={c.status} /></td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums">{c.orders.length}</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums hidden lg:table-cell whitespace-nowrap">{formatDZD(totalSpent)}</td>
                    <td className="px-4 py-3 text-center">
                      <button className="btn-ghost p-1" onClick={e => e.stopPropagation()}><Icons.more /></button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm" style={{ color: 'var(--ink-muted)' }}>
                    No clients match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Right panel — desktop ─── */}
      <aside
        className="hidden lg:flex w-[420px] shrink-0 flex-col overflow-hidden"
        style={{ borderLeft: '1px solid var(--border)', background: 'var(--surface)' }}
      >
        <div className="flex-1 overflow-y-auto">
          <RightPanelContent />
        </div>
      </aside>

      {/* ─── Right panel — mobile drawer ─── */}
      {selected && (
        <div className="lg:hidden fixed inset-0 z-40 flex flex-col" style={{ background: 'var(--surface)' }}>
          <div
            className="flex items-center px-3 h-12 shrink-0"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <button
              onClick={() => setSelectedId(null)}
              className="btn-ghost p-2 -ml-1"
              aria-label="Back"
            >
              <Icons.back />
            </button>
            <span className="ml-2 text-sm font-semibold">Client Details</span>
            <span className="ml-auto text-xs" style={{ color: 'var(--ink-muted)' }}>{selected.id}</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            <RightPanelContent />
          </div>
        </div>
      )}

      {/* ─── New Client Modal ─── */}
      {showNewModal && (
        <Modal
          title="New Client"
          onClose={() => { setShowNewModal(false); setFormError(''); setForm(emptyForm); }}
          footer={
            <>
              <button onClick={() => { setShowNewModal(false); setFormError(''); setForm(emptyForm); }} className="btn-ghost px-4 text-sm">Cancel</button>
              <button onClick={handleCreateClient} className="btn-primary px-4 text-sm"><Icons.plus /> Create</button>
            </>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Client Name *">
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Full name or company"
                className="px-3 py-2 rounded-md text-sm outline-none focus-ring w-full"
                style={inputStyle}
              />
            </Field>
            <Field label="Type *">
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="px-3 py-2 rounded-md text-sm outline-none focus-ring w-full"
                style={inputStyle}
              >
                <option>Individual</option>
                <option>Company</option>
              </select>
            </Field>
            <Field label="Status">
              <select
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="px-3 py-2 rounded-md text-sm outline-none focus-ring w-full"
                style={inputStyle}
              >
                <option>NEW</option>
                <option>ACTIVE</option>
                <option>VIP</option>
                <option>INACTIVE</option>
              </select>
            </Field>
            <div />
            <Field label="Phone *">
              <input
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+213 ..."
                className="px-3 py-2 rounded-md text-sm outline-none focus-ring w-full whitespace-nowrap"
                style={inputStyle}
              />
            </Field>
            <Field label="Email">
              <input
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="email@example.dz"
                className="px-3 py-2 rounded-md text-sm outline-none focus-ring w-full"
                style={inputStyle}
              />
            </Field>
            <Field label="City">
              <input
                value={form.city}
                onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                placeholder="Algiers, Oran, ..."
                className="px-3 py-2 rounded-md text-sm outline-none focus-ring w-full"
                style={inputStyle}
              />
            </Field>
            <Field label="District">
              <input
                value={form.district}
                onChange={e => setForm(f => ({ ...f, district: e.target.value }))}
                placeholder="Hydra, Kouba, ..."
                className="px-3 py-2 rounded-md text-sm outline-none focus-ring w-full"
                style={inputStyle}
              />
            </Field>
            <Field label="Full Address" hint="Optional">
              <input
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                placeholder="Street, building, ..."
                className="px-3 py-2 rounded-md text-sm outline-none focus-ring w-full"
                style={inputStyle}
              />
            </Field>
            <Field label="Notes" hint="Optional">
              <textarea
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Preferences, payment terms, ..."
                rows={3}
                className="px-3 py-2 rounded-md text-sm outline-none focus-ring resize-none w-full"
                style={inputStyle}
              />
            </Field>
          </div>

          {formError && (
            <div
              className="mt-4 px-3 py-2 rounded-md text-xs flex items-center gap-2"
              style={{ background: 'var(--stage-contract)15', color: 'var(--stage-contract)', border: '1px solid var(--stage-contract)40' }}
            >
              <Icons.alert /> {formError}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

/* ─── Small UI helpers ─── */
const ContactRow = ({ icon, value, copyId, copiedId, onCopy }) => (
  <div className="flex items-center gap-1.5 text-sm group" style={{ color: 'var(--ink)' }}>
    <span style={{ color: 'var(--ink-muted)' }} className="shrink-0">{icon}</span>
    <span className="whitespace-nowrap tabular-nums truncate">{value}</span>
    <CopyButton value={value} id={copyId} copiedId={copiedId} onCopy={onCopy} className="opacity-50 group-hover:opacity-100" />
  </div>
);

const Stat = ({ label, value, icon: Icon, accent }) => (
  <div className="p-3 rounded-lg" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
    <div className="flex items-center gap-1.5 text-xs mb-1" style={{ color: 'var(--ink-muted)' }}>
      {Icon && <Icon />} {label}
    </div>
    <div className="text-base sm:text-lg font-bold tabular-nums truncate" style={{ color: accent }}>{value}</div>
  </div>
);

const StatChip = ({ label, value, color }) => (
  <div
    className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-md shrink-0"
    style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
  >
    <span className="text-xs whitespace-nowrap" style={{ color: 'var(--ink-muted)' }}>{label}</span>
    <span className="text-sm font-bold tabular-nums" style={{ color: color || 'var(--ink)' }}>{value}</span>
  </div>
);