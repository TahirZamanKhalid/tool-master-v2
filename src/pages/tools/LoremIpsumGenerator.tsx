import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { FileText, Copy } from "lucide-react";

const LoremIpsumGenerator = () => {
  const [count, setCount] = useState(3);
  const [type, setType] = useState<"paragraphs" | "words" | "sentences">("paragraphs");
  const [output, setOutput] = useState("");

  const loremWords = [
    "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
    "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
    "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
    "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
    "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate",
    "velit", "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint",
    "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia",
    "deserunt", "mollit", "anim", "id", "est", "laborum"
  ];

  const generateSentence = () => {
    const length = Math.floor(Math.random() * 10) + 5;
    const words = [];
    for (let i = 0; i < length; i++) {
      words.push(loremWords[Math.floor(Math.random() * loremWords.length)]);
    }
    return words.join(" ").charAt(0).toUpperCase() + words.join(" ").slice(1) + ".";
  };

  const generateParagraph = () => {
    const sentences = Math.floor(Math.random() * 4) + 3;
    const paragraph = [];
    for (let i = 0; i < sentences; i++) {
      paragraph.push(generateSentence());
    }
    return paragraph.join(" ");
  };

  const generate = () => {
    let result = "";
    const safeCount = Math.max(1, Math.min(100, count || 1));
    
    if (type === "paragraphs") {
      const paragraphs = [];
      for (let i = 0; i < safeCount; i++) {
        paragraphs.push(generateParagraph());
      }
      result = paragraphs.join("\n\n");
    } else if (type === "sentences") {
      const sentences = [];
      for (let i = 0; i < safeCount; i++) {
        sentences.push(generateSentence());
      }
      result = sentences.join(" ");
    } else {
      const words = [];
      for (let i = 0; i < safeCount; i++) {
        words.push(loremWords[Math.floor(Math.random() * loremWords.length)]);
      }
      result = words.join(" ");
    }

    setOutput(result);
    toast.success("Lorem ipsum generated!");
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard!");
  };

  return (
    <ToolLayout
      title="Lorem Ipsum Generator"
      description="Generate placeholder text for your designs"
      category="Text Tools"
      relatedTools={[
        { name: "Word Counter", path: "/tools/premium-plus-word-counter" },
        { name: "Case Converter", path: "/tools/case-converter" },
        { name: "Password Generator", path: "/tools/password-generator" }
      ]}
    >
      <div className="space-y-6">
        <div>
          <Label htmlFor="count">Count</Label>
          <Input
            id="count"
            type="number"
            min="1"
            max="100"
            value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
            className="mt-2"
          />
        </div>

        <div>
          <Label>Type</Label>
          <RadioGroup value={type} onValueChange={(v) => setType(v as typeof type)} className="mt-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="paragraphs" id="paragraphs" />
              <Label htmlFor="paragraphs" className="cursor-pointer">Paragraphs</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sentences" id="sentences" />
              <Label htmlFor="sentences" className="cursor-pointer">Sentences</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="words" id="words" />
              <Label htmlFor="words" className="cursor-pointer">Words</Label>
            </div>
          </RadioGroup>
        </div>

        <Button onClick={generate} className="w-full">
          Generate Lorem Ipsum
        </Button>

        {output && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Generated Text</Label>
              <Button onClick={copyToClipboard} variant="outline" size="sm">
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
      </div>
    </ToolLayout>
  );
};

export default LoremIpsumGenerator;
