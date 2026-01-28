import { Router } from 'express';
import { body } from 'express-validator';
import {
  registerDevice,
  unregisterDevice,
  getNotificationSettings,
  updateNotificationSettings,
} from '../controllers/notificationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.post(
  '/register',
  [
    body('fcmToken').notEmpty(),
    body('deviceType').optional().isIn(['ios', 'android', 'web']),
    body('deviceId').optional().isString(),
  ],
  registerDevice
);

router.post('/unregister', body('fcmToken').notEmpty(), unregisterDevice);

router.get('/settings', getNotificationSettings);
router.patch('/settings', updateNotificationSettings);

export default router;
