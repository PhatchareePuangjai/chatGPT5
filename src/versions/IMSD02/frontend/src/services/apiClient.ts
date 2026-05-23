export type ApiError = { code: string; message: string; details?: unknown };

const defaultBase = "http://localhost:3000/api";

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const base = (import.meta as any).env?.VITE_API_BASE ?? defaultBase;
  const method = (init?.method ?? "GET").toUpperCase();
  const hasBody = init?.body != null;
  const headers: Record<string, string> = {};
  // Only set content-type when we actually send a JSON body; setting it on GET triggers a CORS preflight.
  if (hasBody && method !== "GET" && method !== "HEAD") {
    headers["content-type"] = "application/json";
  }

  const res = await fetch(base + path, {
    ...init,
    headers: {
      ...headers,
      ...(init?.headers ?? {})
    }
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw (body ?? { code: "HTTP_ERROR", message: `HTTP ${res.status}` }) as ApiError;
  }
  return body as T;
}
