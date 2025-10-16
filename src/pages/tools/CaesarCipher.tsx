import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AdSpace } from "@/components/AdSpace";

const CaesarCipher = () => {
  const [text, setText] = useState("");
  const [shift, setShift] = useState(3);
  const [result, setResult] = useState("");

  const caesar = (str: string, shift: number) => {
    return str.split("").map(char => {
      if (char.match(/[a-z]/i)) {
        const code = char.charCodeAt(0);
        const base = code >= 65 && code <= 90 ? 65 : 97;
        return String.fromCharCode(((code - base + shift) % 26) + base);
      }
      return char;
    }).join("");
  };

  const encrypt = () => setResult(caesar(text, shift));
  const decrypt = () => setResult(caesar(text, -shift));

  return (
    <ToolLayout
      title="Caesar Cipher"
      description="Encrypt and decrypt text using Caesar cipher"
      category="Security Tools"
    >
      <AdSpace size="leaderboard" className="mb-6" />
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <Label>Shift Value</Label>
            <Input
              type="number"
              value={shift}
              onChange={(e) => setShift(parseInt(e.target.value) || 0)}
            />
          </div>
          <Textarea
            placeholder="Enter text..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
          />
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={encrypt}>Encrypt</Button>
            <Button onClick={decrypt} variant="outline">Decrypt</Button>
          </div>
          {result && <Textarea value={result} readOnly rows={4} />}
        </CardContent>
      </Card>
    </ToolLayout>
  );
};

export default CaesarCipher;
