import React from 'react';
import { Textarea } from "@/components/ui/textarea";

interface MessageTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const MessageTextarea = ({ value, onChange, placeholder, disabled }: MessageTextareaProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <Textarea
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      className="min-h-[100px] resize-none"
      rows={4}
    />
  );
};

export default MessageTextarea;