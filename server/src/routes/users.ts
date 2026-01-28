import { Router } from 'express';
import { body } from 'express-validator';
import {
  updateProfile,
  updatePassword,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getAddresses,
  updateFcmToken,
} from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Profile routes
router.patch(
  '/profile',
  [
    body('firstName').optional().trim().isLength({ min: 1, max: 100 }),
    body('lastName').optional().trim().isLength({ min: 1, max: 100 }),
    body('phone').optional().isMobilePhone('any'),
  ],
  updateProfile
);

router.patch(
  '/password',
  [
    body('currentPassword').notEmpty(),
    body('newPassword')
      .isLength({ min: 8 })
      .matches(/[a-z]/)
      .matches(/[A-Z]/)
      .matches(/[0-9]/),
  ],
  updatePassword
);

// Address routes
router.get('/addresses', getAddresses);

router.post(
  '/addresses',
  [
    body('label').optional().trim(),
    body('streetAddress').notEmpty().trim(),
    body('city').notEmpty().trim(),
    body('state').notEmpty().trim(),
    body('zipCode').notEmpty().trim(),
  ],
  addAddress
);

router.patch('/addresses/:id', updateAddress);
router.delete('/addresses/:id', deleteAddress);
router.patch('/addresses/:id/default', setDefaultAddress);

// FCM token for push notifications
router.patch('/fcm-token', body('fcmToken').notEmpty(), updateFcmToken);

export default router;
