import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AdSpace } from "@/components/AdSpace";

const RandomStringGenerator = () => {
  const [length, setLength] = useState(16);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(false);
  const [result, setResult] = useState("");

  const generate = () => {
    let chars = "";
    if (uppercase) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (lowercase) chars += "abcdefghijklmnopqrstuvwxyz";
    if (numbers) chars += "0123456789";
    if (symbols) chars += "!@#$%^&*()_+-=[]{}|;:,.<>?";
    
    let str = "";
    for (let i = 0; i < length; i++) {
      str += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setResult(str);
  };

  return (
    <ToolLayout
      title="Random String Generator"
      description="Generate random strings with custom options"
      category="Utilities"
    >
      <AdSpace size="leaderboard" className="mb-6" />
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <Label>Length</Label>
            <Input
              type="number"
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value) || 1)}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox checked={uppercase} onCheckedChange={(c) => setUppercase(!!c)} />
              <label>Uppercase (A-Z)</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox checked={lowercase} onCheckedChange={(c) => setLowercase(!!c)} />
              <label>Lowercase (a-z)</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox checked={numbers} onCheckedChange={(c) => setNumbers(!!c)} />
              <label>Numbers (0-9)</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox checked={symbols} onCheckedChange={(c) => setSymbols(!!c)} />
              <label>Symbols (!@#$...)</label>
            </div>
          </div>
          <Button onClick={generate} className="w-full">Generate</Button>
          {result && (
            <div className="p-4 bg-muted rounded font-mono break-all">
              {result}
            </div>
          )}
        </CardContent>
      </Card>
    </ToolLayout>
  );
};

export default RandomStringGenerator;
