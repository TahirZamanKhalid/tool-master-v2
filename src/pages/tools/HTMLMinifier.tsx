import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Minimize2, Copy } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { minifyHTMLBasic } from "@/utils/developerText";

const HTMLMinifier = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const minify = () => {
    if (!input.trim()) {
      toast.error("Please enter HTML");
      return;
    }
    const minified = minifyHTMLBasic(input);
    setOutput(minified);
    const savedBytes = input.length - minified.length;
    toast.success(`Minified! Saved ${savedBytes} bytes`);
  };

  const copy = () => {
    navigator.clipboard.writeText(output);
    toast.success("Copied!");
  };

  return (
    <>
      <SEOHead title="HTML Minifier" description="Minify HTML code to reduce file size" keywords="html minifier, minify html, compress html" canonical="https://toolmaster.cloud/tools/html-minifier" />
      <ToolLayout title="HTML Minifier" description="Compress HTML by removing whitespace and comments" category="Developer Tools">
        <div className="grid md:grid-cols-2 gap-4">
          <Card><CardContent className="p-4 space-y-2"><h3 className="font-semibold">Input HTML</h3><Textarea value={input} onChange={(e) => setInput(e.target.value)} className="min-h-[400px] font-mono text-sm" /><Button onClick={minify} className="w-full"><Minimize2 className="h-4 w-4 mr-2" />Minify</Button></CardContent></Card>
          <Card><CardContent className="p-4 space-y-2"><div className="flex justify-between"><h3 className="font-semibold">Minified</h3><Button onClick={copy} variant="outline" size="sm" disabled={!output}><Copy className="h-4 w-4 mr-2" />Copy</Button></div><Textarea value={output} readOnly className="min-h-[400px] font-mono text-sm" /></CardContent></Card>
        </div>
      </ToolLayout>
    </>
  );
};

export default HTMLMinifier;
