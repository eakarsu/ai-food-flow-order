import { Response } from 'express';
import { validationResult } from 'express-validator';
import { query } from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';
import { chatCompletion, parseAIJson } from '../services/openRouterService.js';

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// POST /api/group-order
export const createGroupOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { restaurantId: rawId, hostName } = req.body;
    const hostUserId = req.user!.id;
    const name = hostName || req.user!.email.split('@')[0];

    // Resolve restaurantId
    let restaurantId: string;
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (rawId && UUID_REGEX.test(rawId)) {
      restaurantId = rawId;
    } else {
      const rResult = await query('SELECT id FROM restaurants LIMIT 1');
      if (rResult.rows.length === 0) return res.status(400).json({ error: 'No restaurant found' });
      restaurantId = rResult.rows[0].id;
    }

    const inviteCode = generateInviteCode();
    const members = [{ userId: hostUserId, name }];

    const result = await query(
      `INSERT INTO group_orders
       (invite_code, restaurant_id, host_user_id, host_name, members)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [inviteCode, restaurantId, hostUserId, name, JSON.stringify(members)]
    );

    const row = result.rows[0];
    res.status(201).json({
      id: row.id,
      inviteCode: row.invite_code,
      restaurantId: row.restaurant_id,
      hostUserId: row.host_user_id,
      hostName: row.host_name,
      status: row.status,
      items: row.items || [],
      members: row.members || [],
      total: parseFloat(row.total_amount) || 0,
      expiresAt: row.expires_at,
      createdAt: row.created_at,
    });
  } catch (error) {
    console.error('Create group order error:', error);
    res.status(500).json({ error: 'Failed to create group order' });
  }
};

// POST /api/group-order/join
export const joinGroupOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { inviteCode, userName } = req.body;
    const userId = req.user!.id;
    const name = userName || req.user!.email.split('@')[0];

    if (!inviteCode) return res.status(400).json({ error: 'inviteCode is required' });

    const result = await query(
      `SELECT * FROM group_orders WHERE invite_code = $1 AND status = 'open' AND expires_at > NOW()`,
      [inviteCode.toUpperCase()]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Group order not found or expired' });
    }

    const group = result.rows[0];
    const members: any[] = group.members || [];

    // Check if already member
    if (!members.find(m => m.userId === userId)) {
      members.push({ userId, name });
      await query(
        'UPDATE group_orders SET members = $1, updated_at = NOW() WHERE id = $2',
        [JSON.stringify(members), group.id]
      );
    }

    res.json({
      id: group.id,
      inviteCode: group.invite_code,
      restaurantId: group.restaurant_id,
      hostName: group.host_name,
      status: group.status,
      items: group.items || [],
      members,
      total: parseFloat(group.total_amount) || 0,
    });
  } catch (error) {
    console.error('Join group order error:', error);
    res.status(500).json({ error: 'Failed to join group order' });
  }
};

// POST /api/group-order/:id/item
export const addGroupOrderItem = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, price, addedBy } = req.body;

    const result = await query(
      'SELECT * FROM group_orders WHERE id = $1 AND status = \'open\'',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Group order not found or closed' });
    }

    const group = result.rows[0];
    const items: any[] = group.items || [];
    items.push({ name, price: parseFloat(price) || 0, addedBy });
    const newTotal = items.reduce((sum: number, i: any) => sum + (i.price || 0), 0);

    await query(
      'UPDATE group_orders SET items = $1, total_amount = $2, updated_at = NOW() WHERE id = $3',
      [JSON.stringify(items), newTotal, id]
    );

    res.json({ items, total: newTotal });
  } catch (error) {
    console.error('Add group item error:', error);
    res.status(500).json({ error: 'Failed to add item to group order' });
  }
};

// GET /api/group-order/:id
export const getGroupOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM group_orders WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Group order not found' });

    const row = result.rows[0];
    res.json({
      id: row.id,
      inviteCode: row.invite_code,
      restaurantId: row.restaurant_id,
      hostName: row.host_name,
      status: row.status,
      items: row.items || [],
      members: row.members || [],
      total: parseFloat(row.total_amount) || 0,
      expiresAt: row.expires_at,
    });
  } catch (error) {
    console.error('Get group order error:', error);
    res.status(500).json({ error: 'Failed to get group order' });
  }
};

// POST /api/group-order/:id/recommendations
export const getGroupRecommendations = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query('SELECT * FROM group_orders WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Group order not found' });

    const group = result.rows[0];
    const items: any[] = group.items || [];
    const memberCount = (group.members || []).length;

    // Get available menu items
    const menuResult = await query(
      `SELECT mi.id, mi.name, mi.price, mc.name as category, mi.description
       FROM menu_items mi
       LEFT JOIN menu_categories mc ON mi.category_id = mc.id
       WHERE mi.is_available = true AND mi.restaurant_id = $1
       LIMIT 40`,
      [group.restaurant_id]
    );

    const currentItemNames = items.map((i: any) => i.name);
    const availableItems = menuResult.rows.filter(m => !currentItemNames.includes(m.name));

    const prompt = `A group of ${memberCount} people is ordering together. Current order:
${items.map((i: any) => `- ${i.name} ($${parseFloat(i.price).toFixed(2)})`).join('\n') || 'No items yet'}

Available items to suggest (not already ordered):
${availableItems.slice(0, 25).map(m => `- ID:${m.id} | ${m.name} ($${parseFloat(m.price).toFixed(2)}) [${m.category}]`).join('\n')}

Suggest 3-5 items that would complement this group order. Consider variety, sharing-friendly items, and dietary balance.

Respond with ONLY a JSON object:
{
  "items": [
    {
      "id": "menu item ID",
      "name": "item name",
      "price": number,
      "reason": "why this is a good group choice"
    }
  ]
}`;

    const aiResponse = await chatCompletion(
      [
        { role: 'system', content: 'You are a group dining recommendation AI. Always respond with raw JSON only.' },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.5, maxTokens: 600 }
    );

    const aiResult = parseAIJson(aiResponse);
    const recommendations = aiResult?.items || availableItems.slice(0, 4).map((m: any) => ({
      id: m.id,
      name: m.name,
      price: parseFloat(m.price),
      reason: `A great addition for a group of ${memberCount}`,
    }));

    res.json({ items: recommendations });
  } catch (error) {
    console.error('Group recommendations error:', error);
    res.status(500).json({ error: 'Failed to get group recommendations' });
  }
};

// POST /api/group-order/:id/split
export const splitGroupBill = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { method = 'equal' } = req.body;

    const result = await query('SELECT * FROM group_orders WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Group order not found' });

    const group = result.rows[0];
    const items: any[] = group.items || [];
    const members: any[] = group.members || [];
    const total = parseFloat(group.total_amount) || 0;

    let splits: any[];

    if (method === 'by_item') {
      // Split by who added each item
      const memberTotals: Record<string, number> = {};
      members.forEach((m: any) => { memberTotals[m.userId] = 0; });
      items.forEach((item: any) => {
        if (item.addedBy && memberTotals[item.addedBy] !== undefined) {
          memberTotals[item.addedBy] += item.price || 0;
        } else {
          // Distribute unattributed items equally
          const perMember = (item.price || 0) / members.length;
          members.forEach((m: any) => { memberTotals[m.userId] = (memberTotals[m.userId] || 0) + perMember; });
        }
      });
      splits = members.map((m: any) => ({
        userId: m.userId,
        name: m.name,
        amountOwed: parseFloat((memberTotals[m.userId] || 0).toFixed(2)),
      }));
    } else {
      // Equal split
      const perPerson = members.length > 0 ? total / members.length : total;
      splits = members.map((m: any) => ({
        userId: m.userId,
        name: m.name,
        amountOwed: parseFloat(perPerson.toFixed(2)),
      }));
    }

    res.json({ splits, total, method });
  } catch (error) {
    console.error('Split bill error:', error);
    res.status(500).json({ error: 'Failed to calculate bill split' });
  }
};
