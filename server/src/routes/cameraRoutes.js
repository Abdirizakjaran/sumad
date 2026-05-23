import { Router } from 'express';
import * as camera from '../controllers/cameraController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.post(
  '/detect',
  authenticate,
  authorize('SUPER_ADMIN', 'CAMERA_OPERATOR', 'TRAFFIC_ADMIN'),
  upload.single('snapshot'),
  asyncHandler(camera.detectPlate)
);
router.get(
  '/history',
  authenticate,
  asyncHandler(camera.getDetectionHistory)
);

export default router;
