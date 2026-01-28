import { Router } from 'express';
import { body } from 'express-validator';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from '../controllers/cartController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/', getCart);

router.post(
  '/items',
  [
    body('menuItemId').isUUID(),
    body('quantity').isInt({ min: 1 }),
    body('customizations').optional().isObject(),
    body('specialInstructions').optional().isString(),
  ],
  addToCart
);

router.patch(
  '/items/:id',
  [
    body('quantity').optional().isInt({ min: 1 }),
    body('customizations').optional().isObject(),
    body('specialInstructions').optional().isString(),
  ],
  updateCartItem
);

router.delete('/items/:id', removeFromCart);
router.delete('/', clearCart);

export default router;
