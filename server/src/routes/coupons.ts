import { Router } from 'express';
import { body } from 'express-validator';
import { validateCoupon, getCoupons, createCoupon, deleteCoupon } from '../controllers/couponController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { apiLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.use(authenticateToken);
router.use(apiLimiter);

// Validate a coupon code (any authenticated user)
router.post(
  '/validate',
  [
    body('code').notEmpty().trim(),
    body('orderAmount').optional().isFloat({ min: 0 }),
    body('restaurantId').optional(),
  ],
  validateCoupon
);

// Admin: list all coupons
router.get('/', requireRole('admin', 'manager'), getCoupons);

// Admin: create coupon
router.post(
  '/',
  requireRole('admin', 'manager'),
  [
    body('code').notEmpty().trim(),
    body('discountType').isIn(['percent', 'fixed']),
    body('discountValue').isFloat({ min: 0.01 }),
    body('description').optional().trim(),
    body('minOrderAmount').optional().isFloat({ min: 0 }),
    body('maxDiscountAmount').optional().isFloat({ min: 0 }),
    body('usageLimit').optional().isInt({ min: 1 }),
    body('validFrom').optional().isISO8601(),
    body('validUntil').optional().isISO8601(),
    body('restaurantId').optional(),
  ],
  createCoupon
);

// Admin: delete coupon
router.delete('/:id', requireRole('admin', 'manager'), deleteCoupon);

export default router;
