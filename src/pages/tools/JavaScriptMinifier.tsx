import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Copy, Minimize2 } from "lucide-react";
import { toast } from "sonner";

const JavaScriptMinifier = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [stats, setStats] = useState({ original: 0, minified: 0, saved: 0 });

  const minifyJS = (js: string): string => {
    return js
      // Remove single-line comments
      .replace(/\/\/.*$/gm, "")
      // Remove multi-line comments
      .replace(/\/\*[\s\S]*?\*\//g, "")
      // Remove whitespace at the beginning and end of lines
      .replace(/^\s+|\s+$/gm, "")
      // Remove line breaks
      .replace(/\n/g, "")
      // Remove extra spaces
      .replace(/\s+/g, " ")
      // Remove spaces around operators and punctuation
      .replace(/\s*([=+\-*/<>!&|%^~?:,;{}()\[\]])\s*/g, "$1")
      // Add back space after keywords
      .replace(/(return|var|let|const|if|else|for|while|function|class|new)\(/g, "$1 (")
      .trim();
  };

  const handleMinify = () => {
    if (!input.trim()) {
      toast.error("Please enter JavaScript code to minify");
      return;
    }

    try {
      const minified = minifyJS(input);
      setOutput(minified);

      const originalSize = new Blob([input]).size;
      const minifiedSize = new Blob([minified]).size;
      const savedPercent = ((originalSize - minifiedSize) / originalSize * 100).toFixed(2);

      setStats({
        original: originalSize,
        minified: minifiedSize,
        saved: parseFloat(savedPercent),
      });

      toast.success("JavaScript minified successfully");
    } catch (error) {
      toast.error("Error minifying JavaScript");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    toast.success("Minified JavaScript copied to clipboard");
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <ToolLayout
      title="JavaScript Minifier"
      description="Minify JavaScript code to reduce file size and improve performance"
      category="Developer Tools"
      instructions={[
        "Paste your JavaScript code in the input area",
        "Click 'Minify JavaScript' to compress the code",
        "View the size reduction statistics",
        "Copy the minified JavaScript for production use",
      ]}
      relatedTools={[
        { name: "CSS Minifier", path: "/tools/css-minifier" },
        { name: "Code Beautifier", path: "/tools/code-beautifier" },
        { name: "JSON Formatter", path: "/tools/json-formatter" },
      ]}
    >
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-base font-semibold">JavaScript Input</Label>
              <Button onClick={handleMinify} disabled={!input.trim()}>
                <Minimize2 className="h-4 w-4 mr-2" />
                Minify JavaScript
              </Button>
            </div>
            <Textarea
              placeholder="// Enter your JavaScript code here&#10;function greet(name) {&#10;  return 'Hello, ' + name + '!';&#10;}"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="font-mono text-sm min-h-[250px]"
            />
          </CardContent>
        </Card>

        {output && (
          <>
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Original Size</p>
                    <p className="text-2xl font-bold">{formatBytes(stats.original)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Minified Size</p>
                    <p className="text-2xl font-bold">{formatBytes(stats.minified)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Saved</p>
                    <p className="text-2xl font-bold text-green-600">{stats.saved}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-base font-semibold">Minified Output</Label>
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-sm font-mono whitespace-pre-wrap break-all">{output}</pre>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </ToolLayout>
  );
};

export default JavaScriptMinifier;
