import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface MessageTextareaProps {
  message: string;
  onChange: (value: string) => void;
}

const MessageTextarea = ({ message, onChange }: MessageTextareaProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="message">Enter your message</Label>
      <Textarea 
        id="message"
        placeholder="Type your message here..." 
        value={message || ""}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="resize-none"
        disabled={false}
      />
    </div>
  );
};

export default MessageTextarea;