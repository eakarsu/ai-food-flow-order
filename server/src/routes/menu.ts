import { Router } from 'express';
import {
  getAllCategories,
  getMenuItems,
  getMenuItemById,
  searchMenuItems,
  getFeaturedItems,
} from '../controllers/menuController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/categories', optionalAuth, getAllCategories);
router.get('/items', optionalAuth, getMenuItems);
router.get('/items/featured', optionalAuth, getFeaturedItems);
router.get('/items/search', optionalAuth, searchMenuItems);
router.get('/items/:id', optionalAuth, getMenuItemById);

export default router;
