CREATE TABLE IF NOT EXISTS products (
  id bigserial PRIMARY KEY,
  sku text NOT NULL UNIQUE,
  on_hand integer NOT NULL CHECK (on_hand >= 0),
  low_stock_threshold integer NOT NULL DEFAULT 5 CHECK (low_stock_threshold >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

