import { apiRequest } from './config';

// Types
export interface InventoryItem {
  id: string;
  restaurantId: string;
  name: string;
  description?: string;
  category?: string;
  sku?: string;
  unit: string;
  currentQuantity: number;
  minQuantity: number;
  maxQuantity: number;
  reorderPoint: number;
  unitCost: number;
  supplier?: string;
  supplierContact?: string;
  storageLocation?: string;
  expiryDate?: string;
  lastRestockedAt?: string;
  avgDailyUsage?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UsageHistory {
  id: string;
  quantityUsed: number;
  usageType: string;
  notes?: string;
  recordedAt: string;
}

export interface InventoryAnalysis {
  lowStockAlerts: Array<{
    itemName: string;
    severity: 'critical' | 'warning';
    message: string;
  }>;
  reorderSuggestions: Array<{
    itemName: string;
    suggestedQuantity: number;
    reason: string;
  }>;
  predictions: Array<{
    itemName: string;
    daysUntilDepletion: number;
    confidence: number;
  }>;
  summary: string;
}

export interface CreateInventoryItemInput {
  restaurantId: string;
  name: string;
  unit: string;
  description?: string;
  category?: string;
  sku?: string;
  currentQuantity?: number;
  minQuantity?: number;
  maxQuantity?: number;
  reorderPoint?: number;
  unitCost?: number;
  supplier?: string;
  supplierContact?: string;
  storageLocation?: string;
  expiryDate?: string;
}

export interface UpdateInventoryItemInput {
  name?: string;
  description?: string;
  category?: string;
  sku?: string;
  unit?: string;
  currentQuantity?: number;
  minQuantity?: number;
  maxQuantity?: number;
  reorderPoint?: number;
  unitCost?: number;
  supplier?: string;
  supplierContact?: string;
  storageLocation?: string;
  expiryDate?: string;
  isActive?: boolean;
}

// API Functions
export const getInventoryItems = async (params?: {
  restaurantId?: string;
  category?: string;
  lowStock?: boolean;
}): Promise<{ items: InventoryItem[] }> => {
  const queryParams = new URLSearchParams();
  if (params?.restaurantId) queryParams.set('restaurantId', params.restaurantId);
  if (params?.category) queryParams.set('category', params.category);
  if (params?.lowStock) queryParams.set('lowStock', 'true');

  const queryString = queryParams.toString();
  return apiRequest(`/inventory${queryString ? `?${queryString}` : ''}`);
};

export const getInventoryItem = async (id: string): Promise<{
  item: InventoryItem;
  usageHistory: UsageHistory[];
}> => {
  return apiRequest(`/inventory/${id}`);
};

export const createInventoryItem = async (
  data: CreateInventoryItemInput
): Promise<{ item: InventoryItem }> => {
  return apiRequest('/inventory', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateInventoryItem = async (
  id: string,
  data: UpdateInventoryItemInput
): Promise<{ item: InventoryItem }> => {
  return apiRequest(`/inventory/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteInventoryItem = async (id: string): Promise<{ message: string }> => {
  return apiRequest(`/inventory/${id}`, {
    method: 'DELETE',
  });
};

export const analyzeInventory = async (
  restaurantId: string
): Promise<{ analysis: InventoryAnalysis }> => {
  return apiRequest('/inventory/analyze', {
    method: 'POST',
    body: JSON.stringify({ restaurantId }),
  });
};

export const bulkDeleteInventoryItems = async (
  ids: string[]
): Promise<{ message: string; deletedCount: number }> => {
  return apiRequest('/inventory/bulk-delete', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  });
};

export const bulkUpdateInventoryItems = async (
  ids: string[],
  updates: { category?: string; supplier?: string; minQuantity?: number; reorderPoint?: number }
): Promise<{ message: string; updatedCount: number }> => {
  return apiRequest('/inventory/bulk-update', {
    method: 'POST',
    body: JSON.stringify({ ids, updates }),
  });
};

export const recordInventoryUsage = async (data: {
  inventoryItemId: string;
  quantityUsed: number;
  usageType?: 'consumption' | 'waste' | 'adjustment';
  notes?: string;
}): Promise<{ usage: UsageHistory }> => {
  return apiRequest('/inventory/usage', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};
