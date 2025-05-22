
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";

interface UseTwilioDeviceProps {
  open: boolean;
  phoneNumber: string;
}

export const useTwilioDevice = ({ open, phoneNumber }: UseTwilioDeviceProps) => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Simplified API that relies on server-side implementation
  const makeCall = async () => {
    if (!phoneNumber) return;
    
    try {
      setIsConnecting(true);
      
      // Get the voice endpoint URL from environment variable or from localStorage
      const voiceEndpoint = import.meta.env.VITE_NGROK_VOICE_URL || 
                          localStorage.getItem('twilioNgrokVoiceUrl') || 
                          '/api/twilio-call';
      
      console.log("Calling voice endpoint:", voiceEndpoint);
      
      const response = await fetch(voiceEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          to: phoneNumber,
          identity: "customer-service-agent"
        })
      });
      
      if (!response.ok) {
        throw new Error("Failed to initiate call");
      }
      
      const data = await response.json();
      console.log("Call initiated:", data);
      
      setIsConnected(true);
      setIsConnecting(false);
      
      // In a real implementation, you would likely set up a WebSocket 
      // or polling to get call status updates from your server
      
    } catch (error) {
      console.error("Error making call:", error);
      setIsConnecting(false);
      
      toast({
        title: "Call Error",
        description: error instanceof Error ? error.message : "Failed to connect call",
        variant: "destructive",
      });
    }
  };

  const disconnectCall = async () => {
    try {
      // Get the voice endpoint URL
      const voiceEndpoint = import.meta.env.VITE_NGROK_VOICE_URL || 
                          localStorage.getItem('twilioNgrokVoiceUrl') || 
                          '/api/twilio-call';
      
      const response = await fetch(`${voiceEndpoint}/hangup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          identity: "customer-service-agent"
        })
      });
      
      if (!response.ok) {
        throw new Error("Failed to end call");
      }
      
      console.log("Call disconnected");
      
    } catch (error) {
      console.error("Error disconnecting call:", error);
      toast({
        title: "Error",
        description: "Failed to disconnect call properly",
        variant: "destructive",
      });
    } finally {
      // Always update UI state regardless of server response
      setIsConnected(false);
      setIsMuted(false);
    }
  };

  const toggleMute = async () => {
    try {
      // Get the voice endpoint URL
      const voiceEndpoint = import.meta.env.VITE_NGROK_VOICE_URL || 
                          localStorage.getItem('twilioNgrokVoiceUrl') || 
                          '/api/twilio-call';
      
      const response = await fetch(`${voiceEndpoint}/mute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          muted: !isMuted,
          identity: "customer-service-agent"
        })
      });
      
      if (!response.ok) {
        throw new Error("Failed to toggle mute");
      }
      
      setIsMuted(!isMuted);
      
    } catch (error) {
      console.error("Error toggling mute:", error);
      toast({
        title: "Error",
        description: "Failed to toggle mute",
        variant: "destructive",
      });
    }
  };

  return {
    isConnected,
    isConnecting,
    isMuted,
    makeCall,
    disconnectCall,
    toggleMute
  };
};
