
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

  const handleSendSMS = async () => {
    if (!phoneNumber) {
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
      // Call your secure backend endpoint that handles Twilio SMS sending
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
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to send SMS');
      }
      
      await response.json();
      
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
          onChange={(e) => setPhoneNumber(e.target.value)}
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
