import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding SUMAD TRAFFIC MGT database...');

  const password = await bcrypt.hash('Password123!', 12);

  const users = [
    { email: 'admin@sumad.gov', fullName: 'Super Admin', role: 'SUPER_ADMIN', phone: '+252611000001' },
    { email: 'traffic.admin@sumad.gov', fullName: 'Traffic Admin', role: 'TRAFFIC_ADMIN', phone: '+252611000002' },
    { email: 'officer@sumad.gov', fullName: 'Ahmed Officer', role: 'TRAFFIC_OFFICER', phone: '+252611000003' },
    { email: 'finance@sumad.gov', fullName: 'Fatima Finance', role: 'FINANCE_OFFICER', phone: '+252611000004' },
    { email: 'camera@sumad.gov', fullName: 'Hassan Camera Op', role: 'CAMERA_OPERATOR', phone: '+252611000005' },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, password },
    });
  }

  const officer = await prisma.user.findUnique({ where: { email: 'officer@sumad.gov' } });
  const finance = await prisma.user.findUnique({ where: { email: 'finance@sumad.gov' } });

  const vehiclesData = [
    {
      ownerFullName: 'Mohamed Ali Hassan',
      phoneNumber: '+252612345678',
      nationalId: 'SO-12345678',
      vehicleType: 'CAR',
      plateNumber: 'MOG1234',
      vehicleModel: 'Toyota Corolla',
      vehicleColor: 'White',
      status: 'CLEARED',
    },
    {
      ownerFullName: 'Amina Yusuf',
      phoneNumber: '+252698765432',
      nationalId: 'SO-87654321',
      vehicleType: 'MOTORCYCLE',
      plateNumber: 'MOG5678',
      vehicleModel: 'Honda CG125',
      vehicleColor: 'Red',
      status: 'BLOCKED',
    },
    {
      ownerFullName: 'Omar Abdi',
      phoneNumber: '+252611223344',
      nationalId: 'SO-11223344',
      vehicleType: 'TRUCK',
      plateNumber: 'MOG9012',
      vehicleModel: 'Isuzu NPR',
      vehicleColor: 'Blue',
      status: 'PENDING',
    },
    {
      ownerFullName: 'Khadija Mohamed',
      phoneNumber: '+252655443322',
      nationalId: 'SO-55667788',
      vehicleType: 'BUS',
      plateNumber: 'MOG3456',
      vehicleModel: 'Toyota Coaster',
      vehicleColor: 'Yellow',
      status: 'CLEARED',
    },
  ];

  const vehicles = [];
  for (const v of vehiclesData) {
    const vehicle = await prisma.vehicle.upsert({
      where: { plateNumber: v.plateNumber },
      update: {},
      create: v,
    });
    vehicles.push(vehicle);
  }

  const fine1 = await prisma.fine.create({
    data: {
      vehicleId: vehicles[1].id,
      violationType: 'NO_HELMET',
      description: 'Riding without helmet',
      amount: 50,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'PENDING',
      createdById: officer.id,
    },
  });

  const fine2 = await prisma.fine.create({
    data: {
      vehicleId: vehicles[2].id,
      violationType: 'OVER_SPEEDING',
      description: 'Exceeded speed limit by 30km/h',
      amount: 150,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: 'PENDING',
      createdById: officer.id,
    },
  });

  const clearedFine = await prisma.fine.create({
    data: {
      vehicleId: vehicles[0].id,
      violationType: 'WRONG_PARKING',
      description: 'Parked in no-parking zone',
      amount: 75,
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      status: 'APPROVED',
      createdById: officer.id,
    },
  });

  await prisma.payment.create({
    data: {
      fineId: clearedFine.id,
      amount: 75,
      method: 'EVC_PLUS',
      transactionId: 'EVC-TXN-001',
      receiptNumber: 'SUMAD-SEED-001',
      createdById: finance.id,
    },
  });

  await prisma.cameraDetection.createMany({
    data: [
      { plateNumber: 'MOG1234', result: 'APPROVED', vehicleId: vehicles[0].id, operatorId: finance.id },
      { plateNumber: 'MOG5678', result: 'UNPAID', vehicleId: vehicles[1].id, operatorId: finance.id },
      { plateNumber: 'MOG9999', result: 'NOT_FOUND' },
    ],
  });

  const admin = await prisma.user.findUnique({ where: { email: 'admin@sumad.gov' } });
  await prisma.notification.create({
    data: {
      userId: admin.id,
      title: 'System Initialized',
      message: 'SUMAD TRAFFIC MGT demo data loaded successfully',
      type: 'success',
    },
  });

  console.log('✅ Seed completed!');
  console.log('\nDemo accounts (password: Password123!):');
  users.forEach((u) => console.log(`  ${u.role}: ${u.email}`));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
