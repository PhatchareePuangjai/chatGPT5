import { ApiError } from './errors.js';

export function requireString(body: unknown, key: string): string {
  if (!body || typeof body !== 'object') throw badRequest(`Missing body`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const value = (body as any)[key];
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw badRequest(`Field "${key}" is required`);
  }
  return value.trim();
}

function badRequest(message: string) {
  return new ApiError({ status: 400, code: 'BAD_REQUEST', message });
}
