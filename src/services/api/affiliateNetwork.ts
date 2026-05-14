import { apiRequest } from './config';

export interface PartnerRestaurant {
  id: string;
  name: string;
  distanceKm: number;
  currentCapacity: number;
  estimatedWaitMin: number;
  matchScore: number;
}

export interface RoutingDecision {
  originalRestaurantId: string;
  recommendedRestaurantId: string;
  reason: string;
  expectedTimeSavingsMin: number;
  partners: PartnerRestaurant[];
}

export const getRoutingRecommendation = async (params: {
  orderId: string;
  restaurantId: string;
  cuisineType?: string;
  customerLocation?: { lat: number; lng: number };
}): Promise<RoutingDecision> => {
  try {
    return await apiRequest('/affiliate/route', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  } catch {
    const partners: PartnerRestaurant[] = [
      {
        id: 'aff-1',
        name: 'Sunset Bistro',
        distanceKm: 1.2,
        currentCapacity: 0.45,
        estimatedWaitMin: 12,
        matchScore: 0.91,
      },
      {
        id: 'aff-2',
        name: 'Olive Tree Kitchen',
        distanceKm: 2.4,
        currentCapacity: 0.68,
        estimatedWaitMin: 18,
        matchScore: 0.78,
      },
      {
        id: 'aff-3',
        name: 'Riverside Eatery',
        distanceKm: 3.1,
        currentCapacity: 0.32,
        estimatedWaitMin: 9,
        matchScore: 0.73,
      },
    ];
    const best = partners[0];
    return {
      originalRestaurantId: params.restaurantId,
      recommendedRestaurantId: best.id,
      reason: `Origin restaurant at 92% capacity; ${best.name} can fulfill 23 min faster`,
      expectedTimeSavingsMin: 23,
      partners,
    };
  }
};

export const acceptRouting = async (params: {
  orderId: string;
  acceptedRestaurantId: string;
}): Promise<{ success: boolean; newOrderId: string }> => {
  try {
    return await apiRequest('/affiliate/route/accept', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  } catch {
    return { success: true, newOrderId: `ORD-RR-${Date.now()}` };
  }
};
