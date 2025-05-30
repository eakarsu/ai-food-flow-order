
import React from 'react';
import { Textarea } from "@/components/ui/textarea";

interface MessageTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const MessageTextarea: React.FC<MessageTextareaProps> = ({
  value,
  onChange,
  placeholder = "Enter your message here...",
  disabled = false,
  className = ""
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(e.target.value);
  };

  return (
    <Textarea
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`min-h-[100px] resize-none ${className}`}
      rows={4}
    />
  );
};

export default MessageTextarea;
