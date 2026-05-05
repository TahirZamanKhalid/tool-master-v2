import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Copy, RefreshCw, ArrowRight } from "lucide-react";
import { streamText } from "@/utils/pollinations";

const TextRephraser = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [tone, setTone] = useState("standard");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const rephraseText = async () => {
    if (!input.trim()) {
      toast({ description: "Please enter text to rephrase.", variant: "destructive" });
      return;
    }
    setLoading(true);
    setOutput("");
    try {
      const prompt = `Rephrase the following text in a ${tone} tone. Keep the original meaning but use different wording and sentence structure. Only output the rephrased text, nothing else.

Text to rephrase:
${input}`;

      let text = "";
      for await (const chunk of streamText([{ role: "user", content: prompt }], { model: "openai" })) {
        text += chunk;
        setOutput(text);
      }
      toast({ description: "Text rephrased successfully!" });
    } catch {
      toast({ description: "Failed to rephrase text. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(output);
    toast({ description: "Copied to clipboard!" });
  };

  const inputWords = input.trim() ? input.trim().split(/\s+/).length : 0;
  const outputWords = output.trim() ? output.trim().split(/\s+/).length : 0;

  return (
    <ToolLayout
      title="AI Text Rephraser"
      description="Rephrase any text with different tones while preserving the original meaning. Free, instant, no signup."
      category="AI & Content"
      instructions={[
        "Paste the text you want to rephrase",
        "Select your desired tone",
        "Click Rephrase Text",
        "Copy the rephrased version",
      ]}
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Tone</Label>
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger className="rounded-xl w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["standard","professional","casual","formal","friendly","academic","creative"].map(t => (
                <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 items-start">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Original Text</Label>
              <span className="text-xs text-muted-foreground">{inputWords} words</span>
            </div>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your text here..."
              className="rounded-xl min-h-[220px] font-mono text-sm"
            />
          </div>

          <div className="flex md:flex-col items-center justify-center pt-7 gap-2">
            <Button
              onClick={rephraseText}
              disabled={loading || !input.trim()}
              size="sm"
              className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold px-4"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            </Button>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Rephrased Text</Label>
              <span className="text-xs text-muted-foreground">{outputWords} words</span>
            </div>
            <Textarea
              value={output}
              readOnly
              placeholder="Rephrased text will appear here..."
              className="rounded-xl min-h-[220px] font-mono text-sm bg-muted/30"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={rephraseText}
            disabled={loading || !input.trim()}
            className="h-11 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl px-6"
          >
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Rephrasing...</> : <><RefreshCw className="mr-2 h-4 w-4" /> Rephrase Text</>}
          </Button>
          {output && (
            <Button variant="outline" onClick={copy} className="h-11 rounded-xl">
              <Copy className="mr-2 h-4 w-4" /> Copy Result
            </Button>
          )}
        </div>
        {loading && <p className="text-xs text-primary animate-pulse">✍️ Rephrasing your text...</p>}
      </div>
    </ToolLayout>
  );
};

export default TextRephraser;
