
import { Button } from "@/components/ui/button";
import { Phone } from 'lucide-react';

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
  );
};

export default CallInitiator;
