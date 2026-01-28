import { Router } from 'express';
import {
  getAllRestaurants,
  getRestaurantById,
  getRestaurantMenu,
  searchRestaurants,
} from '../controllers/restaurantController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', optionalAuth, getAllRestaurants);
router.get('/search', optionalAuth, searchRestaurants);
router.get('/:id', optionalAuth, getRestaurantById);
router.get('/:id/menu', optionalAuth, getRestaurantMenu);

export default router;
