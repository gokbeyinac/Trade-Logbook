'use client';

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { format } from "date-fns";
import type { Trade } from "@shared/schema";

export default function Analytics() {
  const { data: trades = [], isLoading } = useQuery<Trade[]>({
    queryKey: ["/api/trades"],
    queryFn: async () => {
      const res = await fetch("/api/trades", {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to fetch trades");
      }
      return res.json();
    },
  });

  const closedTrades = trades.filter((t) => t.status === "closed");

  const calculatePnL = (trade: Trade): number => {
    return trade.pnl ?? 0;
  };

  const equityCurveData = closedTrades
    .sort((a, b) => new Date(a.exitTime || a.entryTime).getTime() - new Date(b.exitTime || b.entryTime).getTime())
    .reduce<{ date: string; equity: number; trade: string }[]>((acc, trade) => {
      const pnl = calculatePnL(trade);
      const lastEquity = acc.length > 0 ? acc[acc.length - 1].equity : 0;
      return [
        ...acc,
        {
          date: format(new Date(trade.exitTime || trade.entryTime), "MMM dd"),
          equity: lastEquity + pnl,
          trade: trade.symbol,
        },
      ];
    }, []);

  const winningCount = closedTrades.filter((t) => calculatePnL(t) > 0).length;
  const losingCount = closedTrades.filter((t) => calculatePnL(t) < 0).length;
  const breakevenCount = closedTrades.filter((t) => calculatePnL(t) === 0).length;

  const winLossData = [
    { name: "Winning", value: winningCount, color: "hsl(var(--profit))" },
    { name: "Losing", value: losingCount, color: "hsl(var(--loss))" },
    { name: "Breakeven", value: breakevenCount, color: "hsl(var(--muted-foreground))" },
  ].filter((d) => d.value > 0);

  const hasWinLossData = winLossData.length > 0;

  const symbolPerformance = closedTrades.reduce<Record<string, { symbol: string; pnl: number; trades: number }>>((acc, trade) => {
    const symbol = trade.symbol;
    const pnl = calculatePnL(trade);
    if (!acc[symbol]) {
      acc[symbol] = { symbol, pnl: 0, trades: 0 };
    }
    acc[symbol].pnl += pnl;
    acc[symbol].trades += 1;
    return acc;
  }, {});

  const symbolData = Object.values(symbolPerformance).sort((a, b) => b.pnl - a.pnl);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 p-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="mt-1 text-muted-foreground">
            Analyze your trading performance with charts
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className={i === 0 ? "lg:col-span-2" : ""}>
              <CardHeader>
                <div className="h-6 w-32 animate-pulse rounded bg-muted"></div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] animate-pulse rounded bg-muted"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (closedTrades.length === 0) {
    return (
      <div className="flex flex-col gap-8 p-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Analytics</h1>
          <p className="mt-1 text-muted-foreground">
            Analyze your trading performance with charts
          </p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-lg text-muted-foreground">
              No closed trades yet. Complete some trades to see analytics.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Analytics</h1>
        <p className="mt-1 text-muted-foreground">
          Analyze your trading performance with charts
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="lg:col-span-2" data-testid="card-equity-curve">
          <CardHeader>
            <CardTitle>Equity Curve</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={equityCurveData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    className="text-xs fill-muted-foreground"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    className="text-xs fill-muted-foreground"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    tickFormatter={(value) => `$${value.toFixed(0)}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, "Equity"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="equity"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-win-loss-distribution">
          <CardHeader>
            <CardTitle>Win/Loss Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {hasWinLossData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={winLossData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                      labelLine={{ stroke: "hsl(var(--muted-foreground))" }}
                    >
                      {winLossData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "0.5rem",
                      }}
                      formatter={(value: number, name: string) => [value, name]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No win/loss data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-performance-by-symbol">
          <CardHeader>
            <CardTitle>Performance by Symbol</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={symbolData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    type="number"
                    className="text-xs fill-muted-foreground"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    tickFormatter={(value) => `$${value.toFixed(0)}`}
                  />
                  <YAxis
                    type="category"
                    dataKey="symbol"
                    className="text-xs fill-muted-foreground"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    width={60}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                    formatter={(value: number, name: string) => [
                      `$${value.toFixed(2)}`,
                      name === "pnl" ? "P&L" : name,
                    ]}
                  />
                  <Bar
                    dataKey="pnl"
                    fill="hsl(var(--primary))"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
