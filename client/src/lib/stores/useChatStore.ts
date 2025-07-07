import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  image?: string;
  id?: string;
}

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  model: string;
  temperature: number;
  maxTokens: number;
  streaming: boolean;
  addMessage: (message: Omit<ChatMessage, "id">) => void;
  updateLastMessage: (content: string) => void;
  clearMessages: () => void;
  setIsLoading: (loading: boolean) => void;
  setModel: (model: string) => void;
  setTemperature: (temperature: number) => void;
  setMaxTokens: (tokens: number) => void;
  setStreaming: (streaming: boolean) => void;
  exportChatHistory: () => string;
  importChatHistory: (data: string) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      isLoading: false,
      model: "llama-8b-chat",
      temperature: 1.0,
      maxTokens: 2048,
      streaming: true,

      addMessage: (message) => {
        const newMessage = {
          ...message,
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };
        set((state) => ({
          messages: [...state.messages, newMessage],
        }));
      },

      updateLastMessage: (content) => {
        set((state) => {
          const messages = [...state.messages];
          if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.role === "assistant") {
              messages[messages.length - 1] = {
                ...lastMessage,
                content,
              };
            }
          }
          return { messages };
        });
      },

      clearMessages: () => set({ messages: [] }),

      setIsLoading: (loading) => set({ isLoading: loading }),

      setModel: (model) => set({ model }),

      setTemperature: (temperature) => set({ temperature }),

      setMaxTokens: (tokens) => set({ maxTokens: tokens }),

      setStreaming: (streaming) => set({ streaming }),

      exportChatHistory: () => {
        const { messages, model, temperature, maxTokens } = get();
        return JSON.stringify({
          messages,
          settings: { model, temperature, maxTokens },
          exportDate: new Date().toISOString(),
        }, null, 2);
      },

      importChatHistory: (data) => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.messages && Array.isArray(parsed.messages)) {
            set({
              messages: parsed.messages.map((msg: any) => ({
                ...msg,
                timestamp: new Date(msg.timestamp),
              })),
            });
            
            if (parsed.settings) {
              const { model, temperature, maxTokens } = parsed.settings;
              set({ model, temperature, maxTokens });
            }
          }
        } catch (error) {
          console.error("Failed to import chat history:", error);
        }
      },
    }),
    {
      name: "lemonfox-chat-store",
      partialize: (state) => ({
        messages: state.messages,
        model: state.model,
        temperature: state.temperature,
        maxTokens: state.maxTokens,
        streaming: state.streaming,
      }),
    }
  )
);
