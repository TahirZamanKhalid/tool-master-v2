import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AdSpace } from "@/components/AdSpace";

const AgeCalculator = () => {
  const [birthDate, setBirthDate] = useState("");
  const [result, setResult] = useState<any>(null);

  const calculateAge = () => {
    if (!birthDate) return;

    const birth = new Date(birthDate);
    const today = new Date();
    
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
      <AdSpace size="leaderboard" className="mb-6" />
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <Label>Birth Date</Label>
            <Input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
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
