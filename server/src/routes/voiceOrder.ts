import { Router } from 'express';
import { body } from 'express-validator';
import { processVoiceOrder, confirmVoiceOrder, getVoiceOrderHistory } from '../controllers/voiceOrderController.js';
import { authenticateToken } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.use(authenticateToken);

// Process a voice/text order
router.post(
  '/process',
  aiLimiter,
  [
    body('text').notEmpty().trim(),
    body('restaurantId').optional(),
  ],
  processVoiceOrder
);

// Confirm or cancel a parsed voice order
router.post(
  '/confirm',
  [
    body('callId').notEmpty(),
    body('confirmed').isBoolean(),
  ],
  confirmVoiceOrder
);

// Get voice order history
router.get('/history', getVoiceOrderHistory);

export default router;
