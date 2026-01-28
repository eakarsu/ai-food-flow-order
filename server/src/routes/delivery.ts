import { Router } from 'express';
import {
  getDeliveryStatus,
  updateDeliveryLocation,
  getDeliveryHistory,
} from '../controllers/deliveryController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/orders/:orderId/status', getDeliveryStatus);
router.get('/history', getDeliveryHistory);

// This would typically be called by driver app
router.patch('/orders/:orderId/location', updateDeliveryLocation);

export default router;
