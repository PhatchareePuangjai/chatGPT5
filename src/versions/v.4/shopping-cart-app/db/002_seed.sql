-- Reset demo data
-- Truncate in a single statement to satisfy FK constraints
TRUNCATE TABLE cart_items, carts, products RESTART IDENTITY CASCADE;

-- Demo products (prices are integer cents for accuracy)
INSERT INTO products (sku, name, price_cents, stock) VALUES
  ('TSHIRT-BLK', 'T-Shirt (Black)', 1999, 25),
  ('TSHIRT-WHT', 'T-Shirt (White)', 1999, 30),
  ('MUG-01',     'Coffee Mug',      1299, 12),
  ('CAP-RED',    'Cap (Red)',       1599, 8),
  ('BAG-01',     'Canvas Bag',      2499, 5);

-- Demo cart
INSERT INTO carts (id) VALUES (1) ON CONFLICT DO NOTHING;
