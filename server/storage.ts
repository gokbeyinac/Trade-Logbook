import { type Trade, type InsertTrade, type TradeStatistics, type User, type InsertUser } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllTrades(): Promise<Trade[]>;
  getTrade(id: string): Promise<Trade | undefined>;
  createTrade(trade: InsertTrade): Promise<Trade>;
  updateTrade(id: string, updates: Partial<Trade>): Promise<Trade | undefined>;
  deleteTrade(id: string): Promise<boolean>;
  getOpenTradeBySymbolAndDirection(symbol: string, direction: "long" | "short"): Promise<Trade | undefined>;
  getTradeStatistics(): Promise<TradeStatistics>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private trades: Map<string, Trade>;

  constructor() {
    this.users = new Map();
    this.trades = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllTrades(): Promise<Trade[]> {
    const trades = Array.from(this.trades.values());
    return trades.sort((a, b) => 
      new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime()
    );
  }

  async getTrade(id: string): Promise<Trade | undefined> {
    return this.trades.get(id);
  }

  async createTrade(insertTrade: InsertTrade): Promise<Trade> {
    const id = randomUUID();
    const trade: Trade = { ...insertTrade, id };
    this.trades.set(id, trade);
    return trade;
  }

  async updateTrade(id: string, updates: Partial<Trade>): Promise<Trade | undefined> {
    const trade = this.trades.get(id);
    if (!trade) return undefined;
    
    const updatedTrade = { ...trade, ...updates };
    this.trades.set(id, updatedTrade);
    return updatedTrade;
  }

  async deleteTrade(id: string): Promise<boolean> {
    return this.trades.delete(id);
  }

  async getOpenTradeBySymbolAndDirection(symbol: string, direction: "long" | "short"): Promise<Trade | undefined> {
    return Array.from(this.trades.values()).find(
      (trade) => trade.symbol === symbol && trade.direction === direction && trade.status === "open"
    );
  }

  async getTradeStatistics(): Promise<TradeStatistics> {
    const trades = Array.from(this.trades.values()).filter(t => t.status === "closed");
    
    if (trades.length === 0) {
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

    const pnlList = trades.map(trade => {
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
      totalTrades: trades.length,
      winningTrades: wins.length,
      losingTrades: losses.length,
      winRate: trades.length > 0 ? (wins.length / trades.length) * 100 : 0,
      totalPnL: pnlList.reduce((a, b) => a + b, 0),
      profitFactor: totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0,
      averageWin: wins.length > 0 ? totalWins / wins.length : 0,
      averageLoss: losses.length > 0 ? totalLosses / losses.length : 0,
      largestWin: wins.length > 0 ? Math.max(...wins) : 0,
      largestLoss: losses.length > 0 ? Math.min(...losses) : 0,
    };
  }
}

export const storage = new MemStorage();
