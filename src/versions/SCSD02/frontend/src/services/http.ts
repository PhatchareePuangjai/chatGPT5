export type HttpError = {
  status: number;
  code?: string;
  message: string;
};

async function readJsonSafe(res: Response): Promise<any> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function httpJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  const body = await readJsonSafe(res);
  if (!res.ok) {
    const errBody = body?.error;
    const e: HttpError = {
      status: res.status,
      code: errBody?.code,
      message: errBody?.message ?? `Request failed (${res.status})`,
    };
    throw e;
  }
  return body as T;
}

