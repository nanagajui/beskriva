import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useChatStore } from "@/lib/stores/useChatStore";
import { useSettingsStore } from "@/lib/stores/useSettingsStore";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { MoreVertical } from "lucide-react";

export default function ChatInterface() {
  const { messages, addMessage, isLoading, model, setModel } = useChatStore();
  const { apiKey } = useSettingsStore();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!apiKey) {
      addMessage({
        role: "assistant",
        content: "Please configure your API key in the Settings panel first.",
        timestamp: new Date(),
      });
      return;
    }

    addMessage({
      role: "user",
      content,
      timestamp: new Date(),
    });

    // Add assistant response logic here
    // For now, add a placeholder response
    setTimeout(() => {
      addMessage({
        role: "assistant",
        content: "I'm ready to help you with speech-to-text, text-to-speech, and image generation. Use /stt, /tts, or /image commands to get started.",
        timestamp: new Date(),
      });
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle>AI Chat Assistant</CardTitle>
            <div className="flex items-center space-x-3">
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="llama-8b-chat">Llama 8B Chat</SelectItem>
                  <SelectItem value="llama-70b-chat">Llama 70B Chat</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <ScrollArea className="h-96 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  <p>Start a conversation with your AI assistant!</p>
                  <p className="text-sm mt-2">
                    Use <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">/stt</code>,{" "}
                    <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">/tts</code>, or{" "}
                    <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">/image</code> commands
                  </p>
                </div>
              )}
              
              {messages.map((message, index) => (
                <ChatMessage key={index} message={message} />
              ))}
              
              {isLoading && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-gray-400 rounded-full animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 max-w-md">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <Separator />
          
          <div className="p-4">
            <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
