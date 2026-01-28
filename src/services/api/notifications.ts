import apiRequest from './config';

export interface NotificationSettings {
  orderUpdates: boolean;
  promotions: boolean;
  newRestaurants: boolean;
  deliveryUpdates: boolean;
}

// Register device for push notifications
export const registerDevice = async (data: {
  fcmToken: string;
  deviceType?: 'ios' | 'android' | 'web';
  deviceId?: string;
}): Promise<{ message: string }> => {
  return apiRequest('/notifications/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// Unregister device
export const unregisterDevice = async (fcmToken: string): Promise<{ message: string }> => {
  return apiRequest('/notifications/unregister', {
    method: 'POST',
    body: JSON.stringify({ fcmToken }),
  });
};

// Get notification settings
export const getNotificationSettings = async (): Promise<{ settings: NotificationSettings }> => {
  return apiRequest('/notifications/settings');
};

// Update notification settings
export const updateNotificationSettings = async (
  settings: Partial<NotificationSettings>
): Promise<{ message: string; settings: NotificationSettings }> => {
  return apiRequest('/notifications/settings', {
    method: 'PATCH',
    body: JSON.stringify(settings),
  });
};
