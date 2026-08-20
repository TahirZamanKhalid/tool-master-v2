import { useState, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { marked } from "marked";
import { Copy } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import DOMPurify from "dompurify";

const MarkdownToHTML = () => {
  const [markdown, setMarkdown] = useState("# Hello World\n\nThis is **bold** and this is *italic*.");
  const [html, setHtml] = useState("");

  const convertToHTML = () => {
    try {
      if (!markdown.trim()) {
        toast.error("Please enter markdown");
        return;
      }
      const result = marked.parse(markdown) as string;
      setHtml(DOMPurify.sanitize(result));
      toast.success("Converted to HTML");
    } catch (error) {
      toast.error("Failed to convert markdown");
    }
  };

  const copyHTML = () => {
    navigator.clipboard.writeText(html);
    toast.success("HTML copied to clipboard");
  };

  return (
    <>
      <SEOHead
        title="Markdown to HTML Converter"
        description="Convert Markdown to HTML instantly with live preview and copy functionality"
        keywords="markdown to html, markdown converter, md to html, convert markdown"
        canonical="https://toolmaster.cloud/tools/markdown-to-html"
      />
      <ToolLayout
        title="Markdown to HTML Converter"
        description="Convert Markdown to HTML with live preview"
        category="Text Tools"
        instructions={[
          "Enter or paste your Markdown text",
          "Click 'Convert to HTML' to generate",
          "Preview the rendered HTML",
          "Copy the HTML code for use"
        ]}
        relatedTools={[
          { name: "Markdown Preview", path: "/tools/markdown-preview" },
          { name: "HTML Encoder", path: "/tools/html-encoder" }
        ]}
      >
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 space-y-2">
              <h3 className="font-semibold">Markdown Input</h3>
              <Textarea
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                className="min-h-[400px] font-mono"
                placeholder="Enter markdown here..."
              />
              <Button onClick={convertToHTML} className="w-full">
                Convert to HTML
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">HTML Output</h3>
                <Button onClick={copyHTML} variant="outline" size="sm" disabled={!html}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
              <Textarea
                value={html}
                readOnly
                className="min-h-[400px] font-mono"
                placeholder="HTML output will appear here..."
              />
            </CardContent>
          </Card>
        </div>

        {/* Related Articles & Guides — internal link for SEO */}
        <section className="mt-12 mb-8 w-full max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-foreground">Related Articles & Guides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <RouterLink
              to="/blog/free-markdown-to-html-converter"
              className="p-4 border border-border/60 rounded-lg bg-card/80 shadow-sm hover:shadow-card-hover transition-shadow no-underline block"
            >
              <span className="text-primary font-semibold hover:underline text-lg block">
                Free Markdown to HTML Converter Online
              </span>
              <p className="text-muted-foreground mt-2 text-sm">
                Convert Markdown to clean HTML instantly with live preview and GitHub-flavored support.
              </p>
            </RouterLink>
          </div>
        </section>
      </ToolLayout>
    </>
  );
};

export default MarkdownToHTML;
