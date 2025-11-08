import { useState, useEffect, useRef } from "react";
import { Timer, Play, Pause, RotateCcw, Plus, X, Flag, Download, Copy, Sparkles, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface Lap {
  id: number;
  time: number;
  timestamp: Date;
  split: number; // Time since previous lap
}

interface Stopwatch {
  id: string;
  name: string;
  startTime: number | null;
  elapsedTime: number;
  isRunning: boolean;
  laps: Lap[];
  color: string;
}

const COLORS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-red-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-cyan-500",
  "bg-yellow-500",
];

const PremiumPlusMultiStopwatch = () => {
  const { toast } = useToast();
  const [stopwatches, setStopwatches] = useState<Stopwatch[]>([
    {
      id: "1",
      name: "Stopwatch 1",
      startTime: null,
      elapsedTime: 0,
      isRunning: false,
      laps: [],
      color: COLORS[0],
    },
  ]);
  const intervalRef = useRef<{ [key: string]: NodeJS.Timeout | null }>({});

  useEffect(() => {
    return () => {
      // Cleanup intervals on unmount
      Object.values(intervalRef.current).forEach(interval => {
        if (interval) clearInterval(interval);
      });
    };
  }, []);

  // Add new stopwatch
  const addStopwatch = () => {
    if (stopwatches.length >= 8) {
      toast({ title: "Maximum 8 stopwatches allowed", variant: "destructive" });
      return;
    }

    const newId = Math.random().toString(36).substring(7);
    const newStopwatch: Stopwatch = {
      id: newId,
      name: `Stopwatch ${stopwatches.length + 1}`,
      startTime: null,
      elapsedTime: 0,
      isRunning: false,
      laps: [],
      color: COLORS[stopwatches.length % COLORS.length],
    };

    setStopwatches(prev => [...prev, newStopwatch]);
    toast({ title: "New stopwatch added!" });
  };

  // Remove stopwatch
  const removeStopwatch = (id: string) => {
    if (stopwatches.length === 1) {
      toast({ title: "At least one stopwatch is required", variant: "destructive" });
      return;
    }

    if (intervalRef.current[id]) {
      clearInterval(intervalRef.current[id]!);
      delete intervalRef.current[id];
    }

    setStopwatches(prev => prev.filter(sw => sw.id !== id));
    toast({ title: "Stopwatch removed" });
  };

  // Start stopwatch
  const startStopwatch = (id: string) => {
    setStopwatches(prev =>
      prev.map(sw => {
        if (sw.id === id && !sw.isRunning) {
          const now = Date.now();

          intervalRef.current[id] = setInterval(() => {
            setStopwatches(prevStopwatches =>
              prevStopwatches.map(s =>
                s.id === id
                  ? { ...s, elapsedTime: s.elapsedTime + 10 }
                  : s
              )
            );
          }, 10);

          return {
            ...sw,
            startTime: now - sw.elapsedTime,
            isRunning: true,
          };
        }
        return sw;
      })
    );
  };

  // Pause stopwatch
  const pauseStopwatch = (id: string) => {
    if (intervalRef.current[id]) {
      clearInterval(intervalRef.current[id]!);
      intervalRef.current[id] = null;
    }

    setStopwatches(prev =>
      prev.map(sw =>
        sw.id === id
          ? { ...sw, isRunning: false }
          : sw
      )
    );
  };

  // Reset stopwatch
  const resetStopwatch = (id: string) => {
    if (intervalRef.current[id]) {
      clearInterval(intervalRef.current[id]!);
      intervalRef.current[id] = null;
    }

    setStopwatches(prev =>
      prev.map(sw =>
        sw.id === id
          ? {
              ...sw,
              startTime: null,
              elapsedTime: 0,
              isRunning: false,
              laps: [],
            }
          : sw
      )
    );
  };

  // Record lap
  const recordLap = (id: string) => {
    setStopwatches(prev =>
      prev.map(sw => {
        if (sw.id === id) {
          const lapId = sw.laps.length + 1;
          const lastLapTime = sw.laps.length > 0 ? sw.laps[sw.laps.length - 1].time : 0;
          const split = sw.elapsedTime - lastLapTime;

          const newLap: Lap = {
            id: lapId,
            time: sw.elapsedTime,
            timestamp: new Date(),
            split,
          };

          return {
            ...sw,
            laps: [...sw.laps, newLap],
          };
        }
        return sw;
      })
    );

    toast({ title: "Lap recorded!" });
  };

  // Rename stopwatch
  const renameStopwatch = (id: string, newName: string) => {
    setStopwatches(prev =>
      prev.map(sw =>
        sw.id === id ? { ...sw, name: newName } : sw
      )
    );
  };

  // Format time
  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const ms = Math.floor((milliseconds % 1000) / 10);

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  // Copy lap times
  const copyLapTimes = (sw: Stopwatch) => {
    const text = sw.laps
      .map(lap => `Lap ${lap.id}: ${formatTime(lap.time)} (Split: ${formatTime(lap.split)})`)
      .join('\n');
    navigator.clipboard.writeText(text);
    toast({ title: "Lap times copied to clipboard!" });
  };

  // Download lap times
  const downloadLapTimes = (sw: Stopwatch) => {
    const header = `${sw.name} - Lap Times\nGenerated: ${new Date().toLocaleString()}\n\n`;
    const laps = sw.laps
      .map(lap => `Lap ${lap.id}: ${formatTime(lap.time)} | Split: ${formatTime(lap.split)} | ${lap.timestamp.toLocaleTimeString()}`)
      .join('\n');

    const text = header + laps;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sw.name.replace(/\s+/g, '-')}-lap-times.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({ title: "Lap times downloaded!" });
  };

  // Get best/worst lap
  const getBestLap = (laps: Lap[]): Lap | null => {
    if (laps.length === 0) return null;
    return laps.reduce((best, lap) => lap.split < best.split ? lap : best);
  };

  const getWorstLap = (laps: Lap[]): Lap | null => {
    if (laps.length === 0) return null;
    return laps.reduce((worst, lap) => lap.split > worst.split ? lap : worst);
  };

  // Get average lap time
  const getAverageLapTime = (laps: Lap[]): number => {
    if (laps.length === 0) return 0;
    const sum = laps.reduce((acc, lap) => acc + lap.split, 0);
    return sum / laps.length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-br from-slate-700 to-zinc-700 rounded-xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-700 to-zinc-700 bg-clip-text text-transparent">
              Premium Plus Multi-Stopwatch
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Multiple simultaneous stopwatches with lap timing, statistics, and split analysis
          </p>
          <Badge variant="secondary" className="text-sm">Premium Plus Edition</Badge>
        </div>

        {/* Add Stopwatch Button */}
        <div className="text-center">
          <Button onClick={addStopwatch} variant="outline" size="lg">
            <Plus className="w-4 h-4 mr-2" />
            Add Stopwatch ({stopwatches.length}/8)
          </Button>
        </div>

        {/* Stopwatches Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {stopwatches.map((sw) => {
            const bestLap = getBestLap(sw.laps);
            const worstLap = getWorstLap(sw.laps);
            const avgLapTime = getAverageLapTime(sw.laps);

            return (
              <Card key={sw.id} className="shadow-2xl border-2">
                <CardHeader className={`${sw.color} text-white`}>
                  <div className="flex items-center justify-between">
                    <Input
                      value={sw.name}
                      onChange={(e) => renameStopwatch(sw.id, e.target.value)}
                      className="text-xl font-bold bg-transparent border-none text-white placeholder:text-white/70 focus-visible:ring-0"
                    />
                    {stopwatches.length > 1 && (
                      <Button
                        onClick={() => removeStopwatch(sw.id)}
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* Time Display */}
                  <div className="text-center">
                    <div className="text-6xl font-mono font-bold text-slate-700 tracking-tight">
                      {formatTime(sw.elapsedTime)}
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="grid grid-cols-3 gap-2">
                    {!sw.isRunning ? (
                      <Button
                        onClick={() => startStopwatch(sw.id)}
                        className={sw.color}
                        size="lg"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start
                      </Button>
                    ) : (
                      <Button
                        onClick={() => pauseStopwatch(sw.id)}
                        variant="secondary"
                        size="lg"
                      >
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </Button>
                    )}
                    <Button
                      onClick={() => recordLap(sw.id)}
                      disabled={!sw.isRunning && sw.elapsedTime === 0}
                      variant="outline"
                      size="lg"
                    >
                      <Flag className="w-4 h-4 mr-2" />
                      Lap
                    </Button>
                    <Button
                      onClick={() => resetStopwatch(sw.id)}
                      variant="outline"
                      size="lg"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                  </div>

                  {/* Statistics */}
                  {sw.laps.length > 0 && (
                    <div className="border-t pt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Lap Statistics</span>
                        <div className="flex gap-1">
                          <Button
                            onClick={() => copyLapTimes(sw)}
                            variant="ghost"
                            size="sm"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button
                            onClick={() => downloadLapTimes(sw)}
                            variant="ghost"
                            size="sm"
                          >
                            <Download className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center">
                        {bestLap && (
                          <div className="p-2 bg-green-50 rounded">
                            <p className="text-xs text-green-600 font-medium">Best Lap</p>
                            <p className="text-sm font-bold text-green-700">{formatTime(bestLap.split)}</p>
                            <p className="text-xs text-green-600">#{bestLap.id}</p>
                          </div>
                        )}
                        {worstLap && (
                          <div className="p-2 bg-red-50 rounded">
                            <p className="text-xs text-red-600 font-medium">Worst Lap</p>
                            <p className="text-sm font-bold text-red-700">{formatTime(worstLap.split)}</p>
                            <p className="text-xs text-red-600">#{worstLap.id}</p>
                          </div>
                        )}
                        <div className="p-2 bg-blue-50 rounded">
                          <p className="text-xs text-blue-600 font-medium">Average</p>
                          <p className="text-sm font-bold text-blue-700">{formatTime(avgLapTime)}</p>
                          <p className="text-xs text-blue-600">{sw.laps.length} laps</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Lap Times */}
                  {sw.laps.length > 0 && (
                    <div className="border-t pt-4">
                      <h3 className="text-sm font-medium mb-3">Lap Times</h3>
                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {sw.laps.slice().reverse().map((lap) => {
                          const isBest = bestLap && lap.id === bestLap.id;
                          const isWorst = worstLap && lap.id === worstLap.id;

                          return (
                            <div
                              key={lap.id}
                              className={`flex items-center justify-between p-2 rounded ${
                                isBest ? 'bg-green-50 border border-green-200' :
                                isWorst ? 'bg-red-50 border border-red-200' :
                                'bg-muted'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <Badge variant="outline" className="w-12 justify-center">
                                  #{lap.id}
                                </Badge>
                                <div>
                                  <p className="text-sm font-mono font-bold">
                                    {formatTime(lap.time)}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Split: {formatTime(lap.split)}
                                  </p>
                                </div>
                              </div>
                              {isBest && (
                                <Badge className="bg-green-600">Best</Badge>
                              )}
                              {isWorst && (
                                <Badge className="bg-red-600">Worst</Badge>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PremiumPlusMultiStopwatch;
