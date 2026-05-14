import { Request, Response } from 'express';
import { query } from '../config/database.js';

// Get all categories
export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const { restaurantId } = req.query;

    let sql = `
      SELECT mc.id, mc.name, mc.description, mc.image_url, mc.display_order,
             r.id as restaurant_id, r.name as restaurant_name
      FROM menu_categories mc
      LEFT JOIN restaurants r ON mc.restaurant_id = r.id
      WHERE mc.is_active = TRUE
    `;
    const params: any[] = [];

    if (restaurantId) {
      sql += ' AND mc.restaurant_id = $1';
      params.push(restaurantId);
    }

    sql += ' ORDER BY mc.display_order, mc.name';

    const result = await query(sql, params);

    res.json({
      categories: result.rows.map(cat => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        imageUrl: cat.image_url,
        displayOrder: cat.display_order,
        restaurantId: cat.restaurant_id,
        restaurantName: cat.restaurant_name,
      })),
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
};

// Get menu items
export const getMenuItems = async (req: Request, res: Response) => {
  try {
    const {
      categoryId,
      restaurantId,
      page = 1,
      limit = 50,
      isVegetarian,
      isVegan,
      isGlutenFree,
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    let whereClause = 'WHERE mi.is_available = TRUE';
    const params: any[] = [];
    let paramCount = 0;

    if (categoryId) {
      paramCount++;
      whereClause += ` AND mi.category_id = $${paramCount}`;
      params.push(categoryId);
    }

    if (restaurantId) {
      paramCount++;
      whereClause += ` AND mi.restaurant_id = $${paramCount}`;
      params.push(restaurantId);
    }

    if (isVegetarian === 'true') {
      whereClause += ' AND mi.is_vegetarian = TRUE';
    }

    if (isVegan === 'true') {
      whereClause += ' AND mi.is_vegan = TRUE';
    }

    if (isGlutenFree === 'true') {
      whereClause += ' AND mi.is_gluten_free = TRUE';
    }

    params.push(Number(limit), offset);

    const result = await query(
      `SELECT mi.id, mi.category_id, mi.restaurant_id, mi.name, mi.description,
              mi.price, mi.image_url, mi.is_available, mi.is_featured,
              mi.is_vegetarian, mi.is_vegan, mi.is_gluten_free, mi.spice_level,
              mi.calories, mi.prep_time, mi.customization_rules,
              mc.name as category_name, r.name as restaurant_name
       FROM menu_items mi
       LEFT JOIN menu_categories mc ON mi.category_id = mc.id
       LEFT JOIN restaurants r ON mi.restaurant_id = r.id
       ${whereClause}
       ORDER BY mi.is_featured DESC, mi.name
       LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      params
    );

    // Get total count for pagination
    let countSql = 'SELECT COUNT(*) FROM menu_items mi WHERE mi.is_available = TRUE';
    const countParams: any[] = [];
    let countIndex = 0;

    if (categoryId) {
      countParams.push(categoryId);
      countSql += ` AND mi.category_id = $${++countIndex}`;
    }
    if (restaurantId) {
      countParams.push(restaurantId);
      countSql += ` AND mi.restaurant_id = $${++countIndex}`;
    }

    const countResult = await query(countSql, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      items: result.rows.map(item => ({
        id: item.id,
        categoryId: item.category_id,
        categoryName: item.category_name,
        restaurantId: item.restaurant_id,
        restaurantName: item.restaurant_name,
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
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get menu items error:', error);
    res.status(500).json({ error: 'Failed to get menu items' });
  }
};

// Get menu item by ID
export const getMenuItemById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT mi.id, mi.category_id, mi.restaurant_id, mi.name, mi.description,
              mi.price, mi.image_url, mi.is_available, mi.is_featured,
              mi.is_vegetarian, mi.is_vegan, mi.is_gluten_free, mi.spice_level,
              mi.calories, mi.prep_time, mi.customization_rules,
              mc.name as category_name, r.name as restaurant_name
       FROM menu_items mi
       LEFT JOIN menu_categories mc ON mi.category_id = mc.id
       LEFT JOIN restaurants r ON mi.restaurant_id = r.id
       WHERE mi.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    const item = result.rows[0];

    // Get customization options
    const optionsResult = await query(
      `SELECT io.id, io.name, io.type, io.is_required, io.min_selections, io.max_selections,
              json_agg(json_build_object(
                'id', ov.id,
                'name', ov.name,
                'priceModifier', ov.price_modifier,
                'isDefault', ov.is_default,
                'isAvailable', ov.is_available
              )) as values
       FROM item_options io
       LEFT JOIN option_values ov ON io.id = ov.option_id
       WHERE io.menu_item_id = $1
       GROUP BY io.id`,
      [id]
    );

    res.json({
      item: {
        id: item.id,
        categoryId: item.category_id,
        categoryName: item.category_name,
        restaurantId: item.restaurant_id,
        restaurantName: item.restaurant_name,
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
        options: optionsResult.rows.map(opt => ({
          id: opt.id,
          name: opt.name,
          type: opt.type,
          isRequired: opt.is_required,
          minSelections: opt.min_selections,
          maxSelections: opt.max_selections,
          values: opt.values,
        })),
      },
    });
  } catch (error) {
    console.error('Get menu item error:', error);
    res.status(500).json({ error: 'Failed to get menu item' });
  }
};

// Search menu items
export const searchMenuItems = async (req: Request, res: Response) => {
  try {
    const { q, page = 1, limit = 50 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const searchTerm = `%${q}%`;

    const result = await query(
      `SELECT mi.id, mi.category_id, mi.restaurant_id, mi.name, mi.description,
              mi.price, mi.image_url, mi.is_available, mi.is_featured,
              mi.is_vegetarian, mi.is_vegan, mi.is_gluten_free, mi.spice_level,
              mi.calories, mi.prep_time, mi.customization_rules,
              mc.name as category_name, r.name as restaurant_name
       FROM menu_items mi
       LEFT JOIN menu_categories mc ON mi.category_id = mc.id
       LEFT JOIN restaurants r ON mi.restaurant_id = r.id
       WHERE mi.is_available = TRUE
         AND (mi.name ILIKE $1 OR mi.description ILIKE $1 OR mc.name ILIKE $1)
       ORDER BY mi.is_featured DESC, mi.name
       LIMIT $2 OFFSET $3`,
      [searchTerm, Number(limit), offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) FROM menu_items mi
       LEFT JOIN menu_categories mc ON mi.category_id = mc.id
       WHERE mi.is_available = TRUE
         AND (mi.name ILIKE $1 OR mi.description ILIKE $1 OR mc.name ILIKE $1)`,
      [searchTerm]
    );
    const total = parseInt(countResult.rows[0].count);

    res.json({
      items: result.rows.map(item => ({
        id: item.id,
        categoryId: item.category_id,
        categoryName: item.category_name,
        restaurantId: item.restaurant_id,
        restaurantName: item.restaurant_name,
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
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Search menu items error:', error);
    res.status(500).json({ error: 'Failed to search menu items' });
  }
};

// Get featured items
export const getFeaturedItems = async (req: Request, res: Response) => {
  try {
    const { limit = 10 } = req.query;

    const result = await query(
      `SELECT mi.id, mi.category_id, mi.restaurant_id, mi.name, mi.description,
              mi.price, mi.image_url, mi.is_available, mi.is_featured,
              mi.is_vegetarian, mi.is_vegan, mi.is_gluten_free, mi.spice_level,
              mi.calories, mi.prep_time,
              mc.name as category_name, r.name as restaurant_name
       FROM menu_items mi
       LEFT JOIN menu_categories mc ON mi.category_id = mc.id
       LEFT JOIN restaurants r ON mi.restaurant_id = r.id
       WHERE mi.is_available = TRUE AND mi.is_featured = TRUE
       ORDER BY RANDOM()
       LIMIT $1`,
      [Number(limit)]
    );

    res.json({
      items: result.rows.map(item => ({
        id: item.id,
        categoryId: item.category_id,
        categoryName: item.category_name,
        restaurantId: item.restaurant_id,
        restaurantName: item.restaurant_name,
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
      })),
    });
  } catch (error) {
    console.error('Get featured items error:', error);
    res.status(500).json({ error: 'Failed to get featured items' });
  }
};
