export async function createClient(data) {
    const response = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    const result = await response.json();
    console.log(result)

    if (!response.ok) throw new Error(result.error);
    return result.data;
}