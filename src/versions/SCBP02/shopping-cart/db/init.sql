-- db/init.sql
-- Currency is stored in integer cents to ensure perfect precision.

CREATE TYPE cart_item_status AS ENUM ('ACTIVE', 'SAVED');

CREATE TABLE IF NOT EXISTS products (
  sku           TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  price_cents   INTEGER NOT NULL CHECK (price_cents >= 0),
  stock         INTEGER NOT NULL CHECK (stock >= 0),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cart_items (
  id           BIGSERIAL PRIMARY KEY,
  cart_id      UUID NOT NULL,
  sku          TEXT NOT NULL REFERENCES products(sku) ON UPDATE CASCADE ON DELETE RESTRICT,
  quantity     INTEGER NOT NULL CHECK (quantity > 0),
  status       cart_item_status NOT NULL DEFAULT 'ACTIVE',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT cart_items_cart_sku_unique UNIQUE (cart_id, sku)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_status ON cart_items(status);

-- simple updated_at trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
CREATE TRIGGER trg_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_cart_items_updated_at ON cart_items;
CREATE TRIGGER trg_cart_items_updated_at
BEFORE UPDATE ON cart_items
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Seed products (SKUs must be unique)
INSERT INTO products (sku, name, price_cents, stock)
VALUES
  ('SKU-APPLE',  'Apple',  1999,  12),
  ('SKU-BANANA', 'Banana',  499,  25),
  ('SKU-COFFEE', 'Coffee', 1299,   8),
  ('SKU-TEA',    'Tea',     899,  15)
ON CONFLICT (sku) DO UPDATE
SET name = EXCLUDED.name,
    price_cents = EXCLUDED.price_cents,
    stock = EXCLUDED.stock;
