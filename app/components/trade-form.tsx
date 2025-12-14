import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowUpRight, ArrowDownRight, Loader2, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const tradeFormSchema = z.object({
  symbol: z.string().min(1, "Symbol is required").toUpperCase(),
  direction: z.enum(["long", "short"]),
  entryPrice: z.string().min(1, "Entry price is required").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    "Must be a positive number"
  ),
  exitPrice: z.string().optional(),
  quantity: z.string().min(1, "Quantity is required").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    "Must be a positive number"
  ),
  fees: z.string().optional(),
  pnl: z.string().optional(),
  entryTime: z.string().min(1, "Entry time is required"),
  exitTime: z.string().optional(),
  strategy: z.string().optional(),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
  isClosed: z.boolean().default(false),
});

type TradeFormValues = z.infer<typeof tradeFormSchema>;

interface TradeFormProps {
  onSubmit: (data: TradeFormValues) => void;
  isLoading?: boolean;
}

export function TradeForm({ onSubmit, isLoading }: TradeFormProps) {
  const [tagInput, setTagInput] = useState("");
  
  const form = useForm<TradeFormValues>({
    resolver: zodResolver(tradeFormSchema),
    defaultValues: {
      symbol: "",
      direction: "long",
      entryPrice: "",
      exitPrice: "",
      quantity: "",
      fees: "",
      pnl: "",
      entryTime: new Date().toISOString().slice(0, 16),
      exitTime: "",
      strategy: "",
      tags: [],
      notes: "",
      isClosed: false,
    },
  });

  const isClosed = form.watch("isClosed");
  const direction = form.watch("direction");

  const handleSubmit = (data: TradeFormValues) => {
    onSubmit(data);
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Log New Trade</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="symbol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Symbol</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="AAPL, BTC, EUR/USD"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        data-testid="input-trade-symbol"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="direction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Direction</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex gap-4"
                      >
                        <div className="flex-1">
                          <RadioGroupItem
                            value="long"
                            id="long"
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor="long"
                            className={cn(
                              "flex cursor-pointer items-center justify-center gap-2 rounded-md border-2 p-3 font-medium transition-colors",
                              direction === "long"
                                ? "border-profit bg-profit/10 text-profit"
                                : "border-muted hover-elevate"
                            )}
                            data-testid="radio-direction-long"
                          >
                            <ArrowUpRight className="h-4 w-4" />
                            Long
                          </Label>
                        </div>
                        <div className="flex-1">
                          <RadioGroupItem
                            value="short"
                            id="short"
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor="short"
                            className={cn(
                              "flex cursor-pointer items-center justify-center gap-2 rounded-md border-2 p-3 font-medium transition-colors",
                              direction === "short"
                                ? "border-loss bg-loss/10 text-loss"
                                : "border-muted hover-elevate"
                            )}
                            data-testid="radio-direction-short"
                          >
                            <ArrowDownRight className="h-4 w-4" />
                            Short
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="entryPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entry Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        placeholder="0.00"
                        {...field}
                        data-testid="input-trade-entry-price"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        placeholder="1"
                        {...field}
                        data-testid="input-trade-quantity"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="entryTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entry Time</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                        data-testid="input-trade-entry-time"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fees (optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        placeholder="0.00"
                        {...field}
                        data-testid="input-trade-fees"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="pnl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>P&L (Profit/Loss)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="any"
                      placeholder="0.00"
                      {...field}
                      data-testid="input-trade-pnl"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center gap-3 rounded-lg border p-4">
              <FormField
                control={form.control}
                name="isClosed"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-trade-closed"
                      />
                    </FormControl>
                    <FormLabel className="!mt-0 cursor-pointer">
                      Trade is closed (has exit)
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>

            {isClosed && (
              <div className="grid grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2">
                <FormField
                  control={form.control}
                  name="exitPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exit Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          placeholder="0.00"
                          {...field}
                          data-testid="input-trade-exit-price"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="exitTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exit Time</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                          data-testid="input-trade-exit-time"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="strategy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Strategy (optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Breakout, Trend Following, Mean Reversion"
                      {...field}
                      data-testid="input-trade-strategy"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags (optional)</FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a tag (press Enter)"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && tagInput.trim()) {
                              e.preventDefault();
                              const newTag = tagInput.trim().toLowerCase();
                              if (!field.value.includes(newTag)) {
                                field.onChange([...field.value, newTag]);
                              }
                              setTagInput("");
                            }
                          }}
                          data-testid="input-trade-tags"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            if (tagInput.trim()) {
                              const newTag = tagInput.trim().toLowerCase();
                              if (!field.value.includes(newTag)) {
                                field.onChange([...field.value, newTag]);
                              }
                              setTagInput("");
                            }
                          }}
                          data-testid="button-add-tag"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {field.value.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {field.value.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="gap-1"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => {
                                  field.onChange(field.value.filter((t) => t !== tag));
                                }}
                                className="ml-1 rounded-sm hover:bg-muted"
                                data-testid={`button-remove-tag-${tag}`}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any notes about this trade, your reasoning, lessons learned..."
                      className="min-h-[100px] resize-none"
                      {...field}
                      data-testid="input-trade-notes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              data-testid="button-submit-trade"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Log Trade"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export type { TradeFormValues };
