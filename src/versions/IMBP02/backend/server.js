
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const LOW_STOCK_THRESHOLD = 5;

let inventory = [
  { id: 1, name: "Laptop", stock: 10 },
  { id: 2, name: "Mouse", stock: 3 },
  { id: 3, name: "Keyboard", stock: 7 }
];

let stockHistory = [];

app.get("/api/inventory", (req, res) => {
  res.json(inventory);
});

app.get("/api/inventory/low-stock", (req, res) => {
  const lowStockItems = inventory.filter(
    item => item.stock < LOW_STOCK_THRESHOLD
  );
  res.json(lowStockItems);
});

app.post("/api/inventory/purchase/:id", (req, res) => {
  const itemId = parseInt(req.params.id);
  const { quantity } = req.body;

  const item = inventory.find(i => i.id === itemId);

  if (!item) {
    return res.status(404).json({ message: "Item not found" });
  }

  if (item.stock < quantity) {
    return res.status(400).json({ message: "Not enough stock" });
  }

  item.stock -= quantity;

  stockHistory.push({
    itemId: item.id,
    name: item.name,
    change: -quantity,
    date: new Date()
  });

  if (item.stock < LOW_STOCK_THRESHOLD) {
    console.log(`LOW STOCK WARNING: ${item.name} has only ${item.stock} left`);
  }

  res.json({ message: "Purchase successful", item });
});

app.get("/api/inventory/history", (req, res) => {
  res.json(stockHistory);
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
