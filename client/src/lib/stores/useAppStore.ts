import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TabType = "chat" | "stt" | "tts" | "image" | "settings";

interface AppState {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activeTab: "chat",
      setActiveTab: (tab) => set({ activeTab: tab }),
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),
      error: null,
      setError: (error) => set({ error }),
    }),
    {
      name: "lemonfox-app-store",
      partialize: (state) => ({
        activeTab: state.activeTab,
      }),
    }
  )
);
