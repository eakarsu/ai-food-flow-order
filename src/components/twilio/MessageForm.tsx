
import { useState } from 'react';
import { Send, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import PhoneNumberInput from "./PhoneNumberInput";
import MessageTextarea from "./MessageTextarea";
import { useSendSMS } from "@/hooks/useSendSMS";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";

interface MessageFormProps {
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
}

const MessageForm = ({ phoneNumber, setPhoneNumber }: MessageFormProps) => {
  const [message, setMessage] = useState("");
  const { loading, messageHistory, sendSMS, clearHistory } = useSendSMS({ phoneNumber });

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
      
      {/* Message History Area */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="message-history" className="text-sm font-medium text-gray-700">Message History</Label>
          {messageHistory.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearHistory}
              className="h-6 p-0 text-gray-500 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              <span className="ml-1 text-xs">Clear</span>
            </Button>
          )}
        </div>
        
        <ScrollArea id="message-history" className="h-32 rounded-md border">
          {messageHistory.length > 0 ? (
            <div className="space-y-2 p-2">
              {messageHistory.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`p-2 rounded-lg text-sm ${
                    msg.status === 'sent' 
                      ? 'bg-food-primary/10 text-food-dark' 
                      : 'bg-red-50 text-red-800'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="whitespace-pre-wrap break-words">{msg.text}</span>
                    <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                      {format(msg.timestamp, 'HH:mm')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
              No messages yet
            </div>
          )}
        </ScrollArea>
      </div>
      
      {/* New Message Area */}
      <MessageTextarea 
        message={message} 
        onChange={setMessage} 
      />

      <div className="flex justify-end border-t pt-4">
        <Button 
          onClick={handleSendSMS} 
          disabled={loading || !message.trim()}
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
