import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Minimize2, Copy } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { getSizeStats } from "@/utils/developerText";

const JSONMinifier = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const minify = () => {
    if (!input.trim()) {
      toast.error("Please enter JSON");
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      const stats = getSizeStats(input, minified);
      const savedBytes = stats.original - stats.minified;
      toast.success(`Minified! Saved ${savedBytes} bytes (${stats.saved.toFixed(1)}%)`);
    } catch (error) {
      toast.error("Invalid JSON");
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard");
  };

  return (
    <>
      <SEOHead
        title="JSON Minifier"
        description="Minify and compress JSON data to reduce file size and improve performance"
        keywords="json minifier, minify json, compress json, json optimizer"
        canonical="https://toolmaster.cloud/tools/json-minifier"
      />
      <ToolLayout
        title="JSON Minifier"
        description="Compress JSON by removing whitespace"
        category="Developer Tools"
      >
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 space-y-2">
              <h3 className="font-semibold">Input JSON</h3>
              <Textarea value={input} onChange={(e) => setInput(e.target.value)} className="min-h-[400px] font-mono text-sm" placeholder='{"key": "value"}' />
              <Button onClick={minify} className="w-full"><Minimize2 className="h-4 w-4 mr-2" />Minify</Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between"><h3 className="font-semibold">Minified JSON</h3><Button onClick={copy} variant="outline" size="sm" disabled={!output}><Copy className="h-4 w-4 mr-2" />Copy</Button></div>
              <Textarea value={output} readOnly className="min-h-[400px] font-mono text-sm" />
            </CardContent>
          </Card>
        </div>
      </ToolLayout>
    </>
  );
};

export default JSONMinifier;
