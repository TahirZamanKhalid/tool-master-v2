import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdRow } from "@/components/AdRow";

const DiceRoller = () => {
  const [sides, setSides] = useState("6");
  const [result, setResult] = useState<number | null>(null);

  const rollDice = () => {
    const roll = Math.floor(Math.random() * parseInt(sides)) + 1;
    setResult(roll);
  };

  return (
    <ToolLayout
      title="Dice Roller"
      description="Roll virtual dice with custom sides"
      category="Utilities"
    >
      <AdRow className="mb-6" />
      <Card>
        <CardContent className="p-6 space-y-4">
          <Select value={sides} onValueChange={setSides}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="4">D4 (4 sides)</SelectItem>
              <SelectItem value="6">D6 (6 sides)</SelectItem>
              <SelectItem value="8">D8 (8 sides)</SelectItem>
              <SelectItem value="10">D10 (10 sides)</SelectItem>
              <SelectItem value="12">D12 (12 sides)</SelectItem>
              <SelectItem value="20">D20 (20 sides)</SelectItem>
              <SelectItem value="100">D100 (100 sides)</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={rollDice} className="w-full">
            Roll Dice
          </Button>
          {result !== null && (
            <div className="text-center p-12 bg-muted rounded">
              <p className="text-6xl font-bold text-primary">
                {result}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      <AdRow className="mt-6" />
    </ToolLayout>
  );
};

export default DiceRoller;
