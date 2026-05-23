import prisma from '../utils/prisma.js';

export const getDashboardStats = async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalVehicles,
    totalFines,
    paidFines,
    unpaidFines,
    totalRevenue,
    todayDetections,
    recentPayments,
    dailyDetections,
    revenueByMonth,
    finesByViolation,
  ] = await Promise.all([
    prisma.vehicle.count(),
    prisma.fine.count(),
    prisma.fine.count({ where: { status: 'APPROVED' } }),
    prisma.fine.count({ where: { status: 'PENDING' } }),
    prisma.payment.aggregate({ _sum: { amount: true } }),
    prisma.cameraDetection.count({ where: { createdAt: { gte: today } } }),
    prisma.payment.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        fine: { include: { vehicle: { select: { plateNumber: true, ownerFullName: true } } } },
      },
    }),
    prisma.$queryRaw`
      SELECT DATE("createdAt") as date, COUNT(*)::int as count
      FROM "CameraDetection"
      WHERE "createdAt" >= NOW() - INTERVAL '7 days'
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `.catch(() => []),
    prisma.$queryRaw`
      SELECT TO_CHAR("approvedAt", 'YYYY-MM') as month, SUM(amount)::float as revenue
      FROM "Payment"
      WHERE "approvedAt" >= NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR("approvedAt", 'YYYY-MM')
      ORDER BY month ASC
    `.catch(() => []),
    prisma.fine.groupBy({
      by: ['violationType'],
      _count: { id: true },
    }),
  ]);

  const recentDetections = await prisma.cameraDetection.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: { vehicle: { select: { plateNumber: true } } },
  });

  res.json({
    success: true,
    stats: {
      totalVehicles,
      totalFines,
      paidFines,
      unpaidFines,
      totalRevenue: totalRevenue._sum.amount || 0,
      todayDetections,
    },
    recentPayments,
    recentDetections,
    charts: {
      dailyDetections,
      revenueByMonth,
      finesByViolation: finesByViolation.map((f) => ({
        name: f.violationType,
        value: f._count.id,
      })),
    },
  });
};
