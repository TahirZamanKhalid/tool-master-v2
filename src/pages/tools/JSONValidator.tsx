import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Code } from "lucide-react";

const JSONValidator = () => {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<{ valid: boolean; message: string } | null>(null);
  const { toast } = useToast();

  const validate = () => {
    if (!input.trim()) {
      toast({ description: "Please enter JSON to validate.", variant: "destructive" });
      return;
    }
    try {
      JSON.parse(input);
      setResult({ valid: true, message: "Valid JSON!" });
    } catch (error: unknown) {
      setResult({ valid: false, message: error instanceof Error ? error.message : "Invalid JSON" });
    }
  };

  const formatJSON = () => {
    try {
      const parsed = JSON.parse(input);
      setInput(JSON.stringify(parsed, null, 2));
      setResult({ valid: true, message: "JSON formatted successfully!" });
    } catch {
      toast({ description: "Cannot format invalid JSON.", variant: "destructive" });
    }
  };

  const minifyJSON = () => {
    try {
      const parsed = JSON.parse(input);
      setInput(JSON.stringify(parsed));
      setResult({ valid: true, message: "JSON minified successfully!" });
    } catch {
      toast({ description: "Cannot minify invalid JSON.", variant: "destructive" });
    }
  };

  return (
    <ToolLayout
      title="JSON Validator"
      description="Validate, format, and minify JSON instantly. Free online JSON validator and formatter."
      category="Developer Tools"
      instructions={[
        "Paste your JSON in the text area",
        "Click Validate to check for errors",
        "Use Format to pretty-print or Minify to compress",
      ]}
    >
      <div className="space-y-4">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='{"example": "Paste your JSON here..."}'
          className="rounded-xl font-mono text-sm min-h-[240px]"
        />

        <div className="flex flex-wrap gap-2">
          <Button onClick={validate} className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold">
            <Code className="mr-2 h-4 w-4" /> Validate JSON
          </Button>
          <Button variant="outline" onClick={formatJSON} className="rounded-xl">
            Format
          </Button>
          <Button variant="outline" onClick={minifyJSON} className="rounded-xl">
            Minify
          </Button>
        </div>

        {result && (
          <div className={`flex items-start gap-3 p-4 rounded-xl border ${result.valid ? "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400" : "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400"}`}>
            {result.valid ? <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" /> : <XCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />}
            <p className="text-sm font-mono">{result.message}</p>
          </div>
        )}
      </div>

      {/* Related Articles & Guides — internal link for SEO */}
      <section className="mt-12 mb-8 w-full max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-foreground">Related Articles & Guides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <RouterLink
            to="/blog/free-online-json-validator"
            className="p-4 border border-border/60 rounded-lg bg-card/80 shadow-sm hover:shadow-card-hover transition-shadow no-underline block"
          >
            <span className="text-primary font-semibold hover:underline text-lg block">
              Free Online JSON Validator & Syntax Checker
            </span>
            <p className="text-muted-foreground mt-2 text-sm">
              Validate your JSON syntax instantly and catch trailing commas and structural errors.
            </p>
          </RouterLink>
        </div>
      </section>
    </ToolLayout>
  );
};

export default JSONValidator;
