import { z } from "zod";

export const tradeDirectionEnum = z.enum(["long", "short"]);
export type TradeDirection = z.infer<typeof tradeDirectionEnum>;

export const tradeStatusEnum = z.enum(["open", "closed"]);
export type TradeStatus = z.infer<typeof tradeStatusEnum>;

export const tradeSchema = z.object({
  id: z.string(),
  symbol: z.string().min(1, "Symbol is required"),
  direction: tradeDirectionEnum,
  status: tradeStatusEnum,
  entryPrice: z.number().positive("Entry price must be positive"),
  exitPrice: z.number().positive("Exit price must be positive").nullable(),
  quantity: z.number().positive("Quantity must be positive"),
  entryTime: z.string(),
  exitTime: z.string().nullable(),
  fees: z.number().min(0).default(0),
  notes: z.string().default(""),
  strategy: z.string().default(""),
  source: z.enum(["manual", "tradingview"]).default("manual"),
});

export type Trade = z.infer<typeof tradeSchema>;

export const insertTradeSchema = tradeSchema.omit({ id: true }).extend({
  symbol: z.string().min(1, "Symbol is required").toUpperCase(),
});

export type InsertTrade = z.infer<typeof insertTradeSchema>;

export const tradingViewWebhookSchema = z.object({
  symbol: z.string(),
  direction: tradeDirectionEnum,
  action: z.enum(["entry", "exit"]),
  price: z.number().positive(),
  quantity: z.number().positive().optional(),
  strategy: z.string().optional(),
  time: z.string().optional(),
});

export type TradingViewWebhook = z.infer<typeof tradingViewWebhookSchema>;

export interface TradeStatistics {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalPnL: number;
  profitFactor: number;
  averageWin: number;
  averageLoss: number;
  largestWin: number;
  largestLoss: number;
}

export const users = {
  id: "",
  username: "",
  password: "",
};

export const insertUserSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = { id: string; username: string; password: string };
