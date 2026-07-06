'use client';

import { useState } from 'react';

/* ─── helpers ─── */
const StageBadge = ({ stage }) => {
  const map = {
    APPOINTMENT: { color: 'var(--stage-appointment)', label: 'Appointment', dot: '●' },
    CONTRACT: { color: 'var(--stage-contract)', label: 'Contract', dot: '●' },
    IN_PRODUCTION: { color: 'var(--stage-production)', label: 'In Production', dot: '●' },
    READY_TO_DELIVER: { color: 'var(--stage-ready)', label: 'Ready', dot: '●' },
    COMPLETED: { color: 'var(--stage-completed)', label: 'Completed', dot: '✓' },
  };
  const s = map[stage] || map.APPOINTMENT;
  return (
    <span className="badge" style={{ background: `${s.color}15`, color: s.color }}>
      <span style={{ fontSize: 10 }}>{s.dot}</span> {s.label}
    </span>
  );
};

const Stepper = ({ currentStage }) => {
  const stages = ['APPOINTMENT', 'CONTRACT', 'IN_PRODUCTION', 'READY_TO_DELIVER', 'COMPLETED'];
  const idx = stages.indexOf(currentStage);
  const Check = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
  return (
    <div className="flex items-center w-full max-w-lg">
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

const Icons = {
  orders: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
  workers: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="17" x2="22" y1="8" y2="13"/><line x1="22" x2="17" y1="8" y2="13"/></svg>,
  clock: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  calendar: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>,
  plus: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>,
  check: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
};

const WORKERS_TODAY = [
  { name: 'R. Mohammed', role: 'Carpenter', task: 'Kitchen cabinet assembly — Order #2041', status: 'IN_PRODUCTION', avatar: 'RS' },
  { name: 'T. Samir', role: 'Finisher', task: 'Varnishing dining set — Order #2038', status: 'IN_PRODUCTION', avatar: 'AB' },
  { name: 'M. Draoui', role: 'Carpenter', task: 'Off today', status: 'COMPLETED', avatar: 'MD' },
];

const ORDERS_TODAY = [
  { id: '#2041', client: 'A. Benali', stage: 'IN_PRODUCTION', worker: 'R. Said', amount: '45,000 DZD', due: 'Today' },
  { id: '#2038', client: 'K. Amrani', stage: 'IN_PRODUCTION', worker: 'A. Benali', amount: '62,000 DZD', due: 'Today' },
  { id: '#2045', client: 'S. Merzoug', stage: 'CONTRACT', worker: 'Unassigned', amount: '128,000 DZD', due: 'Tomorrow' },
  { id: '#2042', client: 'F. Hadj', stage: 'READY_TO_DELIVER', worker: 'R. Said', amount: '34,000 DZD', due: 'Today' },
];

const TASKS_INITIAL = [
  { id: 1, text: 'Assign worker to Order #2045', done: false, urgent: true },
  { id: 2, text: 'Deliver finished set to F. Hadj', done: false, urgent: true },
  { id: 3, text: 'Check varnish stock levels', done: false, urgent: false },
  { id: 4, text: 'Morning toolbox check', done: true, urgent: false },
];

export default function HomeDashboard() {
  const [tasks, setTasks] = useState(TASKS_INITIAL);

  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const completedCount = tasks.filter(t => t.done).length;
  const progress = Math.round((completedCount / tasks.length) * 100);

  return (
    <div className="p-6">
      {/* Daily Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-1">Today's Overview</h2>
        <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
          {completedCount}/{tasks.length} daily tasks completed · {progress}% done
        </p>
        <div className="mt-3 h-1.5 w-48 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: 'var(--accent)' }} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Active Orders', value: '12', sub: '3 due today', accent: false },
          { label: 'Workers On Duty', value: '3/4', sub: '1 off today', accent: false },
          { label: 'In Production', value: '5', sub: '2 finishing today', accent: true },
          { label: 'Pending Delivery', value: '2', sub: 'Ready for client', accent: false },
        ].map((stat, i) => (
          <div key={i} className="panel p-4 panel-hover cursor-default">
            <div className="text-xs font-medium mb-2" style={{ color: 'var(--ink-muted)' }}>{stat.label}</div>
            <div className="text-2xl font-bold mb-1" style={{ color: stat.accent ? 'var(--accent)' : 'var(--ink)' }}>{stat.value}</div>
            <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="col-span-2 space-y-6">
          {/* Worker Cards */}
          <div className="panel">
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Icons.workers /> Worker Assignments
              </h3>
              <button className="btn-ghost text-xs">View all</button>
            </div>
            <div className="p-2">
              {WORKERS_TODAY.map((w, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg panel-hover cursor-pointer">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: 'var(--surface-2)', color: 'var(--accent)' }}>
                    {w.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium">{w.name}</span>
                      <span className="text-xs" style={{ color: 'var(--ink-muted)' }}>{w.role}</span>
                    </div>
                    <div className="text-xs truncate" style={{ color: 'var(--ink-muted)' }}>{w.task}</div>
                  </div>
                  <StageBadge stage={w.status} />
                </div>
              ))}
            </div>
          </div>

          {/* Orders Table */}
          <div className="panel">
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Icons.orders /> Orders Requiring Attention
              </h3>
              <div className="flex gap-2">
                <button className="btn-ghost text-xs flex items-center gap-1"><Icons.calendar /> Today</button>
                <button className="btn-ghost text-xs">Export</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr style={{ background: 'var(--surface-2)' }}>
                    <th className="px-5 py-3 text-xs font-medium" style={{ color: 'var(--ink-muted)' }}>Order</th>
                    <th className="px-5 py-3 text-xs font-medium" style={{ color: 'var(--ink-muted)' }}>Client</th>
                    <th className="px-5 py-3 text-xs font-medium" style={{ color: 'var(--ink-muted)' }}>Status</th>
                    <th className="px-5 py-3 text-xs font-medium" style={{ color: 'var(--ink-muted)' }}>Worker</th>
                    <th className="px-5 py-3 text-xs font-medium text-right" style={{ color: 'var(--ink-muted)' }}>Amount</th>
                    <th className="px-5 py-3 text-xs font-medium" style={{ color: 'var(--ink-muted)' }}>Due</th>
                  </tr>
                </thead>
                <tbody>
                  {ORDERS_TODAY.map((o, i) => (
                    <tr key={i} className="panel-hover cursor-pointer transition-colors" style={{ borderTop: '1px solid var(--border)' }}>
                      <td className="px-5 py-3 font-medium">{o.id}</td>
                      <td className="px-5 py-3">{o.client}</td>
                      <td className="px-5 py-3"><StageBadge stage={o.stage} /></td>
                      <td className="px-5 py-3" style={{ color: o.worker === 'Unassigned' ? 'var(--stage-contract)' : 'var(--ink)' }}>{o.worker}</td>
                      <td className="px-5 py-3 text-right font-medium">{o.amount}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs ${o.due === 'Today' ? 'font-medium' : ''}`} style={{ color: o.due === 'Today' ? 'var(--accent)' : 'var(--ink-muted)' }}>
                          {o.due}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pipeline */}
          <div className="panel p-5">
            <h3 className="text-sm font-semibold mb-4">Order #2041 — Stage Pipeline</h3>
            <Stepper currentStage="IN_PRODUCTION" />
            <div className="flex justify-between mt-3 text-xs" style={{ color: 'var(--ink-muted)' }}>
              <span>Appointment</span><span>Contract</span>
              <span style={{ color: 'var(--accent)', fontWeight: 500 }}>In Production</span>
              <span>Ready</span><span>Completed</span>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Tasks */}
          <div className="panel">
            <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Icons.clock /> Daily Tasks
              </h3>
            </div>
            <div className="p-3 space-y-1">
              {tasks.map(t => (
                <div key={t.id} onClick={() => toggleTask(t.id)} className="flex items-start gap-3 p-3 rounded-lg panel-hover cursor-pointer group">
                  <div className="w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors"
                    style={{ borderColor: t.done ? 'var(--accent)' : 'var(--border)', background: t.done ? 'var(--accent)' : 'transparent' }}>
                    {t.done && <Icons.check />}
                  </div>
                  <div className="flex-1">
                    <div className={`text-sm ${t.done ? 'line-through' : ''}`} style={{ color: t.done ? 'var(--ink-muted)' : 'var(--ink)' }}>
                      {t.text}
                    </div>
                    {t.urgent && !t.done && <div className="text-xs mt-1 font-medium" style={{ color: 'var(--accent)' }}>Urgent</div>}
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-3" style={{ borderTop: '1px solid var(--border)' }}>
              <button className="btn-ghost text-xs w-full justify-center">+ Add task</button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="panel p-5">
            <h3 className="text-sm font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="btn-primary w-full justify-center text-sm">
                <Icons.plus /> Point Worker to Task
              </button>
              <button className="btn-ghost w-full justify-center text-sm border" style={{ borderColor: 'var(--border)' }}>
                Record Material Usage
              </button>
              <button className="btn-ghost w-full justify-center text-sm border" style={{ borderColor: 'var(--border)' }}>
                Mark Delivery Complete
              </button>
              <button className="btn-ghost w-full justify-center text-sm border" style={{ borderColor: 'var(--border)' }}>
                Request Supplier Quote
              </button>
            </div>
          </div>

          {/* Production Alert */}
          <div className="p-5 rounded-lg" style={{ background: 'var(--accent-soft)', border: '1px solid rgba(254,189,17,0.2)' }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }} />
              <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>In Production</span>
            </div>
            <p className="text-sm mb-3" style={{ color: 'var(--ink)' }}>2 orders must finish today to stay on schedule.</p>
            <div className="flex gap-2">
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(254,189,17,0.2)' }}>
                <div className="h-full rounded-full" style={{ width: '70%', background: 'var(--accent)' }} />
              </div>
              <span className="text-xs font-medium" style={{ color: 'var(--accent)' }}>70%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}