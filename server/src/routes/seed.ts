import { Router } from 'express';
import {
  seedInventory,
  seedStaff,
  seedReviews,
  seedWaitTime,
  seedUpsell,
  seedAll,
} from '../controllers/seedController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Seed individual features
router.post('/inventory', seedInventory);
router.post('/staff', seedStaff);
router.post('/reviews', seedReviews);
router.post('/wait-time', seedWaitTime);
router.post('/upsell', seedUpsell);

// Seed all at once
router.post('/all', seedAll);

export default router;
