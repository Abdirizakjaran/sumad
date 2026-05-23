import { Router } from 'express';
import * as report from '../controllers/reportController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(authenticate);

router.get('/revenue', authorize('SUPER_ADMIN', 'TRAFFIC_ADMIN', 'FINANCE_OFFICER'), asyncHandler(report.generateRevenueReport));
router.get('/fines', authorize('SUPER_ADMIN', 'TRAFFIC_ADMIN', 'FINANCE_OFFICER'), asyncHandler(report.generateFinesReport));
router.get('/vehicles', authorize('SUPER_ADMIN', 'TRAFFIC_ADMIN'), asyncHandler(report.generateVehiclesReport));

export default router;
