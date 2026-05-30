export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const baseUrl = 'http://localhost:3001';
  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) },
  });

  const text = await res.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!res.ok) {
    const message = typeof (data as any)?.message === 'string' ? (data as any).message : res.statusText;
    throw new Error(message);
  }

  return data as T;
}

