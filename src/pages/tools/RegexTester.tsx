import { useMemo, useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const RegexTester = () => {
  const [pattern, setPattern] = useState("\\w+");
  const [flags, setFlags] = useState("g");
  const [testString, setTestString] = useState("Hello World 123");

  const regexResult = useMemo(() => {
    try {
      const regex = new RegExp(pattern, flags);
      const matches = testString.match(regex);
      return { error: "", matches: matches || [] };
    } catch (e) {
      return { error: (e as Error).message, matches: [] };
    }
  }, [pattern, flags, testString]);

  const matches = regexResult.matches;
  const currentError = regexResult.error;

  const highlightedParts = useMemo(() => {
    try {
      let lastIndex = 0;
      const parts: { text: string; highlight: boolean }[] = [];
      let match;
      const safeFlags = flags.includes("g") ? flags : `${flags}g`;
      const regexCopy = new RegExp(pattern, safeFlags);
      
      while ((match = regexCopy.exec(testString)) !== null) {
        if (match.index > lastIndex) {
          parts.push({ text: testString.slice(lastIndex, match.index), highlight: false });
        }
        parts.push({ text: match[0], highlight: true });
        lastIndex = match.index + match[0].length;
        if (match[0].length === 0) {
          regexCopy.lastIndex++;
          if (regexCopy.lastIndex > testString.length) break;
        }
      }
      
      if (lastIndex < testString.length) {
        parts.push({ text: testString.slice(lastIndex), highlight: false });
      }
      
      return parts.length ? parts : [{ text: testString, highlight: false }];
    } catch {
      return [{ text: testString, highlight: false }];
    }
  }, [pattern, flags, testString]);

  const copyMatches = async () => {
    await navigator.clipboard.writeText(matches.join("\n"));
    toast.success("Matches copied to clipboard");
  };

  return (
    <ToolLayout
      title="Regex Tester"
      description="Test and validate regular expressions"
      category="Developer Tools"
      relatedTools={[
        { name: "JSON Formatter", path: "/tools/json-formatter" },
        { name: "Text Diff", path: "/tools/text-diff" },
        { name: "HTML Encoder", path: "/tools/html-encoder" }
      ]}
    >
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="pattern">Regular Expression Pattern</Label>
            <Input
              id="pattern"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              className="font-mono mt-2"
              placeholder="\\w+"
            />
          </div>
          <div>
            <Label htmlFor="flags">Flags</Label>
            <Input
              id="flags"
              value={flags}
              onChange={(e) => setFlags(e.target.value)}
              className="font-mono mt-2"
              placeholder="g, i, m, s, u, y"
            />
          </div>
        </div>

        {currentError && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
            Error: {currentError}
          </div>
        )}

        <div>
          <Label htmlFor="testString">Test String</Label>
          <Textarea
            id="testString"
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            className="min-h-[150px] font-mono mt-2"
            placeholder="Enter text to test..."
          />
        </div>

        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Result</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Matches: {matches.length}</p>
                {matches.length > 0 && (
                  <Button variant="outline" size="sm" onClick={copyMatches}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Matches
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {matches.map((match, idx) => (
                  <Badge key={idx} variant="secondary">{match}</Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Highlighted Text:</p>
              <div className="bg-muted p-4 rounded-lg font-mono">
                {highlightedParts.map((part, idx) => (
                  <span
                    key={idx}
                    className={part.highlight ? "bg-yellow-300 dark:bg-yellow-600" : ""}
                  >
                    {part.text}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </ToolLayout>
  );
};

export default RegexTester;
