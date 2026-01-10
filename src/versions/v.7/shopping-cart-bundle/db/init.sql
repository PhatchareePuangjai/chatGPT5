-- Strongly typed status
DO $$ BEGIN
  CREATE TYPE cart_item_status AS ENUM ('active', 'saved');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Products: store price as integer cents for exact math
CREATE TABLE IF NOT EXISTS products (
  id            BIGSERIAL PRIMARY KEY,
  sku           TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  price_cents   INTEGER NOT NULL CHECK (price_cents >= 0),
  stock         INTEGER NOT NULL CHECK (stock >= 0),
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Cart items: one row per (user, product, status) enforced via partial unique indexes
CREATE TABLE IF NOT EXISTS cart_items (
  id            BIGSERIAL PRIMARY KEY,
  user_id       BIGINT NOT NULL,
  product_id    BIGINT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  status        cart_item_status NOT NULL DEFAULT 'active',
  quantity      INTEGER NOT NULL CHECK (quantity > 0),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enforce "merge duplicates": at most one active and one saved row per product per user
CREATE UNIQUE INDEX IF NOT EXISTS cart_items_unique_active
  ON cart_items(user_id, product_id)
  WHERE status = 'active';

CREATE UNIQUE INDEX IF NOT EXISTS cart_items_unique_saved
  ON cart_items(user_id, product_id)
  WHERE status = 'saved';

-- Helpful indexes
CREATE INDEX IF NOT EXISTS cart_items_user_status_idx
  ON cart_items(user_id, status);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS products_set_updated_at ON products;
CREATE TRIGGER products_set_updated_at
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS cart_items_set_updated_at ON cart_items;
CREATE TRIGGER cart_items_set_updated_at
BEFORE UPDATE ON cart_items
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Seed products (idempotent upsert by sku)
INSERT INTO products (sku, name, price_cents, stock)
VALUES
  ('SKU-APPLE',  'Apple',  199,  50),
  ('SKU-BANANA', 'Banana',  99,  25),
  ('SKU-COFFEE', 'Coffee', 1299, 10),
  ('SKU-TEA',    'Tea',     799, 20)
ON CONFLICT (sku) DO UPDATE
SET name = EXCLUDED.name,
    price_cents = EXCLUDED.price_cents,
    stock = EXCLUDED.stock,
    is_active = TRUE;
