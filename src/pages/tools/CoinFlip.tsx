import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdSpace } from "@/components/AdSpace";

const CoinFlip = () => {
  const [result, setResult] = useState<string | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);

  const flipCoin = () => {
    setIsFlipping(true);
    setTimeout(() => {
      const flip = Math.random() < 0.5 ? "Heads" : "Tails";
      setResult(flip);
      setIsFlipping(false);
    }, 500);
  };

  return (
    <ToolLayout
      title="Coin Flip"
      description="Flip a virtual coin"
      category="Utilities"
    >
      <AdSpace size="leaderboard" className="mb-6" />
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="text-center p-12 bg-muted rounded">
            {isFlipping ? (
              <p className="text-3xl font-bold text-muted-foreground animate-pulse">
                Flipping...
              </p>
            ) : result ? (
              <p className="text-6xl font-bold text-primary">{result}</p>
            ) : (
              <p className="text-2xl text-muted-foreground">Click to flip</p>
            )}
          </div>
          <Button onClick={flipCoin} className="w-full" disabled={isFlipping}>
            Flip Coin
          </Button>
        </CardContent>
      </Card>
    </ToolLayout>
  );
};

export default CoinFlip;
