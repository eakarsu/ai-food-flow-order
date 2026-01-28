import apiRequest from './config';

export interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  categoryName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customizations?: Record<string, any>;
  specialInstructions?: string;
}

export interface CartRestaurant {
  id: string;
  name: string;
  deliveryFee: number;
  minOrderAmount: number;
  estimatedDeliveryTime: number;
}

export interface Cart {
  id: string;
  restaurant: CartRestaurant | null;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
}

// Get cart
export const getCart = async (): Promise<{ cart: Cart }> => {
  return apiRequest('/cart');
};

// Add item to cart
export const addToCart = async (data: {
  menuItemId: string;
  quantity: number;
  customizations?: Record<string, any>;
  specialInstructions?: string;
}): Promise<{ message: string; cartItem: any }> => {
  return apiRequest('/cart/items', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// Update cart item
export const updateCartItem = async (
  itemId: string,
  data: {
    quantity?: number;
    customizations?: Record<string, any>;
    specialInstructions?: string;
  }
): Promise<{ message: string; cartItem: any }> => {
  return apiRequest(`/cart/items/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

// Remove item from cart
export const removeFromCart = async (itemId: string): Promise<{ message: string }> => {
  return apiRequest(`/cart/items/${itemId}`, { method: 'DELETE' });
};

// Clear cart
export const clearCart = async (): Promise<{ message: string }> => {
  return apiRequest('/cart', { method: 'DELETE' });
};
