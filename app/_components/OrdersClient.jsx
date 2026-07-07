'use client';

import { useState, useMemo, useEffect } from 'react';

/* ─── Icons (kept same size as your original) ─── */
const Icons = {
  search: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  x: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
  plus: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>,
  more: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>,
  phone: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  mapPin: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
  package: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>,
  edit: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>,
  print: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>,
  trash: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>,
  calendar: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>,
  check: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  arrowRight: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>,
  arrowLeft: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>,
};

/* ─── Data ─── */
const WORKERS_LIST = ['R. Said', 'A. Benali', 'K. Amrani', 'M. Draoui', 'L. Zertal', 'Y. Kessous'];

const ALL_ORDERS = [
  { id: '#2041', client: 'A. Benali', phone: '0551 23 45 67', address: 'Hydra, Algiers', project: 'Kitchen cabinets + island', stage: 'IN_PRODUCTION', worker: 'R. Said', amount: 45000, paid: 22500, dueDate: '2026-07-05', created: '2026-06-20', items: [{ name: 'Cabinet carcasses', qty: 12, unit: 'pcs', l: 60, w: 60, h: 80 }, { name: 'Island frame', qty: 1, unit: 'pcs', l: 120, w: 80, h: 90 }, { name: 'Hardware set', qty: 1, unit: 'set', l: 0, w: 0, h: 0 }], payments: [{ date: '2026-06-20', amount: 15000 }, { date: '2026-06-25', amount: 7500 }] },
  { id: '#2038', client: 'K. Amrani', phone: '0770 88 99 00', address: 'Bab Ezzouar', project: 'Dining table + 6 chairs', stage: 'IN_PRODUCTION', worker: 'A. Benali', amount: 62000, paid: 31000, dueDate: '2026-07-06', created: '2026-06-15', items: [{ name: 'Oak table top', qty: 1, unit: 'pcs', l: 180, w: 90, h: 4 }, { name: 'Chair frames', qty: 6, unit: 'pcs', l: 45, w: 45, h: 100 }, { name: 'Upholstery', qty: 6, unit: 'm²', l: 0, w: 0, h: 0 }], payments: [{ date: '2026-06-15', amount: 31000 }] },
  { id: '#2045', client: 'S. Merzoug', phone: '0540 11 22 33', address: 'Staoueli', project: 'Full kitchen renovation', stage: 'CONTRACT', worker: 'Unassigned', amount: 128000, paid: 0, dueDate: '2026-07-20', created: '2026-07-01', items: [{ name: 'Cabinets', qty: 20, unit: 'pcs', l: 60, w: 60, h: 80 }, { name: 'Countertop', qty: 1, unit: 'pcs', l: 300, w: 60, h: 4 }, { name: 'Sink & faucet', qty: 1, unit: 'set', l: 0, w: 0, h: 0 }], payments: [] },
  { id: '#2042', client: 'F. Hadj', phone: '0555 44 55 66', address: 'El Biar', project: 'Wardrobe + vanity', stage: 'READY_TO_DELIVER', worker: 'R. Said', amount: 34000, paid: 34000, dueDate: '2026-07-05', created: '2026-06-25', items: [{ name: 'Wardrobe carcass', qty: 1, unit: 'pcs', l: 200, w: 60, h: 240 }, { name: 'Mirror door', qty: 2, unit: 'pcs', l: 40, w: 120, h: 2 }, { name: 'Drawers', qty: 4, unit: 'pcs', l: 80, w: 50, h: 20 }], payments: [{ date: '2026-06-25', amount: 34000 }] },
  { id: '#2035', client: 'M. Boudiaf', phone: '0661 77 88 99', address: 'Oran — Es Sénia', project: 'Office desk set', stage: 'COMPLETED', worker: 'M. Draoui', amount: 28000, paid: 28000, dueDate: '2026-06-28', created: '2026-06-10', items: [{ name: 'Desk frame', qty: 1, unit: 'pcs', l: 160, w: 80, h: 75 }, { name: 'Drawer units', qty: 2, unit: 'pcs', l: 40, w: 50, h: 60 }], payments: [{ date: '2026-06-10', amount: 28000 }] },
  { id: '#2048', client: 'L. Zertal', phone: '0790 12 34 56', address: 'Constantine', project: 'Bookshelves x3', stage: 'APPOINTMENT', worker: 'Unassigned', amount: 18500, paid: 0, dueDate: '2026-07-12', created: '2026-07-03', items: [{ name: 'Shelf units', qty: 3, unit: 'pcs', l: 100, w: 30, h: 200 }], payments: [] },
  { id: '#2040', client: 'Y. Kessous', phone: '0550 98 76 54', address: 'Boumerdès', project: 'TV wall unit', stage: 'IN_PRODUCTION', worker: 'K. Amrani', amount: 52000, paid: 26000, dueDate: '2026-07-08', created: '2026-06-22', items: [{ name: 'Wall frame', qty: 1, unit: 'pcs', l: 300, w: 40, h: 200 }, { name: 'Floating shelves', qty: 4, unit: 'pcs', l: 80, w: 25, h: 4 }, { name: 'LED strip', qty: 2, unit: 'm', l: 0, w: 0, h: 0 }], payments: [{ date: '2026-06-22', amount: 26000 }] },
  { id: '#2032', client: 'R. Larbi', phone: '0777 33 44 55', address: 'Blida', project: 'Bathroom vanity', stage: 'COMPLETED', worker: 'A. Benali', amount: 22000, paid: 22000, dueDate: '2026-06-25', created: '2026-06-05', items: [{ name: 'Vanity carcass', qty: 1, unit: 'pcs', l: 100, w: 50, h: 80 }, { name: 'Marble top', qty: 1, unit: 'pcs', l: 100, w: 50, h: 3 }], payments: [{ date: '2026-06-05', amount: 22000 }] },
  { id: '#2049', client: 'N. Hamidi', phone: '0560 66 77 88', address: 'Tipaza', project: 'Outdoor kitchen', stage: 'APPOINTMENT', worker: 'Unassigned', amount: 95000, paid: 0, dueDate: '2026-07-25', created: '2026-07-04', items: [{ name: 'Weatherproof cabinets', qty: 8, unit: 'pcs', l: 60, w: 60, h: 80 }, { name: 'Grill station', qty: 1, unit: 'pcs', l: 120, w: 70, h: 90 }, { name: 'Concrete top', qty: 1, unit: 'pcs', l: 250, w: 80, h: 5 }], payments: [] },
  { id: '#2039', client: 'D. Mansouri', phone: '0544 99 00 11', address: 'Algiers — Bir Mourad Raïs', project: 'Closet system', stage: 'CONTRACT', worker: 'Unassigned', amount: 41000, paid: 15000, dueDate: '2026-07-15', created: '2026-06-18', items: [{ name: 'Closet frames', qty: 3, unit: 'pcs', l: 120, w: 60, h: 240 }, { name: 'Shelving', qty: 6, unit: 'pcs', l: 115, w: 30, h: 2 }, { name: 'Shoe rack', qty: 2, unit: 'pcs', l: 80, w: 30, h: 40 }], payments: [{ date: '2026-06-18', amount: 15000 }] },
];

const STATUSES = ['All', 'APPOINTMENT', 'CONTRACT', 'IN_PRODUCTION', 'READY_TO_DELIVER', 'COMPLETED'];

/* ─── Reusable UI (Original style, slightly bigger text) ─── */
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
    <span className="inline-flex items-center gap-1.5 font-medium rounded-md" style={{ background: `${s.color}15`, color: s.color, padding: size === 'lg' ? '6px 14px' : '4px 10px', fontSize: size === 'lg' ? '15px' : '13px' }}>
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
          <div className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold border-2 transition-colors ${i < idx ? 'bg-green-500 border-green-500 text-white' : i === idx ? 'border-amber-500 text-amber-600 bg-white' : 'border-gray-300 text-gray-400 bg-white'}`}>
            {i < idx ? <Check /> : i + 1}
          </div>
          {i < stages.length - 1 && <div className={`h-0.5 flex-1 mx-1 ${i < idx ? 'bg-green-500' : 'bg-gray-200'}`} />}
        </div>
      ))}
    </div>
  );
};

/* ─── Modals ─── */
const Modal = ({ isOpen, onClose, title, children, maxWidth = '600px' }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
      <div className="rounded-lg shadow-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col" style={{ maxWidth, background: 'var(--surface)', border: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b sticky top-0 z-10" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          <h2 className="text-lg font-bold" style={{ color: 'var(--ink)' }}>{title}</h2>
          <button onClick={onClose} className="p-1 rounded-md hover:opacity-70" style={{ color: 'var(--ink-muted)' }}><Icons.x /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

const AssignWorkerModal = ({ isOpen, onClose, onAssign, currentWorker }) => {
  const [search, setSearch] = useState('');
  const filtered = WORKERS_LIST.filter(w => w.toLowerCase().includes(search.toLowerCase()) && w !== currentWorker);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Worker" maxWidth="400px">
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-3 py-2 rounded-md" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
          <Icons.search />
          <input type="text" placeholder="Search workers..." className="bg-transparent outline-none w-full text-sm" style={{ color: 'var(--ink)' }} value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {filtered.map(worker => (
            <button key={worker} onClick={() => onAssign(worker)} className="w-full flex items-center gap-3 p-3 rounded-md transition-colors text-left hover:brightness-110" style={{ border: '1px solid var(--border)', background: 'var(--bg)' }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>{worker.charAt(0)}</div>
              <div className="flex-1">
                <div className="font-medium text-sm" style={{ color: 'var(--ink)' }}>{worker}</div>
                <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>Carpenter</div>
              </div>
              <Icons.arrowRight />
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
};

const OrderFormModal = ({ isOpen, onClose, onSave, initialData = null }) => {
  const [formData, setFormData] = useState({
    client: '', phone: '', address: '', project: '', amount: '', dueDate: '', stage: 'APPOINTMENT', worker: 'Unassigned',
    items: [{ name: '', qty: 1, unit: 'pcs', l: '', w: '', h: '' }], payments: []
  });

  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData, amount: initialData.amount.toString(), items: initialData.items || [], payments: initialData.payments || [] });
    } else {
      setFormData({ client: '', phone: '', address: '', project: '', amount: '', dueDate: '', stage: 'APPOINTMENT', worker: 'Unassigned', items: [{ name: '', qty: 1, unit: 'pcs', l: '', w: '', h: '' }], payments: [] });
    }
  }, [initialData, isOpen]);

  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData(prev => ({ ...prev, items: newItems }));
  };
  const addItem = () => setFormData(prev => ({ ...prev, items: [...prev.items, { name: '', qty: 1, unit: 'pcs', l: '', w: '', h: '' }] }));
  const removeItem = (index) => setFormData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...formData, amount: Number(formData.amount), items: formData.items.filter(i => i.name), created: initialData ? initialData.created : new Date().toISOString().split('T')[0], id: initialData ? initialData.id : `#${Math.floor(Math.random() * 9000) + 1000}` };
    onSave(data);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Order" : "Create New Order"} maxWidth="700px">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--ink-muted)' }}>Client Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--ink-muted)' }}>Client Name</label>
              <input required className="w-full px-3 py-2 rounded-md text-sm outline-none" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--ink)' }} value={formData.client} onChange={e => handleChange('client', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--ink-muted)' }}>Phone</label>
              <input required className="w-full px-3 py-2 rounded-md text-sm outline-none" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--ink)' }} value={formData.phone} onChange={e => handleChange('phone', e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--ink-muted)' }}>Address</label>
              <input required className="w-full px-3 py-2 rounded-md text-sm outline-none" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--ink)' }} value={formData.address} onChange={e => handleChange('address', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--ink-muted)' }}>Project Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--ink-muted)' }}>Project Description</label>
              <input required className="w-full px-3 py-2 rounded-md text-sm outline-none" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--ink)' }} value={formData.project} onChange={e => handleChange('project', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--ink-muted)' }}>Total Amount (DZD)</label>
              <input required type="number" className="w-full px-3 py-2 rounded-md text-sm outline-none" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--ink)' }} value={formData.amount} onChange={e => handleChange('amount', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--ink-muted)' }}>Due Date</label>
              <input required type="date" className="w-full px-3 py-2 rounded-md text-sm outline-none" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--ink)' }} value={formData.dueDate} onChange={e => handleChange('dueDate', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--ink-muted)' }}>Stage</label>
              <select className="w-full px-3 py-2 rounded-md text-sm outline-none" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--ink)' }} value={formData.stage} onChange={e => handleChange('stage', e.target.value)}>
                {STATUSES.filter(s => s !== 'All').map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--ink-muted)' }}>Worker</label>
              <select className="w-full px-3 py-2 rounded-md text-sm outline-none" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--ink)' }} value={formData.worker} onChange={e => handleChange('worker', e.target.value)}>
                <option value="Unassigned">Unassigned</option>
                {WORKERS_LIST.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--ink-muted)' }}>Items & Measurements</h3>
            <button type="button" onClick={addItem} className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-md" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}><Icons.plus /> Add Item</button>
          </div>
          <div className="space-y-2">
            {formData.items.map((item, index) => (
              <div key={index} className="p-3 rounded-md space-y-2" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                <div className="flex gap-2">
                  <input placeholder="Item Name" className="flex-1 px-3 py-2 rounded-md text-sm outline-none" style={{ border: '1px solid var(--border)', color: 'var(--ink)', background: 'var(--surface)' }} value={item.name} onChange={e => handleItemChange(index, 'name', e.target.value)} />
                  <button type="button" onClick={() => removeItem(index)} className="p-2 rounded-md text-red-500 hover:opacity-70"><Icons.trash /></button>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  <input type="number" placeholder="Qty" className="px-2 py-2 rounded-md text-sm outline-none text-center" style={{ border: '1px solid var(--border)', color: 'var(--ink)', background: 'var(--surface)' }} value={item.qty} onChange={e => handleItemChange(index, 'qty', Number(e.target.value))} />
                  <select className="px-2 py-2 rounded-md text-sm outline-none" style={{ border: '1px solid var(--border)', color: 'var(--ink)', background: 'var(--surface)' }} value={item.unit} onChange={e => handleItemChange(index, 'unit', e.target.value)}>
                    <option value="pcs">pcs</option><option value="m">m</option><option value="m²">m²</option><option value="set">set</option>
                  </select>
                  <input type="number" placeholder="L" className="px-2 py-2 rounded-md text-sm outline-none text-center" style={{ border: '1px solid var(--border)', color: 'var(--ink)', background: 'var(--surface)' }} value={item.l} onChange={e => handleItemChange(index, 'l', Number(e.target.value))} />
                  <input type="number" placeholder="W" className="px-2 py-2 rounded-md text-sm outline-none text-center" style={{ border: '1px solid var(--border)', color: 'var(--ink)', background: 'var(--surface)' }} value={item.w} onChange={e => handleItemChange(index, 'w', Number(e.target.value))} />
                  <input type="number" placeholder="H" className="px-2 py-2 rounded-md text-sm outline-none text-center" style={{ border: '1px solid var(--border)', color: 'var(--ink)', background: 'var(--surface)' }} value={item.h} onChange={e => handleItemChange(index, 'h', Number(e.target.value))} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3" style={{ borderTop: '1px solid var(--border)' }}>
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm font-medium" style={{ color: 'var(--ink-muted)' }}>Cancel</button>
          <button type="submit" className="px-4 py-2 rounded-md text-sm font-bold text-white" style={{ background: 'var(--accent)' }}>{initialData ? 'Save Changes' : 'Create Order'}</button>
        </div>
      </form>
    </Modal>
  );
};

/* ─── Main ─── */
export default function OrdersClient() {
  const [orders, setOrders] = useState(ALL_ORDERS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedId, setSelectedId] = useState(ALL_ORDERS[0].id);
  const [sortKey, setSortKey] = useState('created');
  const [sortDir, setSortDir] = useState('desc');
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assigningOrderId, setAssigningOrderId] = useState(null);

  const today = new Date().setHours(0,0,0,0);

  const filtered = useMemo(() => {
    let rows = orders.filter(o => {
      const haystack = `${o.id} ${o.client} ${o.project}`.toLowerCase();
      return haystack.includes(search.toLowerCase()) && (statusFilter === 'All' || o.stage === statusFilter);
    });
    rows.sort((a, b) => {
      let av = a[sortKey], bv = b[sortKey];
      if (typeof av === 'string') { av = av.toLowerCase(); bv = bv.toLowerCase(); }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return rows;
  }, [search, statusFilter, sortKey, sortDir, orders]);

  const selected = orders.find(o => o.id === selectedId) || orders[0];
  const totalAmount = filtered.reduce((sum, o) => sum + o.amount, 0);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const handleCreateOrder = (newOrder) => { setOrders(prev => [newOrder, ...prev]); setSelectedId(newOrder.id); };
  const handleUpdateOrder = (updatedOrder) => { setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o)); };
  const handleAssignWorker = (workerName) => {
    setOrders(prev => prev.map(o => o.id === assigningOrderId ? { ...o, worker: workerName, stage: o.stage === 'APPOINTMENT' ? 'CONTRACT' : o.stage } : o));
    setIsAssignOpen(false);
  };
  const openAssignModal = (orderId) => { setAssigningOrderId(orderId); setIsAssignOpen(true); };

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <span className="ml-1" style={{ color: 'var(--ink-muted)', fontSize: 10 }}>↕</span>;
    return <span className="ml-1" style={{ color: 'var(--accent)', fontSize: 10 }}>{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="flex h-full" style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
      
      {/* Mobile Detail Overlay */}
      {isMobileDetailOpen && (
        <div className="fixed inset-0 z-40 flex flex-col overflow-y-auto md:hidden" style={{ background: 'var(--surface)' }}>
          <div className="sticky top-0 z-10 flex items-center gap-3 p-4 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
            <button onClick={() => setIsMobileDetailOpen(false)} className="p-2 rounded-md hover:opacity-70" style={{ color: 'var(--ink-muted)' }}><Icons.arrowLeft /></button>
            <h2 className="text-base font-bold" style={{ color: 'var(--ink)' }}>Order Details</h2>
          </div>
          <OrderDetailPanel order={selected} today={today} onEdit={() => setIsEditOpen(true)} onAssign={openAssignModal} />
        </div>
      )}

      <div className="flex flex-col md:flex-row w-full h-full overflow-hidden">
        {/* Left: Table + Filters */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="flex flex-col gap-3 p-4 shrink-0" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-bold" style={{ color: 'var(--ink)' }}>Orders</h1>
              <button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-1.5 text-sm font-bold px-3 py-2 rounded-md text-white" style={{ background: 'var(--accent)' }}><Icons.plus /> New</button>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-md flex-1" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                <Icons.search />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders..." className="bg-transparent text-sm outline-none w-full" style={{ color: 'var(--ink)' }} />
                {search && <button onClick={() => setSearch('')} className="p-0.5" style={{ color: 'var(--ink-muted)' }}><Icons.x /></button>}
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {STATUSES.map(s => {
                const active = statusFilter === s;
                const count = s === 'All' ? orders.length : orders.filter(o => o.stage === s).length;
                const stageColor = s === 'All' ? 'var(--ink-muted)' : { APPOINTMENT: 'var(--stage-appointment)', CONTRACT: 'var(--stage-contract)', IN_PRODUCTION: 'var(--stage-production)', READY_TO_DELIVER: 'var(--stage-ready)', COMPLETED: 'var(--stage-completed)' }[s];
                return (
                  <button key={s} onClick={() => setStatusFilter(s)} className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-md transition-colors whitespace-nowrap" style={{ background: active ? `${stageColor}15` : 'transparent', color: active ? stageColor : 'var(--ink-muted)', border: `1px solid ${active ? `${stageColor}30` : 'var(--border)'}` }}>
                    {s !== 'All' && <span className="w-1.5 h-1.5 rounded-full" style={{ background: stageColor }} />}
                    {s === 'All' ? 'All' : s.replace(/_/g, ' ')}
                    <span className="ml-1 px-1.5 py-0.5 rounded text-[10px]" style={{ background: 'var(--bg)', color: 'var(--ink-muted)' }}>{count}</span>
                  </button>
                );
              })}
            </div>

            <div className="text-xs font-medium" style={{ color: 'var(--ink-muted)' }}>{filtered.length} orders · {totalAmount.toLocaleString()} DZD</div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left text-sm hidden md:table">
              <thead className="sticky top-0 z-10" style={{ background: 'var(--surface-2)' }}>
                <tr>
                  {[{ key: 'id', label: 'Order' }, { key: 'client', label: 'Client' }, { key: null, label: 'Project' }, { key: 'stage', label: 'Status' }, { key: 'worker', label: 'Worker' }, { key: 'amount', label: 'Amount', right: true }, { key: 'dueDate', label: 'Due' }].map(col => (
                    <th key={col.label} className={`px-4 py-3 text-xs font-bold uppercase tracking-wider ${col.key ? 'cursor-pointer select-none' : ''}`} style={{ color: 'var(--ink-muted)' }} onClick={col.key ? () => toggleSort(col.key) : undefined}>
                      <span className={col.right ? 'flex justify-end items-center' : 'flex items-center'}>{col.label} {col.key && <SortIcon col={col.key} />}</span>
                    </th>
                  ))}
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => {
                  const isSel = selectedId === o.id;
                  const isOverdue = new Date(o.dueDate).getTime() < today && o.stage !== 'COMPLETED';
                  return (
                    <tr key={o.id} onClick={() => { setSelectedId(o.id); setIsMobileDetailOpen(true); }} className="cursor-pointer transition-colors" style={{ background: isSel ? 'var(--accent-soft)' : 'transparent', borderTop: '1px solid var(--border)' }}>
                      <td className="px-4 py-3 font-bold">{o.id}</td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-sm">{o.client}</div>
                        <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>{o.phone}</div>
                      </td>
                      <td className="px-4 py-3"><div className="text-sm truncate max-w-[180px]">{o.project}</div></td>
                      <td className="px-4 py-3"><StageBadge stage={o.stage} /></td>
                      <td className="px-4 py-3">
                        {o.worker === 'Unassigned' ? (
                          <button onClick={(e) => { e.stopPropagation(); openAssignModal(o.id); }} className="text-[10px] font-bold px-2 py-1 rounded-md text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 transition-colors">Assign</button>
                        ) : (<span style={{ color: 'var(--ink)' }}>{o.worker}</span>)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold tabular-nums">{o.amount.toLocaleString()} DZD</td>
                      <td className="px-4 py-3"><span className={`text-xs ${isOverdue ? 'font-bold' : ''}`} style={{ color: isOverdue ? '#ef4444' : 'var(--ink-muted)' }}>{o.dueDate}</span></td>
                      <td className="px-4 py-3 text-center"><button className="p-1" onClick={e => e.stopPropagation()} style={{ color: 'var(--ink-muted)' }}><Icons.more /></button></td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && <tr><td colSpan={8} className="px-4 py-12 text-center text-sm" style={{ color: 'var(--ink-muted)' }}>No orders match your filters.</td></tr>}
              </tbody>
            </table>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y" style={{ borderColor: 'var(--border)' }}>
              {filtered.map(o => {
                const isOverdue = new Date(o.dueDate).getTime() < today && o.stage !== 'COMPLETED';
                return (
                  <div key={o.id} onClick={() => { setSelectedId(o.id); setIsMobileDetailOpen(true); }} className="p-4 cursor-pointer active:opacity-70" style={{ background: selectedId === o.id ? 'var(--accent-soft)' : 'var(--surface)' }}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold text-sm">{o.id} <span className="font-normal" style={{ color: 'var(--ink-muted)' }}>· {o.client}</span></div>
                      <StageBadge stage={o.stage} />
                    </div>
                    <div className="text-sm mb-2 truncate" style={{ color: 'var(--ink)' }}>{o.project}</div>
                    <div className="flex justify-between items-center text-xs">
                      <span style={{ color: isOverdue ? '#ef4444' : 'var(--ink-muted)' }}>{isOverdue ? 'Overdue: ' : ''}{o.dueDate}</span>
                      <span className="font-bold">{o.amount.toLocaleString()} DZD</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Detail Panel (Desktop) */}
        <div className="hidden md:flex w-[400px] shrink-0 flex-col overflow-y-auto" style={{ borderLeft: '1px solid var(--border)', background: 'var(--surface)' }}>
          <OrderDetailPanel order={selected} today={today} onEdit={() => setIsEditOpen(true)} onAssign={openAssignModal} />
        </div>
      </div>

      {/* Modals */}
      <OrderFormModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSave={handleCreateOrder} />
      <OrderFormModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} onSave={handleUpdateOrder} initialData={selected} />
      <AssignWorkerModal isOpen={isAssignOpen} onClose={() => setIsAssignOpen(false)} onAssign={handleAssignWorker} currentWorker={orders.find(o => o.id === assigningOrderId)?.worker} />
    </div>
  );
}

/* ─── Order Detail Panel ─── */
function OrderDetailPanel({ order, today, onEdit, onAssign }) {
  const isOverdue = new Date(order.dueDate).getTime() < today && order.stage !== 'COMPLETED';
  const progress = order.amount > 0 ? (order.paid / order.amount) * 100 : 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold" style={{ color: 'var(--ink)' }}>{order.id}</h2>
          <StageBadge stage={order.stage} size="lg" />
        </div>
        <p className="text-sm mb-4" style={{ color: 'var(--ink-muted)' }}>{order.project}</p>
        <Stepper currentStage={order.stage} />
        <div className="flex justify-between mt-2 text-[10px] uppercase tracking-wider font-bold" style={{ color: 'var(--ink-muted)' }}>
          <span>Appt</span><span>Contract</span><span style={{ color: order.stage === 'IN_PRODUCTION' ? 'var(--accent)' : undefined }}>Production</span><span>Ready</span><span>Done</span>
        </div>
      </div>

      {/* Client */}
      <div className="p-5 space-y-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: 'var(--surface-2)', color: 'var(--accent)' }}>
            {order.client.split(' ').map(n => n[0]).join('').slice(0,2)}
          </div>
          <div>
            <div className="text-sm font-bold" style={{ color: 'var(--ink)' }}>{order.client}</div>
            <div className="text-xs flex items-center gap-1" style={{ color: 'var(--ink-muted)' }}><Icons.phone /> {order.phone}</div>
          </div>
        </div>
        <div className="text-xs flex items-start gap-1" style={{ color: 'var(--ink-muted)' }}><Icons.mapPin /> {order.address}</div>
      </div>

      {/* Meta */}
      <div className="p-5 grid grid-cols-2 gap-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="p-3 rounded-lg" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
          <div className="text-xs mb-1 font-bold uppercase" style={{ color: 'var(--ink-muted)' }}>Assigned</div>
          {order.worker === 'Unassigned' ? (
            <button onClick={() => onAssign(order.id)} className="text-sm font-bold text-red-500 hover:underline">Assign Now</button>
          ) : (
            <div className="text-sm font-bold" style={{ color: 'var(--ink)' }}>{order.worker}</div>
          )}
        </div>
        <div className="p-3 rounded-lg" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
          <div className="text-xs mb-1 font-bold uppercase" style={{ color: 'var(--ink-muted)' }}>Due Date</div>
          <div className={`text-sm font-bold ${isOverdue ? 'text-red-500' : ''}`} style={{ color: isOverdue ? undefined : 'var(--ink)' }}>{isOverdue ? 'Overdue: ' : ''}{order.dueDate}</div>
        </div>
      </div>

      {/* Financial */}
      <div className="p-5 space-y-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--ink-muted)' }}>Financial</h3>
        <div className="flex justify-between text-sm"><span style={{ color: 'var(--ink-muted)' }}>Total</span><span className="font-bold">{order.amount.toLocaleString()} DZD</span></div>
        <div className="flex justify-between text-sm"><span style={{ color: 'var(--ink-muted)' }}>Paid</span><span style={{ color: 'var(--stage-completed)' }} className="font-bold">{order.paid.toLocaleString()} DZD</span></div>
        <div className="flex justify-between text-sm">
          <span style={{ color: 'var(--ink-muted)' }}>Remaining</span>
          <span className="font-bold" style={{ color: order.amount - order.paid > 0 ? 'var(--accent)' : 'var(--stage-completed)' }}>{(order.amount - order.paid).toLocaleString()} DZD</span>
        </div>
        <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
          <div className="h-full rounded-full" style={{ width: `${progress}%`, background: order.paid === order.amount ? 'var(--stage-completed)' : 'var(--accent)' }} />
        </div>

        {/* Payment History */}
        {order.payments && order.payments.length > 0 && (
          <div className="mt-3 space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--ink-muted)' }}>Payment History</h4>
            {order.payments.map((p, i) => (
              <div key={i} className="flex justify-between items-center text-xs p-2 rounded-md" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
                <span className="flex items-center gap-1" style={{ color: 'var(--ink-muted)' }}><Icons.calendar /> {p.date}</span>
                <span className="font-bold" style={{ color: 'var(--stage-completed)' }}>+ {p.amount.toLocaleString()} DZD</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Items */}
      <div className="p-5 space-y-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--ink-muted)' }}>Items & Measurements</h3>
        {order.items.map((item, i) => (
          <div key={i} className="flex items-start gap-3 text-sm p-2 rounded-md" style={{ background: 'var(--bg)' }}>
            <span style={{ color: 'var(--ink-muted)' }}><Icons.package /></span>
            <div className="flex-1">
              <div className="font-medium" style={{ color: 'var(--ink)' }}>{item.name}</div>
              <div className="text-xs mt-1 flex flex-wrap gap-2" style={{ color: 'var(--ink-muted)' }}>
                <span>Qty: {item.qty} {item.unit}</span>
                {(item.l > 0 || item.w > 0 || item.h > 0) && (
                  <span className="font-mono font-bold" style={{ color: 'var(--stage-contract)' }}>
                    {item.l > 0 && `${item.l}cm`} × {item.w > 0 && `${item.w}cm`} × {item.h > 0 && `${item.h}cm`}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="p-5 mt-auto space-y-2">
        <button onClick={onEdit} className="w-full flex items-center justify-center gap-2 text-sm font-bold px-4 py-2.5 rounded-md text-white" style={{ background: 'var(--accent)' }}>
          <Icons.edit /> Edit Order
        </button>
        <div className="flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-2 text-sm font-bold px-4 py-2.5 rounded-md" style={{ border: '1px solid var(--border)', color: 'var(--ink)' }}><Icons.print /> Print</button>
          <button className="flex-1 flex items-center justify-center gap-2 text-sm font-bold px-4 py-2.5 rounded-md text-red-600" style={{ border: '1px solid var(--border)' }}><Icons.trash /> Delete</button>
        </div>
      </div>
    </div>
  );
}