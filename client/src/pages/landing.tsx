import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, BarChart3, Target, LineChart } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { signInWithGoogle } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

export default function Landing() {
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message || "Could not sign in with Google",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary">
              <TrendingUp className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">TradeLog</h1>
          </div>
          
          <p className="text-xl text-muted-foreground max-w-2xl">
            Professional trading journal to track, analyze, and improve your trading performance.
          </p>

          <Button
            size="lg"
            onClick={handleGoogleSignIn}
            data-testid="button-login"
            className="gap-2"
          >
            <SiGoogle className="h-5 w-5" />
            Sign in with Google
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full max-w-4xl">
            <Card>
              <CardHeader>
                <BarChart3 className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Track Trades</CardTitle>
                <CardDescription>
                  Log all your trades with entry/exit prices, quantities, and notes
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <LineChart className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Analyze Performance</CardTitle>
                <CardDescription>
                  View win rate, profit factor, and equity curves
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Target className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Improve Results</CardTitle>
                <CardDescription>
                  Identify patterns and optimize your trading strategy
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
