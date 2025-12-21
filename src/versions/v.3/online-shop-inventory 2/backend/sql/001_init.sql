CREATE TABLE IF NOT EXISTS products (
  id           BIGSERIAL PRIMARY KEY,
  sku          TEXT UNIQUE NOT NULL,
  name         TEXT NOT NULL,
  price_cents  INTEGER NOT NULL DEFAULT 0 CHECK (price_cents >= 0),
  stock        INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stock_history (
  id            BIGSERIAL PRIMARY KEY,
  product_id    BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  change_type   TEXT NOT NULL CHECK (change_type IN ('PURCHASE','RESTOCK','ADJUSTMENT')),
  delta         INTEGER NOT NULL,
  before_stock  INTEGER NOT NULL,
  after_stock   INTEGER NOT NULL,
  reason        TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);
CREATE INDEX IF NOT EXISTS idx_stock_history_product ON stock_history(product_id);
