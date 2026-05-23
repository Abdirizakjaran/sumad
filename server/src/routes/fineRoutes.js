import { Router } from 'express';
import * as fine from '../controllers/fineController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize('SUPER_ADMIN', 'TRAFFIC_ADMIN', 'TRAFFIC_OFFICER'),
  upload.single('evidenceImage'),
  asyncHandler(fine.createFine)
);
router.get('/', asyncHandler(fine.getFines));
router.put('/:id', authorize('SUPER_ADMIN', 'TRAFFIC_ADMIN'), asyncHandler(fine.updateFine));
router.put(
  '/:id/pay',
  authorize('SUPER_ADMIN', 'FINANCE_OFFICER'),
  asyncHandler(fine.payFine)
);

export default router;
