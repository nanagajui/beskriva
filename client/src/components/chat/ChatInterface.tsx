import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useChatStore } from "@/lib/stores/useChatStore";
import { useSettingsStore } from "@/lib/stores/useSettingsStore";
import { chatCompletion } from "@/lib/api/lemonfox";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { MoreVertical } from "lucide-react";

export default function ChatInterface() {
  const { messages, addMessage, isLoading, model, setModel, setIsLoading, temperature, maxTokens } = useChatStore();
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

    // Add user message
    addMessage({
      role: "user",
      content,
      timestamp: new Date(),
    });

    // Check for special commands
    if (content.startsWith('/')) {
      handleCommand(content);
      return;
    }

    // Set loading state
    setIsLoading(true);

    try {
      // Prepare messages for API call
      const apiMessages = messages.concat([{
        role: "user" as const,
        content,
        timestamp: new Date(),
      }]).map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      // Call Lemonfox.ai chat API
      const response = await chatCompletion({
        model,
        messages: apiMessages,
        temperature,
        max_tokens: maxTokens,
      });

      // Add assistant response
      if (response.choices && response.choices.length > 0) {
        addMessage({
          role: "assistant",
          content: response.choices[0].message.content,
          timestamp: new Date(),
        });
      } else {
        throw new Error("No response from API");
      }
    } catch (error) {
      console.error("Chat API error:", error);
      addMessage({
        role: "assistant",
        content: "Sorry, I encountered an error while processing your request. Please check your API key and try again.",
        timestamp: new Date(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommand = (command: string) => {
    const cmd = command.toLowerCase().trim();
    
    if (cmd === '/stt' || cmd.startsWith('/stt ')) {
      addMessage({
        role: "assistant",
        content: "I'll help you with Speech-to-Text! Please go to the STT panel to upload an audio file or record your voice. You can access it from the sidebar navigation.",
        timestamp: new Date(),
      });
    } else if (cmd === '/tts' || cmd.startsWith('/tts ')) {
      addMessage({
        role: "assistant",
        content: "I'll help you with Text-to-Speech! Please go to the TTS panel to enter text and generate speech. You can access it from the sidebar navigation.",
        timestamp: new Date(),
      });
    } else if (cmd === '/image' || cmd.startsWith('/image ')) {
      addMessage({
        role: "assistant",
        content: "I'll help you with Image Generation! Please go to the Image panel to enter a prompt and generate images. You can access it from the sidebar navigation.",
        timestamp: new Date(),
      });
    } else {
      addMessage({
        role: "assistant",
        content: "I understand the following commands:\n• `/stt` - Speech-to-Text conversion\n• `/tts` - Text-to-Speech generation\n• `/image` - Image generation\n\nOr just chat with me normally!",
        timestamp: new Date(),
      });
    }
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
                  <SelectItem value="llama-3.2-3b-instruct">Llama 3.2 3B Instruct</SelectItem>
                  <SelectItem value="llama-3.2-11b-instruct">Llama 3.2 11B Instruct</SelectItem>
                  <SelectItem value="llama-3.2-90b-instruct">Llama 3.2 90B Instruct</SelectItem>
                  <SelectItem value="llama-3.1-8b-instruct">Llama 3.1 8B Instruct</SelectItem>
                  <SelectItem value="llama-3.1-70b-instruct">Llama 3.1 70B Instruct</SelectItem>
                  <SelectItem value="llama-3.1-405b-instruct">Llama 3.1 405B Instruct</SelectItem>
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
