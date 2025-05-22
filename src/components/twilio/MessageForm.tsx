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
  // Use a default phone number if none is provided
  const [inputPhoneNumber, setInputPhoneNumber] = useState(phoneNumber || "+18001234567");
  
  // When component mounts, initialize with a valid default if empty
  useEffect(() => {
    console.log("MessageForm: Component mounted with phone:", inputPhoneNumber);
    
    // If no phone number is set, use the default
    if (!inputPhoneNumber || inputPhoneNumber.trim() === "") {
      console.log("MessageForm: Using default phone number");
      const defaultPhone = "+18001234567";
      setInputPhoneNumber(defaultPhone);
      setPhoneNumber(defaultPhone);
      localStorage.setItem('lastPhoneNumber', defaultPhone);
    }
  }, []);

  // When parent component updates phoneNumber
  useEffect(() => {
    if (phoneNumber && phoneNumber !== inputPhoneNumber) {
      console.log("MessageForm: Parent updated phone to:", phoneNumber);
      setInputPhoneNumber(phoneNumber);
    }
  }, [phoneNumber]);

  const handleChangePhoneNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log("MessageForm: Phone input changed to:", newValue);
    
    // Always update local state first
    setInputPhoneNumber(newValue);
    
    // Then update parent and localStorage
    if (newValue && newValue.trim() !== "") {
      console.log("MessageForm: Updating parent with new phone:", newValue);
      setPhoneNumber(newValue);
      localStorage.setItem('lastPhoneNumber', newValue);
    } else {
      // If empty, use default
      const defaultPhone = "+18001234567";
      console.log("MessageForm: Empty input, using default:", defaultPhone);
      setPhoneNumber(defaultPhone);
      localStorage.setItem('lastPhoneNumber', defaultPhone);
    }
  };

  // Format phone number for API consumption - completely rewritten for E.164 format
  const formatPhoneNumber = (phone: string): string => {
    if (!phone || phone.trim() === "") {
      return "+18001234567"; // Default fallback
    }
    
    try {
      // Strip all non-numeric characters except the leading plus
      let formatted = phone.replace(/['"]+/g, '').trim();
      
      // Ensure there's a leading plus
      if (!formatted.startsWith('+')) {
        formatted = '+' + formatted;
      }
      
      // Keep only the plus sign and digits
      formatted = '+' + formatted.replace(/[^\d]/g, '');
      
      // Ensure we have at least some digits after the plus
      if (formatted.length <= 1) {
        return "+18001234567"; // Default if we've stripped everything
      }
      
      // Remove any country code prefix that might be duplicated (like ++1)
      if (formatted.startsWith('++')) {
        formatted = '+' + formatted.substring(2);
      }
      
      console.log("MessageForm: Final formatted phone:", formatted);
      return formatted;
    } catch (error) {
      console.error("Error formatting phone number:", error);
      return "+18001234567"; // Default on error
    }
  };

  const handleSendSMS = async () => {
    // Always use the current input value first, fallback to default
    const currentPhone = inputPhoneNumber || localStorage.getItem('lastPhoneNumber') || "+18001234567";
    
    console.log("Preparing to send SMS with phone number:", currentPhone);
    console.log("Phone number type:", typeof currentPhone);
    console.log("Phone number length:", currentPhone.length);
    console.log("Is phone number empty?", currentPhone.trim() === "");
    
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
      // Format phone number before sending - ensure it's a clean string without quotes
      const formattedPhone = formatPhoneNumber(currentPhone);
      console.log("Sending SMS request with formatted phone:", formattedPhone);
      
      const response = await fetch("/api/send-sms", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: formattedPhone, // Use the properly formatted phone number
          body: message
        })
      });
      
      console.log("SMS API response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("SMS API error response:", errorData);
        throw new Error(errorData.message || 'Failed to send SMS');
      }
      
      const responseData = await response.json();
      console.log("SMS sent successfully:", responseData);
      
      toast({
        title: "Message Sent",
        description: `SMS sent to ${formattedPhone}`,
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
          value={inputPhoneNumber}
          onChange={handleChangePhoneNumber}
        />
        <div className="text-xs text-muted-foreground">
          Using phone number: {inputPhoneNumber || "+18001234567"}
        </div>
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
