import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  tenantId?: string;
  role?: string;
}

type SocketClaims = { userId: string; tenantId: string; role: string; subjects: string[] };

function socketSecret() {
  const secret = process.env.JWT_SECRET || '';
  if (secret.length < 32) throw new Error('JWT_SECRET must contain at least 32 characters');
  return secret;
}

function validClaims(value: Partial<SocketClaims>): value is SocketClaims {
  return typeof value.userId === 'string' && typeof value.tenantId === 'string'
    && typeof value.role === 'string' && Array.isArray(value.subjects);
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
      const decoded = jwt.verify(token, socketSecret(), { algorithms: ['HS256'] }) as Partial<SocketClaims>;
      if (!validClaims(decoded)) return next(new Error('Authentication claims are incomplete'));
      socket.userId = decoded.userId;
      socket.tenantId = decoded.tenantId;
      socket.role = decoded.role;
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
    socket.on('order:subscribe', async (orderId: string) => {
      if (!socket.userId || !socket.tenantId || !/^[0-9a-f-]{36}$/i.test(orderId)) return;
      const result = await query(
        `SELECT 1 FROM governed_orders WHERE tenant_id=$1 AND id=$2
         AND ($3 IN ('operator','admin') OR customer_actor_id=$4
           OR ($3='merchant' AND merchant_id=$4))`,
        [socket.tenantId, orderId, socket.role, socket.userId]
      );
      if (result.rowCount) {
        socket.join(`tenant:${socket.tenantId}:order:${orderId}`);
        console.log(`User ${socket.userId} subscribed to an authorized order`);
      }
    });

    // Unsubscribe from order updates
    socket.on('order:unsubscribe', (orderId: string) => {
      if (socket.tenantId) socket.leave(`tenant:${socket.tenantId}:order:${orderId}`);
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
export const emitOrderUpdate = (io: Server, tenantId: string, orderId: string, data: any) => {
  io.to(`tenant:${tenantId}:order:${orderId}`).emit('order:update', data);
};

export const emitDeliveryUpdate = (io: Server, tenantId: string, orderId: string, data: any) => {
  io.to(`tenant:${tenantId}:order:${orderId}`).emit('delivery:update', data);
};

export const emitUserNotification = (io: Server, userId: string, notification: any) => {
  io.to(`user:${userId}`).emit('notification', notification);
};
