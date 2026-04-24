// Load environment variables FIRST - before any other imports
import './env.js';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import restaurantRoutes from './routes/restaurants.js';
import menuRoutes from './routes/menu.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/orders.js';
import paymentRoutes from './routes/payments.js';
import deliveryRoutes from './routes/delivery.js';
import notificationRoutes from './routes/notifications.js';
import twilioRoutes from './routes/twilio.js';
import automatedCallsRoutes from './routes/automatedCalls.js';
import inventoryRoutes from './routes/inventory.js';
import staffRoutes from './routes/staff.js';
import reviewRoutes from './routes/reviews.js';
import aiRoutes from './routes/ai.js';
import seedRoutes from './routes/seed.js';

// Import socket handler
import { setupSocketHandlers } from './services/socketService.js';

// Import rate limiters
import { apiLimiter, seedLimiter, aiLimiter } from './middleware/rateLimit.js';

const app = express();
const httpServer = createServer(app);

// Socket.io setup for real-time delivery tracking
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Make io available in routes
app.set('io', io);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/notifications', notificationRoutes);

// Twilio routes (with /api prefix)
app.use('/api', twilioRoutes);

// Automated calls routes
app.use('/api/automated-calls', automatedCallsRoutes);

// AI Feature routes (with rate limiting)
app.use('/api/inventory', apiLimiter, inventoryRoutes);
app.use('/api/staff', apiLimiter, staffRoutes);
app.use('/api/reviews', apiLimiter, reviewRoutes);
app.use('/api/ai', aiLimiter, aiRoutes);
app.use('/api/seed', seedLimiter, seedRoutes);

// Twilio routes (without /api prefix - for TwiML App callbacks)
app.use('/', twilioRoutes);

// Automated calls TwiML (without /api prefix for Twilio callbacks)
app.use('/api/automated-calls', automatedCallsRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);

  if (err.type === 'StripeSignatureVerificationError') {
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Setup socket handlers
setupSocketHandlers(io);

// Start server
const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export { app, io };
