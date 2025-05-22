
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save } from 'lucide-react';

interface NgrokSettingsProps {
  defaultVoiceUrl?: string;
  defaultSmsUrl?: string;
}

const NgrokSettings = ({ defaultVoiceUrl, defaultSmsUrl }: NgrokSettingsProps) => {
  const { toast } = useToast();
  const [ngrokVoiceUrl, setNgrokVoiceUrl] = useState(defaultVoiceUrl || '');
  const [ngrokSmsUrl, setNgrokSmsUrl] = useState(defaultSmsUrl || '');
  
  // Load saved URLs from localStorage on component mount
  useEffect(() => {
    const savedVoiceUrl = localStorage.getItem('twilioNgrokVoiceUrl');
    const savedSmsUrl = localStorage.getItem('twilioNgrokSmsUrl');
    
    if (savedVoiceUrl) setNgrokVoiceUrl(savedVoiceUrl);
    if (savedSmsUrl) setNgrokSmsUrl(savedSmsUrl);
  }, []);
  
  // Save URLs to localStorage and notify user
  const saveUrls = () => {
    // Validate URLs
    if (!isValidNgrokUrl(ngrokVoiceUrl) && ngrokVoiceUrl !== '') {
      toast({
        title: "Invalid Voice URL",
        description: "Please enter a valid ngrok URL (e.g., https://abc123.ngrok.io)",
        variant: "destructive",
      });
      return;
    }
    
    if (!isValidNgrokUrl(ngrokSmsUrl) && ngrokSmsUrl !== '') {
      toast({
        title: "Invalid SMS URL",
        description: "Please enter a valid ngrok URL (e.g., https://abc123.ngrok.io)",
        variant: "destructive",
      });
      return;
    }
    
    // Save to localStorage
    localStorage.setItem('twilioNgrokVoiceUrl', ngrokVoiceUrl);
    localStorage.setItem('twilioNgrokSmsUrl', ngrokSmsUrl);
    
    toast({
      title: "Ngrok URLs Saved",
      description: "Your Twilio webhook URLs have been saved",
    });
  };
  
  const isValidNgrokUrl = (url: string): boolean => {
    return url === '' || /^https?:\/\/[a-z0-9]+\.ngrok\.io(\/.*)?$/i.test(url);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-food-primary">Ngrok Webhook Settings</CardTitle>
        <CardDescription>
          Configure your Twilio webhook URLs for voice and SMS
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="ngrokVoiceUrl" className="block text-sm font-medium text-gray-700 mb-1">
            Voice Webhook URL
          </label>
          <Input
            id="ngrokVoiceUrl"
            placeholder="https://your-ngrok-url.ngrok.io/voice"
            value={ngrokVoiceUrl}
            onChange={(e) => setNgrokVoiceUrl(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">
            This URL should handle voice calls for your Twilio application
          </p>
        </div>
        
        <div>
          <label htmlFor="ngrokSmsUrl" className="block text-sm font-medium text-gray-700 mb-1">
            SMS Webhook URL
          </label>
          <Input
            id="ngrokSmsUrl"
            placeholder="https://your-ngrok-url.ngrok.io/sms"
            value={ngrokSmsUrl}
            onChange={(e) => setNgrokSmsUrl(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">
            This URL should handle SMS messages for your Twilio application
          </p>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button onClick={saveUrls} className="bg-food-primary hover:bg-food-primary/90">
          <Save className="mr-2 h-4 w-4" />
          Save Webhook URLs
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NgrokSettings;
