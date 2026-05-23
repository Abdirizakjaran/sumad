import prisma from '../utils/prisma.js';
import { normalizePlate } from './plateRecognition.js';

export async function checkVehicleByPlate(plateNumber) {
  const plate = normalizePlate(plateNumber);
  const vehicle = await prisma.vehicle.findFirst({
    where: {
      plateNumber: { equals: plate, mode: 'insensitive' },
    },
    include: {
      fines: {
        include: { payment: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!vehicle) {
    return {
      result: 'NOT_FOUND',
      plateNumber: plate,
      message: 'Vehicle not registered',
    };
  }

  const pendingFines = vehicle.fines.filter((f) => f.status !== 'APPROVED');
  const unpaidFines = pendingFines.filter((f) => f.status === 'PENDING');
  const totalUnpaid = unpaidFines.reduce((sum, f) => sum + f.amount, 0);

  const allCleared =
    vehicle.status === 'CLEARED' ||
    (vehicle.fines.length > 0 && pendingFines.length === 0);

  const latestPayment = await prisma.payment.findFirst({
    where: { fine: { vehicleId: vehicle.id } },
    orderBy: { approvedAt: 'desc' },
  });

  if (allCleared && unpaidFines.length === 0) {
    return {
      result: 'APPROVED',
      plateNumber: vehicle.plateNumber,
      ownerName: vehicle.ownerFullName,
      vehicleId: vehicle.id,
      status: vehicle.status,
      paymentDate: latestPayment?.approvedAt || null,
      message: 'Vehicle cleared - APPROVED',
    };
  }

  return {
    result: 'UNPAID',
    plateNumber: vehicle.plateNumber,
    ownerName: vehicle.ownerFullName,
    vehicleId: vehicle.id,
    fineAmount: totalUnpaid,
    unpaidCount: unpaidFines.length,
    fines: unpaidFines.map((f) => ({
      id: f.id,
      amount: f.amount,
      violationType: f.violationType,
      dueDate: f.dueDate,
    })),
    message: 'UNPAID WARNING - Outstanding fines',
  };
}
