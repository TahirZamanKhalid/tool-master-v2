import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AdRow } from "@/components/AdRow";

const BinaryTranslator = () => {
  const [text, setText] = useState("");
  const [binary, setBinary] = useState("");

  const textToBinary = () => {
    setBinary(text.split("").map(char => 
      char.charCodeAt(0).toString(2).padStart(8, "0")
    ).join(" "));
  };

  const binaryToText = () => {
    try {
      setText(binary.split(" ").map(bin => 
        String.fromCharCode(parseInt(bin, 2))
      ).join(""));
    } catch {
      setText("Invalid binary");
    }
  };

  return (
    <ToolLayout
      title="Binary Translator"
      description="Convert text to binary and vice versa"
      category="Converter Tools"
    >
      <AdRow className="mb-6" />
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
            <Button onClick={textToBinary} className="w-full">
              Convert to Binary
            </Button>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Binary</label>
            <Textarea
              placeholder="Enter binary (space separated)..."
              value={binary}
              onChange={(e) => setBinary(e.target.value)}
              rows={4}
              className="font-mono"
            />
            <Button onClick={binaryToText} variant="outline" className="w-full">
              Convert to Text
            </Button>
          </div>
        </CardContent>
      </Card>
      <AdRow className="mt-6" />
    </ToolLayout>
  );
};

export default BinaryTranslator;
