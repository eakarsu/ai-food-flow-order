import apiRequest from './config';

export interface PaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
}

// Create payment intent
export const createPaymentIntent = async (orderId: string): Promise<PaymentIntent> => {
  return apiRequest('/payments/create-intent', {
    method: 'POST',
    body: JSON.stringify({ orderId }),
  });
};

// Confirm payment
export const confirmPayment = async (
  paymentIntentId: string,
  orderId: string
): Promise<{ status: string; message: string }> => {
  return apiRequest('/payments/confirm', {
    method: 'POST',
    body: JSON.stringify({ paymentIntentId, orderId }),
  });
};

// Get saved payment methods
export const getPaymentMethods = async (): Promise<{ paymentMethods: any[] }> => {
  return apiRequest('/payments/methods');
};

// Add payment method
export const addPaymentMethod = async (data: any): Promise<{ message: string }> => {
  return apiRequest('/payments/methods', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// Remove payment method
export const removePaymentMethod = async (id: string): Promise<{ message: string }> => {
  return apiRequest(`/payments/methods/${id}`, { method: 'DELETE' });
};
