import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { AdRow } from "@/components/AdRow";

const CharacterFrequency = () => {
  const [text, setText] = useState("");

  const getFrequency = () => {
    const freq: Record<string, number> = {};
    for (const char of text) {
      if (char !== " ") {
        freq[char] = (freq[char] || 0) + 1;
      }
    }
    return Object.entries(freq).sort((a, b) => b[1] - a[1]);
  };

  const frequency = getFrequency();

  return (
    <ToolLayout
      title="Character Frequency Counter"
      description="Count character occurrences in text"
      category="Text Tools"
    >
      <AdRow className="mb-6" />
      <Card>
        <CardContent className="p-6 space-y-4">
          <Textarea
            placeholder="Enter text to analyze..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
          />
          {frequency.length > 0 && (
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-2 text-left">Character</th>
                    <th className="p-2 text-right">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {frequency.map(([char, count]) => (
                    <tr key={char} className="border-b">
                      <td className="p-2 font-mono">{char}</td>
                      <td className="p-2 text-right">{count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      <AdRow className="mt-6" />
    </ToolLayout>
  );
};

export default CharacterFrequency;
