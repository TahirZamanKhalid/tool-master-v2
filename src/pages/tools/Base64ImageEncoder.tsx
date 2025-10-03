import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { AdSpace } from "@/components/AdSpace";

const Base64ImageEncoder = () => {
  const [base64Output, setBase64Output] = useState("");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setBase64Output(reader.result as string);
        toast.success("Image encoded to Base64!");
      };
      reader.readAsDataURL(file);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(base64Output);
    toast.success("Copied to clipboard!");
  };

  return (
    <ToolLayout
      title="Base64 Image Encoder"
      description="Convert images to Base64 strings"
      category="Developer Tools"
    >
      <AdSpace size="leaderboard" className="mb-6" />
      <Card>
        <CardContent className="p-6 space-y-4">
          <Input type="file" accept="image/*" onChange={handleImageUpload} />
          <Textarea
            value={base64Output}
            readOnly
            placeholder="Base64 output will appear here..."
            className="min-h-[200px] font-mono text-xs"
          />
          <Button onClick={copyToClipboard} className="w-full" disabled={!base64Output}>
            Copy to Clipboard
          </Button>
        </CardContent>
      </Card>
    </ToolLayout>
  );
};

export default Base64ImageEncoder;
