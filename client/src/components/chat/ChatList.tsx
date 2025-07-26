import { useChatStore } from "@/lib/stores/useChatStore";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export default function ChatList() {
  const { chats, activeChat, setActiveChat } = useChatStore();

  return (
    <div className="w-64 border-r">
      <div className="p-4">
        <h2 className="text-lg font-semibold">Chats</h2>
      </div>
      <ScrollArea className="h-[calc(100vh-10rem)]">
        <div className="p-2 space-y-1">
          {chats.map((chat) => (
            <Button
              key={chat.id}
              variant="ghost"
              className={cn(
                "w-full justify-start",
                activeChat?.id === chat.id && "bg-muted",
              )}
              onClick={() => setActiveChat(chat)}
            >
              Chat {chat.id}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
} 