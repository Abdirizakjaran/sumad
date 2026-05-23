import { Router } from 'express';
import * as user from '../controllers/userController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(authenticate);
router.use(authorize('SUPER_ADMIN', 'TRAFFIC_ADMIN'));

router.get('/', asyncHandler(user.getUsers));
router.put('/:id', asyncHandler(user.updateUser));
router.get('/activity-logs', asyncHandler(user.getActivityLogs));

export default router;
