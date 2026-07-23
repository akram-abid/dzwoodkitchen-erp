export async function getAllCategoriesClient() {
  const res = await fetch("/api/categories", { credentials: "include" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.error || `Failed to load categories: ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}