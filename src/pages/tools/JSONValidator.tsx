import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AdSpace } from "@/components/AdSpace";
import { Alert, AlertDescription } from "@/components/ui/alert";

const JSONValidator = () => {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<{ valid: boolean; message: string } | null>(null);

  const validate = () => {
    try {
      JSON.parse(input);
      setResult({ valid: true, message: "Valid JSON!" });
    } catch (error: any) {
      setResult({ valid: false, message: error.message });
    }
  };

  return (
    <ToolLayout
      title="JSON Validator"
      description="Validate JSON syntax"
      category="Developer Tools"
    >
      <AdSpace size="leaderboard" className="mb-6" />
      <Card>
        <CardContent className="p-6 space-y-4">
          <Textarea
            placeholder="Paste JSON here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={10}
            className="font-mono"
          />
          <Button onClick={validate} className="w-full">
            Validate JSON
          </Button>
          {result && (
            <Alert variant={result.valid ? "default" : "destructive"}>
              <AlertDescription>
                {result.valid ? "✓ " : "✗ "}
                {result.message}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </ToolLayout>
  );
};

export default JSONValidator;
