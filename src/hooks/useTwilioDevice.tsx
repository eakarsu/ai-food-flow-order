
import { useState, useEffect, useRef } from 'react';
import { Device } from '@twilio/voice-sdk';
import { useToast } from "@/hooks/use-toast";
import { useCallManagement } from './useCallManagement';

export const useTwilioDevice = (open: boolean, phoneNumber: string) => {
  const { toast } = useToast();
  const [token, setToken] = useState<string | null>(null);
  const deviceRef = useRef<Device | null>(null);

  // Get call management functionality
  const {
    isMuted,
    isConnected,
    isConnecting,
    makeCall: initiateCall,
    disconnectCall,
    toggleMute
  } = useCallManagement({ deviceRef });

  useEffect(() => {
    if (open) {
      // Initialize the device when the component opens
      const initDevice = async () => {
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
            
            try {
              // Initialize Twilio Device with the token
              const device = new Device(newToken, {
                logLevel: 1,  // 0-silent, 1-error, 2-warning, 3-info, 4-debug, 5-log
                allowIncomingWhileBusy: true
              });
              
              deviceRef.current = device;
              
              // Set up event listeners
              device.on('registered', () => {
                console.log('Twilio device registered');
              });
              
              device.on('error', (error) => {
                console.error('Twilio device error:', error);
                toast({
                  title: "Error",
                  description: error.message || "An error occurred with the phone connection",
                  variant: "destructive",
                });
              });
              
              // Register the device
              await device.register();
            } catch (error) {
              console.error('Failed to initialize Twilio device:', error);
              toast({
                title: "Error",
                description: "Failed to initialize phone system",
                variant: "destructive",
              });
            }
          }
        } catch (error) {
          console.error("Error fetching token:", error);
          toast({
            title: "Error",
            description: "Could not fetch voice token",
            variant: "destructive",
          });
        }
      };
      
      initDevice();
    } else {
      // Clean up when dialog closes
      if (deviceRef.current) {
        try {
          deviceRef.current.destroy();
          deviceRef.current = null;
        } catch (error) {
          console.error('Error destroying Twilio device:', error);
        }
      }
    }
    
    return () => {
      // Clean up on component unmount
      if (deviceRef.current) {
        try {
          deviceRef.current.destroy();
        } catch (error) {
          console.error('Error destroying Twilio device:', error);
        }
      }
    };
  }, [open, toast]);

  // Wrapper for makeCall to pass phone number
  const makeCall = () => {
    initiateCall(phoneNumber);
  };

  return {
    token,
    isConnected,
    isConnecting,
    isMuted,
    makeCall,
    disconnectCall,
    toggleMute
  };
};
