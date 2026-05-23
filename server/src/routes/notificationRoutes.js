import { Router } from 'express';
import * as notification from '../controllers/notificationController.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(authenticate);

router.get('/', asyncHandler(notification.getNotifications));
router.put('/:id/read', asyncHandler(notification.markRead));
router.put('/read-all', asyncHandler(notification.markAllRead));

export default router;
