export async function createOrder(data) {
    const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error);
    return result.data;
}