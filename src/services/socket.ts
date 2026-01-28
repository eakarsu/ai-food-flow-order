import { io, Socket } from 'socket.io-client';
import { getAccessToken } from './api/config';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

let socket: Socket | null = null;

export const connectSocket = (): Socket => {
  if (socket?.connected) {
    return socket;
  }

  const token = getAccessToken();

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = (): Socket | null => socket;

// Subscribe to order updates
export const subscribeToOrder = (orderId: string) => {
  if (socket?.connected) {
    socket.emit('order:subscribe', orderId);
  }
};

// Unsubscribe from order updates
export const unsubscribeFromOrder = (orderId: string) => {
  if (socket?.connected) {
    socket.emit('order:unsubscribe', orderId);
  }
};

// Listen for order updates
export const onOrderUpdate = (callback: (data: any) => void) => {
  if (socket) {
    socket.on('order:update', callback);
    return () => socket?.off('order:update', callback);
  }
  return () => {};
};

// Listen for delivery updates
export const onDeliveryUpdate = (callback: (data: any) => void) => {
  if (socket) {
    socket.on('delivery:update', callback);
    return () => socket?.off('delivery:update', callback);
  }
  return () => {};
};

// Listen for notifications
export const onNotification = (callback: (data: any) => void) => {
  if (socket) {
    socket.on('notification', callback);
    return () => socket?.off('notification', callback);
  }
  return () => {};
};

export default {
  connect: connectSocket,
  disconnect: disconnectSocket,
  getSocket,
  subscribeToOrder,
  unsubscribeFromOrder,
  onOrderUpdate,
  onDeliveryUpdate,
  onNotification,
};
