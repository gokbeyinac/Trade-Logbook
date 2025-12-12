import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TradeTable } from "@/components/trade-table";
import { TradeDetailDialog } from "@/components/trade-detail-dialog";
import { TradeFiltersBar, type TradeFilters } from "@/components/trade-filters";
import type { Trade } from "@shared/schema";

export default function TradesPage() {
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [filters, setFilters] = useState<TradeFilters>({
    symbol: "",
    direction: "all",
    dateFrom: undefined,
    dateTo: undefined,
  });

  const { data: trades = [], isLoading } = useQuery<Trade[]>({
    queryKey: ["/api/trades"],
  });

  const filteredTrades = useMemo(() => {
    return trades.filter((trade) => {
      if (filters.symbol && !trade.symbol.includes(filters.symbol)) {
        return false;
      }
      if (filters.direction !== "all" && trade.direction !== filters.direction) {
        return false;
      }
      if (filters.dateFrom) {
        const tradeDate = new Date(trade.entryTime);
        if (tradeDate < filters.dateFrom) {
          return false;
        }
      }
      if (filters.dateTo) {
        const tradeDate = new Date(trade.entryTime);
        const endOfDay = new Date(filters.dateTo);
        endOfDay.setHours(23, 59, 59, 999);
        if (tradeDate > endOfDay) {
          return false;
        }
      }
      return true;
    });
  }, [trades, filters]);

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">All Trades</h1>
          <p className="mt-1 text-muted-foreground">
            {filteredTrades.length} of {trades.length} trades
          </p>
        </div>
        <Link href="/trades/new">
          <Button data-testid="button-log-trade">
            <Plus className="mr-2 h-4 w-4" />
            Log Trade
          </Button>
        </Link>
      </div>

      <TradeFiltersBar filters={filters} onFiltersChange={setFilters} />

      <TradeTable
        trades={filteredTrades}
        onViewTrade={setSelectedTrade}
        isLoading={isLoading}
      />

      <TradeDetailDialog
        trade={selectedTrade}
        open={!!selectedTrade}
        onOpenChange={(open) => !open && setSelectedTrade(null)}
      />
    </div>
  );
}
