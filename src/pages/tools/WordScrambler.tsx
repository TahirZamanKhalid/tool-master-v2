import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AdSpace } from "@/components/AdSpace";

const WordScrambler = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const scrambleWords = () => {
    const words = input.split(" ");
    const scrambled = words.map(word => {
      const chars = word.split("");
      for (let i = chars.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [chars[i], chars[j]] = [chars[j], chars[i]];
      }
      return chars.join("");
    });
    setOutput(scrambled.join(" "));
  };

  return (
    <ToolLayout
      title="Word Scrambler"
      description="Scramble words randomly"
      category="Text Tools"
    >
      <AdSpace size="leaderboard" className="mb-6" />
      <Card>
        <CardContent className="p-6 space-y-4">
          <Textarea
            placeholder="Enter text to scramble..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={6}
          />
          <Button onClick={scrambleWords} className="w-full">
            Scramble Words
          </Button>
          {output && <Textarea value={output} readOnly rows={6} />}
        </CardContent>
      </Card>
    </ToolLayout>
  );
};

export default WordScrambler;
