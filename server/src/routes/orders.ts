import { Router } from 'express';
import { body } from 'express-validator';
import {
  createOrder,
  getOrders,
  getOrderById,
  cancelOrder,
  reorderFromPrevious,
} from '../controllers/orderController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/', getOrders);
router.get('/:id', getOrderById);

router.post(
  '/',
  [
    body('deliveryAddressId').isUUID(),
    body('paymentMethod').isIn(['card', 'paypal', 'apple_pay']),
    body('tipAmount').optional().isFloat({ min: 0 }),
    body('specialInstructions').optional().isString(),
  ],
  createOrder
);

router.patch('/:id/cancel', cancelOrder);
router.post('/:id/reorder', reorderFromPrevious);

export default router;
