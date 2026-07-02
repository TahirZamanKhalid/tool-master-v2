import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AdSpace } from "@/components/AdSpace";
import { toast } from "sonner";
import { Copy } from "lucide-react";
import { decodeHtmlEntities, encodeHtmlEntities } from "@/utils/textTools";

const HTMLEntityEncoder = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const encode = () => {
    if (!input) {
      toast.error("Please enter text");
      return;
    }
    setOutput(encodeHtmlEntities(input));
  };

  const decode = () => {
    if (!input) {
      toast.error("Please enter text");
      return;
    }
    setOutput(decodeHtmlEntities(input));
  };

  const copy = () => {
    navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard");
  };

  return (
    <ToolLayout
      title="HTML Entity Encoder/Decoder"
      description="Encode and decode HTML entities"
      category="Text Tools"
    >
      <AdSpace size="leaderboard" className="mb-6" />
      <Card>
        <CardContent className="p-6 space-y-4">
          <Textarea
            placeholder="Enter text..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={6}
          />
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={encode}>Encode</Button>
            <Button onClick={decode} variant="outline">Decode</Button>
          </div>
          {output && (
            <>
              <Textarea value={output} readOnly rows={6} />
              <Button onClick={copy} variant="outline" className="w-full">
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </ToolLayout>
  );
};

export default HTMLEntityEncoder;
