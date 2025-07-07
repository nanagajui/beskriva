import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Send, Paperclip, Mic } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [streaming, setStreaming] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const insertCommand = (command: string) => {
    setMessage(prev => prev + command + " ");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center space-x-3">
        <div className="flex-1 relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message or use /stt, /tts, /image commands..."
            className="min-h-[44px] pr-16 resize-none"
            disabled={disabled}
          />
          <div className="absolute right-2 top-2 flex items-center space-x-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <Mic className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Button
          type="submit"
          disabled={disabled || !message.trim()}
          className="h-11 px-4"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-xs text-gray-500 dark:text-gray-400">Quick Tools:</span>
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertCommand("/stt")}
              className="h-6 px-2 text-xs text-primary hover:text-primary/80"
            >
              /stt
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertCommand("/tts")}
              className="h-6 px-2 text-xs text-primary hover:text-primary/80"
            >
              /tts
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertCommand("/image")}
              className="h-6 px-2 text-xs text-primary hover:text-primary/80"
            >
              /image
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="streaming"
            checked={streaming}
            onCheckedChange={(checked) => setStreaming(!!checked)}
          />
          <label htmlFor="streaming" className="text-xs text-gray-500 dark:text-gray-400">
            Stream response
          </label>
        </div>
      </div>
    </form>
  );
}
