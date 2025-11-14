import { useState } from "react";
import { Header } from "@/components/Header";
import { ToolLayout } from "@/components/ToolLayout";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { FileText } from "lucide-react";

const WordCounter = () => {
  const [text, setText] = useState("");

  const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const paragraphs = text.split(/\n+/).filter(p => p.trim().length > 0).length;
  const readingTime = Math.ceil(words / 200);

  return (
    <>
      <Header />
      <ToolLayout
        title="Word Counter"
        description="Count words, characters, sentences, and reading time instantly"
        category="Text Tools"
        instructions={[
          "Type or paste your text in the text area",
          "Statistics update automatically in real-time",
          "Use for essays, articles, social media posts, and more",
        ]}
        relatedTools={[
          { name: "Character Counter", path: "/tools/character-counter" },
          { name: "Text to Speech", path: "/tools/text-to-speech" },
        ]}
      >
        <div className="space-y-6">
          <Card className="p-6">
            <Textarea
              placeholder="Start typing or paste your text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[300px] text-base"
            />
          </Card>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Card className="p-6 text-center">
              <div className="text-4xl font-bold text-primary mb-2">{words}</div>
              <div className="text-sm text-muted-foreground">Words</div>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="text-4xl font-bold text-primary mb-2">{characters}</div>
              <div className="text-sm text-muted-foreground">Characters</div>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="text-4xl font-bold text-primary mb-2">{charactersNoSpaces}</div>
              <div className="text-sm text-muted-foreground">Characters (no spaces)</div>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="text-4xl font-bold text-primary mb-2">{sentences}</div>
              <div className="text-sm text-muted-foreground">Sentences</div>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="text-4xl font-bold text-primary mb-2">{paragraphs}</div>
              <div className="text-sm text-muted-foreground">Paragraphs</div>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="text-4xl font-bold text-primary mb-2">{readingTime}</div>
              <div className="text-sm text-muted-foreground">Min Read Time</div>
            </Card>
          </div>
        </div>
      </ToolLayout>
    </>
  );
};

export default WordCounter;
