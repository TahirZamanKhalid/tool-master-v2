import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";

const TextDiff = () => {
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");

  const getDiff = () => {
    const lines1 = text1.split("\n");
    const lines2 = text2.split("\n");
    const maxLines = Math.max(lines1.length, lines2.length);
    
    const diff = [];
    for (let i = 0; i < maxLines; i++) {
      const line1 = lines1[i] || "";
      const line2 = lines2[i] || "";
      
      if (line1 === line2) {
        diff.push({ type: "same", content: line1, line: i + 1 });
      } else if (!line1) {
        diff.push({ type: "added", content: line2, line: i + 1 });
      } else if (!line2) {
        diff.push({ type: "removed", content: line1, line: i + 1 });
      } else {
        diff.push({ type: "changed", content1: line1, content2: line2, line: i + 1 });
      }
    }
    return diff;
  };

  const diff = getDiff();

  return (
    <ToolLayout
      title="Text Diff Checker"
      description="Compare two texts and highlight differences"
      category="Text Tools"
      relatedTools={[
        { name: "Word Counter", path: "/tools/word-counter" },
        { name: "Case Converter", path: "/tools/case-converter" },
        { name: "Markdown Preview", path: "/tools/markdown-preview" }
      ]}
    >
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Original Text</label>
            <Textarea
              value={text1}
              onChange={(e) => setText1(e.target.value)}
              className="min-h-[300px] font-mono"
              placeholder="Enter original text..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Modified Text</label>
            <Textarea
              value={text2}
              onChange={(e) => setText2(e.target.value)}
              className="min-h-[300px] font-mono"
              placeholder="Enter modified text..."
            />
          </div>
        </div>

        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Differences</h3>
          <div className="space-y-1 font-mono text-sm">
            {diff.map((item, idx) => (
              <div key={idx}>
                {item.type === "same" && (
                  <div className="text-muted-foreground">
                    <span className="inline-block w-12 text-right mr-4">{item.line}</span>
                    {item.content}
                  </div>
                )}
                {item.type === "removed" && (
                  <div className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-1">
                    <span className="inline-block w-12 text-right mr-4">{item.line}</span>
                    - {item.content}
                  </div>
                )}
                {item.type === "added" && (
                  <div className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-1">
                    <span className="inline-block w-12 text-right mr-4">{item.line}</span>
                    + {item.content}
                  </div>
                )}
                {item.type === "changed" && (
                  <>
                    <div className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-1">
                      <span className="inline-block w-12 text-right mr-4">{item.line}</span>
                      - {item.content1}
                    </div>
                    <div className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-1">
                      <span className="inline-block w-12 text-right mr-4">{item.line}</span>
                      + {item.content2}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </ToolLayout>
  );
};

export default TextDiff;
