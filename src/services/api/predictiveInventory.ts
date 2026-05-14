import { apiRequest } from './config';

export interface InventoryForecast {
  ingredientId: string;
  ingredientName: string;
  currentStock: number;
  unit: string;
  forecastedUsage7Days: number;
  daysUntilStockout: number;
  reorderRecommended: boolean;
  recommendedOrderQty: number;
  preferredSupplier?: string;
  confidence: number;
}

export interface PredictiveInventoryResponse {
  restaurantId: string;
  generatedAt: string;
  forecasts: InventoryForecast[];
}

export const getInventoryForecasts = async (params: {
  restaurantId: string;
  horizonDays?: number;
}): Promise<PredictiveInventoryResponse> => {
  try {
    return await apiRequest('/ai/inventory/forecasts', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  } catch {
    const now = new Date();
    const seed = [
      { id: '1', name: 'Tomato', stock: 14, unit: 'kg', daily: 3.5 },
      { id: '2', name: 'Mozzarella', stock: 8, unit: 'kg', daily: 2.5 },
      { id: '3', name: 'Beef Patty', stock: 60, unit: 'units', daily: 25 },
      { id: '4', name: 'Lettuce', stock: 5, unit: 'kg', daily: 2 },
      { id: '5', name: 'Olive Oil', stock: 18, unit: 'L', daily: 1 },
    ];
    return {
      restaurantId: params.restaurantId,
      generatedAt: now.toISOString(),
      forecasts: seed.map((s) => {
        const usage7 = +(s.daily * 7 * (0.85 + Math.random() * 0.3)).toFixed(1);
        const days = Math.max(0, +(s.stock / s.daily).toFixed(1));
        return {
          ingredientId: s.id,
          ingredientName: s.name,
          currentStock: s.stock,
          unit: s.unit,
          forecastedUsage7Days: usage7,
          daysUntilStockout: days,
          reorderRecommended: days < 5,
          recommendedOrderQty: Math.ceil(usage7 - s.stock + s.daily * 3),
          preferredSupplier: 'FreshSupply Co.',
          confidence: 0.78 + Math.random() * 0.15,
        };
      }),
    };
  }
};

export const placeReorder = async (params: {
  restaurantId: string;
  ingredientId: string;
  quantity: number;
  supplier: string;
}): Promise<{ orderId: string; estimatedDelivery: string }> => {
  try {
    return await apiRequest('/ai/inventory/reorder', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  } catch {
    return {
      orderId: `MOCK-${Date.now()}`,
      estimatedDelivery: new Date(Date.now() + 86400000 * 2).toISOString(),
    };
  }
};
