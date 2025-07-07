import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useSettingsStore } from "@/lib/stores/useSettingsStore";
import { useTheme } from "@/components/ui/theme-provider";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Check, ExternalLink, Download, Trash2, AlertTriangle } from "lucide-react";

export default function SettingsPanel() {
  const [showApiKey, setShowApiKey] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const { 
    apiKey, 
    setApiKey, 
    baseUrl, 
    setBaseUrl, 
    timeout, 
    setTimeout, 
    language, 
    setLanguage,
    autoSave,
    setAutoSave,
    notifications,
    setNotifications,
    offlineMode,
    setOfflineMode
  } = useSettingsStore();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const handleTestConnection = async () => {
    if (!apiKey) {
      toast({
        title: "No API Key",
        description: "Please enter your API key first.",
        variant: "destructive",
      });
      return;
    }

    setTestingConnection(true);
    
    try {
      // Test the connection by making a simple request
      const response = await fetch(`${baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        signal: AbortSignal.timeout(timeout * 1000),
      });

      if (response.ok) {
        toast({
          title: "Connection Successful",
          description: "Your API key is working correctly.",
        });
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Could not connect to the API.",
        variant: "destructive",
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleExportData = () => {
    const data = {
      settings: {
        apiKey: apiKey ? "***HIDDEN***" : null,
        baseUrl,
        timeout,
        language,
        autoSave,
        notifications,
        offlineMode,
      },
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lemonfox-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Data Exported",
      description: "Your settings have been exported successfully.",
    });
  };

  const handleClearCache = () => {
    if (window.confirm("Are you sure you want to clear all cached data? This action cannot be undone.")) {
      // Clear various caches
      localStorage.removeItem('lemonfox-chat-history');
      localStorage.removeItem('lemonfox-audio-cache');
      localStorage.removeItem('lemonfox-image-cache');
      
      toast({
        title: "Cache Cleared",
        description: "All cached data has been cleared.",
      });
    }
  };

  const handleResetSettings = () => {
    if (window.confirm("Are you sure you want to reset all settings to defaults? This action cannot be undone.")) {
      setApiKey("");
      setBaseUrl("https://api.lemonfox.ai/v1");
      setTimeout(60);
      setLanguage("en");
      setAutoSave(true);
      setNotifications(true);
      setOfflineMode(false);
      setTheme("system");
      
      toast({
        title: "Settings Reset",
        description: "All settings have been reset to defaults.",
      });
    }
  };

  const storageUsed = 12.5; // MB - This would be calculated from actual usage
  const storagePercent = Math.min((storageUsed / 50) * 100, 100); // Assuming 50MB limit

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="api-key" className="text-sm font-medium mb-2 block">API Key</Label>
              <div className="relative">
                <Input
                  id="api-key"
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your Lemonfox API key"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Your API key is stored locally and never sent to our servers.
              </p>
            </div>

            <div>
              <Label htmlFor="base-url" className="text-sm font-medium mb-2 block">Base URL</Label>
              <Select value={baseUrl} onValueChange={setBaseUrl}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="https://api.lemonfox.ai/v1">Global (api.lemonfox.ai)</SelectItem>
                  <SelectItem value="https://eu-api.lemonfox.ai/v1">EU (eu-api.lemonfox.ai)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Use EU endpoint for GDPR compliance.
              </p>
            </div>

            <div>
              <Label htmlFor="timeout" className="text-sm font-medium mb-2 block">Request Timeout</Label>
              <Select value={timeout.toString()} onValueChange={(value) => setTimeout(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 seconds</SelectItem>
                  <SelectItem value="60">60 seconds</SelectItem>
                  <SelectItem value="120">2 minutes</SelectItem>
                  <SelectItem value="300">5 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">API Status</span>
                <div className="flex items-center space-x-2 mt-1">
                  <div className={`w-2 h-2 rounded-full ${apiKey ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className={`text-sm ${apiKey ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {apiKey ? "Connected" : "Not Connected"}
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestConnection}
                disabled={!apiKey || testingConnection}
              >
                {testingConnection ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Test Connection
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* App Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>App Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="theme" className="text-sm font-medium mb-2 block">Theme</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">System Default</SelectItem>
                  <SelectItem value="light">Light Mode</SelectItem>
                  <SelectItem value="dark">Dark Mode</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="language" className="text-sm font-medium mb-2 block">Default Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-save" className="text-sm font-medium">Auto-save Results</Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">Automatically save generated content</p>
              </div>
              <Switch
                id="auto-save"
                checked={autoSave}
                onCheckedChange={setAutoSave}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications" className="text-sm font-medium">Show Notifications</Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">Display toast notifications</p>
              </div>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="offline-mode" className="text-sm font-medium">Offline Mode</Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">Enable offline functionality</p>
              </div>
              <Switch
                id="offline-mode"
                checked={offlineMode}
                onCheckedChange={setOfflineMode}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Storage Used</span>
                <div className="text-xs text-gray-500 dark:text-gray-400">{storageUsed} MB of local storage</div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-16 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${storagePercent}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">{Math.round(storagePercent)}%</span>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={handleExportData}
                className="w-full justify-start"
              >
                <Download className="h-4 w-4 mr-2" />
                Export All Data
              </Button>

              <Button
                variant="outline"
                onClick={handleClearCache}
                className="w-full justify-start"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Cache
              </Button>

              <Button
                variant="destructive"
                onClick={handleResetSettings}
                className="w-full justify-start"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Reset All Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* App Information */}
        <Card>
          <CardHeader>
            <CardTitle>App Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Version</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">v1.0.0</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Build</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">2024.12.27</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">PWA Status</span>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">Installed</span>
            </div>

            <Separator />

            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => window.location.reload()}
              >
                <Check className="h-4 w-4 mr-2" />
                Check for Updates
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => window.open('https://www.lemonfox.ai/apis', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Documentation
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => window.open('mailto:hello@lemonfox.ai', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
