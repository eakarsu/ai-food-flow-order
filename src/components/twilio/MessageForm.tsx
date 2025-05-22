
import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from "@/components/ui/button";
import PhoneNumberInput from "./PhoneNumberInput";
import MessageTextarea from "./MessageTextarea";
import { useSendSMS } from "@/hooks/useSendSMS";

interface MessageFormProps {
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
}

const MessageForm = ({ phoneNumber, setPhoneNumber }: MessageFormProps) => {
  const [message, setMessage] = useState("");
  const { loading, sendSMS } = useSendSMS({ phoneNumber });

  const handleSendSMS = async () => {
    const success = await sendSMS(message);
    if (success) {
      setMessage("");
    }
  };

  return (
    <div className="space-y-4">
      <PhoneNumberInput 
        phoneNumber={phoneNumber} 
        setPhoneNumber={setPhoneNumber} 
      />
      
      <MessageTextarea 
        message={message} 
        onChange={setMessage} 
      />

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
