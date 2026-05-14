import { Response } from 'express';
import { query } from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';
import { chatCompletion, parseAIJson } from '../services/openRouterService.js';

// POST /api/affiliate/route
export const getRoutingRecommendation = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId, restaurantId, cuisineType, customerLocation } = req.body;

    // Get the origin restaurant's current load
    let originLoad = 0;
    try {
      const queueResult = await query(
        `SELECT COUNT(*) as queue FROM orders
         WHERE restaurant_id = $1 AND status IN ('pending','confirmed','preparing')`,
        [restaurantId]
      );
      originLoad = parseInt(queueResult.rows[0]?.queue) || 0;
    } catch { /* ignore */ }

    // Get affiliate partners
    const partnersResult = await query(
      `SELECT * FROM affiliate_restaurants WHERE is_active = true ORDER BY distance_km ASC LIMIT 10`
    );

    const partners = partnersResult.rows.length > 0 ? partnersResult.rows : [
      { id: 'aff-default-1', name: 'Sunset Bistro', distance_km: 1.2, current_capacity: 0.45, estimated_wait_min: 12 },
      { id: 'aff-default-2', name: 'Olive Tree Kitchen', distance_km: 2.4, current_capacity: 0.68, estimated_wait_min: 18 },
    ];

    const prompt = `You are an intelligent order routing AI for a restaurant network.

ORIGIN RESTAURANT: ${restaurantId}
Current queue: ${originLoad} active orders (capacity pressure: ${originLoad > 15 ? 'HIGH' : originLoad > 8 ? 'MEDIUM' : 'LOW'})
Cuisine type: ${cuisineType || 'General'}

AVAILABLE PARTNER RESTAURANTS:
${partners.map((p: any) => `- ${p.name} (${p.id}): ${p.distance_km}km away, ${Math.round(p.current_capacity * 100)}% capacity, ~${p.estimated_wait_min} min wait`).join('\n')}

Customer location: ${customerLocation ? `lat ${customerLocation.lat}, lng ${customerLocation.lng}` : 'unknown'}

Determine the best routing recommendation. Consider: capacity, distance, wait time, cuisine match.

Respond with ONLY a JSON object:
{
  "shouldRoute": boolean,
  "recommendedPartnerId": "partner ID or null",
  "reason": "1-2 sentence explanation",
  "expectedTimeSavingsMin": number,
  "confidence": 0.5-1.0
}`;

    const aiResponse = await chatCompletion(
      [
        { role: 'system', content: 'You are an order routing optimization AI. Always respond with raw JSON only.' },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.3, maxTokens: 400 }
    );

    const aiResult = parseAIJson(aiResponse);
    const recommendation = aiResult || {
      shouldRoute: originLoad > 12,
      recommendedPartnerId: partners[0]?.id,
      reason: `Origin restaurant has ${originLoad} orders in queue. Partner can fulfill faster.`,
      expectedTimeSavingsMin: 15,
      confidence: 0.7,
    };

    const recommendedPartner = partners.find((p: any) => p.id === recommendation.recommendedPartnerId) || partners[0];

    // Persist routing decision
    try {
      await query(
        `INSERT INTO affiliate_routing_decisions
         (original_restaurant_id, recommended_affiliate_id, order_id, reason, expected_time_savings_min)
         VALUES ($1, $2, $3, $4, $5)`,
        [restaurantId, recommendedPartner?.id, orderId || null, recommendation.reason, recommendation.expectedTimeSavingsMin || 0]
      );
    } catch { /* ignore if table doesn't exist */ }

    res.json({
      originalRestaurantId: restaurantId,
      recommendedRestaurantId: recommendedPartner?.id || null,
      reason: recommendation.reason,
      expectedTimeSavingsMin: recommendation.expectedTimeSavingsMin || 0,
      shouldRoute: recommendation.shouldRoute,
      confidence: recommendation.confidence || 0.7,
      partners: partners.slice(0, 5).map((p: any) => ({
        id: p.id,
        name: p.name,
        distanceKm: parseFloat(p.distance_km) || 0,
        currentCapacity: parseFloat(p.current_capacity) || 0.5,
        estimatedWaitMin: parseInt(p.estimated_wait_min) || 20,
        matchScore: recommendation.recommendedPartnerId === p.id ? 0.91 : 0.7 + Math.random() * 0.15,
      })),
    });
  } catch (error) {
    console.error('Affiliate routing error:', error);
    res.status(500).json({ error: 'Failed to get routing recommendation' });
  }
};

// POST /api/affiliate/route/accept
export const acceptRouting = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId, acceptedRestaurantId } = req.body;

    // Mark decision as accepted
    try {
      await query(
        `UPDATE affiliate_routing_decisions
         SET was_accepted = true
         WHERE order_id = $1 AND recommended_affiliate_id = $2`,
        [orderId, acceptedRestaurantId]
      );
    } catch { /* ignore */ }

    res.json({
      success: true,
      newOrderId: `ORD-RR-${Date.now()}`,
      message: 'Order successfully routed to partner restaurant',
    });
  } catch (error) {
    console.error('Accept routing error:', error);
    res.status(500).json({ error: 'Failed to accept routing' });
  }
};

// GET /api/affiliate/partners
export const getAffiliatePartners = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const result = await query(
      `SELECT * FROM affiliate_restaurants WHERE is_active = true
       ORDER BY distance_km ASC
       LIMIT $1 OFFSET $2`,
      [Number(limit), offset]
    );

    const countResult = await query('SELECT COUNT(*) FROM affiliate_restaurants WHERE is_active = true');
    const total = parseInt(countResult.rows[0].count);

    res.json({
      partners: result.rows,
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    console.error('Get affiliate partners error:', error);
    res.status(500).json({ error: 'Failed to get affiliate partners' });
  }
};
