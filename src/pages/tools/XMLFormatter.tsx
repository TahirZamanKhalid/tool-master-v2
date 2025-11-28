import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { AdSpace } from "@/components/AdSpace";

const XMLFormatter = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const formatXML = () => {
    if (!input.trim()) {
      toast.error("Please enter XML data");
      return;
    }

    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(input, "text/xml");
      const serializer = new XMLSerializer();
      const formatted = serializer.serializeToString(xmlDoc);
      
      // Basic indentation
      const indented = formatted.replace(/></g, ">\n<");
      setOutput(indented);
      toast.success("XML formatted successfully!");
    } catch (error) {
      toast.error("Invalid XML format");
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
      <AdSpace className="mb-6" />
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
      </div>
    </ToolLayout>
  );
};

export default XMLFormatter;
