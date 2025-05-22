
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";

export const useTwilioToken = () => {
  const { toast } = useToast();
  const [token, setToken] = useState<string | null>(null);

  const fetchToken = async (): Promise<string | null> => {
    try {
      // Get the voice endpoint URL from environment variable or from localStorage
      const voiceEndpoint = import.meta.env.VITE_NGROK_VOICE_URL || 
                          localStorage.getItem('twilioNgrokVoiceUrl') || 
                          '/api/twilio-token';  // Fallback to default
      
      console.log("Using voice endpoint:", voiceEndpoint);
      
      // Fetch token from the endpoint
      const response = await fetch(voiceEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          identity: "customer-service-agent"
        })
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch token");
      }
      
      const data = await response.json();
      const newToken = data.token;
      
      if (newToken) {
        setToken(newToken);
        return newToken;
      }
      return null;
    } catch (error) {
      console.error("Error fetching token:", error);
      toast({
        title: "Error",
        description: "Could not fetch voice token",
        variant: "destructive",
      });
      return null;
    }
  };

  return {
    token,
    setToken,
    fetchToken
  };
};
