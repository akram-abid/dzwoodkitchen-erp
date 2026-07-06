'use client';

import { useState, useMemo } from 'react';

/* ─── Icons ─── */
const Icons = {
  search: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  x: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
  more: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>,
  check: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  clock: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  calendar: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>,
  briefcase: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  star: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  tool: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
  user: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  edit: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>,
  plus: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>,
  alert: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>,
  chevronLeft: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>,
  chevronRight: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>,
  ruler: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2"/><path d="m11.5 9.5 2-2"/><path d="m8.5 6.5 2-2"/><path d="m17.5 15.5 2-2"/></svg>,
  money: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>,
  trash: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>,
};

/* ─── Helpers ─── */
const formatDate = (d) => d.toISOString().split('T')[0];
const TODAY = formatDate(new Date());
const CURRENT_YEAR = new Date().getFullYear();

const getYearWeeks = (year) => {
  const weeks = [];
  let curr = new Date(year, 0, 1);
  while (curr.getDay() !== 1) curr.setDate(curr.getDate() + 1);
  if (curr.getFullYear() > year) curr = new Date(year, 0, 2);
  while (curr.getFullYear() === year) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(curr);
      d.setDate(curr.getDate() + i);
      if (d.getFullYear() === year) week.push(formatDate(d));
    }
    if (week.length === 7) weeks.push(week);
    curr.setDate(curr.getDate() + 7);
  }
  return weeks;
};

const getWeekDates = (year, weekIndex) => {
  const weeks = getYearWeeks(year);
  return weeks[weekIndex] || weeks[0] || [];
};

/* ─── Components ─── */
const SkillTag = ({ skill }) => {
  const colors = {
    Carpenter: 'var(--stage-appointment)',
    Finisher: 'var(--stage-ready)',
    Installer: 'var(--stage-contract)',
    Designer: 'var(--stage-production)',
    Manager: 'var(--stage-completed)',
  };
  const c = colors[skill] || 'var(--ink-muted)';
  return (
    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded" style={{ background: `${c}18`, color: c }}>
      {skill}
    </span>
  );
};

const AttendanceDot = ({ status }) => {
  const map = {
    PRESENT: { color: 'var(--stage-completed)', label: 'Present' },
    LATE: { color: 'var(--accent)', label: 'Late' },
    ABSENT: { color: 'var(--stage-contract)', label: 'Absent' },
    OFF: { color: 'var(--ink-muted)', label: 'Off' },
    SICK: { color: 'var(--stage-appointment)', label: 'Sick' },
    'NOT SET': { color: 'var(--ink-muted)', label: 'Not Set' },
  };
  const s = map[status] || map['NOT SET'];
  return (
    <span className="flex items-center gap-1.5">
      <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color, opacity: status ? 1 : 0.3 }} />
      <span className="text-xs font-medium" style={{ color: s.color, opacity: status ? 1 : 0.6 }}>{s.label}</span>
    </span>
  );
};

/* ─── Data ─── */
const WORKERS = [
  {
    id: 'WRK-001',
    firstName: 'Rachid',
    lastName: 'Said',
    shortName: 'R. Said',
    initials: 'RS',
    role: 'Carpenter',
    skills: ['Carpenter', 'Installer'],
    phone: '0551 23 45 67',
    email: 'r.said@dzwood.dz',
    joined: '2019-03-15',
    paymentType: 'meters',
    meterRate: 3500,
    status: 'ACTIVE',
    attendance: {
      [TODAY]: 'PRESENT',
      '2026-07-03': 'LATE',
      '2026-07-01': 'OFF',
    },
    assignments: [
      { id: 'A-101', project: 'Kitchen cabinets', meters: 12.5, date: '2026-07-01', note: '' },
      { id: 'A-102', project: 'Wardrobe doors', meters: 8.0, date: '2026-07-03', note: '' },
    ],
    performance: { ordersCompleted: 47, onTimeRate: 92, avgQuality: 4.6 },
    notes: 'Excellent with oak. Prefers morning shifts.',
  },
  {
    id: 'WRK-002',
    firstName: 'Amine',
    lastName: 'Benali',
    shortName: 'A. Benali',
    initials: 'AB',
    role: 'Finisher',
    skills: ['Finisher', 'Carpenter'],
    phone: '0770 88 99 00',
    email: 'a.benali@dzwood.dz',
    joined: '2020-06-01',
    paymentType: 'hours',
    hourlyRate: 1100,
    status: 'ACTIVE',
    attendance: {
      [TODAY]: 'PRESENT',
      '2026-07-04': 'SICK',
      '2026-07-03': 'SICK',
    },
    timeEntries: [
      { date: '2026-07-01', clockIn: '08:00', clockOut: '17:00', extraHours: 0, extraNote: '' },
      { date: '2026-07-02', clockIn: '08:00', clockOut: '18:30', extraHours: 1.5, extraNote: 'Urgent delivery prep' },
      { date: '2026-07-05', clockIn: '08:00', clockOut: '17:00', extraHours: 0, extraNote: '' },
    ],
    performance: { ordersCompleted: 38, onTimeRate: 88, avgQuality: 4.4 },
    notes: 'Specialist in varnish and lacquer finishes.',
  },
  {
    id: 'WRK-003',
    firstName: 'Karim',
    lastName: 'Amrani',
    shortName: 'K. Amrani',
    initials: 'KA',
    role: 'Installer',
    skills: ['Installer', 'Carpenter'],
    phone: '0540 11 22 33',
    email: 'k.amrani@dzwood.dz',
    joined: '2021-01-10',
    paymentType: 'meters',
    meterRate: 2800,
    status: 'ACTIVE',
    attendance: {
      [TODAY]: 'PRESENT',
      '2026-07-02': 'LATE',
    },
    assignments: [
      { id: 'A-201', project: 'Site measure Constantine', meters: 5.5, date: '2026-07-02', note: '' },
    ],
    performance: { ordersCompleted: 29, onTimeRate: 85, avgQuality: 4.2 },
    notes: 'Good with client relations. Travels often.',
  },
  {
    id: 'WRK-004',
    firstName: 'Mohamed',
    lastName: 'Draoui',
    shortName: 'M. Draoui',
    initials: 'MD',
    role: 'Carpenter',
    skills: ['Carpenter', 'Designer'],
    phone: '0555 44 55 66',
    email: 'm.draoui@dzwood.dz',
    joined: '2018-11-20',
    paymentType: 'hours',
    hourlyRate: 1400,
    status: 'OFF',
    attendance: {
      [TODAY]: 'OFF',
    },
    timeEntries: [
      { date: '2026-07-01', clockIn: '08:00', clockOut: '16:00', extraHours: 0, extraNote: '' },
    ],
    performance: { ordersCompleted: 62, onTimeRate: 95, avgQuality: 4.8 },
    notes: 'Senior carpenter. Mentors new hires.',
  },
  {
    id: 'WRK-005',
    firstName: 'Yasmine',
    lastName: 'Touati',
    shortName: 'Y. Touati',
    initials: 'YT',
    role: 'Designer',
    skills: ['Designer', 'Carpenter'],
    phone: '0661 77 88 99',
    email: 'y.touati@dzwood.dz',
    joined: '2022-09-01',
    paymentType: 'hours',
    hourlyRate: 1300,
    status: 'ACTIVE',
    attendance: {
      [TODAY]: 'PRESENT',
    },
    timeEntries: [
      { date: '2026-07-01', clockIn: '08:30', clockOut: '17:30', extraHours: 0, extraNote: '' },
    ],
    performance: { ordersCompleted: 18, onTimeRate: 90, avgQuality: 4.7 },
    notes: 'CAD specialist. Handles complex designs.',
  },
  {
    id: 'WRK-006',
    firstName: 'Hakim',
    lastName: 'Zeroual',
    shortName: 'H. Zeroual',
    initials: 'HZ',
    role: 'Carpenter',
    skills: ['Carpenter'],
    phone: '0790 12 34 56',
    email: 'h.zeroual@dzwood.dz',
    joined: '2023-02-15',
    paymentType: 'meters',
    meterRate: 2200,
    status: 'ACTIVE',
    attendance: {
      [TODAY]: 'ABSENT',
      '2026-07-01': 'LATE',
    },
    assignments: [],
    performance: { ordersCompleted: 12, onTimeRate: 75, avgQuality: 3.8 },
    notes: 'New hire. Needs supervision on complex joints.',
  },
  {
    id: 'WRK-007',
    firstName: 'Nadia',
    lastName: 'Bensalem',
    shortName: 'N. Bensalem',
    initials: 'NB',
    role: 'Finisher',
    skills: ['Finisher', 'Designer'],
    phone: '0560 66 77 88',
    email: 'n.bensalem@dzwood.dz',
    joined: '2020-04-10',
    paymentType: 'hours',
    hourlyRate: 1150,
    status: 'ACTIVE',
    attendance: {
      [TODAY]: 'PRESENT',
      '2026-07-03': 'OFF',
    },
    timeEntries: [
      { date: '2026-07-01', clockIn: '08:00', clockOut: '17:00', extraHours: 0, extraNote: '' },
      { date: '2026-07-02', clockIn: '08:00', clockOut: '19:00', extraHours: 2, extraNote: 'Color matching urgent job' },
      { date: '2026-07-04', clockIn: '08:00', clockOut: '17:00', extraHours: 0, extraNote: '' },
      { date: '2026-07-05', clockIn: '08:00', clockOut: '17:00', extraHours: 0, extraNote: '' },
    ],
    performance: { ordersCompleted: 41, onTimeRate: 91, avgQuality: 4.5 },
    notes: 'Excellent eye for color matching.',
  },
];

const ATTENDANCE_OPTIONS = ['PRESENT', 'LATE', 'ABSENT', 'OFF', 'SICK'];
const ATTENDANCE_COLORS = {
  PRESENT: 'var(--stage-completed)',
  LATE: 'var(--accent)',
  ABSENT: 'var(--stage-contract)',
  OFF: 'var(--ink-muted)',
  SICK: 'var(--stage-appointment)',
  'NOT SET': 'var(--ink-muted)',
};

/* ─── Main Component ─── */
export default function WorkersClient() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedId, setSelectedId] = useState(WORKERS[0].id);
  const [year, setYear] = useState(CURRENT_YEAR);
  const [weekIndex, setWeekIndex] = useState(() => {
    const weeks = getYearWeeks(CURRENT_YEAR);
    const todayWeek = weeks.findIndex(w => w.includes(TODAY));
    return todayWeek >= 0 ? todayWeek : 0;
  });
  const [workers, setWorkers] = useState(WORKERS);
  const [showTimeEntryModal, setShowTimeEntryModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);

  const selected = workers.find(w => w.id === selectedId) || workers[0];
  const currentWeek = getWeekDates(year, weekIndex);
  const yearWeeks = getYearWeeks(year);

  const filtered = useMemo(() => {
    return workers.filter(w => {
      const haystack = `${w.firstName} ${w.lastName} ${w.shortName} ${w.id} ${w.skills.join(' ')}`.toLowerCase();
      return haystack.includes(search.toLowerCase()) &&
             (roleFilter === 'All' || w.role === roleFilter) &&
             (statusFilter === 'All' || w.status === statusFilter);
    });
  }, [search, roleFilter, statusFilter, workers]);

  const roles = ['All', ...new Set(WORKERS.map(w => w.role))];
  const todayPresent = workers.filter(w => w.attendance[TODAY] === 'PRESENT').length;
  const todayAbsent = workers.filter(w => ['ABSENT', 'SICK'].includes(w.attendance[TODAY])).length;
  const todayOff = workers.filter(w => w.attendance[TODAY] === 'OFF').length;
  const todayNotSet = workers.filter(w => !w.attendance[TODAY]).length;

  const setAttendance = (workerId, date, status) => {
    setWorkers(prev => prev.map(w => {
      if (w.id !== workerId) return w;
      const next = { ...w.attendance };
      if (status === undefined || status === 'NOT SET') delete next[date];
      else next[date] = status;
      return { ...w, attendance: next };
    }));
  };

  const addTimeEntry = (entry) => {
    setWorkers(prev => prev.map(w => {
      if (w.id !== selectedId) return w;
      const exists = w.timeEntries.findIndex(e => e.date === entry.date);
      let newEntries;
      if (exists >= 0) {
        newEntries = [...w.timeEntries];
        newEntries[exists] = entry;
      } else {
        newEntries = [...w.timeEntries, entry];
      }
      return { ...w, timeEntries: newEntries };
    }));
    setShowTimeEntryModal(false);
    setEditingEntry(null);
  };

  const deleteTimeEntry = (date) => {
    setWorkers(prev => prev.map(w => {
      if (w.id !== selectedId) return w;
      return { ...w, timeEntries: w.timeEntries.filter(e => e.date !== date) };
    }));
  };

  const addAssignment = (assignment) => {
    setWorkers(prev => prev.map(w => {
      if (w.id !== selectedId) return w;
      return { ...w, assignments: [...w.assignments, { ...assignment, id: `A-${Date.now()}` }] };
    }));
    setShowAssignmentModal(false);
  };

  const deleteAssignment = (aid) => {
    setWorkers(prev => prev.map(w => {
      if (w.id !== selectedId) return w;
      return { ...w, assignments: w.assignments.filter(a => a.id !== aid) };
    }));
  };

  const getTotalMeters = (w) => w.assignments?.reduce((sum, a) => sum + a.meters, 0) || 0;
  const getTotalEarnings = (w) => {
    if (w.paymentType === 'meters') return getTotalMeters(w) * w.meterRate;
    const totalHours = w.timeEntries?.reduce((sum, e) => {
      const [inH, inM] = e.clockIn.split(':').map(Number);
      const [outH, outM] = e.clockOut.split(':').map(Number);
      const hours = (outH + outM / 60) - (inH + inM / 60);
      return sum + hours + (e.extraHours || 0);
    }, 0) || 0;
    return Math.round(totalHours * w.hourlyRate);
  };

  const getWeekDayName = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const getWeekRangeLabel = () => {
    if (!currentWeek.length) return '';
    const start = new Date(currentWeek[0]);
    const end = new Date(currentWeek[6]);
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  return (
    <div className="flex h-full" style={{ background: 'var(--bg)' }}>
      {/* ─── Left: Table + Filters ─── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden" style={{ background: 'var(--surface)' }}>
        
        {/* Daily Roll Call Banner */}
        <div className="flex items-center gap-4 px-4 py-3 shrink-0" style={{ background: 'var(--accent-soft)', borderBottom: '1px solid rgba(254,189,17,0.2)' }}>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>Today — {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: 'var(--stage-completed)' }} /> {todayPresent} Present</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: 'var(--stage-contract)' }} /> {todayAbsent} Absent</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: 'var(--ink-muted)' }} /> {todayOff} Off</span>
            {todayNotSet > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: 'var(--ink-muted)', opacity: 0.4 }} /> {todayNotSet} Not Set</span>}
          </div>
          <div className="flex-1" />
          <button 
            className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5"
            style={{ background: 'var(--stage-completed)', color: '#fff' }}
            onClick={() => workers.forEach(w => { if (!w.attendance[TODAY]) setAttendance(w.id, TODAY, 'PRESENT'); })}
          >
            <Icons.check /> Mark All Present
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-3 p-4 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md focus-ring" style={{ background: 'var(--bg)', border: '1px solid var(--border)', width: 240 }}>
            <span style={{ color: 'var(--ink-muted)' }}><Icons.search /></span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search workers..."
              className="bg-transparent text-sm outline-none w-full placeholder:text-[var(--ink-muted)]"
              style={{ color: 'var(--ink)' }}
            />
            {search && <button onClick={() => setSearch('')} className="p-0.5" style={{ color: 'var(--ink-muted)' }}><Icons.x /></button>}
          </div>

          <div className="flex items-center gap-2">
            {roles.map(r => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className="text-xs font-medium px-3 py-1.5 rounded-md transition-colors"
                style={{
                  background: roleFilter === r ? 'var(--surface-2)' : 'transparent',
                  color: roleFilter === r ? 'var(--ink)' : 'var(--ink-muted)',
                  border: `1px solid ${roleFilter === r ? 'var(--border)' : 'transparent'}`,
                }}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-2">
            {['ACTIVE', 'OFF'].map(s => {
              const count = WORKERS.filter(w => w.status === s).length;
              const active = statusFilter === s;
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(statusFilter === s ? 'All' : s)}
                  className="text-xs font-medium px-3 py-1.5 rounded-md transition-colors"
                  style={{
                    background: active ? 'var(--surface-2)' : 'transparent',
                    color: active ? 'var(--ink)' : 'var(--ink-muted)',
                    border: `1px solid ${active ? 'var(--border)' : 'transparent'}`,
                  }}
                >
                  {s === 'ACTIVE' ? 'On Duty' : 'Off Duty'}
                  <span className="ml-1 px-1.5 py-0.5 rounded text-[10px]" style={{ background: 'var(--bg)', color: 'var(--ink-muted)' }}>{count}</span>
                </button>
              );
            })}
          </div>

          <div className="flex-1" />
          <div className="text-xs font-medium" style={{ color: 'var(--ink-muted)' }}>
            {filtered.length} workers
          </div>
        </div>

        {/* Week Navigator */}
        <div className="flex items-center gap-3 px-4 py-2 shrink-0" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
          <button 
            onClick={() => setYear(y => y - 1)}
            className="text-xs font-medium px-2 py-1 rounded"
            style={{ color: 'var(--ink-muted)', border: '1px solid var(--border)' }}
          >
            ← Year
          </button>
          <span className="text-sm font-bold" style={{ color: 'var(--ink)', minWidth: 50, textAlign: 'center' }}>{year}</span>
          <button 
            onClick={() => setYear(y => y + 1)}
            className="text-xs font-medium px-2 py-1 rounded"
            style={{ color: 'var(--ink-muted)', border: '1px solid var(--border)' }}
          >
            Year →
          </button>
          
          <div className="w-px h-5 mx-2" style={{ background: 'var(--border)' }} />
          
          <button 
            onClick={() => setWeekIndex(i => Math.max(0, i - 1))}
            disabled={weekIndex === 0}
            className="p-1 rounded disabled:opacity-30"
            style={{ color: 'var(--ink-muted)' }}
          >
            <Icons.chevronLeft />
          </button>
          <span className="text-xs font-medium" style={{ color: 'var(--ink)', minWidth: 140, textAlign: 'center' }}>
            Week {weekIndex + 1} <span style={{ color: 'var(--ink-muted)' }}>· {getWeekRangeLabel()}</span>
          </span>
          <button 
            onClick={() => setWeekIndex(i => Math.min(yearWeeks.length - 1, i + 1))}
            disabled={weekIndex === yearWeeks.length - 1}
            className="p-1 rounded disabled:opacity-30"
            style={{ color: 'var(--ink-muted)' }}
          >
            <Icons.chevronRight />
          </button>
          
          <button
            onClick={() => {
              const todayWeek = getYearWeeks(CURRENT_YEAR).findIndex(w => w.includes(TODAY));
              setWeekIndex(todayWeek >= 0 ? todayWeek : 0);
              setYear(CURRENT_YEAR);
            }}
            className="text-xs font-medium px-2 py-1 rounded ml-2"
            style={{ color: 'var(--stage-appointment)', border: '1px solid var(--stage-appointment)' }}
          >
            Today
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 z-10" style={{ background: 'var(--surface-2)' }}>
              <tr>
                <th className="px-4 py-3 text-xs font-medium" style={{ color: 'var(--ink-muted)' }}>Worker</th>
                <th className="px-4 py-3 text-xs font-medium" style={{ color: 'var(--ink-muted)' }}>Role</th>
                <th className="px-4 py-3 text-xs font-medium" style={{ color: 'var(--ink-muted)' }}>
                  <div className="flex gap-0.5">
                    {currentWeek.map(d => (
                      <div key={d} className="w-8 text-center text-[10px]" style={{ color: d === TODAY ? 'var(--accent)' : 'var(--ink-muted)' }}>
                        {getWeekDayName(d)}
                      </div>
                    ))}
                  </div>
                </th>
                <th className="px-4 py-3 text-xs font-medium" style={{ color: 'var(--ink-muted)' }}>Payment</th>
                <th className="px-4 py-3 text-xs font-medium text-right" style={{ color: 'var(--ink-muted)' }}>Total</th>
                <th className="px-4 py-3 text-xs font-medium text-center" style={{ color: 'var(--ink-muted)' }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(w => {
                const isSel = selectedId === w.id;
                const totalEarnings = getTotalEarnings(w);
                return (
                  <tr
                    key={w.id}
                    onClick={() => setSelectedId(w.id)}
                    className="cursor-pointer transition-colors"
                    style={{
                      background: isSel ? 'var(--accent-soft)' : 'transparent',
                      borderTop: '1px solid var(--border)',
                    }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: 'var(--surface-2)', color: 'var(--accent)' }}>
                          {w.initials}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{w.shortName}</div>
                          <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>{w.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {w.skills.map(s => <SkillTag key={s} skill={s} />)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-0.5">
                        {currentWeek.map(d => {
                          const status = w.attendance[d];
                          const color = status ? ATTENDANCE_COLORS[status] : 'var(--ink-muted)';
                          const isToday = d === TODAY;
                          return (
                            <div
                              key={d}
                              className="w-8 h-8 rounded flex items-center justify-center text-[10px] font-bold cursor-pointer transition-all"
                              style={{ 
                                background: status ? `${color}20` : 'var(--surface-2)', 
                                color: status ? color : 'var(--ink-muted)',
                                border: isToday ? `2px solid ${color}` : '1px solid transparent',
                                opacity: status ? 1 : 0.5,
                              }}
                              title={`${d}: ${status || 'Not Set'}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                const current = status || 'NOT SET';
                                const next = current === 'NOT SET' 
                                  ? ATTENDANCE_OPTIONS[0] 
                                  : ATTENDANCE_OPTIONS[(ATTENDANCE_OPTIONS.indexOf(current) + 1) % ATTENDANCE_OPTIONS.length];
                                setAttendance(w.id, d, next === 'NOT SET' ? undefined : next);
                              }}
                            >
                              {new Date(d).getDate()}
                            </div>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ 
                        background: w.paymentType === 'meters' ? 'var(--stage-appointment)15' : 'var(--stage-completed)15',
                        color: w.paymentType === 'meters' ? 'var(--stage-appointment)' : 'var(--stage-completed)'
                      }}>
                        {w.paymentType === 'meters' ? `Meters @ ${w.meterRate.toLocaleString()} DZD` : `Hours @ ${w.hourlyRate.toLocaleString()} DZD`}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold tabular-nums" style={{ color: 'var(--stage-completed)' }}>
                      {totalEarnings.toLocaleString()} DZD
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button className="p-1" style={{ color: 'var(--ink-muted)' }} onClick={e => e.stopPropagation()}><Icons.more /></button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-sm" style={{ color: 'var(--ink-muted)' }}>No workers match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Right: Detail Panel ─── */}
      <div className="w-[420px] shrink-0 flex flex-col overflow-y-auto" style={{ borderLeft: '1px solid var(--border)', background: 'var(--surface)' }}>
        
        {/* Header */}
        <div className="p-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold" style={{ background: 'var(--surface-2)', color: 'var(--accent)' }}>
                {selected.initials}
              </div>
              <div>
                <h2 className="text-lg font-semibold" style={{ color: 'var(--ink)' }}>{selected.firstName} {selected.lastName}</h2>
                <div className="flex items-center gap-2 mt-1">
                  {selected.skills.map(s => <SkillTag key={s} skill={s} />)}
                </div>
              </div>
            </div>
            <span className="text-xs font-medium px-2 py-1 rounded" style={{ 
              background: selected.status === 'ACTIVE' ? 'var(--stage-completed)15' : 'var(--ink-muted)15',
              color: selected.status === 'ACTIVE' ? 'var(--stage-completed)' : 'var(--ink-muted)'
            }}>
              {selected.status === 'ACTIVE' ? 'On Duty' : 'Off Duty'}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--ink-muted)' }}>
            <span className="flex items-center gap-1"><Icons.user /> {selected.id}</span>
            <span className="flex items-center gap-1"><Icons.calendar /> Joined {selected.joined}</span>
            <span className="flex items-center gap-1"><Icons.tool /> {selected.role}</span>
          </div>
        </div>

        {/* Payment Info */}
        <div className="p-5" style={{ borderBottom: '1px solid var(--border)', background: selected.paymentType === 'meters' ? 'var(--stage-appointment)08' : 'var(--stage-completed)08' }}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: selected.paymentType === 'meters' ? 'var(--stage-appointment)' : 'var(--stage-completed)' }}>
              {selected.paymentType === 'meters' ? 'Meter-Based Payment' : 'Hourly Payment'}
            </h3>
            <span className="text-lg font-bold" style={{ color: selected.paymentType === 'meters' ? 'var(--stage-appointment)' : 'var(--stage-completed)' }}>
              {getTotalEarnings(selected).toLocaleString()} DZD
            </span>
          </div>
          <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>
            {selected.paymentType === 'meters' 
              ? `${getTotalMeters(selected)} meters total @ ${selected.meterRate.toLocaleString()} DZD/m`
              : `${selected.timeEntries?.length || 0} entries recorded`
            }
          </div>
        </div>

        {/* Attendance Grid for Selected Week */}
        <div className="p-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--ink-muted)' }}>
            Week of {getWeekRangeLabel()}
          </h3>
          <div className="grid grid-cols-7 gap-1">
            {currentWeek.map(d => {
              const status = selected.attendance[d];
              const isToday = d === TODAY;
              const color = status ? ATTENDANCE_COLORS[status] : 'var(--ink-muted)';
              return (
                <div key={d} className="flex flex-col items-center gap-1">
                  <div className="text-[10px] font-medium" style={{ color: 'var(--ink-muted)' }}>{getWeekDayName(d)}</div>
                  <button
                    onClick={() => {
                      const current = status || 'NOT SET';
                      const next = current === 'NOT SET' 
                        ? ATTENDANCE_OPTIONS[0] 
                        : ATTENDANCE_OPTIONS[(ATTENDANCE_OPTIONS.indexOf(current) + 1) % ATTENDANCE_OPTIONS.length];
                      setAttendance(selected.id, d, next === 'NOT SET' ? undefined : next);
                    }}
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-all"
                    style={{
                      background: status ? `${color}20` : 'var(--surface-2)',
                      color: status ? color : 'var(--ink-muted)',
                      border: isToday ? `2px solid ${color}` : `1px solid ${status ? color + '40' : 'var(--border)'}`,
                      opacity: status ? 1 : 0.6,
                    }}
                  >
                    {new Date(d).getDate()}
                  </button>
                  <span className="text-[9px] font-medium" style={{ color: status ? color : 'var(--ink-muted)', opacity: status ? 1 : 0.5 }}>
                    {status || 'Not Set'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact */}
        <div className="p-5 space-y-2" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--ink-muted)' }}>Contact</h3>
          <div className="flex items-center gap-3 text-sm p-2 rounded-lg" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--stage-appointment)' }}>📱</span>
            <span className="font-medium" style={{ color: 'var(--ink)' }}>{selected.phone}</span>
          </div>
          <div className="flex items-center gap-3 text-sm p-2 rounded-lg" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--stage-appointment)' }}>✉️</span>
            <span style={{ color: 'var(--ink)' }}>{selected.email}</span>
          </div>
        </div>

        {/* Payment Details */}
        {selected.paymentType === 'meters' ? (
          <div className="p-5" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--ink-muted)' }}>Assignments (Meters)</h3>
              <button 
                onClick={() => setShowAssignmentModal(true)}
                className="text-xs px-2 py-1 rounded flex items-center gap-1"
                style={{ background: 'var(--stage-appointment)', color: '#fff' }}
              >
                <Icons.plus /> Add
              </button>
            </div>
            <div className="space-y-2">
              {selected.assignments?.length === 0 && (
                <div className="text-xs text-center py-4" style={{ color: 'var(--ink-muted)' }}>No assignments yet</div>
              )}
              {selected.assignments?.map(a => (
                <div key={a.id} className="p-3 rounded-lg" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{a.project}</span>
                    <button onClick={() => deleteAssignment(a.id)} style={{ color: 'var(--stage-contract)' }}><Icons.trash /></button>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: 'var(--ink-muted)' }}>
                    <span className="flex items-center gap-1" style={{ color: 'var(--stage-appointment)' }}><Icons.ruler /> {a.meters} m</span>
                    <span><Icons.calendar /> {a.date}</span>
                    <span className="font-medium" style={{ color: 'var(--stage-completed)' }}>{(a.meters * selected.meterRate).toLocaleString()} DZD</span>
                  </div>
                  {a.note && <div className="text-xs mt-1" style={{ color: 'var(--ink-muted)' }}>{a.note}</div>}
                </div>
              ))}
            </div>
            <div className="mt-3 p-3 rounded-lg flex items-center justify-between" style={{ background: 'var(--stage-appointment)10' }}>
              <span className="text-xs font-medium" style={{ color: 'var(--stage-appointment)' }}>Total Meters</span>
              <span className="text-sm font-bold" style={{ color: 'var(--stage-appointment)' }}>{getTotalMeters(selected)} m</span>
            </div>
          </div>
        ) : (
          <div className="p-5" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--ink-muted)' }}>Time Entries</h3>
              <button 
                onClick={() => { setEditingEntry(null); setShowTimeEntryModal(true); }}
                className="text-xs px-2 py-1 rounded flex items-center gap-1"
                style={{ background: 'var(--stage-completed)', color: '#fff' }}
              >
                <Icons.plus /> Add Entry
              </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-auto">
              {selected.timeEntries?.length === 0 && (
                <div className="text-xs text-center py-4" style={{ color: 'var(--ink-muted)' }}>No time entries yet</div>
              )}
              {selected.timeEntries?.sort((a, b) => b.date.localeCompare(a.date)).map(e => {
                const [inH, inM] = e.clockIn.split(':').map(Number);
                const [outH, outM] = e.clockOut.split(':').map(Number);
                const hours = (outH + outM / 60) - (inH + inM / 60);
                const totalPay = Math.round((hours + (e.extraHours || 0)) * selected.hourlyRate);
                return (
                  <div key={e.date} className="p-3 rounded-lg" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{e.date}</span>
                      <div className="flex gap-1">
                        <button onClick={() => { setEditingEntry(e); setShowTimeEntryModal(true); }} style={{ color: 'var(--stage-appointment)' }}><Icons.edit /></button>
                        <button onClick={() => deleteTimeEntry(e.date)} style={{ color: 'var(--stage-contract)' }}><Icons.trash /></button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: 'var(--ink-muted)' }}>
                      <span className="flex items-center gap-1"><Icons.clock /> {e.clockIn} - {e.clockOut}</span>
                      <span style={{ color: 'var(--stage-completed)' }}>{hours}h</span>
                    </div>
                    {e.extraHours > 0 && (
                      <div className="mt-2 p-2 rounded text-xs" style={{ background: 'var(--stage-contract)10', border: '1px solid var(--stage-contract)30' }}>
                        <div className="flex items-center gap-1 font-medium" style={{ color: 'var(--stage-contract)' }}>
                          <Icons.alert /> +{e.extraHours}h Extra
                        </div>
                        <div style={{ color: 'var(--stage-contract)' }}>{e.extraNote}</div>
                        <div className="font-medium mt-1" style={{ color: 'var(--stage-contract)' }}>
                          Extra Pay: {Math.round(e.extraHours * selected.hourlyRate).toLocaleString()} DZD
                        </div>
                      </div>
                    )}
                    <div className="mt-2 text-xs font-bold text-right" style={{ color: 'var(--stage-completed)' }}>
                      {totalPay.toLocaleString()} DZD
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Performance */}
        <div className="p-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--ink-muted)' }}>Performance</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg text-center" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
              <div className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>{selected.performance.ordersCompleted}</div>
              <div className="text-[10px] uppercase tracking-wider mt-1" style={{ color: 'var(--ink-muted)' }}>Orders Done</div>
            </div>
            <div className="p-3 rounded-lg text-center" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
              <div className="text-2xl font-bold" style={{ color: selected.performance.onTimeRate >= 90 ? 'var(--stage-completed)' : 'var(--accent)' }}>
                {selected.performance.onTimeRate}%
              </div>
              <div className="text-[10px] uppercase tracking-wider mt-1" style={{ color: 'var(--ink-muted)' }}>On-Time Rate</div>
            </div>
            <div className="p-3 rounded-lg text-center" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
              <div className="text-2xl font-bold flex items-center justify-center gap-1" style={{ color: 'var(--stage-production)' }}>
                {selected.performance.avgQuality}
                <span style={{ color: 'var(--accent)' }}><Icons.star /></span>
              </div>
              <div className="text-[10px] uppercase tracking-wider mt-1" style={{ color: 'var(--ink-muted)' }}>Avg Quality</div>
            </div>
            <div className="p-3 rounded-lg text-center" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
              <div className="text-2xl font-bold" style={{ color: 'var(--stage-appointment)' }}>
                {selected.paymentType === 'meters' ? `${getTotalMeters(selected)}m` : `${selected.timeEntries?.length || 0} days`}
              </div>
              <div className="text-[10px] uppercase tracking-wider mt-1" style={{ color: 'var(--ink-muted)' }}>
                {selected.paymentType === 'meters' ? 'Total Meters' : 'Days Worked'}
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="p-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--ink-muted)' }}>Notes</h3>
          <p className="text-sm" style={{ color: 'var(--ink)' }}>{selected.notes}</p>
        </div>

        {/* Actions */}
        <div className="p-5 mt-auto space-y-2">
          <button className="w-full justify-center text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2" style={{ background: 'var(--accent)', color: '#fff' }}>
            <Icons.briefcase /> Assign to Order
          </button>
          <div className="flex gap-2">
            <button className="flex-1 justify-center text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--ink)' }}>
              <Icons.edit /> Edit Profile
            </button>
            <button className="flex-1 justify-center text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--ink)' }}>
              <Icons.calendar /> Time Off
            </button>
          </div>
        </div>
      </div>

      {/* ─── Time Entry Modal ─── */}
      {showTimeEntryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="w-96 p-5 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--ink)' }}>
              {editingEntry ? 'Edit Time Entry' : 'Add Time Entry'}
            </h3>
            <TimeEntryForm 
              initial={editingEntry} 
              onSave={addTimeEntry} 
              onCancel={() => { setShowTimeEntryModal(false); setEditingEntry(null); }}
            />
          </div>
        </div>
      )}

      {/* ─── Assignment Modal ─── */}
      {showAssignmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="w-96 p-5 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--ink)' }}>Add Assignment</h3>
            <AssignmentForm 
              onSave={addAssignment} 
              onCancel={() => setShowAssignmentModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Time Entry Form ─── */
function TimeEntryForm({ initial, onSave, onCancel }) {
  const [date, setDate] = useState(initial?.date || formatDate(new Date()));
  const [clockIn, setClockIn] = useState(initial?.clockIn || '08:00');
  const [clockOut, setClockOut] = useState(initial?.clockOut || '17:00');
  const [extraHours, setExtraHours] = useState(initial?.extraHours || 0);
  const [extraNote, setExtraNote] = useState(initial?.extraNote || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ date, clockIn, clockOut, extraHours: parseFloat(extraHours) || 0, extraNote });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="text-xs font-medium block mb-1" style={{ color: 'var(--ink-muted)' }}>Date</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full text-sm p-2 rounded-lg" style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--ink)' }} required />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs font-medium block mb-1" style={{ color: 'var(--ink-muted)' }}>Clock In</label>
          <input type="time" value={clockIn} onChange={e => setClockIn(e.target.value)} className="w-full text-sm p-2 rounded-lg" style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--ink)' }} required />
        </div>
        <div>
          <label className="text-xs font-medium block mb-1" style={{ color: 'var(--ink-muted)' }}>Clock Out</label>
          <input type="time" value={clockOut} onChange={e => setClockOut(e.target.value)} className="w-full text-sm p-2 rounded-lg" style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--ink)' }} required />
        </div>
      </div>
      <div>
        <label className="text-xs font-medium block mb-1" style={{ color: 'var(--ink-muted)' }}>Extra Hours</label>
        <input type="number" step="0.5" min="0" value={extraHours} onChange={e => setExtraHours(e.target.value)} className="w-full text-sm p-2 rounded-lg" style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--ink)' }} />
      </div>
      {parseFloat(extraHours) > 0 && (
        <div>
          <label className="text-xs font-medium block mb-1" style={{ color: 'var(--stage-contract)' }}>Extra Hours Note *</label>
          <input type="text" value={extraNote} onChange={e => setExtraNote(e.target.value)} placeholder="Why extra hours?" className="w-full text-sm p-2 rounded-lg" style={{ border: '1px solid var(--stage-contract)', background: 'var(--stage-contract)08', color: 'var(--ink)' }} required={parseFloat(extraHours) > 0} />
        </div>
      )}
      <div className="flex gap-2 mt-4">
        <button type="button" onClick={onCancel} className="flex-1 text-sm py-2 rounded-lg" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--ink)' }}>Cancel</button>
        <button type="submit" className="flex-1 text-sm py-2 rounded-lg text-white" style={{ background: 'var(--stage-completed)' }}>Save</button>
      </div>
    </form>
  );
}

/* ─── Assignment Form ─── */
function AssignmentForm({ onSave, onCancel }) {
  const [project, setProject] = useState('');
  const [meters, setMeters] = useState('');
  const [date, setDate] = useState(formatDate(new Date()));
  const [note, setNote] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ project, meters: parseFloat(meters), date, note });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="text-xs font-medium block mb-1" style={{ color: 'var(--ink-muted)' }}>Project</label>
        <input type="text" value={project} onChange={e => setProject(e.target.value)} placeholder="Project name" className="w-full text-sm p-2 rounded-lg" style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--ink)' }} required />
      </div>
      <div>
        <label className="text-xs font-medium block mb-1" style={{ color: 'var(--ink-muted)' }}>Meters Worked</label>
        <input type="number" step="0.1" min="0" value={meters} onChange={e => setMeters(e.target.value)} placeholder="e.g. 12.5" className="w-full text-sm p-2 rounded-lg" style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--ink)' }} required />
      </div>
      <div>
        <label className="text-xs font-medium block mb-1" style={{ color: 'var(--ink-muted)' }}>Date</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full text-sm p-2 rounded-lg" style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--ink)' }} required />
      </div>
      <div>
        <label className="text-xs font-medium block mb-1" style={{ color: 'var(--ink-muted)' }}>Note (optional)</label>
        <input type="text" value={note} onChange={e => setNote(e.target.value)} className="w-full text-sm p-2 rounded-lg" style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--ink)' }} />
      </div>
      <div className="flex gap-2 mt-4">
        <button type="button" onClick={onCancel} className="flex-1 text-sm py-2 rounded-lg" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--ink)' }}>Cancel</button>
        <button type="submit" className="flex-1 text-sm py-2 rounded-lg text-white" style={{ background: 'var(--stage-appointment)' }}>Save</button>
      </div>
    </form>
  );
}