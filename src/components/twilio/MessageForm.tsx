import { useState } from 'react';
import { Send, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import PhoneNumberInput from "./PhoneNumberInput";
import MessageTextarea from "./MessageTextarea";
import { useSendSMS } from "@/hooks/useSendSMS";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface MessageFormProps {
  phoneNumber: string;
  setPhoneNumber: (phone: string) => void;
}

const MessageForm = ({ phoneNumber, setPhoneNumber }: MessageFormProps) => {
  console.log("MessageForm: Rendering with phoneNumber:", phoneNumber);
  const [message, setMessage] = useState("");
  const { loading, messageHistory, sendSMS, clearHistory } = useSendSMS({ phoneNumber });
  const { toast } = useToast();

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    console.log("MessageForm: handleSendMessage called with message:", message);

    if (!message.trim()) {
      toast({
        title: "Message Required",
        description: "Please enter a message to send",
        variant: "destructive"
      });
      return;
    }

    const success = await sendSMS(message);
    if (success) {
      setMessage("");
    }
  };

  const handleMessageChange = (value: string) => {
    console.log("MessageForm: Message changed to:", value);
    setMessage(value);
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

        <ScrollArea id="message-history" className="h-[180px] rounded-md border">
          {messageHistory.length > 0 ? (
            <div className="space-y-2 p-3">
              {messageHistory.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`p-2 rounded-lg text-sm ${
                    msg.status === 'sent' 
                      ? 'bg-food-primary/10 text-food-dark' 
                      : msg.status === 'received'
                        ? 'bg-blue-50 text-blue-800'
                        : 'bg-red-50 text-red-800'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="text-xs font-medium mb-1">
                        {msg.status === 'sent' ? 'You' : 
                         msg.status === 'received' ? 'Response' : 'Error'}:
                      </div>
                      <span className="whitespace-pre-wrap break-words">{msg.text}</span>
                    </div>
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
        onChange={handleMessageChange} 
      />

      <div className="flex justify-end border-t pt-4">
        <Button 
          type="button"
          onClick={handleSendMessage} 
          disabled={loading || !message.trim()}
          className="bg-food-primary hover:bg-food-primary/90 cursor-pointer"
          style={{ pointerEvents: 'auto' }}
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