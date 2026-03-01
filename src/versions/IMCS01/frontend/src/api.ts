export type Product = {
  id: number;
  sku: string;
  name: string;
  quantity: number;
  low_stock_threshold: number;
  created_at: string;
  updated_at: string;
};

export type Alert = {
  id: number;
  product_id: number;
  kind: string;
  message: string;
  resolved: boolean;
  created_at: string;
};

export type InventoryLog = {
  id: number;
  product_id: number;
  type: string;
  delta: number;
  note?: string | null;
  created_at: string;
};

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

async function readErrorMessage(res: Response): Promise<string> {
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      const data = (await res.json()) as unknown;
      if (data && typeof data === "object" && "detail" in data) {
        const detail = (data as { detail?: unknown }).detail;
        if (typeof detail === "string") return detail;
        return JSON.stringify(detail);
      }
      return JSON.stringify(data);
    } catch {
      // fall through
    }
  }
  try {
    const text = await res.text();
    return text || `HTTP ${res.status}`;
  } catch {
    return `HTTP ${res.status}`;
  }
}

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }
  return (await res.json()) as T;
}

export function listProducts() {
  return http<Product[]>("/products");
}

export function createProduct(input: {
  sku: string;
  name: string;
  quantity: number;
  low_stock_threshold: number;
}) {
  return http<Product>("/products", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function purchase(input: { sku: string; quantity: number }) {
  return http<Product>("/purchase", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function restore(input: { sku: string; quantity: number }) {
  return http<Product>("/restore", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function listAlerts() {
  return http<Alert[]>("/alerts");
}

export function listLogs() {
  return http<InventoryLog[]>("/logs");
}

