
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import MessageTextarea from './MessageTextarea';

interface MessageFormProps {
  phoneNumber: string;
  onMessageSent?: (message: string) => void;
}

const MessageForm: React.FC<MessageFormProps> = ({ phoneNumber, onMessageSent }) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      });
      return;
    }

    if (!phoneNumber || phoneNumber.trim() === '') {
      toast({
        title: "Error", 
        description: "Please enter a phone number",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate SMS sending - replace with actual SMS service
      console.log('Sending SMS to:', phoneNumber);
      console.log('Message:', message);
      
      // Call the parent callback
      onMessageSent?.(message);
      
      toast({
        title: "Success",
        description: "Message sent successfully!",
      });
      
      setMessage('');
    } catch (error) {
      console.error('Error sending SMS:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <MessageTextarea
        value={message}
        onChange={setMessage}
        placeholder="Enter your message here..."
        disabled={isLoading}
      />
      <Button
        type="submit"
        disabled={isLoading || !message.trim() || !phoneNumber.trim()}
        className="w-full bg-food-primary hover:bg-food-primary/90 text-white py-2 flex items-center justify-center space-x-2 cursor-pointer"
      >
        <Send className="h-4 w-4" />
        <span>{isLoading ? 'Sending...' : 'Send Message'}</span>
      </Button>
    </form>
  );
};

export default MessageForm;
