import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AdRow } from "@/components/AdRow";
import { toast } from "sonner";

interface AgeResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
}

const getTodayInputValue = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDateInput = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const AgeCalculator = () => {
  const [birthDate, setBirthDate] = useState("");
  const [result, setResult] = useState<AgeResult | null>(null);

  const calculateAge = () => {
    if (!birthDate) {
      setResult(null);
      toast.error("Please select a birth date");
      return;
    }

    const birth = parseDateInput(birthDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (Number.isNaN(birth.getTime()) || birth > today) {
      setResult(null);
      toast.error("Birth date cannot be in the future");
      return;
    }

    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();

    if (days < 0) {
      months--;
      days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    const totalDays = Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));

    setResult({ years, months, days, totalDays });
  };

  return (
    <ToolLayout
      title="Age Calculator"
      description="Calculate your exact age"
      category="Calculators"
    >

      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <Label>Birth Date</Label>
            <Input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              max={getTodayInputValue()}
            />
          </div>
          <Button onClick={calculateAge} className="w-full">
            Calculate Age
          </Button>
          {result && (
            <div className="space-y-2 p-4 bg-muted rounded">
              <p className="text-2xl font-bold">
                {result.years} years, {result.months} months, {result.days} days
              </p>
              <p className="text-muted-foreground">
                That's {result.totalDays.toLocaleString()} days old!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

    </ToolLayout>
  );
};

export default AgeCalculator;
