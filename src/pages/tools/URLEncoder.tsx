import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Copy, Link } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const URLEncoder = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const { toast } = useToast();

  const handleEncode = () => {
    try {
      const encoded = encodeURIComponent(input);
      setOutput(encoded);
      toast({
        title: "Encoded successfully",
        description: "Your URL has been encoded",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to encode URL",
        variant: "destructive",
      });
    }
  };

  const handleDecode = () => {
    try {
      const decoded = decodeURIComponent(input);
      setOutput(decoded);
      toast({
        title: "Decoded successfully",
        description: "Your URL has been decoded",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to decode URL",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    toast({
      title: "Copied!",
      description: "Result copied to clipboard",
    });
  };

  return (
    <ToolLayout
      title="URL Encoder/Decoder"
      description="Encode or decode URLs for safe transmission"
      category="Developer Tools"
      instructions={[
        "Enter or paste your URL or text",
        "Click 'Encode' to make it URL-safe or 'Decode' to reverse",
        "Copy the result to use in your projects"
      ]}
      relatedTools={[
        { name: "Base64 Encoder", path: "/tools/base64-encoder" },
        { name: "JSON Formatter", path: "/tools/json-formatter" },
        { name: "Hash Generator", path: "/tools/hash-generator" },
      ]}
    >
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <Label htmlFor="input" className="text-base mb-2 block">Input</Label>
            <Textarea
              id="input"
              placeholder="Enter text or URL to encode/decode..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
            />
            <div className="flex gap-3 mt-4">
              <Button 
                onClick={handleEncode}
                disabled={!input}
                className="flex-1"
              >
                <Link className="mr-2 h-4 w-4" />
                Encode URL
              </Button>
              <Button 
                onClick={handleDecode}
                disabled={!input}
                variant="outline"
                className="flex-1"
              >
                Decode URL
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="output" className="text-base">Output</Label>
              {output && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyToClipboard}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              )}
            </div>
            <Textarea
              id="output"
              value={output}
              readOnly
              placeholder="Result will appear here..."
              className="min-h-[300px] font-mono text-sm bg-muted/50"
            />
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
};

export default URLEncoder;
