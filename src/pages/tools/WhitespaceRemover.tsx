import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Eraser, Copy } from "lucide-react";

const WhitespaceRemover = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const { toast } = useToast();

  const removeWhitespace = () => {
    if (!input) {
      toast({ description: "Please enter text", variant: "destructive" });
      return;
    }
    setOutput(input.replace(/\s+/g, " ").trim());
  };

  const removeAllWhitespace = () => {
    if (!input) {
      toast({ description: "Please enter text", variant: "destructive" });
      return;
    }
    setOutput(input.replace(/\s/g, ""));
  };

  const trimLines = () => {
    if (!input) {
      toast({ description: "Please enter text", variant: "destructive" });
      return;
    }
    setOutput(input.split("\n").map(l => l.trim()).filter(l => l).join("\n"));
  };

  const copy = () => {
    navigator.clipboard.writeText(output);
    toast({ description: "Copied to clipboard!" });
  };

  const inputWords = input.trim() ? input.trim().split(/\s+/).length : 0;
  const outputWords = output.trim() ? output.trim().split(/\s+/).length : 0;

  return (
    <ToolLayout
      title="Whitespace Remover"
      description="Remove extra whitespace, trim lines, or strip all spaces from text instantly."
      category="Text Tools"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Input Text</label>
              <span className="text-xs text-muted-foreground">{inputWords} words - {input.length} chars</span>
            </div>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter text with extra whitespace..."
              className="rounded-xl font-mono text-sm min-h-[200px]"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Result</label>
              <span className="text-xs text-muted-foreground">{outputWords} words - {output.length} chars</span>
            </div>
            <Textarea
              value={output}
              readOnly
              placeholder="Result will appear here..."
              className="rounded-xl font-mono text-sm min-h-[200px] bg-muted/30"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={removeWhitespace} className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold">
            <Eraser className="mr-2 h-4 w-4" /> Remove Extra Spaces
          </Button>
          <Button variant="outline" onClick={trimLines} className="rounded-xl">
            Trim Lines
          </Button>
          <Button variant="outline" onClick={removeAllWhitespace} className="rounded-xl">
            Remove All Spaces
          </Button>
          {output && (
            <Button variant="outline" onClick={copy} className="rounded-xl">
              <Copy className="mr-2 h-4 w-4" /> Copy
            </Button>
          )}
        </div>
      </div>
    </ToolLayout>
  );
};

export default WhitespaceRemover;
