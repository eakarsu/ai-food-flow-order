import { Response } from 'express';
import { validationResult } from 'express-validator';
import { query, getClient } from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';
import { sendOrderNotification } from '../services/notificationService.js';
import { sendOrderConfirmation } from '../services/smsService.js';

// Generate order number
const generateOrderNumber = () => {
  const prefix = 'ORD';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

// Create order from cart
export const createOrder = async (req: AuthRequest, res: Response) => {
  const client = await getClient();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { deliveryAddressId, paymentMethod, tipAmount = 0, specialInstructions } = req.body;

    await client.query('BEGIN');

    // Get user's cart
    const cartResult = await client.query(
      `SELECT c.id, c.restaurant_id
       FROM carts c
       WHERE c.user_id = $1`,
      [req.user!.id]
    );

    if (cartResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Cart not found' });
    }

    const cart = cartResult.rows[0];

    // Get cart items
    const itemsResult = await client.query(
      `SELECT ci.id, ci.menu_item_id, ci.quantity, ci.unit_price,
              ci.customizations, ci.special_instructions,
              mi.name
       FROM cart_items ci
       JOIN menu_items mi ON ci.menu_item_id = mi.id
       WHERE ci.cart_id = $1`,
      [cart.id]
    );

    if (itemsResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Get delivery address
    const addressResult = await client.query(
      `SELECT id, street_address, apartment, city, state, zip_code
       FROM addresses
       WHERE id = $1 AND user_id = $2`,
      [deliveryAddressId, req.user!.id]
    );

    if (addressResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Invalid delivery address' });
    }

    const address = addressResult.rows[0];
    const addressSnapshot = {
      streetAddress: address.street_address,
      apartment: address.apartment,
      city: address.city,
      state: address.state,
      zipCode: address.zip_code,
    };

    // Get restaurant details
    const restaurantResult = await client.query(
      `SELECT id, name, delivery_fee, estimated_delivery_time
       FROM restaurants WHERE id = $1`,
      [cart.restaurant_id]
    );

    const restaurant = restaurantResult.rows[0];

    // Calculate totals
    const subtotal = itemsResult.rows.reduce(
      (sum, item) => sum + parseFloat(item.unit_price) * item.quantity,
      0
    );
    const deliveryFee = parseFloat(restaurant.delivery_fee);
    const taxAmount = subtotal * 0.08; // 8% tax
    const totalAmount = subtotal + deliveryFee + taxAmount + tipAmount;

    // Create order
    const orderNumber = generateOrderNumber();
    const estimatedDelivery = new Date();
    estimatedDelivery.setMinutes(
      estimatedDelivery.getMinutes() + restaurant.estimated_delivery_time
    );

    const orderResult = await client.query(
      `INSERT INTO orders
       (user_id, restaurant_id, order_number, status, subtotal, tax_amount,
        delivery_fee, tip_amount, total_amount, payment_method, payment_status,
        delivery_address_id, delivery_address_snapshot, special_instructions,
        estimated_delivery_time)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING id, order_number, status, created_at`,
      [
        req.user!.id,
        cart.restaurant_id,
        orderNumber,
        'pending',
        subtotal,
        taxAmount,
        deliveryFee,
        tipAmount,
        totalAmount,
        paymentMethod,
        'pending',
        deliveryAddressId,
        JSON.stringify(addressSnapshot),
        specialInstructions,
        estimatedDelivery,
      ]
    );

    const order = orderResult.rows[0];

    // Create order items
    for (const item of itemsResult.rows) {
      await client.query(
        `INSERT INTO order_items
         (order_id, menu_item_id, name, quantity, unit_price, total_price,
          customizations, special_instructions)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          order.id,
          item.menu_item_id,
          item.name,
          item.quantity,
          item.unit_price,
          parseFloat(item.unit_price) * item.quantity,
          item.customizations,
          item.special_instructions,
        ]
      );
    }

    // Add initial status history
    await client.query(
      `INSERT INTO order_status_history (order_id, status, notes)
       VALUES ($1, $2, $3)`,
      [order.id, 'pending', 'Order created']
    );

    // Clear cart
    await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cart.id]);
    await client.query('UPDATE carts SET restaurant_id = NULL WHERE id = $1', [cart.id]);

    await client.query('COMMIT');

    // Send notification (async, don't wait)
    sendOrderNotification(req.user!.id, order.id, 'order_created').catch(console.error);

    // Send SMS order confirmation (async, don't wait)
    const userResult = await query('SELECT phone FROM users WHERE id = $1', [req.user!.id]);
    const userPhone = userResult.rows[0]?.phone;
    if (userPhone) {
      sendOrderConfirmation(userPhone, {
        orderNumber: order.order_number,
        restaurantName: restaurant.name,
        totalAmount,
        estimatedDeliveryTime: estimatedDelivery,
        items: itemsResult.rows.map(i => ({ name: i.name, quantity: i.quantity })),
      }).catch(console.error);
    }

    res.status(201).json({
      message: 'Order created successfully',
      order: {
        id: order.id,
        orderNumber: order.order_number,
        status: order.status,
        subtotal,
        taxAmount,
        deliveryFee,
        tipAmount,
        totalAmount,
        estimatedDeliveryTime: estimatedDelivery,
        createdAt: order.created_at,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  } finally {
    client.release();
  }
};

// Get user's orders
export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let whereClause = 'WHERE o.user_id = $1';
    const params: any[] = [req.user!.id];

    if (status) {
      whereClause += ' AND o.status = $2';
      params.push(status);
    }

    const result = await query(
      `SELECT o.id, o.order_number, o.status, o.subtotal, o.tax_amount,
              o.delivery_fee, o.tip_amount, o.total_amount, o.payment_method,
              o.payment_status, o.estimated_delivery_time, o.actual_delivery_time,
              o.created_at, r.name as restaurant_name, r.image_url as restaurant_image
       FROM orders o
       LEFT JOIN restaurants r ON o.restaurant_id = r.id
       ${whereClause}
       ORDER BY o.created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, Number(limit), offset]
    );

    // Get item count for each order
    const orderIds = result.rows.map(o => o.id);
    let itemCounts: Record<string, number> = {};

    if (orderIds.length > 0) {
      const countResult = await query(
        `SELECT order_id, SUM(quantity) as item_count
         FROM order_items
         WHERE order_id = ANY($1)
         GROUP BY order_id`,
        [orderIds]
      );
      itemCounts = countResult.rows.reduce((acc, row) => {
        acc[row.order_id] = parseInt(row.item_count);
        return acc;
      }, {} as Record<string, number>);
    }

    // Get total count for pagination
    const countParams: any[] = [req.user!.id];
    let countWhere = 'WHERE o.user_id = $1';
    if (status) {
      countWhere += ' AND o.status = $2';
      countParams.push(status);
    }
    const countResult = await query(
      `SELECT COUNT(*) FROM orders o ${countWhere}`,
      countParams
    );
    const total = parseInt(countResult.rows[0].count);

    res.json({
      orders: result.rows.map(o => ({
        id: o.id,
        orderNumber: o.order_number,
        status: o.status,
        subtotal: parseFloat(o.subtotal),
        taxAmount: parseFloat(o.tax_amount),
        deliveryFee: parseFloat(o.delivery_fee),
        tipAmount: parseFloat(o.tip_amount),
        totalAmount: parseFloat(o.total_amount),
        paymentMethod: o.payment_method,
        paymentStatus: o.payment_status,
        estimatedDeliveryTime: o.estimated_delivery_time,
        actualDeliveryTime: o.actual_delivery_time,
        createdAt: o.created_at,
        restaurantName: o.restaurant_name,
        restaurantImage: o.restaurant_image,
        itemCount: itemCounts[o.id] || 0,
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
};

// Get order by ID
export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const orderResult = await query(
      `SELECT o.*, r.name as restaurant_name, r.image_url as restaurant_image,
              r.phone as restaurant_phone
       FROM orders o
       LEFT JOIN restaurants r ON o.restaurant_id = r.id
       WHERE o.id = $1 AND o.user_id = $2`,
      [id, req.user!.id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderResult.rows[0];

    // Get order items
    const itemsResult = await query(
      `SELECT id, name, quantity, unit_price, total_price,
              customizations, special_instructions
       FROM order_items
       WHERE order_id = $1`,
      [id]
    );

    // Get status history
    const historyResult = await query(
      `SELECT status, notes, created_at
       FROM order_status_history
       WHERE order_id = $1
       ORDER BY created_at DESC`,
      [id]
    );

    // Get delivery tracking if exists
    const trackingResult = await query(
      `SELECT driver_name, driver_phone, driver_photo_url,
              current_latitude, current_longitude, status, eta_minutes, last_updated
       FROM delivery_tracking
       WHERE order_id = $1`,
      [id]
    );

    res.json({
      order: {
        id: order.id,
        orderNumber: order.order_number,
        status: order.status,
        subtotal: parseFloat(order.subtotal),
        taxAmount: parseFloat(order.tax_amount),
        deliveryFee: parseFloat(order.delivery_fee),
        tipAmount: parseFloat(order.tip_amount),
        discountAmount: parseFloat(order.discount_amount),
        totalAmount: parseFloat(order.total_amount),
        paymentMethod: order.payment_method,
        paymentStatus: order.payment_status,
        specialInstructions: order.special_instructions,
        estimatedDeliveryTime: order.estimated_delivery_time,
        actualDeliveryTime: order.actual_delivery_time,
        createdAt: order.created_at,
        deliveryAddress: order.delivery_address_snapshot,
        restaurant: {
          name: order.restaurant_name,
          imageUrl: order.restaurant_image,
          phone: order.restaurant_phone,
        },
        items: itemsResult.rows.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          unitPrice: parseFloat(item.unit_price),
          totalPrice: parseFloat(item.total_price),
          customizations: item.customizations,
          specialInstructions: item.special_instructions,
        })),
        statusHistory: historyResult.rows.map(h => ({
          status: h.status,
          notes: h.notes,
          createdAt: h.created_at,
        })),
        delivery: trackingResult.rows.length > 0 ? {
          driverName: trackingResult.rows[0].driver_name,
          driverPhone: trackingResult.rows[0].driver_phone,
          driverPhotoUrl: trackingResult.rows[0].driver_photo_url,
          currentLatitude: trackingResult.rows[0].current_latitude,
          currentLongitude: trackingResult.rows[0].current_longitude,
          status: trackingResult.rows[0].status,
          etaMinutes: trackingResult.rows[0].eta_minutes,
          lastUpdated: trackingResult.rows[0].last_updated,
        } : null,
      },
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to get order' });
  }
};

// Cancel order
export const cancelOrder = async (req: AuthRequest, res: Response) => {
  const client = await getClient();

  try {
    const { id } = req.params;

    await client.query('BEGIN');

    // Get order
    const orderResult = await client.query(
      `SELECT id, status, payment_status, stripe_payment_intent_id
       FROM orders
       WHERE id = $1 AND user_id = $2`,
      [id, req.user!.id]
    );

    if (orderResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderResult.rows[0];

    // Check if can be cancelled
    const cancellableStatuses = ['pending', 'confirmed'];
    if (!cancellableStatuses.includes(order.status)) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: 'Order cannot be cancelled',
        message: `Order is already ${order.status}`,
      });
    }

    if (order.stripe_payment_intent_id || ['paid', 'succeeded', 'authorized'].includes(order.payment_status)) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        error: 'Paid orders require the governed cancellation and refund workflow',
      });
    }

    // Update order status
    await client.query(
      `UPDATE orders SET status = 'cancelled' WHERE id = $1`,
      [id]
    );

    // Add to status history
    await client.query(
      `INSERT INTO order_status_history (order_id, status, notes)
       VALUES ($1, 'cancelled', $2)`,
      [id, req.body.reason || 'Cancelled by customer']
    );

    await client.query('COMMIT');

    // Send notification
    sendOrderNotification(req.user!.id, id, 'order_cancelled').catch(console.error);

    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Cancel order error:', error);
    res.status(500).json({ error: 'Failed to cancel order' });
  } finally {
    client.release();
  }
};

// Reorder from previous order
export const reorderFromPrevious = async (req: AuthRequest, res: Response) => {
  const client = await getClient();

  try {
    const { id } = req.params;

    await client.query('BEGIN');

    // Get previous order items
    const orderResult = await client.query(
      `SELECT oi.menu_item_id, oi.quantity, oi.customizations, oi.special_instructions,
              o.restaurant_id
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE o.id = $1 AND o.user_id = $2`,
      [id, req.user!.id]
    );

    if (orderResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Order not found' });
    }

    const restaurantId = orderResult.rows[0].restaurant_id;

    // Get or create cart
    let cartResult = await client.query(
      'SELECT id FROM carts WHERE user_id = $1',
      [req.user!.id]
    );

    if (cartResult.rows.length === 0) {
      cartResult = await client.query(
        'INSERT INTO carts (user_id, restaurant_id) VALUES ($1, $2) RETURNING id',
        [req.user!.id, restaurantId]
      );
    }

    const cartId = cartResult.rows[0].id;

    // Clear existing cart
    await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
    await client.query(
      'UPDATE carts SET restaurant_id = $1 WHERE id = $2',
      [restaurantId, cartId]
    );

    // Add items to cart
    for (const item of orderResult.rows) {
      // Get current price
      const menuItemResult = await client.query(
        'SELECT price, is_available FROM menu_items WHERE id = $1',
        [item.menu_item_id]
      );

      if (menuItemResult.rows.length > 0 && menuItemResult.rows[0].is_available) {
        await client.query(
          `INSERT INTO cart_items
           (cart_id, menu_item_id, quantity, unit_price, customizations, special_instructions)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            cartId,
            item.menu_item_id,
            item.quantity,
            menuItemResult.rows[0].price,
            item.customizations,
            item.special_instructions,
          ]
        );
      }
    }

    await client.query('COMMIT');

    res.json({ message: 'Items added to cart from previous order' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Reorder error:', error);
    res.status(500).json({ error: 'Failed to reorder' });
  } finally {
    client.release();
  }
};
