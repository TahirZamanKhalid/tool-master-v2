import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Copy, Minimize2 } from "lucide-react";
import { toast } from "sonner";
import { formatBytes, getSizeStats } from "@/utils/developerText";

const JavaScriptMinifier = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [stats, setStats] = useState({ original: 0, minified: 0, saved: 0 });

  const handleMinify = async () => {
    if (!input.trim()) {
      toast.error("Please enter JavaScript code to minify");
      return;
    }

    try {
      const { minify } = await import("terser");
      const result = await minify(input, {
        compress: true,
        mangle: true,
        format: { comments: false },
      });
      const minified = result.code || "";
      if (!minified) {
        throw new Error("No output was generated");
      }
      setOutput(minified);
      setStats(getSizeStats(input, minified));

      toast.success("JavaScript minified successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error minifying JavaScript");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    toast.success("Minified JavaScript copied to clipboard");
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
