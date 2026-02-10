import { useState, useEffect } from "react";
import { SEOHead } from "@/components/SEOHead";
import { Header } from "@/components/Header";
import { ToolLayout } from "@/components/ToolLayout";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Copy, Download, FileText, Trash2 } from "lucide-react";
import { AdRow } from "@/components/AdRow";
import { AdSpace } from "@/components/AdSpace";

const JSONFormatter = () => {
  const [input, setInput] = useState("");
  const [formatted, setFormatted] = useState("");
  const [error, setError] = useState("");
  const [charCount, setCharCount] = useState(0);
  const { toast } = useToast();

  // Update character count
  useEffect(() => {
    setCharCount(input.length);
  }, [input]);

  const formatJSON = () => {
    if (!input.trim()) {
      toast({
        title: "No Input",
        description: "Please enter JSON data to format",
        variant: "destructive",
      });
      return;
    }

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
    if (!input.trim()) {
      toast({
        title: "No Input",
        description: "Please enter JSON data to minify",
        variant: "destructive",
      });
      return;
    }

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
    if (!formatted) {
      toast({
        title: "Nothing to Copy",
        description: "Please format or minify JSON first",
        variant: "destructive",
      });
      return;
    }

    navigator.clipboard.writeText(formatted);
    toast({
      title: "Copied to Clipboard",
      description: "Formatted JSON copied successfully",
    });
  };

  const downloadJSON = () => {
    if (!formatted) {
      toast({
        title: "Nothing to Download",
        description: "Please format or minify JSON first",
        variant: "destructive",
      });
      return;
    }

    const blob = new Blob([formatted], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "formatted.json";
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Download Started",
      description: "Your JSON file is downloading",
    });
  };

  const clearAll = () => {
    setInput("");
    setFormatted("");
    setError("");
    toast({
      title: "Cleared",
      description: "All fields have been cleared",
    });
  };

  const loadSampleJSON = () => {
    const sample = {
      name: "John Doe",
      age: 30,
      email: "john@example.com",
      address: {
        street: "123 Main St",
        city: "New York",
        country: "USA"
      },
      hobbies: ["reading", "coding", "gaming"],
      isActive: true
    };
    setInput(JSON.stringify(sample));
    toast({
      title: "Sample Loaded",
      description: "Sample JSON has been loaded",
    });
  };

  return (
    <>
      <SEOHead
        title="Online JSON Formatter - Format, Validate & Minify JSON"
        description="Best free online JSON formatter and validator. Beautify, format, validate, and minify JSON data instantly with this powerful developer tool."
        keywords="json formatter, json beautifier, json validator, online json tool, minify json"
        canonical="https://toolmaster.cloud/tools/json-formatter"
      />
      <Header />

      <ToolLayout
        title="JSON Formatter"
        description="Format, validate, and minify JSON data instantly"
        category="Developer Tools"
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
        {/* Main Content Wrapper */}
        <div className="space-y-6">

          {/* Top Ad - Leaderboard (lazy=false because above fold) */}
          <div className="w-full" style={{ minWidth: "300px" }}>
            <AdSpace
              size="leaderboard"
              lazy={false}
              className="mx-auto"
            />
          </div>

          {/* Main Tool Area */}
          <div className="grid lg:grid-cols-2 gap-6">

            {/* Input Card */}
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Input JSON</h3>
                <span className="text-xs text-muted-foreground">
                  {charCount} characters
                </span>
              </div>

              <Textarea
                placeholder='{"name": "John", "age": 30}'
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[400px] font-mono text-sm"
              />

              <div className="flex flex-wrap gap-3 mt-4">
                <Button onClick={formatJSON} className="flex-1 min-w-[120px]">
                  <FileText className="mr-2 h-4 w-4" />
                  Format
                </Button>
                <Button
                  onClick={minifyJSON}
                  variant="outline"
                  className="flex-1 min-w-[120px]"
                >
                  Minify
                </Button>
                <Button
                  onClick={clearAll}
                  variant="ghost"
                  size="icon"
                  title="Clear all"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <Button
                onClick={loadSampleJSON}
                variant="link"
                className="mt-2 p-0 h-auto text-xs"
              >
                Load sample JSON
              </Button>
            </Card>

            {/* Output Card */}
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Formatted Output</h3>
                {formatted && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={copyToClipboard}
                      title="Copy to clipboard"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={downloadJSON}
                      title="Download JSON"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {error ? (
                <div className="p-4 bg-destructive/10 text-destructive rounded-lg min-h-[400px]">
                  <p className="font-semibold">Error:</p>
                  <p className="text-sm mt-1 font-mono">{error}</p>
                  <p className="text-xs mt-4 opacity-70">
                    Tip: Check for missing commas, brackets, or quotes
                  </p>
                </div>
              ) : (
                <Textarea
                  value={formatted}
                  readOnly
                  placeholder="Formatted JSON will appear here..."
                  className="min-h-[400px] font-mono text-sm"
                />
              )}

              {formatted && (
                <div className="mt-4 text-xs text-muted-foreground">
                  Output: {formatted.length} characters
                </div>
              )}
            </Card>
          </div>

          {/* Middle Ad - Only visible on mobile between cards */}
          <div className="lg:hidden w-full" style={{ minWidth: "300px" }}>
            <AdRow
              slot="2931558314"
              format="auto"
              lazy={true}
            />
          </div>

          {/* Bottom Ad - Multiplex/Related Content */}
          <div className="w-full mt-8" style={{ minWidth: "300px" }}>
            <AdRow
              slot="2931558314"
              format="auto"
              lazy={true}
              className="mx-auto"
            />
          </div>

        </div>
      </ToolLayout>

      {/* Footer Ad - Outside ToolLayout but with proper wrapper */}
      <div
        className="w-full px-4 py-8 max-w-7xl mx-auto"
        style={{ minWidth: "300px" }}
      >
        <AdSpace
          size="leaderboard"
          lazy={true}
          className="mx-auto"
        />
      </div>
    </>
  );
};

export default JSONFormatter;