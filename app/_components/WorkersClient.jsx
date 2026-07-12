"use client";

import { useState, useMemo } from "react";

/* ─── Icons ─── */
const Icons = {
  search: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  ),
  x: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  ),
  more: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  ),
  check: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  clock: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  calendar: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  ),
  briefcase: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  star: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  tool: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  user: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  edit: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  ),
  plus: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  ),
  alert: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  ),
  chevronLeft: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  ),
  chevronRight: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  ),
  ruler: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z" />
      <path d="m14.5 12.5 2-2" />
      <path d="m11.5 9.5 2-2" />
      <path d="m8.5 6.5 2-2" />
      <path d="m17.5 15.5 2-2" />
    </svg>
  ),
  money: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
      <path d="M12 18V6" />
    </svg>
  ),
  trash: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  ),
  wallet: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 7v12a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  ),
  print: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect width="12" height="8" x="6" y="14" />
    </svg>
  ),
};

/* ─── Attendance (only 3 statuses) ─── */
const ATTENDANCE_OPTIONS = ["PRESENT", "ABSENT", "SICK"];
const ATTENDANCE_COLORS = {
  PRESENT: "#16a34a",
  ABSENT: "#dc2626",
  SICK: "#ea580c",
  "NOT SET": "#9ca3af",
};
const ATTENDANCE_LABELS = {
  PRESENT: "Present",
  ABSENT: "Absent",
  SICK: "Sick",
  "NOT SET": "—",
};

/* ─── Helpers ─── */
const formatDate = (d) => d.toISOString().split("T")[0];
const TODAY = formatDate(new Date());
const CURRENT_YEAR = new Date().getFullYear();
const CURRENT_MONTH = TODAY.slice(0, 7);
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const monthKey = (y, m) => `${y}-${String(m + 1).padStart(2, "0")}`;

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

const getMonthGrid = (year, month) => {
  const firstDay = new Date(year, month, 1);
  // Mon=0, Tue=1, ... Sun=6
  let firstDayOfWeek = firstDay.getDay() - 1;
  if (firstDayOfWeek < 0) firstDayOfWeek = 6;

  const numDays = new Date(year, month + 1, 0).getDate();
  const weeks = [];
  let currentWeek = new Array(firstDayOfWeek).fill(null);

  for (let d = 1; d <= numDays; d++) {
    const date = new Date(year, month, d);
    currentWeek.push({
      date: formatDate(date),
      day: d,
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
    });
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push(null);
    weeks.push(currentWeek);
  }
  return weeks;
};

const cycleStatus = (current) => {
  if (!current) return "PRESENT";
  const idx = ATTENDANCE_OPTIONS.indexOf(current);
  if (idx === -1) return "PRESENT";
  if (idx === ATTENDANCE_OPTIONS.length - 1) return undefined;
  return ATTENDANCE_OPTIONS[idx + 1];
};

/* ─── Components ─── */
const SkillTag = ({ skill }) => {
  const colors = {
    Carpenter: "var(--stage-appointment)",
    Finisher: "var(--stage-ready)",
    Installer: "var(--stage-contract)",
    Designer: "var(--stage-production)",
    Manager: "var(--stage-completed)",
  };
  const c = colors[skill] || "var(--ink-muted)";
  return (
    <span
      className="text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded"
      style={{ background: `${c}18`, color: c }}
    >
      {skill}
    </span>
  );
};

/* ─── Data ─── */
const WORKERS = [
  {
    id: "WRK-001",
    firstName: "Rachid",
    lastName: "Said",
    shortName: "R. Said",
    initials: "RS",
    role: "Carpenter",
    skills: ["Carpenter", "Installer"],
    phone: "0551 23 45 67",
    email: "r.said@dzwood.dz",
    joined: "2019-03-15",
    paymentType: "meters",
    meterRate: 5000,
    status: "ACTIVE",
    attendance: {
      [TODAY]: "PRESENT",
      "2026-07-03": "ABSENT",
      "2026-07-01": "SICK",
    },
    assignments: [
      {
        id: "A-101",
        project: "Kitchen cabinets",
        meters: 12.5,
        date: "2026-07-01",
        note: "",
      },
      {
        id: "A-102",
        project: "Wardrobe doors",
        meters: 8.0,
        date: "2026-07-03",
        note: "",
      },
      {
        id: "A-103",
        project: "Office shelves",
        meters: 5.0,
        date: "2026-06-15",
        note: "Last month",
      },
    ],
    payments: [
      { id: "P-003", date: "2026-07-05", amount: 50000, note: "Advance" },
      {
        id: "P-004",
        date: "2026-07-01",
        amount: 30000,
        note: "Start of month",
      },
    ],
    performance: { ordersCompleted: 47, onTimeRate: 92, avgQuality: 4.6 },
    notes: "Excellent with oak. Prefers morning shifts.",
  },
  {
    id: "WRK-002",
    firstName: "Amine",
    lastName: "Benali",
    shortName: "A. Benali",
    initials: "AB",
    role: "Finisher",
    skills: ["Finisher", "Carpenter"],
    phone: "0770 88 99 00",
    email: "a.benali@dzwood.dz",
    joined: "2020-06-01",
    paymentType: "hours",
    hourlyRate: 1100,
    status: "ACTIVE",
    attendance: {
      [TODAY]: "PRESENT",
      "2026-07-04": "SICK",
      "2026-07-03": "SICK",
    },
    timeEntries: [
      {
        date: "2026-07-01",
        clockIn: "08:00",
        clockOut: "17:00",
        extraHours: 0,
        extraNote: "",
      },
      {
        date: "2026-07-02",
        clockIn: "08:00",
        clockOut: "18:30",
        extraHours: 1.5,
        extraNote: "Urgent delivery prep",
      },
      {
        date: "2026-07-05",
        clockIn: "08:00",
        clockOut: "17:00",
        extraHours: 0,
        extraNote: "",
      },
    ],
    payments: [
      {
        id: "P-005",
        date: "2026-07-05",
        amount: 25000,
        note: "Weekly advance",
      },
    ],
    performance: { ordersCompleted: 38, onTimeRate: 88, avgQuality: 4.4 },
    notes: "Specialist in varnish and lacquer finishes.",
  },
  {
    id: "WRK-003",
    firstName: "Karim",
    lastName: "Amrani",
    shortName: "K. Amrani",
    initials: "KA",
    role: "Installer",
    skills: ["Installer", "Carpenter"],
    phone: "0540 11 22 33",
    email: "k.amrani@dzwood.dz",
    joined: "2021-01-10",
    paymentType: "meters",
    meterRate: 5000,
    status: "ACTIVE",
    attendance: { [TODAY]: "PRESENT", "2026-07-02": "ABSENT" },
    assignments: [
      {
        id: "A-201",
        project: "Site measure Constantine",
        meters: 5.5,
        date: "2026-07-02",
        note: "",
      },
    ],
    payments: [],
    performance: { ordersCompleted: 29, onTimeRate: 85, avgQuality: 4.2 },
    notes: "Good with client relations. Travels often.",
  },
  {
    id: "WRK-004",
    firstName: "Mohamed",
    lastName: "Draoui",
    shortName: "M. Draoui",
    initials: "MD",
    role: "Carpenter",
    skills: ["Carpenter", "Designer"],
    phone: "0555 44 55 66",
    email: "m.draoui@dzwood.dz",
    joined: "2018-11-20",
    paymentType: "hours",
    hourlyRate: 1400,
    status: "OFF",
    attendance: { [TODAY]: "SICK" },
    timeEntries: [
      {
        date: "2026-07-01",
        clockIn: "08:00",
        clockOut: "16:00",
        extraHours: 0,
        extraNote: "",
      },
    ],
    payments: [
      {
        id: "P-001",
        date: "2026-07-01",
        amount: 40000,
        note: "Monthly advance",
      },
    ],
    performance: { ordersCompleted: 62, onTimeRate: 95, avgQuality: 4.8 },
    notes: "Senior carpenter. Mentors new hires.",
  },
  {
    id: "WRK-005",
    firstName: "Yasmine",
    lastName: "Touati",
    shortName: "Y. Touati",
    initials: "YT",
    role: "Designer",
    skills: ["Designer", "Carpenter"],
    phone: "0661 77 88 99",
    email: "y.touati@dzwood.dz",
    joined: "2022-09-01",
    paymentType: "hours",
    hourlyRate: 1300,
    status: "ACTIVE",
    attendance: { [TODAY]: "PRESENT" },
    timeEntries: [
      {
        date: "2026-07-01",
        clockIn: "08:30",
        clockOut: "17:30",
        extraHours: 0,
        extraNote: "",
      },
    ],
    payments: [],
    performance: { ordersCompleted: 18, onTimeRate: 90, avgQuality: 4.7 },
    notes: "CAD specialist. Handles complex designs.",
  },
  {
    id: "WRK-006",
    firstName: "Hakim",
    lastName: "Zeroual",
    shortName: "H. Zeroual",
    initials: "HZ",
    role: "Carpenter",
    skills: ["Carpenter"],
    phone: "0790 12 34 56",
    email: "h.zeroual@dzwood.dz",
    joined: "2023-02-15",
    paymentType: "meters",
    meterRate: 5000,
    status: "ACTIVE",
    attendance: { [TODAY]: "ABSENT", "2026-07-01": "ABSENT" },
    assignments: [],
    payments: [],
    performance: { ordersCompleted: 12, onTimeRate: 75, avgQuality: 3.8 },
    notes: "New hire. Needs supervision on complex joints.",
  },
  {
    id: "WRK-007",
    firstName: "Nadia",
    lastName: "Bensalem",
    shortName: "N. Bensalem",
    initials: "NB",
    role: "Finisher",
    skills: ["Finisher", "Designer"],
    phone: "0560 66 77 88",
    email: "n.bensalem@dzwood.dz",
    joined: "2020-04-10",
    paymentType: "hours",
    hourlyRate: 1150,
    status: "ACTIVE",
    attendance: { [TODAY]: "PRESENT", "2026-07-03": "SICK" },
    timeEntries: [
      {
        date: "2026-07-01",
        clockIn: "08:00",
        clockOut: "17:00",
        extraHours: 0,
        extraNote: "",
      },
      {
        date: "2026-07-02",
        clockIn: "08:00",
        clockOut: "19:00",
        extraHours: 2,
        extraNote: "Color matching urgent job",
      },
      {
        date: "2026-07-04",
        clockIn: "08:00",
        clockOut: "17:00",
        extraHours: 0,
        extraNote: "",
      },
      {
        date: "2026-07-05",
        clockIn: "08:00",
        clockOut: "17:00",
        extraHours: 0,
        extraNote: "",
      },
    ],
    payments: [
      { id: "P-002", date: "2026-07-03", amount: 35000, note: "Mid-month" },
    ],
    performance: { ordersCompleted: 41, onTimeRate: 91, avgQuality: 4.5 },
    notes: "Excellent eye for color matching.",
  },
];

/* ─── Month Navigator (small) ─── */
const MonthNav = ({ year, month, onPrev, onNext, onToday }) => (
  <div className="flex items-center gap-1.5">
    <button
      onClick={onPrev}
      className="p-1 rounded hover:opacity-70"
      style={{ color: "var(--ink-muted)" }}
      title="Previous month"
    >
      <Icons.chevronLeft />
    </button>
    <div
      className="text-sm font-bold px-2 min-w-[110px] text-center"
      style={{ color: "var(--ink)" }}
    >
      {MONTH_NAMES[month]} {year}
    </div>
    <button
      onClick={onNext}
      className="p-1 rounded hover:opacity-70"
      style={{ color: "var(--ink-muted)" }}
      title="Next month"
    >
      <Icons.chevronRight />
    </button>
    {!(year === CURRENT_YEAR && month === new Date().getMonth()) && (
      <button
        onClick={onToday}
        className="text-[10px] font-bold px-1.5 py-0.5 rounded ml-1"
        style={{
          color: "var(--stage-appointment)",
          border: "1px solid var(--stage-appointment)",
        }}
      >
        Today
      </button>
    )}
  </div>
);

/* ─── Main Component ─── */
export default function WorkersClient({ orders = [] }) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedId, setSelectedId] = useState(WORKERS[0].id);
  const [year, setYear] = useState(CURRENT_YEAR);
  const [weekIndex, setWeekIndex] = useState(() => {
    const weeks = getYearWeeks(CURRENT_YEAR);
    const todayWeek = weeks.findIndex((w) => w.includes(TODAY));
    return todayWeek >= 0 ? todayWeek : 0;
  });
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [viewYear, setViewYear] = useState(CURRENT_YEAR);
  const [workers, setWorkers] = useState(WORKERS);
  const [showTimeEntryModal, setShowTimeEntryModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);

  const selected = workers.find((w) => w.id === selectedId) || workers[0];
  const currentWeek = getWeekDates(year, weekIndex);
  const yearWeeks = getYearWeeks(year);
  const vKey = monthKey(viewYear, viewMonth);

  const filtered = useMemo(() => {
    return workers.filter((w) => {
      const haystack =
        `${w.firstName} ${w.lastName} ${w.shortName} ${w.id} ${w.skills.join(" ")}`.toLowerCase();
      return (
        haystack.includes(search.toLowerCase()) &&
        (roleFilter === "All" || w.role === roleFilter) &&
        (statusFilter === "All" || w.status === statusFilter)
      );
    });
  }, [search, roleFilter, statusFilter, workers]);

  const roles = ["All", ...new Set(WORKERS.map((w) => w.role))];
  const todayPresent = workers.filter(
    (w) => w.attendance[TODAY] === "PRESENT",
  ).length;
  const todayAbsent = workers.filter((w) =>
    ["ABSENT", "SICK"].includes(w.attendance[TODAY]),
  ).length;
  const todayNotSet = workers.filter((w) => !w.attendance[TODAY]).length;

  /* ─── Attendance ─── */
  const setAttendance = (workerId, date, status) => {
    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id !== workerId) return w;
        const next = { ...w.attendance };
        if (status === undefined) delete next[date];
        else next[date] = status;
        return { ...w, attendance: next };
      }),
    );
  };

  /* ─── Time entries (hourly) ─── */
  const addTimeEntry = (entry) => {
    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id !== selectedId) return w;
        const exists = w.timeEntries.findIndex((e) => e.date === entry.date);
        let newEntries;
        if (exists >= 0) {
          newEntries = [...w.timeEntries];
          newEntries[exists] = entry; // one entry per day — update
        } else {
          newEntries = [...w.timeEntries, entry];
        }
        return { ...w, timeEntries: newEntries };
      }),
    );
    setShowTimeEntryModal(false);
    setEditingEntry(null);
  };

  const deleteTimeEntry = (date) => {
    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id !== selectedId) return w;
        return {
          ...w,
          timeEntries: w.timeEntries.filter((e) => e.date !== date),
        };
      }),
    );
  };

  /* ─── Payments ─── */
  const addPayment = (payment) => {
    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id !== selectedId) return w;
        return {
          ...w,
          payments: [...w.payments, { ...payment, id: `P-${Date.now()}` }],
        };
      }),
    );
    setShowPaymentModal(false);
  };

  const deletePayment = (pid) => {
    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id !== selectedId) return w;
        return { ...w, payments: w.payments.filter((p) => p.id !== pid) };
      }),
    );
  };

  /* ─── Monthly Computations ─── */
  const getMonthlyTimeEntries = (w) =>
    (w.timeEntries || []).filter((e) => e.date.startsWith(vKey));

  const calcEntryHours = (e) => {
    const [inH, inM] = e.clockIn.split(":").map(Number);
    const [outH, outM] = e.clockOut.split(":").map(Number);
    return outH + outM / 60 - (inH + inM / 60) + (e.extraHours || 0);
  };

  const getMonthlyHours = (w) =>
    getMonthlyTimeEntries(w).reduce((sum, e) => sum + calcEntryHours(e), 0);

  // For meter-based: sum meters from orders this worker is on (if orders prop provided), else fallback to assignments
  const getMonthlyMetersData = (w) => {
    if (orders && orders.length > 0) {
      const workerOrders = orders.filter(
        (o) => o.worker === w.shortName && o.created?.startsWith(vKey),
      );
      const kitchens = workerOrders.map((o) => {
        const totalM = (o.items || []).reduce(
          (sum, item) => sum + (Number(item.l) || 0) / 100,
          0,
        );
        return {
          name: o.project,
          orderId: o.id,
          meters: totalM,
          amount: Math.round(totalM * (w.meterRate || 0)),
        };
      });
      return {
        totalMeters: kitchens.reduce((s, k) => s + k.meters, 0),
        kitchens,
        source: "orders",
      };
    }
    // Fallback: use the worker's own assignments
    const assignments = (w.assignments || []).filter((a) =>
      a.date.startsWith(vKey),
    );
    return {
      totalMeters: assignments.reduce((s, a) => s + a.meters, 0),
      kitchens: assignments.map((a) => ({
        name: a.project,
        orderId: a.id,
        meters: a.meters,
        amount: Math.round(a.meters * (w.meterRate || 0)),
      })),
      source: "assignments",
    };
  };

  const getMonthlyEarnings = (w) => {
    if (w.paymentType === "meters")
      return Math.round(getMonthlyMetersData(w).totalMeters * w.meterRate);
    return Math.round(getMonthlyHours(w) * w.hourlyRate);
  };

  const getMonthlyPayments = (w) =>
    (w.payments || [])
      .filter((p) => p.date.startsWith(vKey))
      .reduce((s, p) => s + p.amount, 0);

  const getBalance = (w) => getMonthlyEarnings(w) - getMonthlyPayments(w);

  const getWeekDayName = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { weekday: "short" });
  };

  const getWeekRangeLabel = () => {
    if (!currentWeek.length) return "";
    const start = new Date(currentWeek[0]);
    const end = new Date(currentWeek[6]);
    return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  };

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };
  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };
  const goCurrentMonth = () => {
    setViewMonth(new Date().getMonth());
    setViewYear(CURRENT_YEAR);
  };

  const monthlyEarned = getMonthlyEarnings(selected);
  const monthlyPaid = getMonthlyPayments(selected);
  const monthlyBalance = getBalance(selected);
  const monthlyEntries = getMonthlyTimeEntries(selected);
  const monthlyMetersData =
    selected.paymentType === "meters" ? getMonthlyMetersData(selected) : null;

  /* ─── Print Monthly Hours ─── */
  const printMonthlyHours = () => {
    const win = window.open("", "_blank", "width=900,height=900");
    if (!win) return;
    let totalHours = 0,
      totalExtra = 0,
      totalPay = 0;
    const rows = [...monthlyEntries]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((e, idx) => {
        const [inH, inM] = e.clockIn.split(":").map(Number);
        const [outH, outM] = e.clockOut.split(":").map(Number);
        const regH = outH + outM / 60 - (inH + inM / 60);
        const totalH = regH + (e.extraHours || 0);
        const pay = Math.round(totalH * selected.hourlyRate);
        totalHours += regH;
        totalExtra += e.extraHours || 0;
        totalPay += pay;
        const d = new Date(e.date);
        return `<tr>
        <td>${e.date}</td>
        <td>${d.toLocaleDateString("en-US", { weekday: "short" })}</td>
        <td>${e.clockIn}</td>
        <td>${e.clockOut}</td>
        <td style="text-align:right">${regH.toFixed(1)}h</td>
        <td style="text-align:right">${e.extraHours || 0}h</td>
        <td>${e.extraNote || ""}</td>
        <td style="text-align:right;font-weight:700">${pay.toLocaleString()} DZD</td>
      </tr>`;
      })
      .join("");

    win.document
      .write(`<!doctype html><html><head><meta charset="utf-8"><title>${selected.firstName} ${selected.lastName} — ${MONTH_NAMES[viewMonth]} ${viewYear}</title>
      <style>
        * { box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 32px; color: #111; max-width: 900px; margin: 0 auto; }
        h1 { margin: 0 0 4px; font-size: 22px; }
        .sub { color: #666; font-size: 13px; margin-bottom: 20px; }
        .meta { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 20px; }
        .card { padding: 12px; border: 1px solid #e5e5e5; border-radius: 8px; }
        .lbl { font-size: 10px; text-transform: uppercase; color: #888; letter-spacing: .04em; }
        .val { font-size: 16px; font-weight: 700; margin-top: 2px; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
        th, td { padding: 8px 6px; border-bottom: 1px solid #eee; text-align: left; }
        th { background: #f7f7f7; font-size: 10px; text-transform: uppercase; letter-spacing: .04em; color: #666; }
        .total-row td { font-weight: 700; border-top: 2px solid #111; border-bottom: none; padding-top: 12px; font-size: 13px; }
        .sig { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-top: 40px; font-size: 12px; }
        .sig div { border-top: 1px solid #111; padding-top: 6px; text-align: center; color: #666; }
        .no-print { margin-bottom: 16px; }
        .no-print button { padding: 8px 16px; background: #111; color: #fff; border: none; border-radius: 6px; cursor: pointer; }
        @media print { body { padding: 16px; } .no-print { display: none; } }
      </style></head><body>
      <div class="no-print"><button onclick="window.print()">🖨 Print</button></div>
      <h1>${selected.firstName} ${selected.lastName} <span style="color:#666;font-weight:400;font-size:16px">— ${selected.id}</span></h1>
      <div class="sub">Monthly Hours Report · ${MONTH_NAMES[viewMonth]} ${viewYear} · ${selected.hourlyRate.toLocaleString()} DZD/h</div>
      <div class="meta">
        <div class="card"><div class="lbl">Days Worked</div><div class="val">${monthlyEntries.length}</div></div>
        <div class="card"><div class="lbl">Total Hours</div><div class="val">${(totalHours + totalExtra).toFixed(1)}h</div></div>
        <div class="card"><div class="lbl">Total Pay</div><div class="val">${totalPay.toLocaleString()} DZD</div></div>
      </div>
      <table>
        <thead><tr><th>Date</th><th>Day</th><th>In</th><th>Out</th><th style="text-align:right">Hours</th><th style="text-align:right">Extra</th><th>Note</th><th style="text-align:right">Pay</th></tr></thead>
        <tbody>
          ${rows || '<tr><td colspan="8" style="text-align:center;color:#888;padding:18px">No entries this month.</td></tr>'}
          ${monthlyEntries.length > 0 ? `<tr class="total-row"><td colspan="4">TOTAL</td><td style="text-align:right">${totalHours.toFixed(1)}h</td><td style="text-align:right">${totalExtra.toFixed(1)}h</td><td></td><td style="text-align:right">${totalPay.toLocaleString()} DZD</td></tr>` : ""}
        </tbody>
      </table>
      <div class="sig">
        <div>Worker signature</div>
        <div>Manager signature</div>
      </div>
      <div style="margin-top:24px;font-size:11px;color:#888;text-align:center">Printed on ${new Date().toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}</div>
      </body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 250);
  };

  return (
    <div className="flex h-full" style={{ background: "var(--bg)" }}>
      {/* ─── Left: Table + Filters ─── */}
      <div
        className="flex-1 flex flex-col min-w-0 overflow-hidden"
        style={{ background: "var(--surface)" }}
      >
        {/* Daily Roll Call Banner */}
        <div
          className="flex items-center gap-4 px-4 py-3 shrink-0"
          style={{
            background: "var(--accent-soft)",
            borderBottom: "1px solid rgba(254,189,17,0.2)",
          }}
        >
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: "var(--accent)" }}
            />
            <span
              className="text-sm font-semibold"
              style={{ color: "var(--accent)" }}
            >
              Today —{" "}
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: ATTENDANCE_COLORS.PRESENT }}
              />{" "}
              {todayPresent} Present
            </span>
            <span className="flex items-center gap-1">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: "#dc2626" }}
              />{" "}
              {todayAbsent} Away
            </span>
            {todayNotSet > 0 && (
              <span className="flex items-center gap-1">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: ATTENDANCE_COLORS["NOT SET"] }}
                />{" "}
                {todayNotSet} Not Set
              </span>
            )}
          </div>
          <div className="flex-1" />
          <button
            className="text-xs px-3 py-1.5 flex items-center gap-1.5 font-bold rounded"
            style={{ background: ATTENDANCE_COLORS.PRESENT, color: "#fff" }}
            onClick={() =>
              workers.forEach((w) => {
                if (!w.attendance[TODAY]) setAttendance(w.id, TODAY, "PRESENT");
              })
            }
          >
            <Icons.check /> Mark All Present
          </button>
        </div>

        {/* Filter bar */}
        <div
          className="flex items-center gap-3 p-4 shrink-0"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-md"
            style={{
              background: "var(--bg)",
              border: "1px solid var(--border)",
              width: 260,
            }}
          >
            <span style={{ color: "var(--ink-muted)" }}>
              <Icons.search />
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search workers..."
              className="bg-transparent text-sm outline-none w-full placeholder:text-[var(--ink-muted)]"
              style={{ color: "var(--ink)" }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="p-0.5"
                style={{ color: "var(--ink-muted)" }}
              >
                <Icons.x />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {roles.map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className="text-sm font-medium px-3 py-1.5 rounded-md transition-colors"
                style={{
                  background:
                    roleFilter === r ? "var(--surface-2)" : "transparent",
                  color: roleFilter === r ? "var(--ink)" : "var(--ink-muted)",
                  border: `1px solid ${roleFilter === r ? "var(--border)" : "transparent"}`,
                }}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-2">
            {["ACTIVE", "OFF"].map((s) => {
              const count = WORKERS.filter((w) => w.status === s).length;
              const active = statusFilter === s;
              return (
                <button
                  key={s}
                  onClick={() =>
                    setStatusFilter(statusFilter === s ? "All" : s)
                  }
                  className="text-sm font-medium px-3 py-1.5 rounded-md transition-colors"
                  style={{
                    background: active ? "var(--surface-2)" : "transparent",
                    color: active ? "var(--ink)" : "var(--ink-muted)",
                    border: `1px solid ${active ? "var(--border)" : "transparent"}`,
                  }}
                >
                  {s === "ACTIVE" ? "On Duty" : "Off Duty"}
                  <span
                    className="ml-1 px-1.5 py-0.5 rounded text-xs"
                    style={{
                      background: "var(--bg)",
                      color: "var(--ink-muted)",
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex-1" />
          <div
            className="text-sm font-medium"
            style={{ color: "var(--ink-muted)" }}
          >
            {filtered.length} workers
          </div>
        </div>

        {/* Week Navigator */}
        <div
          className="flex items-center gap-3 px-4 py-2 shrink-0"
          style={{
            borderBottom: "1px solid var(--border)",
            background: "var(--bg)",
          }}
        >
          <button
            onClick={() => setYear((y) => y - 1)}
            className="text-sm font-medium px-2 py-1 rounded"
            style={{
              color: "var(--ink-muted)",
              border: "1px solid var(--border)",
            }}
          >
            ← Year
          </button>
          <span
            className="text-base font-bold"
            style={{ color: "var(--ink)", minWidth: 50, textAlign: "center" }}
          >
            {year}
          </span>
          <button
            onClick={() => setYear((y) => y + 1)}
            className="text-sm font-medium px-2 py-1 rounded"
            style={{
              color: "var(--ink-muted)",
              border: "1px solid var(--border)",
            }}
          >
            Year →
          </button>
          <div
            className="w-px h-5 mx-2"
            style={{ background: "var(--border)" }}
          />
          <button
            onClick={() => setWeekIndex((i) => Math.max(0, i - 1))}
            disabled={weekIndex === 0}
            className="p-1 rounded disabled:opacity-30"
            style={{ color: "var(--ink-muted)" }}
          >
            <Icons.chevronLeft />
          </button>
          <span
            className="text-sm font-medium"
            style={{ color: "var(--ink)", minWidth: 140, textAlign: "center" }}
          >
            Week {weekIndex + 1}{" "}
            <span style={{ color: "var(--ink-muted)" }}>
              · {getWeekRangeLabel()}
            </span>
          </span>
          <button
            onClick={() =>
              setWeekIndex((i) => Math.min(yearWeeks.length - 1, i + 1))
            }
            disabled={weekIndex === yearWeeks.length - 1}
            className="p-1 rounded disabled:opacity-30"
            style={{ color: "var(--ink-muted)" }}
          >
            <Icons.chevronRight />
          </button>
          <button
            onClick={() => {
              const todayWeek = getYearWeeks(CURRENT_YEAR).findIndex((w) =>
                w.includes(TODAY),
              );
              setWeekIndex(todayWeek >= 0 ? todayWeek : 0);
              setYear(CURRENT_YEAR);
            }}
            className="text-sm font-medium px-2 py-1 rounded ml-2"
            style={{
              color: "var(--stage-appointment)",
              border: "1px solid var(--stage-appointment)",
            }}
          >
            Today
          </button>
          <div className="flex-1" />
          <div
            className="flex items-center gap-1.5 text-[10px]"
            style={{ color: "var(--ink-muted)" }}
          >
            {ATTENDANCE_OPTIONS.map((opt) => (
              <span key={opt} className="flex items-center gap-1">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: ATTENDANCE_COLORS[opt] }}
                />
                {ATTENDANCE_LABELS[opt]}
              </span>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm">
            <thead
              className="sticky top-0 z-10"
              style={{ background: "var(--surface-2)" }}
            >
              <tr>
                <th
                  className="px-4 py-3 text-sm font-medium"
                  style={{ color: "var(--ink-muted)" }}
                >
                  Worker
                </th>
                <th
                  className="px-4 py-3 text-sm font-medium"
                  style={{ color: "var(--ink-muted)" }}
                >
                  Role
                </th>
                <th
                  className="px-4 py-3 text-sm font-medium"
                  style={{ color: "var(--ink-muted)" }}
                >
                  <div className="flex gap-1">
                    {currentWeek.map((d) => (
                      <div
                        key={d}
                        className="w-9 text-center text-xs"
                        style={{
                          color:
                            d === TODAY ? "var(--accent)" : "var(--ink-muted)",
                        }}
                      >
                        {getWeekDayName(d)}
                      </div>
                    ))}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-sm font-medium"
                  style={{ color: "var(--ink-muted)" }}
                >
                  Payment
                </th>
                <th
                  className="px-4 py-3 text-sm font-medium text-right"
                  style={{ color: "var(--ink-muted)" }}
                >
                  Month Total
                </th>
                <th
                  className="px-4 py-3 text-sm font-medium text-center"
                  style={{ color: "var(--ink-muted)" }}
                ></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((w) => {
                const isSel = selectedId === w.id;
                return (
                  <tr
                    key={w.id}
                    onClick={() => setSelectedId(w.id)}
                    className="cursor-pointer"
                    style={{
                      background: isSel ? "var(--accent-soft)" : "transparent",
                      borderTop: "1px solid var(--border)",
                    }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                          style={{
                            background: "var(--surface-2)",
                            color: "var(--accent)",
                          }}
                        >
                          {w.initials}
                        </div>
                        <div>
                          <div className="text-base font-medium">
                            {w.shortName}
                          </div>
                          <div
                            className="text-sm"
                            style={{ color: "var(--ink-muted)" }}
                          >
                            {w.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {w.skills.map((s) => (
                          <SkillTag key={s} skill={s} />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {currentWeek.map((d) => {
                          const status = w.attendance[d];
                          const color = status
                            ? ATTENDANCE_COLORS[status]
                            : ATTENDANCE_COLORS["NOT SET"];
                          const isToday = d === TODAY;
                          return (
                            <button
                              key={d}
                              className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold"
                              style={{
                                background: status ? color : "var(--surface-2)",
                                color: status ? "#fff" : "var(--ink-muted)",
                                border: isToday
                                  ? `2px solid ${status ? color : "var(--accent)"}`
                                  : `1px solid ${status ? color : "var(--border)"}`,
                                opacity: status ? 1 : 0.6,
                                cursor: "pointer",
                              }}
                              title={`${d}: ${status ? ATTENDANCE_LABELS[status] : "Not Set"}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                const next = cycleStatus(status);
                                setAttendance(w.id, d, next);
                              }}
                            >
                              {new Date(d).getDate()}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-sm font-medium px-2 py-1 rounded"
                        style={{
                          background:
                            w.paymentType === "meters"
                              ? "var(--stage-appointment)15"
                              : "var(--stage-completed)15",
                          color:
                            w.paymentType === "meters"
                              ? "var(--stage-appointment)"
                              : "var(--stage-completed)",
                        }}
                      >
                        {w.paymentType === "meters" ? `Meters` : `Hourly`}
                      </span>
                    </td>
                    <td
                      className="px-4 py-3 text-right font-bold tabular-nums text-base"
                      style={{ color: "var(--stage-completed)" }}
                    >
                      {getMonthlyEarnings(w).toLocaleString()} DZD
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        className="p-1"
                        style={{ color: "var(--ink-muted)" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Icons.more />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-base"
                    style={{ color: "var(--ink-muted)" }}
                  >
                    No workers match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Right: Detail Panel ─── */}
      <div
        className="w-[440px] shrink-0 flex flex-col overflow-y-auto"
        style={{
          borderLeft: "1px solid var(--border)",
          background: "var(--surface)",
        }}
      >
        {/* Header */}
        <div
          className="p-5"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold"
                style={{
                  background: "var(--surface-2)",
                  color: "var(--accent)",
                }}
              >
                {selected.initials}
              </div>
              <div>
                <h2
                  className="text-xl font-semibold"
                  style={{ color: "var(--ink)" }}
                >
                  {selected.firstName} {selected.lastName}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  {selected.skills.map((s) => (
                    <SkillTag key={s} skill={s} />
                  ))}
                </div>
              </div>
            </div>
            <span
              className="text-sm font-medium px-2 py-1 rounded"
              style={{
                background:
                  selected.status === "ACTIVE"
                    ? "var(--stage-completed)15"
                    : "var(--ink-muted)15",
                color:
                  selected.status === "ACTIVE"
                    ? "var(--stage-completed)"
                    : "var(--ink-muted)",
              }}
            >
              {selected.status === "ACTIVE" ? "On Duty" : "Off Duty"}
            </span>
          </div>
          <div
            className="flex items-center gap-4 text-sm"
            style={{ color: "var(--ink-muted)" }}
          >
            <span className="flex items-center gap-1">
              <Icons.user /> {selected.id}
            </span>
            <span className="flex items-center gap-1">
              <Icons.calendar /> Joined {selected.joined}
            </span>
            <span className="flex items-center gap-1">
              <Icons.tool /> {selected.role}
            </span>
          </div>
        </div>

        {/* Monthly Salary Summary */}
        <div
          className="p-5"
          style={{
            borderBottom: "1px solid var(--border)",
            background: "var(--accent-soft)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3
              className="text-sm font-semibold uppercase tracking-wider"
              style={{ color: "var(--accent)" }}
            >
              {MONTH_NAMES[viewMonth]} {viewYear} — Salary
            </h3>
            <MonthNav
              year={viewYear}
              month={viewMonth}
              onPrev={goPrevMonth}
              onNext={goNextMonth}
              onToday={goCurrentMonth}
            />
          </div>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div
              className="p-3 rounded-lg text-center"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                className="text-xs uppercase tracking-wider mb-1"
                style={{ color: "var(--ink-muted)" }}
              >
                Earned
              </div>
              <div
                className="text-lg font-bold"
                style={{ color: "var(--stage-completed)" }}
              >
                {monthlyEarned.toLocaleString()} DZD
              </div>
            </div>
            <div
              className="p-3 rounded-lg text-center"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                className="text-xs uppercase tracking-wider mb-1"
                style={{ color: "var(--ink-muted)" }}
              >
                Paid
              </div>
              <div
                className="text-lg font-bold"
                style={{ color: "var(--stage-appointment)" }}
              >
                {monthlyPaid.toLocaleString()} DZD
              </div>
            </div>
            <div
              className="p-3 rounded-lg text-center"
              style={{
                background: "var(--surface)",
                border: `1px solid ${monthlyBalance >= 0 ? "var(--stage-completed)" : "var(--stage-contract)"}`,
              }}
            >
              <div
                className="text-xs uppercase tracking-wider mb-1"
                style={{ color: "var(--ink-muted)" }}
              >
                {monthlyBalance >= 0 ? "Remaining" : "Overpaid"}
              </div>
              <div
                className="text-lg font-bold"
                style={{
                  color:
                    monthlyBalance >= 0
                      ? "var(--ink)"
                      : "var(--stage-contract)",
                }}
              >
                {Math.abs(monthlyBalance).toLocaleString()} DZD
              </div>
            </div>
          </div>
          <div
            className="h-2 w-full rounded-full overflow-hidden"
            style={{ background: "var(--surface-2)" }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${monthlyEarned > 0 ? Math.min(100, (monthlyPaid / monthlyEarned) * 100) : 0}%`,
                background:
                  monthlyPaid >= monthlyEarned
                    ? "var(--stage-completed)"
                    : "var(--accent)",
              }}
            />
          </div>
        </div>

        {/* Payment Type Info */}
        <div
          className="p-5"
          style={{
            borderBottom: "1px solid var(--border)",
            background:
              selected.paymentType === "meters"
                ? "var(--stage-appointment)08"
                : "var(--stage-completed)08",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <h3
              className="text-sm font-semibold uppercase tracking-wider"
              style={{
                color:
                  selected.paymentType === "meters"
                    ? "var(--stage-appointment)"
                    : "var(--stage-completed)",
              }}
            >
              {selected.paymentType === "meters"
                ? "Meter-Based Payment"
                : "Hourly Payment"}
            </h3>
            <span
              className="text-xl font-bold"
              style={{
                color:
                  selected.paymentType === "meters"
                    ? "var(--stage-appointment)"
                    : "var(--stage-completed)",
              }}
            >
              {monthlyEarned.toLocaleString()} DZD
            </span>
          </div>
          <div className="text-sm" style={{ color: "var(--ink-muted)" }}>
            {selected.paymentType === "meters"
              ? `${monthlyMetersData.totalMeters.toFixed(1)} m this month @ ${selected.meterRate.toLocaleString()} DZD/m`
              : `${getMonthlyHours(selected).toFixed(1)} h this month @ ${selected.hourlyRate.toLocaleString()} DZD/h`}
          </div>
        </div>

        {/* Attendance Grid for Selected Month */}
        <div
          className="p-5"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3
              className="text-sm font-semibold uppercase tracking-wider"
              style={{ color: "var(--ink-muted)" }}
            >
              Attendance — {MONTH_NAMES[viewMonth]} {viewYear}
            </h3>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div
                key={d}
                className="text-[10px] font-bold text-center uppercase"
                style={{ color: "var(--ink-muted)" }}
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {getMonthGrid(viewYear, viewMonth).map((week, wi) =>
              week.map((day, di) => {
                if (!day) return <div key={`${wi}-${di}`} />;
                const status = selected.attendance[day.date];
                const isToday = day.date === TODAY;
                const color = status
                  ? ATTENDANCE_COLORS[status]
                  : ATTENDANCE_COLORS["NOT SET"];
                return (
                  <button
                    key={day.date}
                    onClick={() => {
                      const next = cycleStatus(status);
                      setAttendance(selected.id, day.date, next);
                    }}
                    className="aspect-square rounded-md flex items-center justify-center text-xs font-bold"
                    style={{
                      background: status ? color : "var(--surface-2)",
                      color: status ? "#fff" : "var(--ink-muted)",
                      border: isToday
                        ? `2px solid ${status ? color : "var(--accent)"}`
                        : `1px solid ${status ? color : "var(--border)"}`,
                      opacity: status ? 1 : 0.5,
                      cursor: "pointer",
                      padding: 0,
                    }}
                    title={`${day.date}: ${status ? ATTENDANCE_LABELS[status] : "Not Set"}`}
                  >
                    {day.day}
                  </button>
                );
              }),
            )}
          </div>

          <div
            className="mt-3 flex items-center gap-3 text-[10px]"
            style={{ color: "var(--ink-muted)" }}
          >
            {ATTENDANCE_OPTIONS.map((opt) => (
              <span key={opt} className="flex items-center gap-1">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: ATTENDANCE_COLORS[opt] }}
                />
                {ATTENDANCE_LABELS[opt]}
              </span>
            ))}
          </div>
        </div>
        {/* Contact */}
        <div
          className="p-5 space-y-2"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <h3
            className="text-sm font-semibold uppercase tracking-wider mb-2"
            style={{ color: "var(--ink-muted)" }}
          >
            Contact
          </h3>
          <div
            className="flex items-center gap-3 text-base p-2 rounded-lg"
            style={{
              background: "var(--bg)",
              border: "1px solid var(--border)",
            }}
          >
            <span style={{ color: "var(--stage-appointment)" }}>📱</span>
            <span className="font-medium" style={{ color: "var(--ink)" }}>
              {selected.phone}
            </span>
          </div>
          <div
            className="flex items-center gap-3 text-base p-2 rounded-lg"
            style={{
              background: "var(--bg)",
              border: "1px solid var(--border)",
            }}
          >
            <span style={{ color: "var(--stage-appointment)" }}>✉️</span>
            <span style={{ color: "var(--ink)" }}>{selected.email}</span>
          </div>
        </div>

        {/* HOURLY: Monthly Time Entries Table */}
        {selected.paymentType === "hours" && (
          <div
            className="p-5"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3
                className="text-sm font-semibold uppercase tracking-wider"
                style={{ color: "var(--ink-muted)" }}
              >
                Monthly Hours
              </h3>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={printMonthlyHours}
                  disabled={monthlyEntries.length === 0}
                  className="text-xs font-bold px-2.5 py-1 rounded flex items-center gap-1 disabled:opacity-40"
                  style={{
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                    color: "var(--ink)",
                  }}
                  title="Print monthly hours report"
                >
                  <Icons.print /> Print
                </button>
                <button
                  onClick={() => {
                    setEditingEntry(null);
                    setShowTimeEntryModal(true);
                  }}
                  className="text-xs font-bold px-2.5 py-1 rounded flex items-center gap-1"
                  style={{
                    background: "var(--stage-completed)",
                    color: "#fff",
                  }}
                >
                  <Icons.plus /> Add
                </button>
              </div>
            </div>

            {monthlyEntries.length === 0 ? (
              <div
                className="text-sm text-center py-6 rounded-lg"
                style={{
                  background: "var(--bg)",
                  border: "1px dashed var(--border)",
                  color: "var(--ink-muted)",
                }}
              >
                No time entries for {MONTH_NAMES[viewMonth]} {viewYear}.
              </div>
            ) : (
              <div
                className="rounded-lg overflow-hidden"
                style={{ border: "1px solid var(--border)" }}
              >
                <table className="w-full text-xs">
                  <thead style={{ background: "var(--surface-2)" }}>
                    <tr>
                      <th
                        className="px-2 py-2 text-left font-semibold"
                        style={{ color: "var(--ink-muted)" }}
                      >
                        Date
                      </th>
                      <th
                        className="px-2 py-2 text-left font-semibold"
                        style={{ color: "var(--ink-muted)" }}
                      >
                        In
                      </th>
                      <th
                        className="px-2 py-2 text-left font-semibold"
                        style={{ color: "var(--ink-muted)" }}
                      >
                        Out
                      </th>
                      <th
                        className="px-2 py-2 text-right font-semibold"
                        style={{ color: "var(--ink-muted)" }}
                      >
                        Hrs
                      </th>
                      <th
                        className="px-2 py-2 text-right font-semibold"
                        style={{ color: "var(--ink-muted)" }}
                      >
                        Pay
                      </th>
                      <th className="px-1 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...monthlyEntries]
                      .sort((a, b) => b.date.localeCompare(a.date))
                      .map((e, idx) => {
                        const regH = (() => {
                          const [iH, iM] = e.clockIn.split(":").map(Number);
                          const [oH, oM] = e.clockOut.split(":").map(Number);
                          return oH + oM / 60 - (iH + iM / 60);
                        })();
                        const totalH = regH + (e.extraHours || 0);
                        const pay = Math.round(totalH * selected.hourlyRate);
                        return (
                          <tr
                            key={`${e.date}-${idx}`}
                            style={{ borderTop: "1px solid var(--border)" }}
                          >
                            <td
                              className="px-2 py-1.5 font-medium"
                              style={{ color: "var(--ink)" }}
                            >
                              {e.date.slice(5)}
                            </td>
                            <td
                              className="px-2 py-1.5"
                              style={{ color: "var(--ink)" }}
                            >
                              {e.clockIn}
                            </td>
                            <td
                              className="px-2 py-1.5"
                              style={{ color: "var(--ink)" }}
                            >
                              {e.clockOut}
                            </td>
                            <td
                              className="px-2 py-1.5 text-right tabular-nums"
                              style={{ color: "var(--ink)" }}
                            >
                              {totalH.toFixed(1)}h
                              {e.extraHours > 0 && (
                                <span
                                  className="text-[10px] ml-1"
                                  style={{ color: "var(--stage-contract)" }}
                                >
                                  +{e.extraHours}
                                </span>
                              )}
                            </td>
                            <td
                              className="px-2 py-1.5 text-right tabular-nums font-bold"
                              style={{ color: "var(--stage-completed)" }}
                            >
                              {pay.toLocaleString()}
                            </td>
                            <td className="px-1 py-1.5 text-center">
                              <button
                                onClick={() => {
                                  setEditingEntry(e);
                                  setShowTimeEntryModal(true);
                                }}
                                className="p-0.5"
                                style={{ color: "var(--stage-appointment)" }}
                                title="Edit"
                              >
                                <Icons.edit />
                              </button>
                              <button
                                onClick={() => deleteTimeEntry(e.date)}
                                className="p-0.5"
                                style={{ color: "var(--stage-contract)" }}
                                title="Delete"
                              >
                                <Icons.trash />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                  <tfoot>
                    <tr
                      style={{
                        borderTop: "2px solid var(--border)",
                        background: "var(--surface-2)",
                      }}
                    >
                      <td
                        colSpan={3}
                        className="px-2 py-2 text-xs font-bold"
                        style={{ color: "var(--ink-muted)" }}
                      >
                        Total ({monthlyEntries.length} days)
                      </td>
                      <td
                        className="px-2 py-2 text-right font-bold tabular-nums"
                        style={{ color: "var(--ink)" }}
                      >
                        {getMonthlyHours(selected).toFixed(1)}h
                      </td>
                      <td
                        className="px-2 py-2 text-right font-bold tabular-nums"
                        style={{ color: "var(--stage-completed)" }}
                      >
                        {monthlyEarned.toLocaleString()}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}

        {/* METER-BASED: Monthly Work Summary (auto from orders, no add button) */}
        {selected.paymentType === "meters" && (
          <div
            className="p-5"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3
                className="text-sm font-semibold uppercase tracking-wider"
                style={{ color: "var(--ink-muted)" }}
              >
                Monthly Work
              </h3>
              <div
                className="text-[10px] px-1.5 py-0.5 rounded font-bold"
                style={{
                  background: "var(--stage-appointment)15",
                  color: "var(--stage-appointment)",
                }}
              >
                {monthlyMetersData.source === "orders"
                  ? "Auto from orders"
                  : "From records"}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div
                className="p-3 rounded-lg text-center"
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  className="text-[10px] uppercase tracking-wider mb-1"
                  style={{ color: "var(--ink-muted)" }}
                >
                  Total Meters
                </div>
                <div
                  className="text-xl font-bold"
                  style={{ color: "var(--stage-appointment)" }}
                >
                  {monthlyMetersData.totalMeters.toFixed(1)} m
                </div>
              </div>
              <div
                className="p-3 rounded-lg text-center"
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  className="text-[10px] uppercase tracking-wider mb-1"
                  style={{ color: "var(--ink-muted)" }}
                >
                  Kitchens
                </div>
                <div
                  className="text-xl font-bold"
                  style={{ color: "var(--stage-appointment)" }}
                >
                  {monthlyMetersData.kitchens.length}
                </div>
              </div>
            </div>

            {monthlyMetersData.kitchens.length === 0 ? (
              <div
                className="text-sm text-center py-6 rounded-lg"
                style={{
                  background: "var(--bg)",
                  border: "1px dashed var(--border)",
                  color: "var(--ink-muted)",
                }}
              >
                No kitchens assigned in {MONTH_NAMES[viewMonth]} {viewYear}.
              </div>
            ) : (
              <div className="space-y-1.5">
                {monthlyMetersData.kitchens.map((k, idx) => (
                  <div
                    key={`${k.orderId}-${idx}`}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-lg"
                    style={{
                      background: "var(--bg)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-sm font-bold truncate"
                        style={{ color: "var(--ink)" }}
                      >
                        {k.name}
                      </div>
                      <div
                        className="text-[11px]"
                        style={{ color: "var(--ink-muted)" }}
                      >
                        {k.orderId}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div
                        className="text-sm font-bold tabular-nums"
                        style={{ color: "var(--stage-appointment)" }}
                      >
                        {k.meters.toFixed(1)} m
                      </div>
                      <div
                        className="text-[11px] font-medium tabular-nums"
                        style={{ color: "var(--stage-completed)" }}
                      >
                        {k.amount.toLocaleString()} DZD
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Payments Taken */}
        <div
          className="p-5"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3
              className="text-sm font-semibold uppercase tracking-wider"
              style={{ color: "var(--ink-muted)" }}
            >
              Payments — {MONTH_NAMES[viewMonth]}
            </h3>
            <button
              onClick={() => setShowPaymentModal(true)}
              className="text-xs font-bold px-2.5 py-1 rounded flex items-center gap-1"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              <Icons.plus /> Add
            </button>
          </div>
          <div className="space-y-2">
            {selected.payments?.filter((p) => p.date.startsWith(vKey))
              .length === 0 && (
              <div
                className="text-sm text-center py-4"
                style={{ color: "var(--ink-muted)" }}
              >
                No payments recorded
              </div>
            )}
            {selected.payments
              ?.filter((p) => p.date.startsWith(vKey))
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((p, idx) => (
                <div
                  key={p.id || `pay-${idx}`}
                  className="p-3 rounded-lg flex items-center justify-between"
                  style={{
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div>
                    <div
                      className="text-base font-semibold"
                      style={{ color: "var(--ink)" }}
                    >
                      {p.amount.toLocaleString()} DZD
                    </div>
                    <div
                      className="text-sm"
                      style={{ color: "var(--ink-muted)" }}
                    >
                      {p.date} · {p.note}
                    </div>
                  </div>
                  <button
                    onClick={() => deletePayment(p.id)}
                    style={{ color: "var(--stage-contract)" }}
                  >
                    <Icons.trash />
                  </button>
                </div>
              ))}
          </div>
          <div
            className="mt-3 p-3 rounded-lg flex items-center justify-between"
            style={{ background: "var(--accent-soft)" }}
          >
            <span
              className="text-sm font-medium"
              style={{ color: "var(--accent)" }}
            >
              Total Paid
            </span>
            <span
              className="text-base font-bold"
              style={{ color: "var(--accent)" }}
            >
              {monthlyPaid.toLocaleString()} DZD
            </span>
          </div>
        </div>

        {/* Performance */}
        <div
          className="p-5"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <h3
            className="text-sm font-semibold uppercase tracking-wider mb-3"
            style={{ color: "var(--ink-muted)" }}
          >
            Performance
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div
              className="p-3 rounded-lg text-center"
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                className="text-2xl font-bold"
                style={{ color: "var(--accent)" }}
              >
                {selected.performance.ordersCompleted}
              </div>
              <div
                className="text-xs uppercase tracking-wider mt-1"
                style={{ color: "var(--ink-muted)" }}
              >
                Orders Done
              </div>
            </div>
            <div
              className="p-3 rounded-lg text-center"
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                className="text-2xl font-bold"
                style={{
                  color:
                    selected.performance.onTimeRate >= 90
                      ? "var(--stage-completed)"
                      : "var(--accent)",
                }}
              >
                {selected.performance.onTimeRate}%
              </div>
              <div
                className="text-xs uppercase tracking-wider mt-1"
                style={{ color: "var(--ink-muted)" }}
              >
                On-Time Rate
              </div>
            </div>
            <div
              className="p-3 rounded-lg text-center"
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                className="text-2xl font-bold flex items-center justify-center gap-1"
                style={{ color: "var(--stage-production)" }}
              >
                {selected.performance.avgQuality}
                <span style={{ color: "var(--accent)" }}>
                  <Icons.star />
                </span>
              </div>
              <div
                className="text-xs uppercase tracking-wider mt-1"
                style={{ color: "var(--ink-muted)" }}
              >
                Avg Quality
              </div>
            </div>
            <div
              className="p-3 rounded-lg text-center"
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                className="text-2xl font-bold"
                style={{ color: "var(--stage-appointment)" }}
              >
                {selected.paymentType === "meters"
                  ? `${monthlyMetersData.totalMeters.toFixed(1)}m`
                  : `${getMonthlyHours(selected).toFixed(1)}h`}
              </div>
              <div
                className="text-xs uppercase tracking-wider mt-1"
                style={{ color: "var(--ink-muted)" }}
              >
                {MONTH_NAMES[viewMonth]}
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div
          className="p-5"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <h3
            className="text-sm font-semibold uppercase tracking-wider mb-2"
            style={{ color: "var(--ink-muted)" }}
          >
            Notes
          </h3>
          <p className="text-base" style={{ color: "var(--ink)" }}>
            {selected.notes}
          </p>
        </div>

        {/* Actions */}
        <div className="p-5 mt-auto space-y-2">
          <button
            className="w-full justify-center text-base font-medium px-4 py-2 rounded-lg flex items-center gap-2"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            <Icons.briefcase /> Assign to Order
          </button>
          <div className="flex gap-2">
            <button
              className="flex-1 justify-center text-base font-medium px-4 py-2 rounded-lg flex items-center gap-2"
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
                color: "var(--ink)",
              }}
            >
              <Icons.edit /> Edit Profile
            </button>
            <button
              className="flex-1 justify-center text-base font-medium px-4 py-2 rounded-lg flex items-center gap-2"
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
                color: "var(--ink)",
              }}
            >
              <Icons.calendar /> Time Off
            </button>
          </div>
        </div>
      </div>

      {/* ─── Time Entry Modal ─── */}
      {showTimeEntryModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div
            className="w-[420px] p-5 rounded-xl"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            <h3
              className="text-base font-bold mb-4"
              style={{ color: "var(--ink)" }}
            >
              {editingEntry ? "Edit Time Entry" : "Add Time Entry"}
            </h3>
            <TimeEntryForm
              initial={editingEntry}
              existingDates={(selected.timeEntries || [])
                .map((e) => e.date)
                .filter((d) => d !== editingEntry?.date)}
              onSave={addTimeEntry}
              onCancel={() => {
                setShowTimeEntryModal(false);
                setEditingEntry(null);
              }}
            />
          </div>
        </div>
      )}

      {/* ─── Payment Modal ─── */}
      {showPaymentModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div
            className="w-[420px] p-5 rounded-xl"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            <h3
              className="text-base font-bold mb-4"
              style={{ color: "var(--ink)" }}
            >
              Record Payment
            </h3>
            <PaymentForm
              onSave={addPayment}
              onCancel={() => setShowPaymentModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Time Entry Form ─── */
function TimeEntryForm({ initial, existingDates = [], onSave, onCancel }) {
  const [date, setDate] = useState(initial?.date || formatDate(new Date()));
  const [clockIn, setClockIn] = useState(initial?.clockIn || "08:00");
  const [clockOut, setClockOut] = useState(initial?.clockOut || "17:00");
  const [extraHours, setExtraHours] = useState(initial?.extraHours || 0);
  const [extraNote, setExtraNote] = useState(initial?.extraNote || "");

  const dateTaken = existingDates.includes(date);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (dateTaken) return;
    onSave({
      date,
      clockIn,
      clockOut,
      extraHours: parseFloat(extraHours) || 0,
      extraNote,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label
          className="text-sm font-medium block mb-1"
          style={{ color: "var(--ink-muted)" }}
        >
          Date
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full text-base p-2 rounded-lg"
          style={{
            border: `1px solid ${dateTaken ? "var(--stage-contract)" : "var(--border)"}`,
            background: "var(--bg)",
            color: "var(--ink)",
          }}
          required
        />
        {dateTaken && (
          <div
            className="text-xs mt-1"
            style={{ color: "var(--stage-contract)" }}
          >
            ⚠ An entry already exists for this date. Edit or delete the existing
            one instead.
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label
            className="text-sm font-medium block mb-1"
            style={{ color: "var(--ink-muted)" }}
          >
            Clock In
          </label>
          <input
            type="time"
            value={clockIn}
            onChange={(e) => setClockIn(e.target.value)}
            className="w-full text-base p-2 rounded-lg"
            style={{
              border: "1px solid var(--border)",
              background: "var(--bg)",
              color: "var(--ink)",
            }}
            required
          />
        </div>
        <div>
          <label
            className="text-sm font-medium block mb-1"
            style={{ color: "var(--ink-muted)" }}
          >
            Clock Out
          </label>
          <input
            type="time"
            value={clockOut}
            onChange={(e) => setClockOut(e.target.value)}
            className="w-full text-base p-2 rounded-lg"
            style={{
              border: "1px solid var(--border)",
              background: "var(--bg)",
              color: "var(--ink)",
            }}
            required
          />
        </div>
      </div>
      <div>
        <label
          className="text-sm font-medium block mb-1"
          style={{ color: "var(--ink-muted)" }}
        >
          Extra Hours
        </label>
        <input
          type="number"
          step="0.5"
          min="0"
          value={extraHours}
          onChange={(e) => setExtraHours(e.target.value)}
          className="w-full text-base p-2 rounded-lg"
          style={{
            border: "1px solid var(--border)",
            background: "var(--bg)",
            color: "var(--ink)",
          }}
        />
      </div>
      {parseFloat(extraHours) > 0 && (
        <div>
          <label
            className="text-sm font-medium block mb-1"
            style={{ color: "var(--stage-contract)" }}
          >
            Extra Hours Note *
          </label>
          <input
            type="text"
            value={extraNote}
            onChange={(e) => setExtraNote(e.target.value)}
            placeholder="Why extra hours?"
            className="w-full text-base p-2 rounded-lg"
            style={{
              border: "1px solid var(--stage-contract)",
              background: "var(--stage-contract)08",
              color: "var(--ink)",
            }}
            required={parseFloat(extraHours) > 0}
          />
        </div>
      )}
      <div className="flex gap-2 mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 text-base py-2 rounded-lg"
          style={{
            background: "var(--bg)",
            border: "1px solid var(--border)",
            color: "var(--ink)",
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={dateTaken}
          className="flex-1 text-base py-2 rounded-lg text-white disabled:opacity-50"
          style={{ background: "var(--stage-completed)" }}
        >
          Save
        </button>
      </div>
    </form>
  );
}

/* ─── Payment Form ─── */
function PaymentForm({ onSave, onCancel }) {
  const [date, setDate] = useState(formatDate(new Date()));
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ date, amount: parseFloat(amount), note });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label
          className="text-sm font-medium block mb-1"
          style={{ color: "var(--ink-muted)" }}
        >
          Date
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full text-base p-2 rounded-lg"
          style={{
            border: "1px solid var(--border)",
            background: "var(--bg)",
            color: "var(--ink)",
          }}
          required
        />
      </div>
      <div>
        <label
          className="text-sm font-medium block mb-1"
          style={{ color: "var(--ink-muted)" }}
        >
          Amount (DZD)
        </label>
        <input
          type="number"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 50000"
          className="w-full text-base p-2 rounded-lg"
          style={{
            border: "1px solid var(--border)",
            background: "var(--bg)",
            color: "var(--ink)",
          }}
          required
        />
      </div>
      <div>
        <label
          className="text-sm font-medium block mb-1"
          style={{ color: "var(--ink-muted)" }}
        >
          Note
        </label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Advance, salary, etc."
          className="w-full text-base p-2 rounded-lg"
          style={{
            border: "1px solid var(--border)",
            background: "var(--bg)",
            color: "var(--ink)",
          }}
        />
      </div>
      <div className="flex gap-2 mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 text-base py-2 rounded-lg"
          style={{
            background: "var(--bg)",
            border: "1px solid var(--border)",
            color: "var(--ink)",
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 text-base py-2 rounded-lg text-white"
          style={{ background: "var(--accent)" }}
        >
          Save
        </button>
      </div>
    </form>
  );
}
