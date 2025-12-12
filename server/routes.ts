import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTradeSchema, updateTradeSchema } from "@shared/schema";
import { z } from "zod";
import { verifyFirebaseToken } from "./firebaseAuth";
import session from "express-session";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.use(session({
    secret: process.env.SESSION_SECRET || "fallback-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === "production" }
  }));

  // Get all trades (protected)
  app.get("/api/trades", verifyFirebaseToken, async (req, res) => {
    try {
      const userId = (req as any).user.uid;
      const trades = await storage.getTradesByUser(userId);
      res.json(trades);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trades" });
    }
  });

  // Get trade statistics (protected)
  app.get("/api/trades/stats", verifyFirebaseToken, async (req, res) => {
    try {
      const userId = (req as any).user.uid;
      const stats = await storage.getTradeStatisticsByUser(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to calculate statistics" });
    }
  });

  // Get single trade (protected)
  app.get("/api/trades/:id", verifyFirebaseToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = (req as any).user.uid;
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

  // Create new trade (protected)
  app.post("/api/trades", verifyFirebaseToken, async (req, res) => {
    try {
      const userId = (req as any).user.uid;
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

  // Update trade (protected)
  app.patch("/api/trades/:id", verifyFirebaseToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = (req as any).user.uid;
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

  // Delete trade (protected)
  app.delete("/api/trades/:id", verifyFirebaseToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = (req as any).user.uid;
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
