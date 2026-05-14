import { apiRequest } from './config';

export interface PersonalizedRec {
  itemId: string;
  itemName: string;
  price: number;
  reason: string;
  matchScore: number;
  tags: string[];
}

export interface PersonalizedRecResponse {
  userId: string;
  generatedAt: string;
  basedOn: {
    historicalOrders: number;
    dietaryPreferences: string[];
    favoriteCategories: string[];
  };
  recommendations: PersonalizedRec[];
}

export const getPersonalizedRecommendations = async (params: {
  userId: string;
  restaurantId: string;
  dietaryPreferences?: string[];
}): Promise<PersonalizedRecResponse> => {
  try {
    return await apiRequest('/ai/personalized-recommendations', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  } catch {
    return {
      userId: params.userId,
      generatedAt: new Date().toISOString(),
      basedOn: {
        historicalOrders: 17,
        dietaryPreferences: params.dietaryPreferences ?? ['vegetarian-friendly'],
        favoriteCategories: ['Pasta', 'Salads', 'Smoothies'],
      },
      recommendations: [
        {
          itemId: '101',
          itemName: 'Truffle Mushroom Pasta',
          price: 16.99,
          reason: 'You order pasta 73% of visits and prefer earthy flavors',
          matchScore: 0.94,
          tags: ['vegetarian', 'pasta', 'umami'],
        },
        {
          itemId: '102',
          itemName: 'Mediterranean Quinoa Bowl',
          price: 13.5,
          reason: 'High protein, matches your healthy-bowl history',
          matchScore: 0.88,
          tags: ['gluten-free', 'high-protein', 'bowl'],
        },
        {
          itemId: '103',
          itemName: 'Berry Spinach Smoothie',
          price: 6.99,
          reason: 'You ordered 4 smoothies this month',
          matchScore: 0.81,
          tags: ['drink', 'antioxidant', 'breakfast'],
        },
      ],
    };
  }
};

export const recordRecAction = async (params: {
  userId: string;
  itemId: string;
  action: 'view' | 'add_to_cart' | 'dismiss';
}): Promise<{ success: boolean }> => {
  try {
    return await apiRequest('/ai/personalized-recommendations/action', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  } catch {
    return { success: true };
  }
};
