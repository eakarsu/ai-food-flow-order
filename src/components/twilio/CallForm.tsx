import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, PhoneCall } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import TwilioSoftphone from './TwilioSoftphone';

interface CallFormProps {
  phoneNumber?: string;
  onCallInitiated?: () => void;
}

const CallForm: React.FC<CallFormProps> = ({ phoneNumber = '', onCallInitiated }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();
  const [softphoneOpen, setSoftphoneOpen] = useState(false);


  const handleMakeCall = async () => {
    if (!phoneNumber || phoneNumber.trim() === '') {
      toast({
        title: "Phone number required",
        description: "Please enter a phone number to call",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);

    try {
      // Simulate call initiation - replace with actual Twilio implementation
      await new Promise(resolve => setTimeout(resolve, 1000));

      onCallInitiated?.();

      toast({
        title: "Call Initiated",
        description: `Calling ${phoneNumber}`,
      });
    } catch (error) {
      console.error('Failed to initiate call:', error);

      toast({
        title: "Failed to Make Call",
        description: "An error occurred while initiating the call",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <Phone className="h-5 w-5 text-food-primary" />
            <span>Make Call</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => setSoftphoneOpen(true)}
            disabled={!phoneNumber || phoneNumber.trim() === ''}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 flex items-center justify-center space-x-2"
          >
            <PhoneCall className="h-5 w-5" />
            <span>{isConnecting ? 'Connecting...' : 'Make Call'}</span>
          </Button>
        </CardContent>
      </Card>

      <TwilioSoftphone
        phoneNumber={phoneNumber}
        open={softphoneOpen}
        onOpenChange={setSoftphoneOpen}
      />
    </>
  );
};

export default CallForm;