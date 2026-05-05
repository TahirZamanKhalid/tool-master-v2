import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Copy, Download, FileText } from "lucide-react";
import { streamText } from "@/utils/pollinations";

const EssayWriter = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [essay, setEssay] = useState("");
  const [formData, setFormData] = useState({
    essayType: "argumentative",
    topic: "",
    wordCount: "1000",
    academicLevel: "undergraduate",
    tone: "academic",
    additionalInstructions: "",
  });

  const generateEssay = async () => {
    if (!formData.topic.trim()) {
      toast({ title: "Topic required", description: "Please enter an essay topic.", variant: "destructive" });
      return;
    }
    setLoading(true);
    setEssay("");
    try {
      const prompt = `Write a ${formData.wordCount}-word ${formData.essayType} essay on: "${formData.topic}".
Academic level: ${formData.academicLevel}. Tone: ${formData.tone}.
${formData.additionalInstructions ? `Additional instructions: ${formData.additionalInstructions}` : ""}
Include a clear introduction, well-developed body paragraphs, and a strong conclusion. Use proper essay structure.`;

      let text = "";
      for await (const chunk of streamText([{ role: "user", content: prompt }], { model: "openai" })) {
        text += chunk;
        setEssay(text);
      }
      toast({ title: "Essay generated!", description: "Your essay is ready." });
    } catch {
      toast({ title: "Generation failed", description: "Unable to connect. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(essay);
    toast({ title: "Copied!" });
  };

  const download = () => {
    const blob = new Blob([essay], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `essay-${formData.topic.slice(0, 30).replace(/\s+/g, "-")}.txt`;
    a.click();
  };

  return (
    <ToolLayout
      title="AI Essay Writer"
      description="Generate well-structured academic essays on any topic instantly. Free, no signup required."
      category="AI & Content"
      showDownloadAd={!!essay}
      onDownload={download}
      downloadLabel="Download Essay"
    >
      <div className="space-y-4">
        {/* Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Essay Type</Label>
            <Select value={formData.essayType} onValueChange={(v) => setFormData({ ...formData, essayType: v })}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["argumentative","persuasive","expository","descriptive","narrative","analytical","compare-contrast","cause-effect"].map(t => (
                  <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1).replace("-", " & ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Essay Topic *</Label>
            <Input
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              placeholder="e.g. Climate Change and Its Effects"
              className="rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Word Count</Label>
            <Select value={formData.wordCount} onValueChange={(v) => setFormData({ ...formData, wordCount: v })}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["300","500","750","1000","1500","2000","2500"].map(n => (
                  <SelectItem key={n} value={n}>{n} words</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Academic Level</Label>
            <Select value={formData.academicLevel} onValueChange={(v) => setFormData({ ...formData, academicLevel: v })}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[["high-school","High School"],["undergraduate","Undergraduate"],["graduate","Graduate"],["phd","PhD"]].map(([v, l]) => (
                  <SelectItem key={v} value={v}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Tone</Label>
            <Select value={formData.tone} onValueChange={(v) => setFormData({ ...formData, tone: v })}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["formal","academic","casual","professional"].map(t => (
                  <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Extra Instructions (optional)</Label>
            <Input
              value={formData.additionalInstructions}
              onChange={(e) => setFormData({ ...formData, additionalInstructions: e.target.value })}
              placeholder="Any specific requirements..."
              className="rounded-xl"
            />
          </div>
        </div>

        <Button
          onClick={generateEssay}
          disabled={loading}
          className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl"
        >
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><FileText className="mr-2 h-4 w-4" /> Generate Essay</>}
        </Button>

        {/* Output */}
        {essay && (
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
              <pre className="whitespace-pre-wrap text-sm text-foreground font-sans leading-relaxed">{essay}</pre>
            </div>
            {loading && (
              <p className="text-xs text-primary animate-pulse">✍️ Writing your essay...</p>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default EssayWriter;
