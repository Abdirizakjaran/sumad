import { Router } from 'express';
import * as vehicle from '../controllers/vehicleController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize('SUPER_ADMIN', 'TRAFFIC_ADMIN', 'TRAFFIC_OFFICER'),
  upload.fields([{ name: 'vehicleImage', maxCount: 1 }, { name: 'driverImage', maxCount: 1 }]),
  asyncHandler(vehicle.createVehicle)
);
router.get('/', asyncHandler(vehicle.getVehicles));
router.get('/:id', asyncHandler(vehicle.getVehicle));
router.put(
  '/:id',
  authorize('SUPER_ADMIN', 'TRAFFIC_ADMIN', 'TRAFFIC_OFFICER'),
  upload.fields([{ name: 'vehicleImage', maxCount: 1 }, { name: 'driverImage', maxCount: 1 }]),
  asyncHandler(vehicle.updateVehicle)
);
router.delete('/:id', authorize('SUPER_ADMIN', 'TRAFFIC_ADMIN'), asyncHandler(vehicle.deleteVehicle));

export default router;
