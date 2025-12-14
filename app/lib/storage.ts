import { type Trade, type InsertTrade, type UpdateTrade, type TradeStatistics, type User, type InsertUser, trades, users } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

if (!db) {
  console.warn("Database is not initialized. DATABASE_URL is required.");
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllTrades(): Promise<Trade[]>;
  getTradesByUser(userId: string, includeHidden?: boolean): Promise<Trade[]>;
  getTrade(id: number): Promise<Trade | undefined>;
  createTrade(trade: InsertTrade): Promise<Trade>;
  updateTrade(id: number, updates: UpdateTrade): Promise<Trade | undefined>;
  deleteTrade(id: number): Promise<boolean>;
  toggleTradeHidden(id: number, hidden: boolean): Promise<Trade | undefined>;
  getOpenTradeBySymbolAndDirection(symbol: string, direction: "long" | "short"): Promise<Trade | undefined>;
  getTradeStatistics(): Promise<TradeStatistics>;
  getTradeStatisticsByUser(userId: string): Promise<TradeStatistics>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    if (!db) {
      throw new Error("Database is not initialized. DATABASE_URL is required.");
    }
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!db) {
      throw new Error("Database is not initialized. DATABASE_URL is required.");
    }
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(userData: InsertUser): Promise<User> {
    if (!db) {
      throw new Error("Database is not initialized. DATABASE_URL is required.");
    }
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async getAllTrades(): Promise<Trade[]> {
    if (!db) {
      throw new Error("Database is not initialized. DATABASE_URL is required.");
    }
    return await db.select().from(trades).orderBy(desc(trades.entryTime));
  }

  async getTradesByUser(userId: string, includeHidden: boolean = false): Promise<Trade[]> {
    if (!db) {
      throw new Error("Database is not initialized. DATABASE_URL is required.");
    }
    const conditions = [eq(trades.userId, userId)];
    if (!includeHidden) {
      conditions.push(eq(trades.hidden, false));
    }
    return await db.select().from(trades).where(and(...conditions)).orderBy(desc(trades.entryTime));
  }

  async getTrade(id: number): Promise<Trade | undefined> {
    if (!db) {
      throw new Error("Database is not initialized. DATABASE_URL is required.");
    }
    const [trade] = await db.select().from(trades).where(eq(trades.id, id));
    return trade || undefined;
  }

  async createTrade(insertTrade: InsertTrade): Promise<Trade> {
    if (!db) {
      throw new Error("Database is not initialized. DATABASE_URL is required.");
    }
    const [trade] = await db.insert(trades).values(insertTrade).returning();
    return trade;
  }

  async updateTrade(id: number, updates: UpdateTrade): Promise<Trade | undefined> {
    if (!db) {
      throw new Error("Database is not initialized. DATABASE_URL is required.");
    }
    const [trade] = await db.update(trades).set(updates).where(eq(trades.id, id)).returning();
    return trade || undefined;
  }

  async deleteTrade(id: number): Promise<boolean> {
    if (!db) {
      throw new Error("Database is not initialized. DATABASE_URL is required.");
    }
    const result = await db.delete(trades).where(eq(trades.id, id)).returning();
    return result.length > 0;
  }

  async toggleTradeHidden(id: number, hidden: boolean): Promise<Trade | undefined> {
    if (!db) {
      throw new Error("Database is not initialized. DATABASE_URL is required.");
    }
    const [trade] = await db.update(trades).set({ hidden }).where(eq(trades.id, id)).returning();
    return trade || undefined;
  }

  async getOpenTradeBySymbolAndDirection(symbol: string, direction: "long" | "short"): Promise<Trade | undefined> {
    if (!db) {
      throw new Error("Database is not initialized. DATABASE_URL is required.");
    }
    const [trade] = await db
      .select()
      .from(trades)
      .where(
        and(
          eq(trades.symbol, symbol),
          eq(trades.direction, direction),
          eq(trades.status, "open")
        )
      );
    return trade || undefined;
  }

  async getTradeStatistics(): Promise<TradeStatistics> {
    if (!db) {
      throw new Error("Database is not initialized. DATABASE_URL is required.");
    }
    const allTrades = await db
      .select()
      .from(trades)
      .where(eq(trades.status, "closed"));

    return this.calculateStats(allTrades);
  }

  async getTradeStatisticsByUser(userId: string): Promise<TradeStatistics> {
    if (!db) {
      throw new Error("Database is not initialized. DATABASE_URL is required.");
    }
    const allTrades = await db
      .select()
      .from(trades)
      .where(and(eq(trades.userId, userId), eq(trades.status, "closed"), eq(trades.hidden, false)));

    return this.calculateStats(allTrades);
  }

  private calculateStats(allTrades: Trade[]): TradeStatistics {
    if (allTrades.length === 0) {
      return {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        totalPnL: 0,
        profitFactor: 0,
        averageWin: 0,
        averageLoss: 0,
        largestWin: 0,
        largestLoss: 0,
      };
    }

    const pnlList = allTrades.map(trade => trade.pnl ?? 0);

    const wins = pnlList.filter(p => p > 0);
    const losses = pnlList.filter(p => p < 0);

    const totalWins = wins.reduce((a, b) => a + b, 0);
    const totalLosses = Math.abs(losses.reduce((a, b) => a + b, 0));

    return {
      totalTrades: allTrades.length,
      winningTrades: wins.length,
      losingTrades: losses.length,
      winRate: allTrades.length > 0 ? (wins.length / allTrades.length) * 100 : 0,
      totalPnL: pnlList.reduce((a, b) => a + b, 0),
      profitFactor: totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0,
      averageWin: wins.length > 0 ? totalWins / wins.length : 0,
      averageLoss: losses.length > 0 ? totalLosses / losses.length : 0,
      largestWin: wins.length > 0 ? Math.max(...wins) : 0,
      largestLoss: losses.length > 0 ? Math.min(...losses) : 0,
    };
  }
}

export const storage = new DatabaseStorage();

