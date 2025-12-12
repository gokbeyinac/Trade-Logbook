import { useState } from "react";
import { Copy, Check, ExternalLink, Webhook, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

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
        <CardContent>
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
