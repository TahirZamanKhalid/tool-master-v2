import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AdRow } from "@/components/AdRow";
import { useToast } from "@/hooks/use-toast";
import { reverseText } from "@/utils/textTools";

const StringReverser = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const { toast } = useToast();

  const reverse = () => {
    if (!input) {
      toast({ description: "Please enter text to reverse", variant: "destructive" });
      return;
    }
    setOutput(reverseText(input));
  };

  const copy = () => {
    navigator.clipboard.writeText(output);
    toast({ description: "Copied to clipboard" });
  };

  return (
    <ToolLayout
      title="String Reverser"
      description="Reverse any text string instantly"
      category="Text Tools"
    >
      <AdRow className="mb-6" />
      <Card>
        <CardContent className="p-6 space-y-4">
          <Textarea
            placeholder="Enter text to reverse..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={5}
          />
          <Button onClick={reverse} className="w-full">Reverse Text</Button>
          {output && (
            <>
              <Textarea value={output} readOnly rows={5} />
              <Button onClick={copy} variant="outline" className="w-full">Copy Result</Button>
            </>
          )}
        </CardContent>
      </Card>
      <AdRow className="mt-6" />
    </ToolLayout>
  );
};

export default StringReverser;
