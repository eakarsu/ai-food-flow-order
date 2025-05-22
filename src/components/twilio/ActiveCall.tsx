
import SoftphoneControls from './SoftphoneControls';

interface ActiveCallProps {
  phoneNumber: string;
  isMuted: boolean;
  handleToggleMute: () => void;
  handleDisconnect: () => void;
}

const ActiveCall = ({ phoneNumber, isMuted, handleToggleMute, handleDisconnect }: ActiveCallProps) => {
  return (
    <>
      <div className="text-4xl font-semibold text-food-dark">
        {phoneNumber}
      </div>
      
      <div className="text-sm text-gray-500">
        Call in progress
      </div>
      
      <SoftphoneControls
        isMuted={isMuted}
        handleToggleMute={handleToggleMute}
        handleDisconnect={handleDisconnect}
      />
    </>
  );
};

export default ActiveCall;
