import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Code, Copy } from "lucide-react";

const CodeBeautifier = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState<"json" | "html" | "css">("json");

  const beautifyJSON = (code: string) => {
    try {
      const parsed = JSON.parse(code);
      return JSON.stringify(parsed, null, 2);
    } catch {
      throw new Error("Invalid JSON");
    }
  };

  const beautifyHTML = (code: string) => {
    let formatted = code;
    let indent = 0;
    const lines: string[] = [];
    
    formatted = formatted.replace(/>\s*</g, '><');
    const tags = formatted.split('<');
    
    tags.forEach(tag => {
      if (!tag) return;
      
      if (tag.startsWith('/')) {
        indent--;
      }
      
      lines.push('  '.repeat(Math.max(0, indent)) + '<' + tag);
      
      if (!tag.startsWith('/') && !tag.endsWith('/') && !tag.match(/^(br|hr|img|input|meta|link)/)) {
        indent++;
      }
    });
    
    return lines.join('\n').trim();
  };

  const beautifyCSS = (code: string) => {
    let formatted = code;
    formatted = formatted.replace(/\s*{\s*/g, ' {\n  ');
    formatted = formatted.replace(/\s*}\s*/g, '\n}\n');
    formatted = formatted.replace(/\s*;\s*/g, ';\n  ');
    formatted = formatted.replace(/\n\s*\n/g, '\n');
    return formatted.trim();
  };

  const handleBeautify = () => {
    if (!input.trim()) {
      toast.error("Please enter some code");
      return;
    }

    try {
      let result = "";
      if (language === "json") {
        result = beautifyJSON(input);
      } else if (language === "html") {
        result = beautifyHTML(input);
      } else {
        result = beautifyCSS(input);
      }
      setOutput(result);
      toast.success("Code beautified!");
    } catch (error) {
      toast.error((error as Error).message || "Invalid code format");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard!");
  };

  return (
    <ToolLayout
      title="Code Beautifier"
      description="Format and beautify JSON, HTML, and CSS code"
      category="Developer Tools"
      relatedTools={[
        { name: "JSON Formatter", path: "/tools/json-formatter" },
        { name: "HTML Encoder", path: "/tools/html-encoder" },
        { name: "Markdown Preview", path: "/tools/markdown-preview" }
      ]}
    >
      <div className="space-y-6">
        <div>
          <Label>Language</Label>
          <RadioGroup value={language} onValueChange={(v) => setLanguage(v as typeof language)} className="flex gap-4 mt-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="json" id="json" />
              <Label htmlFor="json" className="cursor-pointer">JSON</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="html" id="html" />
              <Label htmlFor="html" className="cursor-pointer">HTML</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="css" id="css" />
              <Label htmlFor="css" className="cursor-pointer">CSS</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label htmlFor="input">Input Code</Label>
          <Textarea
            id="input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[300px] font-mono mt-2"
            placeholder={`Enter ${language.toUpperCase()} code...`}
          />
        </div>

        <Button onClick={handleBeautify} className="w-full">
          Beautify Code
        </Button>

        {output && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Beautified Output</Label>
              <Button onClick={copyToClipboard} variant="outline" size="sm">
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
            <Textarea
              value={output}
              readOnly
              className="min-h-[300px] font-mono"
            />
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default CodeBeautifier;
