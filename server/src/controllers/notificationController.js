import prisma from '../utils/prisma.js';

export const getNotifications = async (req, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  const unreadCount = await prisma.notification.count({
    where: { userId: req.user.id, isRead: false },
  });
  res.json({ success: true, notifications, unreadCount });
};

export const markRead = async (req, res) => {
  await prisma.notification.updateMany({
    where: { id: req.params.id, userId: req.user.id },
    data: { isRead: true },
  });
  res.json({ success: true });
};

export const markAllRead = async (req, res) => {
  await prisma.notification.updateMany({
    where: { userId: req.user.id },
    data: { isRead: true },
  });
  res.json({ success: true });
};
