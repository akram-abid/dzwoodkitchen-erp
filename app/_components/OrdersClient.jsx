"use client";

import { useState, useMemo, useEffect } from "react";
import { fetchOrders, updateOrderClient } from "../api/orders/orders";

/* ─── Icons ─── */
const Icons = {
  search: () => (
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
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  ),
  x: () => (
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
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
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
  more: () => (
    <svg
      width="14"
      height="14"
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
  phone: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  mapPin: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  package: () => (
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
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  ),
  edit: () => (
    <svg
      width="14"
      height="14"
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
  print: () => (
    <svg
      width="14"
      height="14"
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
  trash: () => (
    <svg
      width="14"
      height="14"
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
  calendar: () => (
    <svg
      width="14"
      height="14"
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
  check: () => (
    <svg
      width="12"
      height="12"
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
  arrowRight: () => (
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
      <path d="m12 5 7 7-7 7" />
    </svg>
  ),
  arrowLeft: () => (
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
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  ),
  truck: () => (
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
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <path d="M15 18H9" />
      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
      <circle cx="17" cy="18" r="2" />
      <circle cx="7" cy="18" r="2" />
    </svg>
  ),
  alertCircle: () => (
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
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  ),
  alertTriangle: () => (
    <svg
      width="14"
      height="14"
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
  ban: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="4.93" x2="19.07" y1="4.93" y2="19.07" />
    </svg>
  ),
  party: () => (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5.8 11.3 2 22l10.7-3.79" />
      <path d="M4 3h.01" />
      <path d="M22 8h.01" />
      <path d="M15 2h.01" />
      <path d="M22 20h.01" />
      <path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10" />
    </svg>
  ),
  clock: () => (
    <svg
      width="14"
      height="14"
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
  userCheck: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <polyline points="16 11 18 13 22 9" />
    </svg>
  ),
  userPlus: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" x2="19" y1="8" y2="14" />
      <line x1="22" x2="16" y1="11" y2="11" />
    </svg>
  ),
  chevLeft: () => (
    <svg
      width="14"
      height="14"
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
  chevRight: () => (
    <svg
      width="14"
      height="14"
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
  sparkles: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
    </svg>
  ),
  ruler: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 16l8-8 8 8-8 8z" />
      <path d="M6 12l2 2" />
      <path d="M9 9l2 2" />
      <path d="M12 6l2 2" />
    </svg>
  ),
  layers: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  ),
  receipt: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 2v20l3-2 3 2 3-2 3 2 3-2 3 2V2l-3 2-3-2-3 2-3-2-3 2Z" />
      <path d="M8 7h8" />
      <path d="M8 11h8" />
      <path d="M8 15h5" />
    </svg>
  ),
  users: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
};

/* ─── Data ─── */
const WORKERS_LIST = [
  "R. Said",
  "A. Benali",
  "K. Amrani",
  "M. Draoui",
  "L. Zertal",
  "Y. Kessous",
];

const ALL_ORDERS = [
  {
    id: "#2041",
    client: "A. Benali",
    phone: "0551 23 45 67",
    address: "Hydra, Algiers",
    project: "Kitchen cabinets + island",
    stage: "IN_PRODUCTION",
    worker: "R. Said",
    amount: 45000,
    paid: 22500,
    dueDate: "2026-07-05",
    created: "2026-06-20",
    items: [
      { name: "Cabinet carcasses", qty: 12, unit: "pcs", l: 60, w: 60, h: 80 },
      { name: "Island frame", qty: 1, unit: "pcs", l: 120, w: 80, h: 90 },
      { name: "Hardware set", qty: 1, unit: "set", l: 0, w: 0, h: 0 },
    ],
    payments: [
      { date: "2026-06-20", amount: 15000 },
      { date: "2026-06-25", amount: 7500 },
    ],
    missingItems: [],
    technical: { truckDistance: "", floor: "", fee: "" },
  },
  {
    id: "#2038",
    client: "K. Amrani",
    phone: "0770 88 99 00",
    address: "Bab Ezzouar",
    project: "Dining table + 6 chairs",
    stage: "IN_PRODUCTION",
    worker: "A. Benali",
    amount: 62000,
    paid: 31000,
    dueDate: "2026-07-06",
    created: "2026-06-15",
    items: [
      { name: "Oak table top", qty: 1, unit: "pcs", l: 180, w: 90, h: 4 },
      { name: "Chair frames", qty: 6, unit: "pcs", l: 45, w: 45, h: 100 },
      { name: "Upholstery", qty: 6, unit: "m²", l: 0, w: 0, h: 0 },
    ],
    payments: [{ date: "2026-06-15", amount: 31000 }],
    missingItems: [
      { name: "Upholstery", qty: 6, unit: "m²", notes: "Supplier delayed" },
    ],
    technical: { truckDistance: 45, floor: 4, fee: 8500 },
  },
  {
    id: "#2045",
    client: "S. Merzoug",
    phone: "0540 11 22 33",
    address: "Staoueli",
    project: "Full kitchen renovation",
    stage: "CONTRACT",
    worker: "Unassigned",
    amount: 128000,
    paid: 0,
    dueDate: "2026-07-20",
    created: "2026-07-01",
    items: [
      { name: "Cabinets", qty: 20, unit: "pcs", l: 60, w: 60, h: 80 },
      { name: "Countertop", qty: 1, unit: "pcs", l: 300, w: 60, h: 4 },
      { name: "Sink & faucet", qty: 1, unit: "set", l: 0, w: 0, h: 0 },
    ],
    payments: [],
    missingItems: [],
    technical: { truckDistance: "", floor: "", fee: "" },
  },
  {
    id: "#2042",
    client: "F. Hadj",
    phone: "0555 44 55 66",
    address: "El Biar",
    project: "Wardrobe + vanity",
    stage: "READY_TO_DELIVER",
    worker: "R. Said",
    amount: 34000,
    paid: 34000,
    dueDate: "2026-07-05",
    created: "2026-06-25",
    items: [
      { name: "Wardrobe carcass", qty: 1, unit: "pcs", l: 200, w: 60, h: 240 },
      { name: "Mirror door", qty: 2, unit: "pcs", l: 40, w: 120, h: 2 },
      { name: "Drawers", qty: 4, unit: "pcs", l: 80, w: 50, h: 20 },
    ],
    payments: [{ date: "2026-06-25", amount: 34000 }],
    missingItems: [
      {
        name: "Door handles",
        qty: 3,
        unit: "pcs",
        notes: "Wrong finish — re-order chrome",
      },
      { name: "Hinges", qty: 8, unit: "pcs", notes: "Backorder from supplier" },
    ],
    technical: { truckDistance: 30, floor: 2, fee: 4500 },
  },
  {
    id: "#2035",
    client: "M. Boudiaf",
    phone: "0661 77 88 99",
    address: "Oran — Es Sénia",
    project: "Office desk set",
    stage: "COMPLETED",
    worker: "M. Draoui",
    amount: 28000,
    paid: 28000,
    dueDate: "2026-06-28",
    created: "2026-06-10",
    items: [
      { name: "Desk frame", qty: 1, unit: "pcs", l: 160, w: 80, h: 75 },
      { name: "Drawer units", qty: 2, unit: "pcs", l: 40, w: 50, h: 60 },
    ],
    payments: [{ date: "2026-06-10", amount: 28000 }],
    missingItems: [],
    technical: { truckDistance: 80, floor: 1, fee: 6000 },
    completedAt: "2026-06-28",
  },
  {
    id: "#2048",
    client: "L. Zertal",
    phone: "0790 12 34 56",
    address: "Constantine",
    project: "Bookshelves x3",
    stage: "APPOINTMENT",
    worker: "Unassigned",
    amount: 18500,
    paid: 0,
    dueDate: "2026-07-12",
    created: "2026-07-03",
    items: [
      { name: "Shelf units", qty: 3, unit: "pcs", l: 100, w: 30, h: 200 },
    ],
    payments: [],
    missingItems: [],
    technical: { truckDistance: "", floor: "", fee: "" },
  },
  {
    id: "#2040",
    client: "Y. Kessous",
    phone: "0550 98 76 54",
    address: "Boumerdès",
    project: "TV wall unit",
    stage: "IN_PRODUCTION",
    worker: "K. Amrani",
    amount: 52000,
    paid: 26000,
    dueDate: "2026-07-08",
    created: "2026-06-22",
    items: [
      { name: "Wall frame", qty: 1, unit: "pcs", l: 300, w: 40, h: 200 },
      { name: "Floating shelves", qty: 4, unit: "pcs", l: 80, w: 25, h: 4 },
      { name: "LED strip", qty: 2, unit: "m", l: 0, w: 0, h: 0 },
    ],
    payments: [{ date: "2026-06-22", amount: 26000 }],
    missingItems: [],
    technical: { truckDistance: "", floor: "", fee: "" },
  },
  {
    id: "#2032",
    client: "R. Larbi",
    phone: "0777 33 44 55",
    address: "Blida",
    project: "Bathroom vanity",
    stage: "COMPLETED",
    worker: "A. Benali",
    amount: 22000,
    paid: 22000,
    dueDate: "2026-06-25",
    created: "2026-06-05",
    items: [
      { name: "Vanity carcass", qty: 1, unit: "pcs", l: 100, w: 50, h: 80 },
      { name: "Marble top", qty: 1, unit: "pcs", l: 100, w: 50, h: 3 },
    ],
    payments: [{ date: "2026-06-05", amount: 22000 }],
    missingItems: [],
    technical: { truckDistance: 25, floor: 0, fee: 2500 },
    completedAt: "2026-06-25",
  },
  {
    id: "#2049",
    client: "N. Hamidi",
    phone: "0560 66 77 88",
    address: "Tipaza",
    project: "Outdoor kitchen",
    stage: "APPOINTMENT",
    worker: "Unassigned",
    amount: 95000,
    paid: 0,
    dueDate: "2026-07-25",
    created: "2026-07-04",
    items: [
      {
        name: "Weatherproof cabinets",
        qty: 8,
        unit: "pcs",
        l: 60,
        w: 60,
        h: 80,
      },
      { name: "Grill station", qty: 1, unit: "pcs", l: 120, w: 70, h: 90 },
      { name: "Concrete top", qty: 1, unit: "pcs", l: 250, w: 80, h: 5 },
    ],
    payments: [],
    missingItems: [],
    technical: { truckDistance: "", floor: "", fee: "" },
  },
  {
    id: "#2039",
    client: "D. Mansouri",
    phone: "0544 99 00 11",
    address: "Algiers — Bir Mourad Raïs",
    project: "Closet system",
    stage: "CONTRACT",
    worker: "Unassigned",
    amount: 41000,
    paid: 15000,
    dueDate: "2026-07-15",
    created: "2026-06-18",
    items: [
      { name: "Closet frames", qty: 3, unit: "pcs", l: 120, w: 60, h: 240 },
      { name: "Shelving", qty: 6, unit: "pcs", l: 115, w: 30, h: 2 },
      { name: "Shoe rack", qty: 2, unit: "pcs", l: 80, w: 30, h: 40 },
    ],
    payments: [{ date: "2026-06-18", amount: 15000 }],
    missingItems: [],
    technical: { truckDistance: "", floor: "", fee: "" },
  },
  {
    id: "#2030",
    client: "S. Merzoug",
    phone: "0540 11 22 33",
    address: "Tipaza",
    project: "Bedroom set (previous)",
    stage: "COMPLETED",
    worker: "M. Draoui",
    amount: 75000,
    paid: 75000,
    dueDate: "2026-05-20",
    created: "2026-04-15",
    items: [],
    payments: [{ date: "2026-04-15", amount: 75000 }],
    missingItems: [],
    technical: { truckDistance: 50, floor: 2, fee: 5000 },
    completedAt: "2026-05-20",
  },
  {
    id: "#2028",
    client: "A. Benali",
    phone: "0551 23 45 67",
    address: "Hydra, Algiers",
    project: "Library wall (previous)",
    stage: "COMPLETED",
    worker: "R. Said",
    amount: 38000,
    paid: 38000,
    dueDate: "2026-04-30",
    created: "2026-03-22",
    items: [],
    payments: [{ date: "2026-03-22", amount: 38000 }],
    missingItems: [],
    technical: { truckDistance: 40, floor: 3, fee: 4000 },
    completedAt: "2026-04-30",
  },
];

const STATUSES = [
  "All",
  "APPOINTMENT",
  "CONTRACT",
  "IN_PRODUCTION",
  "READY_TO_DELIVER",
  "COMPLETED",
];

const STAGE_INFO = {
  APPOINTMENT: {
    color: "var(--stage-appointment)",
    label: "Appointment",
    short: "Appt",
    dot: "●",
  },
  CONTRACT: {
    color: "var(--stage-contract)",
    label: "Contract",
    short: "Contract",
    dot: "●",
  },
  IN_PRODUCTION: {
    color: "var(--stage-production)",
    label: "In Production",
    short: "Production",
    dot: "●",
  },
  READY_TO_DELIVER: {
    color: "var(--stage-ready)",
    label: "Ready",
    short: "Ready",
    dot: "●",
  },
  COMPLETED: {
    color: "var(--stage-completed)",
    label: "Completed",
    short: "Done",
    dot: "✓",
  },
};

const MONTHS = [
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

/* ─── Helpers ─── */
const formatDZD = (n) => `${(n || 0).toLocaleString()} DZD`;
const totalWithTech = (order) =>
  (order.amount || 0) + (Number(order.technical?.fee) || 0);
const hasBlockingMissing = (order) => (order.missingItems || []).length > 0;
/* ─── Reusable UI ─── */
const StageBadge = ({ stage, size = "sm" }) => {
  const s = STAGE_INFO[stage] || STAGE_INFO.APPOINTMENT;
  return (
    <span
      className="inline-flex items-center gap-1.5 font-medium rounded-md"
      style={{
        background: `${s.color}15`,
        color: s.color,
        padding: size === "lg" ? "6px 14px" : "4px 10px",
        fontSize: size === "lg" ? "15px" : "13px",
      }}
    >
      <span style={{ fontSize: size === "lg" ? 12 : 10 }}>{s.dot}</span>{" "}
      {s.label}
    </span>
  );
};

const Stepper = ({ currentStage }) => {
  const stages = [
    "APPOINTMENT",
    "CONTRACT",
    "IN_PRODUCTION",
    "READY_TO_DELIVER",
    "COMPLETED",
  ];
  const idx = stages.indexOf(currentStage);
  return (
    <div className="flex items-center w-full">
      {stages.map((s, i) => (
        <div key={s} className="flex items-center flex-1">
          <div
            className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold border-2 transition-colors ${i < idx ? "bg-green-500 border-green-500 text-white" : i === idx ? "border-amber-500 text-amber-600 bg-white" : "border-gray-300 text-gray-400 bg-white"}`}
          >
            {i < idx ? <Icons.check /> : i + 1}
          </div>
          {i < stages.length - 1 && (
            <div
              className={`h-0.5 flex-1 mx-1 ${i < idx ? "bg-green-500" : "bg-gray-200"}`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  accent = "accent",
  children,
  footer,
  maxWidth = "600px",
}) => {
  useEffect(() => {
    if (isOpen) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = orig;
      };
    }
  }, [isOpen]);
  if (!isOpen) return null;
  const accentColor = `var(--${accent})`;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl shadow-2xl w-full max-h-[92vh] overflow-hidden flex flex-col"
        style={{
          maxWidth,
          background: "var(--surface)",
          border: "1px solid var(--border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="relative px-5 sm:px-6 pt-5 sm:pt-6 pb-4 sm:pb-5 shrink-0"
          style={{
            background: `linear-gradient(135deg, ${accentColor}18 0%, ${accentColor}05 100%)`,
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div className="flex items-start gap-3">
            {icon && (
              <div
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                style={{ background: accentColor, color: "#fff" }}
              >
                {icon}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2
                className="text-base sm:text-lg font-bold leading-tight"
                style={{ color: "var(--ink)" }}
              >
                {title}
              </h2>
              {subtitle && (
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "var(--ink-muted)" }}
                >
                  {subtitle}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:opacity-70 transition-opacity shrink-0"
              style={{ color: "var(--ink-muted)", background: "var(--bg)" }}
            >
              <Icons.x />
            </button>
          </div>
        </div>
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">{children}</div>
        {footer && (
          <div
            className="px-5 sm:px-6 py-3 sm:py-4 shrink-0 flex items-center justify-end gap-2 flex-wrap"
            style={{
              background: "var(--bg)",
              borderTop: "1px solid var(--border)",
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

const Btn = ({
  children,
  variant = "primary",
  onClick,
  type = "button",
  disabled,
  className = "",
  style = {},
}) => {
  const variants = {
    primary: {
      background: "var(--accent)",
      color: "#fff",
      border: "1px solid var(--accent)",
    },
    ghost: {
      background: "transparent",
      color: "var(--ink)",
      border: "1px solid var(--border)",
    },
    danger: {
      background: "#ef4444",
      color: "#fff",
      border: "1px solid #ef4444",
    },
    success: {
      background: "#16a34a",
      color: "#fff",
      border: "1px solid #16a34a",
    },
    warning: {
      background: "#f59e0b",
      color: "#fff",
      border: "1px solid #f59e0b",
    },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-bold transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 ${className}`}
      style={{ ...variants[variant], ...style }}
    >
      {children}
    </button>
  );
};

/* ─── Ready-to-deliver confirmation (fires when stage changes to READY) ─── */
const ReadyToDeliverModal = ({ isOpen, onClose, order, onConfirm }) => {
  const [step, setStep] = useState("ask");
  const [itemStates, setItemStates] = useState([]); // [{...item, ready: bool}]
  const [customMissing, setCustomMissing] = useState([]); // [{ name, qty, unit, notes }]
  const [customDraft, setCustomDraft] = useState({
    name: "",
    qty: 1,
    unit: "pcs",
    notes: "",
  });

  useEffect(() => {
    if (isOpen) {
      setStep("ask");
      setItemStates((order?.items || []).map((i) => ({ ...i, ready: true })));
      setCustomMissing(
        (order?.missingItems || []).filter(
          (m) => !(order?.items || []).some((i) => i.name === m.name),
        ),
      );
      setCustomDraft({ name: "", qty: 1, unit: "pcs", notes: "" });
    }
  }, [isOpen, order]);

  const toggleReady = (idx) =>
    setItemStates((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, ready: !p.ready } : p)),
    );

  const addCustom = () => {
    if (!customDraft.name.trim()) return;
    setCustomMissing((prev) => [
      ...prev,
      { ...customDraft, name: customDraft.name.trim() },
    ]);
    setCustomDraft({ name: "", qty: 1, unit: "pcs", notes: "" });
  };

  const removeCustom = (idx) =>
    setCustomMissing((prev) => prev.filter((_, i) => i !== idx));

  const missingCount =
    itemStates.filter((p) => !p.ready).length + customMissing.length;
  const blocking = missingCount > 0;

  const handleAllReady = () =>
    onConfirm({ missingItems: [], stage: "READY_TO_DELIVER" });
  const handlePartial = () => {
    const missingFromItems = itemStates
      .filter((p) => !p.ready)
      .map(({ ready, ...rest }) => rest);
    const allMissing = [...missingFromItems, ...customMissing];
    onConfirm({
      missingItems: allMissing,
      stage: allMissing.length > 0 ? "IN_PRODUCTION" : "READY_TO_DELIVER",
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        step === "ask"
          ? "Mark as Ready to Deliver?"
          : "Which items are NOT ready?"
      }
      subtitle={
        step === "ask"
          ? `${order?.id} — ${order?.project}`
          : `${missingCount} item${missingCount === 1 ? "" : "s"} still need work before delivery`
      }
      icon={step === "ask" ? <Icons.truck /> : <Icons.alertCircle />}
      accent={step === "ask" ? "stage-ready" : "stage-production"}
      maxWidth="600px"
      footer={
        step === "ask" ? (
          <>
            <Btn variant="ghost" onClick={onClose}>
              Cancel
            </Btn>
            <Btn variant="warning" onClick={() => setStep("partial")}>
              No, some not ready
            </Btn>
            <Btn variant="success" onClick={handleAllReady}>
              <Icons.check /> Yes, all ready
            </Btn>
          </>
        ) : (
          <>
            <Btn variant="ghost" onClick={() => setStep("ask")}>
              ← Back
            </Btn>
            <Btn variant="warning" onClick={handlePartial}>
              {blocking ? `Save ${missingCount} missing →` : "Nothing missing"}
            </Btn>
          </>
        )
      }
    >
      {step === "ask" ? (
        <div className="space-y-3">
          <p className="text-sm" style={{ color: "var(--ink)" }}>
            Are all the items in this order ready to be delivered?
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div
              className="rounded-xl p-4 cursor-pointer hover:scale-[1.02] transition-transform"
              style={{ background: "#16a34a10", border: "2px solid #16a34a30" }}
              onClick={handleAllReady}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Icons.check />
                <span
                  className="text-sm font-bold"
                  style={{ color: "#16a34a" }}
                >
                  All ready
                </span>
              </div>
              <p className="text-xs" style={{ color: "var(--ink-muted)" }}>
                Every item is built. Move to Ready to Deliver.
              </p>
            </div>
            <div
              className="rounded-xl p-4 cursor-pointer hover:scale-[1.02] transition-transform"
              style={{ background: "#f59e0b10", border: "2px solid #f59e0b30" }}
              onClick={() => setStep("partial")}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Icons.alertCircle />
                <span
                  className="text-sm font-bold"
                  style={{ color: "#f59e0b" }}
                >
                  Some missing
                </span>
              </div>
              <p className="text-xs" style={{ color: "var(--ink-muted)" }}>
                Uncheck items or add custom missing parts. Order stays in
                Production.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <p
              className="text-xs mb-2 font-bold uppercase tracking-wider"
              style={{ color: "var(--ink-muted)" }}
            >
              From the order items
            </p>
            {itemStates.length === 0 && (
              <div
                className="text-xs text-center py-3 rounded-lg"
                style={{ background: "var(--bg)", color: "var(--ink-muted)" }}
              >
                No items in this order.
              </div>
            )}
            <div className="space-y-1.5">
              {itemStates.map((item, idx) => (
                <label
                  key={idx}
                  className="flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-colors hover:brightness-110"
                  style={{
                    background: item.ready ? "#16a34a08" : "#f59e0b10",
                    border: `1px solid ${item.ready ? "#16a34a30" : "#f59e0b40"}`,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={item.ready}
                    onChange={() => toggleReady(idx)}
                    className="mt-0.5 w-4 h-4 accent-green-600"
                  />
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-sm font-bold flex items-center gap-2"
                      style={{ color: "var(--ink)" }}
                    >
                      {item.name}{" "}
                      <span
                        className="text-xs font-normal"
                        style={{ color: "var(--ink-muted)" }}
                      >
                        × {item.qty} {item.unit}
                      </span>
                    </div>
                    {(item.l > 0 || item.w > 0 || item.h > 0) && (
                      <div
                        className="text-[10px] font-mono mt-0.5"
                        style={{ color: "var(--ink-muted)" }}
                      >
                        {item.l}cm × {item.w}cm × {item.h}cm
                      </div>
                    )}
                  </div>
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shrink-0"
                    style={{
                      background: item.ready ? "#16a34a20" : "#f59e0b20",
                      color: item.ready ? "#16a34a" : "#f59e0b",
                    }}
                  >
                    {item.ready ? "Ready" : "Missing"}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Custom missing parts */}
          <div
            className="pt-3"
            style={{ borderTop: "1px dashed var(--border)" }}
          >
            <p
              className="text-xs mb-2 font-bold uppercase tracking-wider"
              style={{ color: "var(--ink-muted)" }}
            >
              Add custom missing part
            </p>
            <div
              className="space-y-2 p-2.5 rounded-lg"
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
              }}
            >
              <input
                placeholder="Part name (e.g., Door handle, Hinge, Shelf pin)"
                className="w-full px-2.5 py-1.5 rounded-md text-sm outline-none"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  color: "var(--ink)",
                }}
                value={customDraft.name}
                onChange={(e) =>
                  setCustomDraft((prev) => ({ ...prev, name: e.target.value }))
                }
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addCustom())
                }
              />
              <div className="grid grid-cols-12 gap-2">
                <input
                  type="number"
                  min="1"
                  placeholder="Qty"
                  className="col-span-3 px-2 py-1.5 rounded-md text-sm outline-none text-center"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    color: "var(--ink)",
                  }}
                  value={customDraft.qty}
                  onChange={(e) =>
                    setCustomDraft((prev) => ({
                      ...prev,
                      qty: Number(e.target.value),
                    }))
                  }
                />
                <select
                  className="col-span-3 px-2 py-1.5 rounded-md text-sm outline-none"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    color: "var(--ink)",
                  }}
                  value={customDraft.unit}
                  onChange={(e) =>
                    setCustomDraft((prev) => ({
                      ...prev,
                      unit: e.target.value,
                    }))
                  }
                >
                  <option value="pcs">pcs</option>
                  <option value="m">m</option>
                  <option value="m²">m²</option>
                  <option value="set">set</option>
                  <option value="kg">kg</option>
                </select>
                <input
                  placeholder="Notes (optional)"
                  className="col-span-6 px-2 py-1.5 rounded-md text-sm outline-none"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    color: "var(--ink)",
                  }}
                  value={customDraft.notes}
                  onChange={(e) =>
                    setCustomDraft((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addCustom())
                  }
                />
              </div>
              <button
                type="button"
                onClick={addCustom}
                disabled={!customDraft.name.trim()}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-md transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "#f59e0b", color: "#fff" }}
              >
                <Icons.plus /> Add to missing
              </button>
            </div>

            {customMissing.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {customMissing.map((m, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-2 rounded-md"
                    style={{
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                    }}
                  >
                    <Icons.alertTriangle />
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-xs font-bold flex items-center gap-2 flex-wrap"
                        style={{ color: "#991b1b" }}
                      >
                        <span className="truncate">{m.name}</span>
                        <span style={{ color: "#dc2626" }}>
                          ×{m.qty} {m.unit}
                        </span>
                      </div>
                      {m.notes && (
                        <div
                          className="text-[10px] italic truncate"
                          style={{ color: "#7f1d1d" }}
                        >
                          {m.notes}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCustom(i)}
                      className="p-1 rounded-md hover:opacity-70 shrink-0"
                      style={{ color: "#dc2626" }}
                    >
                      <Icons.x />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};

/* ─── Missing Parts management modal (always accessible from detail panel) ─── */
const MissingPartsModal = ({ isOpen, onClose, order, onUpdate }) => {
  const [items, setItems] = useState([]);
  const [draft, setDraft] = useState({
    name: "",
    qty: 1,
    unit: "pcs",
    notes: "",
  });

  useEffect(() => {
    if (isOpen && order) {
      setItems(
        (order.missingItems || []).map((m, i) => ({
          ...m,
          _k: `${i}-${m.name}`,
        })),
      );
    }
  }, [isOpen, order]);

  const addItem = () => {
    if (!draft.name.trim()) return;
    setItems((prev) => [
      ...prev,
      { ...draft, name: draft.name.trim(), _k: `${Date.now()}-${draft.name}` },
    ]);
    setDraft({ name: "", qty: 1, unit: "pcs", notes: "" });
  };

  const removeItem = (k) => setItems((prev) => prev.filter((i) => i._k !== k));

  const resolveAll = () => setItems([]);

  const handleSave = () => {
    onUpdate(items.map(({ _k, ...rest }) => rest));
    onClose();
  };

  const updateDraft = (field, value) =>
    setDraft((prev) => ({ ...prev, [field]: value }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manage Missing Parts"
      subtitle={`${order?.id} — ${order?.project}`}
      icon={<Icons.alertCircle />}
      accent="danger"
      maxWidth="640px"
      footer={
        <>
          <Btn variant="ghost" onClick={onClose}>
            Cancel
          </Btn>
          <Btn variant="danger" onClick={handleSave}>
            <Icons.check /> Save Changes
          </Btn>
        </>
      }
    >
      <div className="space-y-4">
        {/* Current list */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: "var(--ink-muted)" }}
            >
              Current Missing Items ({items.length})
            </h3>
            {items.length > 0 && (
              <button
                type="button"
                onClick={resolveAll}
                className="text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 transition-all hover:brightness-110"
                style={{ background: "#16a34a20", color: "#16a34a" }}
              >
                <Icons.check /> Mark all resolved
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <div
              className="text-center py-6 text-sm rounded-lg flex flex-col items-center gap-1"
              style={{
                background: "#16a34a08",
                border: "2px dashed #16a34a40",
                color: "#16a34a",
              }}
            >
              <Icons.check />
              <span className="font-bold">No missing parts.</span>
              <span className="text-xs" style={{ color: "var(--ink-muted)" }}>
                This order is fully ready.
              </span>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item._k}
                  className="flex items-start gap-2 p-3 rounded-lg"
                  style={{ background: "#fef2f2", border: "1px solid #fecaca" }}
                >
                  <div className="shrink-0 mt-0.5" style={{ color: "#dc2626" }}>
                    <Icons.alertTriangle />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="text-sm font-bold"
                        style={{ color: "#991b1b" }}
                      >
                        {item.name}
                      </span>
                      <span
                        className="text-xs font-bold px-1.5 py-0.5 rounded shrink-0"
                        style={{ background: "#fee2e2", color: "#991b1b" }}
                      >
                        ×{item.qty} {item.unit}
                      </span>
                    </div>
                    {item.notes && (
                      <div
                        className="text-[11px] mt-1 italic"
                        style={{ color: "#7f1d1d" }}
                      >
                        📝 {item.notes}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item._k)}
                    className="p-1.5 rounded-md hover:opacity-70 shrink-0"
                    style={{ color: "#dc2626" }}
                    title="Remove"
                  >
                    <Icons.trash />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add new */}
        <div className="pt-3" style={{ borderTop: "1px solid var(--border)" }}>
          <h3
            className="text-xs font-bold uppercase tracking-wider mb-2"
            style={{ color: "var(--ink-muted)" }}
          >
            Add Missing Part Manually
          </h3>
          <div
            className="space-y-2 p-3 rounded-lg"
            style={{
              background: "var(--bg)",
              border: "1px solid var(--border)",
            }}
          >
            <input
              autoFocus
              placeholder="Part name (e.g., Door handle, Hinge, Shelf pin)"
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--ink)",
              }}
              value={draft.name}
              onChange={(e) => updateDraft("name", e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), addItem())
              }
            />
            <div className="grid grid-cols-12 gap-2">
              <input
                type="number"
                min="1"
                placeholder="Qty"
                className="col-span-3 px-2 py-2 rounded-lg text-sm outline-none text-center"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  color: "var(--ink)",
                }}
                value={draft.qty}
                onChange={(e) => updateDraft("qty", Number(e.target.value))}
              />
              <select
                className="col-span-3 px-2 py-2 rounded-lg text-sm outline-none"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  color: "var(--ink)",
                }}
                value={draft.unit}
                onChange={(e) => updateDraft("unit", e.target.value)}
              >
                <option value="pcs">pcs</option>
                <option value="m">m</option>
                <option value="m²">m²</option>
                <option value="set">set</option>
                <option value="kg">kg</option>
              </select>
              <input
                placeholder="Notes (optional, e.g., wrong finish)"
                className="col-span-6 px-2 py-2 rounded-lg text-sm outline-none"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  color: "var(--ink)",
                }}
                value={draft.notes}
                onChange={(e) => updateDraft("notes", e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addItem())
                }
              />
            </div>
            <button
              type="button"
              onClick={addItem}
              disabled={!draft.name.trim()}
              className="w-full flex items-center justify-center gap-2 text-xs font-bold px-3 py-2 rounded-lg transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "#dc2626", color: "#fff" }}
            >
              <Icons.plus /> Add to Missing List
            </button>
          </div>
        </div>

        <div
          className="text-[10px] italic flex items-start gap-1.5 p-2 rounded"
          style={{ background: "var(--bg)", color: "var(--ink-muted)" }}
        >
          <Icons.alertCircle />
          <span>
            When the order is at <strong>Ready to Deliver</strong> stage and
            missing parts exist, the order is blocked from completion and shown
            in red across the app.
          </span>
        </div>
      </div>
    </Modal>
  );
};

/* ─── Assign worker modal ─── */
const AssignWorkerModal = ({ isOpen, onClose, onAssign, currentWorker }) => {
  const [search, setSearch] = useState("");
  const filtered = WORKERS_LIST.filter(
    (w) =>
      w.toLowerCase().includes(search.toLowerCase()) && w !== currentWorker,
  );
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Worker"
      subtitle="Pick someone from your team"
      icon={<Icons.userCheck />}
      accent="accent"
      maxWidth="400px"
    >
      <div className="space-y-3">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
        >
          <Icons.search />
          <input
            autoFocus
            type="text"
            placeholder="Search workers..."
            className="bg-transparent outline-none w-full text-sm"
            style={{ color: "var(--ink)" }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {filtered.map((worker) => (
            <button
              key={worker}
              onClick={() => onAssign(worker)}
              className="w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left hover:translate-x-1"
              style={{
                border: "1px solid var(--border)",
                background: "var(--bg)",
              }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                style={{
                  background: "var(--accent-soft)",
                  color: "var(--accent)",
                }}
              >
                {worker.charAt(0)}
              </div>
              <div className="flex-1">
                <div
                  className="font-bold text-sm"
                  style={{ color: "var(--ink)" }}
                >
                  {worker}
                </div>
                <div className="text-xs" style={{ color: "var(--ink-muted)" }}>
                  Carpenter
                </div>
              </div>
              <Icons.arrowRight />
            </button>
          ))}
          {filtered.length === 0 && (
            <div
              className="text-center py-6 text-sm"
              style={{ color: "var(--ink-muted)" }}
            >
              No workers found.
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

/* ─── Order form modal ─── */
const OrderFormModal = ({
  isOpen,
  onClose,
  onSave,
  initialData = null,
  existingClients = [],
}) => {
  const [formData, setFormData] = useState({
    client: "",
    phone: "",
    address: "",
    project: "",
    amount: "",
    dueDate: "",
    stage: "APPOINTMENT",
    worker: "Unassigned",
    items: [{ name: "", qty: 1, unit: "pcs", l: "", w: "", h: "" }],
    payments: [],
    missingItems: [],
    technical: { truckDistance: "", floor: "", fee: "" },
  });
  const [useExistingClient, setUseExistingClient] = useState(false);
  const [clientSearch, setClientSearch] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        amount: initialData.amount.toString(),
        items: initialData.items || [],
        payments: initialData.payments || [],
        missingItems: initialData.missingItems || [],
        technical: initialData.technical || {
          truckDistance: "",
          floor: "",
          fee: "",
        },
      });
      const matched = existingClients.find(
        (c) => c.client === initialData.client,
      );
      setUseExistingClient(!!matched);
    } else {
      setFormData({
        client: "",
        phone: "",
        address: "",
        project: "",
        amount: "",
        dueDate: "",
        stage: "APPOINTMENT",
        worker: "Unassigned",
        items: [{ name: "", qty: 1, unit: "pcs", l: "", w: "", h: "" }],
        payments: [],
        missingItems: [],
        technical: { truckDistance: "", floor: "", fee: "" },
      });
      setUseExistingClient(false);
    }
    setClientSearch("");
  }, [initialData, isOpen]);

  const handleChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));
  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData((prev) => ({ ...prev, items: newItems }));
  };
  const addItem = () =>
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { name: "", qty: 1, unit: "pcs", l: "", w: "", h: "" },
      ],
    }));
  const removeItem = (index) =>
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));

  const handlePickClient = (c) => {
    setFormData((prev) => ({
      ...prev,
      client: c.client,
      phone: c.phone,
      address: c.address,
    }));
    setUseExistingClient(true);
  };

  const filteredClients = useMemo(() => {
    if (!clientSearch.trim()) return existingClients;
    const q = clientSearch.toLowerCase();
    return existingClients.filter((c) =>
      `${c.client} ${c.phone} ${c.address}`.toLowerCase().includes(q),
    );
  }, [clientSearch, existingClients]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      amount: Number(formData.amount),
      items: formData.items.filter((i) => i.name),
      created: initialData
        ? initialData.created
        : new Date().toISOString().split("T")[0],
      id: initialData
        ? initialData.id
        : `#${Math.floor(Math.random() * 9000) + 1000}`,
      missingItems: formData.missingItems || [],
      completedAt: initialData?.completedAt || null,
    };
    onSave(data);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Order" : "Create New Order"}
      subtitle={
        initialData
          ? `${initialData.id} · ${initialData.project}`
          : "Add a new client order"
      }
      icon={initialData ? <Icons.edit /> : <Icons.plus />}
      accent="accent"
      maxWidth="720px"
      footer={
        <>
          <Btn variant="ghost" onClick={onClose}>
            Cancel
          </Btn>
          <Btn variant="primary" onClick={handleSubmit}>
            {initialData ? "Save Changes" : "Create Order"}
          </Btn>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Existing client toggle */}
        {!initialData && existingClients.length > 0 && (
          <div className="space-y-2">
            <label
              className="flex items-center gap-2.5 p-3 rounded-lg cursor-pointer transition-colors"
              style={{
                background: useExistingClient
                  ? "var(--accent-soft)"
                  : "var(--bg)",
                border: `1px solid ${useExistingClient ? "var(--accent)" : "var(--border)"}`,
              }}
            >
              <input
                type="checkbox"
                checked={useExistingClient}
                onChange={(e) => {
                  setUseExistingClient(e.target.checked);
                  if (!e.target.checked) {
                    handleChange("client", "");
                    handleChange("phone", "");
                    handleChange("address", "");
                  }
                }}
                className="w-4 h-4 accent-blue-600"
              />
              <div className="flex items-center gap-2 flex-1">
                {useExistingClient ? <Icons.userCheck /> : <Icons.userPlus />}
                <div>
                  <div
                    className="text-sm font-bold"
                    style={{ color: "var(--ink)" }}
                  >
                    {useExistingClient ? "Existing client" : "New client"}
                  </div>
                  <div
                    className="text-[11px]"
                    style={{ color: "var(--ink-muted)" }}
                  >
                    {useExistingClient
                      ? "Pick from your previous customers (auto-fills contact info)"
                      : "First time working with this client"}
                  </div>
                </div>
              </div>
            </label>

            {useExistingClient && (
              <div
                className="rounded-xl overflow-hidden"
                style={{
                  border: "1px solid var(--accent)",
                  background: "var(--bg)",
                }}
              >
                <div
                  className="flex items-center gap-2 px-3 py-2.5"
                  style={{
                    background: "var(--surface-2)",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <Icons.search />
                  <input
                    autoFocus
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    placeholder="Search by name, phone, address…"
                    className="bg-transparent outline-none w-full text-sm"
                    style={{ color: "var(--ink)" }}
                  />
                  {clientSearch && (
                    <button
                      type="button"
                      onClick={() => setClientSearch("")}
                      className="p-0.5"
                      style={{ color: "var(--ink-muted)" }}
                    >
                      <Icons.x />
                    </button>
                  )}
                </div>
                <div
                  className="max-h-72 overflow-y-auto divide-y"
                  style={{ borderColor: "var(--border)" }}
                >
                  {filteredClients.length === 0 && (
                    <div
                      className="px-4 py-6 text-center text-sm"
                      style={{ color: "var(--ink-muted)" }}
                    >
                      No clients match "{clientSearch}".
                    </div>
                  )}
                  {filteredClients.map((c) => {
                    const selected = formData.client === c.client;
                    return (
                      <button
                        key={c.client}
                        type="button"
                        onClick={() => handlePickClient(c)}
                        className="w-full text-left p-3 transition-all hover:bg-[var(--accent-soft)]"
                        style={{
                          background: selected
                            ? "var(--accent-soft)"
                            : "transparent",
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                            style={{
                              background: "var(--accent)",
                              color: "#fff",
                            }}
                          >
                            {c.client
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <div
                                className="text-sm font-bold truncate"
                                style={{ color: "var(--ink)" }}
                              >
                                {c.client}
                              </div>
                              <span
                                className="text-[10px] px-1.5 py-0.5 rounded font-bold"
                                style={{
                                  background: "var(--bg)",
                                  color: "var(--ink-muted)",
                                }}
                              >
                                {c.orderCount} order
                                {c.orderCount === 1 ? "" : "s"}
                              </span>
                              <span
                                className="text-[10px] font-bold"
                                style={{ color: "var(--stage-completed)" }}
                              >
                                {formatDZD(c.totalSpent)} spent
                              </span>
                            </div>
                            <div
                              className="text-xs flex items-center gap-2 mt-0.5"
                              style={{ color: "var(--ink-muted)" }}
                            >
                              <span className="flex items-center gap-1">
                                <Icons.phone /> {c.phone}
                              </span>
                            </div>
                            <div
                              className="text-xs flex items-center gap-1 mt-0.5 truncate"
                              style={{ color: "var(--ink-muted)" }}
                            >
                              <Icons.mapPin /> {c.address}
                            </div>
                          </div>
                          {selected && (
                            <div
                              className="shrink-0 mt-1"
                              style={{ color: "var(--accent)" }}
                            >
                              <Icons.check />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-3">
          <h3
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: "var(--ink-muted)" }}
          >
            Client Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: "var(--ink-muted)" }}
              >
                Client Name
              </label>
              <input
                required
                readOnly={useExistingClient}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none read-only:opacity-80"
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  color: "var(--ink)",
                }}
                value={formData.client}
                onChange={(e) => handleChange("client", e.target.value)}
              />
            </div>
            <div>
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: "var(--ink-muted)" }}
              >
                Phone
              </label>
              <input
                required
                readOnly={useExistingClient}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none read-only:opacity-80"
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  color: "var(--ink)",
                }}
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: "var(--ink-muted)" }}
              >
                Address
              </label>
              <input
                required
                readOnly={useExistingClient}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none read-only:opacity-80"
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  color: "var(--ink)",
                }}
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: "var(--ink-muted)" }}
          >
            Project Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: "var(--ink-muted)" }}
              >
                Project Description
              </label>
              <input
                required
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  color: "var(--ink)",
                }}
                value={formData.project}
                onChange={(e) => handleChange("project", e.target.value)}
              />
            </div>
            <div>
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: "var(--ink-muted)" }}
              >
                Total Amount (DZD)
              </label>
              <input
                required
                type="number"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  color: "var(--ink)",
                }}
                value={formData.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
              />
            </div>
            <div>
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: "var(--ink-muted)" }}
              >
                Due Date
              </label>
              <input
                required
                type="date"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  color: "var(--ink)",
                }}
                value={formData.dueDate}
                onChange={(e) => handleChange("dueDate", e.target.value)}
              />
            </div>
            <div>
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: "var(--ink-muted)" }}
              >
                Stage
              </label>
              <select
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  color: "var(--ink)",
                }}
                value={formData.stage}
                onChange={(e) => handleChange("stage", e.target.value)}
              >
                {STATUSES.filter((s) => s !== "All").map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: "var(--ink-muted)" }}
              >
                Worker
              </label>
              <select
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  color: "var(--ink)",
                }}
                value={formData.worker}
                onChange={(e) => handleChange("worker", e.target.value)}
              >
                <option value="Unassigned">Unassigned</option>
                {WORKERS_LIST.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: "var(--ink-muted)" }}
            >
              Items & Measurements
            </h3>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-all hover:brightness-110"
              style={{
                background: "var(--accent-soft)",
                color: "var(--accent)",
              }}
            >
              <Icons.plus /> Add Item
            </button>
          </div>
          <div className="space-y-2">
            {formData.items.map((item, index) => (
              <div
                key={index}
                className="p-3 rounded-lg space-y-2"
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                }}
              >
                <div className="flex gap-2">
                  <input
                    placeholder="Item Name"
                    className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                    style={{
                      border: "1px solid var(--border)",
                      color: "var(--ink)",
                      background: "var(--surface)",
                    }}
                    value={item.name}
                    onChange={(e) =>
                      handleItemChange(index, "name", e.target.value)
                    }
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="p-2 rounded-lg text-red-500 hover:opacity-70"
                  >
                    <Icons.trash />
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  <input
                    type="number"
                    placeholder="Qty"
                    className="px-2 py-2 rounded-lg text-sm outline-none text-center"
                    style={{
                      border: "1px solid var(--border)",
                      color: "var(--ink)",
                      background: "var(--surface)",
                    }}
                    value={item.qty}
                    onChange={(e) =>
                      handleItemChange(index, "qty", Number(e.target.value))
                    }
                  />
                  <select
                    className="px-2 py-2 rounded-lg text-sm outline-none"
                    style={{
                      border: "1px solid var(--border)",
                      color: "var(--ink)",
                      background: "var(--surface)",
                    }}
                    value={item.unit}
                    onChange={(e) =>
                      handleItemChange(index, "unit", e.target.value)
                    }
                  >
                    <option value="pcs">pcs</option>
                    <option value="m">m</option>
                    <option value="m²">m²</option>
                    <option value="set">set</option>
                  </select>
                  <input
                    type="number"
                    placeholder="L"
                    className="px-2 py-2 rounded-lg text-sm outline-none text-center"
                    style={{
                      border: "1px solid var(--border)",
                      color: "var(--ink)",
                      background: "var(--surface)",
                    }}
                    value={item.l}
                    onChange={(e) =>
                      handleItemChange(index, "l", Number(e.target.value))
                    }
                  />
                  <input
                    type="number"
                    placeholder="W"
                    className="px-2 py-2 rounded-lg text-sm outline-none text-center"
                    style={{
                      border: "1px solid var(--border)",
                      color: "var(--ink)",
                      background: "var(--surface)",
                    }}
                    value={item.w}
                    onChange={(e) =>
                      handleItemChange(index, "w", Number(e.target.value))
                    }
                  />
                  <input
                    type="number"
                    placeholder="H"
                    className="px-2 py-2 rounded-lg text-sm outline-none text-center"
                    style={{
                      border: "1px solid var(--border)",
                      color: "var(--ink)",
                      background: "var(--surface)",
                    }}
                    value={item.h}
                    onChange={(e) =>
                      handleItemChange(index, "h", Number(e.target.value))
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
};

/* ─── Print view ─── */
const handlePrint = (order) => {
  const w = window.open("", "_blank", "width=900,height=900");
  if (!w) return;
  const tech = order.technical || {};
  const techFee = Number(tech.fee) || 0;
  const total = (order.amount || 0) + techFee;
  const blocking =
    order.stage === "READY_TO_DELIVER" && (order.missingItems || []).length > 0;
  w.document
    .write(`<!doctype html><html><head><meta charset="utf-8"><title>Order ${order.id}</title>
    <style>
      * { box-sizing: border-box; }
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 32px; color: #111; max-width: 800px; margin: 0 auto; }
      h1 { margin: 0; font-size: 22px; }
      h2 { margin: 24px 0 10px; font-size: 13px; text-transform: uppercase; letter-spacing: .06em; color: #666; border-bottom: 2px solid #111; padding-bottom: 4px; }
      h2.danger { color: #b91c1c; border-color: #b91c1c; }
      .row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
      .card { padding: 12px; border: 1px solid #e5e5e5; border-radius: 8px; }
      .lbl { font-size: 11px; text-transform: uppercase; color: #888; letter-spacing: .04em; }
      .val { font-size: 14px; font-weight: 600; margin-top: 2px; }
      table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 13px; }
      th, td { padding: 9px 8px; border-bottom: 1px solid #eee; text-align: left; vertical-align: top; }
      th { background: #f7f7f7; font-size: 11px; text-transform: uppercase; letter-spacing: .04em; color: #666; }
      .tech-box { border: 2px dashed #111; padding: 14px; border-radius: 8px; background: #fafafa; }
      .tech-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-top: 10px; }
      .total-row td { font-weight: 700; border-top: 2px solid #111; border-bottom: none; padding-top: 12px; font-size: 15px; }
      .sig { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-top: 40px; font-size: 12px; }
      .sig div { border-top: 1px solid #111; padding-top: 6px; text-align: center; color: #666; }
      .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 16px; border-bottom: 3px solid #111; }
      .stage-badge { display: inline-block; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; background: #f0f9ff; color: #0369a1; }
      .no-print { margin-bottom: 16px; }
      .no-print button { padding: 8px 16px; background: #111; color: #fff; border: none; border-radius: 6px; cursor: pointer; }
      .blocked-box { border: 2px solid #b91c1c; background: #fef2f2; padding: 14px; border-radius: 8px; margin-top: 8px; }
      .blocked-box table { margin-top: 0; }
      .blocked-box th { background: #fee2e2; color: #b91c1c; }
      .blocked-box td { color: #991b1b; }
      .blocked-tag { display: inline-block; padding: 4px 10px; background: #b91c1c; color: #fff; font-size: 11px; font-weight: 700; border-radius: 4px; margin-left: 8px; letter-spacing: .04em; }
      @media print { body { padding: 16px; } .no-print { display: none; } }
    </style></head><body>
    <div class="no-print"><button onclick="window.print()">🖨 Print</button></div>
    <div class="header">
      <div>
        <h1>Order ${order.id}${blocking ? '<span class="blocked-tag">BLOCKED</span>' : ""}</h1>
        <div style="font-size:13px;color:#666;margin-top:4px">${order.project}</div>
        <div style="font-size:12px;color:#888;margin-top:4px">Created: ${order.created}${order.completedAt ? ` · Completed: ${order.completedAt}` : ""}</div>
      </div>
      <span class="stage-badge">${(order.stage || "").replace(/_/g, " ")}</span>
    </div>

    <h2>Client</h2>
    <div class="row">
      <div class="card">
        <div class="lbl">Name</div>
        <div class="val">${order.client || "—"}</div>
        <div class="lbl" style="margin-top:8px">Phone</div>
        <div class="val">${order.phone || "—"}</div>
      </div>
      <div class="card">
        <div class="lbl">Address</div>
        <div class="val">${order.address || "—"}</div>
        <div class="lbl" style="margin-top:8px">Worker</div>
        <div class="val">${order.worker || "—"}</div>
      </div>
    </div>

    <h2>Items</h2>
    <table>
      <thead><tr><th>Item</th><th style="text-align:right">Qty</th><th style="text-align:right">Dimensions</th></tr></thead>
      <tbody>
        ${(order.items || [])
          .map(
            (i) => `<tr>
          <td>${i.name}</td>
          <td style="text-align:right">${i.qty} ${i.unit}</td>
          <td style="text-align:right;font-family:monospace">${i.l > 0 || i.w > 0 || i.h > 0 ? `${i.l}cm × ${i.w}cm × ${i.h}cm` : "—"}</td>
        </tr>`,
          )
          .join("")}
        ${(order.items || []).length === 0 ? '<tr><td colspan="3" style="text-align:center;color:#888;padding:18px">No items listed.</td></tr>' : ""}
      </tbody>
    </table>

    ${
      (order.missingItems || []).length > 0
        ? `
    <h2 class="danger">${blocking ? "🚫 BLOCKED — " : ""}Missing Parts (${order.missingItems.length})</h2>
    <div class="${blocking ? "blocked-box" : ""}">
      <table>
        <thead><tr><th>Part</th><th style="text-align:right">Qty</th><th>Notes</th></tr></thead>
        <tbody>
          ${order.missingItems
            .map(
              (p) => `<tr>
            <td><strong>${p.name}</strong></td>
            <td style="text-align:right">${p.qty} ${p.unit}</td>
            <td style="font-style:italic;color:#666">${p.notes || ""}</td>
          </tr>`,
            )
            .join("")}
        </tbody>
      </table>
    </div>
    `
        : ""
    }

    <h2>Financial</h2>
    <table>
      <tbody>
        <tr><td>Order amount</td><td style="text-align:right">${formatDZD(order.amount)}</td></tr>
        <tr><td>Paid</td><td style="text-align:right;color:#16a34a">${formatDZD(order.paid)}</td></tr>
        <tr><td>Remaining</td><td style="text-align:right;font-weight:600">${formatDZD((order.amount || 0) - (order.paid || 0))}</td></tr>
      </tbody>
    </table>

    <h2>Technical File</h2>
    <div class="tech-box">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:#666">Manual delivery / installation calculations</div>
      <div class="tech-grid">
        <div>
          <div class="lbl">Truck max stop distance</div>
          <div class="val">${tech.truckDistance !== "" && tech.truckDistance != null ? tech.truckDistance + " m" : "—"}</div>
        </div>
        <div>
          <div class="lbl">Floor</div>
          <div class="val">${tech.floor !== "" && tech.floor != null ? tech.floor : "—"}</div>
        </div>
        <div>
          <div class="lbl">Technical fee (manual)</div>
          <div class="val">${techFee > 0 ? formatDZD(techFee) : "—"}</div>
        </div>
      </div>
      <div style="margin-top:10px;font-size:11px;color:#888;font-style:italic">Truck distance & floor are inputs; the fee above is calculated manually and added to the order total.</div>
    </div>

    <table style="margin-top:18px">
      <tbody>
        <tr class="total-row"><td>GRAND TOTAL (incl. technical)</td><td style="text-align:right">${formatDZD(total)}</td></tr>
      </tbody>
    </table>

    <div class="sig">
      <div>Client signature</div>
      <div>Workshop signature</div>
    </div>

    <div style="margin-top:24px;font-size:11px;color:#888;text-align:center">Printed on ${new Date().toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}</div>
    </body></html>`);
  w.document.close();
  setTimeout(() => w.print(), 250);
};

/* ─── Main ─── */
export default function OrdersClient() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedId, setSelectedId] = useState(null);
  const [sortKey, setSortKey] = useState("created");
  const [sortDir, setSortDir] = useState("desc");
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isReadyConfirmOpen, setIsReadyConfirmOpen] = useState(false);
  const [isMissingPartsOpen, setIsMissingPartsOpen] = useState(false);
  const [managingOrderId, setManagingOrderId] = useState(null);
  const [assigningOrderId, setAssigningOrderId] = useState(null);

  const now = new Date();
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [viewYear, setViewYear] = useState(now.getFullYear());

  const today = new Date().setHours(0, 0, 0, 0);
  useEffect(() => {
    let cancelled = false;

    fetchOrders({ page: 1, pageSize: 100 })
      .then((res) => {
        if (cancelled) return;

        const list = Array.isArray(res?.data) ? res.data : [];
        const normalized = list.map((o) => {
          const paid = (o.payments || []).reduce(
            (s, p) => s + (Number(p.amount) || 0),
            0,
          );
          const dn = (o.delivery_notes && o.delivery_notes[0]) || {};
          const toDateStr = (d) => {
            if (!d) return "";
            const date = d instanceof Date ? d : new Date(d);
            if (isNaN(date.getTime())) return "";
            return date.toISOString().split("T")[0];
          };
          return {
            id: o.id,
            client: o.clients?.full_name ?? "",
            phone: o.clients?.phone ?? "",
            address: o.address ?? dn.address ?? "",
            project: o.project_name ?? "",
            stage: (o.state ?? "appointment").toUpperCase(),
            worker: o.workers?.full_name ?? "Unassigned",
            amount: Number(o.total_amount) || 0,
            paid,
            dueDate: toDateStr(o.due_date),
            created: toDateStr(o.created_at),
            items: (o.order_items || []).map((i) => ({
              name: i.name,
              qty: i.quantity,
              unit: i.unit,
              l: Number(i.length_cm) || 0,
              w: Number(i.width_cm) || 0,
              h: Number(i.height_cm) || 0,
            })),
            payments: (o.payments || []).map((p) => ({
              date: toDateStr(p.payment_date),
              amount: Number(p.amount) || 0,
            })),
            missingItems: (o.checklist_items || []).map((c) => ({
              name: c.description,
              qty: c.quantity ?? 1,
              unit: c.unit ?? "pcs",
              notes: c.notes ?? "",
            })),
            technical: {
              truckDistance: dn.truck_distance_km ?? "",
              floor: dn.floor ?? "",
              fee: Number(dn.lift_cost ?? o.lift_cost) || 0,
            },
            isFullyCompleted: !!o.is_fully_completed,
            completedAt: null,
          };
        });

        // Only replace if we actually got data — never wipe with []
        setOrders((prev) => (normalized.length > 0 ? normalized : prev));

        setSelectedId((curr) => {
          if (normalized.length === 0) return curr;
          return curr == null || !normalized.find((o) => o.id === curr)
            ? normalized[0].id
            : curr;
        });
      })
      .catch((err) => console.error("orders fetch failed:", err));

    return () => {
      cancelled = true;
    };
  }, []);

  console.log("orders state now:", orders);

  console.log("orders fetched:", orders);

  const existingClients = useMemo(() => {
    const map = new Map();
    orders.forEach((o) => {
      if (!map.has(o.client))
        map.set(o.client, {
          client: o.client,
          phone: o.phone,
          address: o.address,
        });
    });
    return Array.from(map.values())
      .map((c) => {
        const clientOrders = orders.filter((o) => o.client === c.client);
        const orderCount = clientOrders.length;
        const totalSpent = clientOrders.reduce(
          (s, o) => s + (o.amount || 0),
          0,
        );
        const lastOrder = clientOrders.sort((a, b) =>
          b.created.localeCompare(a.created),
        )[0];
        return { ...c, orderCount, totalSpent, lastOrder: lastOrder?.created };
      })
      .sort((a, b) => a.client.localeCompare(b.client));
  }, [orders]);

  const filtered = useMemo(() => {
    let rows = orders.filter((o) => {
      const d = new Date(o.created);
      const inMonth =
        d.getMonth() === viewMonth && d.getFullYear() === viewYear;
      const matchesStatus = statusFilter === "All" || o.stage === statusFilter;
      const matchesSearch =
        !search ||
        `${o.id} ${o.client} ${o.project}`
          .toLowerCase()
          .includes(search.toLowerCase());
      return inMonth && matchesStatus && matchesSearch;
    });
    rows.sort((a, b) => {
      let av = a[sortKey],
        bv = b[sortKey];
      if (typeof av === "string") {
        av = av.toLowerCase();
        bv = bv.toLowerCase();
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return rows;
  }, [search, statusFilter, sortKey, sortDir, orders, viewMonth, viewYear]);

  const selected = orders.find((o) => o.id === selectedId) || orders[0];
  const totalAmount = filtered.reduce((sum, o) => sum + totalWithTech(o), 0);
  const blockedCount = filtered.filter(hasBlockingMissing).length;

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
  const goPrevYear = () => setViewYear((y) => y - 1);
  const goNextYear = () => setViewYear((y) => y + 1);
  const goCurrentMonth = () => {
    setViewMonth(now.getMonth());
    setViewYear(now.getFullYear());
  };
  const isCurrentMonth =
    viewMonth === now.getMonth() && viewYear === now.getFullYear();

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const handleCreateOrder = (newOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
    setSelectedId(newOrder.id);
  };
  const handleUpdateOrder = async (updatedOrder) => {
    try {
      const res = await updateOrderClient(updatedOrder.id, updatedOrder);
      const updated = res.data;

      // Same normalization as the useEffect — keep it in sync if you change one
      const paid = (updated.payments || []).reduce(
        (s, p) => s + (Number(p.amount) || 0),
        0,
      );
      const dn = (updated.delivery_notes && updated.delivery_notes[0]) || {};
      const toDateStr = (d) => {
        if (!d) return "";
        const date = d instanceof Date ? d : new Date(d);
        if (isNaN(date.getTime())) return "";
        return date.toISOString().split("T")[0];
      };

      const normalized = {
        id: updated.id,
        client: updated.clients?.full_name ?? "",
        phone: updated.clients?.phone ?? "",
        address: updated.address ?? dn.address ?? "",
        project: updated.project_name ?? "",
        stage: (updated.state ?? "appointment").toUpperCase(),
        worker: updated.workers?.full_name ?? "Unassigned",
        amount: Number(updated.total_amount) || 0,
        paid,
        dueDate: toDateStr(updated.due_date),
        created: toDateStr(updated.created_at),
        items: (updated.order_items || []).map((i) => ({
          name: i.name,
          qty: i.quantity,
          unit: i.unit,
          l: Number(i.length_cm) || 0,
          w: Number(i.width_cm) || 0,
          h: Number(i.height_cm) || 0,
        })),
        payments: (updated.payments || []).map((p) => ({
          date: toDateStr(p.payment_date),
          amount: Number(p.amount) || 0,
        })),
        missingItems: (updated.checklist_items || []).map((c) => ({
          name: c.description,
          qty: c.quantity ?? 1,
          unit: c.unit ?? "pcs",
          notes: c.notes ?? "",
        })),
        technical: {
          truckDistance: dn.truck_distance_km ?? "",
          floor: dn.floor ?? "",
          fee: Number(dn.lift_cost ?? updated.lift_cost) || 0,
        },
        isFullyCompleted: !!updated.is_fully_completed,
        completedAt: updatedOrder.completedAt ?? null,
      };

      setOrders((prev) =>
        prev.map((o) => (o.id === normalized.id ? normalized : o)),
      );
    } catch (err) {
      console.error("Failed to update order:", err);
      alert("Failed to save changes. Please try again.");
    }
  };
  const handleAssignWorker = (workerName) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === assigningOrderId
          ? {
              ...o,
              worker: workerName,
              stage: o.stage === "APPOINTMENT" ? "CONTRACT" : o.stage,
            }
          : o,
      ),
    );
    setIsAssignOpen(false);
  };
  const openAssignModal = (orderId) => {
    setAssigningOrderId(orderId);
    setIsAssignOpen(true);
  };

  const openMissingPartsModal = (orderId) => {
    setManagingOrderId(orderId);
    setIsMissingPartsOpen(true);
  };
  const handleUpdateMissingParts = (newMissingItems) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === managingOrderId ? { ...o, missingItems: newMissingItems } : o,
      ),
    );
  };

  const handleQuickStageChange = (orderId, newStage) => {
    if (newStage === "READY_TO_DELIVER") {
      setAssigningOrderId(orderId);
      setIsReadyConfirmOpen(true);
      return;
    }
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              stage: newStage,
              completedAt:
                newStage === "COMPLETED"
                  ? new Date().toISOString().split("T")[0]
                  : o.completedAt,
            }
          : o,
      ),
    );
  };

  const handleReadyConfirm = ({ missingItems, stage }) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === assigningOrderId ? { ...o, missingItems, stage } : o,
      ),
    );
    setIsReadyConfirmOpen(false);
  };

  const handleDeleteOrder = (orderId) => {
    if (!confirm("Delete this order? This cannot be undone.")) return;
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    if (selectedId === orderId)
      setSelectedId(orders.find((o) => o.id !== orderId)?.id);
  };

  const handleUpdateTechnical = (field, value) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === selectedId
          ? {
              ...o,
              technical: {
                ...(o.technical || { truckDistance: "", floor: "", fee: "" }),
                [field]: value,
              },
            }
          : o,
      ),
    );
  };

  const SortIcon = ({ col }) => {
    if (sortKey !== col)
      return (
        <span
          className="ml-1"
          style={{ color: "var(--ink-muted)", fontSize: 10 }}
        >
          ↕
        </span>
      );
    return (
      <span className="ml-1" style={{ color: "var(--accent)", fontSize: 10 }}>
        {sortDir === "asc" ? "↑" : "↓"}
      </span>
    );
  };

  return (
    <div
      className="flex h-full"
      style={{ background: "var(--bg)", color: "var(--ink)" }}
    >
      {isMobileDetailOpen && (
        <div
          className="fixed inset-0 z-40 flex flex-col overflow-y-auto md:hidden"
          style={{ background: "var(--surface)" }}
        >
          <div
            className="sticky top-0 z-10 flex items-center gap-3 p-4 border-b"
            style={{
              borderColor: "var(--border)",
              background: "var(--surface)",
            }}
          >
            <button
              onClick={() => setIsMobileDetailOpen(false)}
              className="p-2 rounded-md hover:opacity-70"
              style={{ color: "var(--ink-muted)" }}
            >
              <Icons.arrowLeft />
            </button>
            <h2 className="text-base font-bold" style={{ color: "var(--ink)" }}>
              Order Details
            </h2>
          </div>
          <OrderDetailPanel
            order={selected}
            today={today}
            onEdit={() => setIsEditOpen(true)}
            onAssign={openAssignModal}
            onStageChange={handleQuickStageChange}
            onDelete={handleDeleteOrder}
            onUpdateTechnical={handleUpdateTechnical}
            onPrint={() => handlePrint(selected)}
            onManageMissing={openMissingPartsModal}
          />
        </div>
      )}

      <div className="flex flex-col md:flex-row w-full h-full overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div
            className="flex flex-col gap-3 p-4 shrink-0"
            style={{
              borderBottom: "1px solid var(--border)",
              background: "var(--surface)",
            }}
          >
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h1 className="text-lg font-bold" style={{ color: "var(--ink)" }}>
                Orders
              </h1>
              <Btn variant="primary" onClick={() => setIsCreateOpen(true)}>
                <Icons.plus /> New
              </Btn>
            </div>

            <div
              className="flex items-center gap-1 p-1 rounded-lg shrink-0 w-fit"
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
              }}
            >
              <button
                onClick={goPrevYear}
                className="p-1.5 rounded-md hover:opacity-70"
                title="Previous year"
              >
                <Icons.chevLeft />
                <Icons.chevLeft />
              </button>
              <button
                onClick={goPrevMonth}
                className="p-1.5 rounded-md hover:opacity-70"
                title="Previous month"
              >
                <Icons.chevLeft />
              </button>
              <div
                className="flex items-center gap-2 px-3 py-1 rounded-md text-sm font-bold min-w-[150px] justify-center"
                style={{ background: "var(--surface-2)", color: "var(--ink)" }}
              >
                <Icons.calendar />
                {MONTHS[viewMonth]} {viewYear}
              </div>
              <button
                onClick={goNextMonth}
                className="p-1.5 rounded-md hover:opacity-70"
                title="Next month"
              >
                <Icons.chevRight />
              </button>
              <button
                onClick={goNextYear}
                className="p-1.5 rounded-md hover:opacity-70"
                title="Next year"
              >
                <Icons.chevRight />
                <Icons.chevRight />
              </button>
              {!isCurrentMonth && (
                <button
                  onClick={goCurrentMonth}
                  className="ml-1 text-xs px-2 py-1 rounded-md font-bold"
                  style={{
                    background: "var(--surface-2)",
                    color: "var(--ink-muted)",
                  }}
                >
                  Today
                </button>
              )}
            </div>

            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
              }}
            >
              <Icons.search />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search orders…"
                className="bg-transparent text-sm outline-none w-full"
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

            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {STATUSES.map((s) => {
                const active = statusFilter === s;
                const count =
                  s === "All"
                    ? filtered.length
                    : filtered.filter((o) => o.stage === s).length;
                const stageColor =
                  s === "All" ? "var(--ink-muted)" : STAGE_INFO[s].color;
                return (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg transition-all whitespace-nowrap"
                    style={{
                      background: active ? `${stageColor}15` : "transparent",
                      color: active ? stageColor : "var(--ink-muted)",
                      border: `1px solid ${active ? `${stageColor}30` : "var(--border)"}`,
                    }}
                  >
                    {s !== "All" && (
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: stageColor }}
                      />
                    )}
                    {s === "All" ? "All" : s.replace(/_/g, " ")}
                    <span
                      className="ml-1 px-1.5 py-0.5 rounded text-[10px]"
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

            <div
              className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium"
              style={{ color: "var(--ink-muted)" }}
            >
              <span>
                {filtered.length} orders · {totalAmount.toLocaleString()} DZD
                (incl. technical)
              </span>
              {blockedCount > 0 && (
                <span
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md font-bold animate-pulse"
                  style={{
                    background: "#ef444420",
                    color: "#ef4444",
                    border: "1px solid #ef4444",
                  }}
                >
                  <Icons.ban /> {blockedCount} blocked
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <table className="w-full text-left text-sm hidden md:table">
              <thead
                className="sticky top-0 z-10"
                style={{ background: "var(--surface-2)" }}
              >
                <tr>
                  {[
                    { key: "id", label: "Order" },
                    { key: "client", label: "Client" },
                    { key: null, label: "Project" },
                    { key: "stage", label: "Status" },
                    { key: "worker", label: "Worker" },
                    { key: "amount", label: "Amount", right: true },
                    { key: "dueDate", label: "Due" },
                  ].map((col) => (
                    <th
                      key={col.label}
                      className={`px-4 py-3 text-xs font-bold uppercase tracking-wider ${col.key ? "cursor-pointer select-none" : ""}`}
                      style={{ color: "var(--ink-muted)" }}
                      onClick={col.key ? () => toggleSort(col.key) : undefined}
                    >
                      <span
                        className={
                          col.right
                            ? "flex justify-end items-center"
                            : "flex items-center"
                        }
                      >
                        {col.label} {col.key && <SortIcon col={col.key} />}
                      </span>
                    </th>
                  ))}
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => {
                  const isSel = selectedId === o.id;
                  const isOverdue =
                    new Date(o.dueDate).getTime() < today &&
                    o.stage !== "COMPLETED";
                  const missingCount = (o.missingItems || []).length;
                  const isBlocked = hasBlockingMissing(o);
                  const techFee = Number(o.technical?.fee) || 0;
                  return (
                    <tr
                      key={o.id}
                      onClick={() => {
                        setSelectedId(o.id);
                        setIsMobileDetailOpen(true);
                      }}
                      className="cursor-pointer transition-colors"
                      style={{
                        background: isBlocked
                          ? "#ff000010"
                          : isSel
                            ? "var(--accent-soft)"
                            : "transparent",
                        borderTop: "1px solid var(--border)",
                        borderLeft: isBlocked
                          ? "4px solid #ef4444"
                          : "4px solid transparent",
                        boxShadow:
                          isSel && isBlocked
                            ? "inset 0 0 0 2px #facc15"
                            : "none",
                      }}
                    >
                      <td className="px-4 py-3 font-bold">
                        {o.id}
                        {isBlocked && (
                          <span
                            className="ml-2 text-[9px] font-bold px-1.5 py-0.5 rounded inline-block animate-pulse"
                            style={{
                              background: "#ef4444",
                              color: "#fff",
                              letterSpacing: ".05em",
                            }}
                          >
                            🚫 BLOCKED
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div
                          className="font-bold text-sm"
                          style={{
                            color: isBlocked ? "#991b1b" : "var(--ink)",
                          }}
                        >
                          {o.client}
                        </div>
                        <div
                          className="text-xs"
                          style={{ color: "var(--ink-muted)" }}
                        >
                          {o.phone}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm truncate max-w-[180px]">
                          {o.project}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StageBadge stage={o.stage} />
                        {missingCount > 0 && (
                          <div
                            className={`text-[10px] mt-1 px-1.5 py-0.5 rounded inline-block font-bold ${isBlocked ? "animate-pulse" : ""}`}
                            style={{
                              background: isBlocked ? "#ef444420" : "#f59e0b15",
                              color: isBlocked ? "#ef4444" : "#f59e0b",
                              border: isBlocked ? "1px solid #ef4444" : "none",
                            }}
                          >
                            {isBlocked ? "🚫" : "⚠"} {missingCount} missing
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {o.worker === "Unassigned" ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openAssignModal(o.id);
                            }}
                            className="text-[10px] font-bold px-2 py-1 rounded-md text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 transition-colors"
                          >
                            Assign
                          </button>
                        ) : (
                          <span style={{ color: "var(--ink)" }}>
                            {o.worker}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-bold tabular-nums">
                        <div>{totalWithTech(o).toLocaleString()} DZD</div>
                        {techFee > 0 && (
                          <div
                            className="text-[10px] font-normal"
                            style={{ color: "var(--ink-muted)" }}
                          >
                            +{techFee.toLocaleString()} tech
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs ${isOverdue ? "font-bold" : ""}`}
                          style={{
                            color: isOverdue ? "#ef4444" : "var(--ink-muted)",
                          }}
                        >
                          {o.dueDate}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          className="p-1"
                          onClick={(e) => e.stopPropagation()}
                          style={{ color: "var(--ink-muted)" }}
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
                      colSpan={8}
                      className="px-4 py-12 text-center text-sm"
                      style={{ color: "var(--ink-muted)" }}
                    >
                      No orders in {MONTHS[viewMonth]} {viewYear}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div
              className="md:hidden divide-y"
              style={{ borderColor: "var(--border)" }}
            >
              {filtered.map((o) => {
                const isOverdue =
                  new Date(o.dueDate).getTime() < today &&
                  o.stage !== "COMPLETED";
                const missingCount = (o.missingItems || []).length;
                const isBlocked = hasBlockingMissing(o);
                return (
                  <div
                    key={o.id}
                    onClick={() => {
                      setSelectedId(o.id);
                      setIsMobileDetailOpen(true);
                    }}
                    className="p-4 cursor-pointer active:opacity-70"
                    style={{
                      background: isBlocked
                        ? "#fef2f2"
                        : selectedId === o.id
                          ? "var(--accent-soft)"
                          : "var(--surface)",
                      borderLeft: isBlocked
                        ? "4px solid #ef4444"
                        : "4px solid transparent",
                    }}
                  >
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <div
                        className="font-bold text-sm flex items-center gap-2 flex-wrap"
                        style={{ color: isBlocked ? "#991b1b" : "var(--ink)" }}
                      >
                        {o.id}
                        {isBlocked && (
                          <span
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded animate-pulse"
                            style={{ background: "#ef4444", color: "#fff" }}
                          >
                            🚫 BLOCKED
                          </span>
                        )}
                        <span
                          className="font-normal"
                          style={{ color: "var(--ink-muted)" }}
                        >
                          · {o.client}
                        </span>
                      </div>
                      <StageBadge stage={o.stage} />
                    </div>
                    <div
                      className="text-sm mb-2 truncate"
                      style={{ color: "var(--ink)" }}
                    >
                      {o.project}
                    </div>
                    {missingCount > 0 && (
                      <div
                        className={`text-[10px] mb-1 font-bold ${isBlocked ? "animate-pulse" : ""}`}
                        style={{ color: isBlocked ? "#ef4444" : "#f59e0b" }}
                      >
                        {isBlocked ? "🚫" : "⚠"} {missingCount} item
                        {missingCount === 1 ? "" : "s"} missing
                      </div>
                    )}
                    <div className="flex justify-between items-center text-xs">
                      <span
                        style={{
                          color: isOverdue ? "#ef4444" : "var(--ink-muted)",
                        }}
                      >
                        {isOverdue ? "Overdue: " : ""}
                        {o.dueDate}
                      </span>
                      <span className="font-bold">
                        {totalWithTech(o).toLocaleString()} DZD
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div
          className="hidden md:flex w-[420px] shrink-0 flex-col overflow-y-auto"
          style={{
            borderLeft: "1px solid var(--border)",
            background: "var(--surface)",
          }}
        >
          <OrderDetailPanel
            order={selected}
            today={today}
            onEdit={() => setIsEditOpen(true)}
            onAssign={openAssignModal}
            onStageChange={handleQuickStageChange}
            onDelete={handleDeleteOrder}
            onUpdateTechnical={handleUpdateTechnical}
            onPrint={() => handlePrint(selected)}
            onManageMissing={openMissingPartsModal}
          />
        </div>
      </div>

      <OrderFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={handleCreateOrder}
        existingClients={existingClients}
      />
      <OrderFormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={handleUpdateOrder}
        initialData={selected}
        existingClients={existingClients}
      />
      <AssignWorkerModal
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        onAssign={handleAssignWorker}
        currentWorker={orders.find((o) => o.id === assigningOrderId)?.worker}
      />
      <ReadyToDeliverModal
        isOpen={isReadyConfirmOpen}
        onClose={() => setIsReadyConfirmOpen(false)}
        order={orders.find((o) => o.id === assigningOrderId)}
        onConfirm={handleReadyConfirm}
      />
      <MissingPartsModal
        isOpen={isMissingPartsOpen}
        onClose={() => setIsMissingPartsOpen(false)}
        order={orders.find((o) => o.id === managingOrderId)}
        onUpdate={handleUpdateMissingParts}
      />
    </div>
  );
}

/* ─── Order Detail Panel ─── */

function OrderDetailPanel({
  order,

  today,

  onEdit,

  onAssign,

  onStageChange,

  onDelete,

  onUpdateTechnical,

  onPrint,

  onManageMissing,
}) {
  if (!order) {
    return (
      <div
        className="flex items-center justify-center h-full p-8 text-sm"
        style={{ color: "var(--ink-muted)" }}
      >
        Loading…
      </div>
    );
  }

  const isOverdue =
    new Date(order.dueDate).getTime() < today && order.stage !== "COMPLETED";
  const progress = order.amount > 0 ? (order.paid / order.amount) * 100 : 0;
  const missingCount = (order.missingItems || []).length;
  const isBlocked = hasBlockingMissing(order);
  const tech = order.technical || { truckDistance: "", floor: "", fee: "" };
  const techFee = Number(tech.fee) || 0;
  const grandTotal = (order.amount || 0) + techFee;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="p-5"
        style={{
          borderBottom: "1px solid var(--border)",
          background: isBlocked
            ? "linear-gradient(135deg, #ff000040, var(--surface))"
            : "var(--surface)",
        }}
      >
        <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
          <h2
            className="text-lg font-bold truncate flex items-center gap-2"
            style={{ color: isBlocked ? "#ffffff" : "var(--ink)" }}
          >
            {order.id}
            {isBlocked && (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded animate-pulse"
                style={{
                  background: "#ef4444",
                  color: "#fff",
                  letterSpacing: ".05em",
                }}
              >
                🚫 BLOCKED
              </span>
            )}
          </h2>
          <StageBadge stage={order.stage} size="lg" />
        </div>
        <p className="text-sm mb-4" style={{ color: "var(--ink-muted)" }}>
          {order.project}
        </p>
        <Stepper currentStage={order.stage} />
        <div
          className="flex justify-between mt-2 text-[10px] uppercase tracking-wider font-bold"
          style={{ color: "var(--ink-muted)" }}
        >
          <span>Appt</span>
          <span>Contract</span>
          <span
            style={{
              color:
                order.stage === "IN_PRODUCTION" ? "var(--accent)" : undefined,
            }}
          >
            Production
          </span>
          <span>Ready</span>
          <span>Done</span>
        </div>
      </div>

      {/* Missing Parts — always visible, prominent when READY_TO_DELIVER */}
      <div
        className="p-5 space-y-3"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-center justify-between gap-2">
          <h3
            className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
            style={{ color: isBlocked ? "#ef4444" : "var(--ink-muted)" }}
          >
            <Icons.alertTriangle /> Missing Parts
            {missingCount > 0 && (
              <span
                className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${isBlocked ? "animate-pulse" : ""}`}
                style={{
                  background: isBlocked ? "#ef4444" : "#f59e0b",
                  color: "#fff",
                }}
              >
                {missingCount}
              </span>
            )}
          </h3>
          <button
            onClick={() => onManageMissing(order.id)}
            className="text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1 transition-all hover:brightness-110"
            style={{
              background: "var(--accent-soft)",
              color: "var(--accent)",
              border: "1px solid var(--accent)",
            }}
          >
            <Icons.edit /> Manage
          </button>
        </div>

        {missingCount === 0 ? (
          <div
            className="text-center py-3 text-xs rounded-lg flex items-center justify-center gap-2"
            style={{
              background: "#16a34a08",
              border: "1px dashed #16a34a40",
              color: "#16a34a",
            }}
          >
            <Icons.check /> No missing parts reported.
          </div>
        ) : (
          <div className="space-y-1.5">
            {order.missingItems.map((p, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-2 text-xs px-2.5 py-2 rounded-md"
                style={{
                  background: isBlocked ? "#fef2f2" : "#fffbeb",
                  border: `1px solid ${isBlocked ? "#fecaca" : "#fde68a"}`,
                }}
              >
                <span className="flex items-center gap-1.5 min-w-0 flex-1">
                  <Icons.package />
                  <span
                    className="truncate font-medium"
                    style={{ color: isBlocked ? "#991b1b" : "#92400e" }}
                  >
                    {p.name}
                  </span>
                  {p.notes && (
                    <span
                      className="text-[10px] italic truncate"
                      style={{ color: "var(--ink-muted)" }}
                    >
                      — {p.notes}
                    </span>
                  )}
                </span>
                <span
                  className="font-bold tabular-nums shrink-0"
                  style={{ color: isBlocked ? "#dc2626" : "#d97706" }}
                >
                  ×{p.qty} {p.unit}
                </span>
              </div>
            ))}
            {isBlocked && (
              <div
                className="flex items-start gap-2 text-[10px] p-2 rounded mt-1"
                style={{ background: "#fef2f2", color: "#991b1b" }}
              >
                <Icons.ban />
                <span>
                  <strong>Blocked from completion.</strong> Resolve all missing
                  parts to mark as Done.
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick stage change */}
      <div
        className="p-5 space-y-2"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <h3
          className="text-xs font-bold uppercase tracking-wider flex items-center gap-1"
          style={{ color: "var(--ink-muted)" }}
        >
          <Icons.sparkles /> Quick stage change
        </h3>
        <div className="grid grid-cols-5 gap-1.5">
          {Object.entries(STAGE_INFO).map(([key, info]) => {
            const active = order.stage === key;
            return (
              <button
                key={key}
                onClick={() => onStageChange(order.id, key)}
                className="text-[10px] font-bold px-2 py-1.5 rounded-md transition-all hover:brightness-110 active:scale-95"
                style={{
                  background: active ? `${info.color}25` : "transparent",
                  color: active ? info.color : "var(--ink-muted)",
                  border: `1px solid ${active ? `${info.color}50` : "var(--border)"}`,
                }}
              >
                {info.short}
              </button>
            );
          })}
        </div>
      </div>

      {/* Client */}
      <div
        className="p-5 space-y-3"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{ background: "var(--surface-2)", color: "var(--accent)" }}
          >
            {order.client
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </div>
          <div className="min-w-0">
            <div
              className="text-sm font-bold truncate"
              style={{ color: "var(--ink)" }}
            >
              {order.client}
            </div>
            <div
              className="text-xs flex items-center gap-1"
              style={{ color: "var(--ink-muted)" }}
            >
              <Icons.phone /> {order.phone}
            </div>
          </div>
        </div>
        <div
          className="text-xs flex items-start gap-1"
          style={{ color: "var(--ink-muted)" }}
        >
          <Icons.mapPin /> {order.address}
        </div>
      </div>

      {/* Meta */}
      <div
        className="p-5 grid grid-cols-2 gap-3"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div
          className="p-3 rounded-lg"
          style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
        >
          <div
            className="text-xs mb-1 font-bold uppercase"
            style={{ color: "var(--ink-muted)" }}
          >
            Assigned
          </div>
          {order.worker === "Unassigned" ? (
            <button
              onClick={() => onAssign(order.id)}
              className="text-sm font-bold text-red-500 hover:underline"
            >
              Assign Now
            </button>
          ) : (
            <div className="text-sm font-bold" style={{ color: "var(--ink)" }}>
              {order.worker}
            </div>
          )}
        </div>
        <div
          className="p-3 rounded-lg"
          style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
        >
          <div
            className="text-xs mb-1 font-bold uppercase"
            style={{ color: "var(--ink-muted)" }}
          >
            Due Date
          </div>
          <div
            className={`text-sm font-bold ${isOverdue ? "text-red-500" : ""}`}
            style={{ color: isOverdue ? undefined : "var(--ink)" }}
          >
            {isOverdue ? "Overdue: " : ""}
            {order.dueDate}
          </div>
        </div>
      </div>

      {/* Technical file */}
      <div
        className="p-5 space-y-3"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <h3
          className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
          style={{ color: "var(--ink-muted)" }}
        >
          <Icons.ruler /> Technical file
        </h3>
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label
              className="flex items-center gap-1 text-[10px] font-bold uppercase mb-1"
              style={{ color: "var(--ink-muted)" }}
            >
              <Icons.truck /> Truck distance (m)
            </label>
            <input
              type="number"
              min="0"
              value={tech.truckDistance ?? ""}
              onChange={(e) =>
                onUpdateTechnical(
                  "truckDistance",
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
              placeholder="e.g. 45"
              className="w-full px-2.5 py-2 rounded-md text-sm outline-none"
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
                color: "var(--ink)",
              }}
            />
          </div>
          <div>
            <label
              className="flex items-center gap-1 text-[10px] font-bold uppercase mb-1"
              style={{ color: "var(--ink-muted)" }}
            >
              <Icons.layers /> Floor
            </label>
            <input
              type="number"
              min="0"
              value={tech.floor ?? ""}
              onChange={(e) =>
                onUpdateTechnical(
                  "floor",
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
              placeholder="e.g. 4"
              className="w-full px-2.5 py-2 rounded-md text-sm outline-none"
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
                color: "var(--ink)",
              }}
            />
          </div>
        </div>
        <div>
          <label
            className="flex items-center gap-1 text-[10px] font-bold uppercase mb-1"
            style={{ color: "var(--ink-muted)" }}
          >
            <Icons.receipt /> Technical fee (DZD) — manual
          </label>
          <input
            type="number"
            min="0"
            value={tech.fee ?? ""}
            onChange={(e) =>
              onUpdateTechnical(
                "fee",
                e.target.value === "" ? "" : Number(e.target.value),
              )
            }
            placeholder="e.g. 8500"
            className="w-full px-2.5 py-2 rounded-md text-sm outline-none font-bold tabular-nums"
            style={{
              background: "var(--bg)",
              border: "1px solid var(--border)",
              color: "var(--accent)",
            }}
          />
          <div
            className="text-[10px] mt-1.5 italic"
            style={{ color: "var(--ink-muted)" }}
          >
            Calculate manually based on distance + floor, then add here.
          </div>
        </div>
        {techFee > 0 && (
          <div
            className="rounded-lg p-2.5 flex items-center justify-between"
            style={{
              background: "var(--accent-soft)",
              border: "1px solid var(--accent)",
            }}
          >
            <span
              className="text-xs font-bold"
              style={{ color: "var(--accent)" }}
            >
              Added to total
            </span>
            <span
              className="text-sm font-bold tabular-nums"
              style={{ color: "var(--accent)" }}
            >
              +{formatDZD(techFee)}
            </span>
          </div>
        )}
      </div>

      {/* Financial */}
      <div
        className="p-5 space-y-2.5"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <h3
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color: "var(--ink-muted)" }}
        >
          Financial
        </h3>
        <div className="flex justify-between text-sm">
          <span style={{ color: "var(--ink-muted)" }}>Order</span>
          <span className="font-bold tabular-nums">
            {formatDZD(order.amount)}
          </span>
        </div>
        {techFee > 0 && (
          <div className="flex justify-between text-sm">
            <span style={{ color: "var(--ink-muted)" }}>Technical</span>
            <span
              className="font-bold tabular-nums"
              style={{ color: "var(--accent)" }}
            >
              +{formatDZD(techFee)}
            </span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span style={{ color: "var(--ink-muted)" }}>Paid</span>
          <span
            className="font-bold tabular-nums"
            style={{ color: "var(--stage-completed)" }}
          >
            {formatDZD(order.paid)}
          </span>
        </div>
        <div
          className="flex justify-between text-sm pt-2"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <span style={{ color: "var(--ink)" }} className="font-bold">
            Grand total
          </span>
          <span
            className="font-bold tabular-nums"
            style={{ color: "var(--ink)" }}
          >
            {formatDZD(grandTotal)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span style={{ color: "var(--ink-muted)" }}>Remaining</span>
          <span
            className="font-bold tabular-nums"
            style={{
              color:
                grandTotal - order.paid > 0
                  ? "var(--accent)"
                  : "var(--stage-completed)",
            }}
          >
            {formatDZD(grandTotal - order.paid)}
          </span>
        </div>
        <div
          className="h-1.5 w-full rounded-full overflow-hidden"
          style={{ background: "var(--surface-2)" }}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(100, (order.paid / Math.max(grandTotal, 1)) * 100)}%`,
              background:
                order.paid >= grandTotal
                  ? "var(--stage-completed)"
                  : "var(--accent)",
            }}
          />
        </div>
        {order.payments && order.payments.length > 0 && (
          <div className="mt-3 space-y-2">
            <h4
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color: "var(--ink-muted)" }}
            >
              Payment History
            </h4>
            {order.payments.map((p, i) => (
              <div
                key={i}
                className="flex justify-between items-center text-xs p-2 rounded-md"
                style={{
                  background: "rgba(16,185,129,0.08)",
                  border: "1px solid rgba(16,185,129,0.15)",
                }}
              >
                <span
                  className="flex items-center gap-1"
                  style={{ color: "var(--ink-muted)" }}
                >
                  <Icons.calendar /> {p.date}
                </span>
                <span
                  className="font-bold"
                  style={{ color: "var(--stage-completed)" }}
                >
                  + {p.amount.toLocaleString()} DZD
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Items */}
      <div
        className="p-5 space-y-3"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <h3
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color: "var(--ink-muted)" }}
        >
          Items & Measurements
        </h3>
        {order.items && order.items.length > 0 ? (
          order.items.map((item, i) => {
            const isMissing = (order.missingItems || []).some(
              (p) => p.name === item.name,
            );
            return (
              <div
                key={i}
                className="flex items-start gap-3 text-sm p-2 rounded-md"
                style={{
                  background: isMissing
                    ? isBlocked
                      ? "#fef2f2"
                      : "#fffbeb"
                    : "var(--bg)",
                  border: isMissing
                    ? `1px solid ${isBlocked ? "#fecaca" : "#fde68a"}`
                    : "none",
                }}
              >
                <span
                  style={{
                    color: isMissing
                      ? isBlocked
                        ? "#dc2626"
                        : "#d97706"
                      : "var(--ink-muted)",
                  }}
                >
                  <Icons.package />
                </span>
                <div className="flex-1 min-w-0">
                  <div
                    className="font-medium flex items-center gap-2 flex-wrap"
                    style={{
                      color: isMissing && isBlocked ? "#991b1b" : "var(--ink)",
                    }}
                  >
                    <span className="truncate">{item.name}</span>
                    {isMissing && (
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0"
                        style={{
                          background: isBlocked ? "#ef444420" : "#f59e0b20",
                          color: isBlocked ? "#ef4444" : "#f59e0b",
                        }}
                      >
                        MISSING
                      </span>
                    )}
                  </div>
                  <div
                    className="text-xs mt-1 flex flex-wrap gap-2"
                    style={{ color: "var(--ink-muted)" }}
                  >
                    <span>
                      Qty: {item.qty} {item.unit}
                    </span>
                    {(item.l > 0 || item.w > 0 || item.h > 0) && (
                      <span
                        className="font-mono font-bold"
                        style={{ color: "var(--stage-contract)" }}
                      >
                        {item.l}cm × {item.w}cm × {item.h}cm
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div
            className="text-xs text-center py-4"
            style={{ color: "var(--ink-muted)" }}
          >
            No items listed.
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-5 mt-auto space-y-2">
        <button
          onClick={onEdit}
          className="w-full flex items-center justify-center gap-2 text-sm font-bold px-4 py-2.5 rounded-lg text-white transition-all hover:brightness-110 active:scale-95"
          style={{ background: "var(--accent)" }}
        >
          <Icons.edit /> Edit Order
        </button>
        <div className="flex gap-2">
          <button
            onClick={onPrint}
            className="flex-1 flex items-center justify-center gap-2 text-sm font-bold px-4 py-2.5 rounded-lg transition-all hover:brightness-110"
            style={{
              border: "1px solid var(--border)",
              color: "var(--ink)",
              background: "var(--bg)",
            }}
          >
            <Icons.print /> Print
          </button>
          <button
            onClick={() => onDelete(order.id)}
            className="flex-1 flex items-center justify-center gap-2 text-sm font-bold px-4 py-2.5 rounded-lg transition-all hover:brightness-110"
            style={{
              border: "1px solid var(--border)",
              color: "#ef4444",
              background: "var(--bg)",
            }}
          >
            <Icons.trash /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}
