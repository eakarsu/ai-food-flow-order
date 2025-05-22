
import { useState, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";

interface UseCallManagementProps {
  deviceRef: React.MutableRefObject<any>;
}

export function useCallManagement({ deviceRef }: UseCallManagementProps) {
  const { toast } = useToast();
  const [isMuted, setIsMuted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const activeCallRef = useRef<any | null>(null);

  const makeCall = async (phoneNumber: string) => {
    if (!deviceRef.current) {
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
      
      call.on('error', (error: Error) => {
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
    isMuted,
    isConnected,
    isConnecting,
    makeCall,
    disconnectCall,
    toggleMute,
  };
}
