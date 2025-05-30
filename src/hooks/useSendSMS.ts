import { useState } from 'react';
import { useToast } from './use-toast';

interface Message {
  text: string;
  status: 'sent' | 'received' | 'failed';
  timestamp: number;
}

export const useSendSMS = (phoneNumber: string = '+18001234567') => {
  const [messageHistory, setMessageHistory] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendSMS = async (message: string) => {
    if (!message.trim()) return;

    setIsLoading(true);

    // Add message to history immediately
    const newMessage: Message = {
      text: message,
      status: 'sent',
      timestamp: Date.now()
    };

    setMessageHistory(prev => [...prev, newMessage]);

    try {
      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: phoneNumber,
          message: message
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      toast({
        title: "SMS Sent",
        description: `Message sent successfully to ${phoneNumber}`,
      });

      // Simulate a response after a delay
      setTimeout(() => {
        const responseMessage: Message = {
          text: "Thank you for your message! We'll get back to you shortly.",
          status: 'received',
          timestamp: Date.now()
        };
        setMessageHistory(prev => [...prev, responseMessage]);
      }, 2000);

    } catch (error) {
      console.error('Error sending SMS:', error);

      // Update the message status to failed
      setMessageHistory(prev => 
        prev.map((msg, index) => 
          index === prev.length - 1 && msg.status === 'sent'
            ? { ...msg, status: 'failed' }
            : msg
        )
      );

      toast({
        title: "Failed to send SMS",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    setMessageHistory([]);
  };

  return {
    sendSMS,
    isLoading,
    messageHistory,
    clearHistory
  };
};