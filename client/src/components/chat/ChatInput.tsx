import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Send, Paperclip, Mic, FileText, X } from "lucide-react";
import { useDocumentStore } from "@/lib/stores/useDocumentStore";
import DocumentUpload from "@/components/document/DocumentUpload";

interface ChatInputProps {
  onSendMessage: (content: string, attachedDocument?: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [streaming, setStreaming] = useState(true);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const { currentDocument } = useDocumentStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim(), currentDocument?.id);
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
              onClick={() => setShowDocumentUpload(!showDocumentUpload)}
              title="Attach document"
            >
              <FileText className="h-4 w-4" />
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

      {/* Document Upload */}
      {showDocumentUpload && (
        <div className="border rounded-lg p-4 bg-muted/50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">Attach Document</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDocumentUpload(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <DocumentUpload 
            onUploadComplete={() => setShowDocumentUpload(false)}
          />
        </div>
      )}

      {/* Current Document Display */}
      {currentDocument && !showDocumentUpload && (
        <div className="flex items-center justify-between p-2 bg-muted/30 rounded border">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{currentDocument.name}</span>
            <span className="text-xs text-muted-foreground">
              ({currentDocument.metadata?.wordCount || 0} words)
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setShowDocumentUpload(true)}
          >
            <Paperclip className="h-3 w-3" />
          </Button>
        </div>
      )}
      
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
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertCommand("/pdf")}
              disabled={!currentDocument}
              className="h-6 px-2 text-xs text-primary hover:text-primary/80 disabled:opacity-50"
            >
              /pdf
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
