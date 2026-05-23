import { Router } from 'express';
import * as payment from '../controllers/paymentController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(authenticate);

router.get('/unpaid', authorize('SUPER_ADMIN', 'FINANCE_OFFICER', 'TRAFFIC_ADMIN'), asyncHandler(payment.getUnpaidFines));
router.post('/', authorize('SUPER_ADMIN', 'FINANCE_OFFICER'), asyncHandler(payment.createPayment));
router.get('/', asyncHandler(payment.getPayments));

export default router;
