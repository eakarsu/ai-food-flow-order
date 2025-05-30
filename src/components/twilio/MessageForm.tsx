
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Send } from "lucide-react";
import MessageTextarea from './MessageTextarea';
import { useToast } from "@/hooks/use-toast";

interface MessageFormProps {
  phoneNumber?: string;
  onMessageSent?: (message: string) => void;
}

const MessageForm: React.FC<MessageFormProps> = ({ phoneNumber = '', onMessageSent }) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (!message.trim() || !phoneNumber || phoneNumber.trim() === '') {
      toast({
        title: "Message required",
        description: "Please enter a message and phone number",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // Simulate SMS sending - replace with actual Twilio implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onMessageSent?.(message);
      setMessage('');
      
      toast({
        title: "Message Sent",
        description: `SMS sent to ${phoneNumber}`,
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      
      toast({
        title: "Failed to Send Message",
        description: "An error occurred while sending the message",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5 text-food-primary" />
          <span>Your Message</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <MessageTextarea
            value={message}
            onChange={setMessage}
            placeholder="Enter your message here..."
            disabled={loading}
            onKeyPress={handleKeyPress}
          />
        </div>
        <div className="flex justify-end">
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || !phoneNumber || phoneNumber.trim() === '' || loading}
            className="bg-food-primary hover:bg-food-primary/90 text-white px-6 py-2 flex items-center space-x-2"
          >
            <Send className="h-4 w-4" />
            <span>{loading ? 'Sending...' : 'Send Message'}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MessageForm;
