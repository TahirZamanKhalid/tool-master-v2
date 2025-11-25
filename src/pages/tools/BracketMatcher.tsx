import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AdSpace } from "@/components/AdSpace";
import { CheckCircle, XCircle } from "lucide-react";

const BracketMatcher = () => {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<{ valid: boolean; message: string } | null>(null);

  const check = () => {
    const stack: string[] = [];
    const pairs: Record<string, string> = { "(": ")", "[": "]", "{": "}" };
    
    for (const char of input) {
      if (char in pairs) {
        stack.push(char);
      } else if (Object.values(pairs).includes(char)) {
        const last = stack.pop();
        if (!last || pairs[last] !== char) {
          setResult({ valid: false, message: "Brackets are not balanced" });
          return;
        }
      }
    }
    
    if (stack.length === 0) {
      setResult({ valid: true, message: "All brackets are balanced!" });
    } else {
      setResult({ valid: false, message: "Brackets are not balanced" });
    }
  };

  return (
    <ToolLayout
      title="Bracket Matcher"
      description="Check if brackets are balanced"
      category="Developer Tools"
    >
      <AdSpace size="leaderboard" className="mb-6" />
      <Card>
        <CardContent className="p-6 space-y-4">
          <Textarea
            placeholder="Enter code or text with brackets..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={8}
            className="font-mono"
          />
          <Button onClick={check} className="w-full">Check Brackets</Button>
          {result && (
            <div className={`flex items-center gap-2 p-4 rounded ${result.valid ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
              {result.valid ? <CheckCircle className="text-green-500" /> : <XCircle className="text-red-500" />}
              <span>{result.message}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </ToolLayout>
  );
};

export default BracketMatcher;
