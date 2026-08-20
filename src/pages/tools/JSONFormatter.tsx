import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { ToolLayout } from "@/components/ToolLayout";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Copy, Download, FileText } from "lucide-react";
import { AdRow } from "@/components/AdRow";
import { AdSpace } from "@/components/AdSpace";

const JSONFormatter = () => {
  const [input, setInput] = useState("");
  const [formatted, setFormatted] = useState("");
  const [error, setError] = useState("");
  const { toast } = useToast();


  const formatJSON = () => {
    if (!input.trim()) {
      toast({
        title: "No Input",
        description: "Please enter JSON data to format",
        variant: "destructive"
      });
      return;
    }

    try {
      const parsed = JSON.parse(input);
      setFormatted(JSON.stringify(parsed, null, 2));
      setError("");
      toast({
        title: "JSON Formatted Successfully",
        description: "Your JSON has been beautified"
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
      setFormatted("");
      toast({
        title: "Invalid JSON",
        description: e instanceof Error ? e.message : "Please check your JSON syntax",
        variant: "destructive"
      });
    }
  };

  const minifyJSON = () => {
    if (!input.trim()) {
      toast({
        title: "No Input",
        description: "Please enter JSON data to minify",
        variant: "destructive"
      });
      return;
    }

    try {
      const parsed = JSON.parse(input);
      setFormatted(JSON.stringify(parsed));
      setError("");
      toast({
        title: "JSON Minified Successfully",
        description: "Your JSON has been compressed"
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
      setFormatted("");
      toast({
        title: "Invalid JSON",
        description: e instanceof Error ? e.message : "Please check your JSON syntax",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = () => {
    if (!formatted) {
      toast({
        title: "Nothing to Copy",
        description: "Please format or minify JSON first",
        variant: "destructive"
      });
      return;
    }

    navigator.clipboard.writeText(formatted);
    toast({
      title: "Copied to Clipboard",
      description: "Formatted JSON copied successfully"
    });
  };

  const downloadJSON = () => {
    if (!formatted) {
      toast({
        title: "Nothing to Download",
        description: "Please format or minify JSON first",
        variant: "destructive"
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
      description: "Your JSON file is downloading"
    });
  };

  return (
    <>
      <SEOHead
        title="Online JSON Formatter - Format, Validate & Minify JSON"
        description="Best free online JSON formatter and validator. Beautify, format, validate, and minify JSON data instantly with this powerful developer tool."
        keywords="json formatter, json beautifier, json validator, online json tool, minify json, validate json"
        canonical="https://toolmaster.cloud/tools/json-formatter"
      />

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
        {/* Main container with guaranteed width */}
        <div className="w-full space-y-6" style={{ minWidth: '300px' }}>

          {/* Top Ad - Display Ad (leaderboard) - Above the fold */}
          <div className="w-full" style={{ minWidth: '300px', display: 'block' }}>
            <AdSpace size="leaderboard" lazy={false} />
          </div>

          {/* Tool UI */}
          <div className="grid lg:grid-cols-2 gap-6 w-full">
            {/* Input Card */}
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
                      title="Download as JSON file"
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

          {/* Bottom Ad - Multiplex Ad - Below the fold */}
          <div className="w-full" style={{ minWidth: '300px', display: 'block' }}>
            <AdRow
              slot="2931558314"
              isMultiplex={true}
              lazy={true}
            />
          </div>
          {/* Related Articles & Guides — internal link for SEO */}
          <section className="mt-12 mb-8 w-full max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-foreground">Related Articles & Guides</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <RouterLink
                to="/blog/best-free-online-json-formatter"
                className="p-4 border border-border/60 rounded-lg bg-card/80 shadow-sm hover:shadow-card-hover transition-shadow no-underline block"
              >
                <span className="text-primary font-semibold hover:underline text-lg block">
                  Best Free Online JSON Formatter & Validator
                </span>
                <p className="text-muted-foreground mt-2 text-sm">
                  Format, validate, and beautify your JSON data instantly in your browser.
                </p>
              </RouterLink>
            </div>
          </section>
        </div>
      </ToolLayout>
    </>
  );
};

export default JSONFormatter;
