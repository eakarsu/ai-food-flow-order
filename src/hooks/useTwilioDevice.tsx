
import { useEffect } from 'react';
import { useTwilioToken } from './useTwilioToken';
import { useTwilioDeviceInit } from './useTwilioDeviceInit';
import { useCallManagement } from './useCallManagement';

export const useTwilioDevice = (open: boolean, phoneNumber: string) => {
  // Get token management functionality
  const { token, fetchToken } = useTwilioToken();
  
  // Initialize device when component opens
  useEffect(() => {
    if (open) {
      fetchToken();
    }
  }, [open]);

  // Initialize device with token
  const deviceRef = useTwilioDeviceInit({ open, token });

  // Get call management functionality
  const {
    isMuted,
    isConnected,
    isConnecting,
    makeCall: initiateCall,
    disconnectCall,
    toggleMute
  } = useCallManagement({ deviceRef });

  // Wrapper for makeCall to pass phone number
  const makeCall = () => {
    initiateCall(phoneNumber);
  };

  return {
    token,
    isConnected,
    isConnecting,
    isMuted,
    makeCall,
    disconnectCall,
    toggleMute
  };
};
