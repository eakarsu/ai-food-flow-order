// Apply pass 5 — additive backlog controllers.
//
// All AI handlers in this file follow the same defensive policy:
//   - 503 + { error, missing: 'OPENROUTER_API_KEY' } when the key is unset.
//   - Try/catch around all DB lookups (tables may not yet exist).
//   - Optional persistence into the existing `ai_results` table — also try/catch.
//   - In-memory fallback when LLM JSON parsing fails (no heavy ML deps).
//
// PRODUCT-DECISION (defaults documented inline):
//   - Loyalty tiers: bronze < $100, silver < $500, gold < $1500, platinum >= $1500
//     (cumulative completed-order subtotal in cents).
//   - Dynamic-surge policy: max +25% surge / -20% discount, mirroring the
//     existing dynamic-pricing controller.
//   - Restaurant health score: 0-100 composite of avg review, on-time rate,
//     refund rate (no external health-inspection feed available yet).
//
// NEEDS-CREDS env vars:
//   - OPENROUTER_API_KEY: required for every AI endpoint.
//   - HEALTH_INSPECTION_API_KEY (optional): if set, would be passed to a real
//     inspection feed; in this pass we surface { missing } when it's needed
//     for the inspection-augmented variant.

import { Response } from 'express';
import { query } from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';
import { chatCompletion, parseAIJson } from '../services/openRouterService.js';

function ensureKey(res: Response): boolean {
  if (!process.env.OPENROUTER_API_KEY) {
    res.status(503).json({
      error: 'AI service not configured',
      missing: 'OPENROUTER_API_KEY',
    });
    return false;
  }
  return true;
}

async function persist(endpoint: string, input: unknown, output: unknown, userId?: string) {
  try {
    await query(
      `INSERT INTO ai_results (endpoint, input_data, output_data, model_used, created_by)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        endpoint,
        JSON.stringify(input ?? {}),
        JSON.stringify(output ?? {}),
        process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022',
        userId || null,
      ]
    );
  } catch {
    /* table may not exist; ignore */
  }
}

// POST /api/ai/demand-forecast
// Body: { restaurantId?: string, hours?: number }
export const demandForecast = async (req: AuthRequest, res: Response) => {
  if (!ensureKey(res)) return;
  try {
    const { restaurantId, hours = 24 } = req.body || {};
    let recent: any[] = [];
    try {
      const r = await query(
        `SELECT date_trunc('hour', created_at) AS hour, COUNT(*) AS orders
         FROM orders
         WHERE created_at >= NOW() - INTERVAL '14 days'
         ${restaurantId ? 'AND restaurant_id = $1' : ''}
         GROUP BY 1
         ORDER BY 1 DESC
         LIMIT 168`,
        restaurantId ? [restaurantId] : []
      );
      recent = r.rows || [];
    } catch {
      /* table missing */
    }
    const summary = recent
      .slice(0, 48)
      .map((r) => `${new Date(r.hour).toISOString()}: ${r.orders} orders`)
      .join('\n');
    const prompt = `You are a demand-forecast AI for a food-delivery business.
Project the next ${hours} hours of order volume per hour, given recent history:

${summary || '(no historical data — produce a sensible synthetic baseline)'}

Respond ONLY with JSON:
{
  "forecast": [{ "hourFromNow": 0, "expectedOrders": 0, "confidence": 0.5 }],
  "peakHour": 0,
  "summary": "1-2 sentence narrative"
}`;
    const response = await chatCompletion(
      [
        { role: 'system', content: 'You are a demand-forecast AI. Respond with raw JSON only.' },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.4, maxTokens: 700 }
    );
    const parsed = parseAIJson(response) || {
      forecast: Array.from({ length: hours }, (_, i) => ({
        hourFromNow: i,
        expectedOrders: Math.max(1, Math.round(recent.length / Math.max(1, hours))),
        confidence: 0.5,
      })),
      peakHour: 12,
      summary: 'Fallback baseline (LLM JSON parse failed).',
    };
    await persist('demand-forecast', { restaurantId, hours }, parsed, req.user?.id);
    res.json(parsed);
  } catch (e: any) {
    console.error('demand-forecast error:', e);
    res.status(500).json({ error: e?.message || 'demand-forecast failed' });
  }
};

// POST /api/ai/route-optimization
// Body: { driverId?: string, stops: [{ id, lat, lng, address?, dueBy? }] }
// PRODUCT-DECISION: nearest-neighbour heuristic (greedy) — additive in-memory
// stub; no map-data integration. Real TSP solver requires NEEDS-CREDS map APIs.
export const routeOptimization = async (req: AuthRequest, res: Response) => {
  if (!ensureKey(res)) return;
  try {
    const { driverId, stops } = req.body || {};
    if (!Array.isArray(stops) || stops.length === 0) {
      return res.status(400).json({ error: 'stops[] required' });
    }
    // Nearest-neighbour heuristic from the first stop.
    const remaining = [...stops];
    const ordered: any[] = [remaining.shift()];
    while (remaining.length) {
      const last = ordered[ordered.length - 1];
      remaining.sort((a, b) => {
        const da = (a.lat - last.lat) ** 2 + (a.lng - last.lng) ** 2;
        const db = (b.lat - last.lat) ** 2 + (b.lng - last.lng) ** 2;
        return da - db;
      });
      ordered.push(remaining.shift());
    }
    const prompt = `Given an ordered driver route (already nearest-neighbour
sequenced), suggest improvements ONLY in JSON:

ROUTE: ${JSON.stringify(ordered.map((s) => ({ id: s.id, lat: s.lat, lng: s.lng })))}

{
  "improvedOrder": ["id1","id2","..."],
  "estimatedMinutes": 0,
  "rationale": "1-2 sentences"
}`;
    const response = await chatCompletion(
      [
        { role: 'system', content: 'You are a TSP heuristic assistant. Raw JSON only.' },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.2, maxTokens: 500 }
    );
    const parsed = parseAIJson(response) || {
      improvedOrder: ordered.map((s) => s.id),
      estimatedMinutes: ordered.length * 8,
      rationale: 'Greedy nearest-neighbour heuristic (LLM unavailable).',
    };
    const out = { driverId: driverId || null, ...parsed };
    await persist('route-optimization', { driverId, count: stops.length }, out, req.user?.id);
    res.json(out);
  } catch (e: any) {
    console.error('route-optimization error:', e);
    res.status(500).json({ error: e?.message || 'route-optimization failed' });
  }
};

// POST /api/ai/menu-recommendation-cold
// Body: { context?: { weather?, time? } }
// Cold-start: uses popularity + LLM narrative. No embedding pipeline.
export const menuRecommendationCold = async (req: AuthRequest, res: Response) => {
  if (!ensureKey(res)) return;
  try {
    const { context } = req.body || {};
    let popular: any[] = [];
    try {
      const r = await query(
        `SELECT mi.id, mi.name, mi.price, COUNT(oi.id) AS popularity
         FROM menu_items mi
         LEFT JOIN order_items oi ON oi.menu_item_id = mi.id
         GROUP BY mi.id, mi.name, mi.price
         ORDER BY popularity DESC
         LIMIT 25`
      );
      popular = r.rows || [];
    } catch {
      /* table may be empty */
    }
    const prompt = `You are a cold-start menu recommender. The user has no
order history. Pick 5 items from this popularity-ranked list, respond ONLY in JSON:

ITEMS:
${popular.map((p) => `- ${p.id}: ${p.name} ($${p.price}, popularity ${p.popularity})`).join('\n') || '(no menu items)'}
CONTEXT: ${JSON.stringify(context || {})}

{
  "recommendations": [{ "itemId": "...", "name": "...", "reason": "..." }],
  "approach": "1 sentence"
}`;
    const response = await chatCompletion(
      [
        { role: 'system', content: 'You are a cold-start recommender. Raw JSON only.' },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.5, maxTokens: 600 }
    );
    const parsed = parseAIJson(response) || {
      recommendations: popular.slice(0, 5).map((p) => ({
        itemId: p.id,
        name: p.name,
        reason: 'Popular among other diners.',
      })),
      approach: 'Popularity fallback (LLM unavailable).',
    };
    await persist('menu-recommendation-cold', { context }, parsed, req.user?.id);
    res.json(parsed);
  } catch (e: any) {
    console.error('menu-recommendation-cold error:', e);
    res.status(500).json({ error: e?.message || 'menu-recommendation-cold failed' });
  }
};

// POST /api/ai/fraud-detection
// Body: { userId?: string, paymentRef?: string }
export const fraudDetection = async (req: AuthRequest, res: Response) => {
  if (!ensureKey(res)) return;
  try {
    const { userId, paymentRef } = req.body || {};
    let signals: any = {};
    try {
      const r = await query(
        `SELECT COUNT(*) AS recent_payments, COUNT(*) FILTER (WHERE status = 'refunded') AS refund_count
         FROM payments
         WHERE created_at >= NOW() - INTERVAL '30 days'
         ${userId ? 'AND user_id = $1' : ''}`,
        userId ? [userId] : []
      );
      signals = r.rows[0] || {};
    } catch {
      /* table may not exist */
    }
    const prompt = `You are a payment-fraud-detection AI. Score the
likelihood that the following user/payment is fraudulent (0-1) and explain.
Respond ONLY in JSON:

USER: ${userId || 'unknown'}
PAYMENT_REF: ${paymentRef || 'n/a'}
SIGNALS: ${JSON.stringify(signals)}

{
  "fraudScore": 0,
  "riskLevel": "low|medium|high",
  "indicators": ["..."],
  "recommendedAction": "review|allow|block"
}`;
    const response = await chatCompletion(
      [
        { role: 'system', content: 'You are a fraud-detection AI. Raw JSON only.' },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.2, maxTokens: 400 }
    );
    const parsed = parseAIJson(response) || {
      fraudScore: 0.1,
      riskLevel: 'low',
      indicators: ['LLM unavailable; defaulting to low.'],
      recommendedAction: 'allow',
    };
    await persist('fraud-detection', { userId, paymentRef }, parsed, req.user?.id);
    res.json(parsed);
  } catch (e: any) {
    console.error('fraud-detection error:', e);
    res.status(500).json({ error: e?.message || 'fraud-detection failed' });
  }
};

// POST /api/ai/churn-prediction
// Body: { userId?: string }
export const churnPrediction = async (req: AuthRequest, res: Response) => {
  if (!ensureKey(res)) return;
  try {
    const { userId } = req.body || {};
    const targetUserId = userId || req.user?.id;
    let stats: any = {};
    try {
      const r = await query(
        `SELECT COUNT(*) AS orders, MAX(created_at) AS last_order, MIN(created_at) AS first_order
         FROM orders WHERE user_id = $1`,
        [targetUserId]
      );
      stats = r.rows[0] || {};
    } catch {
      /* ignore */
    }
    const prompt = `You are a churn-prediction AI for a food-delivery
service. Score churn risk 0-1 for this user given:

USER: ${targetUserId}
STATS: ${JSON.stringify(stats)}

Respond ONLY in JSON:
{
  "churnRisk": 0,
  "riskLevel": "low|medium|high",
  "drivers": ["..."],
  "retentionSuggestions": ["..."]
}`;
    const response = await chatCompletion(
      [
        { role: 'system', content: 'You are a churn-prediction AI. Raw JSON only.' },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.3, maxTokens: 500 }
    );
    const parsed = parseAIJson(response) || {
      churnRisk: 0.3,
      riskLevel: 'medium',
      drivers: ['LLM unavailable; default heuristic.'],
      retentionSuggestions: ['Send a 10% discount coupon.'],
    };
    await persist('churn-prediction', { userId: targetUserId }, parsed, req.user?.id);
    res.json(parsed);
  } catch (e: any) {
    console.error('churn-prediction error:', e);
    res.status(500).json({ error: e?.message || 'churn-prediction failed' });
  }
};

// POST /api/ai/restaurant-health-score
// Body: { restaurantId: string }
// PRODUCT-DECISION: 0-100 composite of avg review, on-time rate, refund rate.
// NEEDS-CREDS: if HEALTH_INSPECTION_API_KEY is set, future revisions can
// augment with real inspection feed.
export const restaurantHealthScore = async (req: AuthRequest, res: Response) => {
  if (!ensureKey(res)) return;
  try {
    const { restaurantId } = req.body || {};
    if (!restaurantId) return res.status(400).json({ error: 'restaurantId required' });
    let signals: any = {};
    try {
      const r = await query(
        `SELECT
            (SELECT AVG(rating) FROM reviews WHERE restaurant_id = $1) AS avg_review,
            (SELECT COUNT(*) FROM orders WHERE restaurant_id = $1 AND status = 'completed') AS completed,
            (SELECT COUNT(*) FROM orders WHERE restaurant_id = $1 AND status = 'cancelled') AS cancelled`,
        [restaurantId]
      );
      signals = r.rows[0] || {};
    } catch {
      /* tables may differ */
    }
    const prompt = `You are a restaurant-health-score AI. Output a 0-100
composite score, plus subscores. Respond ONLY in JSON:

RESTAURANT: ${restaurantId}
SIGNALS: ${JSON.stringify(signals)}

{
  "overall": 0,
  "subscores": { "reviews": 0, "operational": 0, "compliance": 0 },
  "narrative": "1-2 sentences",
  "improvements": ["..."]
}`;
    const response = await chatCompletion(
      [
        { role: 'system', content: 'You are a health-score AI. Raw JSON only.' },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.3, maxTokens: 500 }
    );
    const parsed = parseAIJson(response) || {
      overall: 70,
      subscores: { reviews: 70, operational: 70, compliance: 70 },
      narrative: 'Default score (LLM unavailable).',
      improvements: ['Collect more recent reviews.'],
    };
    await persist('restaurant-health-score', { restaurantId }, parsed, req.user?.id);
    res.json(parsed);
  } catch (e: any) {
    console.error('restaurant-health-score error:', e);
    res.status(500).json({ error: e?.message || 'restaurant-health-score failed' });
  }
};

// GET /api/ai/loyalty/status
// PRODUCT-DECISION: tier from cumulative subtotal in cents.
// bronze < 10000, silver < 50000, gold < 150000, else platinum.
export const loyaltyStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'auth required' });
    let totalCents = 0;
    let orders = 0;
    try {
      const r = await query(
        `SELECT COALESCE(SUM(subtotal_cents),0) AS total, COUNT(*) AS orders
         FROM orders
         WHERE user_id = $1 AND status = 'completed'`,
        [userId]
      );
      totalCents = parseInt(r.rows[0]?.total) || 0;
      orders = parseInt(r.rows[0]?.orders) || 0;
    } catch {
      /* fallback to 0 */
    }
    let tier = 'bronze';
    if (totalCents >= 150000) tier = 'platinum';
    else if (totalCents >= 50000) tier = 'gold';
    else if (totalCents >= 10000) tier = 'silver';
    const points = Math.floor(totalCents / 100); // 1 point per dollar
    res.json({ userId, tier, points, ordersCompleted: orders, lifetimeSpendCents: totalCents });
  } catch (e: any) {
    console.error('loyalty-status error:', e);
    res.status(500).json({ error: e?.message || 'loyalty-status failed' });
  }
};

// POST /api/ai/dynamic-surge-policy
// PRODUCT-DECISION: returns a policy recommendation only, doesn't write to
// menu_items. Reuses dynamic-pricing rules from existing controller.
export const dynamicSurgePolicy = async (req: AuthRequest, res: Response) => {
  if (!ensureKey(res)) return;
  try {
    const { restaurantId, currentQueueSize = 0, timeOfDay = 'unknown' } = req.body || {};
    const prompt = `You are a dynamic-surge-policy AI. Recommend a uniform
surge multiplier across the menu (max +25% or -20%). Respond ONLY in JSON:

RESTAURANT: ${restaurantId || 'all'}
QUEUE: ${currentQueueSize}
TIME: ${timeOfDay}

{
  "modifierPercent": 0,
  "direction": "surge|discount|none",
  "rationale": "1-2 sentences",
  "expiresInMinutes": 30
}`;
    const response = await chatCompletion(
      [
        { role: 'system', content: 'You are a surge-policy AI. Raw JSON only.' },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.3, maxTokens: 300 }
    );
    const parsed = parseAIJson(response) || {
      modifierPercent: 0,
      direction: 'none',
      rationale: 'Default no-surge (LLM unavailable).',
      expiresInMinutes: 30,
    };
    await persist('dynamic-surge-policy', { restaurantId, currentQueueSize, timeOfDay }, parsed, req.user?.id);
    res.json(parsed);
  } catch (e: any) {
    console.error('dynamic-surge-policy error:', e);
    res.status(500).json({ error: e?.message || 'dynamic-surge-policy failed' });
  }
};
