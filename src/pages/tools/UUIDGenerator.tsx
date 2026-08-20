import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Copy, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

const UUIDGenerator = () => {
  const [uuids, setUuids] = useState<string[]>([]);
  const [count, setCount] = useState(1);
  const { toast } = useToast();

  const generateUUID = (): string => {
    return crypto.randomUUID();
  };

  const handleGenerate = () => {
    const newUuids = Array.from({ length: Math.min(count, 100) }, () => generateUUID());
    setUuids(newUuids);
    toast({
      title: "Generated!",
      description: `Created ${newUuids.length} UUID${newUuids.length > 1 ? 's' : ''}`,
    });
  };

  const copyUUID = (uuid: string) => {
    navigator.clipboard.writeText(uuid);
    toast({
      title: "Copied!",
      description: "UUID copied to clipboard",
    });
  };

  const copyAll = () => {
    navigator.clipboard.writeText(uuids.join('\n'));
    toast({
      title: "Copied!",
      description: "All UUIDs copied to clipboard",
    });
  };

  return (
    <ToolLayout
      title="UUID Generator"
      description="Generate universally unique identifiers (UUID v4)"
      category="Developer Tools"
      instructions={[
        "Choose how many UUIDs you want to generate (max 100)",
        "Click 'Generate UUIDs' to create unique identifiers",
        "Copy individual UUIDs or all at once"
      ]}
      relatedTools={[
        { name: "Password Generator", path: "/tools/password-generator" },
        { name: "Hash Generator", path: "/tools/hash-generator" },
        { name: "QR Code Generator", path: "/tools/qr-code-generator" },
      ]}
    >
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="count" className="text-base mb-2 block">Number of UUIDs</Label>
                <Input
                  id="count"
                  type="number"
                  min="1"
                  max="100"
                  value={count}
                  onChange={(e) => setCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                  className="w-full"
                />
              </div>
              <Button 
                onClick={handleGenerate}
                className="px-8"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Generate UUIDs
              </Button>
            </div>
          </CardContent>
        </Card>

        {uuids.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-base font-semibold">
                  Generated UUIDs ({uuids.length})
                </Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyAll}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy All
                </Button>
              </div>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {uuids.map((uuid, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg group hover:bg-muted/70 transition-colors"
                  >
                    <code className="font-mono text-sm flex-1">{uuid}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyUUID(uuid)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Related Articles & Guides — internal link for SEO */}
      <section className="mt-12 mb-8 w-full max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-foreground">Related Articles & Guides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <RouterLink
            to="/blog/free-online-uuid-generator"
            className="p-4 border border-border/60 rounded-lg bg-card/80 shadow-sm hover:shadow-card-hover transition-shadow no-underline block"
          >
            <span className="text-primary font-semibold hover:underline text-lg block">
              Free Online UUID / GUID Generator
            </span>
            <p className="text-muted-foreground mt-2 text-sm">
              Generate cryptographically secure v4 UUIDs instantly in bulk for your database.
            </p>
          </RouterLink>
        </div>
      </section>
    </ToolLayout>
  );
};

export default UUIDGenerator;
