-- Schema
CREATE TABLE IF NOT EXISTS products (
  id            BIGSERIAL PRIMARY KEY,
  sku           TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  stock         INTEGER NOT NULL CHECK (stock >= 0),
  low_stock_threshold INTEGER NOT NULL DEFAULT 5 CHECK (low_stock_threshold >= 0),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inventory_log (
  id          BIGSERIAL PRIMARY KEY,
  product_id  BIGINT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  type        TEXT NOT NULL CHECK (type IN ('SALE', 'RESTOCK/RETURN', 'LOW_STOCK_ALERT')),
  quantity    INTEGER NOT NULL CHECK (quantity > 0),
  note        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inventory_log_product_created
  ON inventory_log(product_id, created_at DESC);

-- updated_at trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
CREATE TRIGGER trg_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Seed product:
-- stock=6 so that buying 1 triggers low stock alert exactly at remaining=5
INSERT INTO products (id, sku, name, stock, low_stock_threshold)
VALUES (1, 'SKU-001', 'Demo Product (Seeded)', 6, 5)
ON CONFLICT (id) DO NOTHING;
