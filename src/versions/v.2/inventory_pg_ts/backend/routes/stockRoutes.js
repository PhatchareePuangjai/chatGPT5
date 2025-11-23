import { Router } from 'express';
import {
  getAllStock,
  getLowStock,
  getStockHistory,
  purchaseItem,
} from '../controllers/stockController.js';

const router = Router();

router.get('/', getAllStock);
router.get('/low', getLowStock);
router.get('/history', getStockHistory);
router.post('/purchase', purchaseItem);

export default router;
