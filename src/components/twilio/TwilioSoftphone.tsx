
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
  const [tokenAvailable, setTokenAvailable] = useState<boolean | null>(null);

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
    // Use the provided phone number (the number we want to call)
    // VITE_TWILIO_VOICE_NUMBER is the caller ID, not the destination
    console.log("Phone number to call:", phoneNumber);
    setTwilioNumber(phoneNumber);
    setEnvVarMissing(false);
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
    if (open && !isConnected && !isConnecting && audioPermissionGranted !== false) {
      console.log("Dialog opened, auto-initiating call to:", twilioNumber);
      // Small timeout to ensure UI is ready
      const timer = setTimeout(() => {
        makeCall();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [open, twilioNumber, isConnected, isConnecting, makeCall, audioPermissionGranted]);

  // Clean up when dialog closes
  useEffect(() => {
    if (!open && isConnected) {
      disconnectCall();
    }
  }, [open, isConnected, disconnectCall]);

  // Check if token endpoint is available
  useEffect(() => {
    if (open) {
      const tokenEndpoint = import.meta.env.VITE_TOKEN_URL || 'http://localhost:3001/api/twilio-token';

      // Check endpoint with actual POST request
      fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({ identity: 'connection-test' }),
      })
        .then(response => {
          if (response.ok) {
            setTokenAvailable(true);
          } else {
            setTokenAvailable(false);
          }
        })
        .catch(() => {
          setTokenAvailable(false);
        });
    }
  }, [open]);

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

        {tokenAvailable === false && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Unable to connect to token service. Please check your server configuration.
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
              hasToken={tokenAvailable !== false}
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
