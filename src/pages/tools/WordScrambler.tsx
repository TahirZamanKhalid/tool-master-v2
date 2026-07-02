import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Shuffle, Copy, RefreshCw } from "lucide-react";

const WordScrambler = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const { toast } = useToast();

  const scrambleWords = () => {
    if (!input) {
      toast({ description: "Please enter text", variant: "destructive" });
      return;
    }
    const words = input.split(/\s+/).filter(w => w);
    const scrambled = words.map(word => {
      if (word.length <= 2) return word;
      const chars = Array.from(word);
      for (let i = chars.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [chars[i], chars[j]] = [chars[j], chars[i]];
      }
      return chars.join("");
    });
    setOutput(scrambled.join(" "));
  };

  const scrambleCharacters = () => {
    if (!input) {
      toast({ description: "Please enter text", variant: "destructive" });
      return;
    }
    const chars = Array.from(input);
    for (let i = chars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    setOutput(chars.join(""));
  };

  const copy = () => {
    navigator.clipboard.writeText(output);
    toast({ description: "Copied to clipboard!" });
  };

  const wordCount = input.trim() ? input.trim().split(/\s+/).length : 0;

  return (
    <ToolLayout
      title="Word Scrambler"
      description="Randomly scramble words or characters in any text. Great for games, puzzles, and fun."
      category="Text Tools"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Input Text</label>
              <span className="text-xs text-muted-foreground">{wordCount} words</span>
            </div>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter text to scramble..."
              className="rounded-xl font-mono text-sm min-h-[200px]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Scrambled Output</label>
            <Textarea
              value={output}
              readOnly
              placeholder="Scrambled text will appear here..."
              className="rounded-xl font-mono text-sm min-h-[200px] bg-muted/30"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={scrambleWords} className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold">
            <Shuffle className="mr-2 h-4 w-4" /> Scramble Words
          </Button>
          <Button variant="outline" onClick={scrambleCharacters} className="rounded-xl">
            <RefreshCw className="mr-2 h-4 w-4" /> Scramble Characters
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

export default WordScrambler;
