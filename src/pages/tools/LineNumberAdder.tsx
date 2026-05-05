import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Hash, Copy, Trash2 } from "lucide-react";

const LineNumberAdder = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [startNum, setStartNum] = useState("1");
  const [separator, setSeparator] = useState(". ");
  const { toast } = useToast();

  const addLineNumbers = () => {
    const lines = input.split("\n");
    const start = parseInt(startNum) || 1;
    const numbered = lines.map((line, i) => `${start + i}${separator}${line}`);
    setOutput(numbered.join("\n"));
  };

  const copy = () => {
    navigator.clipboard.writeText(output);
    toast({ description: "Copied to clipboard!" });
  };

  const clear = () => {
    setInput("");
    setOutput("");
  };

  const lineCount = input ? input.split("\n").length : 0;

  return (
    <ToolLayout
      title="Line Number Adder"
      description="Add line numbers to any text instantly. Customize starting number and separator."
      category="Text Tools"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="space-y-1.5">
            <Label>Start Number</Label>
            <Input
              type="number"
              value={startNum}
              onChange={(e) => setStartNum(e.target.value)}
              className="rounded-xl w-28"
              min="0"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Separator</Label>
            <Input
              value={separator}
              onChange={(e) => setSeparator(e.target.value)}
              className="rounded-xl w-28"
              placeholder=". "
            />
          </div>
          <div className="flex items-end">
            <span className="text-xs text-muted-foreground pb-2">{lineCount} lines</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Input Text</Label>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your text here..."
              className="rounded-xl font-mono text-sm min-h-[220px]"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Numbered Output</Label>
            <Textarea
              value={output}
              readOnly
              placeholder="Numbered text will appear here..."
              className="rounded-xl font-mono text-sm min-h-[220px] bg-muted/30"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={addLineNumbers} className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold">
            <Hash className="mr-2 h-4 w-4" /> Add Line Numbers
          </Button>
          {output && (
            <Button variant="outline" onClick={copy} className="rounded-xl">
              <Copy className="mr-2 h-4 w-4" /> Copy
            </Button>
          )}
          <Button variant="ghost" onClick={clear} className="rounded-xl">
            <Trash2 className="mr-2 h-4 w-4" /> Clear
          </Button>
        </div>
      </div>
    </ToolLayout>
  );
};

export default LineNumberAdder;
