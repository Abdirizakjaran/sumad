import QRCode from 'qrcode';
import prisma from '../utils/prisma.js';
import { ApiError } from '../utils/apiError.js';
import { logActivity } from '../utils/activityLogger.js';
import { getUploadPath } from '../middleware/upload.js';
import { normalizePlate } from '../services/plateRecognition.js';

export const createVehicle = async (req, res) => {
  const data = { ...req.body };
  data.plateNumber = normalizePlate(data.plateNumber);

  const exists = await prisma.vehicle.findFirst({
    where: { plateNumber: { equals: data.plateNumber, mode: 'insensitive' } },
  });
  if (exists) throw new ApiError(400, 'Plate number already registered');

  if (req.files?.vehicleImage?.[0]) {
    data.vehicleImage = getUploadPath(req.files.vehicleImage[0].filename);
  }
  if (req.files?.driverImage?.[0]) {
    data.driverImage = getUploadPath(req.files.driverImage[0].filename);
  }

  const vehicle = await prisma.vehicle.create({ data });
  const qrCode = await QRCode.toDataURL(
    JSON.stringify({ id: vehicle.id, plate: vehicle.plateNumber, system: 'SUMAD TRAFFIC MGT' })
  );
  const updated = await prisma.vehicle.update({
    where: { id: vehicle.id },
    data: { qrCode },
  });

  await logActivity({
    userId: req.user.id,
    action: 'CREATE_VEHICLE',
    entity: 'Vehicle',
    entityId: vehicle.id,
    ipAddress: req.ip,
  });

  res.status(201).json({ success: true, vehicle: updated });
};

export const getVehicles = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const { search, type, status } = req.query;

  const where = {};
  if (search) {
    where.OR = [
      { ownerFullName: { contains: search, mode: 'insensitive' } },
      { plateNumber: { contains: search, mode: 'insensitive' } },
      { nationalId: { contains: search, mode: 'insensitive' } },
      { phoneNumber: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (type) where.vehicleType = type;
  if (status) where.status = status;

  const [vehicles, total] = await Promise.all([
    prisma.vehicle.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { fines: true } } },
    }),
    prisma.vehicle.count({ where }),
  ]);

  res.json({
    success: true,
    vehicles,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
};

export const getVehicle = async (req, res) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: req.params.id },
    include: {
      fines: {
        include: { payment: true, createdBy: { select: { fullName: true } } },
        orderBy: { createdAt: 'desc' },
      },
      detections: { take: 10, orderBy: { createdAt: 'desc' } },
    },
  });
  if (!vehicle) throw new ApiError(404, 'Vehicle not found');
  res.json({ success: true, vehicle });
};

export const updateVehicle = async (req, res) => {
  const data = { ...req.body };
  if (data.plateNumber) data.plateNumber = normalizePlate(data.plateNumber);
  if (req.files?.vehicleImage?.[0]) {
    data.vehicleImage = getUploadPath(req.files.vehicleImage[0].filename);
  }
  if (req.files?.driverImage?.[0]) {
    data.driverImage = getUploadPath(req.files.driverImage[0].filename);
  }

  const vehicle = await prisma.vehicle.update({
    where: { id: req.params.id },
    data,
  });

  await logActivity({
    userId: req.user.id,
    action: 'UPDATE_VEHICLE',
    entity: 'Vehicle',
    entityId: vehicle.id,
    ipAddress: req.ip,
  });

  res.json({ success: true, vehicle });
};

export const deleteVehicle = async (req, res) => {
  await prisma.vehicle.delete({ where: { id: req.params.id } });
  await logActivity({
    userId: req.user.id,
    action: 'DELETE_VEHICLE',
    entity: 'Vehicle',
    entityId: req.params.id,
    ipAddress: req.ip,
  });
  res.json({ success: true, message: 'Vehicle deleted' });
};
