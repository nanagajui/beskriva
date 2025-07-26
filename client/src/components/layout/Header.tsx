import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/lib/stores/useSettingsStore";
import { useTheme } from "@/components/ui/theme-provider";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sun, Moon, LogOut } from "lucide-react";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { authApi } from "@/lib/api/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface HeaderProps {
  title: string;
  subtitle: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const { apiKey } = useSettingsStore();
  const { theme, setTheme } = useTheme();
  const isMobile = useIsMobile();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await authApi.logout();
    logout();
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-4 py-4 lg:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center lg:hidden">
          <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center mr-3">
            <span className="text-white text-lg font-bold">B</span>
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            Beskriva
          </span>
        </div>

        <div className="hidden lg:block">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {subtitle}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden lg:flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <div
              className={`w-2 h-2 rounded-full ${
                apiKey ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span>{apiKey ? "API Connected" : "No API Key"}</span>
          </div>

          {isMobile && (
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
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt={user?.username} />
                  <AvatarFallback>
                    {user?.username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.username}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
