
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
  const [localPhoneNumber, setLocalPhoneNumber] = useState(phoneNumber);

  // Log important information about phone number
  useEffect(() => {
    console.log("MessageForm: Component mounted");
    console.log("MessageForm: Phone number from props:", phoneNumber);
    
    // Initialize from localStorage if prop is empty
    if (!phoneNumber) {
      const storedPhone = localStorage.getItem('lastPhoneNumber');
      console.log("MessageForm: Found stored phone number:", storedPhone);
      
      if (storedPhone) {
        // Update both local and parent state
        setLocalPhoneNumber(storedPhone);
        setPhoneNumber(storedPhone);
        console.log("MessageForm: Initialized from localStorage:", storedPhone);
      }
    } else {
      // Ensure local state is synced with prop
      setLocalPhoneNumber(phoneNumber);
    }
  }, []);

  // Update local state when prop changes
  useEffect(() => {
    console.log("MessageForm: Phone number prop changed:", phoneNumber);
    if (phoneNumber !== localPhoneNumber) {
      setLocalPhoneNumber(phoneNumber);
    }
  }, [phoneNumber]);

  const handleChangePhoneNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log("MessageForm: Phone number changed to:", newValue);
    
    // Update both local and parent state
    setLocalPhoneNumber(newValue);
    setPhoneNumber(newValue);
    
    // Persist to localStorage
    if (newValue) {
      localStorage.setItem('lastPhoneNumber', newValue);
      console.log("MessageForm: Saved phone number to localStorage:", newValue);
    }
  };

  const handleSendSMS = async () => {
    // Use combined approach for determining phone number
    const phoneToUse = localPhoneNumber || phoneNumber || localStorage.getItem('lastPhoneNumber') || "";
    
    console.log("Preparing to send SMS with phone number:", phoneToUse);
    console.log("Phone number type:", typeof phoneToUse);
    console.log("Phone number length:", phoneToUse.length);
    console.log("Is phone number empty?", phoneToUse.trim() === "");
    
    if (!phoneToUse || phoneToUse.trim() === "") {
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
      console.log("Sending SMS request with phone:", phoneToUse);
      
      const response = await fetch("/api/send-sms", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: phoneToUse,
          body: message
        })
      });
      
      console.log("SMS API response status:", response.status);
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to send SMS');
      }
      
      const responseData = await response.json();
      console.log("SMS sent successfully:", responseData);
      
      toast({
        title: "Message Sent",
        description: `SMS sent to ${phoneToUse}`,
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
