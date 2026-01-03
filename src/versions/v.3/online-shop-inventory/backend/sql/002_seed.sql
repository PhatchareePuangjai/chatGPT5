INSERT INTO products (sku, name, price_cents, stock)
VALUES
  ('SKU-TSHIRT', 'T-Shirt', 39900, 10),
  ('SKU-MUG',    'Coffee Mug', 25000, 4),
  ('SKU-HAT',    'Cap / Hat', 19900, 7)
ON CONFLICT (sku) DO NOTHING;
