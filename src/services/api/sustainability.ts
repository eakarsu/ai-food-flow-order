import { apiRequest } from './config';

export interface SustainabilityScore {
  orderId: string;
  totalCo2Kg: number;
  packagingScore: number;
  deliveryScore: number;
  ingredientScore: number;
  overallScore: number;
  rating: 'A' | 'B' | 'C' | 'D' | 'F';
  loyaltyPointsEarned: number;
  suggestions: string[];
}

export const calculateOrderSustainability = async (params: {
  orderId: string;
  items: Array<{ name: string; quantity: number; category?: string }>;
  deliveryDistanceKm?: number;
  packagingType?: 'plastic' | 'compostable' | 'reusable';
}): Promise<SustainabilityScore> => {
  try {
    return await apiRequest('/sustainability/calculate', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  } catch {
    const itemCo2 = params.items.reduce((sum, i) => {
      const factor = i.category === 'meat' ? 5 : i.category === 'dairy' ? 2 : 0.8;
      return sum + factor * i.quantity;
    }, 0);
    const dist = params.deliveryDistanceKm ?? 4;
    const deliveryCo2 = dist * 0.18;
    const packagingMap = { plastic: 0.4, compostable: 0.1, reusable: 0.02 };
    const packagingCo2 = packagingMap[params.packagingType ?? 'plastic'] * params.items.length;
    const total = +(itemCo2 + deliveryCo2 + packagingCo2).toFixed(2);
    const ingredient = Math.max(0, 100 - itemCo2 * 5);
    const delivery = Math.max(0, 100 - dist * 6);
    const packaging =
      params.packagingType === 'reusable'
        ? 95
        : params.packagingType === 'compostable'
        ? 75
        : 35;
    const overall = Math.round((ingredient + delivery + packaging) / 3);
    const rating: SustainabilityScore['rating'] =
      overall >= 85 ? 'A' : overall >= 70 ? 'B' : overall >= 55 ? 'C' : overall >= 40 ? 'D' : 'F';
    return {
      orderId: params.orderId,
      totalCo2Kg: total,
      packagingScore: packaging,
      deliveryScore: delivery,
      ingredientScore: Math.round(ingredient),
      overallScore: overall,
      rating,
      loyaltyPointsEarned: rating === 'A' ? 50 : rating === 'B' ? 30 : rating === 'C' ? 15 : 5,
      suggestions: [
        params.packagingType !== 'reusable' ? 'Choose reusable packaging next time (+15pt)' : '',
        dist > 5 ? 'Order from a closer location to reduce delivery footprint' : '',
        itemCo2 > 8 ? 'Try a plant-based alternative to reduce CO₂' : '',
      ].filter(Boolean),
    };
  }
};
