import { Router } from 'express';
import {
  getAllStock,
  getLowStock,
  getStockHistory,
  getStockAlerts,
  deductStockController,
  restoreStockController,
  restockController,
} from '../controllers/stockController.js';

const router = Router();

// Read endpoints
router.get('/', getAllStock);
router.get('/low', getLowStock);
router.get('/history', getStockHistory);
router.get('/alerts', getStockAlerts);

// Order operations
router.post('/order/deduct', deductStockController);
router.post('/order/restore', restoreStockController);

// Manual restock
router.post('/restock', restockController);

export default router;
