import { useState } from "react";
import { Header } from "@/components/Header";
import { ToolLayout } from "@/components/ToolLayout";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Copy, Download, FileText } from "lucide-react";
import { useAdRefresh } from "@/hooks/useAdRefresh";

const JSONFormatter = () => {
  const adRefreshKey = useAdRefresh(3);
  const [input, setInput] = useState("");
  const [formatted, setFormatted] = useState("");
  const [error, setError] = useState("");
  const { toast } = useToast();

  const formatJSON = () => {
    try {
      const parsed = JSON.parse(input);
      const beautified = JSON.stringify(parsed, null, 2);
      setFormatted(beautified);
      setError("");
      toast({
        title: "JSON Formatted Successfully",
        description: "Your JSON has been formatted and validated",
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
      setFormatted("");
    }
  };

  const minifyJSON = () => {
    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setFormatted(minified);
      setError("");
      toast({
        title: "JSON Minified Successfully",
        description: "Your JSON has been minified",
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
      setFormatted("");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(formatted);
    toast({
      title: "Copied to Clipboard",
      description: "Formatted JSON copied successfully",
    });
  };

  const downloadJSON = () => {
    const blob = new Blob([formatted], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "formatted.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Header />
      <ToolLayout
        title="JSON Formatter"
        description="Format, validate, and minify JSON data instantly"
        category="Developer Tools"
        adRefreshKey={adRefreshKey}
        instructions={[
          "Paste your JSON data in the input area",
          "Click Format to beautify or Minify to compress",
          "Copy or download the formatted result",
        ]}
        relatedTools={[
          { name: "Base64 Encoder", path: "/tools/base64-encoder" },
          { name: "Color Picker", path: "/tools/color-picker" },
        ]}
      >
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Input JSON</h3>
            <Textarea
              placeholder='{"name": "John", "age": 30}'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[400px] font-mono text-sm"
            />
            <div className="flex gap-3 mt-4">
              <Button onClick={formatJSON} className="flex-1">
                <FileText className="mr-2 h-4 w-4" />
                Format
              </Button>
              <Button onClick={minifyJSON} variant="outline" className="flex-1">
                Minify
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Formatted Output</h3>
              {formatted && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={downloadJSON}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            {error ? (
              <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
                <p className="font-semibold">Error:</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            ) : (
              <Textarea
                value={formatted}
                readOnly
                placeholder="Formatted JSON will appear here..."
                className="min-h-[400px] font-mono text-sm"
              />
            )}
          </Card>
        </div>
      </ToolLayout>
    </>
  );
};

export default JSONFormatter;
