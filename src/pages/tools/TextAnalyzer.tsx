import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { AdSpace } from "@/components/AdSpace";

const TextAnalyzer = () => {
  const [text, setText] = useState("");

  const stats = {
    characters: text.length,
    charactersNoSpaces: text.replace(/\s/g, "").length,
    words: text.trim() ? text.trim().split(/\s+/).length : 0,
    sentences: text.split(/[.!?]+/).filter(s => s.trim()).length,
    paragraphs: text.split(/\n\n+/).filter(p => p.trim()).length,
    readingTime: Math.ceil((text.trim().split(/\s+/).length || 0) / 200),
  };

  return (
    <ToolLayout
      title="Text Analyzer"
      description="Analyze text statistics including word count, character count, and reading time"
      category="Text Tools"
    >
      <AdSpace className="mb-6" />
      <Card>
        <CardContent className="p-6 space-y-4">
          <Textarea
            placeholder="Paste or type your text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
          />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Characters</p>
              <p className="text-2xl font-bold text-primary">{stats.characters}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">No Spaces</p>
              <p className="text-2xl font-bold text-primary">{stats.charactersNoSpaces}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Words</p>
              <p className="text-2xl font-bold text-primary">{stats.words}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Sentences</p>
              <p className="text-2xl font-bold text-primary">{stats.sentences}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Paragraphs</p>
              <p className="text-2xl font-bold text-primary">{stats.paragraphs}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Reading Time</p>
              <p className="text-2xl font-bold text-primary">{stats.readingTime} min</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </ToolLayout>
  );
};

export default TextAnalyzer;
