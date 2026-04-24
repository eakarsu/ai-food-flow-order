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

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Predict wait time for order
router.post(
  '/wait-time',
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

export default router;
