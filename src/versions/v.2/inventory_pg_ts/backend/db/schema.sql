-- Run this in your PostgreSQL database (inventory_db)

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    stock INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS stock_history (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    change INT NOT NULL,
    old_stock INT NOT NULL,
    new_stock INT NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO products (name, stock) VALUES
    ('Laptop', 12),
    ('Headphones', 4),
    ('Keyboard', 8),
    ('Mouse', 2)
ON CONFLICT DO NOTHING;
