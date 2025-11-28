import { useState } from "react";
import DOMPurify from "dompurify";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { AdSpace } from "@/components/AdSpace";

const HTMLPreview = () => {
  const [html, setHtml] = useState("");

  // Sanitize HTML to prevent XSS attacks
  const sanitizedHtml = DOMPurify.sanitize(html);

  return (
    <ToolLayout
      title="HTML Preview"
      description="Write HTML and see live preview"
      category="Developer Tools"
    >
      <AdSpace className="mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">HTML Code</h3>
            <Textarea
              placeholder="Enter HTML code..."
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              rows={20}
              className="font-mono"
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Preview</h3>
            <div
              className="border rounded-lg p-4 min-h-[400px] bg-background"
              dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            />
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
};

export default HTMLPreview;
