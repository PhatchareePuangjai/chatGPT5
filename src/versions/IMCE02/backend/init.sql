
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  stock INTEGER NOT NULL CHECK (stock >= 0)
);

INSERT INTO products (name, stock)
VALUES ('Product A', 10),
       ('Product B', 3)
ON CONFLICT DO NOTHING;
