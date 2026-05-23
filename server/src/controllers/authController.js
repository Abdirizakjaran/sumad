import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../utils/prisma.js';
import { ApiError } from '../utils/apiError.js';
import { logActivity } from '../utils/activityLogger.js';

const signToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new ApiError(401, 'Invalid email or password');
  }
  if (!user.isActive) throw new ApiError(403, 'Account is deactivated');

  const token = signToken(user);
  await logActivity({
    userId: user.id,
    action: 'LOGIN',
    entity: 'User',
    entityId: user.id,
    ipAddress: req.ip,
  });

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      phone: user.phone,
    },
  });
};

export const register = async (req, res) => {
  const { email, password, fullName, phone, role } = req.body;
  const exists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (exists) throw new ApiError(400, 'Email already registered');

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      password: hashed,
      fullName,
      phone,
      role: role || 'TRAFFIC_OFFICER',
    },
    select: { id: true, email: true, fullName: true, role: true, phone: true },
  });

  await logActivity({
    userId: req.user?.id,
    action: 'REGISTER_USER',
    entity: 'User',
    entityId: user.id,
    ipAddress: req.ip,
  });

  res.status(201).json({ success: true, user });
};

export const me = async (req, res) => {
  res.json({ success: true, user: req.user });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) {
    return res.json({ success: true, message: 'If email exists, reset link sent' });
  }
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetExpires = new Date(Date.now() + 3600000);
  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken, resetExpires },
  });
  res.json({
    success: true,
    message: 'Password reset token generated',
    resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined,
  });
};

export const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  const user = await prisma.user.findFirst({
    where: { resetToken: token, resetExpires: { gt: new Date() } },
  });
  if (!user) throw new ApiError(400, 'Invalid or expired reset token');

  const hashed = await bcrypt.hash(password, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed, resetToken: null, resetExpires: null },
  });

  res.json({ success: true, message: 'Password reset successful' });
};

export const logout = async (req, res) => {
  await logActivity({
    userId: req.user.id,
    action: 'LOGOUT',
    entity: 'User',
    entityId: req.user.id,
    ipAddress: req.ip,
  });
  res.json({ success: true, message: 'Logged out' });
};
