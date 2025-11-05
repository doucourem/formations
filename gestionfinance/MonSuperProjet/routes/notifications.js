import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getNotifications, addNotification } from '../controllers/notificationController.js';

const router = express.Router();
router.get('/', protect, getNotifications);
router.post('/', protect, addNotification);

export default router;
