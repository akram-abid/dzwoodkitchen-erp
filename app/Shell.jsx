'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Icons = {
  home: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  orders: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
  clients: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  workers: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="17" x2="22" y1="8" y2="13"/><line x1="22" x2="17" y1="8" y2="13"/></svg>,
  materials: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>,
  suppliers: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/><path d="m17 13-5 3-5-3"/></svg>,
  budgets: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>,
  assets: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>,
  invoices: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13h2"/><path d="M8 17h2"/><path d="M14 13h2"/><path d="M14 17h2"/></svg>,
  search: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  bell: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>,
  plus: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>,
  chevron: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>,
};

const navItems = [
  { id: 'Home', href: '/', icon: Icons.home },
  { id: 'Orders', href: '/orders', icon: Icons.orders },
  { id: 'Clients', href: '/clients', icon: Icons.clients },
  { id: 'Workers', href: '/workers', icon: Icons.workers },
  { id: 'Materials', href: '/materials', icon: Icons.materials },
  { id: 'Suppliers', href: '/suppliers', icon: Icons.suppliers },
  { id: 'Budgets', href: '/budgets', icon: Icons.budgets },
  { id: 'Assets', href: '/assets', icon: Icons.assets },
  { id: 'Invoices', href: '/invoices', icon: Icons.invoices },
];

export default function Shell({ children }) {
  const pathname = usePathname();

  const getActive = (path) => {
    if (path === '/') return 'Home';
    const match = navItems.find(n => n.href !== '/' && path.startsWith(n.href));
    return match ? match.id : 'Home';
  };
  const activeNav = getActive(pathname);

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
      
      {/* Sidebar */}
      <aside className="flex flex-col w-60 shrink-0" style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3 h-14 px-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center justify-center w-8 h-8 rounded font-bold text-xs" style={{ background: 'var(--accent)', color: 'var(--on-accent)' }}>
            DW
          </div>
          <span className="font-semibold text-sm tracking-tight">DZ Wood Kitchen</span>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map(item => {
            const isActive = activeNav === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`nav-item ${isActive ? 'active' : ''}`}
                style={{ display: 'flex', textDecoration: 'none' }}
              >
                <item.icon />
                <span>{item.id}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-3 mx-3 mb-3 rounded-lg panel-hover cursor-pointer" style={{ border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold" style={{ background: 'var(--surface-2)', color: 'var(--accent)' }}>
              YO
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">Amine B.</div>
              <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>Admin</div>
            </div>
            <Icons.chevron />
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center justify-between h-14 px-6 shrink-0" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-semibold">{activeNav}</h1>
            <span className="text-xs" style={{ color: 'var(--ink-muted)' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md focus-ring" style={{ background: 'var(--bg)', border: '1px solid var(--border)', width: 260 }}>
              <Icons.search />
              <input
                type="text"
                placeholder="Search orders, workers..."
                className="bg-transparent text-sm outline-none w-full placeholder:text-[var(--ink-muted)]"
                style={{ color: 'var(--ink)' }}
              />
            </div>

            <button className="btn-ghost relative">
              <Icons.bell />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }} />
            </button>

            <button className="btn-primary">
              <Icons.plus /> New Order
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}