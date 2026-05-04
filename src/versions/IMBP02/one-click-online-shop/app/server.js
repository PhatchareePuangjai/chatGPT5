
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

const DB_PATH = process.env.DB_PATH || path.join(__dirname, "shop.db");
const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0
    )
  `);
});

app.get("/products", (req, res) => {
  db.all("SELECT * FROM products", [], (err, rows) => {
    res.json(rows);
  });
});

app.post("/products", (req, res) => {
  const { name, price, stock } = req.body;
  db.run(
    "INSERT INTO products (name, price, stock) VALUES (?, ?, ?)",
    [name, price, stock],
    function () {
      res.json({ id: this.lastID });
    }
  );
});

app.post("/buy/:id", (req, res) => {
  const id = req.params.id;
  const quantity = req.body.quantity;

  db.get("SELECT * FROM products WHERE id = ?", [id], (err, product) => {
    if (!product) return res.status(404).json({ error: "Not found" });
    if (product.stock < quantity)
      return res.status(400).json({ error: "Not enough stock" });

    const newStock = product.stock - quantity;
    db.run("UPDATE products SET stock = ? WHERE id = ?", [newStock, id]);

    if (newStock < 5) {
      console.log(`LOW STOCK: ${product.name} (${newStock} left)`);
    }

    res.json({ message: "OK" });
  });
});

if (require.main === module) {
  app.listen(3000, () => {
    console.log("Shop running at http://localhost:3000");
  });
}

module.exports = { app, db };
