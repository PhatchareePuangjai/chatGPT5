-- Initial schema for inventory stock operations

CREATE TABLE IF NOT EXISTS skus (
  id BIGSERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  on_hand_qty INTEGER NOT NULL CHECK (on_hand_qty >= 0),
  low_stock_threshold INTEGER NOT NULL CHECK (low_stock_threshold >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_lines (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  sku_id BIGINT NOT NULL REFERENCES skus(id),
  qty INTEGER NOT NULL CHECK (qty > 0)
);

CREATE TABLE IF NOT EXISTS inventory_logs (
  id BIGSERIAL PRIMARY KEY,
  sku_id BIGINT NOT NULL REFERENCES skus(id),
  delta_qty INTEGER NOT NULL,
  reason TEXT NOT NULL,
  reference_type TEXT NOT NULL,
  reference_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS low_stock_alerts (
  id BIGSERIAL PRIMARY KEY,
  sku_id BIGINT NOT NULL REFERENCES skus(id),
  on_hand_qty_at_trigger INTEGER NOT NULL CHECK (on_hand_qty_at_trigger >= 0),
  threshold_at_trigger INTEGER NOT NULL CHECK (threshold_at_trigger >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_lines_order_id ON order_lines(order_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_sku_id ON inventory_logs(sku_id);
CREATE INDEX IF NOT EXISTS idx_low_stock_alerts_sku_id ON low_stock_alerts(sku_id);
