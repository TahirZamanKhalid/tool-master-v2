import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { AdSpace } from "@/components/AdSpace";
import { normalizeYAML } from "@/utils/developerText";

const YAMLFormatter = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const formatYAML = () => {
    if (!input.trim()) {
      toast.error("Please enter YAML data");
      return;
    }

    try {
      const formatted = normalizeYAML(input);
      if (!formatted) {
        toast.error("Please enter YAML data");
        return;
      }
      setOutput(formatted);
      toast.success("YAML formatted!");
    } catch {
      toast.error("Invalid YAML format");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard!");
  };

  return (
    <ToolLayout
      title="YAML Formatter"
      description="Format and validate YAML files"
      category="Developer Tools"
    >
      <AdSpace size="leaderboard" className="mb-6" />
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="key: value&#10;nested:&#10;  item: data"
              className="min-h-[300px] font-mono text-sm"
            />
            <Button onClick={formatYAML} className="w-full">
              Format YAML
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 space-y-4">
            <Textarea
              value={output}
              readOnly
              placeholder="Formatted YAML will appear here..."
              className="min-h-[300px] font-mono text-sm bg-muted"
            />
            <Button onClick={copyToClipboard} className="w-full" disabled={!output}>
              Copy to Clipboard
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Related Articles & Guides — internal link for SEO */}
      <section className="mt-12 mb-8 w-full max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-foreground">Related Articles & Guides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <RouterLink
            to="/blog/free-online-yaml-formatter"
            className="p-4 border border-border/60 rounded-lg bg-card/80 shadow-sm hover:shadow-card-hover transition-shadow no-underline block"
          >
            <span className="text-primary font-semibold hover:underline text-lg block">
              Free Online YAML Formatter & Beautifier
            </span>
            <p className="text-muted-foreground mt-2 text-sm">
              Format and validate YAML files instantly for your CI/CD pipelines and Kubernetes configs.
            </p>
          </RouterLink>
        </div>
      </section>
    </ToolLayout>
  );
};

export default YAMLFormatter;
