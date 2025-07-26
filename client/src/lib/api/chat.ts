import type { Chat, Message } from "@shared/types";

export const chatApi = {
  getChats: async (): Promise<Chat[]> => {
    const res = await fetch("/api/chats");
    if (!res.ok) {
      throw new Error("Failed to fetch chats");
    }
    return res.json();
  },
  createChat: async (): Promise<Chat> => {
    const res = await fetch("/api/chats", { method: "POST" });
    if (!res.ok) {
      throw new Error("Failed to create chat");
    }
    return res.json();
  },
  getMessages: async (chatId: number): Promise<Message[]> => {
    const res = await fetch(`/api/chats/${chatId}/messages`);
    if (!res.ok) {
      throw new Error("Failed to fetch messages");
    }
    return res.json();
  },
  createMessage: async (
    chatId: number,
    role: "user" | "assistant",
    content: string,
  ): Promise<Message> => {
    const res = await fetch(`/api/chats/${chatId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role, content }),
    });
    if (!res.ok) {
      throw new Error("Failed to create message");
    }
    return res.json();
  },
}; 