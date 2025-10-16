import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AdSpace } from "@/components/AdSpace";

const LineNumberAdder = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const addLineNumbers = () => {
    const lines = input.split("\n");
    const numbered = lines.map((line, i) => `${i + 1}. ${line}`);
    setOutput(numbered.join("\n"));
  };

  return (
    <ToolLayout
      title="Line Number Adder"
      description="Add line numbers to text"
      category="Text Tools"
    >
      <AdSpace size="leaderboard" className="mb-6" />
      <Card>
        <CardContent className="p-6 space-y-4">
          <Textarea
            placeholder="Enter text..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={10}
          />
          <Button onClick={addLineNumbers} className="w-full">
            Add Line Numbers
          </Button>
          {output && <Textarea value={output} readOnly rows={10} className="font-mono" />}
        </CardContent>
      </Card>
    </ToolLayout>
  );
};

export default LineNumberAdder;
