import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Copy, RefreshCw } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";

const LoremIpsumAdvanced = () => {
  const [count, setCount] = useState("5");
  const [type, setType] = useState<'paragraphs' | 'sentences' | 'words'>('paragraphs');
  const [output, setOutput] = useState("");

  const loremWords = [
    "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
    "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
    "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
    "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo"
  ];

  const generateSentence = (): string => {
    const length = Math.floor(Math.random() * 10) + 5;
    const words = [];
    for (let i = 0; i < length; i++) {
      words.push(loremWords[Math.floor(Math.random() * loremWords.length)]);
    }
    return words[0].charAt(0).toUpperCase() + words[0].slice(1) + ' ' + words.slice(1).join(' ') + '.';
  };

  const generateParagraph = (): string => {
    const sentences = Math.floor(Math.random() * 4) + 3;
    const paragraph = [];
    for (let i = 0; i < sentences; i++) {
      paragraph.push(generateSentence());
    }
    return paragraph.join(' ');
  };

  const generate = () => {
    const num = parseInt(count);
    if (isNaN(num) || num < 1 || num > 1000) {
      toast.error("Please enter a number between 1 and 1000");
      return;
    }

    let result = "";

    if (type === 'words') {
      const words = [];
      for (let i = 0; i < num; i++) {
        words.push(loremWords[Math.floor(Math.random() * loremWords.length)]);
      }
      result = words.join(' ');
    } else if (type === 'sentences') {
      const sentences = [];
      for (let i = 0; i < num; i++) {
        sentences.push(generateSentence());
      }
      result = sentences.join(' ');
    } else {
      const paragraphs = [];
      for (let i = 0; i < num; i++) {
        paragraphs.push(generateParagraph());
      }
      result = paragraphs.join('\n\n');
    }

    setOutput(result);
    toast.success(`Generated ${num} ${type}`);
  };

  const copy = () => {
    navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard");
  };

  return (
    <>
      <SEOHead
        title="Lorem Ipsum Generator Pro"
        description="Generate placeholder text with custom paragraphs, sentences, or words for design mockups"
        keywords="lorem ipsum, placeholder text, dummy text, lorem generator"
        canonical="https://toolmaster.cloud/tools/lorem-ipsum-pro"
      />
      <ToolLayout
        title="Lorem Ipsum Generator Pro"
        description="Advanced placeholder text generator with custom options"
        category="Text Tools"
        instructions={[
          "Select type (paragraphs, sentences, or words)",
          "Enter the count you want",
          "Click 'Generate' to create text",
          "Copy result for use in your designs"
        ]}
        relatedTools={[
          { name: "Word Counter", path: "/tools/word-counter" },
          { name: "Text to Slug", path: "/tools/text-to-slug" }
        ]}
      >
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Type</label>
                <Select value={type} onValueChange={(v: any) => setType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paragraphs">Paragraphs</SelectItem>
                    <SelectItem value="sentences">Sentences</SelectItem>
                    <SelectItem value="words">Words</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Count</label>
                <Input
                  type="number"
                  min="1"
                  max="1000"
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  placeholder="Enter count..."
                />
              </div>
            </div>

            <Button onClick={generate} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Generate
            </Button>

            {output && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">Generated Text</h3>
                  <Button onClick={copy} variant="outline" size="sm">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <Textarea
                  value={output}
                  readOnly
                  className="min-h-[300px]"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </ToolLayout>
    </>
  );
};

export default LoremIpsumAdvanced;
