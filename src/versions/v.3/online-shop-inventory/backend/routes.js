const express = require("express");
const {
  listProducts,
  listLowStock,
  purchase,
  restock,
  history
} = require("./inventoryController");

const router = express.Router();

router.get("/products", listProducts);
router.get("/low-stock", listLowStock);
router.post("/purchase", purchase);
router.post("/restock", restock);
router.get("/history/:productId", history);

module.exports = router;
