import { Response } from 'express';
import { validationResult } from 'express-validator';
import { query, getClient } from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';
import { analyzeInventory } from '../services/openRouterService.js';

// Get all inventory items
export const getInventoryItems = async (req: AuthRequest, res: Response) => {
  try {
    const { restaurantId, category, lowStock } = req.query;

    let sql = `
      SELECT i.*,
        (SELECT AVG(quantity_used) FROM inventory_usage_history
         WHERE inventory_item_id = i.id
         AND recorded_at > NOW() - INTERVAL '7 days') as avg_daily_usage
      FROM inventory_items i
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (restaurantId) {
      sql += ` AND i.restaurant_id = $${paramIndex++}`;
      params.push(restaurantId);
    }

    if (category) {
      sql += ` AND i.category = $${paramIndex++}`;
      params.push(category);
    }

    if (lowStock === 'true') {
      sql += ` AND i.current_quantity <= i.reorder_point`;
    }

    sql += ` ORDER BY i.name`;

    const result = await query(sql, params);

    const items = result.rows.map(row => ({
      id: row.id,
      restaurantId: row.restaurant_id,
      name: row.name,
      description: row.description,
      category: row.category,
      sku: row.sku,
      unit: row.unit,
      currentQuantity: parseFloat(row.current_quantity),
      minQuantity: parseFloat(row.min_quantity),
      maxQuantity: parseFloat(row.max_quantity),
      reorderPoint: parseFloat(row.reorder_point),
      unitCost: parseFloat(row.unit_cost || 0),
      supplier: row.supplier,
      supplierContact: row.supplier_contact,
      storageLocation: row.storage_location,
      expiryDate: row.expiry_date,
      lastRestockedAt: row.last_restocked_at,
      avgDailyUsage: row.avg_daily_usage ? parseFloat(row.avg_daily_usage) : null,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    res.json({ items });
  } catch (error) {
    console.error('Get inventory items error:', error);
    res.status(500).json({ error: 'Failed to fetch inventory items' });
  }
};

// Get single inventory item
export const getInventoryItem = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT i.*,
        (SELECT AVG(quantity_used) FROM inventory_usage_history
         WHERE inventory_item_id = i.id
         AND recorded_at > NOW() - INTERVAL '7 days') as avg_daily_usage
       FROM inventory_items i
       WHERE i.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    const row = result.rows[0];
    const item = {
      id: row.id,
      restaurantId: row.restaurant_id,
      name: row.name,
      description: row.description,
      category: row.category,
      sku: row.sku,
      unit: row.unit,
      currentQuantity: parseFloat(row.current_quantity),
      minQuantity: parseFloat(row.min_quantity),
      maxQuantity: parseFloat(row.max_quantity),
      reorderPoint: parseFloat(row.reorder_point),
      unitCost: parseFloat(row.unit_cost || 0),
      supplier: row.supplier,
      supplierContact: row.supplier_contact,
      storageLocation: row.storage_location,
      expiryDate: row.expiry_date,
      lastRestockedAt: row.last_restocked_at,
      avgDailyUsage: row.avg_daily_usage ? parseFloat(row.avg_daily_usage) : null,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    // Get usage history
    const historyResult = await query(
      `SELECT * FROM inventory_usage_history
       WHERE inventory_item_id = $1
       ORDER BY recorded_at DESC
       LIMIT 20`,
      [id]
    );

    const usageHistory = historyResult.rows.map(h => ({
      id: h.id,
      quantityUsed: parseFloat(h.quantity_used),
      usageType: h.usage_type,
      notes: h.notes,
      recordedAt: h.recorded_at,
    }));

    res.json({ item, usageHistory });
  } catch (error) {
    console.error('Get inventory item error:', error);
    res.status(500).json({ error: 'Failed to fetch inventory item' });
  }
};

// Create inventory item
export const createInventoryItem = async (req: AuthRequest, res: Response) => {
  const client = await getClient();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      restaurantId, name, description, category, sku, unit,
      currentQuantity, minQuantity, maxQuantity, reorderPoint,
      unitCost, supplier, supplierContact, storageLocation, expiryDate,
    } = req.body;

    await client.query('BEGIN');

    const result = await client.query(
      `INSERT INTO inventory_items
       (restaurant_id, name, description, category, sku, unit,
        current_quantity, min_quantity, max_quantity, reorder_point,
        unit_cost, supplier, supplier_contact, storage_location, expiry_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING *`,
      [restaurantId, name, description, category, sku, unit,
       currentQuantity || 0, minQuantity || 10, maxQuantity || 100, reorderPoint || 20,
       unitCost || 0, supplier, supplierContact, storageLocation, expiryDate]
    );

    await client.query('COMMIT');

    const row = result.rows[0];
    res.status(201).json({
      item: {
        id: row.id,
        restaurantId: row.restaurant_id,
        name: row.name,
        description: row.description,
        category: row.category,
        sku: row.sku,
        unit: row.unit,
        currentQuantity: parseFloat(row.current_quantity),
        minQuantity: parseFloat(row.min_quantity),
        maxQuantity: parseFloat(row.max_quantity),
        reorderPoint: parseFloat(row.reorder_point),
        unitCost: parseFloat(row.unit_cost || 0),
        supplier: row.supplier,
        supplierContact: row.supplier_contact,
        storageLocation: row.storage_location,
        expiryDate: row.expiry_date,
        isActive: row.is_active,
        createdAt: row.created_at,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create inventory item error:', error);
    res.status(500).json({ error: 'Failed to create inventory item' });
  } finally {
    client.release();
  }
};

// Update inventory item
export const updateInventoryItem = async (req: AuthRequest, res: Response) => {
  const client = await getClient();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updates = req.body;

    await client.query('BEGIN');

    // Build dynamic update query
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const fieldMapping: Record<string, string> = {
      name: 'name',
      description: 'description',
      category: 'category',
      sku: 'sku',
      unit: 'unit',
      currentQuantity: 'current_quantity',
      minQuantity: 'min_quantity',
      maxQuantity: 'max_quantity',
      reorderPoint: 'reorder_point',
      unitCost: 'unit_cost',
      supplier: 'supplier',
      supplierContact: 'supplier_contact',
      storageLocation: 'storage_location',
      expiryDate: 'expiry_date',
      isActive: 'is_active',
    };

    for (const [key, dbField] of Object.entries(fieldMapping)) {
      if (updates[key] !== undefined) {
        setClauses.push(`${dbField} = $${paramIndex++}`);
        values.push(updates[key]);
      }
    }

    if (setClauses.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    const result = await client.query(
      `UPDATE inventory_items SET ${setClauses.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    await client.query('COMMIT');

    const row = result.rows[0];
    res.json({
      item: {
        id: row.id,
        restaurantId: row.restaurant_id,
        name: row.name,
        description: row.description,
        category: row.category,
        sku: row.sku,
        unit: row.unit,
        currentQuantity: parseFloat(row.current_quantity),
        minQuantity: parseFloat(row.min_quantity),
        maxQuantity: parseFloat(row.max_quantity),
        reorderPoint: parseFloat(row.reorder_point),
        unitCost: parseFloat(row.unit_cost || 0),
        supplier: row.supplier,
        supplierContact: row.supplier_contact,
        storageLocation: row.storage_location,
        expiryDate: row.expiry_date,
        isActive: row.is_active,
        updatedAt: row.updated_at,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update inventory item error:', error);
    res.status(500).json({ error: 'Failed to update inventory item' });
  } finally {
    client.release();
  }
};

// Delete inventory item
export const deleteInventoryItem = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM inventory_items WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    console.error('Delete inventory item error:', error);
    res.status(500).json({ error: 'Failed to delete inventory item' });
  }
};

// Bulk delete inventory items
export const bulkDeleteInventoryItems = async (req: AuthRequest, res: Response) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids array is required' });
    }

    const result = await query(
      'DELETE FROM inventory_items WHERE id = ANY($1) RETURNING id',
      [ids]
    );

    res.json({
      message: `${result.rows.length} items deleted`,
      deletedCount: result.rows.length,
    });
  } catch (error) {
    console.error('Bulk delete inventory error:', error);
    res.status(500).json({ error: 'Failed to bulk delete inventory items' });
  }
};

// Bulk update inventory items
export const bulkUpdateInventoryItems = async (req: AuthRequest, res: Response) => {
  try {
    const { ids, updates } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids array is required' });
    }
    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'updates object is required' });
    }

    const fieldMapping: Record<string, string> = {
      category: 'category',
      supplier: 'supplier',
      minQuantity: 'min_quantity',
      reorderPoint: 'reorder_point',
    };

    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const [key, dbField] of Object.entries(fieldMapping)) {
      if (updates[key] !== undefined) {
        setClauses.push(`${dbField} = $${paramIndex++}`);
        values.push(updates[key]);
      }
    }

    if (setClauses.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    values.push(ids);
    const result = await query(
      `UPDATE inventory_items SET ${setClauses.join(', ')}
       WHERE id = ANY($${paramIndex})
       RETURNING id`,
      values
    );

    res.json({
      message: `${result.rows.length} items updated`,
      updatedCount: result.rows.length,
    });
  } catch (error) {
    console.error('Bulk update inventory error:', error);
    res.status(500).json({ error: 'Failed to bulk update inventory items' });
  }
};

// AI analyze inventory
export const analyzeInventoryAI = async (req: AuthRequest, res: Response) => {
  try {
    const { restaurantId } = req.body;

    // Get inventory items with usage data
    const result = await query(
      `SELECT i.*,
        (SELECT AVG(quantity_used) FROM inventory_usage_history
         WHERE inventory_item_id = i.id
         AND recorded_at > NOW() - INTERVAL '7 days') as avg_daily_usage
       FROM inventory_items i
       WHERE i.restaurant_id = $1 AND i.is_active = true
       ORDER BY i.current_quantity / NULLIF(i.reorder_point, 0)`,
      [restaurantId]
    );

    const items = result.rows.map(row => ({
      name: row.name,
      currentQuantity: parseFloat(row.current_quantity),
      minQuantity: parseFloat(row.min_quantity),
      reorderPoint: parseFloat(row.reorder_point),
      unit: row.unit,
      avgDailyUsage: row.avg_daily_usage ? parseFloat(row.avg_daily_usage) : undefined,
    }));

    const analysis = await analyzeInventory({ items });

    res.json({ analysis });
  } catch (error) {
    console.error('Analyze inventory error:', error);
    res.status(500).json({ error: 'Failed to analyze inventory' });
  }
};

// Record inventory usage
export const recordUsage = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { inventoryItemId, quantityUsed, usageType, notes } = req.body;

    const result = await query(
      `INSERT INTO inventory_usage_history
       (inventory_item_id, quantity_used, usage_type, notes)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [inventoryItemId, quantityUsed, usageType || 'consumption', notes]
    );

    // Update current quantity
    await query(
      `UPDATE inventory_items
       SET current_quantity = current_quantity - $1
       WHERE id = $2`,
      [quantityUsed, inventoryItemId]
    );

    res.status(201).json({
      usage: {
        id: result.rows[0].id,
        inventoryItemId: result.rows[0].inventory_item_id,
        quantityUsed: parseFloat(result.rows[0].quantity_used),
        usageType: result.rows[0].usage_type,
        notes: result.rows[0].notes,
        recordedAt: result.rows[0].recorded_at,
      },
    });
  } catch (error) {
    console.error('Record usage error:', error);
    res.status(500).json({ error: 'Failed to record usage' });
  }
};
