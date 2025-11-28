import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AdSpace } from "@/components/AdSpace";

const DuplicateRemover = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const removeDuplicates = () => {
    const lines = input.split("\n");
    const unique = [...new Set(lines)];
    setOutput(unique.join("\n"));
  };

  return (
    <ToolLayout
      title="Duplicate Line Remover"
      description="Remove duplicate lines from text"
      category="Text Tools"
    >
      <AdSpace className="mb-6" />
      <Card>
        <CardContent className="p-6 space-y-4">
          <Textarea
            placeholder="Enter text with duplicate lines..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={8}
          />
          <Button onClick={removeDuplicates} className="w-full">
            Remove Duplicates
          </Button>
          {output && <Textarea value={output} readOnly rows={8} />}
        </CardContent>
      </Card>
    </ToolLayout>
  );
};

export default DuplicateRemover;
