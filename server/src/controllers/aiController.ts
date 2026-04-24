import { Response } from 'express';
import { validationResult } from 'express-validator';
import { query, getClient } from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';
import { predictWaitTime, getUpsellRecommendations } from '../services/openRouterService.js';

// Helper: resolve restaurantId - if not a valid UUID, look up the first restaurant
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function resolveRestaurantId(rawId: string): Promise<string> {
  if (UUID_REGEX.test(rawId)) return rawId;
  const result = await query('SELECT id FROM restaurants LIMIT 1');
  if (result.rows.length === 0) throw new Error('No restaurant found');
  return result.rows[0].id;
}

// Predict wait time for an order
export const predictOrderWaitTime = async (req: AuthRequest, res: Response) => {
  const client = await getClient();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { restaurantId: rawRestaurantId, orderItems, orderId } = req.body;
    const restaurantId = await resolveRestaurantId(rawRestaurantId);

    // Get current queue size (pending orders)
    const queueResult = await query(
      `SELECT COUNT(*) as queue_size
       FROM orders
       WHERE restaurant_id = $1
       AND status IN ('pending', 'confirmed', 'preparing')`,
      [restaurantId]
    );
    const currentQueueSize = parseInt(queueResult.rows[0].queue_size);

    // Get current staff count on duty
    const staffResult = await query(
      `SELECT COUNT(*) as staff_count
       FROM staff_schedules
       WHERE restaurant_id = $1
       AND shift_date = CURRENT_DATE
       AND start_time <= CURRENT_TIME
       AND end_time >= CURRENT_TIME
       AND status = 'scheduled'`,
      [restaurantId]
    );
    const staffCount = parseInt(staffResult.rows[0].staff_count) || 2; // Default to 2 if no schedules

    // Get time of day and day of week
    const now = new Date();
    const hour = now.getHours();
    let timeOfDay = 'afternoon';
    if (hour < 11) timeOfDay = 'morning';
    else if (hour < 14) timeOfDay = 'lunch_rush';
    else if (hour < 17) timeOfDay = 'afternoon';
    else if (hour < 20) timeOfDay = 'dinner_rush';
    else timeOfDay = 'evening';

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = days[now.getDay()];

    // Get prep times for items
    const itemNames = orderItems.map((i: any) => i.name);
    const prepTimeResult = await query(
      `SELECT name, prep_time
       FROM menu_items
       WHERE name = ANY($1)`,
      [itemNames]
    );

    const prepTimes = new Map(prepTimeResult.rows.map(r => [r.name, r.prep_time]));
    const itemsWithPrepTime = orderItems.map((item: any) => ({
      ...item,
      prepTime: prepTimes.get(item.name) || 15,
    }));

    // Call AI prediction
    const prediction = await predictWaitTime({
      orderItems: itemsWithPrepTime,
      currentQueueSize,
      timeOfDay,
      dayOfWeek,
      staffCount,
    });

    await client.query('BEGIN');

    // Save prediction to database
    const saveResult = await client.query(
      `INSERT INTO wait_time_predictions
       (restaurant_id, order_id, predicted_minutes, order_items_count,
        current_queue_size, time_of_day, day_of_week, confidence, factors)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [restaurantId, orderId, prediction.predictedMinutes, orderItems.length,
       currentQueueSize, timeOfDay, dayOfWeek, prediction.confidence,
       JSON.stringify(prediction.factors)]
    );

    await client.query('COMMIT');

    res.json({
      prediction: {
        id: saveResult.rows[0].id,
        predictedMinutes: prediction.predictedMinutes,
        confidence: prediction.confidence,
        factors: prediction.factors,
        explanation: prediction.explanation,
        context: {
          currentQueueSize,
          timeOfDay,
          dayOfWeek,
          staffCount,
        },
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Predict wait time error:', error);
    res.status(500).json({ error: 'Failed to predict wait time' });
  } finally {
    client.release();
  }
};

// Get upsell recommendations for cart
export const getCartUpsellRecommendations = async (req: AuthRequest, res: Response) => {
  const client = await getClient();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { restaurantId: rawRestaurantId2, cartItems, cartId } = req.body;
    const restaurantId = await resolveRestaurantId(rawRestaurantId2);

    // Get available menu items (excluding cart items)
    const cartItemNames = cartItems.map((i: any) => i.name);
    const menuResult = await query(
      `SELECT mi.id, mi.name, mi.price, mi.description
       FROM menu_items mi
       JOIN menu_categories mc ON mi.category_id = mc.id
       WHERE mi.restaurant_id = $1
       AND mi.is_available = true
       AND mi.name NOT IN (SELECT UNNEST($2::text[]))
       ORDER BY mi.is_featured DESC, mi.name
       LIMIT 30`,
      [restaurantId, cartItemNames]
    );

    // Get categories for cart items
    const cartWithCategories = await query(
      `SELECT mi.name, mc.name as category
       FROM menu_items mi
       JOIN menu_categories mc ON mi.category_id = mc.id
       WHERE mi.name = ANY($1)`,
      [cartItemNames]
    );

    const categoryMap = new Map(cartWithCategories.rows.map(r => [r.name, r.category]));

    // Get time of day
    const hour = new Date().getHours();
    let timeOfDay = 'afternoon';
    if (hour < 11) timeOfDay = 'morning';
    else if (hour < 14) timeOfDay = 'lunch';
    else if (hour < 17) timeOfDay = 'afternoon';
    else timeOfDay = 'evening';

    // Call AI recommendations
    const recommendations = await getUpsellRecommendations({
      cartItems: cartItems.map((i: any) => ({
        ...i,
        category: categoryMap.get(i.name),
      })),
      menuItems: menuResult.rows.map(r => ({
        id: r.id,
        name: r.name,
        price: parseFloat(r.price),
        category: r.category || 'Other',
        description: r.description,
      })),
      timeOfDay,
    });

    await client.query('BEGIN');

    // Save recommendations to database
    await client.query(
      `INSERT INTO upsell_recommendations
       (restaurant_id, cart_id, user_id, cart_items, recommended_items, confidence)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [restaurantId, cartId, req.user?.id,
       JSON.stringify(cartItems),
       JSON.stringify(recommendations.recommendations),
       recommendations.totalConfidence]
    );

    await client.query('COMMIT');

    // Get full item details for recommendations
    const recommendedIds = recommendations.recommendations.map(r => r.itemId);
    const itemDetails = await query(
      `SELECT id, name, price, description, image_url
       FROM menu_items
       WHERE id = ANY($1)`,
      [recommendedIds]
    );

    const itemMap = new Map(itemDetails.rows.map(r => [r.id, r]));

    res.json({
      recommendations: recommendations.recommendations.map(rec => ({
        ...rec,
        item: itemMap.get(rec.itemId) ? {
          id: itemMap.get(rec.itemId).id,
          name: itemMap.get(rec.itemId).name,
          price: parseFloat(itemMap.get(rec.itemId).price),
          description: itemMap.get(rec.itemId).description,
          imageUrl: itemMap.get(rec.itemId).image_url,
        } : null,
      })),
      totalConfidence: recommendations.totalConfidence,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Get upsell recommendations error:', error);
    res.status(500).json({ error: 'Failed to get upsell recommendations' });
  } finally {
    client.release();
  }
};

// Record upsell acceptance
export const recordUpsellAcceptance = async (req: AuthRequest, res: Response) => {
  try {
    const { recommendationId, acceptedItemId, wasAccepted } = req.body;

    const result = await query(
      `UPDATE upsell_recommendations
       SET was_accepted = $1, accepted_item_id = $2
       WHERE id = $3
       RETURNING id`,
      [wasAccepted, acceptedItemId, recommendationId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recommendation not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Record upsell acceptance error:', error);
    res.status(500).json({ error: 'Failed to record upsell acceptance' });
  }
};

// Get wait time prediction history
export const getWaitTimePredictions = async (req: AuthRequest, res: Response) => {
  try {
    const { restaurantId: rawRid, limit = 50, offset = 0 } = req.query;
    const restaurantId = rawRid ? await resolveRestaurantId(rawRid as string) : null;

    let result;
    if (restaurantId) {
      result = await query(
        `SELECT wtp.*, o.order_number
         FROM wait_time_predictions wtp
         LEFT JOIN orders o ON wtp.order_id = o.id
         WHERE wtp.restaurant_id = $1
         ORDER BY wtp.created_at DESC
         LIMIT $2 OFFSET $3`,
        [restaurantId, parseInt(limit as string), parseInt(offset as string)]
      );
    } else {
      result = await query(
        `SELECT wtp.*, o.order_number
         FROM wait_time_predictions wtp
         LEFT JOIN orders o ON wtp.order_id = o.id
         ORDER BY wtp.created_at DESC
         LIMIT $1 OFFSET $2`,
        [parseInt(limit as string), parseInt(offset as string)]
      );
    }

    const predictions = result.rows.map(row => ({
      id: row.id,
      restaurantId: row.restaurant_id,
      orderId: row.order_id,
      orderNumber: row.order_number,
      predictedMinutes: row.predicted_minutes,
      actualMinutes: row.actual_minutes,
      orderItemsCount: row.order_items_count,
      currentQueueSize: row.current_queue_size,
      timeOfDay: row.time_of_day,
      dayOfWeek: row.day_of_week,
      confidence: row.confidence ? parseFloat(row.confidence) : null,
      factors: row.factors,
      createdAt: row.created_at,
    }));

    res.json({ predictions });
  } catch (error) {
    console.error('Get wait time predictions error:', error);
    res.status(500).json({ error: 'Failed to fetch wait time predictions' });
  }
};

// Get upsell recommendations history
export const getUpsellHistory = async (req: AuthRequest, res: Response) => {
  try {
    const { restaurantId: rawRid2, limit = 50, offset = 0 } = req.query;
    const restaurantId = rawRid2 ? await resolveRestaurantId(rawRid2 as string) : null;

    let result;
    if (restaurantId) {
      result = await query(
        `SELECT ur.*, u.first_name, u.last_name
         FROM upsell_recommendations ur
         LEFT JOIN users u ON ur.user_id = u.id
         WHERE ur.restaurant_id = $1
         ORDER BY ur.created_at DESC
         LIMIT $2 OFFSET $3`,
        [restaurantId, parseInt(limit as string), parseInt(offset as string)]
      );
    } else {
      result = await query(
        `SELECT ur.*, u.first_name, u.last_name
         FROM upsell_recommendations ur
         LEFT JOIN users u ON ur.user_id = u.id
         ORDER BY ur.created_at DESC
         LIMIT $1 OFFSET $2`,
        [parseInt(limit as string), parseInt(offset as string)]
      );
    }

    const recommendations = result.rows.map(row => ({
      id: row.id,
      restaurantId: row.restaurant_id,
      cartId: row.cart_id,
      userId: row.user_id,
      userName: row.first_name ? `${row.first_name} ${row.last_name}` : null,
      cartItems: row.cart_items,
      recommendedItems: row.recommended_items,
      recommendationReason: row.recommendation_reason,
      confidence: row.confidence ? parseFloat(row.confidence) : null,
      wasAccepted: row.was_accepted,
      acceptedItemId: row.accepted_item_id,
      createdAt: row.created_at,
    }));

    res.json({ recommendations });
  } catch (error) {
    console.error('Get upsell history error:', error);
    res.status(500).json({ error: 'Failed to fetch upsell history' });
  }
};

// Delete a wait time prediction
export const deleteWaitTimePrediction = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(
      'DELETE FROM wait_time_predictions WHERE id = $1 RETURNING id',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Prediction not found' });
    }
    res.json({ message: 'Prediction deleted successfully' });
  } catch (error) {
    console.error('Delete wait time prediction error:', error);
    res.status(500).json({ error: 'Failed to delete prediction' });
  }
};

// Bulk delete wait time predictions
export const bulkDeleteWaitTimePredictions = async (req: AuthRequest, res: Response) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids array is required' });
    }
    const result = await query(
      'DELETE FROM wait_time_predictions WHERE id = ANY($1) RETURNING id',
      [ids]
    );
    res.json({ message: `${result.rows.length} predictions deleted`, deletedCount: result.rows.length });
  } catch (error) {
    console.error('Bulk delete wait time predictions error:', error);
    res.status(500).json({ error: 'Failed to bulk delete predictions' });
  }
};

// Delete an upsell recommendation
export const deleteUpsellRecommendation = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(
      'DELETE FROM upsell_recommendations WHERE id = $1 RETURNING id',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recommendation not found' });
    }
    res.json({ message: 'Recommendation deleted successfully' });
  } catch (error) {
    console.error('Delete upsell recommendation error:', error);
    res.status(500).json({ error: 'Failed to delete recommendation' });
  }
};

// Bulk delete upsell recommendations
export const bulkDeleteUpsellRecommendations = async (req: AuthRequest, res: Response) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids array is required' });
    }
    const result = await query(
      'DELETE FROM upsell_recommendations WHERE id = ANY($1) RETURNING id',
      [ids]
    );
    res.json({ message: `${result.rows.length} recommendations deleted`, deletedCount: result.rows.length });
  } catch (error) {
    console.error('Bulk delete upsell recommendations error:', error);
    res.status(500).json({ error: 'Failed to bulk delete recommendations' });
  }
};

// Update actual wait time (for tracking accuracy)
export const updateActualWaitTime = async (req: AuthRequest, res: Response) => {
  try {
    const { predictionId, actualMinutes } = req.body;

    const result = await query(
      `UPDATE wait_time_predictions
       SET actual_minutes = $1
       WHERE id = $2
       RETURNING id`,
      [actualMinutes, predictionId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Prediction not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Update actual wait time error:', error);
    res.status(500).json({ error: 'Failed to update actual wait time' });
  }
};
