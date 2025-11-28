import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AdSpace } from "@/components/AdSpace";

const TextToSlug = () => {
  const [text, setText] = useState("");

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const slug = generateSlug(text);

  const copySlug = () => {
    navigator.clipboard.writeText(slug);
    toast.success("Slug copied to clipboard!");
  };

  return (
    <ToolLayout
      title="Text to Slug Converter"
      description="Convert text to URL-friendly slugs"
      category="Text Tools"
    >
      <AdSpace size="leaderboard" className="mb-6" />
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <Label>Enter Text</Label>
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="My Blog Post Title"
            />
          </div>
          <div>
            <Label>Slug</Label>
            <Input
              value={slug}
              readOnly
              className="bg-muted font-mono"
            />
          </div>
          <Button onClick={copySlug} className="w-full" disabled={!slug}>
            Copy Slug
          </Button>
        </CardContent>
      </Card>
    </ToolLayout>
  );
};

export default TextToSlug;
