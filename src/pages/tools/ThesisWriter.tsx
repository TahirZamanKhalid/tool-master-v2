import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Download, Copy, BookOpen } from "lucide-react";
import { streamText } from "@/utils/pollinations";

const ThesisWriter = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [thesis, setThesis] = useState("");
  const [formData, setFormData] = useState({
    researchTopic: "",
    fieldOfStudy: "computer-science",
    wordCount: "3000",
    chapterType: "introduction",
    researchQuestions: "",
    methodology: "",
    additionalContext: "",
  });

  const generateThesis = async () => {
    if (!formData.researchTopic.trim()) {
      toast({ title: "Topic required", description: "Please enter a research topic.", variant: "destructive" });
      return;
    }
    setLoading(true);
    setThesis("");
    try {
      const prompt = `Write a ${formData.wordCount}-word academic ${formData.chapterType} chapter for a thesis/dissertation.

Research Topic: ${formData.researchTopic}
Field of Study: ${formData.fieldOfStudy}
${formData.researchQuestions ? `Research Questions: ${formData.researchQuestions}` : ""}
${formData.methodology ? `Methodology: ${formData.methodology}` : ""}
${formData.additionalContext ? `Additional Context: ${formData.additionalContext}` : ""}

Write in formal academic style with proper citations format (e.g., Author, Year), clear structure, and scholarly language appropriate for a graduate-level thesis. Include relevant headings and subheadings.`;

      let text = "";
      for await (const chunk of streamText([{ role: "user", content: prompt }], { model: "openai", temperature: 0.6 })) {
        text += chunk;
        setThesis(text);
      }
      toast({ title: "Thesis content generated!", description: "Your chapter content is ready." });
    } catch {
      toast({ title: "Generation failed", description: "Unable to connect. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(thesis);
    toast({ title: "Copied!" });
  };

  const download = () => {
    const blob = new Blob([thesis], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `thesis-${formData.researchTopic.slice(0, 30).replace(/\s+/g, "-")}.txt`;
    a.click();
  };

  return (
    <ToolLayout
      title="AI Thesis Writer"
      description="Generate comprehensive academic thesis chapters and dissertation content with AI. Free, no signup required."
      category="AI & Content"
      showDownloadAd={!!thesis}
      onDownload={download}
      downloadLabel="Download Thesis"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Research Topic *</Label>
            <Input
              value={formData.researchTopic}
              onChange={(e) => setFormData({ ...formData, researchTopic: e.target.value })}
              placeholder="e.g. Machine Learning Applications in Healthcare Diagnostics"
              className="rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Field of Study</Label>
            <Select value={formData.fieldOfStudy} onValueChange={(v) => setFormData({ ...formData, fieldOfStudy: v })}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[["computer-science","Computer Science"],["engineering","Engineering"],["business","Business"],["psychology","Psychology"],["education","Education"],["medicine","Medicine"],["social-sciences","Social Sciences"],["humanities","Humanities"],["natural-sciences","Natural Sciences"]].map(([v, l]) => (
                  <SelectItem key={v} value={v}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Chapter / Section Type</Label>
            <Select value={formData.chapterType} onValueChange={(v) => setFormData({ ...formData, chapterType: v })}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[["introduction","Introduction"],["literature-review","Literature Review"],["methodology","Methodology"],["results","Results"],["discussion","Discussion"],["conclusion","Conclusion"],["abstract","Abstract"]].map(([v, l]) => (
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
                {["1000","2000","3000","5000","7500"].map(n => (
                  <SelectItem key={n} value={n}>{n} words</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Research Questions (optional)</Label>
            <Textarea
              value={formData.researchQuestions}
              onChange={(e) => setFormData({ ...formData, researchQuestions: e.target.value })}
              placeholder="List your main research questions..."
              className="rounded-xl"
              rows={2}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Methodology (optional)</Label>
            <Textarea
              value={formData.methodology}
              onChange={(e) => setFormData({ ...formData, methodology: e.target.value })}
              placeholder="Describe your research methodology..."
              className="rounded-xl"
              rows={2}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Additional Context (optional)</Label>
            <Textarea
              value={formData.additionalContext}
              onChange={(e) => setFormData({ ...formData, additionalContext: e.target.value })}
              placeholder="Any additional context, frameworks, or specific requirements..."
              className="rounded-xl"
              rows={2}
            />
          </div>
        </div>

        <Button
          onClick={generateThesis}
          disabled={loading}
          className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl"
        >
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><BookOpen className="mr-2 h-4 w-4" /> Generate Thesis Content</>}
        </Button>

        {thesis && (
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
              <pre className="whitespace-pre-wrap text-sm text-foreground font-sans leading-relaxed">{thesis}</pre>
            </div>
            {loading && <p className="text-xs text-primary animate-pulse">✍️ Writing your thesis content...</p>}
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default ThesisWriter;
