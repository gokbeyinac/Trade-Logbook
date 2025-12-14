'use client';

import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Plus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { TradeTable } from "@/components/trade-table";
import { TradeDetailDialog } from "@/components/trade-detail-dialog";
import { TradeFiltersBar, type TradeFilters } from "@/components/trade-filters";
import { useToast } from "@/hooks/use-toast";
import type { Trade } from "@shared/schema";

export default function TradesPage() {
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [showHidden, setShowHidden] = useState(false);
  const [filters, setFilters] = useState<TradeFilters>({
    symbol: "",
    direction: "all",
    dateFrom: undefined,
    dateTo: undefined,
    strategy: "",
    tag: "",
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: trades = [], isLoading } = useQuery<Trade[]>({
    queryKey: ["/api/trades", showHidden],
    queryFn: async () => {
      const res = await fetch(`/api/trades?includeHidden=${showHidden}`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to fetch trades");
      }
      return res.json();
    },
  });

  const toggleHiddenMutation = useMutation({
    mutationFn: async ({ id, hidden }: { id: number; hidden: boolean }) => {
      const res = await fetch(`/api/trades/${id}/toggle-hidden`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ hidden }),
      });
      if (!res.ok) {
        throw new Error("Failed to toggle visibility");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trades"] });
      queryClient.invalidateQueries({ queryKey: ["/api/trades/stats"] });
      toast({
        title: "Success",
        description: "Trade visibility updated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update trade visibility",
        variant: "destructive",
      });
    },
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
    return trade.pnl ?? null;
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

      <div className="flex items-center gap-4">
        <TradeFiltersBar filters={filters} onFiltersChange={setFilters} />
        <div className="flex items-center space-x-2 ml-auto">
          <Switch
            id="show-hidden"
            checked={showHidden}
            onCheckedChange={setShowHidden}
          />
          <Label htmlFor="show-hidden" className="cursor-pointer">
            Show hidden trades
          </Label>
        </div>
      </div>

      <TradeTable
        trades={filteredTrades}
        onViewTrade={setSelectedTrade}
        onToggleHidden={(trade, hidden) => {
          toggleHiddenMutation.mutate({ id: trade.id, hidden });
        }}
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
