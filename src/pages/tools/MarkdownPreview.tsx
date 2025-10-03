import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";

const MarkdownPreview = () => {
  const [markdown, setMarkdown] = useState("# Hello World\n\nThis is **bold** and this is *italic*.\n\n- List item 1\n- List item 2\n\n```javascript\nconst hello = 'world';\n```");

  const convertToHTML = (md: string) => {
    let html = md;
    
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>');
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>');
    
    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
    
    // Code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-muted p-4 rounded-lg my-4 overflow-x-auto"><code>$2</code></pre>');
    
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="bg-muted px-2 py-1 rounded text-sm">$1</code>');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline">$1</a>');
    
    // Lists
    html = html.replace(/^\* (.*$)/gim, '<li class="ml-4">$1</li>');
    html = html.replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>');
    html = html.replace(/(<li.*<\/li>)/s, '<ul class="list-disc my-2">$1</ul>');
    
    // Paragraphs
    html = html.replace(/\n\n/g, '</p><p class="my-2">');
    html = '<p class="my-2">' + html + '</p>';
    
    return html;
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
