import { Request, Response } from 'express';
import { query } from '../config/database.js';

// Get all restaurants
export const getAllRestaurants = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, cuisineType, isOpen } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let whereClause = 'WHERE is_active = TRUE';
    const params: any[] = [];
    let paramCount = 0;

    if (cuisineType) {
      paramCount++;
      whereClause += ` AND cuisine_type = $${paramCount}`;
      params.push(cuisineType);
    }

    if (isOpen !== undefined) {
      paramCount++;
      whereClause += ` AND is_open = $${paramCount}`;
      params.push(isOpen === 'true');
    }

    params.push(Number(limit), offset);

    const result = await query(
      `SELECT id, name, description, image_url, address, city, state,
              rating, review_count, cuisine_type, price_range,
              delivery_fee, min_order_amount, estimated_delivery_time, is_open
       FROM restaurants
       ${whereClause}
       ORDER BY rating DESC, review_count DESC
       LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      params
    );

    const countResult = await query(
      `SELECT COUNT(*) FROM restaurants ${whereClause}`,
      params.slice(0, paramCount)
    );

    res.json({
      restaurants: result.rows.map(r => ({
        id: r.id,
        name: r.name,
        description: r.description,
        imageUrl: r.image_url,
        address: r.address,
        city: r.city,
        state: r.state,
        rating: parseFloat(r.rating),
        reviewCount: r.review_count,
        cuisineType: r.cuisine_type,
        priceRange: r.price_range,
        deliveryFee: parseFloat(r.delivery_fee),
        minOrderAmount: parseFloat(r.min_order_amount),
        estimatedDeliveryTime: r.estimated_delivery_time,
        isOpen: r.is_open,
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: parseInt(countResult.rows[0].count),
        totalPages: Math.ceil(parseInt(countResult.rows[0].count) / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get restaurants error:', error);
    res.status(500).json({ error: 'Failed to get restaurants' });
  }
};

// Get restaurant by ID
export const getRestaurantById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT id, name, description, image_url, address, city, state, zip_code,
              phone, email, latitude, longitude, rating, review_count,
              cuisine_type, price_range, delivery_fee, min_order_amount,
              estimated_delivery_time, is_open, opening_hours
       FROM restaurants
       WHERE id = $1 AND is_active = TRUE`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    const r = result.rows[0];

    res.json({
      restaurant: {
        id: r.id,
        name: r.name,
        description: r.description,
        imageUrl: r.image_url,
        address: r.address,
        city: r.city,
        state: r.state,
        zipCode: r.zip_code,
        phone: r.phone,
        email: r.email,
        latitude: r.latitude ? parseFloat(r.latitude) : null,
        longitude: r.longitude ? parseFloat(r.longitude) : null,
        rating: parseFloat(r.rating),
        reviewCount: r.review_count,
        cuisineType: r.cuisine_type,
        priceRange: r.price_range,
        deliveryFee: parseFloat(r.delivery_fee),
        minOrderAmount: parseFloat(r.min_order_amount),
        estimatedDeliveryTime: r.estimated_delivery_time,
        isOpen: r.is_open,
        openingHours: r.opening_hours,
      },
    });
  } catch (error) {
    console.error('Get restaurant error:', error);
    res.status(500).json({ error: 'Failed to get restaurant' });
  }
};

// Get restaurant menu
export const getRestaurantMenu = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get categories
    const categoriesResult = await query(
      `SELECT id, name, description, image_url, display_order
       FROM menu_categories
       WHERE restaurant_id = $1 AND is_active = TRUE
       ORDER BY display_order`,
      [id]
    );

    // Get menu items for each category
    const itemsResult = await query(
      `SELECT mi.id, mi.category_id, mi.name, mi.description, mi.price,
              mi.image_url, mi.is_available, mi.is_featured, mi.is_vegetarian,
              mi.is_vegan, mi.is_gluten_free, mi.spice_level, mi.calories,
              mi.prep_time, mi.customization_rules
       FROM menu_items mi
       WHERE mi.restaurant_id = $1 AND mi.is_available = TRUE
       ORDER BY mi.is_featured DESC, mi.name`,
      [id]
    );

    // Group items by category
    const itemsByCategory = new Map<string, any[]>();
    for (const item of itemsResult.rows) {
      const categoryId = item.category_id;
      if (!itemsByCategory.has(categoryId)) {
        itemsByCategory.set(categoryId, []);
      }
      itemsByCategory.get(categoryId)!.push({
        id: item.id,
        name: item.name,
        description: item.description,
        price: parseFloat(item.price),
        imageUrl: item.image_url,
        isAvailable: item.is_available,
        isFeatured: item.is_featured,
        isVegetarian: item.is_vegetarian,
        isVegan: item.is_vegan,
        isGlutenFree: item.is_gluten_free,
        spiceLevel: item.spice_level,
        calories: item.calories,
        prepTime: item.prep_time,
        customizationRules: item.customization_rules,
      });
    }

    res.json({
      categories: categoriesResult.rows.map(cat => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        imageUrl: cat.image_url,
        displayOrder: cat.display_order,
        items: itemsByCategory.get(cat.id) || [],
      })),
    });
  } catch (error) {
    console.error('Get restaurant menu error:', error);
    res.status(500).json({ error: 'Failed to get menu' });
  }
};

// Search restaurants
export const searchRestaurants = async (req: Request, res: Response) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const searchTerm = `%${q}%`;

    const result = await query(
      `SELECT id, name, description, image_url, address, city, state,
              rating, review_count, cuisine_type, price_range,
              delivery_fee, min_order_amount, estimated_delivery_time, is_open
       FROM restaurants
       WHERE is_active = TRUE
         AND (name ILIKE $1 OR description ILIKE $1 OR cuisine_type ILIKE $1)
       ORDER BY rating DESC
       LIMIT $2 OFFSET $3`,
      [searchTerm, Number(limit), offset]
    );

    res.json({
      restaurants: result.rows.map(r => ({
        id: r.id,
        name: r.name,
        description: r.description,
        imageUrl: r.image_url,
        address: r.address,
        city: r.city,
        state: r.state,
        rating: parseFloat(r.rating),
        reviewCount: r.review_count,
        cuisineType: r.cuisine_type,
        priceRange: r.price_range,
        deliveryFee: parseFloat(r.delivery_fee),
        minOrderAmount: parseFloat(r.min_order_amount),
        estimatedDeliveryTime: r.estimated_delivery_time,
        isOpen: r.is_open,
      })),
    });
  } catch (error) {
    console.error('Search restaurants error:', error);
    res.status(500).json({ error: 'Failed to search restaurants' });
  }
};
