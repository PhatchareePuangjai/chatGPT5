
const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");

router.get("/", inventoryController.getAllProducts);
router.post("/purchase", inventoryController.purchaseItem);
router.get("/low-stock", inventoryController.getLowStockItems);
router.get("/history", inventoryController.getStockHistory);

module.exports = router;
