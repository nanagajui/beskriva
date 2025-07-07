import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  // API Configuration
  apiKey: string;
  baseUrl: string;
  timeout: number;
  
  // App Preferences
  language: string;
  autoSave: boolean;
  notifications: boolean;
  offlineMode: boolean;
  
  // UI Preferences
  defaultVoice: string;
  defaultImageSize: string;
  defaultResponseFormat: string;
  
  // Actions
  setApiKey: (key: string) => void;
  setBaseUrl: (url: string) => void;
  setTimeout: (timeout: number) => void;
  setLanguage: (language: string) => void;
  setAutoSave: (autoSave: boolean) => void;
  setNotifications: (notifications: boolean) => void;
  setOfflineMode: (offlineMode: boolean) => void;
  setDefaultVoice: (voice: string) => void;
  setDefaultImageSize: (size: string) => void;
  setDefaultResponseFormat: (format: string) => void;
  resetSettings: () => void;
  exportSettings: () => string;
  importSettings: (data: string) => boolean;
}

const defaultSettings = {
  apiKey: "",
  baseUrl: "https://api.lemonfox.ai/v1",
  timeout: 60,
  language: "en",
  autoSave: true,
  notifications: true,
  offlineMode: false,
  defaultVoice: "en-US-1",
  defaultImageSize: "1024x1024",
  defaultResponseFormat: "json",
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...defaultSettings,

      setApiKey: (key) => set({ apiKey: key }),
      setBaseUrl: (url) => set({ baseUrl: url }),
      setTimeout: (timeout) => set({ timeout }),
      setLanguage: (language) => set({ language }),
      setAutoSave: (autoSave) => set({ autoSave }),
      setNotifications: (notifications) => set({ notifications }),
      setOfflineMode: (offlineMode) => set({ offlineMode }),
      setDefaultVoice: (voice) => set({ defaultVoice: voice }),
      setDefaultImageSize: (size) => set({ defaultImageSize: size }),
      setDefaultResponseFormat: (format) => set({ defaultResponseFormat: format }),

      resetSettings: () => set(defaultSettings),

      exportSettings: () => {
        const state = get();
        const exportData = {
          ...state,
          apiKey: state.apiKey ? "***HIDDEN***" : "",
          exportDate: new Date().toISOString(),
        };
        return JSON.stringify(exportData, null, 2);
      },

      importSettings: (data) => {
        try {
          const parsed = JSON.parse(data);
          const validSettings = { ...defaultSettings };
          
          // Only import valid settings, excluding apiKey for security
          Object.keys(defaultSettings).forEach((key) => {
            if (key !== "apiKey" && parsed[key] !== undefined) {
              (validSettings as any)[key] = parsed[key];
            }
          });
          
          set(validSettings);
          return true;
        } catch (error) {
          console.error("Failed to import settings:", error);
          return false;
        }
      },
    }),
    {
      name: "lemonfox-settings-store",
      version: 1,
    }
  )
);
