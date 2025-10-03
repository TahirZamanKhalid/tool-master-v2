import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const ASCIIArtGenerator = () => {
  const [text, setText] = useState("");
  const [asciiArt, setAsciiArt] = useState("");

  const generateAscii = () => {
    if (!text) {
      toast.error("Please enter some text");
      return;
    }
    
    // Simple ASCII art generation
    const art = text.split("").map(char => {
      return `
  ___  
 / _ \\ 
| ${char} | 
 \\___/ 
      `;
    }).join("");
    
    setAsciiArt(art);
    toast.success("ASCII art generated!");
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(asciiArt);
    toast.success("Copied to clipboard!");
  };

  return (
    <ToolLayout
      title="ASCII Art Generator"
      description="Convert text to ASCII art"
      category="Text Tools"
    >
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text..."
              className="min-h-[200px] font-mono"
            />
            <Button onClick={generateAscii} className="w-full">
              Generate ASCII Art
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 space-y-4">
            <pre className="min-h-[200px] bg-muted p-4 rounded overflow-auto font-mono text-xs">
              {asciiArt || "ASCII art will appear here..."}
            </pre>
            <Button onClick={copyToClipboard} className="w-full" disabled={!asciiArt}>
              Copy to Clipboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
};

export default ASCIIArtGenerator;
