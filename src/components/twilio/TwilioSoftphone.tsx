
import { Phone } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useTwilioDevice } from '@/hooks/useTwilioDevice';
import CallInitiator from './CallInitiator';
import ActiveCall from './ActiveCall';
import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TwilioSoftphoneProps {
  phoneNumber: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TwilioSoftphone = ({ phoneNumber, open, onOpenChange }: TwilioSoftphoneProps) => {
  // Get TWILIO_VOICE_NUMBER from environment variables
  const [twilioNumber, setTwilioNumber] = useState<string>("");
  const [envVarMissing, setEnvVarMissing] = useState<boolean>(false);

  useEffect(() => {
    // Use environment variable or fallback to the provided phone number
    const twilioVoiceNumber = import.meta.env.VITE_TWILIO_VOICE_NUMBER;
    console.log("Twilio voice number from env:", twilioVoiceNumber);
    
    if (twilioVoiceNumber) {
      setTwilioNumber(twilioVoiceNumber);
      setEnvVarMissing(false);
    } else {
      setTwilioNumber(phoneNumber);
      setEnvVarMissing(true);
      console.log("VITE_TWILIO_VOICE_NUMBER environment variable not set, using provided number instead");
    }
  }, [phoneNumber]);

  const {
    isConnected,
    isConnecting,
    isMuted,
    makeCall,
    disconnectCall,
    toggleMute
  } = useTwilioDevice({ open, phoneNumber: twilioNumber });

  // Automatically attempt to make the call when the dialog is opened
  useEffect(() => {
    if (open && !isConnected && !isConnecting) {
      console.log("Dialog opened, auto-initiating call to:", twilioNumber);
      // Small timeout to ensure UI is ready
      const timer = setTimeout(() => {
        makeCall();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [open, twilioNumber]);

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
              ? `Connected to ${twilioNumber}`
              : `Calling ${twilioNumber}`
            }
          </DialogDescription>
        </DialogHeader>

        {envVarMissing && (
          <Alert variant="destructive" className="bg-yellow-50 border-yellow-200 mb-4">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-700">
              VITE_TWILIO_VOICE_NUMBER environment variable is not set. Using provided number instead.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col items-center py-6 space-y-6">
          {isConnected ? (
            <ActiveCall 
              phoneNumber={twilioNumber}
              isMuted={isMuted}
              handleToggleMute={toggleMute}
              handleDisconnect={disconnectCall}
            />
          ) : (
            <CallInitiator
              phoneNumber={twilioNumber}
              handleMakeCall={makeCall}
              isConnecting={isConnecting}
              hasToken={true} // Simplified as we no longer need tokens client-side
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TwilioSoftphone;
