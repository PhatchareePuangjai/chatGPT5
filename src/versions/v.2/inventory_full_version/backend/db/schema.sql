-- Run this in your PostgreSQL database (inventory_db)

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    stock INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS stock_history (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    change INT NOT NULL,         -- +10, -3, etc.
    old_stock INT NOT NULL,
    new_stock INT NOT NULL,
    reason TEXT NOT NULL,        -- e.g. 'SALE', 'RESTOCK/RETURN', 'MANUAL_ADJUST'
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stock_alerts (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    current_stock INT NOT NULL,
    threshold INT NOT NULL,
    type TEXT NOT NULL,          -- e.g. 'LOW_STOCK'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO products (name, stock) VALUES
    ('Laptop', 12),
    ('Headphones', 4),
    ('Keyboard', 8),
    ('Mouse', 2)
ON CONFLICT DO NOTHING;
