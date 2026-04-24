import { Router } from 'express';
import { body } from 'express-validator';
import {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  bulkDeleteReviews,
  bulkUpdateReviews,
  generateAIResponse,
  publishResponse,
  getReviewStats,
  analyzeAllReviews,
} from '../controllers/reviewController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get all reviews
router.get('/', getReviews);

// Get review statistics
router.get('/stats', getReviewStats);

// AI-powered bulk review analysis
router.post('/analyze', analyzeAllReviews);

// Get single review
router.get('/:id', getReview);

// Create review
router.post(
  '/',
  [
    body('restaurantId').isUUID(),
    body('rating').isInt({ min: 1, max: 5 }),
    body('content').notEmpty().trim(),
    body('orderId').optional().isUUID(),
    body('customerName').optional().trim(),
    body('title').optional().trim(),
    body('sentiment').optional().isIn(['positive', 'neutral', 'negative']),
  ],
  createReview
);

// Update review
router.put(
  '/:id',
  [
    body('rating').optional().isInt({ min: 1, max: 5 }),
    body('content').optional().notEmpty().trim(),
    body('customerName').optional().trim(),
    body('title').optional().trim(),
    body('sentiment').optional().isIn(['positive', 'neutral', 'negative']),
    body('aiResponse').optional().trim(),
    body('isPublished').optional().isBoolean(),
    body('isResponded').optional().isBoolean(),
  ],
  updateReview
);

// Bulk delete reviews
router.post('/bulk-delete', requireRole('admin', 'manager'), bulkDeleteReviews);

// Bulk update reviews
router.post('/bulk-update', requireRole('admin', 'manager'), bulkUpdateReviews);

// Delete review
router.delete('/:id', deleteReview);

// Generate AI response for review
router.post('/:id/generate-response', generateAIResponse);

// Publish AI response
router.post('/:id/publish-response', publishResponse);

export default router;
