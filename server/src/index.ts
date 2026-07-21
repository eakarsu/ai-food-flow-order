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
import voiceOrderRoutes from './routes/voiceOrder.js';
import groupOrderRoutes from './routes/groupOrder.js';
import affiliateRoutes from './routes/affiliate.js';
import sustainabilityRoutes from './routes/sustainability.js';
import couponRoutes from './routes/coupons.js';
import governedOrderRoutes from './routes/governedOrders.js';
import { handleWebhook as handleStripeWebhook } from './controllers/paymentController.js';

// Import socket handler
import { setupSocketHandlers } from './services/socketService.js';

// Import rate limiters
import { apiLimiter, authLimiter, seedLimiter, aiLimiter } from './middleware/rateLimit.js';

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
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
}));
app.use(cors({
  origin: process.env.CLIENT_URL || process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes (all with general rate limiting)
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', apiLimiter, userRoutes);
app.use('/api/restaurants', apiLimiter, restaurantRoutes);
app.use('/api/menu', apiLimiter, menuRoutes);
app.use('/api/cart', apiLimiter, cartRoutes);
app.use('/api/orders', apiLimiter, orderRoutes);
app.use('/api/payments', apiLimiter, paymentRoutes);
app.use('/api/delivery', apiLimiter, deliveryRoutes);
app.use('/api/notifications', apiLimiter, notificationRoutes);

// Twilio routes (with /api prefix)
app.use('/api', twilioRoutes);

// Automated calls routes
app.use('/api/automated-calls', automatedCallsRoutes);

// AI Feature routes (with rate limiting)
app.use('/api/inventory', apiLimiter, inventoryRoutes);
app.use('/api/staff', apiLimiter, staffRoutes);
app.use('/api/reviews', apiLimiter, reviewRoutes);
app.use('/api/ai', aiLimiter, aiRoutes);
if (process.env.ENABLE_SEED_ROUTES === 'true' && process.env.NODE_ENV !== 'production') {
  app.use('/api/seed', seedLimiter, seedRoutes);
}

// New feature routes
app.use('/api/voice-order', apiLimiter, voiceOrderRoutes);
app.use('/api/group-order', apiLimiter, groupOrderRoutes);
app.use('/api/affiliate', apiLimiter, affiliateRoutes);
app.use('/api/sustainability', apiLimiter, sustainabilityRoutes);
app.use('/api/coupons', apiLimiter, couponRoutes);
app.use('/api/governed-orders', apiLimiter, governedOrderRoutes);

// Twilio routes (without /api prefix - for TwiML App callbacks)
app.use('/', twilioRoutes);

// Automated calls TwiML (without /api prefix for Twilio callbacks)
app.use('/api/automated-calls', automatedCallsRoutes);

// === Pass 7 mounts (moved here from end-of-file to sit BEFORE the 404 handler) ===
import multimodalIntakeRoutes from './routes/multimodalIntake';
import kdsStreamRoutes from './routes/kdsStream';
import driverIncentiveRoutes from './routes/driverIncentive';
import supplyWarningsRoutes from './routes/supplyWarnings';
import feedbackNlpRoutes from './routes/feedbackNlp';
import gapAiDemandForecastingRestaurantTimeRouter from './routes/gap_ai_demand_forecasting_restaurant_time';
import gapAiDriverRouteOptimizationTspRouter from './routes/gap_ai_driver_route_optimization_tsp';
import gapAiMenuRecommendationEngineColdRouter from './routes/gap_ai_menu_recommendation_engine_cold';
import gapAiFraudDetectionPaymentAnomaliesRouter from './routes/gap_ai_fraud_detection_payment_anomalies';
import gapAiChurnPredictionRouter from './routes/gap_ai_churn_prediction';
import gapAiDynamicPricingEngineRouter from './routes/gap_ai_dynamic_pricing_engine';
import gapLoyaltyPointsTieredRewardsProgramRouter from './routes/gap_loyalty_points_tiered_rewards_program';
import gapLimitedAffiliateCommissionPayoutAutomationRouter from './routes/gap_limited_affiliate_commission_payout_automation';
import gapRestaurantHealthScoreFoodSafetyRouter from './routes/gap_restaurant_health_score_food_safety';
import gapDynamicSurgePricingDuringPeakRouter from './routes/gap_dynamic_surge_pricing_during_peak';
import gapKdsKitchenDisplayIntegrationRouter from './routes/gap_kds_kitchen_display_integration';
import gapOutboundWebhooksPartnersRouter from './routes/gap_outbound_webhooks_partners';
if (process.env.ENABLE_GENERATED_FEATURES === 'true' && process.env.NODE_ENV !== 'production') {
  app.use('/api/multimodal-intake', multimodalIntakeRoutes);
  app.use('/api/kds-stream', kdsStreamRoutes);
  app.use('/api/driver-incentive', driverIncentiveRoutes);
  app.use('/api/supply-warnings', supplyWarningsRoutes);
  app.use('/api/feedback-nlp', feedbackNlpRoutes);
  app.use('/api/gap-ai-demand-forecasting-restaurant-time', gapAiDemandForecastingRestaurantTimeRouter);
  app.use('/api/gap-ai-driver-route-optimization-tsp', gapAiDriverRouteOptimizationTspRouter);
  app.use('/api/gap-ai-menu-recommendation-engine-cold', gapAiMenuRecommendationEngineColdRouter);
  app.use('/api/gap-ai-fraud-detection-payment-anomalies', gapAiFraudDetectionPaymentAnomaliesRouter);
  app.use('/api/gap-ai-churn-prediction', gapAiChurnPredictionRouter);
  app.use('/api/gap-ai-dynamic-pricing-engine', gapAiDynamicPricingEngineRouter);
  app.use('/api/gap-loyalty-points-tiered-rewards-program', gapLoyaltyPointsTieredRewardsProgramRouter);
  app.use('/api/gap-limited-affiliate-commission-payout-automation', gapLimitedAffiliateCommissionPayoutAutomationRouter);
  app.use('/api/gap-restaurant-health-score-food-safety', gapRestaurantHealthScoreFoodSafetyRouter);
  app.use('/api/gap-dynamic-surge-pricing-during-peak', gapDynamicSurgePricingDuringPeakRouter);
  app.use('/api/gap-kds-kitchen-display-integration', gapKdsKitchenDisplayIntegrationRouter);
  app.use('/api/gap-outbound-webhooks-partners', gapOutboundWebhooksPartnersRouter);
}
// === End pass 7 mounts ===

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Request failed', { name: err?.name || 'Error' });

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

// Start only from the executable entry point. Tests import the app without a
// listener; the runtime validator opts in explicitly while retaining NODE_ENV=test.
if (process.env.NODE_ENV !== 'test' || process.env.RUNTIME_LAUNCH_SERVER === 'true') {
  const port = Number(process.env.BACKEND_PORT);
  const host = process.env.BACKEND_HOST;
  if (!Number.isInteger(port) || port < 1024 || port > 65535 || host !== '127.0.0.1') {
    throw new Error('BACKEND_PORT and BACKEND_HOST=127.0.0.1 are required');
  }
  httpServer.listen(port, host, () => {
    console.log(`Server running on http://${host}:${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

export { app, io };

// (moved above 404 handler)
