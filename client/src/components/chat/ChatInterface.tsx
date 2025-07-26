import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatStore } from "@/lib/stores/useChatStore";
import { chatApi } from "@/lib/api/chat";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import ChatList from "./ChatList";

export default function ChatInterface() {
  const {
    chats,
    setChats,
    activeChat,
    setActiveChat,
    messages,
    setMessages,
    addMessage,
  } = useChatStore();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchChats = async () => {
      const fetchedChats = await chatApi.getChats();
      setChats(fetchedChats);
      if (fetchedChats.length > 0) {
        setActiveChat(fetchedChats[0]);
      }
    };
    fetchChats();
  }, [setChats, setActiveChat]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (activeChat) {
        const fetchedMessages = await chatApi.getMessages(activeChat.id);
        setMessages(fetchedMessages);
      }
    };
    fetchMessages();
  }, [activeChat, setMessages]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    setIsLoading(true);
    try {
      let currentChat = activeChat;
      if (!currentChat) {
        const newChat = await chatApi.createChat();
        setChats([newChat, ...chats]);
        setActiveChat(newChat);
        currentChat = newChat;
      }

      const userMessage = await chatApi.createMessage(
        currentChat.id,
        "user",
        content,
      );
      addMessage(userMessage);

      // Simulate assistant response for now
      setTimeout(() => {
        const assistantMessage = {
          id: Date.now(),
          chatId: currentChat.id,
          role: "assistant" as const,
          content: "This is a placeholder response.",
          createdAt: new Date(),
        };
        addMessage(assistantMessage);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Chat API error:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)]">
      <ChatList />
      <div className="flex-1 flex flex-col">
        <Card className="flex-1 flex flex-col">
          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {isLoading && (
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 bg-gray-400 rounded-full animate-pulse" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 max-w-md">
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          />
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            <div className="p-4 border-t">
              <ChatInput
                onSendMessage={handleSendMessage}
                disabled={isLoading}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
