import { format } from "date-fns";
import { Eye, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { Trade } from "@shared/schema";

interface TradeTableProps {
  trades: Trade[];
  onViewTrade?: (trade: Trade) => void;
  isLoading?: boolean;
}

export function TradeTable({ trades, onViewTrade, isLoading }: TradeTableProps) {
  const calculatePnL = (trade: Trade): number | null => {
    if (trade.exitPrice === null) return null;
    const multiplier = trade.direction === "long" ? 1 : -1;
    const grossPnL = (trade.exitPrice - trade.entryPrice) * trade.quantity * multiplier;
    return grossPnL - trade.fees;
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatPnL = (pnl: number | null) => {
    if (pnl === null) return "—";
    const formatted = Math.abs(pnl).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return pnl < 0 ? `-$${formatted}` : `$${formatted}`;
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[140px]">Date/Time</TableHead>
              <TableHead>Symbol</TableHead>
              <TableHead>Direction</TableHead>
              <TableHead className="text-right">Entry</TableHead>
              <TableHead className="text-right">Exit</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">P&L</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="h-4 w-24 animate-pulse rounded bg-muted"></div>
                </TableCell>
                <TableCell>
                  <div className="h-4 w-16 animate-pulse rounded bg-muted"></div>
                </TableCell>
                <TableCell>
                  <div className="h-6 w-14 animate-pulse rounded bg-muted"></div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="ml-auto h-4 w-16 animate-pulse rounded bg-muted"></div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="ml-auto h-4 w-16 animate-pulse rounded bg-muted"></div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="ml-auto h-4 w-8 animate-pulse rounded bg-muted"></div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="ml-auto h-4 w-16 animate-pulse rounded bg-muted"></div>
                </TableCell>
                <TableCell>
                  <div className="h-8 w-8 animate-pulse rounded bg-muted"></div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <ArrowUpRight className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No trades yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Log your first trade manually or connect TradingView
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[140px]">Date/Time</TableHead>
            <TableHead>Symbol</TableHead>
            <TableHead>Direction</TableHead>
            <TableHead className="text-right">Entry</TableHead>
            <TableHead className="text-right">Exit</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead className="text-right">P&L</TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trades.map((trade) => {
            const pnl = calculatePnL(trade);
            const isProfit = pnl !== null && pnl > 0;
            const isLoss = pnl !== null && pnl < 0;

            return (
              <TableRow
                key={trade.id}
                className="hover-elevate cursor-pointer"
                onClick={() => onViewTrade?.(trade)}
                data-testid={`row-trade-${trade.id}`}
              >
                <TableCell className="font-mono text-sm">
                  {format(new Date(trade.entryTime), "MMM dd, HH:mm")}
                </TableCell>
                <TableCell className="font-semibold">{trade.symbol}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "uppercase text-xs font-bold",
                      trade.direction === "long"
                        ? "bg-profit/10 text-profit dark:bg-profit/20"
                        : "bg-loss/10 text-loss dark:bg-loss/20"
                    )}
                  >
                    {trade.direction === "long" ? (
                      <ArrowUpRight className="mr-1 h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="mr-1 h-3 w-3" />
                    )}
                    {trade.direction}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono">
                  ${formatPrice(trade.entryPrice)}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {trade.exitPrice !== null ? `$${formatPrice(trade.exitPrice)}` : "—"}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {trade.quantity}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right font-mono font-semibold",
                    isProfit && "text-profit",
                    isLoss && "text-loss"
                  )}
                >
                  {formatPnL(pnl)}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewTrade?.(trade);
                    }}
                    data-testid={`button-view-trade-${trade.id}`}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
