import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AdRow } from "@/components/AdRow";
import { toast } from "sonner";
import { caesarShift } from "@/utils/textTools";
import { Copy } from "lucide-react";

const CaesarCipher = () => {
  const [text, setText] = useState("");
  const [shift, setShift] = useState(3);
  const [result, setResult] = useState("");

  const runCipher = (direction: 1 | -1) => {
    if (!text) {
      toast.error("Please enter text");
      return;
    }
    setResult(caesarShift(text, shift * direction));
  };

  const encrypt = () => runCipher(1);
  const decrypt = () => runCipher(-1);
  const copyResult = () => {
    navigator.clipboard.writeText(result);
    toast.success("Copied to clipboard");
  };

  return (
    <ToolLayout
      title="Caesar Cipher"
      description="Encrypt and decrypt text using Caesar cipher"
      category="Text Tools"
    >
      <AdRow className="mb-6" />
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <Label>Shift Value</Label>
            <Input
              type="number"
              value={shift}
              onChange={(e) => setShift(parseInt(e.target.value) || 0)}
            />
          </div>
          <Textarea
            placeholder="Enter text..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
          />
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={encrypt}>Encrypt</Button>
            <Button onClick={decrypt} variant="outline">Decrypt</Button>
          </div>
          {result && (
            <>
              <Textarea value={result} readOnly rows={4} />
              <Button onClick={copyResult} variant="outline" className="w-full">
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </>
          )}
        </CardContent>
      </Card>
      <AdRow className="mt-6" />
    </ToolLayout>
  );
};

export default CaesarCipher;
