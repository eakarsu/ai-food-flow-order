import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export const setupSocketHandlers = (io: Server) => {
  // Authentication middleware
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      // Allow unauthenticated connections for public data
      return next();
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'your-secret-key'
      ) as { userId: string };
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`Client connected: ${socket.id}, userId: ${socket.userId || 'anonymous'}`);

    // Join user's personal room for notifications
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    // Subscribe to order updates
    socket.on('order:subscribe', (orderId: string) => {
      if (socket.userId) {
        socket.join(`order:${orderId}`);
        console.log(`User ${socket.userId} subscribed to order ${orderId}`);
      }
    });

    // Unsubscribe from order updates
    socket.on('order:unsubscribe', (orderId: string) => {
      socket.leave(`order:${orderId}`);
      console.log(`User ${socket.userId} unsubscribed from order ${orderId}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

// Helper functions to emit events
export const emitOrderUpdate = (io: Server, orderId: string, data: any) => {
  io.to(`order:${orderId}`).emit('order:update', data);
};

export const emitDeliveryUpdate = (io: Server, orderId: string, data: any) => {
  io.to(`order:${orderId}`).emit('delivery:update', data);
};

export const emitUserNotification = (io: Server, userId: string, notification: any) => {
  io.to(`user:${userId}`).emit('notification', notification);
};
