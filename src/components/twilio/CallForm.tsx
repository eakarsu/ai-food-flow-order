import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, PhoneCall } from "lucide-react";
import { useCallManagement } from '@/hooks/useCallManagement';

interface CallFormProps {
  phoneNumber: string;
  onCallInitiated?: () => void;
}

const CallForm: React.FC<CallFormProps> = ({ phoneNumber, onCallInitiated }) => {
  const { initiateCall, isConnecting } = useCallManagement();

  const handleMakeCall = async () => {
    if (!phoneNumber) return;

    try {
      await initiateCall(phoneNumber);
      onCallInitiated?.();
    } catch (error) {
      console.error('Failed to initiate call:', error);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2">
          <Phone className="h-5 w-5 text-food-primary" />
          <span>Make Call</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Button
            onClick={handleMakeCall}
            disabled={!phoneNumber || phoneNumber.trim() === '' || isConnecting}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 flex items-center justify-center space-x-2"
          >
          <PhoneCall className="h-5 w-5" />
          <span>{isConnecting ? 'Connecting...' : 'Make Call'}</span>
        </Button>
      </CardContent>
    </Card>
  );
};

export default CallForm;