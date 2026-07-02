import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Copy } from "lucide-react";

const toDateTimeInputValue = (date: Date): string => {
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
};

const parseTimestampInput = (value: string): number | null => {
  if (!value.trim()) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  const milliseconds = Math.abs(parsed) < 100000000000 ? parsed * 1000 : parsed;
  const date = new Date(milliseconds);
  return Number.isNaN(date.getTime()) ? null : milliseconds;
};

const TimestampConverter = () => {
  const [timestamp, setTimestamp] = useState(Date.now());
  const [dateString, setDateString] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    updateDateString(timestamp);
  }, []);

  const updateDateString = (ts: number) => {
    const date = new Date(ts);
    if (Number.isNaN(date.getTime())) {
      setError("Invalid timestamp");
      return;
    }
    setDateString(toDateTimeInputValue(date));
  };

  const handleTimestampChange = (value: string) => {
    const ts = parseTimestampInput(value);
    if (ts === null) {
      setError("Enter a valid Unix timestamp in seconds or milliseconds");
      return;
    }
    setError("");
    setTimestamp(ts);
    updateDateString(ts);
  };

  const handleDateChange = (value: string) => {
    setDateString(value);
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      setError("");
      setTimestamp(date.getTime());
    } else {
      setError("Enter a valid date and time");
    }
  };

  const getCurrentTimestamp = () => {
    const now = Date.now();
    setTimestamp(now);
    updateDateString(now);
    setError("");
    toast.success("Current timestamp loaded!");
  };

  const copyTimestamp = () => {
    navigator.clipboard.writeText(timestamp.toString());
    toast.success("Timestamp copied!");
  };

  const date = new Date(timestamp);
  const isValidDate = !Number.isNaN(date.getTime());

  return (
    <ToolLayout
      title="Timestamp Converter"
      description="Convert between Unix timestamps and human-readable dates"
      category="Developer Tools"
      relatedTools={[
        { name: "Currency Converter", path: "/tools/currency-converter" },
        { name: "Hash Generator", path: "/tools/hash-generator" },
        { name: "UUID Generator", path: "/tools/uuid-generator" }
      ]}
    >
      <div className="space-y-6">
        <Button onClick={getCurrentTimestamp} className="w-full">
          Get Current Timestamp
        </Button>

        <div>
          <div className="flex justify-between items-center mb-2">
            <Label htmlFor="timestamp">Unix Timestamp (seconds or milliseconds)</Label>
            <Button onClick={copyTimestamp} variant="outline" size="sm">
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
          </div>
          <Input
            id="timestamp"
            type="number"
            value={timestamp}
            onChange={(e) => handleTimestampChange(e.target.value)}
          />
          {error && <p className="text-sm text-destructive mt-2">{error}</p>}
        </div>

        <div>
          <Label htmlFor="datetime">Date and Time</Label>
          <Input
            id="datetime"
            type="datetime-local"
            value={dateString}
            onChange={(e) => handleDateChange(e.target.value)}
            className="mt-2"
          />
        </div>

        {isValidDate && (
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-lg">Formatted Dates</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">ISO 8601:</span>
              <span className="font-mono">{date.toISOString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">UTC:</span>
              <span className="font-mono">{date.toUTCString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Local:</span>
              <span className="font-mono">{date.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date Only:</span>
              <span className="font-mono">{date.toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Time Only:</span>
              <span className="font-mono">{date.toLocaleTimeString()}</span>
            </div>
          </div>
        </Card>
        )}
      </div>
    </ToolLayout>
  );
};

export default TimestampConverter;
