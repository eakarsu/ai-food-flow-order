import admin from 'firebase-admin';
import { query } from '../config/database.js';

// Initialize Firebase Admin SDK (only if credentials are available)
let firebaseInitialized = false;

const initFirebase = () => {
  if (firebaseInitialized) return;

  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_PRIVATE_KEY &&
    process.env.FIREBASE_CLIENT_EMAIL
  ) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
      });
      firebaseInitialized = true;
      console.log('Firebase Admin SDK initialized');
    } catch (error) {
      console.warn('Firebase initialization failed:', error);
    }
  } else {
    console.warn('Firebase credentials not configured - push notifications disabled');
  }
};

// Initialize on module load
initFirebase();

// Notification templates
const notificationTemplates: Record<string, { title: string; body: string }> = {
  order_created: {
    title: 'Order Confirmed',
    body: 'Your order has been received and is being prepared.',
  },
  payment_confirmed: {
    title: 'Payment Successful',
    body: 'Your payment has been processed. Your order is on the way!',
  },
  order_preparing: {
    title: 'Order Being Prepared',
    body: 'The restaurant is preparing your order.',
  },
  order_ready: {
    title: 'Order Ready for Pickup',
    body: 'Your order is ready and waiting for the driver.',
  },
  order_picked_up: {
    title: 'Driver En Route',
    body: 'Your order has been picked up and is on its way!',
  },
  order_delivered: {
    title: 'Order Delivered',
    body: 'Your order has been delivered. Enjoy your meal!',
  },
  order_cancelled: {
    title: 'Order Cancelled',
    body: 'Your order has been cancelled. A refund will be processed if applicable.',
  },
  order_refunded: {
    title: 'Refund Processed',
    body: 'Your refund has been processed and will appear shortly.',
  },
  delivery_update: {
    title: 'Delivery Update',
    body: 'Your delivery is approaching.',
  },
};

// Send push notification to user
export const sendPushNotification = async (
  userId: string,
  notificationType: string,
  customData?: Record<string, any>
) => {
  if (!firebaseInitialized) {
    console.log('Push notification skipped - Firebase not initialized');
    return;
  }

  try {
    // Get user's FCM tokens
    const result = await query(
      `SELECT fcm_token, device_type
       FROM push_subscriptions
       WHERE user_id = $1 AND is_active = TRUE`,
      [userId]
    );

    if (result.rows.length === 0) {
      console.log(`No active FCM tokens for user ${userId}`);
      return;
    }

    const template = notificationTemplates[notificationType] || {
      title: 'Notification',
      body: 'You have a new update.',
    };

    const tokens = result.rows.map(r => r.fcm_token);

    // Send to all user's devices
    const message: admin.messaging.MulticastMessage = {
      notification: {
        title: template.title,
        body: template.body,
      },
      data: {
        type: notificationType,
        ...(customData && Object.fromEntries(
          Object.entries(customData).map(([k, v]) => [k, String(v)])
        )),
      },
      tokens,
      apns: {
        payload: {
          aps: {
            badge: 1,
            sound: 'default',
          },
        },
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'orders',
        },
      },
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    console.log(`Push notification sent: ${response.successCount} success, ${response.failureCount} failures`);

    // Handle failed tokens
    if (response.failureCount > 0) {
      const failedTokens: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(tokens[idx]);
          console.error(`Token ${tokens[idx]} failed:`, resp.error?.message);
        }
      });

      // Deactivate failed tokens
      if (failedTokens.length > 0) {
        await query(
          `UPDATE push_subscriptions
           SET is_active = FALSE
           WHERE fcm_token = ANY($1)`,
          [failedTokens]
        );
      }
    }
  } catch (error) {
    console.error('Send push notification error:', error);
  }
};

// Send order-related notification
export const sendOrderNotification = async (
  userId: string,
  orderId: string,
  notificationType: string
) => {
  await sendPushNotification(userId, notificationType, { orderId });
};

// Send delivery update notification
export const sendDeliveryNotification = async (
  userId: string,
  orderId: string,
  etaMinutes?: number
) => {
  const customBody = etaMinutes
    ? `Your order will arrive in approximately ${etaMinutes} minutes.`
    : undefined;

  await sendPushNotification(userId, 'delivery_update', {
    orderId,
    ...(customBody && { customBody }),
  });
};
