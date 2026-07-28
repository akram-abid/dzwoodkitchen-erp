// app/api/tasks/tasks.js
//
// Client-side helpers for the tasks API. Same shape as
// app/api/orders/orders.js — thin fetch wrappers plus a normalizer
// that converts the DB row shape into the shape the dashboard's
// task UI already expects (id, text, done, priority, dueDate,
// dueTime, assignee, notified).

async function handle(res) {
  let body = null;
  try {
    body = await res.json();
  } catch {
    // no JSON body (e.g. empty 204) — fine
  }
  if (!res.ok) {
    const message = body?.error || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return body;
}

// Converts a DateTime/ISO string from the DB into a plain "YYYY-MM-DD"
// string, which is what the dashboard's date comparisons/inputs use.
function toDateOnly(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

export function normalizeTask(t) {
  if (!t) return t;
  return {
    id: t.id,
    text: t.text,
    done: !!t.done,
    priority: t.priority || "MEDIUM",
    dueDate: toDateOnly(t.due_date),
    dueTime: t.due_time || null,
    assignee: t.assignee || null,
    notified: !!t.notified,
  };
}

export async function fetchTasks() {
  const res = await fetch("/api/tasks", { cache: "no-store" });
  return handle(res);
}

export async function createTaskClient(data) {
  const res = await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handle(res);
}

export async function patchTaskClient(id, data) {
  const res = await fetch(`/api/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handle(res);
}

export async function deleteTaskClient(id) {
  const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
  return handle(res);
}