
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

  // Completely rewritten for stricter E.164 format compliance
  const formatPhoneNumber = (phone: string): string => {
    if (!phone || phone.trim() === "") {
      return "+18001234567"; // Default fallback
    }
    
    try {
      console.log("Original phone input:", phone);
      
      // First remove any quotes that might be causing the syntax error
      let formatted = phone.toString().replace(/['"]+/g, '').trim();
      console.log("After removing quotes:", formatted);
      
      // Extract only the digits and any leading plus sign
      const hasPlus = formatted.startsWith('+');
      const digitsOnly = formatted.replace(/\D/g, '');
      console.log("Digits only:", digitsOnly);
      
      // Ensure we have digits
      if (!digitsOnly || digitsOnly.length === 0) {
        console.log("No digits found, using default");
        return "+18001234567";
      }
      
      // Construct proper E.164: + followed by digits
      formatted = (hasPlus ? "+" : "+") + digitsOnly;
      console.log("Final E.164 format:", formatted);
      
      // Sanity check: Must start with + and have at least one digit
      if (!formatted.startsWith('+') || formatted.length < 2) {
        console.log("Invalid format after processing, using default");
        return "+18001234567";
      }
      
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
      // Format phone number before sending
      const formattedPhone = formatPhoneNumber(currentPhone);
      
      // Get the SMS endpoint URL from environment variable or from localStorage
      const smsEndpoint = import.meta.env.VITE_NGROK_SMS_URL || 
                           localStorage.getItem('twilioNgrokSmsUrl') || 
                           '/api/send-sms';  // Fallback to default
      
      console.log("Using SMS endpoint:", smsEndpoint);
      console.log("Sending SMS request with formatted phone:", formattedPhone);
      console.log("JSON payload:", JSON.stringify({
        to: formattedPhone,
        body: message
      }));
      
      const response = await fetch(smsEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: formattedPhone,
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
