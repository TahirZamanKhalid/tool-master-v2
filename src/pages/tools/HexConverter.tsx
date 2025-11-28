import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AdSpace } from "@/components/AdSpace";

const HexConverter = () => {
  const [text, setText] = useState("");
  const [hex, setHex] = useState("");

  const textToHex = () => {
    setHex(text.split("").map(char => 
      char.charCodeAt(0).toString(16).padStart(2, "0")
    ).join(" "));
  };

  const hexToText = () => {
    try {
      setText(hex.split(" ").map(h => 
        String.fromCharCode(parseInt(h, 16))
      ).join(""));
    } catch {
      setText("Invalid hex");
    }
  };

  return (
    <ToolLayout
      title="Hex Converter"
      description="Convert text to hexadecimal and vice versa"
      category="Converter Tools"
    >
      <AdSpace size="leaderboard" className="mb-6" />
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Text</label>
            <Textarea
              placeholder="Enter text..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
            />
            <Button onClick={textToHex} className="w-full">
              Convert to Hex
            </Button>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Hexadecimal</label>
            <Textarea
              placeholder="Enter hex (space separated)..."
              value={hex}
              onChange={(e) => setHex(e.target.value)}
              rows={4}
              className="font-mono"
            />
            <Button onClick={hexToText} variant="outline" className="w-full">
              Convert to Text
            </Button>
          </div>
        </CardContent>
      </Card>
    </ToolLayout>
  );
};

export default HexConverter;
