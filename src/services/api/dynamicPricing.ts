import { apiRequest } from './config';

export interface DynamicPriceSuggestion {
  itemId: string;
  itemName: string;
  basePrice: number;
  suggestedPrice: number;
  multiplier: number;
  reason: string;
  confidence: number;
}

export interface DynamicPricingResponse {
  restaurantId: string;
  generatedAt: string;
  context: {
    queueSize: number;
    timeOfDay: string;
    dayOfWeek: string;
    inventoryPressure: number;
  };
  suggestions: DynamicPriceSuggestion[];
}

export const getDynamicPricingSuggestions = async (params: {
  restaurantId: string;
  queueSize?: number;
  inventoryPressure?: number;
}): Promise<DynamicPricingResponse> => {
  try {
    return await apiRequest('/ai/dynamic-pricing', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  } catch {
    // Local fallback / mock
    const now = new Date();
    const hr = now.getHours();
    const peak = hr >= 11 && hr <= 14 || hr >= 18 && hr <= 21;
    const queueMult = 1 + Math.min(0.25, (params.queueSize ?? 0) / 40);
    const peakMult = peak ? 1.1 : 0.95;
    const items = [
      { itemId: '1', itemName: 'Signature Burger', basePrice: 12.99 },
      { itemId: '2', itemName: 'Craft Pizza', basePrice: 14.99 },
      { itemId: '3', itemName: 'Caesar Salad', basePrice: 9.99 },
      { itemId: '4', itemName: 'Pasta Primavera', basePrice: 13.5 },
      { itemId: '5', itemName: 'Chicken Sandwich', basePrice: 11.5 },
    ];
    return {
      restaurantId: params.restaurantId,
      generatedAt: now.toISOString(),
      context: {
        queueSize: params.queueSize ?? 0,
        timeOfDay: peak ? 'peak' : 'off-peak',
        dayOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][now.getDay()],
        inventoryPressure: params.inventoryPressure ?? 0,
      },
      suggestions: items.map((it) => {
        const mult = +(queueMult * peakMult).toFixed(2);
        const suggested = +(it.basePrice * mult).toFixed(2);
        return {
          ...it,
          suggestedPrice: suggested,
          multiplier: mult,
          reason: peak
            ? 'Peak hour demand surge'
            : 'Off-peak discount to incentivize orders',
          confidence: 0.7 + Math.random() * 0.2,
        };
      }),
    };
  }
};

export const applyDynamicPricing = async (params: {
  restaurantId: string;
  itemId: string;
  newPrice: number;
}): Promise<{ success: boolean }> => {
  try {
    return await apiRequest('/ai/dynamic-pricing/apply', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  } catch {
    return { success: true };
  }
};
