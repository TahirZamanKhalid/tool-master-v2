import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { AdSpace } from "@/components/AdSpace";
import { formatXMLString } from "@/utils/developerText";

const XMLFormatter = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const formatXML = () => {
    if (!input.trim()) {
      toast.error("Please enter XML data");
      return;
    }

    try {
      setOutput(formatXMLString(input));
      toast.success("XML formatted successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Invalid XML format");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard!");
  };

  return (
    <ToolLayout
      title="XML Formatter"
      description="Format and beautify XML code"
      category="Developer Tools"
    >
      <AdSpace size="leaderboard" className="mb-6" />
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="<root><item>value</item></root>"
              className="min-h-[300px] font-mono text-sm"
            />
            <Button onClick={formatXML} className="w-full">
              Format XML
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 space-y-4">
            <Textarea
              value={output}
              readOnly
              placeholder="Formatted XML will appear here..."
              className="min-h-[300px] font-mono text-sm bg-muted"
            />
            <Button onClick={copyToClipboard} className="w-full" disabled={!output}>
              Copy to Clipboard
            </Button>
          </CardContent>
        </Card>
        {/* Related Articles & Guides — internal link for SEO */}
        <section className="mt-12 mb-8 w-full max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-foreground">Related Articles & Guides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <RouterLink
              to="/blog/best-free-online-xml-formatter"
              className="p-4 border border-border/60 rounded-lg bg-card/80 shadow-sm hover:shadow-card-hover transition-shadow no-underline block"
            >
              <span className="text-primary font-semibold hover:underline text-lg block">
                Best Free Online XML Formatter & Beautifier
              </span>
              <p className="text-muted-foreground mt-2 text-sm">
                Format, validate, and beautify messy XML data instantly in your browser.
              </p>
            </RouterLink>
          </div>
        </section>
      </div>
    </ToolLayout>
  );
};

export default XMLFormatter;
