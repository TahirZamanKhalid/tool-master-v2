import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { AdSpace } from "@/components/AdSpace";

const TextStatistics = () => {
  const [text, setText] = useState("");

  const getStats = () => {
    const words = text.trim().split(/\s+/).filter(w => w);
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    const avgWordLength = words.length ? 
      words.reduce((sum, word) => sum + word.length, 0) / words.length : 0;
    
    return {
      totalWords: words.length,
      uniqueWords: uniqueWords.size,
      avgWordLength: avgWordLength.toFixed(2),
      longestWord: words.reduce((a, b) => a.length > b.length ? a : b, ""),
      shortestWord: words.reduce((a, b) => a.length < b.length && a.length > 0 ? a : b, words[0] || ""),
    };
  };

  const stats = getStats();

  return (
    <ToolLayout
      title="Text Statistics"
      description="Detailed statistical analysis of text"
      category="Text Tools"
    >
      <AdSpace size="leaderboard" className="mb-6" />
      <Card>
        <CardContent className="p-6 space-y-4">
          <Textarea
            placeholder="Enter text to analyze..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted rounded">
              <p className="text-sm text-muted-foreground">Total Words</p>
              <p className="text-2xl font-bold text-primary">{stats.totalWords}</p>
            </div>
            <div className="p-4 bg-muted rounded">
              <p className="text-sm text-muted-foreground">Unique Words</p>
              <p className="text-2xl font-bold text-primary">{stats.uniqueWords}</p>
            </div>
            <div className="p-4 bg-muted rounded">
              <p className="text-sm text-muted-foreground">Avg Word Length</p>
              <p className="text-2xl font-bold text-primary">{stats.avgWordLength}</p>
            </div>
            <div className="p-4 bg-muted rounded">
              <p className="text-sm text-muted-foreground">Longest Word</p>
              <p className="text-lg font-bold text-primary truncate">{stats.longestWord}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </ToolLayout>
  );
};

export default TextStatistics;
