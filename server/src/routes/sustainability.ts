import { Router } from 'express';
import { body } from 'express-validator';
import { calculateSustainability, getSustainabilityHistory, getLoyaltyPoints } from '../controllers/sustainabilityController.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { aiLimiter, apiLimiter } from '../middleware/rateLimit.js';

const router = Router();

// Calculate sustainability score (optional auth, but saves with user if logged in)
router.post(
  '/calculate',
  optionalAuth,
  aiLimiter,
  [
    body('items').isArray({ min: 1 }),
    body('items.*.name').notEmpty(),
    body('items.*.quantity').isInt({ min: 1 }),
    body('deliveryDistanceKm').optional().isFloat({ min: 0 }),
    body('packagingType').optional().isIn(['plastic', 'compostable', 'reusable']),
    body('orderId').optional(),
  ],
  calculateSustainability
);

// Get sustainability history for authenticated user
router.get('/history', authenticateToken, apiLimiter, getSustainabilityHistory);

// Get loyalty points balance
router.get('/loyalty-points', authenticateToken, apiLimiter, getLoyaltyPoints);

export default router;
