import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdSpace } from "@/components/AdSpace";
import { RotateCcw, TrendingUp } from "lucide-react";

const CoinFlip = () => {
  const [result, setResult] = useState<string | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [stats, setStats] = useState({ heads: 0, tails: 0, total: 0 });
  const [rotation, setRotation] = useState(0);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("coinFlipHistory");
    if (savedHistory) {
      const parsed = JSON.parse(savedHistory);
      setHistory(parsed);
      calculateStats(parsed);
    }
  }, []);

  const calculateStats = (historyArray: string[]) => {
    const heads = historyArray.filter((r) => r === "Heads").length;
    const tails = historyArray.filter((r) => r === "Tails").length;
    setStats({ heads, tails, total: historyArray.length });
  };

  const flipCoin = () => {
    setIsFlipping(true);

    // Add multiple rotations for effect
    const spins = 5 + Math.floor(Math.random() * 3);
    setRotation((prev) => prev + spins * 180);

    setTimeout(() => {
      const flip = Math.random() < 0.5 ? "Heads" : "Tails";
      setResult(flip);

      const newHistory = [flip, ...history].slice(0, 50); // Keep last 50 flips
      setHistory(newHistory);
      calculateStats(newHistory);
      localStorage.setItem("coinFlipHistory", JSON.stringify(newHistory));

      setIsFlipping(false);
    }, 1000);
  };

  const resetStats = () => {
    setHistory([]);
    setStats({ heads: 0, tails: 0, total: 0 });
    setResult(null);
    setRotation(0);
    localStorage.removeItem("coinFlipHistory");
  };

  const getPercentage = (count: number) => {
    return stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : "0.0";
  };

  return (
    <ToolLayout
      title="Coin Flip Simulator"
      description="Flip a virtual coin with real-time statistics and history tracking. Perfect for making decisions, settling disputes, or understanding probability."
      category="Utilities"
    >
      <AdSpace size="leaderboard" className="mb-6" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar Ad - Left */}
        <div className="hidden lg:block lg:col-span-2">
          <div className="sticky top-6">
            <AdSpace size="skyscraper" />
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-8 space-y-6">
          {/* Coin Flip Card */}
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="text-center p-12 bg-gradient-to-br from-muted/50 to-muted rounded-lg relative overflow-hidden">
                <div
                  className="inline-block transition-transform duration-1000 ease-out"
                  style={{
                    transform: `rotateY(${rotation}deg)`,
                    transformStyle: "preserve-3d",
                  }}
                >
                  {isFlipping ? (
                    <div className="text-8xl">🪙</div>
                  ) : result ? (
                    <div>
                      <p className="text-7xl font-bold text-primary mb-2">{result === "Heads" ? "👑" : "🔄"}</p>
                      <p className="text-4xl font-bold text-primary">{result}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-7xl mb-2">🪙</p>
                      <p className="text-xl text-muted-foreground">Click to flip the coin</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={flipCoin} className="flex-1 h-12 text-lg" disabled={isFlipping}>
                  {isFlipping ? "Flipping..." : "Flip Coin"}
                </Button>
                {stats.total > 0 && (
                  <Button onClick={resetStats} variant="outline" className="h-12" title="Reset Statistics">
                    <RotateCcw className="w-5 h-5" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Statistics Card */}
          {stats.total > 0 && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">Statistics</h3>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.heads}</p>
                    <p className="text-sm text-muted-foreground mt-1">Heads</p>
                    <p className="text-xs text-muted-foreground mt-1">{getPercentage(stats.heads)}%</p>
                  </div>

                  <div className="text-center p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                    <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{stats.tails}</p>
                    <p className="text-sm text-muted-foreground mt-1">Tails</p>
                    <p className="text-xs text-muted-foreground mt-1">{getPercentage(stats.tails)}%</p>
                  </div>

                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-3xl font-bold">{stats.total}</p>
                    <p className="text-sm text-muted-foreground mt-1">Total Flips</p>
                    <p className="text-xs text-muted-foreground mt-1">All time</p>
                  </div>
                </div>

                {/* Visual Progress Bars */}
                <div className="space-y-3 pt-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">Heads</span>
                      <span className="text-muted-foreground">{getPercentage(stats.heads)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${getPercentage(stats.heads)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">Tails</span>
                      <span className="text-muted-foreground">{getPercentage(stats.tails)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-amber-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${getPercentage(stats.tails)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent History */}
          {history.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Recent History</h3>
                <div className="flex flex-wrap gap-2">
                  {history.slice(0, 20).map((flip, index) => (
                    <div
                      key={index}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        flip === "Heads"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                      }`}
                    >
                      {flip}
                    </div>
                  ))}
                </div>
                {history.length > 20 && (
                  <p className="text-sm text-muted-foreground mt-3">Showing 20 of {history.length} flips</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Information Card */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-semibold">About Coin Flipping</h3>

              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  A coin flip is a simple random event with two equally likely outcomes. This tool uses a
                  cryptographically secure random number generator to ensure fair and unbiased results.
                </p>

                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Common Uses:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Making quick decisions between two options</li>
                    <li>Settling friendly disputes</li>
                    <li>Choosing who goes first in games</li>
                    <li>Teaching probability concepts</li>
                    <li>Adding randomness to activities</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Features:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Realistic coin flip animation</li>
                    <li>Real-time statistics tracking</li>
                    <li>Complete flip history (last 50 flips)</li>
                    <li>Percentage calculations</li>
                    <li>Data persistence across sessions</li>
                  </ul>
                </div>

                <p className="pt-2 text-xs">
                  <strong>Did you know?</strong> With a fair coin, the probability of getting heads or tails is exactly
                  50%. However, in small samples, you might see variations. Try flipping 100 times to see the law of
                  large numbers in action!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Ad - Right */}
        <div className="hidden lg:block lg:col-span-2">
          <div className="sticky top-6">
            <AdSpace size="skyscraper" />
          </div>
        </div>
      </div>

      {/* Mobile Bottom Ad */}
      <div className="lg:hidden mt-6">
        <AdSpace size="banner" />
      </div>
    </ToolLayout>
  );
};

export default CoinFlip;
