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

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("MessageTextarea: Clicked");
  };

  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    e.stopPropagation();
    console.log("MessageTextarea: Focused");
  };

  return (
    <div className="space-y-2" onClick={handleClick}>
      <Label htmlFor="message-input" className="text-sm font-medium text-gray-700">
        Your Message
      </Label>
      <Textarea
        id="message-input"
        placeholder="Enter your message here..."
        value={message || ""}
        onChange={handleChange}
        onFocus={handleFocus}
        onClick={handleClick}
        className="min-h-[100px] resize-none bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
        style={{ pointerEvents: 'auto' }}
        tabIndex={0}
      />
    </div>
  );
};

export default MessageTextarea;