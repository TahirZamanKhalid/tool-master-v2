import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Copy, Minimize2 } from "lucide-react";
import { toast } from "sonner";

const CSSMinifier = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [stats, setStats] = useState({ original: 0, minified: 0, saved: 0 });

  const minifyCSS = (css: string): string => {
    return css
      // Remove comments
      .replace(/\/\*[\s\S]*?\*\//g, "")
      // Remove whitespace around selectors, braces, colons, and semicolons
      .replace(/\s*([{}:;,])\s*/g, "$1")
      // Remove unnecessary semicolons before closing braces
      .replace(/;}/g, "}")
      // Remove whitespace at the beginning and end
      .trim()
      // Replace multiple spaces with single space
      .replace(/\s+/g, " ")
      // Remove spaces around combinators
      .replace(/\s*([>+~])\s*/g, "$1");
  };

  const handleMinify = () => {
    if (!input.trim()) {
      toast.error("Please enter CSS code to minify");
      return;
    }

    try {
      const minified = minifyCSS(input);
      setOutput(minified);

      const originalSize = new Blob([input]).size;
      const minifiedSize = new Blob([minified]).size;
      const savedPercent = ((originalSize - minifiedSize) / originalSize * 100).toFixed(2);

      setStats({
        original: originalSize,
        minified: minifiedSize,
        saved: parseFloat(savedPercent),
      });

      toast.success("CSS minified successfully");
    } catch (error) {
      toast.error("Error minifying CSS");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    toast.success("Minified CSS copied to clipboard");
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
      title="CSS Minifier"
      description="Minify CSS code to reduce file size and improve load times"
      category="Developer Tools"
      instructions={[
        "Paste your CSS code in the input area",
        "Click 'Minify CSS' to compress the code",
        "View the size reduction statistics",
        "Copy the minified CSS for use in your project",
      ]}
      relatedTools={[
        { name: "Code Beautifier", path: "/tools/code-beautifier" },
        { name: "JSON Formatter", path: "/tools/json-formatter" },
        { name: "HTML Encoder", path: "/tools/html-encoder" },
      ]}
    >
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-base font-semibold">CSS Input</Label>
              <Button onClick={handleMinify} disabled={!input.trim()}>
                <Minimize2 className="h-4 w-4 mr-2" />
                Minify CSS
              </Button>
            </div>
            <Textarea
              placeholder="/* Enter your CSS code here */&#10;.container {&#10;  display: flex;&#10;  justify-content: center;&#10;  align-items: center;&#10;}"
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

export default CSSMinifier;
