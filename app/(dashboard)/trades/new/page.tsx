'use client';

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TradeForm, type TradeFormValues } from "@/components/trade-form";
import { useToast } from "@/hooks/use-toast";

async function apiRequest(
  method: string,
  url: string,
  data?: unknown
): Promise<Response> {
  const headers: Record<string, string> = {};
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  
  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
  
  return res;
}

export default function NewTradePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createTrade = useMutation({
    mutationFn: async (data: TradeFormValues) => {
      const payload = {
        symbol: data.symbol,
        direction: data.direction,
        status: data.isClosed ? "closed" : "open",
        entryPrice: parseFloat(data.entryPrice),
        exitPrice: data.isClosed && data.exitPrice ? parseFloat(data.exitPrice) : null,
        quantity: parseFloat(data.quantity),
        entryTime: new Date(data.entryTime).toISOString(),
        exitTime: data.isClosed && data.exitTime ? new Date(data.exitTime).toISOString() : null,
        fees: data.fees ? parseFloat(data.fees) : 0,
        pnl: data.pnl ? parseFloat(data.pnl) : null,
        strategy: data.strategy || "",
        tags: data.tags || [],
        notes: data.notes || "",
        source: "manual",
      };
      return apiRequest("POST", "/api/trades", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trades"] });
      queryClient.invalidateQueries({ queryKey: ["/api/trades/stats"] });
      toast({
        title: "Trade logged",
        description: "Your trade has been saved successfully.",
      });
      router.push("/trades");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save trade. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/trades">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Log Trade</h1>
          <p className="mt-1 text-muted-foreground">
            Manually record a new trade
          </p>
        </div>
      </div>

      <TradeForm
        onSubmit={(data) => createTrade.mutate(data)}
        isLoading={createTrade.isPending}
      />
    </div>
  );
}
