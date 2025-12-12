import { useState } from "react";
import { Copy, Check, ExternalLink, Webhook, AlertCircle, Play, Loader2, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function WebhookSetupPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const { toast } = useToast();

  const webhookUrl = `${window.location.origin}/api/webhook/tradingview`;

  const examplePayload = {
    symbol: "{{ticker}}",
    direction: "long",
    action: "entry",
    price: "{{close}}",
    quantity: 1,
    strategy: "My Strategy",
  };

  const exitPayload = {
    symbol: "{{ticker}}",
    direction: "long",
    action: "exit",
    price: "{{close}}",
  };

  const pineScriptTemplate = `//@version=5
strategy("TradeLog Webhook Strategy", overlay=true)

// Simple SMA Crossover Example - Replace with your own logic
fastMA = ta.sma(close, 14)
slowMA = ta.sma(close, 28)

longCondition = ta.crossover(fastMA, slowMA)
shortCondition = ta.crossunder(fastMA, slowMA)

if (longCondition)
    strategy.entry("Long", strategy.long, alert_message='{"symbol":"{{ticker}}","direction":"long","action":"entry","price":{{close}},"strategy":"SMA Crossover"}')

if (shortCondition)
    strategy.entry("Short", strategy.short, alert_message='{"symbol":"{{ticker}}","direction":"short","action":"entry","price":{{close}},"strategy":"SMA Crossover"}')

strategy.close("Long", when=shortCondition, alert_message='{"symbol":"{{ticker}}","direction":"long","action":"exit","price":{{close}},"strategy":"SMA Crossover"}')
strategy.close("Short", when=longCondition, alert_message='{"symbol":"{{ticker}}","direction":"short","action":"exit","price":{{close}},"strategy":"SMA Crossover"}')

plot(fastMA, color=color.blue, title="Fast MA")
plot(slowMA, color=color.red, title="Slow MA")`;

  const testWebhookMutation = useMutation({
    mutationFn: async () => {
      const testPayload = {
        symbol: "TEST",
        direction: "long",
        action: "entry",
        price: 100.00,
        quantity: 1,
        strategy: "Webhook Test",
      };
      return await apiRequest("POST", "/api/webhook/tradingview", testPayload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trades'] });
      queryClient.invalidateQueries({ queryKey: ['/api/trades/stats'] });
      toast({
        title: "Test successful!",
        description: "A test trade was created. Check your dashboard to see it.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Test failed",
        description: error.message || "Could not connect to webhook endpoint",
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">TradingView Integration</h1>
        <p className="mt-1 text-muted-foreground">
          Connect TradingView alerts to automatically log your trades
        </p>
      </div>

      <Alert>
        <Webhook className="h-4 w-4" />
        <AlertTitle>How it works</AlertTitle>
        <AlertDescription>
          TradingView can send webhook alerts when your strategy triggers. Configure your
          alerts to send trade data to TradeLog, and your trades will be logged automatically.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              1
            </span>
            Your Webhook URL
          </CardTitle>
          <CardDescription>
            Copy this URL and paste it into your TradingView alert webhook settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-md bg-muted p-3 font-mono text-sm break-all" data-testid="text-webhook-url">
              {webhookUrl}
            </code>
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(webhookUrl, "Webhook URL")}
              data-testid="button-copy-webhook-url"
            >
              {copied === "Webhook URL" ? (
                <Check className="h-4 w-4 text-profit" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => testWebhookMutation.mutate()}
              disabled={testWebhookMutation.isPending}
              data-testid="button-test-webhook"
            >
              {testWebhookMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              Test Webhook Connection
            </Button>
            <span className="text-sm text-muted-foreground">
              Creates a test trade to verify the connection
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              2
            </span>
            Alert Message Format
          </CardTitle>
          <CardDescription>
            Use these JSON templates as the alert message in TradingView
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-profit/10 text-profit">Entry Alert</Badge>
              <span className="text-sm text-muted-foreground">When opening a position</span>
            </div>
            <div className="relative">
              <pre className="rounded-md bg-muted p-4 font-mono text-sm overflow-x-auto">
                {JSON.stringify(examplePayload, null, 2)}
              </pre>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-2 top-2"
                onClick={() => copyToClipboard(JSON.stringify(examplePayload, null, 2), "Entry payload")}
                data-testid="button-copy-entry-payload"
              >
                {copied === "Entry payload" ? (
                  <Check className="h-4 w-4 text-profit" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-loss/10 text-loss">Exit Alert</Badge>
              <span className="text-sm text-muted-foreground">When closing a position</span>
            </div>
            <div className="relative">
              <pre className="rounded-md bg-muted p-4 font-mono text-sm overflow-x-auto">
                {JSON.stringify(exitPayload, null, 2)}
              </pre>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-2 top-2"
                onClick={() => copyToClipboard(JSON.stringify(exitPayload, null, 2), "Exit payload")}
                data-testid="button-copy-exit-payload"
              >
                {copied === "Exit payload" ? (
                  <Check className="h-4 w-4 text-profit" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              3
            </span>
            Field Reference
          </CardTitle>
          <CardDescription>
            Available fields and their descriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-start gap-4 rounded-lg border p-4">
                <code className="font-mono text-sm font-semibold text-primary">symbol</code>
                <div className="flex-1">
                  <p className="font-medium">Required</p>
                  <p className="text-sm text-muted-foreground">
                    Trading pair or ticker symbol. Use <code className="text-xs">{"{{ticker}}"}</code> for dynamic value.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-lg border p-4">
                <code className="font-mono text-sm font-semibold text-primary">direction</code>
                <div className="flex-1">
                  <p className="font-medium">Required</p>
                  <p className="text-sm text-muted-foreground">
                    Must be <code className="text-xs">"long"</code> or <code className="text-xs">"short"</code>
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-lg border p-4">
                <code className="font-mono text-sm font-semibold text-primary">action</code>
                <div className="flex-1">
                  <p className="font-medium">Required</p>
                  <p className="text-sm text-muted-foreground">
                    Must be <code className="text-xs">"entry"</code> or <code className="text-xs">"exit"</code>
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-lg border p-4">
                <code className="font-mono text-sm font-semibold text-primary">price</code>
                <div className="flex-1">
                  <p className="font-medium">Required</p>
                  <p className="text-sm text-muted-foreground">
                    Entry or exit price. Use <code className="text-xs">{"{{close}}"}</code> for current candle close.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-lg border p-4">
                <code className="font-mono text-sm font-semibold text-primary">quantity</code>
                <div className="flex-1">
                  <p className="font-medium">Optional</p>
                  <p className="text-sm text-muted-foreground">
                    Position size. Defaults to 1 if not provided.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-lg border p-4">
                <code className="font-mono text-sm font-semibold text-primary">strategy</code>
                <div className="flex-1">
                  <p className="font-medium">Optional</p>
                  <p className="text-sm text-muted-foreground">
                    Name of the strategy that triggered this trade.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              4
            </span>
            TradingView Setup Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4">
            <li className="flex items-start gap-4">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
                1
              </div>
              <div>
                <p className="font-medium">Open your chart with a Pine Script strategy</p>
                <p className="text-sm text-muted-foreground">
                  Your strategy must have buy/sell signals defined
                </p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
                2
              </div>
              <div>
                <p className="font-medium">Create an alert on the strategy</p>
                <p className="text-sm text-muted-foreground">
                  Right-click on the strategy and select "Add Alert"
                </p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
                3
              </div>
              <div>
                <p className="font-medium">Enable webhook notifications</p>
                <p className="text-sm text-muted-foreground">
                  In the Notifications tab, check "Webhook URL" and paste your TradeLog webhook URL
                </p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
                4
              </div>
              <div>
                <p className="font-medium">Set the alert message</p>
                <p className="text-sm text-muted-foreground">
                  In the Message field, paste the JSON template from step 2
                </p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
                5
              </div>
              <div>
                <p className="font-medium">Save and test</p>
                <p className="text-sm text-muted-foreground">
                  Create the alert and wait for it to trigger. Check your dashboard for new trades.
                </p>
              </div>
            </li>
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              5
            </span>
            <Code className="h-5 w-5" />
            Pine Script Template
          </CardTitle>
          <CardDescription>
            Copy this ready-to-use Pine Script strategy with built-in webhook alerts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-muted">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This is an example SMA crossover strategy. Replace the entry/exit logic with your own trading rules while keeping the <code className="text-xs">alert_message</code> format.
            </AlertDescription>
          </Alert>
          <div className="relative">
            <pre className="rounded-md bg-muted p-4 font-mono text-xs overflow-x-auto max-h-96 overflow-y-auto">
              {pineScriptTemplate}
            </pre>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-2 top-2"
              onClick={() => copyToClipboard(pineScriptTemplate, "Pine Script")}
              data-testid="button-copy-pine-script"
            >
              {copied === "Pine Script" ? (
                <Check className="h-4 w-4 text-profit" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">How to use:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Open TradingView and go to Pine Editor</li>
              <li>Paste this script and click "Add to Chart"</li>
              <li>Create an alert on the strategy</li>
              <li>Select "Order fills only" as the condition</li>
              <li>Enable webhook and paste your TradeLog URL</li>
              <li>Leave the message field empty (alert_message handles it)</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      <Alert className="border-primary/20 bg-primary/5">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>TradingView Pro Required</AlertTitle>
        <AlertDescription>
          Webhook alerts require TradingView Pro, Pro+, or Premium subscription.{" "}
          <a
            href="https://www.tradingview.com/gopro/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-primary underline underline-offset-4"
          >
            Learn more
            <ExternalLink className="h-3 w-3" />
          </a>
        </AlertDescription>
      </Alert>
    </div>
  );
}
