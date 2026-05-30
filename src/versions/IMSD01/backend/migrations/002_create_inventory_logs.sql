CREATE TABLE IF NOT EXISTS inventory_logs (
  id bigserial PRIMARY KEY,
  product_id bigint NOT NULL REFERENCES products(id),
  type text NOT NULL,
  delta integer NOT NULL CHECK (delta <> 0),
  order_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS inventory_logs_product_id_idx ON inventory_logs(product_id);
CREATE INDEX IF NOT EXISTS inventory_logs_created_at_idx ON inventory_logs(created_at);

