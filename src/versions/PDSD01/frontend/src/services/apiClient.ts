const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001';

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: unknown };

export async function apiGet<T>(path: string): Promise<ApiResult<T>> {
  try {
    const response = await fetch(`${apiBaseUrl}${path}`);
    const data = (await response.json()) as T;
    if (!response.ok) return { ok: false, error: data };
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error };
  }
}

export async function apiPost<T>(path: string, body: unknown): Promise<ApiResult<T>> {
  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = (await response.json()) as T;
    if (!response.ok) return { ok: false, error: data };
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error };
  }
}

export async function apiDelete<T>(path: string): Promise<ApiResult<T>> {
  try {
    const response = await fetch(`${apiBaseUrl}${path}`, { method: 'DELETE' });
    const data = (await response.json()) as T;
    if (!response.ok) return { ok: false, error: data };
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error };
  }
}
