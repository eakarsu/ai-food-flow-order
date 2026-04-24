import { apiRequest } from './config';

export const seedInventory = async (): Promise<{ message: string; total: number }> => {
  return apiRequest('/seed/inventory', { method: 'POST' });
};

export const seedStaff = async (): Promise<{ message: string; total: number }> => {
  return apiRequest('/seed/staff', { method: 'POST' });
};

export const seedReviews = async (): Promise<{ message: string; total: number }> => {
  return apiRequest('/seed/reviews', { method: 'POST' });
};

export const seedWaitTime = async (): Promise<{ message: string; total: number }> => {
  return apiRequest('/seed/wait-time', { method: 'POST' });
};

export const seedUpsell = async (): Promise<{ message: string; total: number }> => {
  return apiRequest('/seed/upsell', { method: 'POST' });
};

export const seedAll = async (): Promise<{
  message: string;
  inventory: number;
  staff: number;
  reviews: number;
  waitTime: number;
  upsell: number;
}> => {
  return apiRequest('/seed/all', { method: 'POST' });
};
