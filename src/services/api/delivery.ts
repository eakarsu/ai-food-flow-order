import apiRequest from './config';

export interface DeliveryStatus {
  order: {
    id: string;
    status: string;
    estimatedDeliveryTime?: string;
    actualDeliveryTime?: string;
    deliveryAddress?: {
      streetAddress: string;
      apartment?: string;
      city: string;
      state: string;
      zipCode: string;
    };
    restaurant?: {
      name: string;
      address?: string;
      latitude?: number;
      longitude?: number;
    };
  };
  delivery: {
    driverName?: string;
    driverPhone?: string;
    driverPhotoUrl?: string;
    currentLocation?: {
      latitude?: number;
      longitude?: number;
    };
    status: string;
    etaMinutes?: number;
    lastUpdated: string;
  } | null;
  statusHistory: {
    status: string;
    notes?: string;
    timestamp: string;
  }[];
}

export interface DeliveryHistoryItem {
  orderId: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  estimatedDeliveryTime?: string;
  actualDeliveryTime?: string;
  orderedAt: string;
  deliveryAddress?: any;
  restaurantName?: string;
  driverName?: string;
}

// Get delivery status for an order
export const getDeliveryStatus = async (orderId: string): Promise<DeliveryStatus> => {
  return apiRequest(`/delivery/orders/${orderId}/status`);
};

// Get delivery history
export const getDeliveryHistory = async (params?: {
  page?: number;
  limit?: number;
}): Promise<{ deliveries: DeliveryHistoryItem[] }> => {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
  }
  const queryString = searchParams.toString();
  return apiRequest(`/delivery/history${queryString ? `?${queryString}` : ''}`);
};
