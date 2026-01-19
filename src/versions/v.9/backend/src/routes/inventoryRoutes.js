const express = require('express');
const inventoryController = require('../controllers/inventoryController');

const router = express.Router();

router.get('/', inventoryController.searchInventory);
router.get('/:sku', inventoryController.getInventory);
router.post('/:sku/deduct', inventoryController.deductStock);
router.post('/:sku/restore', inventoryController.restoreStock);
router.get('/:sku/alerts', inventoryController.getAlerts);

module.exports = router;
