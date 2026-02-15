CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS inventory_items (
  sku TEXT PRIMARY KEY,
  quantity INTEGER NOT NULL CHECK (quantity >= 0),
  low_stock_threshold INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT NOT NULL REFERENCES inventory_items (sku),
  change_type TEXT NOT NULL,
  quantity_delta INTEGER NOT NULL,
  order_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stock_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT NOT NULL REFERENCES inventory_items (sku),
  threshold INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'OPEN',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_reservations (
  id TEXT PRIMARY KEY,
  sku TEXT NOT NULL REFERENCES inventory_items (sku),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  status TEXT NOT NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
