import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { marked } from "marked";
import DOMPurify from "dompurify";

const MarkdownPreview = () => {
  const [markdown, setMarkdown] = useState("# Hello World\n\nThis is **bold** and this is *italic*.\n\n- List item 1\n- List item 2\n\n```javascript\nconst hello = 'world';\n```");

  const convertToHTML = (md: string) => {
    // Use marked library for secure markdown parsing
    const rawHTML = marked.parse(md) as string;
    
    // Sanitize the output with DOMPurify to prevent XSS
    const sanitizedHTML = DOMPurify.sanitize(rawHTML, {
      ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'strong', 'em', 'code', 'pre', 'ul', 'ol', 'li', 'a', 'blockquote', 'br', 'hr'],
      ALLOWED_ATTR: ['href', 'class'],
      ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
    });
    
    return sanitizedHTML;
  };

  return (
    <ToolLayout
      title="Markdown Preview"
      description="Write and preview markdown in real-time"
      category="Text Tools"
      relatedTools={[
        { name: "JSON Formatter", path: "/tools/json-formatter" },
        { name: "HTML Encoder", path: "/tools/html-encoder" },
        { name: "Word Counter", path: "/tools/word-counter" }
      ]}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Markdown Input</label>
          <Textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            className="min-h-[500px] font-mono"
            placeholder="# Enter markdown here..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Preview</label>
          <Card className="p-6 min-h-[500px] prose prose-sm max-w-none">
            <div dangerouslySetInnerHTML={{ __html: convertToHTML(markdown) }} />
          </Card>
        </div>
      </div>
    </ToolLayout>
  );
};

export default MarkdownPreview;
