import jwt from 'jsonwebtoken';

export function initSocket(io) {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next();
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
      socket.join(`role:${socket.userRole}`);
    }
    socket.join('dashboard');

    socket.on('camera:scanning', (data) => {
      io.to('dashboard').emit('camera:activity', {
        ...data,
        operatorId: socket.userId,
        timestamp: new Date(),
      });
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
}
