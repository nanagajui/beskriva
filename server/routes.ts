import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { hashPassword, comparePassword, requireAuth } from "./auth";
import { insertUserSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/auth/register", async (req, res, next) => {
    try {
      const parsed = insertUserSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message: "Invalid input",
          errors: parsed.error.flatten().fieldErrors,
        });
      }

      const { username, password } = parsed.data;

      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }

      const hashedPassword = await hashPassword(password);

      const newUser = await storage.createUser({
        username,
        password: hashedPassword,
      });

      const { password: _, ...userWithoutPassword } = newUser;

      res.status(201).json(userWithoutPassword);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/auth/login", async (req, res, next) => {
    try {
      const parsed = insertUserSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message: "Invalid input",
          errors: parsed.error.flatten().fieldErrors,
        });
      }

      const { username, password } = parsed.data;

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const { password: _, ...userWithoutPassword } = user;

      // @ts-ignore - The `user` property is added to the session in `types/express.d.ts`,
      // but the linter is not picking it up.
      req.session.user = userWithoutPassword;

      res.status(200).json(userWithoutPassword);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/auth/logout", (req, res, next) => {
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/chats", requireAuth, async (req, res, next) => {
    try {
      // @ts-ignore
      const chats = await storage.getChats(req.session.user.id);
      res.status(200).json(chats);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/chats", requireAuth, async (req, res, next) => {
    try {
      // @ts-ignore
      const newChat = await storage.createChat(req.session.user.id);
      res.status(201).json(newChat);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/chats/:id/messages", requireAuth, async (req, res, next) => {
    try {
      const messages = await storage.getMessages(parseInt(req.params.id, 10));
      res.status(200).json(messages);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/chats/:id/messages", requireAuth, async (req, res, next) => {
    try {
      const { role, content } = req.body;
      const newMessage = await storage.createMessage(
        parseInt(req.params.id, 10),
        role,
        content,
      );
      res.status(201).json(newMessage);
    } catch (err) {
      next(err);
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
