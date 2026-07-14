"use client";

import { useState, useMemo, useCallback, memo } from "react";

/* ─── CSS Variables ─── */

const GlobalStyles = () => (
  <style>{`
    :root {
      --bg: #0b0d10;
      --surface: #14171c;
      --surface-2: #1c1f26;
      --ink: #f0f2f5;
      --ink-muted: #8b949e;
      --accent: #febd11;
      --accent-soft: rgba(254,189,17,0.08);
      --border: #2a2f38;
      --stage-appointment: #3b82f6;
      --stage-ready: #10b981;
      --stage-contract: #f59e0b;
      --stage-production: #8b5cf6;
      --stage-completed: #22c55e;
    }
      @media (min-width: 1024px) {
  .screen-enter { animation: none; }
}
    * { box-sizing: border-box; }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    .screen-enter { animation: slideIn 0.25s ease-out; }
  `}</style>
);

/* ─── Icons ─── */

const Icons = {
  search: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>),
  x: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>),
  more: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>),
  check: () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>),
  clock: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>),
  calendar: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>),
  briefcase: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>),
  star: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>),
  tool: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>),
  user: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>),
  edit: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>),
  plus: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>),
  alert: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>),
  chevronLeft: () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>),
  chevronRight: () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>),
  ruler: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z" /><path d="m14.5 12.5 2-2" /><path d="m11.5 9.5 2-2" /><path d="m8.5 6.5 2-2" /><path d="m17.5 15.5 2-2" /></svg>),
  money: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" /><path d="M12 18V6" /></svg>),
  trash: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>),
  wallet: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 7v12a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" /></svg>),
  print: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect width="12" height="8" x="6" y="14" /></svg>),
  arrowLeft: () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>),
  home: () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>),
  clipboard: () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /></svg>),
  info: () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>),
  search: () => (
    <svg
      width="20"
      height="20"
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
      width="20"
      height="20"
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
      width="20"
      height="20"
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
      width="18"
      height="18"
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
      width="24"
      height="24"
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
      width="24"
      height="24"
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
  arrowLeft: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  ),
  home: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  clipboard: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    </svg>
  ),
  info: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  ),
};

/* ─── Attendance ─── */

const ATTENDANCE_OPTIONS = ["PRESENT", "ABSENT"];

const ATTENDANCE_COLORS = {
  PRESENT: "#16a34a",
  ABSENT: "#dc2626",
  "NOT SET": "#3a3f4b",
};

const ATTENDANCE_LABELS = {
  PRESENT: "Present",
  ABSENT: "Absent",
  "NOT SET": "—",
};

/* ─── Helpers ─── */

const formatDate = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const TODAY = formatDate(new Date());

const CURRENT_YEAR = new Date().getFullYear();

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
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
  let firstDayOfWeek = firstDay.getDay() - 1;
  if (firstDayOfWeek < 0) firstDayOfWeek = 6;
  const numDays = new Date(year, month + 1, 0).getDate();
  const weeks = [];
  let currentWeek = new Array(firstDayOfWeek).fill(null);
  for (let d = 1; d <= numDays; d++) {
    const date = new Date(year, month, d);
    currentWeek.push({ date: formatDate(date), day: d });
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

const getWeekDayName = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-US", { weekday: "short" });

const getWeekRangeLabel = (week) => {
  if (!week.length) return "";
  const start = new Date(week[0]);
  const end = new Date(week[6]);
  return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
};

/* ─── Pure monthly helpers (module level → stable refs) ─── */

const calcEntryHours = (e) => {
  const [inH, inM] = e.clockIn.split(":").map(Number);
  const [outH, outM] = e.clockOut.split(":").map(Number);
  return outH + outM / 60 - (inH + inM / 60) + (e.extraHours || 0);
};

const getMonthlyTimeEntries = (w, vKey) =>
  (w.timeEntries || []).filter((e) => e.date.startsWith(vKey));

const getMonthlyHours = (w, vKey) =>
  getMonthlyTimeEntries(w, vKey).reduce((sum, e) => sum + calcEntryHours(e), 0);

const getMonthlyMetersData = (w, vKey, orders) => {
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

const getMonthlyEarnings = (w, vKey, orders) => {
  if (w.paymentType === "meters")
    return Math.round(
      getMonthlyMetersData(w, vKey, orders).totalMeters * w.meterRate,
    );
  return Math.round(getMonthlyHours(w, vKey) * w.hourlyRate);
};

const getMonthlyPayments = (w, vKey) =>
  (w.payments || [])
    .filter((p) => p.date.startsWith(vKey))
    .reduce((s, p) => s + p.amount, 0);

const getBalance = (w, vKey, orders) =>
  getMonthlyEarnings(w, vKey, orders) - getMonthlyPayments(w, vKey);

/* ─── Module-level presentational components (memoized) ─── */

const SkillTag = memo(({ skill }) => {
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
      className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md"
      style={{ background: `${c}20`, color: c, border: `1px solid ${c}30` }}
    >
      {skill}
    </span>
  );
});
SkillTag.displayName = "SkillTag";

const StatusBadge = memo(({ status }) => (
  <span
    className="text-[10px] font-bold px-2 py-0.5 rounded-md"
    style={{
      background:
        status === "ACTIVE" ? "var(--stage-completed)20" : "var(--ink-muted)20",
      color:
        status === "ACTIVE" ? "var(--stage-completed)" : "var(--ink-muted)",
      border: `1px solid ${status === "ACTIVE" ? "var(--stage-completed)40" : "var(--ink-muted)40"}`,
    }}
  >
    {status === "ACTIVE" ? "On Duty" : "Off Duty"}
  </span>
));
StatusBadge.displayName = "StatusBadge";

const MonthNav = memo(({ year, month, onPrev, onNext, onToday }) => (
  <div className="flex items-center gap-2">
    <button
      onClick={onPrev}
      className="p-1.5 rounded-lg active:opacity-60"
      style={{ color: "var(--ink-muted)", background: "var(--surface-2)" }}
    >
      <Icons.chevronLeft />
    </button>
    <div
      className="text-sm font-bold min-w-[110px] text-center"
      style={{ color: "var(--ink)" }}
    >
      {MONTH_NAMES[month]} {year}
    </div>
    <button
      onClick={onNext}
      className="p-1.5 rounded-lg active:opacity-60"
      style={{ color: "var(--ink-muted)", background: "var(--surface-2)" }}
    >
      <Icons.chevronRight />
    </button>
    {!(year === CURRENT_YEAR && month === new Date().getMonth()) && (
      <button
        onClick={onToday}
        className="text-[10px] font-bold px-2 py-1 rounded-md ml-1"
        style={{ color: "var(--accent)", border: "1px solid var(--accent)" }}
      >
        Today
      </button>
    )}
  </div>
));
MonthNav.displayName = "MonthNav";

/* ─── Forms ─── */

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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          className="text-sm font-medium block mb-1.5"
          style={{ color: "var(--ink-muted)" }}
        >
          Date
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="w-full text-base p-3 rounded-xl"
          style={{
            border: `1px solid ${dateTaken ? "var(--stage-contract)" : "var(--border)"}`,
            background: "var(--bg)",
            color: "var(--ink)",
          }}
        />
        {dateTaken && (
          <div
            className="text-xs mt-1.5"
            style={{ color: "var(--stage-contract)" }}
          >
            ⚠ Entry already exists for this date.
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            className="text-sm font-medium block mb-1.5"
            style={{ color: "var(--ink-muted)" }}
          >
            Clock In
          </label>
          <input
            type="time"
            value={clockIn}
            onChange={(e) => setClockIn(e.target.value)}
            required
            className="w-full text-base p-3 rounded-xl"
            style={{
              border: "1px solid var(--border)",
              background: "var(--bg)",
              color: "var(--ink)",
            }}
          />
        </div>
        <div>
          <label
            className="text-sm font-medium block mb-1.5"
            style={{ color: "var(--ink-muted)" }}
          >
            Clock Out
          </label>
          <input
            type="time"
            value={clockOut}
            onChange={(e) => setClockOut(e.target.value)}
            required
            className="w-full text-base p-3 rounded-xl"
            style={{
              border: "1px solid var(--border)",
              background: "var(--bg)",
              color: "var(--ink)",
            }}
          />
        </div>
      </div>
      <div>
        <label
          className="text-sm font-medium block mb-1.5"
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
          className="w-full text-base p-3 rounded-xl"
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
            className="text-sm font-medium block mb-1.5"
            style={{ color: "var(--stage-contract)" }}
          >
            Extra Hours Note *
          </label>
          <input
            type="text"
            value={extraNote}
            onChange={(e) => setExtraNote(e.target.value)}
            placeholder="Why extra hours?"
            required={parseFloat(extraHours) > 0}
            className="w-full text-base p-3 rounded-xl"
            style={{
              border: "1px solid var(--stage-contract)",
              background: "var(--stage-contract)10",
              color: "var(--ink)",
            }}
          />
        </div>
      )}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 text-base font-medium py-3 rounded-xl"
          style={{
            background: "var(--surface-2)",
            color: "var(--ink)",
            border: "1px solid var(--border)",
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={dateTaken}
          className="flex-1 text-base font-bold py-3 rounded-xl text-white disabled:opacity-40"
          style={{ background: "var(--stage-completed)" }}
        >
          Save
        </button>
      </div>
    </form>
  );
}

function PaymentForm({ onSave, onCancel }) {
  const [date, setDate] = useState(formatDate(new Date()));
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ date, amount: parseFloat(amount), note });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          className="text-sm font-medium block mb-1.5"
          style={{ color: "var(--ink-muted)" }}
        >
          Date
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="w-full text-base p-3 rounded-xl"
          style={{
            border: "1px solid var(--border)",
            background: "var(--bg)",
            color: "var(--ink)",
          }}
        />
      </div>
      <div>
        <label
          className="text-sm font-medium block mb-1.5"
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
          required
          className="w-full text-base p-3 rounded-xl"
          style={{
            border: "1px solid var(--border)",
            background: "var(--bg)",
            color: "var(--ink)",
          }}
        />
      </div>
      <div>
        <label
          className="text-sm font-medium block mb-1.5"
          style={{ color: "var(--ink-muted)" }}
        >
          Note
        </label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Advance, salary, etc."
          className="w-full text-base p-3 rounded-xl"
          style={{
            border: "1px solid var(--border)",
            background: "var(--bg)",
            color: "var(--ink)",
          }}
        />
      </div>
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 text-base font-medium py-3 rounded-xl"
          style={{
            background: "var(--surface-2)",
            color: "var(--ink)",
            border: "1px solid var(--border)",
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 text-base font-bold py-3 rounded-xl text-white"
          style={{ background: "var(--accent)" }}
        >
          Save
        </button>
      </div>
    </form>
  );
}

/* ─── Data ─── */

// fake worker obj : id ,firstName, lastName, shortName, initials, role, skills, email, joined, paymentType, meterRate, status, attendance, assignments, payments, performance, notes, hourlyRate, timeEntries 
// db worker obj : id, full_name, phone, hire_date, payment_type, created_at, updated_at


const FAKE_WORKERS = [
  {
    id: "WRK-001", firstName: "Rachid", lastName: "Said", shortName: "R. Said", initials: "RS", role: "Carpenter", skills: ["Carpenter", "Installer"], phone: "0551 23 45 67", email: "r.said@dzwood.dz", joined: "2019-03-15", paymentType: "meters", meterRate: 5000, status: "ACTIVE",
    attendance: { [TODAY]: "PRESENT", "2026-07-03": "ABSENT", "2026-07-01": "ABSENT" },
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
    id: "WRK-002", firstName: "Amine", lastName: "Benali", shortName: "A. Benali", initials: "AB", role: "Finisher", skills: ["Finisher", "Carpenter"], phone: "0770 88 99 00", email: "a.benali@dzwood.dz", joined: "2020-06-01", paymentType: "hours", hourlyRate: 1100, status: "ACTIVE",
    attendance: { [TODAY]: "PRESENT", "2026-07-04": "ABSENT", "2026-07-03": "ABSENT" },
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
    id: "WRK-003", firstName: "Karim", lastName: "Amrani", shortName: "K. Amrani", initials: "KA", role: "Installer", skills: ["Installer", "Carpenter"], phone: "0540 11 22 33", email: "k.amrani@dzwood.dz", joined: "2021-01-10", paymentType: "meters", meterRate: 5000, status: "ACTIVE",
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
    id: "WRK-004", firstName: "Mohamed", lastName: "Draoui", shortName: "M. Draoui", initials: "MD", role: "Carpenter", skills: ["Carpenter", "Designer"], phone: "0555 44 55 66", email: "m.draoui@dzwood.dz", joined: "2018-11-20", paymentType: "hours", hourlyRate: 1400, status: "OFF",
    attendance: { [TODAY]: "ABSENT" },
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
    id: "WRK-005", firstName: "Yasmine", lastName: "Touati", shortName: "Y. Touati", initials: "YT", role: "Designer", skills: ["Designer", "Carpenter"], phone: "0661 77 88 99", email: "y.touati@dzwood.dz", joined: "2022-09-01", paymentType: "hours", hourlyRate: 1300, status: "ACTIVE",
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
    id: "WRK-006", firstName: "Hakim", lastName: "Zeroual", shortName: "H. Zeroual", initials: "HZ", role: "Carpenter", skills: ["Carpenter"], phone: "0790 12 34 56", email: "h.zeroual@dzwood.dz", joined: "2023-02-15", paymentType: "meters", meterRate: 5000, status: "ACTIVE",
    attendance: { [TODAY]: "ABSENT", "2026-07-01": "ABSENT" },
    assignments: [],
    payments: [],
    performance: { ordersCompleted: 12, onTimeRate: 75, avgQuality: 3.8 },
    notes: "New hire. Needs supervision on complex joints.",
  },
  {
    id: "WRK-007", firstName: "Nadia", lastName: "Bensalem", shortName: "N. Bensalem", initials: "NB", role: "Finisher", skills: ["Finisher", "Designer"], phone: "0560 66 77 88", email: "n.bensalem@dzwood.dz", joined: "2020-04-10", paymentType: "hours", hourlyRate: 1150, status: "ACTIVE",
    attendance: { [TODAY]: "PRESENT", "2026-07-03": "ABSENT" },
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

/* ─── Heavy memoized components (module level) ─── */

const WorkerCard = memo(function WorkerCard({ worker, vKey, orders, onOpen, onAttendanceChange }) {
  const todayStatus = worker.attendance?.[TODAY];
  const todayColor = todayStatus ? ATTENDANCE_COLORS[todayStatus] : ATTENDANCE_COLORS["NOT SET"];

  // Local memoized derivation — only recomputes when this worker's data changes
  const monthlyEarnings = useMemo(
    () => getMonthlyEarnings(worker, vKey, orders),
    [worker, vKey, orders],
  );

  return (
    <div
      onClick={() => onOpen(worker.id)}
      className="p-4 rounded-2xl active:scale-[0.98] transition-transform cursor-pointer"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
      }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
          style={{ background: "var(--surface-2)", color: "var(--accent)" }}
        >
          {worker.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className="text-base font-bold truncate"
              style={{ color: "var(--ink)" }}
            >
              {worker.shortName}
            </span>
            <StatusBadge status={worker.status} />
          </div>
          <div className="flex flex-wrap gap-1">
            {(worker.skills || ["fakeCarpenter", "fakeSkill451"]).map((s) => <SkillTag key={s} skill={s} />)}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div
            className="text-sm font-bold tabular-nums"
            style={{ color: "var(--stage-completed)" }}
          >
            {monthlyEarnings.toLocaleString()}{" "}
            <span className="text-[10px]">DZD</span>
          </div>
          <div className="text-[10px]" style={{ color: "var(--ink-muted)" }}>
            this month
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: "var(--ink-muted)" }}>
            {worker.id}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-md font-bold"
            style={{
              background:
                worker.paymentType === "meters"
                  ? "var(--stage-appointment)15"
                  : "var(--stage-completed)15",
              color:
                worker.paymentType === "meters"
                  ? "var(--stage-appointment)"
                  : "var(--stage-completed)",
            }}
          >
            {worker.paymentType === "meters" ? "Meters" : "Hourly"}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            const next = cycleStatus(todayStatus);
            onAttendanceChange(worker.id, TODAY, next);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
          style={{ background: todayColor, color: "#fff" }}
        >
          {todayStatus ? ATTENDANCE_LABELS[todayStatus] : "Not Set"}
        </button>
      </div>
    </div>
  );
});

const SalarySummary = memo(function SalarySummary({
  selected,
  monthlyEarned,
  monthlyPaid,
  monthlyBalance,
  viewMonth,
  viewYear,
  monthlyMetersData,
  onPrevMonth,
  onNextMonth,
  onTodayMonth,
}) {
  return (
    <div
      className="p-4 rounded-2xl"
      style={{
        background: "var(--accent-soft)",
        border: "1px solid rgba(254,189,17,0.15)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color: "var(--accent)" }}
        >
          {MONTH_NAMES[viewMonth]} {viewYear}
        </h3>
        <MonthNav
          year={viewYear}
          month={viewMonth}
          onPrev={onPrevMonth}
          onNext={onNextMonth}
          onToday={onTodayMonth}
        />
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div
          className="p-3 rounded-xl text-center"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          <div
            className="text-[10px] uppercase tracking-wider mb-1"
            style={{ color: "var(--ink-muted)" }}
          >
            Earned
          </div>
          <div
            className="text-base font-bold"
            style={{ color: "var(--stage-completed)" }}
          >
            {monthlyEarned?.toLocaleString()}
          </div>
        </div>
        <div
          className="p-3 rounded-xl text-center"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          <div
            className="text-[10px] uppercase tracking-wider mb-1"
            style={{ color: "var(--ink-muted)" }}
          >
            Paid
          </div>
          <div
            className="text-base font-bold"
            style={{ color: "var(--stage-appointment)" }}
          >
            {monthlyPaid.toLocaleString()}
          </div>
        </div>
        <div
          className="p-3 rounded-xl text-center"
          style={{
            background: "var(--surface)",
            border: `1px solid ${monthlyBalance >= 0 ? "var(--stage-completed)" : "var(--stage-contract)"}`,
          }}
        >
          <div
            className="text-[10px] uppercase tracking-wider mb-1"
            style={{ color: "var(--ink-muted)" }}
          >
            {monthlyBalance >= 0 ? "Remaining" : "Overpaid"}
          </div>
          <div
            className="text-base font-bold"
            style={{
              color:
                monthlyBalance >= 0 ? "var(--ink)" : "var(--stage-contract)",
            }}
          >
            {Math.abs(monthlyBalance).toLocaleString()}
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
  );
});

const WeekStrip = memo(function WeekStrip({
  year,
  weekIndex,
  yearWeeks,
  currentWeek,
  selected,
  onYearChange,
  onPrevWeek,
  onNextWeek,
  onJumpToToday,
  onAttendanceClick,
  weekRangeLabel,
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onYearChange(year - 1)}
            className="text-xs font-bold px-2 py-1 rounded-md"
            style={{
              color: "var(--ink-muted)",
              border: "1px solid var(--border)",
            }}
          >
            ← Year
          </button>
          <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>
            {year}
          </span>
          <button
            onClick={() => onYearChange(year + 1)}
            className="text-xs font-bold px-2 py-1 rounded-md"
            style={{
              color: "var(--ink-muted)",
              border: "1px solid var(--border)",
            }}
          >
            Year →
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPrevWeek()}
            disabled={weekIndex === 0}
            className="p-1 rounded-lg disabled:opacity-30"
            style={{ color: "var(--ink-muted)" }}
          >
            <Icons.chevronLeft />
          </button>
          <span
            className="text-xs font-medium"
            style={{ color: "var(--ink-muted)" }}
          >
            Week {weekIndex + 1}
          </span>
          <button
            onClick={() => onNextWeek()}
            disabled={weekIndex === yearWeeks.length - 1}
            className="p-1 rounded-lg disabled:opacity-30"
            style={{ color: "var(--ink-muted)" }}
          >
            <Icons.chevronRight />
          </button>
        </div>
      </div>
      <div
        className="text-xs font-medium mb-3 text-center"
        style={{ color: "var(--accent)" }}
      >
        {weekRangeLabel}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {currentWeek.map((d) => {
          const status = selected.attendance?.[d];
          const color = status ? ATTENDANCE_COLORS[status] : ATTENDANCE_COLORS["NOT SET"];
          const isToday = d === TODAY;
          return (
            <button
              key={d}
              onClick={() =>
                onAttendanceClick(selected.id, d, cycleStatus(status))
              }
              className="flex flex-col items-center justify-center py-3 px-1 rounded-xl gap-1 active:scale-95 transition-transform"
              style={{
                background: status ? color : "var(--surface-2)",
                color: status ? "#fff" : "var(--ink-muted)",
                border: isToday
                  ? `2px solid var(--accent)`
                  : `1px solid ${status ? color : "var(--border)"}`,
                opacity: status ? 1 : 0.7,
                minHeight: 64,
              }}
            >
              <span className="text-[10px] font-medium opacity-80">
                {getWeekDayName(d)}
              </span>
              <span className="text-lg font-bold">{new Date(d).getDate()}</span>
              <span className="text-[9px] font-bold uppercase tracking-wider">
                {status ? ATTENDANCE_LABELS[status] : "—"}
              </span>
            </button>
          );
        })}
      </div>
      <div className="flex justify-center mt-3">
        <button
          onClick={onJumpToToday}
          className="text-xs font-bold px-3 py-1.5 rounded-lg"
          style={{ color: "var(--accent)", border: "1px solid var(--accent)" }}
        >
          Jump to Today
        </button>
      </div>
    </div>
  );
});

const ListScreen = memo(function ListScreen({
  workers,
  filtered,
  search,
  setSearch,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
  roles,
  todayPresent,
  todayAbsent,
  todayNotSet,
  vKey,
  orders,
  onMarkAll,
  onOpenWorker,
  onAttendanceChange,
}) {
  return (
    <div className="flex flex-col h-full" style={{ background: "var(--bg)" }}>
      <div className="px-4 pt-4 pb-2 shrink-0">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--ink)" }}>
          Team
        </h1>
        <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
          })}
        </p>
      </div>

      <div
        className="mx-4 mb-3 p-3 rounded-xl shrink-0"
        style={{
          background: "var(--accent-soft)",
          border: "1px solid rgba(254,189,17,0.15)",
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: "var(--accent)" }}
            />
            <span
              className="text-xs font-bold"
              style={{ color: "var(--accent)" }}
            >
              Today
            </span>
          </div>
          <button
            onClick={onMarkAll}
            className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1"
            style={{ background: ATTENDANCE_COLORS.PRESENT, color: "#fff" }}
          >
            <Icons.check /> Mark All
          </button>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span
            className="flex items-center gap-1"
            style={{ color: "var(--ink)" }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: ATTENDANCE_COLORS.PRESENT }}
            />{" "}
            {todayPresent} Present
          </span>
          <span
            className="flex items-center gap-1"
            style={{ color: "var(--ink)" }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: "#dc2626" }}
            />{" "}
            {todayAbsent} Away
          </span>
          {todayNotSet > 0 && (
            <span
              className="flex items-center gap-1"
              style={{ color: "var(--ink)" }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: ATTENDANCE_COLORS["NOT SET"] }}
              />{" "}
              {todayNotSet} Not Set
            </span>
          )}
        </div>
      </div>

      <div className="mx-4 mb-3 shrink-0">
        <div
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
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
              style={{ color: "var(--ink-muted)" }}
            >
              <Icons.x />
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2 px-4 mb-3 overflow-x-auto no-scrollbar shrink-0">
        {roles.map((r) => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className="text-xs font-bold px-3 py-2 rounded-lg whitespace-nowrap transition-colors"
            style={{
              background:
                roleFilter === r ? "var(--surface-2)" : "var(--surface)",
              color: roleFilter === r ? "var(--ink)" : "var(--ink-muted)",
              border: `1px solid ${roleFilter === r ? "var(--border)" : "transparent"}`,
            }}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="flex gap-2 px-4 mb-3 shrink-0">
        {["ACTIVE", "OFF"].map((s) => {
          const count = workers.filter((w) => w.status === s).length;
          const active = statusFilter === s;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(statusFilter === s ? "All" : s)}
              className="text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5"
              style={{
                background: active ? "var(--surface-2)" : "var(--surface)",
                color: active ? "var(--ink)" : "var(--ink-muted)",
                border: `1px solid ${active ? "var(--border)" : "transparent"}`,
              }}
            >
              {s === "ACTIVE" ? "On Duty" : "Off Duty"}
              <span
                className="px-1.5 py-0.5 rounded text-[10px]"
                style={{ background: "var(--bg)", color: "var(--ink-muted)" }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-3 no-scrollbar">
        {filtered.map((w) => (
          <WorkerCard
            key={w.id}
            worker={w}
            vKey={vKey}
            orders={orders}
            onOpen={onOpenWorker}
            onAttendanceChange={onAttendanceChange}
          />
        ))}
        {filtered.length === 0 && (
          <div
            className="text-center py-12 text-sm"
            style={{ color: "var(--ink-muted)" }}
          >
            No workers match your filters.
          </div>
        )}
      </div>
    </div>
  );
});

const DetailScreen = memo(function DetailScreen({
  selected,
  activeTab,
  setActiveTab,
  onBack,
  year,
  weekIndex,
  yearWeeks,
  currentWeek,
  viewMonth,
  viewYear,
  vKey,
  orders,
  onYearChange,
  onPrevWeek,
  onNextWeek,
  onJumpToToday,
  onPrevMonth,
  onNextMonth,
  onTodayMonth,
  onAttendanceClick,
  weekRangeLabel,
  monthlyEarned,
  monthlyPaid,
  monthlyBalance,
  monthlyEntries,
  monthlyMetersData,
  onAddTimeEntry,
  onEditTimeEntry,
  onDeleteTimeEntry,
  onPrint,
  onAddPayment,
  onDeletePayment,
}) {
  return (
    <div
      className="flex flex-col h-full screen-enter"
      style={{ background: "var(--bg)" }}
    >
      <div
        className="flex items-center gap-3 px-4 py-3 shrink-0"
        style={{
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <button
          onClick={onBack}
          className="lg:hidden p-2 rounded-xl active:opacity-60"
          style={{ color: "var(--ink)", background: "var(--surface-2)" }}
        >
          <Icons.arrowLeft />
        </button>
        <div className="flex-1 min-w-0">
          <div
            className="text-base font-bold truncate"
            style={{ color: "var(--ink)" }}
          >
            {selected.full_name}
          </div>
          <div className="text-xs" style={{ color: "var(--ink-muted)" }}>
            id-{selected.id}  {selected.role}
          </div>
        </div>
        <StatusBadge status={selected.status} />
      </div>

      <div
        className="flex items-center shrink-0"
        style={{
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        {[
          { key: "attendance", label: "Attendance", icon: <Icons.calendar /> },
          { key: "work", label: "Work", icon: <Icons.briefcase /> },
          { key: "payments", label: "Pay", icon: <Icons.wallet /> },
          { key: "info", label: "Info", icon: <Icons.info /> },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className="flex-1 flex flex-col items-center gap-1 py-3 text-xs font-bold transition-colors relative"
            style={{
              color: activeTab === t.key ? "var(--accent)" : "var(--ink-muted)",
            }}
          >
            {t.icon}
            {t.label}
            {activeTab === t.key && (
              <div
                className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full"
                style={{ background: "var(--accent)" }}
              />
            )}
          </button>
        ))}
      </div>

      <div
        data-detail-scroll
        className="flex-1 overflow-y-auto no-scrollbar pb-24"
      >
        {activeTab === "attendance" && (
          <div className="p-4">
            <WeekStrip
              year={year}
              weekIndex={weekIndex}
              yearWeeks={yearWeeks}
              currentWeek={currentWeek}
              selected={selected}
              onYearChange={onYearChange}
              onPrevWeek={onPrevWeek}
              onNextWeek={onNextWeek}
              onJumpToToday={onJumpToToday}
              onAttendanceClick={onAttendanceClick}
              weekRangeLabel={weekRangeLabel}
            />
            <div
              className="p-4 rounded-2xl"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3
                  className="text-sm font-bold uppercase tracking-wider"
                  style={{ color: "var(--ink-muted)" }}
                >
                  Calendar
                </h3>
                <MonthNav
                  year={viewYear}
                  month={viewMonth}
                  onPrev={onPrevMonth}
                  onNext={onNextMonth}
                  onToday={onTodayMonth}
                />
              </div>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <div
                    key={d}
                    className="text-[10px] font-bold text-center uppercase py-1"
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
                    const status = selected.attendance?.[day.date];
                    const isToday = day.date === TODAY;
                    const color = status
                      ? ATTENDANCE_COLORS[status]
                      : ATTENDANCE_COLORS["NOT SET"];
                    return (
                      <button
                        key={day.date}
                        onClick={() =>
                          onAttendanceClick(
                            selected.id,
                            day.date,
                            cycleStatus(status),
                          )
                        }
                        className="aspect-square rounded-lg flex items-center justify-center text-xs font-bold active:scale-90 transition-transform"
                        style={{
                          background: status ? color : "var(--surface-2)",
                          color: status ? "#fff" : "var(--ink-muted)",
                          border: isToday
                            ? `2px solid ${status ? color : "var(--accent)"}`
                            : `1px solid ${status ? color : "var(--border)"}`,
                          opacity: status ? 1 : 0.5,
                        }}
                      >
                        {day.day}
                      </button>
                    );
                  }),
                )}
              </div>
              <div
                className="mt-4 flex items-center gap-3 text-[10px]"
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
          </div>
        )}

        {activeTab === "work" && (
          <div className="p-4 space-y-4">
            <SalarySummary
              selected={selected}
              monthlyEarned={monthlyEarned}
              monthlyPaid={monthlyPaid}
              monthlyBalance={monthlyBalance}
              viewMonth={viewMonth}
              viewYear={viewYear}
              monthlyMetersData={monthlyMetersData}
              onPrevMonth={onPrevMonth}
              onNextMonth={onNextMonth}
              onTodayMonth={onTodayMonth}
            />

            <div
              className="p-4 rounded-2xl"
              style={{
                background:
                  selected.paymentType === "meters"
                    ? "var(--stage-appointment)08"
                    : "var(--stage-completed)08",
                border: `1px solid ${selected.paymentType === "meters" ? "var(--stage-appointment)30" : "var(--stage-completed)30"}`,
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <h3
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{
                    color:
                      selected.paymentType === "meters"
                        ? "var(--stage-appointment)"
                        : "var(--stage-completed)",
                  }}
                >
                  {selected.paymentType === "meters"
                    ? "Meter-Based"
                    : "Hourly Payment"}
                </h3>
                <span
                  className="text-lg font-bold"
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
              <div className="text-xs" style={{ color: "var(--ink-muted)" }}>
                {selected.paymentType === "meters"
                  ? `${monthlyMetersData.totalMeters.toFixed(1)} m @ ${selected.meterRate?.toLocaleString() || "5000"} DZD/m`
                  : `${getMonthlyHours(selected, vKey).toFixed(1)} h @ ${selected.hourlyRate?.toLocaleString() || "1000"} DZD/h`}
              </div>
            </div>

            {selected.paymentType === "hours" && (
              <div
                className="p-4 rounded-2xl"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: "var(--ink-muted)" }}
                  >
                    Time Entries
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onPrint}
                      disabled={monthlyEntries.length === 0}
                      className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 disabled:opacity-30"
                      style={{
                        background: "var(--bg)",
                        border: "1px solid var(--border)",
                        color: "var(--ink)",
                      }}
                    >
                      <Icons.print /> Print
                    </button>
                    <button
                      onClick={() => onAddTimeEntry(null)}
                      className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1"
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
                    className="text-sm text-center py-6 rounded-xl"
                    style={{
                      background: "var(--bg)",
                      border: "1px dashed var(--border)",
                      color: "var(--ink-muted)",
                    }}
                  >
                    No time entries for {MONTH_NAMES[viewMonth]} {viewYear}.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {[...monthlyEntries]
                      .sort((a, b) => b.date.localeCompare(a.date))
                      .map((e, idx) => {
                        const [iH, iM] = e.clockIn.split(":").map(Number);
                        const [oH, oM] = e.clockOut.split(":").map(Number);
                        const regH = oH + oM / 60 - (iH + iM / 60);
                        const totalH = regH + (e.extraHours || 0);
                        const pay = Math.round(totalH * selected.hourlyRate);
                        return (
                          <div
                            key={`${e.date}-${idx}`}
                            className="p-3 rounded-xl flex items-center justify-between"
                            style={{
                              background: "var(--bg)",
                              border: "1px solid var(--border)",
                            }}
                          >
                            <div>
                              <div
                                className="text-sm font-bold"
                                style={{ color: "var(--ink)" }}
                              >
                                {e.date.slice(5)} · {e.clockIn} - {e.clockOut}
                              </div>
                              <div
                                className="text-xs"
                                style={{ color: "var(--ink-muted)" }}
                              >
                                {totalH.toFixed(1)}h{" "}
                                {e.extraHours > 0 && (
                                  <span
                                    style={{ color: "var(--stage-contract)" }}
                                  >
                                    +{e.extraHours}h extra
                                  </span>
                                )}{" "}
                                · {e.extraNote || "Regular"}
                              </div>
                            </div>
                            <div className="text-right">
                              <div
                                className="text-sm font-bold tabular-nums"
                                style={{ color: "var(--stage-completed)" }}
                              >
                                {pay.toLocaleString()} DZD
                              </div>
                              <div className="flex items-center justify-end gap-2 mt-1">
                                <button
                                  onClick={() => onEditTimeEntry(e)}
                                  style={{ color: "var(--stage-appointment)" }}
                                >
                                  <Icons.edit />
                                </button>
                                <button
                                  onClick={() => onDeleteTimeEntry(e.date)}
                                  style={{ color: "var(--stage-contract)" }}
                                >
                                  <Icons.trash />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    <div
                      className="p-3 rounded-xl flex items-center justify-between mt-2"
                      style={{
                        background: "var(--surface-2)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <span
                        className="text-xs font-bold"
                        style={{ color: "var(--ink-muted)" }}
                      >
                        Total ({monthlyEntries.length} days)
                      </span>
                      <div className="flex items-center gap-4">
                        <span
                          className="text-sm font-bold"
                          style={{ color: "var(--ink)" }}
                        >
                          {getMonthlyHours(selected, vKey).toFixed(1)}h
                        </span>
                        <span
                          className="text-sm font-bold"
                          style={{ color: "var(--stage-completed)" }}
                        >
                          {monthlyEarned.toLocaleString()} DZD
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {selected.paymentType === "meters" && (
              <div
                className="p-4 rounded-2xl"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: "var(--ink-muted)" }}
                  >
                    Monthly Work
                  </h3>
                  <div
                    className="text-[10px] px-2 py-1 rounded font-bold"
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
                    className="p-3 rounded-xl text-center"
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
                    className="p-3 rounded-xl text-center"
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
                    className="text-sm text-center py-6 rounded-xl"
                    style={{
                      background: "var(--bg)",
                      border: "1px dashed var(--border)",
                      color: "var(--ink-muted)",
                    }}
                  >
                    No kitchens assigned in {MONTH_NAMES[viewMonth]} {viewYear}.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {monthlyMetersData.kitchens.map((k, idx) => (
                      <div
                        key={`${k.orderId}-${idx}`}
                        className="p-3 rounded-xl flex items-center justify-between"
                        style={{
                          background: "var(--bg)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        <div className="min-w-0 flex-1">
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
                            className="text-sm font-bold"
                            style={{ color: "var(--stage-appointment)" }}
                          >
                            {k.meters.toFixed(1)} m
                          </div>
                          <div
                            className="text-[11px] font-medium"
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
          </div>
        )}

        {activeTab === "payments" && (
          <div className="p-4 space-y-4">
            <div
              className="p-4 rounded-2xl"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: "var(--ink-muted)" }}
                >
                  Payments — {MONTH_NAMES[viewMonth]}
                </h3>
                <button
                  onClick={onAddPayment}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"
                  style={{ background: "var(--accent)", color: "#fff" }}
                >
                  <Icons.plus /> Add
                </button>
              </div>
              <div className="space-y-2">
                {selected.payments?.filter((p) => p.date.startsWith(vKey))
                  .length === 0 && (
                    <div
                      className="text-sm text-center py-6"
                      style={{ color: "var(--ink-muted)" }}
                    >
                      No payments recorded
                    </div>
                  )}
                {selected.payments
                  ?.filter((p) => p.date.startsWith(vKey))
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map((p) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-xl flex items-center justify-between"
                      style={{
                        background: "var(--bg)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div>
                        <div
                          className="text-base font-bold"
                          style={{ color: "var(--ink)" }}
                        >
                          {p.amount.toLocaleString()} DZD
                        </div>
                        <div
                          className="text-xs"
                          style={{ color: "var(--ink-muted)" }}
                        >
                          {p.date} · {p.note}
                        </div>
                      </div>
                      <button
                        onClick={() => onDeletePayment(p.id)}
                        style={{ color: "var(--stage-contract)" }}
                      >
                        <Icons.trash />
                      </button>
                    </div>
                  ))}
              </div>
              <div
                className="mt-3 p-3 rounded-xl flex items-center justify-between"
                style={{ background: "var(--accent-soft)" }}
              >
                <span
                  className="text-sm font-bold"
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
          </div>
        )}

        {activeTab === "info" && (
          <div className="p-4 space-y-4">
            <div
              className="p-4 rounded-2xl"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              <h3
                className="text-xs font-bold uppercase tracking-wider mb-3"
                style={{ color: "var(--ink-muted)" }}
              >
                Contact
              </h3>
              <div className="space-y-2">
                <div
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <span style={{ color: "var(--stage-appointment)" }}>📱</span>
                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--ink)" }}
                  >
                    {selected.phone}
                  </span>
                </div>
                <div
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <span style={{ color: "var(--stage-appointment)" }}>✉️</span>
                  <span className="text-sm" style={{ color: "var(--ink)" }}>
                    {selected.email}
                  </span>
                </div>
              </div>
            </div>
            <div
              className="p-4 rounded-2xl"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              <h3
                className="text-xs font-bold uppercase tracking-wider mb-3"
                style={{ color: "var(--ink-muted)" }}
              >
                Performance
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div
                  className="p-3 rounded-xl text-center"
                  style={{
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div
                    className="text-xl font-bold"
                    style={{ color: "var(--accent)" }}
                  >
                    {selected.performance?.ordersCompleted}
                  </div>
                  <div
                    className="text-[10px] uppercase tracking-wider mt-1"
                    style={{ color: "var(--ink-muted)" }}
                  >
                    Orders Done
                  </div>
                </div>
                <div
                  className="p-3 rounded-xl text-center"
                  style={{
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div
                    className="text-xl font-bold"
                    style={{
                      color:
                        selected.performance?.onTimeRate >= 90
                          ? "var(--stage-completed)"
                          : "var(--accent)",
                    }}
                  >
                    {selected.performance?.onTimeRate || 10}%
                  </div>
                  <div
                    className="text-[10px] uppercase tracking-wider mt-1"
                    style={{ color: "var(--ink-muted)" }}
                  >
                    On-Time Rate
                  </div>
                </div>
                <div
                  className="p-3 rounded-xl text-center"
                  style={{
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div
                    className="text-xl font-bold flex items-center justify-center gap-1"
                    style={{ color: "var(--stage-production)" }}
                  >
                    {selected.performance?.avgQuality}
                    <span style={{ color: "var(--accent)" }}>
                      <Icons.star />
                    </span>
                  </div>
                  <div
                    className="text-[10px] uppercase tracking-wider mt-1"
                    style={{ color: "var(--ink-muted)" }}
                  >
                    Avg Quality
                  </div>
                </div>
                <div
                  className="p-3 rounded-xl text-center"
                  style={{
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div
                    className="text-xl font-bold"
                    style={{ color: "var(--stage-appointment)" }}
                  >
                    {selected.paymentType === "meters"
                      ? `${monthlyMetersData.totalMeters.toFixed(1)}m`
                      : `${getMonthlyHours(selected, vKey).toFixed(1)}h`}
                  </div>
                  <div
                    className="text-[10px] uppercase tracking-wider mt-1"
                    style={{ color: "var(--ink-muted)" }}
                  >
                    {MONTH_NAMES[viewMonth]}
                  </div>
                </div>
              </div>
            </div>
            <div
              className="p-4 rounded-2xl"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              <h3
                className="text-xs font-bold uppercase tracking-wider mb-2"
                style={{ color: "var(--ink-muted)" }}
              >
                Notes
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--ink)" }}
              >
                {selected.notes}
              </p>
            </div>
            <div className="space-y-2">
              <button
                className="w-full justify-center text-sm font-bold px-4 py-3 rounded-xl flex items-center gap-2"
                style={{ background: "var(--accent)", color: "#000" }}
              >
                <Icons.briefcase /> Assign to Order
              </button>
              <div className="flex gap-2">
                <button
                  className="flex-1 justify-center text-sm font-bold px-4 py-3 rounded-xl flex items-center gap-2"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    color: "var(--ink)",
                  }}
                >
                  <Icons.edit /> Edit Profile
                </button>
                <button
                  className="flex-1 justify-center text-sm font-bold px-4 py-3 rounded-xl flex items-center gap-2"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    color: "var(--ink)",
                  }}
                >
                  <Icons.calendar /> Time Off
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

/* ─── Main App ─── */

export default function WorkersApp({ workersData, orders = [] }) {
  const [screen, setScreen] = useState("list");
  const [activeTab, setActiveTab] = useState("attendance");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedId, setSelectedId] = useState(workersData[0].id);
  const [year, setYearState] = useState(CURRENT_YEAR);
  const [weekIndex, setWeekIndexState] = useState(() => {
    const weeks = getYearWeeks(CURRENT_YEAR);
    const todayWeek = weeks.findIndex((w) => w.includes(TODAY));
    return todayWeek >= 0 ? todayWeek : 0;
  });
  const [viewMonth, setViewMonthState] = useState(new Date().getMonth());
  const [viewYear, setViewYearState] = useState(CURRENT_YEAR);
  // const [workers, setWorkers] = useState(WORKERS);
  const [workers, setWorkers] = useState(workersData);

  const [showTimeEntryModal, setShowTimeEntryModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);

  /* ─── Stable setters (so memoized children don't re-render on parent re-render) ─── */
  const setYear = useCallback((y) => setYearState(y), []);
  const setWeekIndex = useCallback((i) => setWeekIndexState(i), []);
  const setViewMonth = useCallback((m) => setViewMonthState(m), []);
  const setViewYear = useCallback((y) => setViewYearState(y), []);
  const setScreenState = useCallback((s) => setScreen(s), []);
  const setActiveTabState = useCallback((t) => setActiveTab(t), []);
  const setSearchState = useCallback((s) => setSearch(s), []);
  const setRoleFilterState = useCallback((r) => setRoleFilter(r), []);
  const setStatusFilterState = useCallback((s) => setStatusFilter(s), []);

  /* ─── Memoized derivations ─── */
  const selected = useMemo(
    () => workers.find((w) => w.id === selectedId) || workers[0],
    [workers, selectedId],
  );
  const yearWeeks = useMemo(() => getYearWeeks(year), [year]);
  const currentWeek = useMemo(() => getWeekDates(year, weekIndex), [year, weekIndex]);
  const vKey = useMemo(() => monthKey(viewYear, viewMonth), [viewYear, viewMonth]);
  const weekRangeLabel = useMemo(() => getWeekRangeLabel(currentWeek), [currentWeek]);
  const roles = useMemo(() => ["All", ...new Set(workersData.map((w) => w.role || '/'))], []);
  const filtered = useMemo(() => workers.filter((w) => {
    const haystack = `${w.firstName} ${w.lastName} ${w.shortName} ${w.id} ${(w.skills || []).join(" ")}`.toLowerCase();
    return haystack.includes(search.toLowerCase()) &&
      (roleFilter === "All" || w.role === roleFilter) &&
      (statusFilter === "All" || w.status === statusFilter);
  }), [search, roleFilter, statusFilter, workers]);
  const todayPresent = useMemo(() => workers.filter((w) => w.attendance[TODAY] === "PRESENT").length, [workers]);
  const todayAbsent = useMemo(() => workers.filter((w) => ["ABSENT"].includes(w.attendance?.[TODAY])).length, [workers]);
  const todayNotSet = useMemo(() => workers.filter((w) => !w.attendance?.[TODAY]).length, [workers]);

  const monthlyEarned = useMemo(
    () => getMonthlyEarnings(selected, vKey, orders),
    [selected, vKey, orders],
  );
  const monthlyPaid = useMemo(
    () => getMonthlyPayments(selected, vKey),
    [selected, vKey],
  );
  const monthlyBalance = useMemo(
    () => monthlyEarned - monthlyPaid,
    [monthlyEarned, monthlyPaid],
  );
  const monthlyEntries = useMemo(
    () => getMonthlyTimeEntries(selected, vKey),
    [selected, vKey],
  );
  const monthlyMetersData = useMemo(
    () =>
      selected.paymentType === "meters"
        ? getMonthlyMetersData(selected, vKey, orders)
        : null,
    [selected, vKey, orders],
  );

  /* ─── Stable handlers (useCallback) ─── */
  const openWorker = useCallback((id) => {
    setSelectedId(id);
    setActiveTab("attendance");
    setScreen("detail");
    // On desktop, also reset the detail panel scroll
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      requestAnimationFrame(() => {
        document
          .querySelector("[data-detail-scroll]")
          ?.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  }, []);

  const goBack = useCallback(() => setScreen("list"), []);

  const goTodayWeek = useCallback(() => {
    const todayWeek = getYearWeeks(CURRENT_YEAR).findIndex((w) =>
      w.includes(TODAY),
    );
    setWeekIndexState(todayWeek >= 0 ? todayWeek : 0);
    setYearState(CURRENT_YEAR);
  }, []);

  const setAttendance = useCallback((workerId, date, status) => {
    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id !== workerId) return w;
        const next = { ...w.attendance };
        if (status === undefined) delete next[date];
        else next[date] = status;
        return { ...w, attendance: next };
      }),
    );
  }, []);

  const addTimeEntry = useCallback(
    (entry) => {
      setWorkers((prev) =>
        prev.map((w) => {
          if (w.id !== selectedId) return w;
          const exists = w.timeEntries?.findIndex((e) => e.date === entry.date);
          let newEntries = w.timeEntries ? [...w.timeEntries] : [];
          if (exists >= 0) newEntries[exists] = entry;
          else newEntries.push(entry);
          return { ...w, timeEntries: newEntries };
        }),
      );
      setShowTimeEntryModal(false);
      setEditingEntry(null);
    },
    [selectedId],
  );

  const deleteTimeEntry = useCallback(
    (date) => {
      setWorkers((prev) =>
        prev.map((w) => {
          if (w.id !== selectedId) return w;
          return {
            ...w,
            timeEntries: w.timeEntries?.filter((e) => e.date !== date),
          };
        }),
      );
    },
    [selectedId],
  );

  const addPayment = useCallback(
    (payment) => {
      setWorkers((prev) =>
        prev.map((w) => {
          if (w.id !== selectedId) return w;
          return {
            ...w,
            payments: [
              ...(w.payments || []),
              { ...payment, id: `P-${Date.now()}` },
            ],
          };
        }),
      );
      setShowPaymentModal(false);
    },
    [selectedId],
  );

  const deletePayment = useCallback(
    (pid) => {
      setWorkers((prev) =>
        prev.map((w) => {
          if (w.id !== selectedId) return w;
          return { ...w, payments: w.payments?.filter((p) => p.id !== pid) };
        }),
      );
    },
    [selectedId],
  );

  const goPrevMonth = useCallback(() => {
    setViewMonthState((m) => {
      if (m === 0) {
        setViewYearState((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }, []);
  const goNextMonth = useCallback(() => {
    setViewMonthState((m) => {
      if (m === 11) {
        setViewYearState((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }, []);
  const goCurrentMonth = useCallback(() => {
    setViewMonthState(new Date().getMonth());
    setViewYearState(CURRENT_YEAR);
  }, []);

  const prevWeek = useCallback(
    () => setWeekIndexState((i) => Math.max(0, i - 1)),
    [],
  );
  const nextWeek = useCallback(
    () => setWeekIndexState((i) => Math.min(yearWeeks.length - 1, i + 1)),
    [yearWeeks.length],
  );

  const markAllPresent = useCallback(() => {
    setWorkers((prev) =>
      prev.map((w) =>
        w.attendance?.[TODAY]
          ? w
          : { ...w, attendance: { ...w.attendance, [TODAY]: "PRESENT" } },
      ),
    );
  }, []);

  const openAddTimeEntry = useCallback(() => {
    setEditingEntry(null);
    setShowTimeEntryModal(true);
  }, []);
  const openEditTimeEntry = useCallback((entry) => {
    setEditingEntry(entry);
    setShowTimeEntryModal(true);
  }, []);
  const openAddPayment = useCallback(() => setShowPaymentModal(true), []);

  /* ─── Print (stable per monthlyEntries) ─── */
  const printMonthlyHours = useCallback(() => {
    const win = window.open("", "_blank", "width=900,height=900");
    if (!win) return;
    let totalHours = 0,
      totalExtra = 0,
      totalPay = 0;
    const rows = [...monthlyEntries]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((e) => {
        const [inH, inM] = e.clockIn.split(":").map(Number);
        const [outH, outM] = e.clockOut.split(":").map(Number);
        const regH = outH + outM / 60 - (inH + inM / 60);
        const totalH = regH + (e.extraHours || 0);
        const pay = Math.round(totalH * selected.hourlyRate);
        totalHours += regH;
        totalExtra += e.extraHours || 0;
        totalPay += pay;
        const d = new Date(e.date);
        return `<tr><td>${e.date}</td><td>${d.toLocaleDateString("en-US", { weekday: "short" })}</td><td>${e.clockIn}</td><td>${e.clockOut}</td><td style="text-align:right">${regH.toFixed(1)}h</td><td style="text-align:right">${e.extraHours || 0}h</td><td>${e.extraNote || ""}</td><td style="text-align:right;font-weight:700">${pay.toLocaleString()} DZD</td></tr>`;
      })
      .join("");
    win.document
      .write(`<!doctype html><html><head><meta charset="utf-8"><title>${selected.firstName} ${selected.lastName} — ${MONTH_NAMES[viewMonth]} ${viewYear}</title>
      <style>* { box-sizing: border-box; } body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 32px; color: #111; max-width: 900px; margin: 0 auto; } h1 { margin: 0 0 4px; font-size: 22px; } .sub { color: #666; font-size: 13px; margin-bottom: 20px; } .meta { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 20px; } .card { padding: 12px; border: 1px solid #e5e5e5; border-radius: 8px; } .lbl { font-size: 10px; text-transform: uppercase; color: #888; letter-spacing: .04em; } .val { font-size: 16px; font-weight: 700; margin-top: 2px; } table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; } th, td { padding: 8px 6px; border-bottom: 1px solid #eee; text-align: left; } th { background: #f7f7f7; font-size: 10px; text-transform: uppercase; letter-spacing: .04em; color: #666; } .total-row td { font-weight: 700; border-top: 2px solid #111; border-bottom: none; padding-top: 12px; font-size: 13px; } .sig { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-top: 40px; font-size: 12px; } .sig div { border-top: 1px solid #111; padding-top: 6px; text-align: center; color: #666; } .no-print { margin-bottom: 16px; } .no-print button { padding: 8px 16px; background: #111; color: #fff; border: none; border-radius: 6px; cursor: pointer; } @media print { body { padding: 16px; } .no-print { display: none; } }</style></head><body>
      <div class="no-print"><button onclick="window.print()">🖨 Print</button></div>
      <h1>${selected.firstName} ${selected.lastName} <span style="color:#666;font-weight:400;font-size:16px">— ${selected.id}</span></h1>
      <div class="sub">Monthly Hours Report · ${MONTH_NAMES[viewMonth]} ${viewYear} · ${selected.hourlyRate.toLocaleString()} DZD/h</div>
      <div class="meta"><div class="card"><div class="lbl">Days Worked</div><div class="val">${monthlyEntries.length}</div></div><div class="card"><div class="lbl">Total Hours</div><div class="val">${(totalHours + totalExtra).toFixed(1)}h</div></div><div class="card"><div class="lbl">Total Pay</div><div class="val">${totalPay.toLocaleString()} DZD</div></div></div>
      <table><thead><tr><th>Date</th><th>Day</th><th>In</th><th>Out</th><th style="text-align:right">Hours</th><th style="text-align:right">Extra</th><th>Note</th><th style="text-align:right">Pay</th></tr></thead><tbody>${rows || '<tr><td colspan="8" style="text-align:center;color:#888;padding:18px">No entries this month.</td></tr>'}${monthlyEntries.length > 0 ? `<tr class="total-row"><td colspan="4">TOTAL</td><td style="text-align:right">${totalHours.toFixed(1)}h</td><td style="text-align:right">${totalExtra.toFixed(1)}h</td><td></td><td style="text-align:right">${totalPay.toLocaleString()} DZD</td></tr>` : ""}</tbody></table>
      <div class="sig"><div>Worker signature</div><div>Manager signature</div></div>
      <div style="margin-top:24px;font-size:11px;color:#888;text-align:center">Printed on ${new Date().toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}</div>
      </body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 250);
  }, [selected, monthlyEntries, viewMonth, viewYear]);

  /* ─── Render ─── */
  return (
    <div
      className="h-screen w-full flex flex-col lg:flex-row overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      <GlobalStyles />

      {/* Left: Worker list (full screen on mobile, sidebar on desktop) */}
      <div className={`${screen === "list" ? "flex" : "hidden"} lg:flex w-full lg:w-96 xl:w-[620px] flex-col shrink-0 h-full border-b lg:border-b-0 lg:border-r`}    >
        <ListScreen
          workers={workers}
          filtered={filtered}
          search={search}
          setSearch={setSearchState}
          roleFilter={roleFilter}
          setRoleFilter={setRoleFilterState}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilterState}
          roles={roles}
          todayPresent={todayPresent}
          todayAbsent={todayAbsent}
          todayNotSet={todayNotSet}
          vKey={vKey}
          orders={orders}
          onMarkAll={markAllPresent}
          onOpenWorker={openWorker}
          onAttendanceChange={setAttendance}
        />
      </div>

      {/* Right: Worker detail (full screen on mobile, main panel on desktop) */}
      <div
        className={`${screen === "detail" ? "flex" : "hidden"} lg:flex flex-1 flex-col min-w-0`}
      >
        <DetailScreen
          selected={selected}
          activeTab={activeTab}
          setActiveTab={setActiveTabState}
          onBack={goBack}
          year={year}
          weekIndex={weekIndex}
          yearWeeks={yearWeeks}
          currentWeek={currentWeek}
          viewMonth={viewMonth}
          viewYear={viewYear}
          vKey={vKey}
          orders={orders}
          onYearChange={setYear}
          onPrevWeek={prevWeek}
          onNextWeek={nextWeek}
          onJumpToToday={goTodayWeek}
          onPrevMonth={goPrevMonth}
          onNextMonth={goNextMonth}
          onTodayMonth={goCurrentMonth}
          onAttendanceClick={setAttendance}
          weekRangeLabel={weekRangeLabel}
          monthlyEarned={monthlyEarned}
          monthlyPaid={monthlyPaid}
          monthlyBalance={monthlyBalance}
          monthlyEntries={monthlyEntries}
          monthlyMetersData={monthlyMetersData}
          onAddTimeEntry={openAddTimeEntry}
          onEditTimeEntry={openEditTimeEntry}
          onDeleteTimeEntry={deleteTimeEntry}
          onPrint={printMonthlyHours}
          onAddPayment={openAddPayment}
          onDeletePayment={deletePayment}
        />
      </div>

      {/* Modals — overlay the whole viewport on both mobile and desktop */}
      {showTimeEntryModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4"
          style={{ background: "rgba(0,0,0,0.7)" }}
        >
          <div
            className="w-full max-w-md lg:max-w-xl p-5 rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            <h3
              className="text-lg font-bold mb-4"
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

      {showPaymentModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4"
          style={{ background: "rgba(0,0,0,0.7)" }}
        >
          <div
            className="w-full max-w-md lg:max-w-xl p-5 rounded-t-3xl sm:rounded-3xl"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            <h3
              className="text-lg font-bold mb-4"
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
