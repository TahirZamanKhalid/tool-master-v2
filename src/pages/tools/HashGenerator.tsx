import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Copy, Hash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";


const HashGenerator = () => {
  const [input, setInput] = useState("");
  const [hashes, setHashes] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const generateHash = async (algorithm: string, text: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest(algorithm, data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleGenerate = async () => {
    if (!input) {
      toast({
        title: "Error",
        description: "Please enter some text",
        variant: "destructive",
      });
      return;
    }

    try {
      const [sha1, sha256, sha384, sha512] = await Promise.all([
        generateHash('SHA-1', input),
        generateHash('SHA-256', input),
        generateHash('SHA-384', input),
        generateHash('SHA-512', input),
      ]);

      setHashes({
        'SHA-1': sha1,
        'SHA-256': sha256,
        'SHA-384': sha384,
        'SHA-512': sha512,
      });

      toast({
        title: "Hashes generated",
        description: "All hash values have been calculated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate hashes",
        variant: "destructive",
      });
    }
  };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    toast({
      title: "Copied!",
      description: "Hash copied to clipboard",
    });
  };

  return (
    <ToolLayout
      title="Hash Generator"
      description="Generate cryptographic hashes (SHA-1, SHA-256, SHA-384, SHA-512)"
      category="Developer Tools"
      instructions={[
        "Enter any text you want to hash",
        "Click 'Generate Hashes' to create all hash values",
        "Copy any hash for use in your projects"
      ]}
      relatedTools={[
        { name: "Password Generator", path: "/tools/password-generator" },
        { name: "Base64 Encoder", path: "/tools/base64-encoder" },
        { name: "UUID Generator", path: "/tools/uuid-generator" },
      ]}
    >
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <Label htmlFor="input" className="text-base mb-2 block">Input Text</Label>
            <Textarea
              id="input"
              placeholder="Enter text to hash..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[150px] font-mono text-sm mb-4"
            />
            <Button 
              onClick={handleGenerate}
              disabled={!input}
              className="w-full"
            >
              <Hash className="mr-2 h-4 w-4" />
              Generate Hashes
            </Button>
          </CardContent>
        </Card>

        {Object.keys(hashes).length > 0 && (
          <div className="space-y-4">
            {Object.entries(hashes).map(([algorithm, hash]) => (
              <Card key={algorithm}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-base font-semibold">{algorithm}</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyHash(hash)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <div className="p-3 bg-muted rounded-lg font-mono text-xs break-all">
                    {hash}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

    </ToolLayout>
  );
};

export default HashGenerator;
