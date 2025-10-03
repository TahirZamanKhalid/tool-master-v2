import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Code2, Copy } from "lucide-react";

const HTMLEncoder = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");

  const encodeHTML = (str: string) => {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const decodeHTML = (str: string) => {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = str;
    return textarea.value;
  };

  const handleConvert = () => {
    if (!input.trim()) {
      toast.error("Please enter some text");
      return;
    }

    const result = mode === "encode" ? encodeHTML(input) : decodeHTML(input);
    setOutput(result);
    toast.success(`HTML ${mode}d successfully!`);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard!");
  };

  return (
    <ToolLayout
      title="HTML Encoder/Decoder"
      description="Encode or decode HTML entities"
      category="Developer Tools"
      relatedTools={[
        { name: "URL Encoder", path: "/tools/url-encoder" },
        { name: "Base64 Encoder", path: "/tools/base64-encoder" },
        { name: "Markdown Preview", path: "/tools/markdown-preview" }
      ]}
    >
      <div className="space-y-6">
        <div className="flex gap-4">
          <Button
            onClick={() => setMode("encode")}
            variant={mode === "encode" ? "default" : "outline"}
          >
            Encode
          </Button>
          <Button
            onClick={() => setMode("decode")}
            variant={mode === "decode" ? "default" : "outline"}
          >
            Decode
          </Button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Input</label>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[200px] font-mono"
            placeholder={mode === "encode" ? '<div class="example">Hello</div>' : '&lt;div class=&quot;example&quot;&gt;Hello&lt;/div&gt;'}
          />
        </div>

        <Button onClick={handleConvert} className="w-full">
          {mode === "encode" ? "Encode HTML" : "Decode HTML"}
        </Button>

        {output && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">Output</label>
              <Button onClick={copyToClipboard} variant="outline" size="sm">
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
            <Textarea
              value={output}
              readOnly
              className="min-h-[200px] font-mono"
            />
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default HTMLEncoder;
