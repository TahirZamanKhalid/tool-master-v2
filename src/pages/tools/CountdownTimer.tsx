import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AdSpace } from "@/components/AdSpace";

const CountdownTimer = () => {
  const [minutes, setMinutes] = useState("5");
  const [seconds, setSeconds] = useState("0");
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const startTimer = () => {
    const total = parseInt(minutes) * 60 + parseInt(seconds);
    setTimeLeft(total);
    setIsRunning(true);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(0);
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <ToolLayout
      title="Countdown Timer"
      description="Set a countdown timer"
      category="Utilities"
    >
      <AdSpace size="leaderboard" className="mb-6" />
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Minutes</Label>
              <Input
                type="number"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                disabled={isRunning}
              />
            </div>
            <div>
              <Label>Seconds</Label>
              <Input
                type="number"
                value={seconds}
                onChange={(e) => setSeconds(e.target.value)}
                disabled={isRunning}
              />
            </div>
          </div>
          {timeLeft > 0 && (
            <div className="text-center p-12 bg-muted rounded">
              <p className="text-6xl font-bold text-primary">
                {formatTime(timeLeft)}
              </p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={startTimer} disabled={isRunning}>
              Start
            </Button>
            <Button onClick={resetTimer} variant="outline">
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </ToolLayout>
  );
};

export default CountdownTimer;
