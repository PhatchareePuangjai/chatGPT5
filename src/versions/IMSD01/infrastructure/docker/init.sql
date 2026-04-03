CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  sku TEXT UNIQUE NOT NULL,
  available_qty INTEGER NOT NULL,
  low_stock_threshold INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS inventory_logs (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  operation TEXT NOT NULL,
  quantity_delta INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  requested_qty INTEGER NOT NULL,
  status TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS alerts (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  stock_level INTEGER NOT NULL
);

INSERT INTO products (id, sku, available_qty, low_stock_threshold)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'SKU-001', 10, 5),
  ('22222222-2222-2222-2222-222222222222', 'SKU-002', 6, 5),
  ('33333333-3333-3333-3333-333333333333', 'SKU-003', 5, 5)
ON CONFLICT (sku) DO NOTHING;
