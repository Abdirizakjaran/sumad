import prisma from './prisma.js';

export async function createNotification({ userId, title, message, type = 'info' }) {
  return prisma.notification.create({
    data: { userId, title, message, type },
  });
}

export async function notifyRole(role, title, message, type = 'info') {
  const users = await prisma.user.findMany({
    where: { role, isActive: true },
    select: { id: true },
  });
  await Promise.all(
    users.map((u) => createNotification({ userId: u.id, title, message, type }))
  );
}
