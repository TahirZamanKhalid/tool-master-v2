import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AdSpace } from "@/components/AdSpace";
import { toast } from "sonner";

const TextCompare = () => {
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const [differences, setDifferences] = useState<string[]>([]);
  const [hasCompared, setHasCompared] = useState(false);

  const compare = () => {
    if (!text1 && !text2) {
      toast.error("Please enter text to compare");
      return;
    }
    const lines1 = text1.split("\n");
    const lines2 = text2.split("\n");
    const diffs: string[] = [];

    const maxLines = Math.max(lines1.length, lines2.length);
    for (let i = 0; i < maxLines; i++) {
      if (lines1[i] !== lines2[i]) {
        diffs.push(`Line ${i + 1}: "${lines1[i] || '(empty)'}" vs "${lines2[i] || '(empty)'}"`);
      }
    }

    setDifferences(diffs);
    setHasCompared(true);
  };

  return (
    <ToolLayout
      title="Text Compare"
      description="Compare two text blocks line by line"
      category="Text Tools"
    >
      <AdSpace size="leaderboard" className="mb-6" />
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Text 1</h3>
              <Textarea
                value={text1}
                onChange={(e) => {
                  setText1(e.target.value);
                  setHasCompared(false);
                }}
                rows={10}
              />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Text 2</h3>
              <Textarea
                value={text2}
                onChange={(e) => {
                  setText2(e.target.value);
                  setHasCompared(false);
                }}
                rows={10}
              />
            </CardContent>
          </Card>
        </div>
        <Button onClick={compare} className="w-full">Compare</Button>
        {differences.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Differences ({differences.length})</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {differences.map((diff, i) => (
                  <div key={i} className="p-2 bg-muted rounded text-sm font-mono">
                    {diff}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        {hasCompared && differences.length === 0 && text1 && text2 && (
          <Card>
            <CardContent className="p-6 text-center text-green-600">
              No differences found - texts are identical
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
};

export default TextCompare;
