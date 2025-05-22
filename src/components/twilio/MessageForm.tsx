
import { useState } from 'react';
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

  const handleChangePhoneNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log("MessageForm: Phone number changed to:", newValue);
    setPhoneNumber(newValue);
  };

  const handleSendSMS = async () => {
    console.log("Preparing to send SMS with phone number:", phoneNumber);
    console.log("Phone number type:", typeof phoneNumber);
    console.log("Phone number length:", phoneNumber.length);
    console.log("Is phone number empty?", phoneNumber.trim() === "");
    
    if (!phoneNumber || phoneNumber.trim() === "") {
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
      console.log("Sending SMS request with phone:", phoneNumber);
      
      const response = await fetch("/api/send-sms", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: phoneNumber,
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
        description: `SMS sent to ${phoneNumber}`,
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
          value={phoneNumber}
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
