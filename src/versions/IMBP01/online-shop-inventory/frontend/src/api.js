const API_BASE =
  import.meta?.env?.VITE_API_BASE ?? "http://localhost:3001";

export async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`GET ${path} failed (${res.status})`);
  return res.json();
}

export async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {})
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.error || `POST ${path} failed (${res.status})`);
  }
  return json;
}
