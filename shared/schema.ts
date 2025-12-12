import { pgTable, text, integer, real, timestamp, serial, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

export const tradeDirectionEnum = z.enum(["long", "short"]);
export type TradeDirection = z.infer<typeof tradeDirectionEnum>;

export const tradeStatusEnum = z.enum(["open", "closed"]);
export type TradeStatus = z.infer<typeof tradeStatusEnum>;

export const trades = pgTable("trades", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  direction: text("direction").notNull().$type<"long" | "short">(),
  status: text("status").notNull().$type<"open" | "closed">(),
  entryPrice: real("entry_price").notNull(),
  exitPrice: real("exit_price"),
  quantity: real("quantity").notNull(),
  entryTime: text("entry_time").notNull(),
  exitTime: text("exit_time"),
  fees: real("fees").notNull().default(0),
  notes: text("notes").notNull().default(""),
  strategy: text("strategy").notNull().default(""),
  tags: text("tags").array().notNull().default([]),
  source: text("source").notNull().default("manual").$type<"manual" | "tradingview">(),
});

export type Trade = typeof trades.$inferSelect;

export const insertTradeSchema = createInsertSchema(trades).omit({ id: true }).extend({
  symbol: z.string().min(1, "Symbol is required").toUpperCase(),
  direction: tradeDirectionEnum,
  status: tradeStatusEnum,
  entryPrice: z.number().positive("Entry price must be positive"),
  exitPrice: z.number().positive("Exit price must be positive").nullable(),
  quantity: z.number().positive("Quantity must be positive"),
  tags: z.array(z.string()).default([]),
  source: z.enum(["manual", "tradingview"]).default("manual"),
});

export type InsertTrade = z.infer<typeof insertTradeSchema>;

export const updateTradeSchema = insertTradeSchema.partial().strict();

export type UpdateTrade = z.infer<typeof updateTradeSchema>;

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

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
