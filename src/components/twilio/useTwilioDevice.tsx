
import { useState, useEffect, useRef } from 'react';
import { Device } from '@twilio/voice-sdk';
import { useToast } from "@/hooks/use-toast";

export const useTwilioDevice = (open: boolean, phoneNumber: string) => {
  const { toast } = useToast();
  const [isMuted, setIsMuted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const deviceRef = useRef<Device | null>(null);
  const activeCallRef = useRef<any | null>(null);

  // Fetch Twilio token from your server
  const fetchToken = async () => {
    try {
      // Call your secure backend endpoint that generates Twilio tokens
      const response = await fetch("/api/twilio-token", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          // You can send identity or other parameters your server needs
          identity: "customer-service-agent"
        })
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch token");
      }
      
      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error("Error fetching token:", error);
      toast({
        title: "Error",
        description: "Could not fetch Twilio token",
        variant: "destructive",
      });
      return null;
    }
  };

  useEffect(() => {
    if (open) {
      // Initialize the device when the component opens
      const initDevice = async () => {
        const newToken = await fetchToken();
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

  const makeCall = async () => {
    if (!deviceRef.current || !token) {
      toast({
        title: "Error",
        description: "Phone system is not initialized",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsConnecting(true);
      
      // Make the actual Twilio call
      const call = await deviceRef.current.connect({
        params: {
          To: phoneNumber,
          // Any other TwiML parameters you need
        }
      });
      
      activeCallRef.current = call;
      
      call.on('accept', () => {
        setIsConnecting(false);
        setIsConnected(true);
        
        toast({
          title: "Call Connected",
          description: `Connected to ${phoneNumber}`,
        });
      });
      
      call.on('disconnect', () => {
        setIsConnected(false);
        setIsMuted(false);
        activeCallRef.current = null;
        
        toast({
          title: "Call Ended",
          description: "The call has been disconnected",
        });
      });
      
      call.on('error', (error) => {
        console.error('Call error:', error);
        toast({
          title: "Call Error",
          description: error.message || "An error occurred during the call",
          variant: "destructive",
        });
        setIsConnecting(false);
        setIsConnected(false);
        activeCallRef.current = null;
      });
    } catch (error) {
      console.error('Error making call:', error);
      toast({
        title: "Call Failed",
        description: "Could not establish call connection",
        variant: "destructive",
      });
      setIsConnecting(false);
    }
  };

  const disconnectCall = () => {
    if (activeCallRef.current) {
      activeCallRef.current.disconnect();
    }
  };

  const toggleMute = () => {
    if (activeCallRef.current) {
      const newMuteState = !isMuted;
      activeCallRef.current.mute(newMuteState);
      setIsMuted(newMuteState);
    }
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
