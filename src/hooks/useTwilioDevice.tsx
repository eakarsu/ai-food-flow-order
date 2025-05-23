
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
      
      // Check the content type to determine if it's JSON or XML
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        // Handle JSON response
        const data = await response.json();
        console.log("Call initiated successfully:", data);
      } else if (contentType && (contentType.includes('application/xml') || contentType.includes('text/xml'))) {
        // Handle XML response (common with Twilio TwiML)
        const xmlText = await response.text();
        console.log("Received XML response:", xmlText);
        
        // If we receive XML, it's likely TwiML which means the call was initiated
        if (xmlText.includes('<Dial') || xmlText.includes('<Say') || xmlText.includes('<Response')) {
          console.log("Received valid TwiML response, considering call connected");
        } else {
          throw new Error("Received XML response but it doesn't appear to be valid TwiML");
        }
      } else {
        // Handle other response types
        const text = await response.text();
        console.log("Response received (non-JSON format):", text);
      }
      
      // Consider the call connected if we got a 200 OK response
      setIsConnected(true);
      toast({
        title: "Call Connected",
        description: `Connected to ${phoneNumber}`,
      });
      
    } catch (error) {
      console.error("Error making call:", error);
      
      // Provide more specific error message for CORS issues and XML parsing
      let errorMessage = error instanceof Error ? error.message : "Failed to connect call";
      
      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        // This is likely a CORS error
        errorMessage = "Cannot connect to voice server. This may be due to CORS restrictions. Please ensure your server allows cross-origin requests.";
      } else if (error instanceof SyntaxError && error.message.includes("Unexpected token")) {
        errorMessage = "The server returned a response in an unexpected format (possibly XML when JSON was expected). Check server configuration.";
      }
      
      toast({
        title: "Call Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Reset the connected state
      setIsConnected(false);
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
