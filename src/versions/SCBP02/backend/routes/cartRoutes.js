const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");

router.get("/", cartController.getCart);
router.post("/add", cartController.addItem);
router.put("/update", cartController.updateQuantity);
router.post("/save", cartController.saveForLater);

module.exports = router;
