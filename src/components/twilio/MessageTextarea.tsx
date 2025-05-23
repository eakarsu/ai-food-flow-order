
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface MessageTextareaProps {
  message: string;
  onChange: (value: string) => void;
}

const MessageTextarea = ({ message, onChange }: MessageTextareaProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="message">New Message</Label>
      <Textarea 
        id="message"
        placeholder="Enter your message here..." 
        value={message}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[60px] resize-none"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            // Trigger form submission via a custom event
            const submitEvent = new CustomEvent('submit-message');
            document.dispatchEvent(submitEvent);
          }
        }}
      />
      <div className="text-xs text-muted-foreground text-right">
        Press Enter to send, Shift+Enter for new line
      </div>
    </div>
  );
};

export default MessageTextarea;
