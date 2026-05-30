export function requireString(v: unknown, field: string): string {
  if (typeof v !== "string" || !v.trim()) throw new Error(`Invalid ${field}`);
  return v.trim();
}

export function requirePositiveInt(v: unknown, field: string): number {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isInteger(n) || n <= 0) throw new Error(`Invalid ${field}`);
  return n;
}

export function requireEnum<T extends string>(v: unknown, field: string, allowed: readonly T[]): T {
  if (typeof v !== "string") throw new Error(`Invalid ${field}`);
  if (!allowed.includes(v as T)) throw new Error(`Invalid ${field}`);
  return v as T;
}

