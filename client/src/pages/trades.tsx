import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Plus, Download } from "lucide-react";
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
    strategy: "",
    tag: "",
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
      if (filters.strategy && !(trade.strategy ?? "").toLowerCase().includes(filters.strategy.toLowerCase())) {
        return false;
      }
      if (filters.tag && !(trade.tags ?? []).some(t => t.includes(filters.tag))) {
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

  const calculatePnL = (trade: Trade): number | null => {
    if (trade.exitPrice === null) return null;
    const multiplier = trade.direction === "long" ? 1 : -1;
    const grossPnL = (trade.exitPrice - trade.entryPrice) * trade.quantity * multiplier;
    return grossPnL - trade.fees;
  };

  const exportToCsv = useCallback(() => {
    const headers = [
      "ID",
      "Symbol",
      "Direction",
      "Status",
      "Entry Price",
      "Exit Price",
      "Quantity",
      "Entry Time",
      "Exit Time",
      "Fees",
      "P&L",
      "Strategy",
      "Tags",
      "Notes",
      "Source",
    ];

    const rows = filteredTrades.map((trade) => {
      const pnl = calculatePnL(trade);
      return [
        trade.id,
        trade.symbol,
        trade.direction,
        trade.status,
        trade.entryPrice,
        trade.exitPrice ?? "",
        trade.quantity,
        trade.entryTime,
        trade.exitTime ?? "",
        trade.fees,
        pnl !== null ? pnl.toFixed(2) : "",
        trade.strategy ?? "",
        (trade.tags ?? []).join("; "),
        trade.notes ?? "",
        trade.source,
      ];
    });

    const escapeCell = (value: unknown): string => {
      const str = String(value ?? "");
      const escaped = str.replace(/"/g, '""');
      if (escaped.includes(",") || escaped.includes('"') || escaped.includes("\n")) {
        return `"${escaped}"`;
      }
      return escaped;
    };

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map(escapeCell).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `trades_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredTrades]);

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">All Trades</h1>
          <p className="mt-1 text-muted-foreground">
            {filteredTrades.length} of {trades.length} trades
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={exportToCsv}
            disabled={filteredTrades.length === 0}
            data-testid="button-export-csv"
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Link href="/trades/new">
            <Button data-testid="button-log-trade">
              <Plus className="mr-2 h-4 w-4" />
              Log Trade
            </Button>
          </Link>
        </div>
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
