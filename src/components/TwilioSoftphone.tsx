
import { useState, useEffect, useRef } from 'react';
import { Device } from '@twilio/voice-sdk';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface TwilioSoftphoneProps {
  phoneNumber: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TwilioSoftphone = ({ phoneNumber, open, onOpenChange }: TwilioSoftphoneProps) => {
  const { toast } = useToast();
  const [isMuted, setIsMuted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const deviceRef = useRef<Device | null>(null);
  const activeCallRef = useRef<any | null>(null);

  // Ideally, this token should be fetched from your backend
  const fetchToken = async () => {
    try {
      // In a real app, you would get this from your server
      // For demo purposes, we're simulating a successful token fetch
      toast({
        title: "Demo Mode",
        description: "In a production app, this would fetch a real Twilio token from your server.",
      });
      
      // Simulated token - this is just for UI demonstration
      return "simulated-twilio-token";
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
            // Using only valid options from the Twilio Voice SDK 
            const device = new Device(newToken, {
              // These are valid options in the Twilio Voice SDK
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

  const handleMakeCall = async () => {
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
      
      // In a real implementation, you would:
      // 1. Call your backend to get a capability token
      // 2. Initialize the call with proper parameters
      
      // For demo purposes, we'll simulate the call connection
      setTimeout(() => {
        setIsConnecting(false);
        setIsConnected(true);
        
        toast({
          title: "Demo Call Connected",
          description: `Connected to ${phoneNumber} (simulated)`,
        });
        
        // Simulate an active call object
        activeCallRef.current = {
          disconnect: () => {
            setIsConnected(false);
            activeCallRef.current = null;
            toast({
              title: "Call Ended",
              description: "The call has been disconnected",
            });
          },
          mute: (shouldMute: boolean) => {
            setIsMuted(shouldMute);
          }
        };
      }, 1500);
      
      /* In a real implementation, you would do something like:
      const call = await deviceRef.current.connect({
        params: {
          To: phoneNumber,
          // Add any other parameters needed
        }
      });
      
      activeCallRef.current = call;
      
      call.on('accept', () => {
        setIsConnecting(false);
        setIsConnected(true);
      });
      
      call.on('disconnect', () => {
        setIsConnected(false);
        setIsMuted(false);
        activeCallRef.current = null;
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
      */
      
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

  const handleDisconnect = () => {
    if (activeCallRef.current) {
      activeCallRef.current.disconnect();
    }
  };

  const handleToggleMute = () => {
    if (activeCallRef.current) {
      const newMuteState = !isMuted;
      activeCallRef.current.mute(newMuteState);
      setIsMuted(newMuteState);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Phone className="mr-2" size={18} />
            {isConnected ? 'In Call' : 'Make a Call'}
          </DialogTitle>
          <DialogDescription>
            {isConnected 
              ? `Connected to ${phoneNumber}`
              : `Calling ${phoneNumber}`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center py-6 space-y-6">
          {isConnected ? (
            <>
              <div className="text-4xl font-semibold text-food-dark">
                {phoneNumber}
              </div>
              
              <div className="text-sm text-gray-500">
                Call in progress
              </div>
              
              <div className="flex space-x-4">
                <Button
                  variant={isMuted ? "default" : "outline"}
                  size="icon"
                  className={isMuted ? "bg-red-500 hover:bg-red-600" : ""}
                  onClick={handleToggleMute}
                >
                  {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                </Button>
                
                <Button 
                  variant="destructive"
                  size="icon"
                  onClick={handleDisconnect}
                  className="h-12 w-12 rounded-full"
                >
                  <PhoneOff size={24} />
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  disabled={true} // In a real app, this would toggle speaker
                >
                  <Volume2 size={20} />
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="text-4xl font-semibold text-food-dark">
                {phoneNumber}
              </div>
              
              <Button
                onClick={handleMakeCall}
                disabled={isConnecting || !token}
                className="bg-food-primary hover:bg-food-primary/90 h-12 w-12 rounded-full"
              >
                <Phone size={24} />
              </Button>
              
              {isConnecting && (
                <div className="text-sm text-gray-500">
                  Connecting...
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TwilioSoftphone;
