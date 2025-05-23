
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

interface TwilioSoftphoneProps {
  phoneNumber: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TwilioSoftphone = ({ phoneNumber, open, onOpenChange }: TwilioSoftphoneProps) => {
  // Get TWILIO_VOICE_NUMBER from environment variables
  const [twilioNumber, setTwilioNumber] = useState<string>("");

  useEffect(() => {
    // Use environment variable or fallback to the provided phone number
    const twilioVoiceNumber = import.meta.env.VITE_TWILIO_VOICE_NUMBER;
    console.log("Twilio voice number from env:", twilioVoiceNumber);
    
    if (twilioVoiceNumber) {
      setTwilioNumber(twilioVoiceNumber);
    } else {
      setTwilioNumber(phoneNumber);
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
