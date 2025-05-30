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
    <div className="space-y-2">
      <Label htmlFor="message" className="text-sm font-medium text-gray-700">Message</Label>
      <Textarea
        id="message"
        placeholder="Enter your message here..."
        value={message}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[120px] resize-none pointer-events-auto"
        style={{ pointerEvents: 'auto' }}
        rows={5}
        disabled={false}
      />
    </div>
  );
};

export default MessageTextarea;