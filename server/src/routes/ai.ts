import { Router } from 'express';
import { body } from 'express-validator';
import {
  predictOrderWaitTime,
  getCartUpsellRecommendations,
  recordUpsellAcceptance,
  getWaitTimePredictions,
  getUpsellHistory,
  updateActualWaitTime,
  deleteWaitTimePrediction,
  bulkDeleteWaitTimePredictions,
  deleteUpsellRecommendation,
  bulkDeleteUpsellRecommendations,
} from '../controllers/aiController.js';
import { authenticateToken } from '../middleware/auth.js';
import { aiPredictionLimiter } from '../middleware/rateLimit.js';
import { getWaitTimeAccuracy } from '../controllers/analyticsController.js';
import { getDynamicPricing, getPersonalizedRecommendations } from '../controllers/aiExtController.js';
import {
  demandForecast,
  routeOptimization,
  menuRecommendationCold,
  fraudDetection,
  churnPrediction,
  restaurantHealthScore,
  loyaltyStatus,
  dynamicSurgePolicy,
} from '../controllers/aiBacklogController.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Predict wait time for order (rate limited: 30/user/hour)
router.post(
  '/wait-time',
  aiPredictionLimiter,
  [
    body('restaurantId').notEmpty(),
    body('orderItems').isArray({ min: 1 }),
    body('orderItems.*.name').notEmpty(),
    body('orderItems.*.quantity').isInt({ min: 1 }),
    body('orderId').optional().isUUID(),
  ],
  predictOrderWaitTime
);

// Get upsell recommendations for cart
router.post(
  '/upsell',
  [
    body('restaurantId').notEmpty(),
    body('cartItems').isArray({ min: 1 }),
    body('cartItems.*.name').notEmpty(),
    body('cartItems.*.price').isFloat({ min: 0 }),
    body('cartId').optional().isUUID(),
  ],
  getCartUpsellRecommendations
);

// Record upsell acceptance
router.post(
  '/upsell/accept',
  [
    body('recommendationId').isUUID(),
    body('wasAccepted').isBoolean(),
    body('acceptedItemId').optional().isUUID(),
  ],
  recordUpsellAcceptance
);

// Get wait time prediction history
router.get('/wait-time/history', getWaitTimePredictions);

// Get upsell recommendations history
router.get('/upsell/history', getUpsellHistory);

// Update actual wait time (for accuracy tracking)
router.post(
  '/wait-time/actual',
  [
    body('predictionId').isUUID(),
    body('actualMinutes').isInt({ min: 1 }),
  ],
  updateActualWaitTime
);

// Delete a wait time prediction
router.delete('/wait-time/:id', deleteWaitTimePrediction);

// Bulk delete wait time predictions
router.post('/wait-time/bulk-delete', bulkDeleteWaitTimePredictions);

// Delete an upsell recommendation
router.delete('/upsell/:id', deleteUpsellRecommendation);

// Bulk delete upsell recommendations
router.post('/upsell/bulk-delete', bulkDeleteUpsellRecommendations);

// Analytics: wait time accuracy
router.get('/wait-time/accuracy', getWaitTimeAccuracy);

// SSE: stream wait time prediction progress
router.get('/wait-time/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const orderId = req.query.orderId as string;

  const send = (event: string, data: object) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  // Simulate streaming prediction stages
  const stages = [
    { stage: 'fetching_queue', message: 'Fetching current queue size...', progress: 10 },
    { stage: 'checking_staff', message: 'Checking on-duty staff count...', progress: 25 },
    { stage: 'analyzing_items', message: 'Analyzing order complexity...', progress: 45 },
    { stage: 'querying_ai', message: 'Running AI prediction...', progress: 70 },
    { stage: 'finalizing', message: 'Finalizing estimate...', progress: 90 },
  ];

  let i = 0;
  const interval = setInterval(() => {
    if (i < stages.length) {
      send('progress', { ...stages[i], orderId });
      i++;
    } else {
      send('complete', { stage: 'complete', message: 'Prediction ready', progress: 100, orderId });
      clearInterval(interval);
      res.end();
    }
  }, 600);

  req.on('close', () => clearInterval(interval));
});

// Dynamic pricing suggestion
router.post(
  '/dynamic-pricing',
  aiPredictionLimiter,
  [
    body('menuItemId').notEmpty(),
    body('currentQueueSize').isInt({ min: 0 }),
    body('timeOfDay').notEmpty(),
  ],
  getDynamicPricing
);

// Personalized recommendations
router.post(
  '/personalized-recommendations',
  aiPredictionLimiter,
  [
    body('userId').notEmpty(),
  ],
  getPersonalizedRecommendations
);

// Apply pass 5 — additive backlog endpoints. All gate on OPENROUTER_API_KEY.
router.post('/demand-forecast', aiPredictionLimiter, demandForecast);
router.post('/route-optimization', aiPredictionLimiter, routeOptimization);
router.post('/menu-recommendation-cold', aiPredictionLimiter, menuRecommendationCold);
router.post('/fraud-detection', aiPredictionLimiter, fraudDetection);
router.post('/churn-prediction', aiPredictionLimiter, churnPrediction);
router.post('/restaurant-health-score', aiPredictionLimiter, restaurantHealthScore);
router.get('/loyalty/status', loyaltyStatus);
router.post('/dynamic-surge-policy', aiPredictionLimiter, dynamicSurgePolicy);

export default router;
