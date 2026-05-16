
const { v4: uuidv4 } = require("uuid");

let products = [
  { id: "1", name: "Laptop", stock: 10 },
  { id: "2", name: "Phone", stock: 8 },
  { id: "3", name: "Headphones", stock: 4 }
];

let stockHistory = [];

exports.getAllProducts = (req, res) => {
  res.json(products);
};

exports.purchaseItem = (req, res) => {
  const { productId, quantity } = req.body;
  const product = products.find(p => p.id === productId);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  if (product.stock < quantity) {
    return res.status(400).json({ message: "Not enough stock available" });
  }

  const previousStock = product.stock;
  product.stock -= quantity;

  if (product.stock < 5) {
    console.log(`Low stock alert for ${product.name}. Current stock: ${product.stock}`);
  }

  stockHistory.push({
    id: uuidv4(),
    productId: product.id,
    productName: product.name,
    change: -quantity,
    previousStock,
    newStock: product.stock,
    timestamp: new Date()
  });

  res.json({ message: "Purchase successful", product });
};

exports.getLowStockItems = (req, res) => {
  const lowStockItems = products.filter(p => p.stock < 5);
  res.json(lowStockItems);
};

exports.getStockHistory = (req, res) => {
  res.json(stockHistory);
};
