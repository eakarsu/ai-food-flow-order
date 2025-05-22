
import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';

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
      description: "Ngrok URLs have been updated.",
    });
  };
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="voice-url">Ngrok Voice URL</Label>
        <Input 
          id="voice-url"
          placeholder="https://your-ngrok-voice-url.ngrok.io"
          value={voiceUrl}
          onChange={(e) => setVoiceUrl(e.target.value)}
        />
        <p className="text-sm text-gray-500">
          URL for handling Twilio voice functionality
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="sms-url">Ngrok SMS URL</Label>
        <Input 
          id="sms-url"
          placeholder="https://your-ngrok-sms-url.ngrok.io"
          value={smsUrl}
          onChange={(e) => setSmsUrl(e.target.value)}
        />
        <p className="text-sm text-gray-500">
          URL for handling Twilio SMS functionality
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
