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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { sendMessage } = useSendSMS({ phoneNumber });

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

    setIsSubmitting(true);
    try {
      await sendMessage(message);
      setMessage('');
      onMessageSent?.(message);
      toast({
        title: "Success",
        description: "Message sent successfully!",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="flex-1">
        <MessageTextarea
          value={message}
          onChange={setMessage}
          placeholder="Enter your message here..."
          disabled={isSubmitting}
        />
      </div>
      <Button
        type="submit"
        disabled={isSubmitting || !message.trim()}
        className="px-6 py-2 bg-food-primary text-white hover:bg-food-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
};

export default MessageForm;