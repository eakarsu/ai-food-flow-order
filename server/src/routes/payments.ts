import { Router } from 'express';
import {
  createPaymentIntent,
  confirmPayment,
  getPaymentMethods,
  addPaymentMethod,
  removePaymentMethod,
} from '../controllers/paymentController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Protected routes
router.use(authenticateToken);

router.post('/create-intent', createPaymentIntent);
router.post('/confirm', confirmPayment);
router.get('/methods', getPaymentMethods);
router.post('/methods', addPaymentMethod);
router.delete('/methods/:id', removePaymentMethod);

export default router;
