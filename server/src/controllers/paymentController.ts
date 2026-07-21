import { Request, Response } from 'express';
import Stripe from 'stripe';
import { query, getClient } from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';
import { sendOrderNotification } from '../services/notificationService.js';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' })
  : null;

function stripeClient() {
  if (!stripe) throw Object.assign(new Error('Stripe is not configured'), { status: 503 });
  return stripe;
}

// Create payment intent
export const createPaymentIntent = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.body;

    // Get order
    const orderResult = await query(
      `SELECT id, total_amount, payment_status, stripe_payment_intent_id
       FROM orders
       WHERE id = $1 AND user_id = $2`,
      [orderId, req.user!.id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderResult.rows[0];

    if (order.payment_status === 'completed') {
      return res.status(400).json({ error: 'Order already paid' });
    }

    // If payment intent already exists, return it
    if (order.stripe_payment_intent_id) {
      const existingIntent = await stripeClient().paymentIntents.retrieve(
        order.stripe_payment_intent_id
      );

      if (existingIntent.status !== 'canceled') {
        return res.json({
          clientSecret: existingIntent.client_secret,
          paymentIntentId: existingIntent.id,
        });
      }
    }

    // Create new payment intent
    const paymentIntent = await stripeClient().paymentIntents.create({
      amount: Math.round(parseFloat(order.total_amount) * 100), // Convert to cents
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        orderId: order.id,
        userId: req.user!.id,
      },
    });

    // Update order with payment intent ID
    await query(
      `UPDATE orders SET stripe_payment_intent_id = $1 WHERE id = $2`,
      [paymentIntent.id, orderId]
    );

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
};

// Confirm payment (for client-side confirmation)
export const confirmPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { paymentIntentId, orderId } = req.body;

    const paymentIntent = await stripeClient().paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Update order status
      await query(
        `UPDATE orders
         SET payment_status = 'completed', status = 'confirmed'
         WHERE id = $1 AND stripe_payment_intent_id = $2`,
        [orderId, paymentIntentId]
      );

      // Add status history
      await query(
        `INSERT INTO order_status_history (order_id, status, notes)
         VALUES ($1, 'confirmed', 'Payment received')`,
        [orderId]
      );

      // Send notification
      sendOrderNotification(req.user!.id, orderId, 'payment_confirmed').catch(console.error);

      res.json({ status: 'success', message: 'Payment confirmed' });
    } else {
      res.json({ status: paymentIntent.status, message: 'Payment not yet confirmed' });
    }
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
};

// Stripe webhook handler
export const handleWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    if (!webhookSecret) return res.status(503).json({ error: 'Stripe webhook verification is not configured' });
    event = stripeClient().webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const client = await getClient();

  try {
    await client.query('BEGIN');

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata.orderId;

        if (orderId) {
          await client.query(
            `UPDATE orders
             SET payment_status = 'completed', status = 'confirmed'
             WHERE id = $1`,
            [orderId]
          );

          await client.query(
            `INSERT INTO order_status_history (order_id, status, notes)
             VALUES ($1, 'confirmed', 'Payment received via Stripe webhook')`,
            [orderId]
          );

          // Get user ID for notification
          const orderResult = await client.query(
            'SELECT user_id FROM orders WHERE id = $1',
            [orderId]
          );

          if (orderResult.rows.length > 0) {
            sendOrderNotification(
              orderResult.rows[0].user_id,
              orderId,
              'payment_confirmed'
            ).catch(console.error);
          }
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata.orderId;

        if (orderId) {
          await client.query(
            `UPDATE orders SET payment_status = 'failed' WHERE id = $1`,
            [orderId]
          );

          await client.query(
            `INSERT INTO order_status_history (order_id, status, notes)
             VALUES ($1, 'payment_failed', $2)`,
            [orderId, paymentIntent.last_payment_error?.message || 'Payment failed']
          );
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = charge.payment_intent as string;

        const orderResult = await client.query(
          `SELECT id, user_id FROM orders WHERE stripe_payment_intent_id = $1`,
          [paymentIntentId]
        );

        if (orderResult.rows.length > 0) {
          const order = orderResult.rows[0];

          await client.query(
            `UPDATE orders SET payment_status = 'refunded' WHERE id = $1`,
            [order.id]
          );

          await client.query(
            `INSERT INTO order_status_history (order_id, status, notes)
             VALUES ($1, 'refunded', 'Payment refunded')`,
            [order.id]
          );

          sendOrderNotification(order.user_id, order.id, 'order_refunded').catch(console.error);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    await client.query('COMMIT');
    res.json({ received: true });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  } finally {
    client.release();
  }
};

// Get saved payment methods (placeholder for Stripe Customer)
export const getPaymentMethods = async (req: AuthRequest, res: Response) => {
  try {
    res.status(501).json({ error: 'Saved payment methods are not configured' });
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({ error: 'Failed to get payment methods' });
  }
};

// Add payment method (placeholder)
export const addPaymentMethod = async (req: AuthRequest, res: Response) => {
  try {
    res.status(501).json({ error: 'Saved payment methods are not configured' });
  } catch (error) {
    console.error('Add payment method error:', error);
    res.status(500).json({ error: 'Failed to add payment method' });
  }
};

// Remove payment method (placeholder)
export const removePaymentMethod = async (req: AuthRequest, res: Response) => {
  try {
    res.status(501).json({ error: 'Saved payment methods are not configured' });
  } catch (error) {
    console.error('Remove payment method error:', error);
    res.status(500).json({ error: 'Failed to remove payment method' });
  }
};
