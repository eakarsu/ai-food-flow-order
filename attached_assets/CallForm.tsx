import { useState } from 'react';
import { Phone } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface CallFormProps {
  phoneNumber: string;
  setPhoneNumber: (phone: string) => void;
  handleMakeCall: () => void;
}

const CallForm = ({ phoneNumber, setPhoneNumber, handleMakeCall }: CallFormProps) => {
  console.log("CallForm: Rendering with phoneNumber:", phoneNumber);

  const { toast } = useToast();

  const handleCallClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("CallForm: Call button clicked");
    
    if (!phoneNumber || phoneNumber.trim() === '') {
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
          type="button"
          onClick={handleCallClick}
          className="w-full bg-food-primary hover:bg-food-primary/90 cursor-pointer"
          style={{ pointerEvents: 'auto' }}
        >
          <Phone className="mr-2 h-4 w-4" />
          Make Call
        </Button>
      </div>
    </div>
  );
};

export default CallForm;