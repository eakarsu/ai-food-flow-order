
import { Button } from "@/components/ui/button";
import { Phone, Volume2 } from 'lucide-react';
import { Loader2 } from 'lucide-react';

interface CallInitiatorProps {
  phoneNumber: string;
  handleMakeCall: () => void;
  isConnecting: boolean;
  hasToken: boolean;
}

const CallInitiator = ({ phoneNumber, handleMakeCall, isConnecting, hasToken }: CallInitiatorProps) => {
  return (
    <>
      <div className="text-4xl font-semibold text-food-dark">
        {phoneNumber}
      </div>
      
      <Button
        onClick={handleMakeCall}
        disabled={isConnecting || !hasToken}
        className={`${isConnecting ? 'bg-gray-400' : 'bg-food-primary hover:bg-food-primary/90'} h-16 w-16 rounded-full flex items-center justify-center`}
      >
        {isConnecting ? (
          <Loader2 size={28} className="animate-spin" />
        ) : (
          <Phone size={28} />
        )}
      </Button>
      
      {isConnecting && (
        <div className="text-base font-medium text-food-primary animate-pulse">
          Connecting to {phoneNumber}...
        </div>
      )}

      {!isConnecting && (
        <div className="text-sm text-gray-500">
          Click to initiate call
        </div>
      )}
      
      {isConnecting && (
        <div className="mt-2 flex items-center justify-center text-xs text-gray-500">
          <Volume2 size={14} className="mr-1" />
          Make sure your speakers are turned on
        </div>
      )}
    </>
  );
};

export default CallInitiator;
