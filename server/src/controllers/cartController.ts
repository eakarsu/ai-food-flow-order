import { Response } from 'express';
import { validationResult } from 'express-validator';
import { query, getClient } from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';

// Get user's cart
export const getCart = async (req: AuthRequest, res: Response) => {
  try {
    // Get or create cart
    let cartResult = await query(
      'SELECT id, restaurant_id FROM carts WHERE user_id = $1',
      [req.user!.id]
    );

    if (cartResult.rows.length === 0) {
      // Create cart
      cartResult = await query(
        'INSERT INTO carts (user_id) VALUES ($1) RETURNING id, restaurant_id',
        [req.user!.id]
      );
    }

    const cart = cartResult.rows[0];

    // Get cart items
    const itemsResult = await query(
      `SELECT ci.id, ci.menu_item_id, ci.quantity, ci.unit_price,
              ci.customizations, ci.special_instructions,
              mi.name, mi.description, mi.image_url,
              mc.name as category_name
       FROM cart_items ci
       JOIN menu_items mi ON ci.menu_item_id = mi.id
       LEFT JOIN menu_categories mc ON mi.category_id = mc.id
       WHERE ci.cart_id = $1
       ORDER BY ci.created_at DESC`,
      [cart.id]
    );

    // Calculate totals
    const items = itemsResult.rows.map(item => ({
      id: item.id,
      menuItemId: item.menu_item_id,
      name: item.name,
      description: item.description,
      imageUrl: item.image_url,
      categoryName: item.category_name,
      quantity: item.quantity,
      unitPrice: parseFloat(item.unit_price),
      totalPrice: parseFloat(item.unit_price) * item.quantity,
      customizations: item.customizations,
      specialInstructions: item.special_instructions,
    }));

    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    // Get restaurant info if cart has items
    let restaurant = null;
    if (cart.restaurant_id) {
      const restaurantResult = await query(
        `SELECT id, name, delivery_fee, min_order_amount, estimated_delivery_time
         FROM restaurants WHERE id = $1`,
        [cart.restaurant_id]
      );
      if (restaurantResult.rows.length > 0) {
        const r = restaurantResult.rows[0];
        restaurant = {
          id: r.id,
          name: r.name,
          deliveryFee: parseFloat(r.delivery_fee),
          minOrderAmount: parseFloat(r.min_order_amount),
          estimatedDeliveryTime: r.estimated_delivery_time,
        };
      }
    }

    res.json({
      cart: {
        id: cart.id,
        restaurant,
        items,
        itemCount,
        subtotal,
        deliveryFee: restaurant?.deliveryFee || 0,
        tax: subtotal * 0.08, // 8% tax
        total: subtotal + (restaurant?.deliveryFee || 0) + (subtotal * 0.08),
      },
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Failed to get cart' });
  }
};

// Add item to cart
export const addToCart = async (req: AuthRequest, res: Response) => {
  const client = await getClient();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { menuItemId, quantity, customizations, specialInstructions } = req.body;

    await client.query('BEGIN');

    // Get menu item details
    const menuItemResult = await client.query(
      `SELECT id, restaurant_id, name, price, is_available
       FROM menu_items WHERE id = $1`,
      [menuItemId]
    );

    if (menuItemResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Menu item not found' });
    }

    const menuItem = menuItemResult.rows[0];

    if (!menuItem.is_available) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Menu item is not available' });
    }

    // Get or create cart
    let cartResult = await client.query(
      'SELECT id, restaurant_id FROM carts WHERE user_id = $1',
      [req.user!.id]
    );

    if (cartResult.rows.length === 0) {
      cartResult = await client.query(
        'INSERT INTO carts (user_id, restaurant_id) VALUES ($1, $2) RETURNING id, restaurant_id',
        [req.user!.id, menuItem.restaurant_id]
      );
    }

    const cart = cartResult.rows[0];

    // Check if adding items from different restaurant
    if (cart.restaurant_id && cart.restaurant_id !== menuItem.restaurant_id) {
      // Check if cart has items
      const existingItems = await client.query(
        'SELECT COUNT(*) FROM cart_items WHERE cart_id = $1',
        [cart.id]
      );

      if (parseInt(existingItems.rows[0].count) > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          error: 'Cart contains items from another restaurant',
          code: 'DIFFERENT_RESTAURANT',
        });
      }
    }

    // Update cart restaurant if not set
    if (!cart.restaurant_id) {
      await client.query(
        'UPDATE carts SET restaurant_id = $1 WHERE id = $2',
        [menuItem.restaurant_id, cart.id]
      );
    }

    // Check if item already in cart (same customizations)
    const existingItem = await client.query(
      `SELECT id, quantity FROM cart_items
       WHERE cart_id = $1 AND menu_item_id = $2
       AND (customizations IS NOT DISTINCT FROM $3::jsonb)`,
      [cart.id, menuItemId, customizations ? JSON.stringify(customizations) : null]
    );

    let cartItem;

    if (existingItem.rows.length > 0) {
      // Update quantity
      const newQuantity = existingItem.rows[0].quantity + quantity;
      const result = await client.query(
        `UPDATE cart_items
         SET quantity = $1, special_instructions = COALESCE($2, special_instructions)
         WHERE id = $3
         RETURNING id, quantity`,
        [newQuantity, specialInstructions, existingItem.rows[0].id]
      );
      cartItem = result.rows[0];
    } else {
      // Add new item
      const result = await client.query(
        `INSERT INTO cart_items
         (cart_id, menu_item_id, quantity, unit_price, customizations, special_instructions)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, quantity`,
        [
          cart.id,
          menuItemId,
          quantity,
          menuItem.price,
          customizations ? JSON.stringify(customizations) : null,
          specialInstructions,
        ]
      );
      cartItem = result.rows[0];
    }

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Item added to cart',
      cartItem: {
        id: cartItem.id,
        menuItemId,
        name: menuItem.name,
        quantity: cartItem.quantity,
        unitPrice: parseFloat(menuItem.price),
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  } finally {
    client.release();
  }
};

// Update cart item
export const updateCartItem = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity, customizations, specialInstructions } = req.body;

    // Verify item belongs to user's cart
    const cartResult = await query(
      `SELECT ci.id, c.user_id
       FROM cart_items ci
       JOIN carts c ON ci.cart_id = c.id
       WHERE ci.id = $1`,
      [id]
    );

    if (cartResult.rows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    if (cartResult.rows[0].user_id !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const result = await query(
      `UPDATE cart_items
       SET quantity = COALESCE($1, quantity),
           customizations = COALESCE($2::jsonb, customizations),
           special_instructions = COALESCE($3, special_instructions)
       WHERE id = $4
       RETURNING id, quantity`,
      [
        quantity,
        customizations ? JSON.stringify(customizations) : null,
        specialInstructions,
        id,
      ]
    );

    res.json({
      message: 'Cart item updated',
      cartItem: result.rows[0],
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({ error: 'Failed to update cart item' });
  }
};

// Remove item from cart
export const removeFromCart = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Verify item belongs to user's cart
    const cartResult = await query(
      `SELECT ci.id, c.user_id, c.id as cart_id
       FROM cart_items ci
       JOIN carts c ON ci.cart_id = c.id
       WHERE ci.id = $1`,
      [id]
    );

    if (cartResult.rows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    if (cartResult.rows[0].user_id !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await query('DELETE FROM cart_items WHERE id = $1', [id]);

    // Check if cart is now empty
    const remainingItems = await query(
      'SELECT COUNT(*) FROM cart_items WHERE cart_id = $1',
      [cartResult.rows[0].cart_id]
    );

    if (parseInt(remainingItems.rows[0].count) === 0) {
      // Clear restaurant from cart
      await query(
        'UPDATE carts SET restaurant_id = NULL WHERE id = $1',
        [cartResult.rows[0].cart_id]
      );
    }

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
};

// Clear cart
export const clearCart = async (req: AuthRequest, res: Response) => {
  try {
    const cartResult = await query(
      'SELECT id FROM carts WHERE user_id = $1',
      [req.user!.id]
    );

    if (cartResult.rows.length === 0) {
      return res.json({ message: 'Cart is already empty' });
    }

    const cartId = cartResult.rows[0].id;

    await query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
    await query('UPDATE carts SET restaurant_id = NULL WHERE id = $1', [cartId]);

    res.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
};
