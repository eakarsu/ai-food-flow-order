import { Response } from 'express';
import { validationResult } from 'express-validator';
import { query } from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';

// POST /api/coupons/validate
export const validateCoupon = async (req: AuthRequest, res: Response) => {
  try {
    const { code, orderAmount, restaurantId } = req.body;
    if (!code) return res.status(400).json({ error: 'Coupon code is required' });

    const result = await query(
      `SELECT * FROM coupons
       WHERE code = UPPER($1)
         AND is_active = true
         AND (valid_from IS NULL OR valid_from <= NOW())
         AND (valid_until IS NULL OR valid_until >= NOW())
         AND (usage_limit IS NULL OR usage_count < usage_limit)
         AND (restaurant_id IS NULL OR restaurant_id = $2)`,
      [code.trim(), restaurantId || null]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invalid or expired coupon code' });
    }

    const coupon = result.rows[0];
    const orderAmt = parseFloat(orderAmount) || 0;

    if (coupon.min_order_amount && orderAmt < parseFloat(coupon.min_order_amount)) {
      return res.status(400).json({
        error: `Minimum order amount of $${parseFloat(coupon.min_order_amount).toFixed(2)} required for this coupon`,
      });
    }

    let discountAmount: number;
    if (coupon.discount_type === 'percent') {
      discountAmount = (orderAmt * parseFloat(coupon.discount_value)) / 100;
      if (coupon.max_discount_amount) {
        discountAmount = Math.min(discountAmount, parseFloat(coupon.max_discount_amount));
      }
    } else {
      discountAmount = parseFloat(coupon.discount_value);
    }
    discountAmount = Math.min(discountAmount, orderAmt);

    res.json({
      couponId: coupon.id,
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discount_type,
      discountValue: parseFloat(coupon.discount_value),
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      finalAmount: parseFloat((orderAmt - discountAmount).toFixed(2)),
      valid: true,
    });
  } catch (error) {
    console.error('Validate coupon error:', error);
    res.status(500).json({ error: 'Failed to validate coupon' });
  }
};

// GET /api/coupons — admin list
export const getCoupons = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, active } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let sql = 'SELECT * FROM coupons WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (active !== undefined) {
      sql += ` AND is_active = $${paramIndex++}`;
      params.push(active === 'true');
    }

    sql += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(Number(limit), offset);

    const result = await query(sql, params);
    const countResult = await query('SELECT COUNT(*) FROM coupons');

    res.json({
      coupons: result.rows.map(c => ({
        id: c.id,
        code: c.code,
        description: c.description,
        discountType: c.discount_type,
        discountValue: parseFloat(c.discount_value),
        minOrderAmount: parseFloat(c.min_order_amount || 0),
        usageLimit: c.usage_limit,
        usageCount: c.usage_count,
        validFrom: c.valid_from,
        validUntil: c.valid_until,
        isActive: c.is_active,
        createdAt: c.created_at,
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: parseInt(countResult.rows[0].count),
        totalPages: Math.ceil(parseInt(countResult.rows[0].count) / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get coupons error:', error);
    res.status(500).json({ error: 'Failed to get coupons' });
  }
};

// POST /api/coupons — create coupon
export const createCoupon = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { code, description, discountType, discountValue, minOrderAmount, maxDiscountAmount, usageLimit, validFrom, validUntil, restaurantId } = req.body;

    const result = await query(
      `INSERT INTO coupons
       (code, description, discount_type, discount_value, min_order_amount,
        max_discount_amount, usage_limit, valid_from, valid_until, restaurant_id)
       VALUES (UPPER($1), $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [code, description, discountType || 'percent', discountValue, minOrderAmount || 0,
       maxDiscountAmount || null, usageLimit || null, validFrom || null, validUntil || null, restaurantId || null]
    );

    res.status(201).json({ coupon: result.rows[0] });
  } catch (error: any) {
    if (error.code === '23505') return res.status(400).json({ error: 'Coupon code already exists' });
    console.error('Create coupon error:', error);
    res.status(500).json({ error: 'Failed to create coupon' });
  }
};

// DELETE /api/coupons/:id
export const deleteCoupon = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM coupons WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Coupon not found' });
    res.json({ message: 'Coupon deleted' });
  } catch (error) {
    console.error('Delete coupon error:', error);
    res.status(500).json({ error: 'Failed to delete coupon' });
  }
};
