
import { useState } from 'react';
import { Phone } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface CallFormProps {
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  handleMakeCall: () => void;
}

const CallForm = ({ phoneNumber, setPhoneNumber, handleMakeCall }: CallFormProps) => {
  const { toast } = useToast();

  const validateAndCall = () => {
    if (!phoneNumber) {
      toast({
        title: "Phone number required",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }

    handleMakeCall();
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="phone-call">Customer Phone Number</Label>
        <Input 
          id="phone-call"
          type="tel" 
          placeholder="+1 (555) 123-4567" 
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
      </div>
      
      <p className="text-sm text-gray-500 mt-4">
        Click the "Call Customer" button to initiate a browser-based call using Twilio's Voice SDK.
      </p>

      <div className="flex justify-end border-t pt-4">
        <Button 
          onClick={validateAndCall}
          className="bg-food-primary hover:bg-food-primary/90"
        >
          <Phone className="mr-2" size={16} />
          Call Customer
        </Button>
      </div>
    </div>
  );
};

export default CallForm;
