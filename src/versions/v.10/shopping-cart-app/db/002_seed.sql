TRUNCATE cart_items, carts, products RESTART IDENTITY CASCADE;

INSERT INTO products (sku, name, price_cents, stock) VALUES
  ('SKU-001', 'Product A', 10000, 10),
  ('SKU-002', 'Product B', 2000, 5),
  ('SKU-003', 'Product C', 3000, 5),
  ('SKU-004', 'Product D', 4000, 1),
  ('SKU-005', 'Product E', 5000, 5),
  ('SKU-006', 'Product F', 1999, 100);
