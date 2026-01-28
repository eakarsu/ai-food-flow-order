import { Response } from 'express';
import { validationResult } from 'express-validator';
import { query } from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';

// Register device for push notifications
export const registerDevice = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { fcmToken, deviceType, deviceId } = req.body;

    // Upsert push subscription
    await query(
      `INSERT INTO push_subscriptions (user_id, fcm_token, device_type, device_id)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, fcm_token)
       DO UPDATE SET
         device_type = COALESCE(EXCLUDED.device_type, push_subscriptions.device_type),
         device_id = COALESCE(EXCLUDED.device_id, push_subscriptions.device_id),
         is_active = TRUE,
         updated_at = CURRENT_TIMESTAMP`,
      [req.user!.id, fcmToken, deviceType, deviceId]
    );

    // Also update user's fcm_token
    await query(
      'UPDATE users SET fcm_token = $1 WHERE id = $2',
      [fcmToken, req.user!.id]
    );

    res.json({ message: 'Device registered for notifications' });
  } catch (error) {
    console.error('Register device error:', error);
    res.status(500).json({ error: 'Failed to register device' });
  }
};

// Unregister device
export const unregisterDevice = async (req: AuthRequest, res: Response) => {
  try {
    const { fcmToken } = req.body;

    await query(
      `UPDATE push_subscriptions
       SET is_active = FALSE
       WHERE user_id = $1 AND fcm_token = $2`,
      [req.user!.id, fcmToken]
    );

    res.json({ message: 'Device unregistered' });
  } catch (error) {
    console.error('Unregister device error:', error);
    res.status(500).json({ error: 'Failed to unregister device' });
  }
};

// Get notification settings (placeholder)
export const getNotificationSettings = async (req: AuthRequest, res: Response) => {
  try {
    // In a real app, you might have a user_settings table
    res.json({
      settings: {
        orderUpdates: true,
        promotions: true,
        newRestaurants: false,
        deliveryUpdates: true,
      },
    });
  } catch (error) {
    console.error('Get notification settings error:', error);
    res.status(500).json({ error: 'Failed to get settings' });
  }
};

// Update notification settings (placeholder)
export const updateNotificationSettings = async (req: AuthRequest, res: Response) => {
  try {
    const settings = req.body;

    // In a real app, save to user_settings table
    res.json({
      message: 'Notification settings updated',
      settings,
    });
  } catch (error) {
    console.error('Update notification settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
};
