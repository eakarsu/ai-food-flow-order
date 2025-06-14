
import { Button } from "@/components/ui/button";
import { PhoneOff, Mic, MicOff, Volume2 } from 'lucide-react';

interface SoftphoneControlsProps {
  isMuted: boolean;
  handleToggleMute: () => void;
  handleDisconnect: () => void;
}

const SoftphoneControls = ({ isMuted, handleToggleMute, handleDisconnect }: SoftphoneControlsProps) => {
  return (
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
  );
};

export default SoftphoneControls;
