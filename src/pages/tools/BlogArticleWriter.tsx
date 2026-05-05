import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Download, Copy, FileText } from "lucide-react";
import { streamText } from "@/utils/pollinations";

const BlogArticleWriter = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [blog, setBlog] = useState("");
  const [formData, setFormData] = useState({
    topic: "",
    blogType: "how-to",
    wordCount: "1500",
    targetAudience: "general",
    tone: "conversational",
    keywords: "",
    additionalNotes: "",
  });

  const generateBlog = async () => {
    if (!formData.topic.trim()) {
      toast({ title: "Topic required", description: "Please enter a blog topic.", variant: "destructive" });
      return;
    }
    setLoading(true);
    setBlog("");
    try {
      const prompt = `Write a ${formData.wordCount}-word ${formData.blogType} blog article about: "${formData.topic}".
Target audience: ${formData.targetAudience}. Writing tone: ${formData.tone}.
${formData.keywords ? `SEO keywords to include: ${formData.keywords}` : ""}
${formData.additionalNotes ? `Additional notes: ${formData.additionalNotes}` : ""}
Include a compelling headline, introduction, well-structured sections with subheadings, and a conclusion. Make it engaging and SEO-friendly.`;

      let text = "";
      for await (const chunk of streamText([{ role: "user", content: prompt }], { model: "openai" })) {
        text += chunk;
        setBlog(text);
      }
      toast({ title: "Blog generated!", description: "Your article is ready." });
    } catch {
      toast({ title: "Generation failed", description: "Unable to connect. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(blog);
    toast({ title: "Copied!" });
  };

  const download = () => {
    const blob = new Blob([blog], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `blog-${formData.topic.slice(0, 30).replace(/\s+/g, "-")}.txt`;
    a.click();
  };

  return (
    <ToolLayout
      title="AI Blog Article Writer"
      description="Generate engaging, SEO-optimized blog articles on any topic instantly. Free, no signup required."
      category="AI & Content"
      showDownloadAd={!!blog}
      onDownload={download}
      downloadLabel="Download Article"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Blog Topic *</Label>
            <Input
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              placeholder="e.g. 10 Ways to Boost Your Productivity"
              className="rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Blog Type</Label>
            <Select value={formData.blogType} onValueChange={(v) => setFormData({ ...formData, blogType: v })}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[["how-to","How-to Guide"],["listicle","Listicle"],["tutorial","Tutorial"],["review","Review"],["comparison","Comparison"],["opinion","Opinion Piece"],["case-study","Case Study"],["news","News/Update"]].map(([v, l]) => (
                  <SelectItem key={v} value={v}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Word Count</Label>
            <Select value={formData.wordCount} onValueChange={(v) => setFormData({ ...formData, wordCount: v })}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["500","750","1000","1500","2000","2500"].map(n => (
                  <SelectItem key={n} value={n}>{n} words</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Target Audience</Label>
            <Select value={formData.targetAudience} onValueChange={(v) => setFormData({ ...formData, targetAudience: v })}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[["beginners","Beginners"],["intermediate","Intermediate"],["experts","Experts"],["general","General Audience"],["business","Business Professionals"],["students","Students"]].map(([v, l]) => (
                  <SelectItem key={v} value={v}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Writing Tone</Label>
            <Select value={formData.tone} onValueChange={(v) => setFormData({ ...formData, tone: v })}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["conversational","professional","friendly","authoritative","enthusiastic","informative"].map(t => (
                  <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>SEO Keywords (optional)</Label>
            <Input
              value={formData.keywords}
              onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
              placeholder="keyword1, keyword2, keyword3"
              className="rounded-xl"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Additional Notes (optional)</Label>
            <Textarea
              value={formData.additionalNotes}
              onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
              placeholder="Any specific requirements, examples to include, or special instructions..."
              className="rounded-xl"
              rows={3}
            />
          </div>
        </div>

        <Button
          onClick={generateBlog}
          disabled={loading}
          className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl"
        >
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><FileText className="mr-2 h-4 w-4" /> Generate Blog Article</>}
        </Button>

        {blog && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copy} className="rounded-xl">
                <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy
              </Button>
              <Button variant="outline" size="sm" onClick={download} className="rounded-xl">
                <Download className="mr-1.5 h-3.5 w-3.5" /> Download
              </Button>
            </div>
            <div className="bg-muted/40 border border-border/60 rounded-xl p-4 max-h-[60vh] overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-foreground font-sans leading-relaxed">{blog}</pre>
            </div>
            {loading && <p className="text-xs text-primary animate-pulse">✍️ Writing your article...</p>}
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default BlogArticleWriter;
