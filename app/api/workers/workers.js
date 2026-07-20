// app/api/workers/workers.js
export async function fetchWorkers() {
  const res = await fetch(`/api/workers`, {
    cache: "no-store",
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch workers: ${res.status}`);
  }
  return res.json();
}