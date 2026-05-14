import { Response } from 'express';
import { query } from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';
import { chatCompletion, parseAIJson } from '../services/openRouterService.js';

// POST /api/sustainability/calculate
export const calculateSustainability = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId, items, deliveryDistanceKm, packagingType } = req.body;
    const userId = req.user?.id;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items array is required' });
    }

    const packaging = packagingType || 'compostable';
    const distance = parseFloat(deliveryDistanceKm) || 0;

    const prompt = `You are a food sustainability scoring AI. Calculate the environmental impact of this food order.

ORDER ITEMS:
${items.map((i: any) => `- ${i.quantity}x ${i.name} (category: ${i.category || 'unknown'})`).join('\n')}

DELIVERY: ${distance} km distance
PACKAGING: ${packaging} (plastic=worst, compostable=medium, reusable=best)

Calculate carbon footprint and sustainability score. Consider:
- Food category emissions: meat (high CO2), dairy (medium), vegetable/plant (low), drinks (low)
- Delivery emissions: ~0.21 kg CO2/km for motorcycle
- Packaging: plastic=0.3kg, compostable=0.1kg, reusable=0.02kg extra CO2

Respond with ONLY a JSON object:
{
  "totalCo2Kg": number (total carbon footprint),
  "ingredientScore": 0-100 (higher = more sustainable ingredients),
  "deliveryScore": 0-100 (higher = less delivery emissions),
  "packagingScore": 0-100 (plastic=30, compostable=70, reusable=100),
  "overallScore": 0-100 (weighted average),
  "rating": "A" | "B" | "C" | "D" | "F",
  "loyaltyPointsEarned": number (0-50, more for sustainable choices),
  "suggestions": ["specific suggestion 1", "suggestion 2", "suggestion 3"],
  "breakdown": {
    "ingredientsCo2": number,
    "deliveryCo2": number,
    "packagingCo2": number
  }
}

Rating scale: A=80+, B=65-79, C=50-64, D=35-49, F=below 35`;

    const startTime = Date.now();
    const aiResponse = await chatCompletion(
      [
        { role: 'system', content: 'You are a food sustainability analyst AI. Always respond with raw JSON only.' },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.2, maxTokens: 800 }
    );
    const latencyMs = Date.now() - startTime;

    let result: any = parseAIJson(aiResponse);

    if (!result) {
      // Compute a fallback score
      const meatItems = items.filter((i: any) => (i.category || '').toLowerCase().includes('meat') || (i.name || '').toLowerCase().match(/burger|chicken|beef|pork|steak|salmon|fish/i));
      const meatWeight = meatItems.length / items.length;
      const ingredientScore = Math.round(100 - meatWeight * 60);
      const deliveryScore = Math.max(0, Math.round(100 - distance * 5));
      const packagingScore = packaging === 'reusable' ? 100 : packaging === 'compostable' ? 70 : 30;
      const overallScore = Math.round((ingredientScore * 0.5 + deliveryScore * 0.3 + packagingScore * 0.2));
      const totalCo2 = parseFloat(((meatItems.length * 2.5 + (items.length - meatItems.length) * 0.5) + distance * 0.21 + (packaging === 'plastic' ? 0.3 : packaging === 'compostable' ? 0.1 : 0.02)).toFixed(3));
      const rating = overallScore >= 80 ? 'A' : overallScore >= 65 ? 'B' : overallScore >= 50 ? 'C' : overallScore >= 35 ? 'D' : 'F';

      result = {
        totalCo2Kg: totalCo2,
        ingredientScore,
        deliveryScore,
        packagingScore,
        overallScore,
        rating,
        loyaltyPointsEarned: Math.round(overallScore / 5),
        suggestions: [
          ...(meatWeight > 0.5 ? ['Consider substituting some meat items with plant-based options to reduce CO2 by up to 60%'] : []),
          ...(distance > 5 ? ['Order from closer restaurants to reduce delivery emissions'] : []),
          ...(packaging === 'plastic' ? ['Switch to compostable or reusable packaging for big CO2 savings'] : []),
        ],
        breakdown: {
          ingredientsCo2: parseFloat((meatItems.length * 2.5 + (items.length - meatItems.length) * 0.5).toFixed(3)),
          deliveryCo2: parseFloat((distance * 0.21).toFixed(3)),
          packagingCo2: packaging === 'plastic' ? 0.3 : packaging === 'compostable' ? 0.1 : 0.02,
        },
      };
    }

    // Save to DB
    try {
      await query(
        `INSERT INTO sustainability_scores
         (order_id, user_id, items, delivery_distance_km, packaging_type,
          total_co2_kg, ingredient_score, delivery_score, packaging_score,
          overall_score, rating, loyalty_points_earned, suggestions)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          orderId || `CALC-${Date.now()}`,
          userId || null,
          JSON.stringify(items),
          distance,
          packaging,
          result.totalCo2Kg,
          result.ingredientScore,
          result.deliveryScore,
          result.packagingScore,
          result.overallScore,
          result.rating,
          result.loyaltyPointsEarned || 0,
          JSON.stringify(result.suggestions || []),
        ]
      );

      // Award loyalty points if user authenticated
      if (userId && result.loyaltyPointsEarned > 0) {
        await query(
          `INSERT INTO loyalty_points (user_id, points, reason, reference_type)
           VALUES ($1, $2, $3, $4)`,
          [userId, result.loyaltyPointsEarned, 'Eco-friendly order bonus', 'sustainability']
        );
      }
    } catch (e) {
      console.warn('Could not save sustainability score:', e);
    }

    // Persist to ai_results
    try {
      await query(
        `INSERT INTO ai_results (endpoint, input_data, output_data, model_used, latency_ms, created_by)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        ['sustainability-calculate', JSON.stringify({ orderId, items, deliveryDistanceKm, packagingType }),
         JSON.stringify(result), process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022', latencyMs, userId || null]
      );
    } catch { /* ignore */ }

    res.json({ orderId: orderId || `CALC-${Date.now()}`, ...result });
  } catch (error) {
    console.error('Calculate sustainability error:', error);
    res.status(500).json({ error: 'Failed to calculate sustainability score' });
  }
};

// GET /api/sustainability/history
export const getSustainabilityHistory = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const result = await query(
      `SELECT * FROM sustainability_scores
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user!.id, Number(limit), offset]
    );

    const countResult = await query(
      'SELECT COUNT(*) FROM sustainability_scores WHERE user_id = $1',
      [req.user!.id]
    );

    const total = parseInt(countResult.rows[0].count);

    res.json({
      scores: result.rows,
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    console.error('Get sustainability history error:', error);
    res.status(500).json({ error: 'Failed to get sustainability history' });
  }
};

// GET /api/sustainability/loyalty-points
export const getLoyaltyPoints = async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      'SELECT COALESCE(SUM(points), 0) as total FROM loyalty_points WHERE user_id = $1',
      [req.user!.id]
    );

    const historyResult = await query(
      `SELECT * FROM loyalty_points WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20`,
      [req.user!.id]
    );

    res.json({
      totalPoints: parseInt(result.rows[0].total),
      history: historyResult.rows,
    });
  } catch (error) {
    console.error('Get loyalty points error:', error);
    res.status(500).json({ error: 'Failed to get loyalty points' });
  }
};
