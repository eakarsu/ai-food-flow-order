import { Response } from 'express';
import { validationResult } from 'express-validator';
import { query } from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';
import { chatCompletion, parseAIJson } from '../services/openRouterService.js';

// POST /api/ai/dynamic-pricing
// Takes { menuItemId, currentQueueSize, timeOfDay } and returns an AI-suggested
// price modifier (surge/discount %) with reasoning. Persists the suggestion to DB.
export const getDynamicPricing = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { menuItemId, currentQueueSize, timeOfDay } = req.body;

    // Fetch menu item details
    const itemResult = await query(
      `SELECT id, name, price, category_id FROM menu_items WHERE id = $1`,
      [menuItemId]
    );

    if (itemResult.rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    const item = itemResult.rows[0];

    // Fetch recent order velocity (last 30 min)
    const velocityResult = await query(
      `SELECT COUNT(*) as recent_orders
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE oi.menu_item_id = $1
         AND o.created_at >= NOW() - INTERVAL '30 minutes'`,
      [menuItemId]
    );
    const recentOrders = parseInt(velocityResult.rows[0]?.recent_orders) || 0;

    const prompt = `You are a dynamic pricing AI for a restaurant ordering system.
Determine whether to apply a price surge or discount for the following item:

ITEM: ${item.name} (base price: $${parseFloat(item.price).toFixed(2)})
CURRENT QUEUE SIZE: ${currentQueueSize} orders
TIME OF DAY: ${timeOfDay}
ORDERS OF THIS ITEM IN LAST 30 MIN: ${recentOrders}

Rules:
- High queue (>10) + peak hours → surge up to +20%
- Low demand (0-1 orders in 30 min) + off-peak → discount up to -15%
- Normal conditions → 0% modifier
- Never exceed +25% surge or -20% discount

Respond with ONLY a JSON object:
{
  "modifierPercent": number (negative for discount, positive for surge, 0 for none),
  "direction": "surge" | "discount" | "none",
  "suggestedPrice": number,
  "reasoning": "1-2 sentence explanation of why this modifier was chosen",
  "confidence": 0.5-1.0
}`;

    const response = await chatCompletion(
      [
        { role: 'system', content: 'You are a restaurant dynamic pricing AI. Always respond with raw JSON only.' },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.3, maxTokens: 400 }
    );

    let suggestion: any;
    try {
      const parsed = parseAIJson(response);
      if (parsed) { suggestion = parsed; } else { throw new Error('null'); }
    } catch {
      suggestion = {
        modifierPercent: 0,
        direction: 'none',
        suggestedPrice: parseFloat(item.price),
        reasoning: 'Could not compute dynamic modifier; keeping base price.',
        confidence: 0.5,
      };
    }

    suggestion.suggestedPrice = parseFloat(item.price) * (1 + suggestion.modifierPercent / 100);

    // Persist to ai_results table
    try {
      await query(
        `INSERT INTO ai_results
         (endpoint, input_data, output_data, model_used, created_by)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          'dynamic-pricing',
          JSON.stringify({ menuItemId, currentQueueSize, timeOfDay }),
          JSON.stringify(suggestion),
          process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022',
          req.user!.id,
        ]
      );
    } catch {
      console.warn('ai_results table not found; skipping persistence.');
    }
    // Also persist to dynamic_pricing_suggestions if table exists
    try {
      await query(
        `INSERT INTO dynamic_pricing_suggestions
         (menu_item_id, base_price, modifier_percent, suggested_price, direction, reasoning, confidence, queue_size, time_of_day, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          menuItemId,
          item.price,
          suggestion.modifierPercent,
          suggestion.suggestedPrice.toFixed(2),
          suggestion.direction,
          suggestion.reasoning,
          suggestion.confidence,
          currentQueueSize,
          timeOfDay,
          req.user!.id,
        ]
      );
    } catch {
      console.warn('dynamic_pricing_suggestions table not found; skipping.');
    }

    res.json({
      menuItemId,
      itemName: item.name,
      basePrice: parseFloat(item.price),
      modifierPercent: suggestion.modifierPercent,
      direction: suggestion.direction,
      suggestedPrice: parseFloat(suggestion.suggestedPrice.toFixed(2)),
      reasoning: suggestion.reasoning,
      confidence: suggestion.confidence,
      context: { currentQueueSize, timeOfDay, recentOrders },
    });
  } catch (error) {
    console.error('Dynamic pricing error:', error);
    res.status(500).json({ error: 'Failed to compute dynamic pricing' });
  }
};

// POST /api/ai/personalized-recommendations
// Takes { userId }, looks up order history from DB, generates personalized
// item suggestions using OpenRouter.
export const getPersonalizedRecommendations = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId } = req.body;
    const requestingUserId = req.user!.id;

    // Fetch order history for user
    const historyResult = await query(
      `SELECT oi.name, oi.quantity, mc.name as category, COUNT(*) as order_count
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
       LEFT JOIN menu_categories mc ON mi.category_id = mc.id
       WHERE o.user_id = $1
       GROUP BY oi.name, oi.quantity, mc.name
       ORDER BY order_count DESC
       LIMIT 20`,
      [userId || requestingUserId]
    );

    if (historyResult.rows.length === 0) {
      return res.json({
        userId: userId || requestingUserId,
        recommendations: [],
        message: 'No order history found. Place some orders to get personalized recommendations!',
      });
    }

    // Fetch available menu items to recommend from
    const menuResult = await query(
      `SELECT mi.id, mi.name, mi.price, mc.name as category, mi.description
       FROM menu_items mi
       LEFT JOIN menu_categories mc ON mi.category_id = mc.id
       WHERE mi.is_available = true
       LIMIT 40`
    );

    const orderHistory = historyResult.rows
      .map(r => `- ${r.name} (${r.category || 'Unknown category'}) — ordered ${r.order_count} times`)
      .join('\n');

    const availableItems = menuResult.rows
      .filter(mi => !historyResult.rows.some(h => h.name === mi.name))
      .slice(0, 25)
      .map(mi => `- ID: ${mi.id} | ${mi.name} ($${parseFloat(mi.price).toFixed(2)}) — ${mi.category}${mi.description ? `: ${mi.description}` : ''}`)
      .join('\n');

    const prompt = `You are a personalized food recommendation AI for OrderlyBite Deli & Cafe.

USER ORDER HISTORY (most frequent first):
${orderHistory}

AVAILABLE ITEMS TO RECOMMEND (not in history):
${availableItems}

Based on the user's order history patterns, suggest 3-5 items they would love.

Respond with ONLY a JSON object:
{
  "recommendations": [
    {
      "itemId": "exact ID from available items list",
      "itemName": "exact name",
      "reason": "personalized 1-2 sentence reason based on their order patterns",
      "confidence": 0.6-0.95,
      "category": "category name"
    }
  ],
  "tasteProfile": "1-2 sentence summary of the user's taste preferences based on their history"
}`;

    const response = await chatCompletion(
      [
        { role: 'system', content: 'You are a personalized restaurant recommendation AI. Always respond with raw JSON only.' },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.5, maxTokens: 800 }
    );

    let result: any;
    try {
      const parsed = parseAIJson(response);
      if (parsed) { result = parsed; } else { throw new Error('null'); }
    } catch {
      result = {
        recommendations: menuResult.rows.slice(0, 3).map(mi => ({
          itemId: mi.id,
          itemName: mi.name,
          reason: `Based on your order history, you might enjoy this ${mi.category} item.`,
          confidence: 0.65,
          category: mi.category,
        })),
        tasteProfile: 'You enjoy a variety of menu items.',
      };
    }

    // Persist result to ai_results
    try {
      await query(
        `INSERT INTO ai_results (endpoint, input_data, output_data, model_used, created_by)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          'personalized-recommendations',
          JSON.stringify({ userId: userId || requestingUserId, orderHistoryCount: historyResult.rows.length }),
          JSON.stringify(result),
          process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022',
          requestingUserId,
        ]
      );
    } catch { /* table may not exist yet */ }

    res.json({
      userId: userId || requestingUserId,
      tasteProfile: result.tasteProfile,
      recommendations: result.recommendations || [],
      basedOnOrders: historyResult.rows.length,
    });
  } catch (error) {
    console.error('Personalized recommendations error:', error);
    res.status(500).json({ error: 'Failed to generate personalized recommendations' });
  }
};
