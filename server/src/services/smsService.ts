import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

const isTwilioConfigured = () =>
  accountSid &&
  authToken &&
  twilioPhone &&
  accountSid !== 'your_twilio_account_sid' &&
  authToken !== 'your_twilio_auth_token';

export interface OrderConfirmationDetails {
  orderNumber: string;
  restaurantName: string;
  totalAmount: number;
  estimatedDeliveryTime: Date;
  items: Array<{ name: string; quantity: number }>;
}

export async function sendOrderConfirmation(
  phone: string,
  orderDetails: OrderConfirmationDetails
): Promise<{ success: boolean; sid?: string; simulated?: boolean }> {
  const itemList = orderDetails.items
    .map(i => `${i.quantity}x ${i.name}`)
    .join(', ');

  const eta = orderDetails.estimatedDeliveryTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const message =
    `OrderlyBite Confirmation ✅\n` +
    `Order #${orderDetails.orderNumber}\n` +
    `${itemList}\n` +
    `Total: $${orderDetails.totalAmount.toFixed(2)}\n` +
    `Est. delivery: ${eta}\n` +
    `Thanks for ordering from ${orderDetails.restaurantName}!`;

  if (!isTwilioConfigured()) {
    console.log(`[SMS SIMULATED] To: ${phone}\n${message}`);
    return { success: true, simulated: true };
  }

  try {
    const client = twilio(accountSid, authToken);
    const result = await client.messages.create({
      body: message,
      from: twilioPhone!,
      to: phone,
    });
    console.log(`SMS sent to ${phone}, SID: ${result.sid}`);
    return { success: true, sid: result.sid };
  } catch (error: any) {
    console.error('Failed to send order confirmation SMS:', error.message);
    // Do not throw — SMS failure should not fail the order
    return { success: false };
  }
}
