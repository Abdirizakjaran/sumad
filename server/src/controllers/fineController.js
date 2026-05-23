import prisma from '../utils/prisma.js';
import { ApiError } from '../utils/apiError.js';
import { logActivity } from '../utils/activityLogger.js';
import { getUploadPath } from '../middleware/upload.js';
import { notifyRole } from '../utils/notify.js';

export const createFine = async (req, res) => {
  const { vehicleId, violationType, description, amount, dueDate } = req.body;
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) throw new ApiError(404, 'Vehicle not found');

  let evidenceImage;
  if (req.file) evidenceImage = getUploadPath(req.file.filename);

  const fine = await prisma.fine.create({
    data: {
      vehicleId,
      violationType,
      description,
      amount: parseFloat(amount),
      dueDate: new Date(dueDate),
      evidenceImage,
      createdById: req.user.id,
    },
    include: {
      vehicle: { select: { plateNumber: true, ownerFullName: true } },
      createdBy: { select: { fullName: true } },
    },
  });

  await prisma.vehicle.update({
    where: { id: vehicleId },
    data: { status: 'BLOCKED' },
  });

  await notifyRole(
    'FINANCE_OFFICER',
    'New Traffic Fine',
    `Fine ${fine.amount} for plate ${vehicle.plateNumber}`,
    'warning'
  );

  await logActivity({
    userId: req.user.id,
    action: 'CREATE_FINE',
    entity: 'Fine',
    entityId: fine.id,
    ipAddress: req.ip,
  });

  const io = req.app.get('io');
  io?.emit('fine:created', fine);
  io?.emit('dashboard:update');

  res.status(201).json({ success: true, fine });
};

export const getFines = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const { status, search, vehicleId } = req.query;

  const where = {};
  if (status) where.status = status;
  if (vehicleId) where.vehicleId = vehicleId;
  if (search) {
    where.vehicle = {
      OR: [
        { plateNumber: { contains: search, mode: 'insensitive' } },
        { ownerFullName: { contains: search, mode: 'insensitive' } },
      ],
    };
  }

  const [fines, total] = await Promise.all([
    prisma.fine.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        vehicle: { select: { plateNumber: true, ownerFullName: true, vehicleType: true } },
        payment: true,
        createdBy: { select: { fullName: true } },
      },
    }),
    prisma.fine.count({ where }),
  ]);

  res.json({
    success: true,
    fines,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
};

export const updateFine = async (req, res) => {
  const fine = await prisma.fine.update({
    where: { id: req.params.id },
    data: req.body,
    include: { vehicle: true },
  });
  res.json({ success: true, fine });
};

export const payFine = async (req, res) => {
  const fine = await prisma.fine.findUnique({
    where: { id: req.params.id },
    include: { payment: true },
  });
  if (!fine) throw new ApiError(404, 'Fine not found');
  if (fine.payment) throw new ApiError(400, 'Fine already has payment');

  const { method, transactionId } = req.body;
  const receiptNumber = `SUMAD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const payment = await prisma.payment.create({
    data: {
      fineId: fine.id,
      amount: fine.amount,
      method,
      transactionId,
      receiptNumber,
      createdById: req.user.id,
    },
  });

  await prisma.fine.update({
    where: { id: fine.id },
    data: { status: 'PAID' },
  });

  res.json({ success: true, payment, message: 'Payment recorded - pending approval' });
};
