import { Search, X, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export interface TradeFilters {
  symbol: string;
  direction: "all" | "long" | "short";
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  strategy: string;
  tag: string;
}

interface TradeFiltersProps {
  filters: TradeFilters;
  onFiltersChange: (filters: TradeFilters) => void;
}

export function TradeFiltersBar({ filters, onFiltersChange }: TradeFiltersProps) {
  const hasActiveFilters =
    filters.symbol ||
    filters.direction !== "all" ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.strategy ||
    filters.tag;

  const clearFilters = () => {
    onFiltersChange({
      symbol: "",
      direction: "all",
      dateFrom: undefined,
      dateTo: undefined,
      strategy: "",
      tag: "",
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px] max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search symbol..."
          value={filters.symbol}
          onChange={(e) =>
            onFiltersChange({ ...filters, symbol: e.target.value.toUpperCase() })
          }
          className="pl-9"
          data-testid="input-filter-symbol"
        />
      </div>

      <Select
        value={filters.direction}
        onValueChange={(value) =>
          onFiltersChange({
            ...filters,
            direction: value as "all" | "long" | "short",
          })
        }
      >
        <SelectTrigger className="w-[130px]" data-testid="select-filter-direction">
          <SelectValue placeholder="Direction" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Directions</SelectItem>
          <SelectItem value="long">Long Only</SelectItem>
          <SelectItem value="short">Short Only</SelectItem>
        </SelectContent>
      </Select>

      <Input
        placeholder="Strategy..."
        value={filters.strategy}
        onChange={(e) =>
          onFiltersChange({ ...filters, strategy: e.target.value })
        }
        className="w-[130px]"
        data-testid="input-filter-strategy"
      />

      <Input
        placeholder="Tag..."
        value={filters.tag}
        onChange={(e) =>
          onFiltersChange({ ...filters, tag: e.target.value.toLowerCase() })
        }
        className="w-[100px]"
        data-testid="input-filter-tag"
      />

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[150px] justify-start text-left font-normal",
              !filters.dateFrom && "text-muted-foreground"
            )}
            data-testid="button-filter-date-from"
          >
            <Calendar className="mr-2 h-4 w-4" />
            {filters.dateFrom ? format(filters.dateFrom, "MMM dd, yyyy") : "From date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            mode="single"
            selected={filters.dateFrom}
            onSelect={(date) => onFiltersChange({ ...filters, dateFrom: date })}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[150px] justify-start text-left font-normal",
              !filters.dateTo && "text-muted-foreground"
            )}
            data-testid="button-filter-date-to"
          >
            <Calendar className="mr-2 h-4 w-4" />
            {filters.dateTo ? format(filters.dateTo, "MMM dd, yyyy") : "To date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            mode="single"
            selected={filters.dateTo}
            onSelect={(date) => onFiltersChange({ ...filters, dateTo: date })}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-muted-foreground"
          data-testid="button-clear-filters"
        >
          <X className="mr-1 h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
