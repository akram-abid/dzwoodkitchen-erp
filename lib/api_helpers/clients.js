export async function createClient(data) {
    const response = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) throw new Error(result.error);
    return result.data;
}

export async function updateClient(clientId, data) {
    const response = await fetch(`/api/clients/${clientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error);
    return result.data;
}

export async function deleteClient(clientId) {
    const response = await fetch(`/api/clients/${clientId}`, {
        method: "DELETE",
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error);
    return result;
}