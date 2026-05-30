CREATE TABLE IF NOT EXISTS stock_alerts (
  id bigserial PRIMARY KEY,
  product_id bigint NOT NULL REFERENCES products(id),
  threshold integer NOT NULL CHECK (threshold >= 0),
  observed_on_hand integer NOT NULL CHECK (observed_on_hand >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS stock_alerts_product_id_idx ON stock_alerts(product_id);
CREATE INDEX IF NOT EXISTS stock_alerts_created_at_idx ON stock_alerts(created_at);

