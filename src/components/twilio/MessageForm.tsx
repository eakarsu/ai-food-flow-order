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

const MessageForm = ({ phoneNumber, onMessageSent }: { phoneNumber: string; onMessageSent: (message: string) => void }) => {
  const [message, setMessage] = useState('');
  const { sendSMS, isLoading } = useSendSMS();

  const handleSendMessage = async () => {
    if (!message.trim() || !phoneNumber || phoneNumber.trim() === '') return;

    try {
      await sendSMS(phoneNumber, message);
      onMessageSent?.(message);
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
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
        <div onKeyPress={handleKeyPress}>
          <MessageTextarea
            value={message}
            onChange={setMessage}
            placeholder="Enter your message here..."
            disabled={isLoading}
          />
        </div>
        <div className="flex justify-end">
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || !phoneNumber || phoneNumber.trim() === '' || isLoading}
            className="bg-food-primary hover:bg-food-primary/90 text-white px-6 py-2 flex items-center space-x-2"
          >
            <Send className="h-4 w-4" />
            <span>{isLoading ? 'Sending...' : 'Send Message'}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MessageForm;