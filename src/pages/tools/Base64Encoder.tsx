import { useState } from "react";
import { Header } from "@/components/Header";
import { ToolLayout } from "@/components/ToolLayout";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Copy, ArrowDown, ArrowUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdWatchModal } from "@/components/AdWatchModal";

const Base64Encoder = () => {
  const [textInput, setTextInput] = useState("");
  const [encodedOutput, setEncodedOutput] = useState("");
  const [decodedOutput, setDecodedOutput] = useState("");
  const [encodeError, setEncodeError] = useState("");
  const [showAdModal, setShowAdModal] = useState(false);
  const [pendingCopy, setPendingCopy] = useState("");
  const { toast } = useToast();

  const encodeToBase64 = () => {
    try {
      const encoded = btoa(textInput);
      setEncodedOutput(encoded);
      setEncodeError("");
      toast({
        title: "Encoded Successfully",
        description: "Text converted to Base64",
      });
    } catch (e) {
      setEncodeError("Error encoding text. Please check your input.");
    }
  };

  const decodeFromBase64 = () => {
    try {
      const decoded = atob(textInput);
      setDecodedOutput(decoded);
      setEncodeError("");
      toast({
        title: "Decoded Successfully",
        description: "Base64 converted to text",
      });
    } catch (e) {
      setEncodeError("Invalid Base64 string. Please check your input.");
      setDecodedOutput("");
    }
  };

  const handleCopyClick = (text: string) => {
    setPendingCopy(text);
    setShowAdModal(true);
  };

  const handleAdWatched = () => {
    setShowAdModal(false);
    if (pendingCopy) {
      copyToClipboard(pendingCopy);
      setPendingCopy("");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: "Text copied successfully",
    });
  };

  return (
    <>
      <Header />
      <ToolLayout
        title="Base64 Encoder/Decoder"
        description="Encode text to Base64 or decode Base64 strings instantly"
        category="Developer Tools"
        instructions={[
          "Enter your text or Base64 string",
          "Choose encode or decode operation",
          "Copy the result to clipboard",
        ]}
        relatedTools={[
          { name: "JSON Formatter", path: "/tools/json-formatter" },
          { name: "Hash Generator", path: "/tools/hash-generator" },
        ]}
      >
        <Tabs defaultValue="encode" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-6">
            <TabsTrigger value="encode">
              <ArrowDown className="h-4 w-4 mr-2" />
              Encode
            </TabsTrigger>
            <TabsTrigger value="decode">
              <ArrowUp className="h-4 w-4 mr-2" />
              Decode
            </TabsTrigger>
          </TabsList>

          <TabsContent value="encode" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Text to Encode</h3>
              <Textarea
                placeholder="Enter text to encode..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="min-h-[200px] font-mono"
              />
              <Button onClick={encodeToBase64} className="w-full mt-4">
                <ArrowDown className="mr-2 h-4 w-4" />
                Encode to Base64
              </Button>
            </Card>

            {encodedOutput && (
              <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Base64 Output</h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopyClick(encodedOutput)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Watch Ad to Copy
                  </Button>
                </div>
                <Textarea
                  value={encodedOutput}
                  readOnly
                  className="min-h-[200px] font-mono select-none cursor-default"
                />
              </Card>
            )}
          </TabsContent>

          <TabsContent value="decode" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Base64 to Decode</h3>
              <Textarea
                placeholder="Enter Base64 string to decode..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="min-h-[200px] font-mono"
              />
              <Button onClick={decodeFromBase64} className="w-full mt-4">
                <ArrowUp className="mr-2 h-4 w-4" />
                Decode from Base64
              </Button>
            </Card>

            {encodeError && (
              <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
                <p className="font-semibold">Error:</p>
                <p className="text-sm mt-1">{encodeError}</p>
              </div>
            )}

            {decodedOutput && (
              <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Decoded Text</h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopyClick(decodedOutput)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Watch Ad to Copy
                  </Button>
                </div>
                <Textarea
                  value={decodedOutput}
                  readOnly
                  className="min-h-[200px] font-mono select-none cursor-default"
                />
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <AdWatchModal
          open={showAdModal}
          onOpenChange={(open) => {
            setShowAdModal(open);
            if (!open) setPendingCopy("");
          }}
          onAdWatched={handleAdWatched}
          title="Watch Ad to Continue"
          description="Watch this short ad to copy the text"
        />
      </ToolLayout>
    </>
  );
};

export default Base64Encoder;
