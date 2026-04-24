import { Router } from 'express';
import twilio from 'twilio';
import express from 'express';

const router = Router();

// Parse URL-encoded bodies
router.use(express.urlencoded({ extended: true }));

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

// Check if Twilio is configured
const isTwilioConfigured = () => {
  return accountSid && authToken && twilioPhone &&
         accountSid !== 'your_twilio_account_sid' &&
         authToken !== 'your_twilio_auth_token';
};

// Generate voice token
router.post('/twilio-token', async (req, res) => {
  try {
    const { identity, ngrokUrl } = req.body;

    if (!isTwilioConfigured()) {
      console.log('Twilio not configured - returning simulated token');
      return res.json({
        token: 'SIMULATED_TOKEN_' + Date.now(),
        message: 'Twilio not configured - using simulation mode'
      });
    }

    // Check for TwiML App SID (required for outbound voice calls)
    const twimlAppSid = process.env.TWILIO_TWIML_APP_SID;
    if (!twimlAppSid) {
      console.warn('TWILIO_TWIML_APP_SID not set - outbound calls will not work');
    }

    // Use dedicated API Key/Secret for Voice SDK tokens
    const apiKey = process.env.TWILIO_API_KEY;
    const apiSecret = process.env.TWILIO_API_SECRET;

    if (!apiKey || !apiSecret) {
      return res.status(500).json({
        error: 'TWILIO_API_KEY and TWILIO_API_SECRET are required for Voice SDK',
      });
    }

    const AccessToken = twilio.jwt.AccessToken;
    const VoiceGrant = AccessToken.VoiceGrant;

    const token = new AccessToken(
      accountSid!,
      apiKey,
      apiSecret,
      { identity: identity || 'customer-service-agent' }
    );

    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: twimlAppSid,
      incomingAllow: true,
    });

    token.addGrant(voiceGrant);

    console.log('Generated Twilio token for:', identity);
    res.json({ token: token.toJwt() });
  } catch (error) {
    console.error('Token generation error:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

// Send SMS - handles both JSON and form-urlencoded
router.post('/send-sms', async (req, res) => {
  try {
    // Handle both JSON and form-urlencoded
    const to = req.body.To || req.body.to;
    const from = req.body.From || req.body.from;
    const message = req.body.Body || req.body.body || req.body.message;

    console.log('SMS Request:', { to, from, message: message?.substring(0, 50) });

    if (!to || !message) {
      return res.status(400).json({ error: 'Missing "To" or "Body" field' });
    }

    if (!isTwilioConfigured()) {
      console.log('Twilio not configured - simulating SMS send');
      // Return TwiML-style response for compatibility
      const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>SMS simulated: ${message.substring(0, 50)}...</Message>
</Response>`;
      res.type('text/xml');
      return res.send(twimlResponse);
    }

    const client = twilio(accountSid, authToken);

    const result = await client.messages.create({
      body: message,
      from: twilioPhone,
      to: to,
    });

    console.log('SMS sent successfully:', result.sid);

    // Return TwiML response
    const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Message sent successfully</Message>
</Response>`;
    res.type('text/xml');
    res.send(twimlResponse);
  } catch (error: any) {
    console.error('SMS error:', error);
    res.status(500).json({ error: error.message || 'Failed to send SMS' });
  }
});

// Voice webhook (TwiML) - for making calls
router.post('/voice', (req, res) => {
  let to = req.body.To || req.body.to || req.body.number || '';
  const callerId = twilioPhone || '+15551234567';

  // Clean and format phone number to E.164 format
  to = to.toString().trim().replace(/\D/g, ''); // Remove non-digits
  if (to.length === 10) {
    to = '+1' + to; // US number without country code
  } else if (to.length === 11 && to.startsWith('1')) {
    to = '+' + to; // US number with country code
  } else if (!to.startsWith('+')) {
    to = '+' + to;
  }

  console.log('Voice request to:', to);

  // Add <Say> first so we can verify audio is working
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Connecting your call now.</Say>
  <Dial callerId="${callerId}" timeout="30" action="/voice-status">
    <Number>${to}</Number>
  </Dial>
  <Say voice="alice">The call has ended. Goodbye.</Say>
</Response>`;

  res.type('text/xml');
  res.send(twiml);
});

// Incoming call handler
router.post('/voice/incoming', (req, res) => {
  const from = req.body.From || 'Unknown';

  console.log('Incoming call from:', from);

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Thank you for calling OrderlyBite. Please hold while we connect you.</Say>
  <Dial>
    <Client>customer-service-agent</Client>
  </Dial>
</Response>`;

  res.type('text/xml');
  res.send(twiml);
});

// Status callback
router.post('/voice/status', (req, res) => {
  console.log('Call status:', req.body.CallStatus);
  res.sendStatus(200);
});

// Voice status callback (for TwiML App)
router.post('/voice-status', (req, res) => {
  console.log('Voice status callback:', req.body.CallStatus || req.body);
  res.sendStatus(200);
});

export default router;
