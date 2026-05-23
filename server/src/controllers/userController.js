import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma.js';
import { ApiError } from '../utils/apiError.js';

export const getUsers = async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, users });
};

export const updateUser = async (req, res) => {
  const data = { ...req.body };
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 12);
  }
  delete data.email;
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data,
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
      role: true,
      isActive: true,
    },
  });
  res.json({ success: true, user });
};

export const getActivityLogs = async (req, res) => {
  const logs = await prisma.activityLog.findMany({
    take: 100,
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { fullName: true, email: true } } },
  });
  res.json({ success: true, logs });
};
