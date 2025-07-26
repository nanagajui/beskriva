import {
  users,
  type User,
  type InsertUser,
  chats,
  messages,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export type Chat = typeof chats.$inferSelect;
export type Message = typeof messages.$inferSelect;

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getChats(userId: number): Promise<Chat[]>;
  createChat(userId: number): Promise<Chat>;
  getMessages(chatId: number): Promise<Message[]>;
  createMessage(
    chatId: number,
    role: "user" | "assistant",
    content: string,
  ): Promise<Message>;
}

export class DrizzleStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = await db.query.users.findFirst({
      where: eq(users.username, username),
    });
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getChats(userId: number): Promise<Chat[]> {
    return db.query.chats.findMany({
      where: eq(chats.userId, userId),
      orderBy: [desc(chats.createdAt)],
    });
  }

  async createChat(userId: number): Promise<Chat> {
    const [chat] = await db.insert(chats).values({ userId }).returning();
    return chat;
  }

  async getMessages(chatId: number): Promise<Message[]> {
    return db.query.messages.findMany({
      where: eq(messages.chatId, chatId),
      orderBy: [desc(messages.createdAt)],
    });
  }

  async createMessage(
    chatId: number,
    role: "user" | "assistant",
    content: string,
  ): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values({ chatId, role, content })
      .returning();
    return message;
  }
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private chats: Map<number, Chat>;
  private messages: Map<number, Message[]>;
  private currentUserId: number;
  private currentChatId: number;
  private currentMessageId: number;

  constructor() {
    this.users = new Map();
    this.chats = new Map();
    this.messages = new Map();
    this.currentUserId = 1;
    this.currentChatId = 1;
    this.currentMessageId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getChats(userId: number): Promise<Chat[]> {
    return Array.from(this.chats.values()).filter(
      (chat) => chat.userId === userId,
    );
  }

  async createChat(userId: number): Promise<Chat> {
    const id = this.currentChatId++;
    const chat: Chat = {
      id,
      userId,
      createdAt: new Date(),
    };
    this.chats.set(id, chat);
    return chat;
  }

  async getMessages(chatId: number): Promise<Message[]> {
    const chatMessages = this.messages.get(chatId) || [];
    return [...chatMessages].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  async createMessage(
    chatId: number,
    role: "user" | "assistant",
    content: string,
  ): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = {
      id,
      chatId,
      role,
      content,
      createdAt: new Date(),
    };
    if (!this.messages.has(chatId)) {
      this.messages.set(chatId, []);
    }
    this.messages.get(chatId)?.push(message);
    return message;
  }
}

export const storage = new MemStorage();
