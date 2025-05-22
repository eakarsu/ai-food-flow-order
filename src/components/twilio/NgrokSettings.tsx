
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
  
  useEffect(() => {
    // Try to load from environment variables first, fall back to localStorage
    const envVoiceUrl = import.meta.env.VITE_NGROK_VOICE_URL;
    const envSmsUrl = import.meta.env.VITE_NGROK_SMS_URL;
    
    const storedVoiceUrl = localStorage.getItem('twilioNgrokVoiceUrl') || '';
    const storedSmsUrl = localStorage.getItem('twilioNgrokSmsUrl') || '';
    
    setVoiceUrl(envVoiceUrl || storedVoiceUrl);
    setSmsUrl(envSmsUrl || storedSmsUrl);
  }, []);
  
  const handleSave = () => {
    // Save to localStorage as fallback for browsers
    localStorage.setItem('twilioNgrokVoiceUrl', voiceUrl);
    localStorage.setItem('twilioNgrokSmsUrl', smsUrl);
    
    toast({
      title: "Settings Saved",
      description: "API endpoints have been updated.",
    });
  };
  
  return (
    <div className="space-y-4">
      {(voiceUrl.includes('ngrok') || smsUrl.includes('ngrok')) && (
        <Alert variant="warning" className="bg-yellow-50 border-yellow-200">
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
        <Label htmlFor="voice-url">Voice API Endpoint</Label>
        <Input 
          id="voice-url"
          placeholder="https://your-api-domain.com/voice-endpoint"
          value={voiceUrl}
          onChange={(e) => setVoiceUrl(e.target.value)}
        />
        <p className="text-sm text-gray-500">
          URL for handling voice call functionality
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
      
      <div className="pt-4 flex justify-end">
        <Button onClick={handleSave} className="bg-food-primary hover:bg-food-primary/90">
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default NgrokSettings;
