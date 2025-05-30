import React from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface MessageTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  onKeyPress?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

const MessageTextarea: React.FC<MessageTextareaProps> = ({ 
  value, 
  onChange, 
  placeholder = "Enter your message here...", 
  disabled = false,
  onKeyPress
}) => {
  return (
    <div className="w-full">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={onKeyPress}
        placeholder={placeholder}
        disabled={disabled}
        className="min-h-[100px] resize-none border-gray-300 focus:border-food-primary focus:ring-food-primary"
        rows={4}
      />
    </div>
  );
};

export default MessageTextarea;