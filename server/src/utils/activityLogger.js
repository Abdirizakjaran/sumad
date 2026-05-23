import prisma from './prisma.js';

export async function logActivity({ userId, action, entity, entityId, details, ipAddress }) {
  try {
    await prisma.activityLog.create({
      data: { userId, action, entity, entityId, details, ipAddress },
    });
  } catch (err) {
    console.error('Activity log failed:', err.message);
  }
}
