-- Core tables for shopping cart behaviors.

CREATE TABLE IF NOT EXISTS carts (
  id UUID PRIMARY KEY,
  shopper_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_items (
  sku TEXT PRIMARY KEY,
  available_quantity INTEGER NOT NULL CHECK (available_quantity >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY,
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  sku TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'SAVED')),
  quantity INTEGER NOT NULL CHECK (quantity >= 0),
  unit_price_minor INTEGER NOT NULL CHECK (unit_price_minor >= 0),
  line_total_minor INTEGER NOT NULL CHECK (line_total_minor >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Hot-path indexes.
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_status ON cart_items(cart_id, status);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_sku_status ON cart_items(cart_id, sku, status);

