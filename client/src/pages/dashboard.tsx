import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/metric-card";
import { TradeTable } from "@/components/trade-table";
import { TradeDetailDialog } from "@/components/trade-detail-dialog";
import type { Trade, TradeStatistics } from "@shared/schema";

export default function Dashboard() {
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

  const { data: trades = [], isLoading: tradesLoading } = useQuery<Trade[]>({
    queryKey: ["/api/trades"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<TradeStatistics>({
    queryKey: ["/api/trades/stats"],
  });

  const recentTrades = trades.slice(0, 10);
  const isLoading = tradesLoading || statsLoading;

  return (
    <div className="flex flex-col gap-8 p-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Track your trading performance at a glance
          </p>
        </div>
        <Link href="/trades/new">
          <Button data-testid="button-log-trade">
            <Plus className="mr-2 h-4 w-4" />
            Log Trade
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Trades"
          value={isLoading ? "—" : stats?.totalTrades ?? 0}
          subtitle={isLoading ? undefined : `${stats?.winningTrades ?? 0} wins, ${stats?.losingTrades ?? 0} losses`}
          testId="card-total-trades"
        />
        <MetricCard
          title="Win Rate"
          value={isLoading ? 0 : stats?.winRate ?? 0}
          isPercentage
          trend={stats && stats.winRate >= 50 ? "up" : "down"}
          testId="card-win-rate"
        />
        <MetricCard
          title="Total P&L"
          value={isLoading ? 0 : stats?.totalPnL ?? 0}
          isPnL
          testId="card-total-pnl"
        />
        <MetricCard
          title="Profit Factor"
          value={isLoading ? "—" : (stats?.profitFactor ?? 0).toFixed(2)}
          subtitle={isLoading ? undefined : "Risk-adjusted returns"}
          trend={stats && stats.profitFactor >= 1.5 ? "up" : stats && stats.profitFactor < 1 ? "down" : "neutral"}
          testId="card-profit-factor"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <MetricCard
          title="Average Win"
          value={isLoading ? 0 : stats?.averageWin ?? 0}
          isPnL
          subtitle={isLoading ? undefined : `Best: $${(stats?.largestWin ?? 0).toFixed(2)}`}
          testId="card-avg-win"
        />
        <MetricCard
          title="Average Loss"
          value={isLoading ? 0 : -(stats?.averageLoss ?? 0)}
          isPnL
          subtitle={isLoading ? undefined : `Worst: -$${Math.abs(stats?.largestLoss ?? 0).toFixed(2)}`}
          testId="card-avg-loss"
        />
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">Recent Trades</h2>
          {trades.length > 0 && (
            <Link href="/trades">
              <Button variant="ghost" size="sm" data-testid="button-view-all-trades">
                View all
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
        <TradeTable
          trades={recentTrades}
          onViewTrade={setSelectedTrade}
          isLoading={tradesLoading}
        />
      </div>

      <TradeDetailDialog
        trade={selectedTrade}
        open={!!selectedTrade}
        onOpenChange={(open) => !open && setSelectedTrade(null)}
      />
    </div>
  );
}
