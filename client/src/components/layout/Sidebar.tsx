import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/stores/useAppStore";
import { useSettingsStore } from "@/lib/stores/useSettingsStore";
import { useTheme } from "@/components/ui/theme-provider";
import { MessageCircle, Mic, Volume2, Image, Settings, Sun, Moon, Workflow } from "lucide-react";

const navItems = [
  { id: "chat", label: "Chat Hub", icon: MessageCircle },
  { id: "workflow", label: "Workflows", icon: Workflow },
  { id: "stt", label: "Speech-to-Text", icon: Mic },
  { id: "tts", label: "Text-to-Speech", icon: Volume2 },
  { id: "image", label: "Image Generation", icon: Image },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const { activeTab, setActiveTab } = useAppStore();
  const { apiKey } = useSettingsStore();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 z-40">
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
            <span className="text-white text-lg font-bold">L</span>
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">Lemonfox.ai</span>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start ${
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              onClick={() => setActiveTab(item.id as any)}
            >
              <Icon className="mr-3 h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">Theme</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="h-8 w-8 p-0"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        <div className="flex items-center space-x-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${apiKey ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-gray-500 dark:text-gray-400">
            {apiKey ? "API Connected" : "No API Key"}
          </span>
        </div>
      </div>
    </aside>
  );
}
