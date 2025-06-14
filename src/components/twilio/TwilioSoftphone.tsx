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
    if (open && !isConnected && !isConnecting && audioPermissionGranted !== false && tokenAvailable !== false) {
      console.log("Dialog opened, auto-initiating call to:", twilioNumber);
      console.log("Checking prerequisites: token available =", tokenAvailable, ", audio permission =", audioPermissionGranted);

      // Small timeout to ensure UI is ready and all checks are complete
      const timer = setTimeout(() => {
        if (tokenAvailable !== false && audioPermissionGranted !== false) {
          console.log("All prerequisites met, starting call process...");
          makeCall();
        } else {
          console.log("Prerequisites not met, skipping auto-call");
        }
      }, 1000); // Increased timeout to allow for permission checks
      return () => clearTimeout(timer);
    }
  }, [open, twilioNumber, isConnected, isConnecting, makeCall, audioPermissionGranted, tokenAvailable]);

  // Clean up when dialog closes
  useEffect(() => {
    if (!open && isConnected) {
      disconnectCall();
    }
  }, [open, isConnected, disconnectCall]);

  // Check if token endpoint is available
  useEffect(() => {
    if (open) {
      const tokenEndpoint = 'https://api.orderlybite.com/token';

      // Test the token endpoint with a simple request
      fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify({ identity: "test" }),
      })
        .then(response => {
          setTokenAvailable(response.ok || response.status === 401); // 401 means endpoint exists but needs auth
          if (!response.ok && response.status !== 401) {
            console.warn(`Token endpoint returned status: ${response.status}`);
          }
        })
        .catch((error) => {
          console.error("Token endpoint test failed:", error);
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
              Microphone access is required for calls. Please:
              <br />• Click the microphone icon in your browser's address bar
              <br />• Select "Allow" for microphone access
              <br />• Refresh the page and try again
              <br />• On mobile, grant permission when prompted
              <br />• If in embedded view, try opening in a new tab
              <br />
              <br />Alternative: Use your phone to call {twilioNumber} directly
            </AlertDescription>
          </Alert>
        )}

        {tokenAvailable === false && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Unable to connect to voice service. 
              <br />
              <button 
                onClick={() => window.open(`tel:${twilioNumber}`, '_self')}
                className="mt-2 text-sm underline text-red-600 hover:text-red-800"
              >
                Click here to call {twilioNumber} directly
              </button>
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
          {!isConnected && !isConnecting && (
          <div className="space-y-4">
            <Alert className="border-amber-200 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <div className="space-y-2">
                  <p className="font-medium">Microphone access is required for calls. Please:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Click the microphone icon in your browser's address bar</li>
                    <li>Select "Allow" for microphone access</li>
                    <li>Refresh the page and try again</li>
                    <li>On mobile, grant permission when prompted</li>
                    <li>If in embedded view, try opening in a new tab</li>
                  </ul>
                  <p className="text-sm font-medium mt-2">
                    Alternative: <a 
                      href={`tel:${twilioNumber}`} 
                      className="text-blue-600 underline hover:text-blue-800"
                      onClick={() => onOpenChange(false)}
                    >
                      Use your phone to call {twilioNumber} directly
                    </a>
                  </p>
                </div>
              </AlertDescription>
            </Alert>

            <CallInitiator 
              phoneNumber={twilioNumber}
              onCall={() => {
                console.log("Manual call initiation triggered");
                makeCall();
              }}
              isConnecting={isConnecting}
            />
          </div>
        )}

        {isConnecting && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-food-primary mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Connecting...</p>
            <p className="text-xs text-gray-500 mt-1">Please allow microphone access if prompted</p>
          </div>
        )}

        {isConnected && (
          <ActiveCall
            phoneNumber={twilioNumber}
            onDisconnect={disconnectCall}
            onToggleMute={toggleMute}
            isMuted={isMuted}
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