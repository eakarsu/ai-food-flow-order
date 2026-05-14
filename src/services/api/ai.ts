import { apiRequest } from './config';

// Types
export interface WaitTimePrediction {
  id: string;
  predictedMinutes: number;
  confidence: number;
  factors: {
    orderComplexity: string;
    queueImpact: string;
    timeImpact: string;
    staffingImpact: string;
  };
  explanation: string;
  context: {
    currentQueueSize: number;
    timeOfDay: string;
    dayOfWeek: string;
    staffCount: number;
  };
}

export interface WaitTimePredictionHistory {
  id: string;
  restaurantId: string;
  orderId?: string;
  orderNumber?: string;
  predictedMinutes: number;
  actualMinutes?: number;
  orderItemsCount: number;
  currentQueueSize: number;
  timeOfDay: string;
  dayOfWeek: string;
  confidence?: number;
  factors?: Record<string, string>;
  createdAt: string;
}

export interface UpsellRecommendation {
  itemId: string;
  itemName: string;
  reason: string;
  confidence: number;
  item?: {
    id: string;
    name: string;
    price: number;
    description?: string;
    imageUrl?: string;
  };
}

export interface UpsellHistory {
  id: string;
  restaurantId: string;
  cartId?: string;
  userId?: string;
  userName?: string;
  cartItems: Array<{ name: string; price: number }>;
  recommendedItems: UpsellRecommendation[];
  recommendationReason?: string;
  confidence?: number;
  wasAccepted?: boolean;
  acceptedItemId?: string;
  createdAt: string;
}

// API Functions
export const predictWaitTime = async (data: {
  restaurantId: string;
  orderItems: Array<{ name: string; quantity: number }>;
  orderId?: string;
}): Promise<{ prediction: WaitTimePrediction }> => {
  return apiRequest('/ai/wait-time', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const getUpsellRecommendations = async (data: {
  restaurantId: string;
  cartItems: Array<{ name: string; price: number }>;
  cartId?: string;
}): Promise<{
  recommendations: UpsellRecommendation[];
  totalConfidence: number;
}> => {
  return apiRequest('/ai/upsell', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const recordUpsellAcceptance = async (data: {
  recommendationId: string;
  wasAccepted: boolean;
  acceptedItemId?: string;
}): Promise<{ success: boolean }> => {
  return apiRequest('/ai/upsell/accept', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const getWaitTimePredictionHistory = async (params?: {
  restaurantId?: string;
  limit?: number;
  offset?: number;
}): Promise<{ predictions: WaitTimePredictionHistory[] }> => {
  const queryParams = new URLSearchParams();
  if (params?.restaurantId) queryParams.set('restaurantId', params.restaurantId);
  if (params?.limit) queryParams.set('limit', String(params.limit));
  if (params?.offset) queryParams.set('offset', String(params.offset));

  const queryString = queryParams.toString();
  return apiRequest(`/ai/wait-time/history${queryString ? `?${queryString}` : ''}`);
};

export const getUpsellHistory = async (params?: {
  restaurantId?: string;
  limit?: number;
  offset?: number;
}): Promise<{ recommendations: UpsellHistory[] }> => {
  const queryParams = new URLSearchParams();
  if (params?.restaurantId) queryParams.set('restaurantId', params.restaurantId);
  if (params?.limit) queryParams.set('limit', String(params.limit));
  if (params?.offset) queryParams.set('offset', String(params.offset));

  const queryString = queryParams.toString();
  return apiRequest(`/ai/upsell/history${queryString ? `?${queryString}` : ''}`);
};

export const updateActualWaitTime = async (data: {
  predictionId: string;
  actualMinutes: number;
}): Promise<{ success: boolean }> => {
  return apiRequest('/ai/wait-time/actual', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const deleteWaitTimePrediction = async (
  id: string
): Promise<{ message: string }> => {
  return apiRequest(`/ai/wait-time/${id}`, { method: 'DELETE' });
};

export const bulkDeleteWaitTimePredictions = async (
  ids: string[]
): Promise<{ message: string; deletedCount: number }> => {
  return apiRequest('/ai/wait-time/bulk-delete', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  });
};

export const deleteUpsellRecommendation = async (
  id: string
): Promise<{ message: string }> => {
  return apiRequest(`/ai/upsell/${id}`, { method: 'DELETE' });
};

export const bulkDeleteUpsellRecommendations = async (
  ids: string[]
): Promise<{ message: string; deletedCount: number }> => {
  return apiRequest('/ai/upsell/bulk-delete', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  });
};

// Apply pass 5 — additive backlog client helpers.
// All hit OPENROUTER_API_KEY-gated server endpoints (return 503 if unset).
export const aiDemandForecast = (data: { restaurantId?: string; hours?: number }) =>
  apiRequest('/ai/demand-forecast', { method: 'POST', body: JSON.stringify(data) });

export const aiRouteOptimization = (data: {
  driverId?: string;
  stops: Array<{ id: string; lat: number; lng: number; address?: string; dueBy?: string }>;
}) =>
  apiRequest('/ai/route-optimization', { method: 'POST', body: JSON.stringify(data) });

export const aiMenuRecommendationCold = (data: { context?: Record<string, unknown> }) =>
  apiRequest('/ai/menu-recommendation-cold', { method: 'POST', body: JSON.stringify(data) });

export const aiFraudDetection = (data: { userId?: string; paymentRef?: string }) =>
  apiRequest('/ai/fraud-detection', { method: 'POST', body: JSON.stringify(data) });

export const aiChurnPrediction = (data: { userId?: string }) =>
  apiRequest('/ai/churn-prediction', { method: 'POST', body: JSON.stringify(data) });

export const aiRestaurantHealthScore = (data: { restaurantId: string }) =>
  apiRequest('/ai/restaurant-health-score', { method: 'POST', body: JSON.stringify(data) });

export const aiLoyaltyStatus = () => apiRequest('/ai/loyalty/status');

export const aiDynamicSurgePolicy = (data: {
  restaurantId?: string;
  currentQueueSize?: number;
  timeOfDay?: string;
}) =>
  apiRequest('/ai/dynamic-surge-policy', { method: 'POST', body: JSON.stringify(data) });
