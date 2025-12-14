import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  isPnL?: boolean;
  isPercentage?: boolean;
  testId?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  trend,
  isPnL = false,
  isPercentage = false,
  testId,
}: MetricCardProps) {
  const numericValue = typeof value === "string" ? parseFloat(value) : value;
  const isPositive = numericValue > 0;
  const isNegative = numericValue < 0;

  const formatValue = () => {
    if (isPnL) {
      const formatted = Math.abs(numericValue).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return isNegative ? `-$${formatted}` : `$${formatted}`;
    }
    if (isPercentage) {
      return `${numericValue.toFixed(1)}%`;
    }
    return value;
  };

  const getTrendIcon = () => {
    if (trend === "up" || (isPnL && isPositive)) {
      return <TrendingUp className="h-4 w-4 text-profit" />;
    }
    if (trend === "down" || (isPnL && isNegative)) {
      return <TrendingDown className="h-4 w-4 text-loss" />;
    }
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <Card data-testid={testId}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            {title}
          </p>
          {(trend || isPnL) && getTrendIcon()}
        </div>
        <p
          className={cn(
            "mt-2 text-3xl font-bold font-mono",
            isPnL && isPositive && "text-profit",
            isPnL && isNegative && "text-loss"
          )}
          data-testid={testId ? `${testId}-value` : undefined}
        >
          {formatValue()}
        </p>
        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}
