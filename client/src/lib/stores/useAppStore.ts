import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { TabType } from "@shared/types";

export type { TabType };

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
