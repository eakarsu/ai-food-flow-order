
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Send } from "lucide-react";
import MessageTextarea from './MessageTextarea';
import { useSendSMS } from '@/hooks/useSendSMS';

interface MessageFormProps {
  phoneNumber?: string;
  onMessageSent?: (message: string) => void;
}

const MessageForm: React.FC<MessageFormProps> = ({ phoneNumber = '', onMessageSent }) => {
  const [message, setMessage] = useState('');
  const { sendSMS, loading } = useSendSMS({ phoneNumber });

  const handleSendMessage = async () => {
    if (!message.trim()) {
      return;
    }

    const success = await sendSMS(message);
    if (success) {
      onMessageSent?.(message);
      setMessage('');
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
