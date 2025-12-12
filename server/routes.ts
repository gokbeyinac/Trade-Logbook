import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTradeSchema, tradingViewWebhookSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Get all trades
  app.get("/api/trades", async (req, res) => {
    try {
      const trades = await storage.getAllTrades();
      res.json(trades);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trades" });
    }
  });

  // Get trade statistics
  app.get("/api/trades/stats", async (req, res) => {
    try {
      const stats = await storage.getTradeStatistics();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to calculate statistics" });
    }
  });

  // Get single trade
  app.get("/api/trades/:id", async (req, res) => {
    try {
      const trade = await storage.getTrade(req.params.id);
      if (!trade) {
        return res.status(404).json({ error: "Trade not found" });
      }
      res.json(trade);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trade" });
    }
  });

  // Create new trade
  app.post("/api/trades", async (req, res) => {
    try {
      const validatedData = insertTradeSchema.parse(req.body);
      const trade = await storage.createTrade(validatedData);
      res.status(201).json(trade);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create trade" });
    }
  });

  // Update trade
  app.patch("/api/trades/:id", async (req, res) => {
    try {
      const trade = await storage.updateTrade(req.params.id, req.body);
      if (!trade) {
        return res.status(404).json({ error: "Trade not found" });
      }
      res.json(trade);
    } catch (error) {
      res.status(500).json({ error: "Failed to update trade" });
    }
  });

  // Delete trade
  app.delete("/api/trades/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteTrade(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Trade not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete trade" });
    }
  });

  // TradingView webhook endpoint
  app.post("/api/webhook/tradingview", async (req, res) => {
    try {
      const data = tradingViewWebhookSchema.parse(req.body);
      const timestamp = data.time || new Date().toISOString();

      if (data.action === "entry") {
        // Create new open trade
        const trade = await storage.createTrade({
          symbol: data.symbol.toUpperCase(),
          direction: data.direction,
          status: "open",
          entryPrice: data.price,
          exitPrice: null,
          quantity: data.quantity || 1,
          entryTime: timestamp,
          exitTime: null,
          fees: 0,
          notes: "",
          strategy: data.strategy || "",
          source: "tradingview",
        });
        res.status(201).json({ success: true, trade });
      } else if (data.action === "exit") {
        // Find open trade and close it
        const openTrade = await storage.getOpenTradeBySymbolAndDirection(
          data.symbol.toUpperCase(),
          data.direction
        );

        if (!openTrade) {
          return res.status(404).json({ 
            error: "No open trade found for this symbol and direction" 
          });
        }

        const updatedTrade = await storage.updateTrade(openTrade.id, {
          status: "closed",
          exitPrice: data.price,
          exitTime: timestamp,
        });

        res.json({ success: true, trade: updatedTrade });
      } else {
        res.status(400).json({ error: "Invalid action" });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid webhook data", details: error.errors });
      }
      console.error("Webhook error:", error);
      res.status(500).json({ error: "Failed to process webhook" });
    }
  });

  return httpServer;
}
