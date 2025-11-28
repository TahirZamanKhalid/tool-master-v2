import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdSpace } from "@/components/AdSpace";

const PomodoroTimer = () => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            setIsActive(false);
            if (isBreak) {
              setIsBreak(false);
              setMinutes(25);
            } else {
              setIsBreak(true);
              setMinutes(5);
            }
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, minutes, seconds, isBreak]);

  const reset = () => {
    setIsActive(false);
    setIsBreak(false);
    setMinutes(25);
    setSeconds(0);
  };

  return (
    <ToolLayout
      title="Pomodoro Timer"
      description="Stay productive with the Pomodoro Technique"
      category="Productivity"
    >
      <AdSpace size="leaderboard" className="mb-6" />
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="text-center p-12 bg-muted rounded">
            <p className="text-sm text-muted-foreground mb-2">
              {isBreak ? "Break Time" : "Focus Time"}
            </p>
            <p className="text-6xl font-bold text-primary font-mono">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Button onClick={() => setIsActive(!isActive)}>
              {isActive ? "Pause" : "Start"}
            </Button>
            <Button onClick={reset} variant="outline">Reset</Button>
            <Button onClick={() => { setIsBreak(!isBreak); setMinutes(isBreak ? 25 : 5); setSeconds(0); }} variant="outline">
              {isBreak ? "Focus" : "Break"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </ToolLayout>
  );
};

export default PomodoroTimer;
