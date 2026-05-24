-- Baseline schema for Shopping Cart Core Behaviors.
-- This migration is intentionally minimal and is used as a starting point.

CREATE TABLE IF NOT EXISTS products (
  sku TEXT PRIMARY KEY,
  unit_price_minor INTEGER NOT NULL CHECK (unit_price_minor >= 0),
  active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS inventory (
  sku TEXT PRIMARY KEY REFERENCES products(sku),
  available_qty INTEGER NOT NULL CHECK (available_qty >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS carts (
  cart_id TEXT PRIMARY KEY,
  owner_key TEXT,
  currency TEXT NOT NULL DEFAULT 'THB',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cart_items (
  cart_id TEXT NOT NULL REFERENCES carts(cart_id),
  sku TEXT NOT NULL REFERENCES products(sku),
  qty INTEGER NOT NULL CHECK (qty > 0),
  unit_price_minor INTEGER NOT NULL CHECK (unit_price_minor >= 0),
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (cart_id, sku)
);

CREATE TABLE IF NOT EXISTS saved_items (
  cart_id TEXT NOT NULL REFERENCES carts(cart_id),
  sku TEXT NOT NULL REFERENCES products(sku),
  saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (cart_id, sku)
);

-- Performance/lookup indexes.
CREATE INDEX IF NOT EXISTS idx_inventory_sku ON inventory(sku);
