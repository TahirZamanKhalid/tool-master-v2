import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DiceRoller = () => {
  const [sides, setSides] = useState("6");
  const [result, setResult] = useState<number | null>(null);

  const rollDice = () => {
    const roll = Math.floor(Math.random() * parseInt(sides)) + 1;
    setResult(roll);
  };

  // Initialize AdSense
  useEffect(() => {
    try {
      // Push ad to AdSense
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <ToolLayout
      title="Dice Roller"
      description="Roll virtual dice with custom sides"
      category="Utilities"
    >
      {/* Google AdSense Ad */}
      <div className="mb-6 w-full flex justify-center">
        <ins 
          className="adsbygoogle"
          style={{ 
            display: 'block',
            minHeight: '250px' // Ensures space for ad
          }}
          data-ad-client="ca-pub-7382531001943020"
          data-ad-slot="9769564871"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>

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

      {/* Bottom Ad */}
      <div className="mt-6 w-full flex justify-center">
        <ins 
          className="adsbygoogle"
          style={{ 
            display: 'block',
            minHeight: '250px'
          }}
          data-ad-client="ca-pub-7382531001943020"
          data-ad-slot="9769564871"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </ToolLayout>
  );
};

export default DiceRoller;
