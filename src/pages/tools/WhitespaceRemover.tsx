import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AdSpace } from "@/components/AdSpace";

const WhitespaceRemover = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const removeWhitespace = () => {
    setOutput(input.replace(/\s+/g, " ").trim());
  };

  return (
    <ToolLayout
      title="Whitespace Remover"
      description="Remove extra whitespace from text"
      category="Text Tools"
    >
      <AdSpace size="leaderboard" className="mb-6" />
      <Card>
        <CardContent className="p-6 space-y-4">
          <Textarea
            placeholder="Enter text with extra spaces..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={8}
          />
          <Button onClick={removeWhitespace} className="w-full">
            Remove Extra Whitespace
          </Button>
          {output && <Textarea value={output} readOnly rows={8} />}
        </CardContent>
      </Card>
    </ToolLayout>
  );
};

export default WhitespaceRemover;
