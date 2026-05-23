import { Router } from 'express';
import * as auth from '../controllers/authController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.post('/login', asyncHandler(auth.login));
router.post('/forgot-password', asyncHandler(auth.forgotPassword));
router.post('/reset-password', asyncHandler(auth.resetPassword));
router.post('/register', authenticate, authorize('SUPER_ADMIN', 'TRAFFIC_ADMIN'), asyncHandler(auth.register));
router.get('/me', authenticate, asyncHandler(auth.me));
router.post('/logout', authenticate, asyncHandler(auth.logout));

export default router;
