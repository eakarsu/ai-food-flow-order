
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface MessageTextareaProps {
  message: string;
  onChange: (value: string) => void;
}

const MessageTextarea = ({ message, onChange }: MessageTextareaProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="message">Message</Label>
      <Textarea 
        id="message"
        placeholder="Enter your message here..." 
        value={message}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[100px]"
      />
    </div>
  );
};

export default MessageTextarea;
