import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const StopwatchTimer = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTime((prev) => prev + 10);
    }, 10);

    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(2, "0")}`;
  };

  return (
    <ToolLayout
      title="Stopwatch"
      description="Precise stopwatch timer"
      category="Utilities"
    >
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="text-center p-12 bg-muted rounded">
            <p className="text-6xl font-bold gradient-primary bg-clip-text text-transparent font-mono">
              {formatTime(time)}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Button onClick={() => setIsRunning(true)} disabled={isRunning}>
              Start
            </Button>
            <Button onClick={() => setIsRunning(false)} disabled={!isRunning}>
              Pause
            </Button>
            <Button onClick={() => { setIsRunning(false); setTime(0); }} variant="outline">
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </ToolLayout>
  );
};

export default StopwatchTimer;
