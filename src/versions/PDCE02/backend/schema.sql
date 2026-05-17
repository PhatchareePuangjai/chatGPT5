CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type VARCHAR(20) CHECK (discount_type IN ('PERCENTAGE','FLAT')),
    discount_value NUMERIC(10,2) NOT NULL,
    expiration_date TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

INSERT INTO coupons (code, discount_type, discount_value, expiration_date)
VALUES 
('SAVE10', 'PERCENTAGE', 10, NOW() + INTERVAL '30 days'),
('FLAT50', 'FLAT', 50, NOW() + INTERVAL '30 days');
