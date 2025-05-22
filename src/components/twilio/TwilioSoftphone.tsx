
import { Phone } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useTwilioDevice } from './useTwilioDevice';
import CallInitiator from './CallInitiator';
import ActiveCall from './ActiveCall';

interface TwilioSoftphoneProps {
  phoneNumber: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TwilioSoftphone = ({ phoneNumber, open, onOpenChange }: TwilioSoftphoneProps) => {
  const {
    token,
    isConnected,
    isConnecting,
    isMuted,
    makeCall,
    disconnectCall,
    toggleMute
  } = useTwilioDevice(open, phoneNumber);

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
            <ActiveCall 
              phoneNumber={phoneNumber}
              isMuted={isMuted}
              handleToggleMute={toggleMute}
              handleDisconnect={disconnectCall}
            />
          ) : (
            <CallInitiator
              phoneNumber={phoneNumber}
              handleMakeCall={makeCall}
              isConnecting={isConnecting}
              hasToken={!!token}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TwilioSoftphone;
