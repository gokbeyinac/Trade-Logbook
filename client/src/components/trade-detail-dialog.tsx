import { format } from "date-fns";
import { ArrowUpRight, ArrowDownRight, X, Clock, DollarSign, Hash, FileText, Zap, Tag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Trade } from "@shared/schema";

interface TradeDetailDialogProps {
  trade: Trade | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TradeDetailDialog({
  trade,
  open,
  onOpenChange,
}: TradeDetailDialogProps) {
  if (!trade) return null;

  const calculatePnL = (): number | null => {
    if (trade.exitPrice === null) return null;
    const multiplier = trade.direction === "long" ? 1 : -1;
    const grossPnL = (trade.exitPrice - trade.entryPrice) * trade.quantity * multiplier;
    return grossPnL - trade.fees;
  };

  const calculatePnLPercentage = (): number | null => {
    if (trade.exitPrice === null) return null;
    const multiplier = trade.direction === "long" ? 1 : -1;
    return ((trade.exitPrice - trade.entryPrice) / trade.entryPrice) * 100 * multiplier;
  };

  const calculateDuration = (): string => {
    if (!trade.exitTime) return "Open";
    const entry = new Date(trade.entryTime);
    const exit = new Date(trade.exitTime);
    const diffMs = exit.getTime() - entry.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ${diffHours % 24}h`;
    if (diffHours > 0) return `${diffHours}h ${diffMins % 60}m`;
    return `${diffMins}m`;
  };

  const pnl = calculatePnL();
  const pnlPercentage = calculatePnLPercentage();
  const isProfit = pnl !== null && pnl > 0;
  const isLoss = pnl !== null && pnl < 0;

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
    return pnl < 0 ? `-$${formatted}` : `+$${formatted}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" data-testid="dialog-trade-detail">
        <DialogHeader className="flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold" data-testid="text-trade-symbol">{trade.symbol}</span>
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
            {trade.status === "open" && (
              <Badge variant="outline" className="text-xs">Open</Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            data-testid="button-close-trade-detail"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {pnl !== null && (
            <div
              className={cn(
                "rounded-lg p-4 text-center",
                isProfit && "bg-profit/10",
                isLoss && "bg-loss/10",
                !isProfit && !isLoss && "bg-muted"
              )}
            >
              <p className="text-sm font-medium text-muted-foreground">Net P&L</p>
              <p
                className={cn(
                  "mt-1 text-4xl font-bold font-mono",
                  isProfit && "text-profit",
                  isLoss && "text-loss"
                )}
                data-testid="text-trade-pnl"
              >
                {formatPnL(pnl)}
              </p>
              {pnlPercentage !== null && (
                <p
                  className={cn(
                    "mt-1 text-sm font-mono",
                    isProfit && "text-profit",
                    isLoss && "text-loss"
                  )}
                >
                  {pnlPercentage >= 0 ? "+" : ""}{pnlPercentage.toFixed(2)}%
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span>Entry Price</span>
                </div>
                <p className="mt-1 font-mono text-lg font-semibold">
                  ${formatPrice(trade.entryPrice)}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span>Exit Price</span>
                </div>
                <p className="mt-1 font-mono text-lg font-semibold">
                  {trade.exitPrice !== null ? `$${formatPrice(trade.exitPrice)}` : "—"}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Hash className="h-4 w-4" />
                  <span>Quantity</span>
                </div>
                <p className="mt-1 font-mono text-lg font-semibold">
                  {trade.quantity}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Duration</span>
                </div>
                <p className="mt-1 text-lg font-semibold">{calculateDuration()}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span>Fees</span>
                </div>
                <p className="mt-1 font-mono text-lg font-semibold">
                  ${formatPrice(trade.fees)}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Zap className="h-4 w-4" />
                  <span>Source</span>
                </div>
                <p className="mt-1 text-lg font-semibold capitalize">{trade.source}</p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Entry Time</span>
              </div>
              <p className="mt-1 font-mono">
                {format(new Date(trade.entryTime), "MMM dd, yyyy HH:mm:ss")}
              </p>
            </div>
            {trade.exitTime && (
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Exit Time</span>
                </div>
                <p className="mt-1 font-mono">
                  {format(new Date(trade.exitTime), "MMM dd, yyyy HH:mm:ss")}
                </p>
              </div>
            )}
          </div>

          {(trade.strategy || trade.notes || (trade.tags && trade.tags.length > 0)) && (
            <>
              <Separator />
              <div className="space-y-3">
                {trade.strategy && (
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Zap className="h-4 w-4" />
                      <span>Strategy</span>
                    </div>
                    <p className="mt-1">{trade.strategy}</p>
                  </div>
                )}
                {trade.tags && trade.tags.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Tag className="h-4 w-4" />
                      <span>Tags</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {trade.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" data-testid={`badge-tag-${tag}`}>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {trade.notes && (
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>Notes</span>
                    </div>
                    <p className="mt-1 text-sm">{trade.notes}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
