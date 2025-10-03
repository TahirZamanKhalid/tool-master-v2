import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const RandomNumberGenerator = () => {
  const [min, setMin] = useState("1");
  const [max, setMax] = useState("100");
  const [result, setResult] = useState<number | null>(null);

  const generateNumber = () => {
    const minNum = parseInt(min);
    const maxNum = parseInt(max);
    const random = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
    setResult(random);
  };

  return (
    <ToolLayout
      title="Random Number Generator"
      description="Generate random numbers within a range"
      category="Utilities"
    >
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Minimum</Label>
              <Input
                type="number"
                value={min}
                onChange={(e) => setMin(e.target.value)}
              />
            </div>
            <div>
              <Label>Maximum</Label>
              <Input
                type="number"
                value={max}
                onChange={(e) => setMax(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={generateNumber} className="w-full">
            Generate Random Number
          </Button>
          {result !== null && (
            <div className="text-center p-8 bg-muted rounded">
              <p className="text-5xl font-bold gradient-primary bg-clip-text text-transparent">
                {result}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </ToolLayout>
  );
};

export default RandomNumberGenerator;
