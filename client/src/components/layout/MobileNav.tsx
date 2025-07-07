import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/stores/useAppStore";
import { MessageCircle, Mic, Volume2, Image, Settings } from "lucide-react";

const navItems = [
  { id: "chat", label: "Chat", icon: MessageCircle },
  { id: "stt", label: "STT", icon: Mic },
  { id: "tts", label: "TTS", icon: Volume2 },
  { id: "image", label: "Image", icon: Image },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function MobileNav() {
  const { activeTab, setActiveTab } = useAppStore();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              className={`flex flex-col items-center px-3 py-2 h-auto ${
                isActive 
                  ? "text-primary" 
                  : "text-gray-500 dark:text-gray-400"
              }`}
              onClick={() => setActiveTab(item.id as any)}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
