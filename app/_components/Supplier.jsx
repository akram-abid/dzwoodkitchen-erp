'use client';

import { useState } from 'react';

/* ─────────────────────────────────────────────────────────────────
   NOTE ON COLOR TOKENS
   Your dashboard currently only defines one accent (--accent, yellow)
   plus the --stage-* tokens for order stages. This page leans on a
   few more tokens so suppliers/status/stats read as distinct at a
   glance. Add these to your globals.css (adjust hex to taste):

     --accent-blue:        #4C8BF5;
     --accent-blue-soft:   rgba(76, 139, 245, 0.12);
     --accent-green:       #22C55E;
     --accent-green-soft:  rgba(34, 197, 94, 0.12);
     --accent-red:         #EF4444;
     --accent-red-soft:    rgba(239, 68, 68, 0.12);
     --accent-purple:      #8B5CF6;
     --accent-purple-soft: rgba(139, 92, 246, 0.12);

   NOTE: your original StageBadge used `${color}15` string concatenation
   to fake a tinted background (e.g. background: `${s.color}15` where
   s.color is 'var(--stage-appointment)'). That produces an invalid CSS
   value ("var(--stage-appointment)15") and silently fails — the
   background never actually applies. This file uses real *-soft
   tokens instead, which is the fix. Worth applying the same fix to
   StageBadge in your Home dashboard.

   Everything else (--ink, --ink-muted, --surface-2, --border, .panel,
   .panel-hover, .btn-primary, .btn-ghost, .badge) is reused as-is
   from your existing system.
───────────────────────────────────────────────────────────────── */

/* ─── icons ─── */
const Icons = {
  suppliers: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9 12 2l9 7"/><path d="M4 10v10a1 1 0 0 0 1 1h4v-6h6v6h4a1 1 0 0 0 1-1V10"/></svg>,
  phone: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465a2 2 0 0 1 2.828-.395l2.318 1.856a1 1 0 0 1 .06 1.508l-1.834 1.834a2 2 0 0 1-1.79.558C13.483 20.531 8.5 15.549 7.964 12.196a2 2 0 0 1 .557-1.79l1.834-1.834a1 1 0 0 1 1.508.06l1.856 2.318a2 2 0 0 1-.396 2.828l-.464.355a1 1 0 0 0-.303 1.212"/></svg>,
  receipt: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M8 7h8M8 11h8M8 15h5"/></svg>,
  wallet: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-1"/><path d="M22 12a2 2 0 0 0-2-2h-3a2 2 0 0 0 0 4h3a2 2 0 0 0 2-2Z"/></svg>,
  truck: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 18V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h1"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>,
  search: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  plus: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>,
  dots: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>,
  file: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>,
  close: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
  arrowLeft: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>,
  arrowRight: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>,
  package: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73Z"/><path d="M12 22V12"/><path d="m3.3 7 8.7 5 8.7-5"/></svg>,
};

/* ─── mock data — shaped after the `suppliers` / `purchase_orders` tables ─── */
const SUPPLIERS = [
  { id: 'SUP-001', name: 'Bois & Panneaux El Djazair', phone: '0555 12 34 56', nif: '000123456789012', rc: '16/00-1234567 B 21', ordersCount: 14, totalSpent: 412000, status: 'ACTIVE' },
  { id: 'SUP-002', name: 'Quincaillerie Amrani', phone: '0661 98 76 54', nif: '000198765432098', rc: '16/00-7654321 B 21', ordersCount: 9, totalSpent: 156500, status: 'ACTIVE' },
  { id: 'SUP-003', name: 'Peintures & Vernis Setif', phone: '0770 22 11 09', nif: '000155667788099', rc: '19/00-2233445 B 21', ordersCount: 5, totalSpent: 68000, status: 'ACTIVE' },
  { id: 'SUP-004', name: 'Ferronnerie Boudjelal', phone: '0550 44 55 66', nif: '000144556677088', rc: '16/00-9988776 B 21', ordersCount: 2, totalSpent: 21000, status: 'INACTIVE' },
  { id: 'SUP-005', name: 'Verre & Miroiterie Centre', phone: '0666 33 22 11', nif: '000133221100077', rc: '31/00-1122334 B 21', ordersCount: 7, totalSpent: 94500, status: 'ACTIVE' },
];

const RECENT_ORDERS = [
  { id: 'BC-2026-041', supplier: 'Bois & Panneaux El Djazair', amount: '38,000 DZD', status: 'PENDING', date: 'Jul 4' },
  { id: 'BC-2026-040', supplier: 'Peintures & Vernis Setif', amount: '12,400 DZD', status: 'RECEIVED', date: 'Jul 2' },
  { id: 'BC-2026-039', supplier: 'Quincaillerie Amrani', amount: '9,800 DZD', status: 'RECEIVED', date: 'Jun 30' },
  { id: 'BC-2026-038', supplier: 'Ferronnerie Boudjelal', amount: '15,200 DZD', status: 'CANCELLED', date: 'Jun 27' },
];

/* This month's invoices per supplier — from `purchases` / `purchase_orders`
   filtered to the current month, joined on supplier_id. `items` are the
   actual line items bought under that invoice (material, qty, unit price). */
const INVOICES_THIS_MONTH = {
  'SUP-001': [
    {
      ref: 'FAC-2026-0182', date: 'Jul 4', status: 'PENDING',
      items: [
        { material: 'MDF panels (18mm)', qty: 40, unit: 'panel', unitPrice: 800 },
        { material: 'Edge banding roll', qty: 6, unit: 'roll', unitPrice: 1000 },
      ],
    },
    {
      ref: 'FAC-2026-0171', date: 'Jul 1', status: 'PAID',
      items: [
        { material: 'Melamine sheets (white)', qty: 25, unit: 'sheet', unitPrice: 900 },
      ],
    },
  ],
  'SUP-002': [
    {
      ref: 'FAC-2026-0179', date: 'Jul 3', status: 'PAID',
      items: [
        { material: 'Cabinet hinges', qty: 40, unit: 'unit', unitPrice: 90 },
        { material: 'Drawer slides (45cm)', qty: 20, unit: 'pair', unitPrice: 170 },
      ],
    },
  ],
  'SUP-003': [
    {
      ref: 'FAC-2026-0180', date: 'Jul 2', status: 'PAID',
      items: [
        { material: 'Wood varnish (satin)', qty: 12, unit: 'L', unitPrice: 1033.33 },
      ],
    },
  ],
  'SUP-004': [],
  'SUP-005': [
    {
      ref: 'FAC-2026-0175', date: 'Jul 1', status: 'PAID',
      items: [
        { material: 'Cabinet glass panels (tempered)', qty: 8, unit: 'panel', unitPrice: 1775 },
      ],
    },
  ],
};

/* Full year purchase history per supplier — from `purchases`, all records
   for the current calendar year, most recent first. */
const PURCHASES_THIS_YEAR = {
  'SUP-001': [
    { date: 'Jul 4, 2026', material: 'MDF panels (18mm)', qty: '40 units', amount: 38000 },
    { date: 'Jul 1, 2026', material: 'Melamine sheets', qty: '25 units', amount: 22500 },
    { date: 'May 18, 2026', material: 'MDF panels (18mm)', qty: '30 units', amount: 28500 },
    { date: 'Apr 9, 2026', material: 'Plywood sheets', qty: '20 units', amount: 19000 },
    { date: 'Feb 22, 2026', material: 'MDF panels (18mm)', qty: '50 units', amount: 47500 },
    { date: 'Jan 14, 2026', material: 'Edge banding rolls', qty: '15 rolls', amount: 9000 },
  ],
  'SUP-002': [
    { date: 'Jul 3, 2026', material: 'Hinges, drawer slides', qty: '60 sets', amount: 6800 },
    { date: 'Apr 27, 2026', material: 'Cabinet handles', qty: '120 units', amount: 14400 },
    { date: 'Feb 3, 2026', material: 'Screws & fasteners (mixed)', qty: '1 lot', amount: 5200 },
  ],
  'SUP-003': [
    { date: 'Jul 2, 2026', material: 'Wood varnish', qty: '12 L', amount: 12400 },
    { date: 'Mar 11, 2026', material: 'Wood stain', qty: '8 L', amount: 7600 },
  ],
  'SUP-004': [
    { date: 'May 6, 2026', material: 'Steel brackets', qty: '40 units', amount: 12000 },
    { date: 'Feb 19, 2026', material: 'Steel brackets', qty: '30 units', amount: 9000 },
  ],
  'SUP-005': [
    { date: 'Jul 1, 2026', material: 'Cabinet glass panels', qty: '8 units', amount: 14200 },
    { date: 'Jun 2, 2026', material: 'Mirror sheets', qty: '10 units', amount: 18500 },
    { date: 'Mar 28, 2026', material: 'Cabinet glass panels', qty: '12 units', amount: 21300 },
  ],
};

/* ─── badges ─── */
const SupplierStatusBadge = ({ status }) => {
  const map = {
    ACTIVE: { color: 'var(--accent-green)', bg: 'var(--accent-green-soft)', label: 'Active' },
    INACTIVE: { color: 'var(--ink-muted)', bg: 'var(--surface-2)', label: 'Inactive' },
  };
  const s = map[status] || map.ACTIVE;
  return (
    <span className="badge" style={{ background: s.bg, color: s.color }}>
      <span style={{ fontSize: 10 }}>●</span> {s.label}
    </span>
  );
};

const PurchaseOrderBadge = ({ status }) => {
  const map = {
    PENDING: { color: 'var(--accent)', bg: 'var(--accent-soft)', label: 'Pending' },
    RECEIVED: { color: 'var(--accent-green)', bg: 'var(--accent-green-soft)', label: 'Received' },
    CANCELLED: { color: 'var(--accent-red)', bg: 'var(--accent-red-soft)', label: 'Cancelled' },
  };
  const s = map[status] || map.PENDING;
  return (
    <span className="badge" style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
};

const InvoiceStatusBadge = ({ status }) => {
  const map = {
    PAID: { color: 'var(--accent-green)', bg: 'var(--accent-green-soft)', label: 'Paid' },
    PENDING: { color: 'var(--accent)', bg: 'var(--accent-soft)', label: 'Pending' },
  };
  const s = map[status] || map.PENDING;
  return (
    <span className="badge" style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
};

const formatDZD = (n) => `${n.toLocaleString('en-US')} DZD`;
const invoiceTotal = (inv) => inv.items.reduce((sum, it) => sum + it.qty * it.unitPrice, 0);
const invoiceSummary = (inv) => inv.items.map((it) => it.material).join(', ');

/* ─── supplier detail modal ───
   month  -> this month's invoices
   invoice -> line items inside one clicked invoice
   year   -> full year purchase history
   'month' is the entry point; both drill-downs return to it via back arrow. */
const SupplierDetailModal = ({ supplier, onClose }) => {
  const [view, setView] = useState('month'); // 'month' | 'invoice' | 'year'
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const monthInvoices = INVOICES_THIS_MONTH[supplier.id] || [];
  const monthTotal = monthInvoices.reduce((sum, inv) => sum + invoiceTotal(inv), 0);

  const yearPurchases = PURCHASES_THIS_YEAR[supplier.id] || [];
  const yearTotal = yearPurchases.reduce((sum, p) => sum + p.amount, 0);

  const openInvoice = (inv) => { setSelectedInvoice(inv); setView('invoice'); };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,15,20,0.55)' }}
      onClick={onClose}
    >
      <div
        className="panel w-full max-w-lg max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{
                background: 'var(--accent-blue-soft)',
                color: 'var(--accent-blue)',
                boxShadow: `0 0 0 2px ${supplier.status === 'ACTIVE' ? 'var(--accent-green)' : 'var(--border)'}`,
              }}
            >
              {supplier.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">{supplier.name}</div>
              <div className="text-xs flex items-center gap-1" style={{ color: 'var(--ink-muted)' }}>
                <Icons.phone /> {supplier.phone}
              </div>
            </div>
          </div>
          <button className="btn-ghost p-1" onClick={onClose}><Icons.close /></button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1">
          {view === 'month' && (
            <>
              <div className="flex items-center justify-between px-5 pt-4 pb-2">
                <h4 className="text-sm font-semibold flex items-center gap-1.5">
                  <span style={{ color: 'var(--accent-blue)' }}><Icons.receipt /></span> Invoices — This Month
                </h4>
                <span className="text-xs font-medium" style={{ color: 'var(--ink-muted)' }}>{formatDZD(monthTotal)} total</span>
              </div>
              <div className="px-2 pb-2">
                {monthInvoices.map((inv, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-lg panel-hover cursor-pointer"
                    onClick={() => openInvoice(inv)}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--accent-blue-soft)', color: 'var(--accent-blue)' }}>
                      <Icons.file />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="text-sm font-medium truncate">{inv.ref}</span>
                        <InvoiceStatusBadge status={inv.status} />
                      </div>
                      <div className="text-xs truncate" style={{ color: 'var(--ink-muted)' }}>{invoiceSummary(inv)}</div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs font-medium" style={{ color: 'var(--ink)' }}>{formatDZD(invoiceTotal(inv))}</span>
                        <span className="text-xs" style={{ color: 'var(--ink-muted)' }}>{inv.date}</span>
                      </div>
                    </div>
                    <span className="mt-2 shrink-0" style={{ color: 'var(--ink-muted)' }}><Icons.arrowRight /></span>
                  </div>
                ))}
                {monthInvoices.length === 0 && (
                  <div className="px-3 py-8 text-center text-sm" style={{ color: 'var(--ink-muted)' }}>
                    No invoices with this supplier this month.
                  </div>
                )}
              </div>
            </>
          )}

          {view === 'invoice' && selectedInvoice && (
            <>
              <div className="flex items-center gap-2 px-5 pt-4 pb-1">
                <button className="btn-ghost p-1" onClick={() => setView('month')}><Icons.arrowLeft /></button>
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold">{selectedInvoice.ref}</h4>
                  <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>{selectedInvoice.date}</div>
                </div>
                <div className="ml-auto"><InvoiceStatusBadge status={selectedInvoice.status} /></div>
              </div>
              <div className="px-2 pt-3 pb-1">
                {selectedInvoice.items.map((it, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg panel-hover">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--accent-blue-soft)', color: 'var(--accent-blue)' }}>
                      <Icons.package />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{it.material}</div>
                      <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                        {it.qty} {it.unit}{it.qty > 1 ? 's' : ''} × {formatDZD(it.unitPrice)}
                      </div>
                    </div>
                    <span className="text-sm font-medium shrink-0" style={{ color: 'var(--ink)' }}>
                      {formatDZD(it.qty * it.unitPrice)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="px-5 py-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--border)' }}>
                <span className="text-xs" style={{ color: 'var(--ink-muted)' }}>{selectedInvoice.items.length} items</span>
                <span className="text-sm font-semibold" style={{ color: 'var(--accent-blue)' }}>{formatDZD(invoiceTotal(selectedInvoice))}</span>
              </div>
            </>
          )}

          {view === 'year' && (
            <>
              <div className="flex items-center gap-2 px-5 pt-4 pb-2">
                <button className="btn-ghost p-1" onClick={() => setView('month')}><Icons.arrowLeft /></button>
                <h4 className="text-sm font-semibold flex items-center gap-1.5">
                  <span style={{ color: 'var(--accent-purple)' }}><Icons.package /></span> Full Year Purchase History — 2026
                </h4>
              </div>
              <div className="px-5 pb-2 flex items-center justify-between">
                <span className="text-xs" style={{ color: 'var(--ink-muted)' }}>{yearPurchases.length} purchases</span>
                <span className="text-xs font-medium" style={{ color: 'var(--accent-purple)' }}>{formatDZD(yearTotal)} total</span>
              </div>
              <div className="px-2 pb-2">
                {yearPurchases.map((p, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg panel-hover">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--accent-purple-soft)', color: 'var(--accent-purple)' }}>
                      <Icons.package />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{p.material}</div>
                      <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>{p.qty}</div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs font-medium" style={{ color: 'var(--ink)' }}>{formatDZD(p.amount)}</span>
                        <span className="text-xs" style={{ color: 'var(--ink-muted)' }}>{p.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {yearPurchases.length === 0 && (
                  <div className="px-3 py-8 text-center text-sm" style={{ color: 'var(--ink-muted)' }}>
                    No purchases recorded from this supplier this year.
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {view === 'month' && (
          <div className="px-5 py-3" style={{ borderTop: '1px solid var(--border)' }}>
            <button
              className="btn-ghost text-xs w-full justify-center flex items-center gap-1"
              onClick={() => setView('year')}
            >
              See everything bought this year <Icons.arrowRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default function SuppliersPage() {
  const [query, setQuery] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const filtered = SUPPLIERS.filter(s =>
    s.name.toLowerCase().includes(query.toLowerCase()) ||
    s.phone.includes(query)
  );

  const activeCount = SUPPLIERS.filter(s => s.status === 'ACTIVE').length;
  const totalSpent = SUPPLIERS.reduce((sum, s) => sum + s.totalSpent, 0);
  const pendingOrders = RECENT_ORDERS.filter(o => o.status === 'PENDING').length;

  return (
    <div className="p-6">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold mb-1">Suppliers</h2>
          <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
            {SUPPLIERS.length} suppliers · {activeCount} active
          </p>
        </div>
        <button className="btn-primary text-sm">
          <Icons.plus /> New Supplier
        </button>
      </div>

      {/* Stats — a bit more color variety than the Home stat row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Suppliers', value: SUPPLIERS.length, sub: `${activeCount} active`, icon: Icons.suppliers, color: 'var(--accent-blue)' },
          { label: 'Purchase Orders', value: RECENT_ORDERS.length, sub: 'this month', icon: Icons.receipt, color: 'var(--accent-purple)' },
          { label: 'Total Spent', value: formatDZD(totalSpent), sub: 'all time', icon: Icons.wallet, color: 'var(--accent-green)' },
          { label: 'Pending Deliveries', value: pendingOrders, sub: 'awaiting receipt', icon: Icons.truck, color: 'var(--accent)' },
        ].map((stat, i) => (
          <div key={i} className="panel p-4 panel-hover cursor-default" style={{ borderTop: `2px solid ${stat.color}` }}>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-medium" style={{ color: 'var(--ink-muted)' }}>{stat.label}</div>
              <div style={{ color: stat.color }}><stat.icon /></div>
            </div>
            <div className="text-2xl font-bold mb-1" style={{ color: 'var(--ink)' }}>{stat.value}</div>
            <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main column — suppliers table */}
        <div className="col-span-2 space-y-6">
          <div className="panel">
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <span style={{ color: 'var(--accent-blue)' }}><Icons.suppliers /></span> All Suppliers
              </h3>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'var(--surface-2)' }}>
                <Icons.search />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search suppliers..."
                  className="text-xs bg-transparent outline-none w-36"
                  style={{ color: 'var(--ink)' }}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr style={{ background: 'var(--surface-2)' }}>
                    <th className="px-5 py-3 text-xs font-medium" style={{ color: 'var(--ink-muted)' }}>Supplier</th>
                    <th className="px-5 py-3 text-xs font-medium" style={{ color: 'var(--ink-muted)' }}>Contact</th>
                    <th className="px-5 py-3 text-xs font-medium" style={{ color: 'var(--ink-muted)' }}>NIF / RC</th>
                    <th className="px-5 py-3 text-xs font-medium text-right" style={{ color: 'var(--ink-muted)' }}>Orders</th>
                    <th className="px-5 py-3 text-xs font-medium text-right" style={{ color: 'var(--ink-muted)' }}>Total Spent</th>
                    <th className="px-5 py-3 text-xs font-medium" style={{ color: 'var(--ink-muted)' }}>Status</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, i) => (
                    <tr
                      key={i}
                      className="panel-hover cursor-pointer transition-colors"
                      style={{ borderTop: '1px solid var(--border)' }}
                      onClick={() => setSelectedSupplier(s)}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                            style={{
                              background: 'var(--accent-blue-soft)',
                              color: 'var(--accent-blue)',
                              boxShadow: `0 0 0 2px ${s.status === 'ACTIVE' ? 'var(--accent-green)' : 'var(--border)'}`,
                            }}
                          >
                            {s.name.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-medium">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5" style={{ color: 'var(--ink-muted)' }}>
                          <Icons.phone /> {s.phone}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs" style={{ color: 'var(--ink-muted)' }}>
                        <div>{s.nif}</div>
                        <div>{s.rc}</div>
                      </td>
                      <td className="px-5 py-3 text-right">{s.ordersCount}</td>
                      <td className="px-5 py-3 text-right font-medium">{formatDZD(s.totalSpent)}</td>
                      <td className="px-5 py-3"><SupplierStatusBadge status={s.status} /></td>
                      <td className="px-5 py-3">
                        <button
                          className="btn-ghost p-1"
                          onClick={(e) => { e.stopPropagation(); setSelectedSupplier(s); }}
                        >
                          <Icons.dots />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-8 text-center text-sm" style={{ color: 'var(--ink-muted)' }}>
                        No suppliers match "{query}".
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
          {/* Recent purchase orders (bon de commande) */}
          <div className="panel">
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <span style={{ color: 'var(--accent-purple)' }}><Icons.receipt /></span> Recent Purchase Orders
              </h3>
              <button className="btn-ghost text-xs">View all</button>
            </div>
            <div className="p-2">
              {RECENT_ORDERS.map((o, i) => {
                const tint = { PENDING: 'var(--accent)', RECEIVED: 'var(--accent-green)', CANCELLED: 'var(--accent-red)' }[o.status];
                const tintSoft = { PENDING: 'var(--accent-soft)', RECEIVED: 'var(--accent-green-soft)', CANCELLED: 'var(--accent-red-soft)' }[o.status];
                return (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg panel-hover cursor-pointer">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: tintSoft, color: tint }}>
                    <Icons.file />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="text-sm font-medium truncate">{o.id}</span>
                      <PurchaseOrderBadge status={o.status} />
                    </div>
                    <div className="text-xs truncate" style={{ color: 'var(--ink-muted)' }}>{o.supplier}</div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-medium" style={{ color: 'var(--ink)' }}>{o.amount}</span>
                      <span className="text-xs" style={{ color: 'var(--ink-muted)' }}>{o.date}</span>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          </div>

          {/* Quick actions */}
          <div className="panel p-5">
            <h3 className="text-sm font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="btn-primary w-full justify-center text-sm">
                <Icons.plus /> New Purchase Order
              </button>
              <button className="btn-ghost w-full justify-center text-sm border" style={{ borderColor: 'var(--border)' }}>
                Record a Payment to Supplier
              </button>
              <button className="btn-ghost w-full justify-center text-sm border" style={{ borderColor: 'var(--border)' }}>
                Export Supplier List
              </button>
            </div>
          </div>

          {/* Spend alert — mirrors the "Production Alert" card style, purple accent for variety */}
          <div className="p-5 rounded-lg" style={{ background: 'var(--accent-purple-soft)', border: '1px solid rgba(139,92,246,0.2)' }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full" style={{ background: 'var(--accent-purple)' }} />
              <span className="text-xs font-semibold" style={{ color: 'var(--accent-purple)' }}>Top Supplier</span>
            </div>
            <p className="text-sm mb-1" style={{ color: 'var(--ink)' }}>Bois &amp; Panneaux El Djazair</p>
            <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>412,000 DZD spent across 14 orders — your highest-volume supplier this year.</p>
          </div>
        </div>
      </div>

      {selectedSupplier && (
        <SupplierDetailModal
          supplier={selectedSupplier}
          onClose={() => setSelectedSupplier(null)}
        />
      )}
    </div>
  );
}