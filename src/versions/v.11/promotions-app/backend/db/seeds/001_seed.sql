TRUNCATE TABLE promotion_events RESTART IDENTITY CASCADE;
TRUNCATE TABLE cart_discounts RESTART IDENTITY CASCADE;
TRUNCATE TABLE coupon_usages RESTART IDENTITY CASCADE;
TRUNCATE TABLE carts RESTART IDENTITY CASCADE;
TRUNCATE TABLE coupons RESTART IDENTITY CASCADE;

INSERT INTO coupons (
    code, type, value_cents, value_percent, min_subtotal_cents, start_at, end_at, usage_limit_per_user, priority_override
) VALUES
    ('SAVE100', 'fixed', 10000, 0, 50000, NOW() - INTERVAL '30 days', NOW() + INTERVAL '365 days', 5, NULL),
    ('CART10', 'percent', 0, 10, 0, NOW() - INTERVAL '30 days', NOW() + INTERVAL '365 days', 5, NULL),
    ('EXPIRED', 'fixed', 5000, 0, 0, NOW() - INTERVAL '60 days', NOW() - INTERVAL '1 day', 5, NULL),
    ('WELCOME', 'fixed', 5000, 0, 0, NOW() - INTERVAL '30 days', NOW() + INTERVAL '365 days', 1, NULL);

INSERT INTO carts (user_id, subtotal_cents)
VALUES
    ('demo-user', 200000),
    ('tiny-user', 5000);

INSERT INTO coupon_usages (coupon_code, user_id, times_used)
VALUES
    ('WELCOME', 'demo-user', 1);
