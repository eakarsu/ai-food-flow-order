import { Response } from 'express';
import { query } from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';

// Get delivery status
export const getDeliveryStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;

    // Verify order belongs to user
    const orderResult = await query(
      `SELECT o.id, o.status, o.estimated_delivery_time, o.actual_delivery_time,
              o.delivery_address_snapshot,
              r.name as restaurant_name, r.address as restaurant_address,
              r.latitude as restaurant_lat, r.longitude as restaurant_lng
       FROM orders o
       LEFT JOIN restaurants r ON o.restaurant_id = r.id
       WHERE o.id = $1 AND o.user_id = $2`,
      [orderId, req.user!.id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderResult.rows[0];

    // Get delivery tracking
    const trackingResult = await query(
      `SELECT driver_name, driver_phone, driver_photo_url,
              current_latitude, current_longitude, status, eta_minutes, last_updated
       FROM delivery_tracking
       WHERE order_id = $1`,
      [orderId]
    );

    // Get status history
    const historyResult = await query(
      `SELECT status, notes, created_at
       FROM order_status_history
       WHERE order_id = $1
       ORDER BY created_at DESC`,
      [orderId]
    );

    const delivery = trackingResult.rows.length > 0 ? trackingResult.rows[0] : null;

    res.json({
      order: {
        id: order.id,
        status: order.status,
        estimatedDeliveryTime: order.estimated_delivery_time,
        actualDeliveryTime: order.actual_delivery_time,
        deliveryAddress: order.delivery_address_snapshot,
        restaurant: {
          name: order.restaurant_name,
          address: order.restaurant_address,
          latitude: order.restaurant_lat ? parseFloat(order.restaurant_lat) : null,
          longitude: order.restaurant_lng ? parseFloat(order.restaurant_lng) : null,
        },
      },
      delivery: delivery ? {
        driverName: delivery.driver_name,
        driverPhone: delivery.driver_phone,
        driverPhotoUrl: delivery.driver_photo_url,
        currentLocation: {
          latitude: delivery.current_latitude ? parseFloat(delivery.current_latitude) : null,
          longitude: delivery.current_longitude ? parseFloat(delivery.current_longitude) : null,
        },
        status: delivery.status,
        etaMinutes: delivery.eta_minutes,
        lastUpdated: delivery.last_updated,
      } : null,
      statusHistory: historyResult.rows.map(h => ({
        status: h.status,
        notes: h.notes,
        timestamp: h.created_at,
      })),
    });
  } catch (error) {
    console.error('Get delivery status error:', error);
    res.status(500).json({ error: 'Failed to get delivery status' });
  }
};

// Update delivery location (typically called by driver app)
export const updateDeliveryLocation = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const { latitude, longitude, etaMinutes, status } = req.body;

    // In a real app, this would verify the driver is assigned to this order
    // For now, we'll just update

    const result = await query(
      `UPDATE delivery_tracking
       SET current_latitude = COALESCE($1, current_latitude),
           current_longitude = COALESCE($2, current_longitude),
           eta_minutes = COALESCE($3, eta_minutes),
           status = COALESCE($4, status),
           last_updated = CURRENT_TIMESTAMP
       WHERE order_id = $5
       RETURNING *`,
      [latitude, longitude, etaMinutes, status, orderId]
    );

    if (result.rows.length === 0) {
      // Create tracking record if doesn't exist
      await query(
        `INSERT INTO delivery_tracking
         (order_id, current_latitude, current_longitude, eta_minutes, status)
         VALUES ($1, $2, $3, $4, $5)`,
        [orderId, latitude, longitude, etaMinutes, status || 'in_transit']
      );
    }

    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`order:${orderId}`).emit('delivery:update', {
        orderId,
        latitude,
        longitude,
        etaMinutes,
        status,
        timestamp: new Date().toISOString(),
      });
    }

    res.json({ message: 'Delivery location updated' });
  } catch (error) {
    console.error('Update delivery location error:', error);
    res.status(500).json({ error: 'Failed to update delivery location' });
  }
};

// Get delivery history (past deliveries)
export const getDeliveryHistory = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const result = await query(
      `SELECT o.id, o.order_number, o.status, o.total_amount,
              o.estimated_delivery_time, o.actual_delivery_time, o.created_at,
              o.delivery_address_snapshot,
              r.name as restaurant_name,
              dt.driver_name
       FROM orders o
       LEFT JOIN restaurants r ON o.restaurant_id = r.id
       LEFT JOIN delivery_tracking dt ON o.id = dt.order_id
       WHERE o.user_id = $1 AND o.status IN ('delivered', 'cancelled')
       ORDER BY o.created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user!.id, Number(limit), offset]
    );

    res.json({
      deliveries: result.rows.map(d => ({
        orderId: d.id,
        orderNumber: d.order_number,
        status: d.status,
        totalAmount: parseFloat(d.total_amount),
        estimatedDeliveryTime: d.estimated_delivery_time,
        actualDeliveryTime: d.actual_delivery_time,
        orderedAt: d.created_at,
        deliveryAddress: d.delivery_address_snapshot,
        restaurantName: d.restaurant_name,
        driverName: d.driver_name,
      })),
    });
  } catch (error) {
    console.error('Get delivery history error:', error);
    res.status(500).json({ error: 'Failed to get delivery history' });
  }
};
