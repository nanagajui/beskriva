import { hc } from "hono/client";
import type { User, InsertUser } from "@shared/schema";

const client = hc("/");

export const authApi = {
  login: async (credentials: InsertUser): Promise<User> => {
    const res = await client.api.auth.login.$post({ json: credentials });
    if (!res.ok) {
      throw new Error("Login failed");
    }
    return res.json();
  },
  register: async (credentials: InsertUser): Promise<User> => {
    const res = await client.api.auth.register.$post({ json: credentials });
    if (!res.ok) {
      throw new Error("Registration failed");
    }
    return res.json();
  },
  logout: async (): Promise<void> => {
    const res = await client.api.auth.logout.$post({});
    if (!res.ok) {
      throw new Error("Logout failed");
    }
  },
}; 