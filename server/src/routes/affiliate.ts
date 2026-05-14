import { Router } from 'express';
import { body } from 'express-validator';
import { getRoutingRecommendation, acceptRouting, getAffiliatePartners } from '../controllers/affiliateController.js';
import { authenticateToken } from '../middleware/auth.js';
import { aiLimiter, apiLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.use(authenticateToken);

// Get routing recommendation
router.post(
  '/route',
  aiLimiter,
  [
    body('restaurantId').notEmpty(),
    body('orderId').optional(),
    body('cuisineType').optional().trim(),
    body('customerLocation').optional().isObject(),
  ],
  getRoutingRecommendation
);

// Accept a routing decision
router.post(
  '/route/accept',
  [
    body('orderId').optional(),
    body('acceptedRestaurantId').notEmpty(),
  ],
  acceptRouting
);

// List affiliate partners
router.get('/partners', apiLimiter, getAffiliatePartners);

export default router;
