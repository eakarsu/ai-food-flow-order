
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
  const [audioPermissionGranted, setAudioPermissionGranted] = useState<boolean | null>(null);

  useEffect(() => {
    // Check for microphone permission
    if (open) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          setAudioPermissionGranted(true);
          console.log("Microphone permission is granted");
        })
        .catch(error => {
          setAudioPermissionGranted(false);
          console.error("Microphone permission denied:", error);
        });
    }
  }, [open]);

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
  }, [open, twilioNumber, isConnected, isConnecting, makeCall]);

  // Clean up when dialog closes
  useEffect(() => {
    if (!open && isConnected) {
      disconnectCall();
    }
  }, [open, isConnected, disconnectCall]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen && isConnected) {
        // When closing the dialog, make sure to disconnect the call
        disconnectCall();
      }
      onOpenChange(isOpen);
    }}>
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

        {audioPermissionGranted === false && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Microphone access is required for calls. Please allow microphone access in your browser settings.
            </AlertDescription>
          </Alert>
        )}

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
        
        {/* Debug notification about audio status */}
        {isConnected && (
          <div className="mt-4 text-xs text-center text-gray-500">
            If you can't hear audio, check your browser volume settings and make sure media autoplay is allowed.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TwilioSoftphone;
