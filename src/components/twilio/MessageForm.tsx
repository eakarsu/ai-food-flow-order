import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
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
      console.log('Message is empty');
      return;
    }

    if (!phoneNumber || phoneNumber.trim() === '') {
      console.log('Phone number is empty');
      return;
    }

    console.log('Sending message:', message, 'to:', phoneNumber);
    
    try {
      const success = await sendSMS(message);
      if (success) {
        onMessageSent?.(message);
        setMessage('');
        console.log('Message sent successfully');
      } else {
        console.log('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="space-y-4">
      <MessageTextarea
        value={message}
        onChange={setMessage}
        placeholder="Enter your message here..."
        disabled={loading}
        onKeyPress={handleKeyPress}
      />
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
    </div>
  );
};

export default MessageForm;