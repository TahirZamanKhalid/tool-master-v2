import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Copy, Sparkles, RefreshCw } from "lucide-react";
import { generateText } from "@/utils/pollinations";

const CaptionGenerator = () => {
  const { toast } = useToast();
  const [description, setDescription] = useState("");
  const [style, setStyle] = useState("casual");
  const [platform, setPlatform] = useState("instagram");
  const [captions, setCaptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const styles = [
    { value: "casual", label: "Casual & Friendly" },
    { value: "professional", label: "Professional" },
    { value: "funny", label: "Funny & Humorous" },
    { value: "inspirational", label: "Inspirational" },
    { value: "minimal", label: "Minimal & Short" },
    { value: "storytelling", label: "Storytelling" },
  ];

  const platforms = [
    { value: "instagram", label: "Instagram" },
    { value: "tiktok", label: "TikTok" },
    { value: "twitter", label: "Twitter/X" },
    { value: "linkedin", label: "LinkedIn" },
    { value: "facebook", label: "Facebook" },
  ];

  const generateCaptions = async () => {
    if (!description.trim()) {
      toast({ title: "Description required", description: "Please describe your image or post.", variant: "destructive" });
      return;
    }
    setLoading(true);
    setCaptions([]);
    try {
      const prompt = `Generate exactly 5 unique ${style} captions for a ${platform} post about: "${description}".

Format your response as a numbered list (1. 2. 3. 4. 5.) with each caption on its own line.
Include relevant hashtags where appropriate. Make each caption distinct and creative.`;

      const result = await generateText(prompt, { model: "openai" });

      const lines = result.split("\n").filter(l => l.trim());
      const parsed: string[] = [];
      for (const line of lines) {
        const match = line.match(/^\d+[\.\)]\s*(.+)/);
        if (match) parsed.push(match[1].trim());
      }
      setCaptions(parsed.length >= 2 ? parsed : lines.filter(l => l.length > 10).slice(0, 5));
      toast({ title: "Captions ready!", description: "5 captions generated." });
    } catch {
      toast({ title: "Generation failed", description: "Unable to connect. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!" });
  };

  const copyAll = () => {
    navigator.clipboard.writeText(captions.join("\n\n"));
    toast({ title: "All captions copied!" });
  };

  return (
    <ToolLayout
      title="AI Caption Generator"
      description="Generate creative social media captions for any post using AI. Free, instant, no signup."
      category="AI & Content"
      relatedTools={[
        { name: "Meme Generator", path: "/tools/meme-generator" },
        { name: "Background Remover", path: "/tools/background-remover" },
        { name: "Image Size Reducer", path: "/tools/image-size-reducer" },
      ]}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Image / Post Description *</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your image or what your post is about..."
              className="rounded-xl min-h-[90px]"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Caption Style</Label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                {styles.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Platform</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                {platforms.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={generateCaptions}
          disabled={loading}
          className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl"
        >
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><Sparkles className="mr-2 h-4 w-4" /> Generate Captions</>}
        </Button>

        {captions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">{captions.length} captions generated</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyAll} className="rounded-xl">
                  <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy All
                </Button>
                <Button variant="outline" size="sm" onClick={generateCaptions} className="rounded-xl">
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Regenerate
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              {captions.map((caption, i) => (
                <div key={i} className="group relative bg-muted/40 border border-border/60 rounded-xl p-3.5">
                  <p className="text-sm text-foreground pr-10 leading-relaxed">{caption}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copy(caption)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg h-8 w-8 p-0"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default CaptionGenerator;
