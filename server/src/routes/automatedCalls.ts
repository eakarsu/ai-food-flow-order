import { Router } from 'express';
import twilio from 'twilio';

const router = Router();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

// Check if Twilio is configured
const isTwilioConfigured = () => {
  return accountSid && authToken && twilioPhone &&
         accountSid !== 'your_twilio_account_sid' &&
         authToken !== 'your_twilio_auth_token';
};

// Get the base URL for TwiML callbacks
const getBaseUrl = (req: any): string => {
  // Use ngrok URL if available, otherwise construct from request
  const ngrokUrl = process.env.NGROK_URL || req.headers['x-ngrok-url'];
  if (ngrokUrl) {
    return ngrokUrl;
  }
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.headers['x-forwarded-host'] || req.get('host');
  return `${protocol}://${host}`;
};

// ============================================
// OUTBOUND CALL ENDPOINTS
// ============================================

// Call customer when order is ready
router.post('/order-ready', async (req, res) => {
  try {
    const { phoneNumber, customerName, orderNumber, restaurantName, pickupTime } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    if (!isTwilioConfigured()) {
      console.log('Twilio not configured - simulating order ready call');
      return res.json({
        success: true,
        simulated: true,
        message: `Would call ${phoneNumber} about order ${orderNumber} being ready`
      });
    }

    const client = twilio(accountSid, authToken);
    const baseUrl = getBaseUrl(req);

    const call = await client.calls.create({
      to: phoneNumber,
      from: twilioPhone!,
      url: `${baseUrl}/api/automated-calls/twiml/order-ready?customerName=${encodeURIComponent(customerName || 'Customer')}&orderNumber=${encodeURIComponent(orderNumber || '')}&restaurantName=${encodeURIComponent(restaurantName || 'the restaurant')}&pickupTime=${encodeURIComponent(pickupTime || '15 minutes')}`,
      statusCallback: `${baseUrl}/api/automated-calls/status`,
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
    });

    console.log('Order ready call initiated:', call.sid);
    res.json({ success: true, callSid: call.sid });
  } catch (error: any) {
    console.error('Error making order ready call:', error);
    res.status(500).json({ error: error.message || 'Failed to make call' });
  }
});

// Call customer with delivery update
router.post('/delivery-update', async (req, res) => {
  try {
    const { phoneNumber, customerName, orderNumber, driverName, estimatedTime } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    if (!isTwilioConfigured()) {
      console.log('Twilio not configured - simulating delivery update call');
      return res.json({
        success: true,
        simulated: true,
        message: `Would call ${phoneNumber} about delivery update`
      });
    }

    const client = twilio(accountSid, authToken);
    const baseUrl = getBaseUrl(req);

    const call = await client.calls.create({
      to: phoneNumber,
      from: twilioPhone!,
      url: `${baseUrl}/api/automated-calls/twiml/delivery-update?customerName=${encodeURIComponent(customerName || 'Customer')}&orderNumber=${encodeURIComponent(orderNumber || '')}&driverName=${encodeURIComponent(driverName || 'your driver')}&estimatedTime=${encodeURIComponent(estimatedTime || '10 minutes')}`,
      statusCallback: `${baseUrl}/api/automated-calls/status`,
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
    });

    console.log('Delivery update call initiated:', call.sid);
    res.json({ success: true, callSid: call.sid });
  } catch (error: any) {
    console.error('Error making delivery update call:', error);
    res.status(500).json({ error: error.message || 'Failed to make call' });
  }
});

// Call lead with promotional message
router.post('/promotional', async (req, res) => {
  try {
    const { phoneNumber, customerName, promoCode, discount, restaurantName } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    if (!isTwilioConfigured()) {
      console.log('Twilio not configured - simulating promotional call');
      return res.json({
        success: true,
        simulated: true,
        message: `Would call ${phoneNumber} with promotional offer`
      });
    }

    const client = twilio(accountSid, authToken);
    const baseUrl = getBaseUrl(req);

    const call = await client.calls.create({
      to: phoneNumber,
      from: twilioPhone!,
      url: `${baseUrl}/api/automated-calls/twiml/promotional?customerName=${encodeURIComponent(customerName || 'Valued Customer')}&promoCode=${encodeURIComponent(promoCode || 'SAVE20')}&discount=${encodeURIComponent(discount || '20%')}&restaurantName=${encodeURIComponent(restaurantName || 'OrderlyBite')}`,
      statusCallback: `${baseUrl}/api/automated-calls/status`,
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
    });

    console.log('Promotional call initiated:', call.sid);
    res.json({ success: true, callSid: call.sid });
  } catch (error: any) {
    console.error('Error making promotional call:', error);
    res.status(500).json({ error: error.message || 'Failed to make call' });
  }
});

// Generic call with custom message
router.post('/custom', async (req, res) => {
  try {
    const { phoneNumber, message, gatherResponse } = req.body;

    if (!phoneNumber || !message) {
      return res.status(400).json({ error: 'Phone number and message are required' });
    }

    if (!isTwilioConfigured()) {
      console.log('Twilio not configured - simulating custom call');
      return res.json({
        success: true,
        simulated: true,
        message: `Would call ${phoneNumber} with message: ${message}`
      });
    }

    const client = twilio(accountSid, authToken);
    const baseUrl = getBaseUrl(req);

    const call = await client.calls.create({
      to: phoneNumber,
      from: twilioPhone!,
      url: `${baseUrl}/api/automated-calls/twiml/custom?message=${encodeURIComponent(message)}&gatherResponse=${gatherResponse ? 'true' : 'false'}`,
      statusCallback: `${baseUrl}/api/automated-calls/status`,
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
    });

    console.log('Custom call initiated:', call.sid);
    res.json({ success: true, callSid: call.sid });
  } catch (error: any) {
    console.error('Error making custom call:', error);
    res.status(500).json({ error: error.message || 'Failed to make call' });
  }
});

// ============================================
// TWIML ENDPOINTS (for Twilio to fetch)
// ============================================

// TwiML for order ready call
router.post('/twiml/order-ready', (req, res) => {
  const customerName = req.query.customerName || 'Customer';
  const orderNumber = req.query.orderNumber || 'your order';
  const restaurantName = req.query.restaurantName || 'the restaurant';
  const pickupTime = req.query.pickupTime || '15 minutes';

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">
    Hello ${customerName}! This is an automated call from ${restaurantName}.
    Great news! Order number ${orderNumber} is now ready for pickup.
    Please arrive within ${pickupTime} to collect your fresh order.
  </Say>
  <Pause length="1"/>
  <Gather numDigits="1" action="/api/automated-calls/handle-response?type=order-ready" method="POST" timeout="10">
    <Say voice="Polly.Joanna">
      Press 1 to confirm you're on your way.
      Press 2 if you need more time.
      Press 3 to speak with the restaurant.
    </Say>
  </Gather>
  <Say voice="Polly.Joanna">
    We didn't receive your response. Your order will be kept warm. Thank you for choosing ${restaurantName}!
  </Say>
</Response>`;

  res.type('text/xml');
  res.send(twiml);
});

// TwiML for delivery update call
router.post('/twiml/delivery-update', (req, res) => {
  const customerName = req.query.customerName || 'Customer';
  const orderNumber = req.query.orderNumber || 'your order';
  const driverName = req.query.driverName || 'your driver';
  const estimatedTime = req.query.estimatedTime || '10 minutes';

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">
    Hello ${customerName}! This is a delivery update for order number ${orderNumber}.
    ${driverName} is on the way with your food and should arrive in approximately ${estimatedTime}.
  </Say>
  <Pause length="1"/>
  <Gather numDigits="1" action="/api/automated-calls/handle-response?type=delivery" method="POST" timeout="10">
    <Say voice="Polly.Joanna">
      Press 1 to confirm your delivery address.
      Press 2 to add delivery instructions.
      Press 3 to contact the driver.
    </Say>
  </Gather>
  <Say voice="Polly.Joanna">
    Thank you! Your delivery is on its way. Enjoy your meal!
  </Say>
</Response>`;

  res.type('text/xml');
  res.send(twiml);
});

// TwiML for promotional call
router.post('/twiml/promotional', (req, res) => {
  const customerName = req.query.customerName || 'Valued Customer';
  const promoCode = req.query.promoCode || 'SAVE20';
  const discount = req.query.discount || '20%';
  const restaurantName = req.query.restaurantName || 'OrderlyBite';

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">
    Hello ${customerName}! This is ${restaurantName} with an exclusive offer just for you!
    For a limited time, use promo code ${promoCode} to get ${discount} off your next order.
    That's ${promoCode} for ${discount} savings!
  </Say>
  <Pause length="1"/>
  <Gather numDigits="1" action="/api/automated-calls/handle-response?type=promotional" method="POST" timeout="10">
    <Say voice="Polly.Joanna">
      Press 1 to receive this offer by text message.
      Press 2 to place an order now.
      Press 9 to opt out of future promotional calls.
    </Say>
  </Gather>
  <Say voice="Polly.Joanna">
    Remember, use code ${promoCode} for ${discount} off. Thank you for being a valued customer!
  </Say>
</Response>`;

  res.type('text/xml');
  res.send(twiml);
});

// TwiML for custom message
router.post('/twiml/custom', (req, res) => {
  const message = req.query.message || 'This is an automated message.';
  const gatherResponse = req.query.gatherResponse === 'true';

  let twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">${message}</Say>`;

  if (gatherResponse) {
    twiml += `
  <Pause length="1"/>
  <Gather numDigits="1" action="/api/automated-calls/handle-response?type=custom" method="POST" timeout="10">
    <Say voice="Polly.Joanna">
      Press 1 to confirm.
      Press 2 to hear the message again.
      Press 0 to speak with a representative.
    </Say>
  </Gather>`;
  }

  twiml += `
  <Say voice="Polly.Joanna">Thank you for your time. Goodbye!</Say>
</Response>`;

  res.type('text/xml');
  res.send(twiml);
});

// Handle user responses from Gather
router.post('/handle-response', (req, res) => {
  const digit = req.body.Digits;
  const type = req.query.type;
  const callSid = req.body.CallSid;
  const from = req.body.From;

  console.log(`Response received - Type: ${type}, Digit: ${digit}, CallSid: ${callSid}`);

  let twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>`;

  switch (type) {
    case 'order-ready':
      if (digit === '1') {
        twiml += `<Say voice="Polly.Joanna">Great! We'll have your order ready and waiting. See you soon!</Say>`;
      } else if (digit === '2') {
        twiml += `<Say voice="Polly.Joanna">No problem! Your order will be kept fresh. Take your time.</Say>`;
      } else if (digit === '3') {
        twiml += `<Say voice="Polly.Joanna">Please hold while we connect you to the restaurant.</Say>
        <Dial>${process.env.TWILIO_PHONE_NUMBER}</Dial>`;
      }
      break;

    case 'delivery':
      if (digit === '1') {
        twiml += `<Say voice="Polly.Joanna">Your delivery address has been confirmed. Thank you!</Say>`;
      } else if (digit === '2') {
        twiml += `<Say voice="Polly.Joanna">Please leave your delivery instructions after the beep.</Say>
        <Record maxLength="30" action="/api/automated-calls/handle-recording" />`;
      } else if (digit === '3') {
        twiml += `<Say voice="Polly.Joanna">Connecting you to your driver now.</Say>
        <Dial>${process.env.TWILIO_PHONE_NUMBER}</Dial>`;
      }
      break;

    case 'promotional':
      if (digit === '1') {
        twiml += `<Say voice="Polly.Joanna">We'll send you a text message with the promo code shortly. Thank you!</Say>`;
        // TODO: Trigger SMS with promo code
      } else if (digit === '2') {
        twiml += `<Say voice="Polly.Joanna">Connecting you to place an order now.</Say>
        <Dial>${process.env.TWILIO_PHONE_NUMBER}</Dial>`;
      } else if (digit === '9') {
        twiml += `<Say voice="Polly.Joanna">You've been removed from our promotional call list. We're sorry to see you go!</Say>`;
        // TODO: Update opt-out preference in database
      }
      break;

    case 'custom':
      if (digit === '1') {
        twiml += `<Say voice="Polly.Joanna">Thank you for confirming!</Say>`;
      } else if (digit === '2') {
        twiml += `<Redirect>/api/automated-calls/twiml/custom?message=${encodeURIComponent(req.query.message as string || '')}</Redirect>`;
      } else if (digit === '0') {
        twiml += `<Say voice="Polly.Joanna">Please hold while we connect you.</Say>
        <Dial>${process.env.TWILIO_PHONE_NUMBER}</Dial>`;
      }
      break;

    default:
      twiml += `<Say voice="Polly.Joanna">Thank you for your response.</Say>`;
  }

  twiml += `</Response>`;

  res.type('text/xml');
  res.send(twiml);
});

// Handle voice recordings
router.post('/handle-recording', (req, res) => {
  const recordingUrl = req.body.RecordingUrl;
  const callSid = req.body.CallSid;

  console.log(`Recording received - CallSid: ${callSid}, URL: ${recordingUrl}`);

  // TODO: Save recording URL to database

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">Thank you! Your message has been recorded and will be passed along to the driver.</Say>
</Response>`;

  res.type('text/xml');
  res.send(twiml);
});

// Call status callback
router.post('/status', (req, res) => {
  const { CallSid, CallStatus, To, From, Duration } = req.body;
  console.log(`Call status update - SID: ${CallSid}, Status: ${CallStatus}, To: ${To}, Duration: ${Duration}s`);

  // TODO: Update call status in database, trigger webhooks, etc.

  res.sendStatus(200);
});

export default router;
