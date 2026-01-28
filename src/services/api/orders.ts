import apiRequest from './config';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customizations?: Record<string, any>;
  specialInstructions?: string;
}

export interface OrderStatusHistory {
  status: string;
  notes?: string;
  createdAt: string;
}

export interface DeliveryInfo {
  driverName?: string;
  driverPhone?: string;
  driverPhotoUrl?: string;
  currentLatitude?: number;
  currentLongitude?: number;
  status: string;
  etaMinutes?: number;
  lastUpdated: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  taxAmount: number;
  deliveryFee: number;
  tipAmount: number;
  discountAmount?: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  specialInstructions?: string;
  estimatedDeliveryTime?: string;
  actualDeliveryTime?: string;
  createdAt: string;
  deliveryAddress?: {
    streetAddress: string;
    apartment?: string;
    city: string;
    state: string;
    zipCode: string;
  };
  restaurant?: {
    name: string;
    imageUrl?: string;
    phone?: string;
  };
  restaurantName?: string;
  restaurantImage?: string;
  itemCount?: number;
  items?: OrderItem[];
  statusHistory?: OrderStatusHistory[];
  delivery?: DeliveryInfo | null;
}

export interface CreateOrderData {
  deliveryAddressId: string;
  paymentMethod: 'card' | 'paypal' | 'apple_pay';
  tipAmount?: number;
  specialInstructions?: string;
}

// Create order
export const createOrder = async (data: CreateOrderData): Promise<{
  message: string;
  order: Order;
}> => {
  return apiRequest('/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// Get orders
export const getOrders = async (params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ orders: Order[] }> => {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
  }
  const queryString = searchParams.toString();
  return apiRequest(`/orders${queryString ? `?${queryString}` : ''}`);
};

// Get single order
export const getOrder = async (id: string): Promise<{ order: Order }> => {
  return apiRequest(`/orders/${id}`);
};

// Cancel order
export const cancelOrder = async (
  id: string,
  reason?: string
): Promise<{ message: string }> => {
  return apiRequest(`/orders/${id}/cancel`, {
    method: 'PATCH',
    body: JSON.stringify({ reason }),
  });
};

// Reorder from previous order
export const reorder = async (orderId: string): Promise<{ message: string }> => {
  return apiRequest(`/orders/${orderId}/reorder`, { method: 'POST' });
};
