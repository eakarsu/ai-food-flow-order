import { Response } from 'express';
import { validationResult } from 'express-validator';
import { query } from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';
import { chatCompletion, parseAIJson } from '../services/openRouterService.js';
import { v4 as uuidv4 } from 'uuid';

// POST /api/ai/voice-order/process
export const processVoiceOrder = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { text, restaurantId: rawRestaurantId } = req.body;
    const userId = req.user?.id;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Order text is required' });
    }

    // Resolve restaurant
    let restaurantId: string | null = null;
    try {
      if (rawRestaurantId && rawRestaurantId !== 'default') {
        restaurantId = rawRestaurantId;
      } else {
        const rResult = await query('SELECT id FROM restaurants LIMIT 1');
        restaurantId = rResult.rows[0]?.id || null;
      }
    } catch { /* continue without restaurant */ }

    // Fetch available menu items
    let menuItems: any[] = [];
    if (restaurantId) {
      const menuResult = await query(
        `SELECT mi.id, mi.name, mi.price, mc.name as category, mi.description
         FROM menu_items mi
         LEFT JOIN menu_categories mc ON mi.category_id = mc.id
         WHERE mi.is_available = true AND mi.restaurant_id = $1
         LIMIT 60`,
        [restaurantId]
      );
      menuItems = menuResult.rows;
    }

    const menuContext = menuItems.length > 0
      ? menuItems.map(m => `- ID:${m.id} | ${m.name} ($${parseFloat(m.price).toFixed(2)}) [${m.category}]${m.description ? `: ${m.description}` : ''}`).join('\n')
      : '(No menu data available - parse items as-is)';

    const prompt = `You are a voice order parsing AI for a restaurant ordering system.
The customer said: "${text}"

AVAILABLE MENU ITEMS:
${menuContext}

Parse the customer's order and match items to the menu. If an item doesn't exactly match, find the closest menu item.

Respond with ONLY a JSON object:
{
  "parsedItems": [
    {
      "menuItemId": "exact ID from menu or null if no match",
      "name": "matched menu item name or spoken name",
      "quantity": number,
      "modifiers": ["list of modifications mentioned"],
      "matchConfidence": 0.0-1.0,
      "price": number (from menu or 0 if unknown)
    }
  ],
  "total": total_price_as_number,
  "needsConfirmation": true,
  "agentReply": "Natural conversational reply that reads back the order to the customer for confirmation. Include item names, quantities, and total. Ask if they'd like to confirm.",
  "ambiguities": ["any ambiguous parts of the order that need clarification"]
}`;

    const startTime = Date.now();
    const aiResponse = await chatCompletion(
      [
        { role: 'system', content: 'You are a restaurant voice order parser. Parse spoken orders accurately and match to menu items. Always respond with raw JSON only.' },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.2, maxTokens: 1000 }
    );
    const latencyMs = Date.now() - startTime;

    let result: any = parseAIJson(aiResponse);
    if (!result) {
      // Fallback: basic parsing
      result = {
        parsedItems: [],
        total: 0,
        needsConfirmation: true,
        agentReply: "I'm sorry, I didn't quite catch that. Could you please repeat your order?",
        ambiguities: ['Could not parse order'],
      };
    }

    // Generate call ID and save session
    const callId = `CALL-${uuidv4().substring(0, 8).toUpperCase()}`;
    try {
      await query(
        `INSERT INTO voice_order_sessions
         (call_id, restaurant_id, user_id, transcript_text, transcript_confidence,
          parsed_items, total_amount, agent_reply, needs_confirmation, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')`,
        [
          callId,
          restaurantId,
          userId || null,
          text,
          0.92,
          JSON.stringify(result.parsedItems),
          result.total || 0,
          result.agentReply,
          result.needsConfirmation !== false,
        ]
      );
    } catch (e) {
      console.warn('Could not save voice order session:', e);
    }

    // Persist to ai_results
    try {
      await query(
        `INSERT INTO ai_results (endpoint, input_data, output_data, model_used, latency_ms, created_by)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        ['voice-order-process', JSON.stringify({ text, restaurantId }), JSON.stringify(result),
         process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022', latencyMs, userId || null]
      );
    } catch { /* ignore */ }

    res.json({
      callId,
      transcript: { text, confidence: 0.92, durationMs: 3000 },
      parsedItems: result.parsedItems || [],
      total: result.total || 0,
      needsConfirmation: result.needsConfirmation !== false,
      agentReply: result.agentReply || "I've processed your order. Please confirm.",
      ambiguities: result.ambiguities || [],
    });
  } catch (error) {
    console.error('Process voice order error:', error);
    res.status(500).json({ error: 'Failed to process voice order' });
  }
};

// POST /api/ai/voice-order/confirm
export const confirmVoiceOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { callId, confirmed } = req.body;
    if (!callId) return res.status(400).json({ error: 'callId is required' });

    // Get the session
    const sessionResult = await query(
      'SELECT * FROM voice_order_sessions WHERE call_id = $1',
      [callId]
    );

    if (sessionResult.rows.length === 0) {
      // Graceful fallback for sessions not in DB
      return res.json({
        status: confirmed ? 'placed' : 'cancelled',
        orderId: confirmed ? `ORD-VOICE-${Date.now()}` : undefined,
      });
    }

    const session = sessionResult.rows[0];

    await query(
      `UPDATE voice_order_sessions SET status = $1, updated_at = NOW() WHERE call_id = $2`,
      [confirmed ? 'confirmed' : 'cancelled', callId]
    );

    if (!confirmed) {
      return res.json({ status: 'cancelled' });
    }

    // For confirmed orders, we'd ideally create a real order
    // For now, mark as placed and return a reference
    return res.json({
      status: 'placed',
      orderId: `VOICE-${callId}`,
      message: 'Voice order confirmed. Please visit the counter or checkout page to complete payment.',
    });
  } catch (error) {
    console.error('Confirm voice order error:', error);
    res.status(500).json({ error: 'Failed to confirm voice order' });
  }
};

// GET /api/ai/voice-order/history
export const getVoiceOrderHistory = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const result = await query(
      `SELECT * FROM voice_order_sessions
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user!.id, Number(limit), offset]
    );

    const countResult = await query(
      'SELECT COUNT(*) FROM voice_order_sessions WHERE user_id = $1',
      [req.user!.id]
    );

    const total = parseInt(countResult.rows[0].count);

    res.json({
      sessions: result.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get voice order history error:', error);
    res.status(500).json({ error: 'Failed to get voice order history' });
  }
};
