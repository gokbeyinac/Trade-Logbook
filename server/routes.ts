import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTradeSchema, updateTradeSchema, insertUserSchema, loginSchema } from "@shared/schema";
import { z } from "zod";
import session from "express-session";
import pgSession from "connect-pg-simple";
import { pool } from "./db";

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  const PgStore = pgSession(session);

  app.use(session({
    store: new PgStore({
      pool,
      tableName: "sessions",
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || "fallback-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: false,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    }
  }));

  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }
      
      const user = await storage.createUser(validatedData);
      req.session.userId = user.id;
      
      res.status(201).json({ 
        id: user.id, 
        username: user.username 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      console.error("Register error:", error);
      res.status(500).json({ error: "Failed to register" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(validatedData.username);
      if (!user || user.pin !== validatedData.pin) {
        return res.status(401).json({ error: "Invalid username or PIN" });
      }
      
      req.session.userId = user.id;
      
      res.json({ 
        id: user.id, 
        username: user.username 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      console.error("Login error:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  });

  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/user", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    
    res.json({ 
      id: user.id, 
      username: user.username 
    });
  });

  app.get("/api/trades", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const trades = await storage.getTradesByUser(userId);
      res.json(trades);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trades" });
    }
  });

  app.get("/api/trades/stats", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const stats = await storage.getTradeStatisticsByUser(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to calculate statistics" });
    }
  });

  app.get("/api/trades/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.session.userId!;
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid trade ID" });
      }
      const trade = await storage.getTrade(id);
      if (!trade || trade.userId !== userId) {
        return res.status(404).json({ error: "Trade not found" });
      }
      res.json(trade);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trade" });
    }
  });

  app.post("/api/trades", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const validatedData = insertTradeSchema.parse({ ...req.body, userId });
      const trade = await storage.createTrade(validatedData);
      res.status(201).json(trade);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create trade" });
    }
  });

  app.patch("/api/trades/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.session.userId!;
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid trade ID" });
      }
      const existingTrade = await storage.getTrade(id);
      if (!existingTrade || existingTrade.userId !== userId) {
        return res.status(404).json({ error: "Trade not found" });
      }
      const validatedUpdates = updateTradeSchema.parse(req.body);
      const trade = await storage.updateTrade(id, validatedUpdates);
      res.json(trade);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update trade" });
    }
  });

  app.delete("/api/trades/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.session.userId!;
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid trade ID" });
      }
      const existingTrade = await storage.getTrade(id);
      if (!existingTrade || existingTrade.userId !== userId) {
        return res.status(404).json({ error: "Trade not found" });
      }
      await storage.deleteTrade(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete trade" });
    }
  });

  return httpServer;
}
