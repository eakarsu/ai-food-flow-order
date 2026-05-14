import { Router } from 'express';
import { body, query as queryValidator } from 'express-validator';
import {
  getInventoryItems,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  bulkDeleteInventoryItems,
  bulkUpdateInventoryItems,
  analyzeInventoryAI,
  recordUsage,
  recordRestock,
} from '../controllers/inventoryController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get all inventory items
router.get('/', getInventoryItems);

// Get single inventory item
router.get('/:id', getInventoryItem);

// Create inventory item
router.post(
  '/',
  [
    body('restaurantId').isUUID(),
    body('name').notEmpty().trim(),
    body('unit').notEmpty().trim(),
    body('currentQuantity').optional().isFloat({ min: 0 }),
    body('minQuantity').optional().isFloat({ min: 0 }),
    body('maxQuantity').optional().isFloat({ min: 0 }),
    body('reorderPoint').optional().isFloat({ min: 0 }),
    body('unitCost').optional().isFloat({ min: 0 }),
    body('category').optional().trim(),
    body('sku').optional().trim(),
    body('supplier').optional().trim(),
    body('supplierContact').optional().trim(),
    body('storageLocation').optional().trim(),
    body('expiryDate').optional().isISO8601(),
  ],
  createInventoryItem
);

// Update inventory item
router.put(
  '/:id',
  [
    body('name').optional().notEmpty().trim(),
    body('unit').optional().notEmpty().trim(),
    body('currentQuantity').optional().isFloat({ min: 0 }),
    body('minQuantity').optional().isFloat({ min: 0 }),
    body('maxQuantity').optional().isFloat({ min: 0 }),
    body('reorderPoint').optional().isFloat({ min: 0 }),
    body('unitCost').optional().isFloat({ min: 0 }),
    body('category').optional().trim(),
    body('sku').optional().trim(),
    body('supplier').optional().trim(),
    body('supplierContact').optional().trim(),
    body('storageLocation').optional().trim(),
    body('expiryDate').optional().isISO8601(),
    body('isActive').optional().isBoolean(),
  ],
  updateInventoryItem
);

// Bulk delete inventory items
router.post('/bulk-delete', requireRole('admin', 'manager'), bulkDeleteInventoryItems);

// Bulk update inventory items
router.post('/bulk-update', requireRole('admin', 'manager'), bulkUpdateInventoryItems);

// Delete inventory item
router.delete('/:id', deleteInventoryItem);

// Record inventory restock (add stock)
router.post(
  '/restock',
  [
    body('inventoryItemId').isUUID(),
    body('quantityAdded').isFloat({ min: 0.01 }),
    body('unitCost').optional().isFloat({ min: 0 }),
    body('supplier').optional().trim(),
    body('invoiceNumber').optional().trim(),
    body('notes').optional().trim(),
  ],
  recordRestock
);

// AI analyze inventory (resolve restaurantId if not UUID)
router.post(
  '/analyze',
  [
    body('restaurantId').notEmpty(),
  ],
  analyzeInventoryAI
);

// Record inventory usage
router.post(
  '/usage',
  [
    body('inventoryItemId').isUUID(),
    body('quantityUsed').isFloat({ min: 0.01 }),
    body('usageType').optional().isIn(['consumption', 'waste', 'adjustment']),
    body('notes').optional().trim(),
  ],
  recordUsage
);

export default router;
