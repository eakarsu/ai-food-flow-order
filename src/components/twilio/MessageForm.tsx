import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSendSMS } from '@/hooks/useSendSMS';
import MessageTextarea from './MessageTextarea';

interface MessageFormProps {
  phoneNumber: string;
  onMessageSent?: (message: string) => void;
}

const MessageForm = ({ phoneNumber, onMessageSent }: MessageFormProps) => {
  const [message, setMessage] = useState('');
  const { toast } = useToast();
  const { loading, sendSMS } = useSendSMS({ phoneNumber });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      });
      return;
    }

    if (!phoneNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter a phone number",
        variant: "destructive",
      });
      return;
    }

    try {
      const success = await sendSMS(message);
      if (success) {
        setMessage('');
        onMessageSent?.(message);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <MessageTextarea
        value={message}
        onChange={setMessage}
        placeholder="Enter your message here..."
        disabled={loading}
      />
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={loading || !message.trim()}
          className="px-6 py-2 bg-food-primary text-white hover:bg-food-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="h-4 w-4 mr-2" />
          {loading ? 'Sending...' : 'Send Message'}
        </Button>
      </div>
    </form>
  );
};

export default MessageForm;