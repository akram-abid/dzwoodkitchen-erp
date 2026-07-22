'use client';

import { useEffect, useMemo, useState } from 'react';
import { getSupplierPurchasesClient } from '../../lib/api_helpers/supplier.js';

/* ═══════════════════════════════════════════════════════════════════
   Supplier Purchases Modal
   ─────────────────────────
   Click a supplier → this popup opens with two views:

     [This Month]  [This Year]

   • Month view  → purchases in the current calendar month.
   • Year view   → purchases in the selected year, with a 12-button
                    month strip + "All" so you can jump between months
                    without leaving the modal.

   Data source: `material_purchases` (the supplier's ledger of actual
   material buys, with line items in `material_purchase_items`).
   The whole year is fetched in one request and bucketed client-side
   for snappy month switching.
═══════════════════════════════════════════════════════════════════ */

const C = {
  blue:   '#2563eb',
  green:  '#16a34a',
  red:    '#dc2626',
  purple: '#9333ea',
  amber:  '#ca8a04',
  gray:   '#4b5563',
};

const formatDZD = (n) => `${(Number(n) || 0).toLocaleString('en-US')} DZD`;

const formatDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const initials = (name) => (name || '?').trim().slice(0, 2).toUpperCase();

/* ─── icons ─── */
const Icons = {
  close: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
  phone: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465a2 2 0 0 1 2.828-.395l2.318 1.856a1 1 0 0 1 .06 1.508l-1.834 1.834a2 2 0 0 1-1.79.558C13.483 20.531 8.5 15.549 7.964 12.196a2 2 0 0 1 .557-1.79l1.834-1.834a1 1 0 0 1 1.508.06l1.856 2.318a2 2 0 0 1-.396 2.828l-.464.355a1 1 0 0 0-.303 1.212"/></svg>,
  mapPin: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 7-8 13-8 13s-8-6-8-13a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
  hash: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9h16"/><path d="M4 15h16"/><path d="M10 3 8 21"/><path d="M16 3l-2 18"/></svg>,
  receipt: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M8 7h8M8 11h8M8 15h5"/></svg>,
  box: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>,
  note: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 13h6"/><path d="M9 17h4"/></svg>,
  alert: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>,
  chevronLeft: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>,
  chevronRight: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>,
  chevronDown: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>,
  pencil: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>,
  wallet: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-1"/><path d="M22 12a2 2 0 0 0-2-2h-3a2 2 0 0 0 0 4h3a2 2 0 0 0 2-2Z"/></svg>,
  inbox: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z"/></svg>,
};

/* ─── Mini info row (icon + value) for the supplier header ─── */
const InfoPill = ({ icon, value, title }) => (
  <div
    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs"
    style={{ background: 'var(--surface-2)', color: 'var(--ink-muted)' }}
    title={title || value}
  >
    <span style={{ color: 'var(--ink-muted)' }}>{icon}</span>
    <span className="truncate max-w-[180px]">{value || '—'}</span>
  </div>
);

/* ─── Operation row (expandable to show items) ─── */
const OperationRow = ({ op, showMonthHeader, monthLabel }) => {
  const [open, setOpen] = useState(false);
  const expandable = op.items && op.items.length > 0;

  return (
    <>
      {showMonthHeader && (
        <div
          className="px-4 py-2 text-xs font-semibold sticky top-0 z-[1]"
          style={{
            background: 'var(--surface-2)',
            color: 'var(--ink-muted)',
            borderTop: '1px solid var(--border)',
            borderBottom: '1px solid var(--border)',
            letterSpacing: 0.3,
          }}
        >
          {monthLabel}
        </div>
      )}
      <div
        className="grid items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--surface-2)]"
        style={{
          gridTemplateColumns: 'auto 1fr auto auto',
          borderTop: showMonthHeader ? 'none' : '1px solid var(--border)',
        }}
      >
        {/* Date */}
        <div className="text-xs" style={{ color: 'var(--ink-muted)', minWidth: 84 }}>
          {formatDate(op.date)}
        </div>

        {/* Reference + items preview + note */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="inline-flex items-center gap-1 text-sm font-semibold truncate"
              style={{ color: 'var(--ink)' }}
            >
              <Icons.receipt />
              {op.reference || (
                <span style={{ color: 'var(--ink-muted)', fontWeight: 500 }}>
                  Purchase #{op.id}
                </span>
              )}
            </span>
          </div>
          <div
            className="flex items-center gap-1 text-xs mt-0.5 min-w-0"
            style={{ color: 'var(--ink-muted)' }}
          >
            <Icons.box />
            <span className="truncate">
              {op.itemCount} item{op.itemCount === 1 ? '' : 's'}
              {op.itemsPreview?.length > 0 &&
                ` · ${op.itemsPreview.join(', ')}${op.itemCount > op.itemsPreview.length ? '…' : ''}`}
            </span>
            {expandable && (
              <button
                onClick={() => setOpen((o) => !o)}
                className="ml-1 inline-flex items-center gap-0.5 text-xs font-semibold shrink-0"
                style={{ color: C.blue, background: 'transparent' }}
              >
                <span
                  className="inline-block transition-transform"
                  style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                  <Icons.chevronDown />
                </span>
                {open ? 'Hide' : 'Items'}
              </button>
            )}
          </div>
          {op.note && (
            <div
              className="flex items-center gap-1 text-xs mt-0.5 truncate"
              style={{ color: 'var(--ink-muted)', fontStyle: 'italic' }}
              title={op.note}
            >
              <Icons.note />
              <span className="truncate">{op.note}</span>
            </div>
          )}
        </div>

        {/* Total */}
        <div
          className="text-sm font-bold text-right"
          style={{ color: 'var(--ink)', minWidth: 120 }}
        >
          {formatDZD(op.total)}
        </div>

        {/* Chevron / expand indicator (decorative) */}
        <div className="w-6 flex items-center justify-end" style={{ color: 'var(--ink-muted)' }}>
          {expandable ? (
            <span
              className="inline-block transition-transform"
              style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              <Icons.chevronDown />
            </span>
          ) : null}
        </div>
      </div>

      {open && expandable && (
        <div
          className="px-4 py-2"
          style={{
            background: 'var(--surface-2)',
            borderTop: '1px solid var(--border)',
          }}
        >
          <table className="w-full text-xs">
            <thead>
              <tr style={{ color: 'var(--ink-muted)' }}>
                <th className="text-left py-1 font-medium">Material</th>
                <th className="text-right py-1 font-medium">Qty</th>
                <th className="text-left py-1 px-2 font-medium">Unit</th>
                <th className="text-right py-1 font-medium">Unit price</th>
                <th className="text-right py-1 font-medium">Line total</th>
              </tr>
            </thead>
            <tbody>
              {op.items.map((it) => (
                <tr key={it.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td className="py-1.5" style={{ color: 'var(--ink)' }}>{it.material}</td>
                  <td className="text-right py-1.5" style={{ color: 'var(--ink)' }}>
                    {it.quantity.toLocaleString('en-US')}
                  </td>
                  <td className="text-left py-1.5 px-2" style={{ color: 'var(--ink-muted)' }}>{it.unit}</td>
                  <td className="text-right py-1.5" style={{ color: 'var(--ink)' }}>{formatDZD(it.unit_price)}</td>
                  <td className="text-right py-1.5 font-semibold" style={{ color: 'var(--ink)' }}>
                    {formatDZD(it.line_total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

/* ─── Summary bar above the operations list ─── */
const SummaryBar = ({ summary, label }) => {
  if (!summary) return null;
  return (
    <div
      className="flex items-center justify-between gap-3 px-4 py-3"
      style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
          style={{ background: C.blue, color: 'white' }}
        >
          <Icons.wallet />
        </div>
        <div className="min-w-0">
          <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>{label}</div>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-base font-bold" style={{ color: 'var(--ink)' }}>
              {formatDZD(summary.total)}
            </span>
            <span className="text-xs" style={{ color: 'var(--ink-muted)' }}>
              {summary.count} purchase{summary.count === 1 ? '' : 's'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Empty state inside the list ─── */
const EmptyState = ({ icon, title, hint }) => (
  <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
    <div
      className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
      style={{ background: 'var(--surface-2)', color: 'var(--ink-muted)' }}
    >
      {icon}
    </div>
    <div className="text-sm font-semibold mb-1" style={{ color: 'var(--ink)' }}>{title}</div>
    {hint && (
      <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>{hint}</div>
    )}
  </div>
);

/* ─── Skeleton row ─── */
const SkeletonRow = () => (
  <div
    className="grid items-center gap-3 px-4 py-3"
    style={{ gridTemplateColumns: 'auto 1fr auto auto', borderTop: '1px solid var(--border)' }}
  >
    <div className="h-3 w-16 rounded" style={{ background: 'var(--surface-2)' }} />
    <div className="space-y-1.5">
      <div className="h-3 w-32 rounded" style={{ background: 'var(--surface-2)' }} />
      <div className="h-2.5 w-48 rounded" style={{ background: 'var(--surface-2)' }} />
    </div>
    <div className="h-3 w-20 rounded" style={{ background: 'var(--surface-2)' }} />
    <div className="h-4 w-4 rounded" style={{ background: 'var(--surface-2)' }} />
  </div>
);

/* ═══════════════════════════════════════════════════════════════════
   Main modal
═══════════════════════════════════════════════════════════════════ */
export default function SupplierPurchasesModal({ supplier, onClose, onEdit }) {
  /* ── local state ── */
  const [view, setView] = useState('month'); // 'month' | 'year'
  const [year, setYear] = useState(new Date().getFullYear());
  const [yearMonthFilter, setYearMonthFilter] = useState('all'); // 'all' | 1..12
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ── fetch whenever year changes ── */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getSupplierPurchasesClient(supplier.id, { year })
      .then((d) => {
        if (cancelled) return;
        setData(d);
        // If user lands on year view, default the month filter to the
        // current calendar month if it has data, else "all".
        const today = new Date();
        if (today.getFullYear() === year) {
          const m = today.getMonth() + 1;
          if (d.byMonth?.[String(m)]?.count > 0) setYearMonthFilter(m);
          else setYearMonthFilter('all');
        } else {
          setYearMonthFilter('all');
        }
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e.message || 'Failed to load purchases');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [supplier.id, year]);

  /* ── esc to close ── */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  /* ── derived: which operations to show ── */
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  const visibleOps = useMemo(() => {
    if (!data) return [];
    if (view === 'month') {
      return data.byMonth?.[String(currentMonth)]?.operations || [];
    }
    if (yearMonthFilter === 'all') return data.operations || [];
    return data.byMonth?.[String(yearMonthFilter)]?.operations || [];
  }, [data, view, yearMonthFilter, currentMonth]);

  const visibleSummary = useMemo(() => {
    if (!data) return null;
    if (view === 'month') {
      const ops = data.byMonth?.[String(currentMonth)]?.operations || [];
      return ops.reduce(
        (acc, op) => {
          acc.count += 1;
          acc.total += op.total;
          return acc;
        },
        { count: 0, total: 0 },
      );
    }
    if (yearMonthFilter === 'all') return data.summary;
    const ops = data.byMonth?.[String(yearMonthFilter)]?.operations || [];
    return ops.reduce(
      (acc, op) => {
        acc.count += 1;
        acc.total += op.total;
        return acc;
      },
      { count: 0, total: 0 },
    );
  }, [data, view, yearMonthFilter, currentMonth]);

  /* ── group ops by month for "All" in year view ── */
  const groupedOps = useMemo(() => {
    if (view !== 'year' || yearMonthFilter !== 'all' || !data) return null;
    const groups = [];
    const byMonth = data.byMonth || {};
    for (let m = 1; m <= 12; m++) {
      const bucket = byMonth[String(m)];
      if (bucket && bucket.operations.length > 0) {
        groups.push({
          month: m,
          label: data.monthNames?.full?.[m - 1] || `Month ${m}`,
          operations: bucket.operations,
        });
      }
    }
    return groups;
  }, [data, view, yearMonthFilter]);

  const monthShort = data?.monthNames?.short || [
    'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec',
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,15,20,0.55)' }}
      onClick={onClose}
    >
      <div
        className="panel w-full max-w-3xl flex flex-col"
        style={{ maxHeight: 'calc(100vh - 2rem)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header: blue stripe w/ supplier identity ── */}
        <div
          className="px-5 py-4 flex items-center justify-between shrink-0"
          style={{ background: C.blue, color: 'white' }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
              style={{ background: 'rgba(255,255,255,0.18)', color: 'white' }}
            >
              {initials(supplier.name)}
            </div>
            <div className="min-w-0">
              <div className="text-base font-semibold truncate">{supplier.name}</div>
              <div className="text-xs opacity-80 flex items-center gap-2 flex-wrap">
                <span>Supplier #{supplier.id}</span>
                {supplier.status && (
                  <>
                    <span>·</span>
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] font-semibold"
                      style={{
                        background: supplier.status === 'ACTIVE' ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.12)',
                      }}
                    >
                      {supplier.status}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button
            className="p-1 rounded-md"
            onClick={onClose}
            style={{ color: 'white' }}
            aria-label="Close"
            title="Close (Esc)"
          >
            <Icons.close />
          </button>
        </div>

        {/* ── Compact info row ── */}
        <div
          className="px-5 py-2.5 flex items-center gap-2 flex-wrap shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          {supplier.phone && <InfoPill icon={<Icons.phone />} value={supplier.phone} title="Phone" />}
          {supplier.nif && <InfoPill icon={<Icons.hash />} value={`NIF ${supplier.nif}`} title="NIF" />}
          {supplier.rc && <InfoPill icon={<Icons.hash />} value={`RC ${supplier.rc}`} title="RC" />}
          {supplier.address && <InfoPill icon={<Icons.mapPin />} value={supplier.address} title="Address" />}
        </div>

        {/* ── View toggle + period label ── */}
        <div
          className="px-5 py-3 flex items-center justify-between gap-3 flex-wrap shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div
            className="inline-flex p-1 rounded-lg"
            style={{ background: 'var(--surface-2)' }}
            role="tablist"
          >
            <TogglePill
              active={view === 'month'}
              color={C.blue}
              onClick={() => setView('month')}
            >
              This Month
            </TogglePill>
            <TogglePill
              active={view === 'year'}
              color={C.purple}
              onClick={() => setView('year')}
            >
              This Year
            </TogglePill>
          </div>

          <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>
            {view === 'month' ? (
              <>
                <span className="font-semibold" style={{ color: 'var(--ink)' }}>
                  {monthShort[currentMonth - 1]} {currentYear}
                </span>
                {' · current month'}
              </>
            ) : (
              <>
                Year{' '}
                <span className="font-semibold" style={{ color: 'var(--ink)' }}>{year}</span>
              </>
            )}
          </div>
        </div>

        {/* ── Year navigation + month strip (year view only) ── */}
        {view === 'year' && (
          <div
            className="px-5 py-3 flex items-center gap-3 flex-wrap shrink-0"
            style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}
          >
            {/* Year stepper */}
            <div className="inline-flex items-center gap-1">
              <button
                onClick={() => setYear((y) => y - 1)}
                className="w-8 h-8 rounded-md inline-flex items-center justify-center transition-colors"
                style={{ background: 'var(--panel-bg, white)', color: 'var(--ink-muted)', border: '1px solid var(--border)' }}
                title="Previous year"
                aria-label="Previous year"
              >
                <Icons.chevronLeft />
              </button>
              <div
                className="px-3 h-8 inline-flex items-center text-sm font-bold rounded-md"
                style={{ background: C.purple, color: 'white', minWidth: 64, justifyContent: 'center' }}
              >
                {year}
              </div>
              <button
                onClick={() => setYear((y) => y + 1)}
                className="w-8 h-8 rounded-md inline-flex items-center justify-center transition-colors"
                style={{ background: 'var(--panel-bg, white)', color: 'var(--ink-muted)', border: '1px solid var(--border)' }}
                title="Next year"
                aria-label="Next year"
              >
                <Icons.chevronRight />
              </button>
            </div>

            {/* Month strip */}
            <div className="flex items-center gap-1 flex-wrap">
              {monthShort.map((label, i) => {
                const m = i + 1;
                const active = yearMonthFilter === m;
                const hasData = (data?.byMonth?.[String(m)]?.count || 0) > 0;
                return (
                  <button
                    key={m}
                    onClick={() => setYearMonthFilter(m)}
                    className="relative px-2.5 h-8 rounded-md text-xs font-semibold transition-colors"
                    style={{
                      background: active ? C.blue : 'var(--panel-bg, white)',
                      color: active ? 'white' : 'var(--ink)',
                      border: `1px solid ${active ? C.blue : 'var(--border)'}`,
                      opacity: hasData || active ? 1 : 0.45,
                    }}
                    title={
                      hasData
                        ? `${data.byMonth[String(m)].count} purchase${data.byMonth[String(m)].count === 1 ? '' : 's'} · ${formatDZD(data.byMonth[String(m)].total)}`
                        : 'No purchases'
                    }
                  >
                    {label}
                    {hasData && !active && (
                      <span
                        className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
                        style={{ background: C.green, border: '2px solid var(--panel-bg, white)' }}
                      />
                    )}
                  </button>
                );
              })}
              <button
                onClick={() => setYearMonthFilter('all')}
                className="px-3 h-8 rounded-md text-xs font-bold transition-colors"
                style={{
                  background: yearMonthFilter === 'all' ? C.purple : 'var(--panel-bg, white)',
                  color: yearMonthFilter === 'all' ? 'white' : 'var(--ink)',
                  border: `1px solid ${yearMonthFilter === 'all' ? C.purple : 'var(--border)'}`,
                }}
                title="Show all months"
              >
                All
              </button>
            </div>
          </div>
        )}

        {/* ── Summary bar ── */}
        {!loading && !error && data && (
          <SummaryBar
            summary={visibleSummary}
            label={
              view === 'month'
                ? `${data.monthNames?.full?.[currentMonth - 1] || ''} ${currentYear}`
                : yearMonthFilter === 'all'
                ? `All of ${data.year}`
                : `${data.monthNames?.full?.[yearMonthFilter - 1] || ''} ${data.year}`
            }
          />
        )}

        {/* ── Error state ── */}
        {error && (
          <div
            className="flex items-center justify-between gap-3 px-5 py-3 text-sm shrink-0"
            style={{ background: C.red, color: 'white' }}
          >
            <span className="flex items-center gap-2"><Icons.alert /> {error}</span>
            <button
              className="text-xs font-semibold"
              style={{ color: 'white' }}
              onClick={() => {
                setError(null);
                setLoading(true);
                getSupplierPurchasesClient(supplier.id, { year })
                  .then((d) => setData(d))
                  .catch((e) => setError(e.message || 'Failed to load purchases'))
                  .finally(() => setLoading(false));
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Operations list (scrollable) ── */}
        <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
          {loading && (
            <div>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </div>
          )}

          {!loading && !error && visibleOps.length === 0 && (
            <EmptyState
              icon={<Icons.inbox />}
              title={
                view === 'month'
                  ? 'No purchases this month'
                  : yearMonthFilter === 'all'
                  ? `No purchases in ${data?.year}`
                  : `No purchases in ${data?.monthNames?.full?.[yearMonthFilter - 1] || ''}`
              }
              hint={
                view === 'year' && yearMonthFilter !== 'all'
                  ? 'Try a different month or click "All".'
                  : 'Record a new material purchase to see it here.'
              }
            />
          )}

          {!loading && !error && visibleOps.length > 0 && (
            <div>
              {groupedOps ? (
                groupedOps.map((g) => (
                  <div key={g.month}>
                    {g.operations.map((op, i) => (
                      <OperationRow
                        key={op.id}
                        op={op}
                        showMonthHeader={i === 0}
                        monthLabel={g.label}
                      />
                    ))}
                  </div>
                ))
              ) : (
                visibleOps.map((op) => (
                  <OperationRow key={op.id} op={op} />
                ))
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div
          className="px-5 py-3 flex items-center justify-between gap-2 shrink-0"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>
            <span className="font-semibold" style={{ color: 'var(--ink)' }}>
              {data?.summary?.count ?? '—'}
            </span>{' '}
            total purchase{data?.summary?.count === 1 ? '' : 's'} in {data?.year ?? year}
            {' · '}
            <span className="font-semibold" style={{ color: 'var(--ink)' }}>
              {data ? formatDZD(data.summary.total) : '—'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-ghost text-sm" onClick={onClose}>Close</button>
            <button
              className="text-sm font-medium px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5"
              style={{ background: C.purple, color: 'white' }}
              onClick={onEdit}
            >
              <Icons.pencil /> Edit supplier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Pill button used in the view toggle ─── */
const TogglePill = ({ active, color, onClick, children }) => (
  <button
    type="button"
    role="tab"
    aria-selected={active}
    onClick={onClick}
    className="px-3 py-1.5 rounded-md text-sm font-semibold transition-colors"
    style={{
      background: active ? color : 'transparent',
      color: active ? 'white' : 'var(--ink-muted)',
    }}
  >
    {children}
  </button>
);
