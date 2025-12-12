import { type Trade, type InsertTrade, type UpdateTrade, type TradeStatistics, type User, type UpsertUser, trades, users } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  getAllTrades(): Promise<Trade[]>;
  getTradesByUser(userId: string): Promise<Trade[]>;
  getTrade(id: number): Promise<Trade | undefined>;
  createTrade(trade: InsertTrade): Promise<Trade>;
  updateTrade(id: number, updates: UpdateTrade): Promise<Trade | undefined>;
  deleteTrade(id: number): Promise<boolean>;
  getOpenTradeBySymbolAndDirection(symbol: string, direction: "long" | "short"): Promise<Trade | undefined>;
  getTradeStatistics(): Promise<TradeStatistics>;
  getTradeStatisticsByUser(userId: string): Promise<TradeStatistics>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getAllTrades(): Promise<Trade[]> {
    return await db.select().from(trades).orderBy(desc(trades.entryTime));
  }

  async getTradesByUser(userId: string): Promise<Trade[]> {
    return await db.select().from(trades).where(eq(trades.userId, userId)).orderBy(desc(trades.entryTime));
  }

  async getTrade(id: number): Promise<Trade | undefined> {
    const [trade] = await db.select().from(trades).where(eq(trades.id, id));
    return trade || undefined;
  }

  async createTrade(insertTrade: InsertTrade): Promise<Trade> {
    const [trade] = await db.insert(trades).values(insertTrade).returning();
    return trade;
  }

  async updateTrade(id: number, updates: UpdateTrade): Promise<Trade | undefined> {
    const [trade] = await db.update(trades).set(updates).where(eq(trades.id, id)).returning();
    return trade || undefined;
  }

  async deleteTrade(id: number): Promise<boolean> {
    const result = await db.delete(trades).where(eq(trades.id, id)).returning();
    return result.length > 0;
  }

  async getOpenTradeBySymbolAndDirection(symbol: string, direction: "long" | "short"): Promise<Trade | undefined> {
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
    const allTrades = await db
      .select()
      .from(trades)
      .where(eq(trades.status, "closed"));

    return this.calculateStats(allTrades);
  }

  async getTradeStatisticsByUser(userId: string): Promise<TradeStatistics> {
    const allTrades = await db
      .select()
      .from(trades)
      .where(and(eq(trades.userId, userId), eq(trades.status, "closed")));

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

    const pnlList = allTrades.map(trade => {
      if (trade.exitPrice === null) return 0;
      const multiplier = trade.direction === "long" ? 1 : -1;
      const grossPnL = (trade.exitPrice - trade.entryPrice) * trade.quantity * multiplier;
      return grossPnL - trade.fees;
    });

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
