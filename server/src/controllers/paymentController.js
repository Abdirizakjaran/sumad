import prisma from '../utils/prisma.js';
import { ApiError } from '../utils/apiError.js';
import { logActivity } from '../utils/activityLogger.js';
import { createNotification } from '../utils/notify.js';

const generateReceipt = (payment) => ({
  receiptNumber: payment.receiptNumber,
  amount: payment.amount,
  method: payment.method,
  date: payment.approvedAt,
  fine: payment.fine,
});

export const createPayment = async (req, res) => {
  const { fineId, method, transactionId, amount } = req.body;

  const fine = await prisma.fine.findUnique({
    where: { id: fineId },
    include: { payment: true, vehicle: true },
  });
  if (!fine) throw new ApiError(404, 'Fine not found');
  if (fine.payment) throw new ApiError(400, 'Fine already paid');

  const receiptNumber = `SUMAD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const payAmount = amount || fine.amount;

  const payment = await prisma.payment.create({
    data: {
      fineId,
      amount: payAmount,
      method,
      transactionId,
      receiptNumber,
      createdById: req.user.id,
    },
    include: {
      fine: { include: { vehicle: true } },
      createdBy: { select: { fullName: true } },
    },
  });

  await prisma.fine.update({
    where: { id: fineId },
    data: { status: 'APPROVED' },
  });

  const pendingFines = await prisma.fine.count({
    where: { vehicleId: fine.vehicleId, status: { not: 'APPROVED' } },
  });

  if (pendingFines === 0) {
    await prisma.vehicle.update({
      where: { id: fine.vehicleId },
      data: { status: 'CLEARED' },
    });
  }

  await logActivity({
    userId: req.user.id,
    action: 'APPROVE_PAYMENT',
    entity: 'Payment',
    entityId: payment.id,
    details: { receiptNumber },
    ipAddress: req.ip,
  });

  const io = req.app.get('io');
  io?.emit('payment:approved', payment);
  io?.emit('dashboard:update');

  res.status(201).json({
    success: true,
    payment,
    receipt: generateReceipt({ ...payment, fine: payment.fine }),
  });
};

export const getPayments = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        fine: {
          include: {
            vehicle: { select: { plateNumber: true, ownerFullName: true } },
          },
        },
        createdBy: { select: { fullName: true } },
      },
    }),
    prisma.payment.count(),
  ]);

  res.json({
    success: true,
    payments,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
};

export const getUnpaidFines = async (req, res) => {
  const fines = await prisma.fine.findMany({
    where: { status: 'PENDING' },
    include: {
      vehicle: { select: { plateNumber: true, ownerFullName: true, phoneNumber: true } },
      createdBy: { select: { fullName: true } },
    },
    orderBy: { dueDate: 'asc' },
  });
  res.json({ success: true, fines });
};
