'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, BarChart3, Target, LineChart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function Landing() {
  const { toast } = useToast();
  const { login, register, isLoginPending, isRegisterPending } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      toast({
        title: "Invalid PIN",
        description: "PIN must be exactly 4 digits",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isRegisterMode) {
        if (username.length < 3) {
          toast({
            title: "Invalid username",
            description: "Username must be at least 3 characters",
            variant: "destructive",
          });
          return;
        }
        await register({ username, pin });
        toast({
          title: "Account created",
          description: "Welcome to TradeLog!",
        });
      } else {
        await login({ username, pin });
      }
    } catch (error: any) {
      let message = "Something went wrong";
      
      if (error.message) {
        if (error.message.includes("401") || error.message.includes("Invalid")) {
          message = "Invalid username or PIN";
        } else if (error.message.includes("400") || error.message.includes("already exists")) {
          message = "Username already exists";
        } else if (error.message.includes("DATABASE_URL") || error.message.includes("Database is not initialized")) {
          message = "Database connection error. Please check your configuration.";
        } else {
          message = error.message;
        }
      }
      
      toast({
        title: isRegisterMode ? "Registration failed" : "Login failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  const isPending = isLoginPending || isRegisterPending;

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

          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>{isRegisterMode ? "Create Account" : "Sign In"}</CardTitle>
              <CardDescription>
                {isRegisterMode 
                  ? "Choose a username and 4-digit PIN" 
                  : "Enter your username and PIN to continue"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    data-testid="input-username"
                    minLength={3}
                    maxLength={20}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pin">PIN (4 digits)</Label>
                  <Input
                    id="pin"
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]{4}"
                    maxLength={4}
                    placeholder="Enter 4-digit PIN"
                    value={pin}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 4);
                      setPin(value);
                    }}
                    data-testid="input-pin"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isPending}
                  data-testid="button-submit"
                >
                  {isPending ? "Please wait..." : isRegisterMode ? "Create Account" : "Sign In"}
                </Button>
              </form>
              <div className="mt-4 text-center">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsRegisterMode(!isRegisterMode);
                    setUsername("");
                    setPin("");
                  }}
                  data-testid="button-toggle-mode"
                >
                  {isRegisterMode 
                    ? "Already have an account? Sign In" 
                    : "Need an account? Create one"}
                </Button>
              </div>
            </CardContent>
          </Card>

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
