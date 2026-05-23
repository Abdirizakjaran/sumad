import prisma from '../utils/prisma.js';
import { checkVehicleByPlate } from '../services/vehicleCheck.js';
import { recognizePlateFromImage, normalizePlate } from '../services/plateRecognition.js';
import { logActivity } from '../utils/activityLogger.js';
import { getUploadPath } from '../middleware/upload.js';

export const detectPlate = async (req, res) => {
  let plateNumber = req.body.plateNumber;

  if (req.file && !plateNumber) {
    plateNumber = await recognizePlateFromImage(req.file.path);
    if (!plateNumber) {
      return res.status(400).json({
        success: false,
        message: 'Could not recognize plate. Enter manually.',
      });
    }
  }

  if (!plateNumber) {
    return res.status(400).json({ success: false, message: 'Plate number required' });
  }

  plateNumber = normalizePlate(plateNumber);
  const check = await checkVehicleByPlate(plateNumber);

  let snapshot;
  if (req.file) snapshot = getUploadPath(req.file.filename);

  const detection = await prisma.cameraDetection.create({
    data: {
      plateNumber,
      result: check.result,
      vehicleId: check.vehicleId || null,
      snapshot,
      metadata: check,
      operatorId: req.user?.id,
    },
    include: { vehicle: true },
  });

  await logActivity({
    userId: req.user?.id,
    action: 'CAMERA_DETECTION',
    entity: 'CameraDetection',
    entityId: detection.id,
    details: { plateNumber, result: check.result },
    ipAddress: req.ip,
  });

  const io = req.app.get('io');
  io?.emit('detection:new', { detection, check });
  io?.emit('dashboard:update');

  res.json({
    success: true,
    detection,
    check,
  });
};

export const getDetectionHistory = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const [detections, total] = await Promise.all([
    prisma.cameraDetection.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        vehicle: { select: { plateNumber: true, ownerFullName: true } },
        operator: { select: { fullName: true } },
      },
    }),
    prisma.cameraDetection.count(),
  ]);

  res.json({
    success: true,
    detections,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
};
