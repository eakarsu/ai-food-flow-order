
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
      console.log("Calling phone number:", phoneNumber);
      
      // Check if the voice endpoint is a cross-origin URL (different domain)
      const isCrossOrigin = voiceEndpoint.startsWith('http') && 
                           !voiceEndpoint.includes(window.location.hostname);
      
      if (isCrossOrigin) {
        console.log("Cross-origin request detected. Adding CORS mode.");
      }
      
      const response = await fetch(voiceEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add mode: 'cors' for cross-origin requests
        ...(isCrossOrigin ? { mode: 'cors' } : {}),
        body: JSON.stringify({ 
          to: phoneNumber,
          identity: "customer-service-agent"
        })
      });
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to initiate call. Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Call initiated successfully:", data);
      
      setIsConnected(true);
      toast({
        title: "Call Connected",
        description: `Connected to ${phoneNumber}`,
      });
      
      // In a real implementation, you would likely set up a WebSocket 
      // or polling to get call status updates from your server
      
    } catch (error) {
      console.error("Error making call:", error);
      
      // Provide more specific error message for CORS issues
      let errorMessage = error instanceof Error ? error.message : "Failed to connect call";
      
      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        // This is likely a CORS error
        errorMessage = "Cannot connect to voice server. This may be due to CORS restrictions. Please ensure your server allows cross-origin requests.";
      }
      
      toast({
        title: "Call Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectCall = async () => {
    try {
      // Get the voice endpoint URL
      const voiceEndpoint = import.meta.env.VITE_NGROK_VOICE_URL || 
                          localStorage.getItem('twilioNgrokVoiceUrl') || 
                          '/api/twilio-call';
      
      console.log("Disconnecting call using endpoint:", `${voiceEndpoint}/hangup`);
      
      // Check if the voice endpoint is a cross-origin URL (different domain)
      const isCrossOrigin = voiceEndpoint.startsWith('http') && 
                           !voiceEndpoint.includes(window.location.hostname);
      
      const response = await fetch(`${voiceEndpoint}/hangup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add mode: 'cors' for cross-origin requests
        ...(isCrossOrigin ? { mode: 'cors' } : {}),
        body: JSON.stringify({ 
          identity: "customer-service-agent"
        })
      });
      
      if (!response.ok) {
        throw new Error("Failed to end call");
      }
      
      console.log("Call disconnected successfully");
      toast({
        title: "Call Ended",
        description: "Call has been disconnected",
      });
      
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
      
      console.log("Toggling mute using endpoint:", `${voiceEndpoint}/mute`);
      
      // Check if the voice endpoint is a cross-origin URL (different domain)
      const isCrossOrigin = voiceEndpoint.startsWith('http') && 
                           !voiceEndpoint.includes(window.location.hostname);
      
      const response = await fetch(`${voiceEndpoint}/mute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add mode: 'cors' for cross-origin requests
        ...(isCrossOrigin ? { mode: 'cors' } : {}),
        body: JSON.stringify({ 
          muted: !isMuted,
          identity: "customer-service-agent"
        })
      });
      
      if (!response.ok) {
        throw new Error("Failed to toggle mute");
      }
      
      setIsMuted(!isMuted);
      toast({
        title: isMuted ? "Microphone Unmuted" : "Microphone Muted",
        description: isMuted ? "Others can hear you now" : "You are now muted",
      });
      
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
