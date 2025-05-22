
import { useRef, useEffect } from 'react';
import { Device } from '@twilio/voice-sdk';
import { useToast } from "@/hooks/use-toast";

interface UseTwilioDeviceInitProps {
  open: boolean;
  token: string | null;
}

export const useTwilioDeviceInit = ({ open, token }: UseTwilioDeviceInitProps) => {
  const { toast } = useToast();
  const deviceRef = useRef<Device | null>(null);

  useEffect(() => {
    if (open && token) {
      try {
        // Initialize Twilio Device with the token
        const device = new Device(token, {
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
        device.register();
      } catch (error) {
        console.error('Failed to initialize Twilio device:', error);
        toast({
          title: "Error",
          description: "Failed to initialize phone system",
          variant: "destructive",
        });
      }
    } else if (!open) {
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
  }, [open, token, toast]);

  return deviceRef;
};
