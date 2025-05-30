import React from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface MessageTextareaProps {
  message: string;
  onChange: (value: string) => void;
}

const MessageTextarea = ({ message, onChange }: MessageTextareaProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    console.log("MessageTextarea: Input changed to:", e.target.value);
    onChange(e.target.value);
  };

  const handleFocus = () => {
    console.log("MessageTextarea: Focused");
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="message-input" className="text-sm font-medium text-gray-700">
        Your Message
      </Label>
      <Textarea
        id="message-input"
        placeholder="Enter your message here..."
        value={message}
        onChange={handleChange}
        onFocus={handleFocus}
        className="min-h-[100px] resize-none"
        disabled={false}
        readOnly={false}
        autoComplete="off"
      />
    </div>
  );
};

export default MessageTextarea;