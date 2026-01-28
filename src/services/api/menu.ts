import apiRequest from './config';

export interface MenuItem {
  id: string;
  categoryId: string;
  categoryName?: string;
  restaurantId?: string;
  restaurantName?: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  isFeatured: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  spiceLevel: number;
  calories?: number;
  prepTime?: number;
  customizationRules?: any;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  displayOrder: number;
  items?: MenuItem[];
}

export interface Restaurant {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  address?: string;
  city?: string;
  state?: string;
  rating: number;
  reviewCount: number;
  cuisineType?: string;
  priceRange: string;
  deliveryFee: number;
  minOrderAmount: number;
  estimatedDeliveryTime: number;
  isOpen: boolean;
}

// Get all categories
export const getCategories = async (restaurantId?: string): Promise<{ categories: Category[] }> => {
  const params = restaurantId ? `?restaurantId=${restaurantId}` : '';
  return apiRequest(`/menu/categories${params}`, { skipAuth: true });
};

// Get menu items
export const getMenuItems = async (params?: {
  categoryId?: string;
  restaurantId?: string;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  page?: number;
  limit?: number;
}): Promise<{ items: MenuItem[] }> => {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
  }
  const queryString = searchParams.toString();
  return apiRequest(`/menu/items${queryString ? `?${queryString}` : ''}`, { skipAuth: true });
};

// Get single menu item
export const getMenuItem = async (id: string): Promise<{ item: MenuItem }> => {
  return apiRequest(`/menu/items/${id}`, { skipAuth: true });
};

// Search menu items
export const searchMenuItems = async (
  query: string,
  limit = 50
): Promise<{ items: MenuItem[] }> => {
  return apiRequest(`/menu/items/search?q=${encodeURIComponent(query)}&limit=${limit}`, {
    skipAuth: true,
  });
};

// Get featured items
export const getFeaturedItems = async (limit = 10): Promise<{ items: MenuItem[] }> => {
  return apiRequest(`/menu/items/featured?limit=${limit}`, { skipAuth: true });
};

// Restaurant endpoints
export const getRestaurants = async (params?: {
  cuisineType?: string;
  isOpen?: boolean;
  page?: number;
  limit?: number;
}): Promise<{ restaurants: Restaurant[]; pagination: any }> => {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
  }
  const queryString = searchParams.toString();
  return apiRequest(`/restaurants${queryString ? `?${queryString}` : ''}`, { skipAuth: true });
};

export const getRestaurant = async (id: string): Promise<{ restaurant: Restaurant }> => {
  return apiRequest(`/restaurants/${id}`, { skipAuth: true });
};

export const getRestaurantMenu = async (id: string): Promise<{ categories: Category[] }> => {
  return apiRequest(`/restaurants/${id}/menu`, { skipAuth: true });
};

export const searchRestaurants = async (
  query: string
): Promise<{ restaurants: Restaurant[] }> => {
  return apiRequest(`/restaurants/search?q=${encodeURIComponent(query)}`, { skipAuth: true });
};
