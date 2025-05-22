
import { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface MessageFormProps {
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
}

const MessageForm = ({ phoneNumber, setPhoneNumber }: MessageFormProps) => {
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  // Create local state to ensure phone number is preserved
  const [localPhoneNumber, setLocalPhoneNumber] = useState(phoneNumber || "");

  // Sync with props and localStorage
  useEffect(() => {
    console.log("MessageForm: MOUNT with phone number prop:", phoneNumber);
    
    // Try to get from localStorage if empty prop
    if (!phoneNumber || phoneNumber.trim() === "") {
      const storedPhone = localStorage.getItem('lastPhoneNumber');
      console.log("MessageForm: Found stored phone number:", storedPhone);
      
      if (storedPhone) {
        // Update parent state and local state
        setPhoneNumber(storedPhone);
        setLocalPhoneNumber(storedPhone);
        console.log("MessageForm: Setting parent state with stored number:", storedPhone);
      }
    } else {
      // If we have a phone number prop, ensure local state is in sync
      setLocalPhoneNumber(phoneNumber);
      console.log("MessageForm: Local state synced with prop:", phoneNumber);
    }
  }, []);

  // Update local state when prop changes
  useEffect(() => {
    console.log("MessageForm: Phone number prop changed:", phoneNumber);
    if (phoneNumber && phoneNumber !== localPhoneNumber) {
      setLocalPhoneNumber(phoneNumber);
      console.log("MessageForm: Updated local state with new prop:", phoneNumber);
    }
  }, [phoneNumber]);

  const handleChangePhoneNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalPhoneNumber(newValue);
    setPhoneNumber(newValue);
    
    // Also persist to localStorage immediately
    if (newValue.trim() !== "") {
      localStorage.setItem('lastPhoneNumber', newValue);
      console.log("MessageForm: Saved phone number to localStorage:", newValue);
    }
  };

  const handleSendSMS = async () => {
    // Use local state for validation to ensure we have the most up-to-date value
    console.log("Sending SMS with phone number (local):", localPhoneNumber);
    console.log("Sending SMS with phone number (prop):", phoneNumber);
    
    // Always use the local state for validation
    if (!localPhoneNumber || localPhoneNumber.trim() === "") {
      toast({
        title: "Phone number required",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }

    if (!message) {
      toast({
        title: "Message required",
        description: "Please enter a message to send",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // Use the local phone number to ensure we're using the correct value
      const response = await fetch("/api/send-sms", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: localPhoneNumber,
          body: message
        })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to send SMS');
      }
      
      await response.json();
      
      toast({
        title: "Message Sent",
        description: `SMS sent to ${localPhoneNumber}`,
      });
      
      setMessage("");
    } catch (error) {
      console.error("SMS Error:", error);
      
      toast({
        title: "Failed to Send Message",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="phone-sms">Customer Phone Number</Label>
        <Input 
          id="phone-sms"
          type="tel" 
          placeholder="+1 (555) 123-4567" 
          value={localPhoneNumber}
          onChange={handleChangePhoneNumber}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea 
          id="message"
          placeholder="Enter your message here..." 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="min-h-[100px]"
        />
      </div>

      <div className="flex justify-end border-t pt-4">
        <Button 
          onClick={handleSendSMS} 
          disabled={loading}
          className="bg-food-primary hover:bg-food-primary/90"
        >
          {loading ? "Sending..." : (
            <>
              <Send className="mr-2" size={16} />
              Send Message
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default MessageForm;
