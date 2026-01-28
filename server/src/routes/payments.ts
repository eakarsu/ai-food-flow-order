import { Router, raw } from 'express';
import {
  createPaymentIntent,
  confirmPayment,
  handleWebhook,
  getPaymentMethods,
  addPaymentMethod,
  removePaymentMethod,
} from '../controllers/paymentController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Webhook needs raw body - must be before json middleware
router.post('/webhook', raw({ type: 'application/json' }), handleWebhook);

// Protected routes
router.use(authenticateToken);

router.post('/create-intent', createPaymentIntent);
router.post('/confirm', confirmPayment);
router.get('/methods', getPaymentMethods);
router.post('/methods', addPaymentMethod);
router.delete('/methods/:id', removePaymentMethod);

export default router;
