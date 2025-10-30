import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getBalanceHistory } from '../controllers/balanceController.js';

const router = express.Router();
router.get('/', protect, getBalanceHistory);

export default router;
