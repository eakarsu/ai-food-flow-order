
import { useToast } from "@/hooks/use-toast";

/**
 * Fetches a Twilio token from the server
 * @param ngrokVoiceUrl Optional ngrok URL for webhooks
 * @returns Promise resolving to the token string or null if failed
 */
export const fetchTwilioToken = async (ngrokVoiceUrl?: string): Promise<string | null> => {
  try {
    // Get token URL from env or use default
    const tokenUrl = import.meta.env.VITE_TOKEN_URL || 'http://localhost:3001/api/twilio-token';

    // Call your secure backend endpoint that generates Twilio tokens
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        identity: "customer-service-agent",
        // Pass the ngrok URL if available
        ngrokUrl: ngrokVoiceUrl || undefined
      })
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch token");
    }
    
    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error("Error fetching token:", error);
    return null;
  }
};
