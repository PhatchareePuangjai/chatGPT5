export type ApiError = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = (json?.error ?? { code: "HTTP_ERROR", message: "Request failed." }) as ApiError;
    throw err;
  }
  return json.data as T;
}

