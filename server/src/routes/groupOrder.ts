import { Router } from 'express';
import { body } from 'express-validator';
import {
  createGroupOrder,
  joinGroupOrder,
  getGroupOrder,
  addGroupOrderItem,
  getGroupRecommendations,
  splitGroupBill,
} from '../controllers/groupOrderController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

// Create a new group order
router.post(
  '/',
  [
    body('restaurantId').optional(),
    body('hostName').optional().trim(),
  ],
  createGroupOrder
);

// Join an existing group order
router.post(
  '/join',
  [
    body('inviteCode').notEmpty().trim(),
    body('userName').optional().trim(),
  ],
  joinGroupOrder
);

// Get group order by ID
router.get('/:id', getGroupOrder);

// Add item to group order
router.post(
  '/:id/item',
  [
    body('name').notEmpty().trim(),
    body('price').isFloat({ min: 0 }),
    body('addedBy').optional(),
  ],
  addGroupOrderItem
);

// Get AI recommendations for the group
router.post('/:id/recommendations', getGroupRecommendations);

// Calculate bill split
router.post(
  '/:id/split',
  [
    body('method').optional().isIn(['equal', 'by_item']),
  ],
  splitGroupBill
);

export default router;
