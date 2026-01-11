-- Promotions & Discounts System (integer money = satang)
-- All monetary columns are stored in satang (THB * 100) to avoid floating point errors.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  -- Business rules
  min_purchase_satang INTEGER NOT NULL DEFAULT 0 CHECK (min_purchase_satang >= 0),
  expires_at TIMESTAMPTZ NULL,
  one_time_per_user BOOLEAN NOT NULL DEFAULT FALSE,

  -- Discount fields (supports percent + fixed in the same coupon if desired)
  percent_bps INTEGER NOT NULL DEFAULT 0 CHECK (percent_bps >= 0 AND percent_bps <= 10000), -- 10000 bps = 100%
  fixed_discount_satang INTEGER NOT NULL DEFAULT 0 CHECK (fixed_discount_satang >= 0),

  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,

  original_total_satang INTEGER NOT NULL CHECK (original_total_satang >= 0),

  -- stored breakdown for auditability
  discount_percent_satang INTEGER NOT NULL DEFAULT 0 CHECK (discount_percent_satang >= 0),
  discount_fixed_satang INTEGER NOT NULL DEFAULT 0 CHECK (discount_fixed_satang >= 0),

  grand_total_satang INTEGER NOT NULL CHECK (grand_total_satang >= 0),

  applied_coupon_id UUID NULL REFERENCES coupons(id),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);

CREATE TABLE IF NOT EXISTS user_coupon_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  coupon_id UUID NOT NULL REFERENCES coupons(id),
  order_id UUID NOT NULL REFERENCES orders(id),

  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (user_id, coupon_id)
);

CREATE INDEX IF NOT EXISTS idx_history_user ON user_coupon_history(user_id);
CREATE INDEX IF NOT EXISTS idx_history_coupon ON user_coupon_history(coupon_id);

-- Seed demo data
-- User ids are fixed to make frontend demo easy.
DO $$
DECLARE
  demo_user UUID := '11111111-1111-1111-1111-111111111111';
  order_50 UUID := '22222222-2222-2222-2222-222222222222';
  order_600 UUID := '33333333-3333-3333-3333-333333333333';
BEGIN
  -- Coupons
  INSERT INTO coupons (code, min_purchase_satang, expires_at, one_time_per_user, percent_bps, fixed_discount_satang, is_active)
  VALUES
    ('SAVE100', 0, NOW() + INTERVAL '365 days', TRUE, 0, 10000, TRUE),  -- 100 THB off
    ('SAVE10P', 0, NOW() + INTERVAL '365 days', FALSE, 1000, 0, TRUE),  -- 10% off
    ('MIN500100', 50000, NOW() + INTERVAL '365 days', TRUE, 0, 10000, TRUE), -- min 500 THB
    ('EXPIRED50', 0, NOW() - INTERVAL '1 day', TRUE, 0, 5000, TRUE)    -- expired
  ON CONFLICT (code) DO NOTHING;

  -- Orders
  INSERT INTO orders (id, user_id, original_total_satang, discount_percent_satang, discount_fixed_satang, grand_total_satang, applied_coupon_id)
  VALUES
    (order_50, demo_user, 5000, 0, 0, 5000, NULL),  -- 50 THB
    (order_600, demo_user, 60000, 0, 0, 60000, NULL) -- 600 THB
  ON CONFLICT (id) DO NOTHING;
END $$;
