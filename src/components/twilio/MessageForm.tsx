import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from 'lucide-react';
import { useSendSMS } from '@/hooks/useSendSMS';

interface MessageFormProps {
  phoneNumber?: string;
  onMessageSent?: (message: string) => void;
}

export const MessageForm: React.FC<MessageFormProps> = ({ phoneNumber, onMessageSent }) => {
  const [message, setMessage] = useState('');
  const { sendSMS, isLoading } = useSendSMS(phoneNumber || '+18001234567');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    try {
      await sendSMS(message.trim());
      setMessage('');
      if (onMessageSent) {
        onMessageSent(message.trim());
      }
    } catch (error) {
      console.error('Failed to send SMS:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Your Message
        </label>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Enter your message here..."
          className="min-h-[100px] resize-none"
          disabled={isLoading}
        />
      </div>
      <Button
        type="submit"
        disabled={!message.trim() || isLoading}
        className="w-full bg-red-600 hover:bg-red-700 text-white"
      >
        {isLoading ? (
          <>Sending...</>
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" />
            Send Message
          </>
        )}
      </Button>
    </form>
  );
};

export default MessageForm;
export { MessageForm };