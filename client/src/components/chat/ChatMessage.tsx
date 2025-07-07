import { Button } from "@/components/ui/button";
import { Copy, Download, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChatMessageProps {
  message: {
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: Date;
    image?: string;
  };
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      toast({
        title: "Copied to clipboard",
        description: "Message content has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy message content.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    const blob = new Blob([message.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-message-${message.timestamp.toISOString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  return (
    <div className={`flex items-start space-x-3 ${isUser ? "justify-end" : ""}`}>
      {!isUser && (
        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
          <span className="text-gray-500 dark:text-gray-400 text-sm">🤖</span>
        </div>
      )}
      
      <div className={`flex-1 ${isUser ? "max-w-md" : ""}`}>
        <div className={`rounded-lg p-3 ${
          isUser 
            ? "bg-primary text-primary-foreground ml-auto" 
            : isSystem
            ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
            : "bg-gray-100 dark:bg-gray-700"
        } ${isUser ? "max-w-md" : "max-w-md"}`}>
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          
          {message.image && (
            <img 
              src={message.image} 
              alt="Generated content" 
              className="mt-3 rounded-lg w-full h-auto shadow-md" 
            />
          )}
        </div>
        
        <div className={`mt-2 flex items-center space-x-2 ${isUser ? "justify-end" : ""}`}>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(message.timestamp).toLocaleTimeString([], { 
              hour: "2-digit", 
              minute: "2-digit" 
            })}
          </span>
          
          {!isUser && (
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-6 px-2 text-xs"
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="h-6 px-2 text-xs"
              >
                <Download className="h-3 w-3 mr-1" />
                Save
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Regenerate
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {isUser && (
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
          <span className="text-primary-foreground text-sm">👤</span>
        </div>
      )}
    </div>
  );
}
