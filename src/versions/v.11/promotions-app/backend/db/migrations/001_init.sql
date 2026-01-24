CREATE TABLE IF NOT EXISTS coupons (
    code TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('fixed', 'percent')),
    value_cents INTEGER NOT NULL DEFAULT 0,
    value_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
    min_subtotal_cents INTEGER NOT NULL DEFAULT 0,
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    usage_limit_per_user INTEGER NOT NULL DEFAULT 1,
    priority_override INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS carts (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    subtotal_cents INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'THB',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cart_discounts (
    id SERIAL PRIMARY KEY,
    cart_id INTEGER NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    coupon_code TEXT NOT NULL REFERENCES coupons(code),
    amount_cents INTEGER NOT NULL,
    priority INTEGER NOT NULL,
    discount_type TEXT NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS cart_discount_unique ON cart_discounts(cart_id, coupon_code);

CREATE TABLE IF NOT EXISTS coupon_usages (
    id SERIAL PRIMARY KEY,
    coupon_code TEXT NOT NULL REFERENCES coupons(code) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    times_used INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (coupon_code, user_id)
);

CREATE TABLE IF NOT EXISTS promotion_events (
    id SERIAL PRIMARY KEY,
    coupon_code TEXT NOT NULL,
    user_id TEXT NOT NULL,
    status TEXT NOT NULL,
    reason TEXT NOT NULL,
    delta_cents INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
