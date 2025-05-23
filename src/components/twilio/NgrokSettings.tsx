
import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from 'lucide-react';

const NgrokSettings = () => {
  const { toast } = useToast();
  const [voiceUrl, setVoiceUrl] = useState('');
  const [smsUrl, setSmsUrl] = useState('');
  const [voiceNumber, setVoiceNumber] = useState('');
  
  useEffect(() => {
    // Try to load from environment variables first, fall back to localStorage
    const envVoiceUrl = import.meta.env.VITE_NGROK_VOICE_URL;
    const envSmsUrl = import.meta.env.VITE_NGROK_SMS_URL;
    const envVoiceNumber = import.meta.env.VITE_TWILIO_VOICE_NUMBER;
    
    // Log the values to help with debugging
    console.log("NgrokSettings - Environment variables:", {
      VITE_NGROK_VOICE_URL: envVoiceUrl,
      VITE_NGROK_SMS_URL: envSmsUrl,
      VITE_TWILIO_VOICE_NUMBER: envVoiceNumber
    });
    
    const storedVoiceUrl = localStorage.getItem('twilioNgrokVoiceUrl') || '';
    const storedSmsUrl = localStorage.getItem('twilioNgrokSmsUrl') || '';
    const storedVoiceNumber = localStorage.getItem('twilioVoiceNumber') || '';
    
    setVoiceUrl(envVoiceUrl || storedVoiceUrl);
    setSmsUrl(envSmsUrl || storedSmsUrl);
    setVoiceNumber(envVoiceNumber || storedVoiceNumber);
  }, []);
  
  const handleSave = () => {
    // Save to localStorage as fallback for browsers
    localStorage.setItem('twilioNgrokVoiceUrl', voiceUrl);
    localStorage.setItem('twilioNgrokSmsUrl', smsUrl);
    localStorage.setItem('twilioVoiceNumber', voiceNumber);
    
    console.log("NgrokSettings - Saved to localStorage:", {
      twilioNgrokVoiceUrl: voiceUrl,
      twilioNgrokSmsUrl: smsUrl,
      twilioVoiceNumber: voiceNumber
    });
    
    toast({
      title: "Settings Saved",
      description: "API endpoints and Twilio number have been updated.",
    });
    
    // Alert the user that they need to refresh for the settings to take effect
    toast({
      title: "Refresh Required",
      description: "Please refresh the page for the new settings to take effect.",
      variant: "default",
    });
  };
  
  return (
    <div className="space-y-4">
      {(voiceUrl.includes('ngrok') || smsUrl.includes('ngrok')) && (
        <Alert variant="default" className="bg-yellow-50 border-yellow-200">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">CORS Configuration Required</AlertTitle>
          <AlertDescription className="text-yellow-700">
            <p className="mb-2">
              When using ngrok endpoints, you must configure your server to allow cross-origin requests.
            </p>
            <p className="text-sm font-mono bg-gray-100 p-2 rounded">
              Access-Control-Allow-Origin: *<br />
              Access-Control-Allow-Methods: POST, OPTIONS<br />
              Access-Control-Allow-Headers: Content-Type
            </p>
          </AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="voice-number">Twilio Voice Number</Label>
        <Input 
          id="voice-number"
          placeholder="+18001234567"
          value={voiceNumber}
          onChange={(e) => setVoiceNumber(e.target.value)}
        />
        <p className="text-sm text-gray-500">
          The Twilio phone number to call
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="voice-url">Voice API Endpoint</Label>
        <Input 
          id="voice-url"
          placeholder="https://your-api-domain.com/voice-endpoint"
          value={voiceUrl}
          onChange={(e) => setVoiceUrl(e.target.value)}
        />
        <p className="text-sm text-gray-500">
          Base URL for voice functions (used for /voice and /token endpoints)
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="sms-url">SMS API Endpoint</Label>
        <Input 
          id="sms-url"
          placeholder="https://your-api-domain.com/sms-endpoint"
          value={smsUrl}
          onChange={(e) => setSmsUrl(e.target.value)}
        />
        <p className="text-sm text-gray-500">
          URL for handling SMS functionality
        </p>
      </div>

      <div className="pt-2">
        <Alert variant="default" className="bg-blue-50 border-blue-200">
          <AlertDescription className="text-blue-700">
            <p className="font-medium mb-1">Required API Endpoints:</p>
            <ul className="list-disc pl-5 text-xs">
              <li>POST /token - Returns a Twilio token JSON with format {"token": "YOUR_TOKEN"}</li>
              <li>POST /voice - Handles voice calls with TwiML response</li>
            </ul>
          </AlertDescription>
        </Alert>
      </div>
      
      <div className="pt-4 flex justify-end">
        <Button onClick={handleSave} className="bg-food-primary hover:bg-food-primary/90">
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default NgrokSettings;
