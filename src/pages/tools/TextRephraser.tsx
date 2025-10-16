import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AdSpace } from "@/components/AdSpace";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Copy, RefreshCw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TextRephraser = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [tone, setTone] = useState("standard");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const rephraseText = async () => {
    if (!input.trim()) {
      toast({ description: "Please enter text to rephrase", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('rephrase-text', {
        body: { text: input, tone }
      });

      if (error) throw error;

      setOutput(data.rephrasedText);
      toast({ description: "Text rephrased successfully!" });
    } catch (error: any) {
      console.error('Error:', error);
      toast({ 
        description: error.message || "Failed to rephrase text. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    toast({ description: "Copied to clipboard!" });
  };

  return (
    <ToolLayout
      title="Text Rephraser"
      description="Rephrase text with different tones while maintaining the original meaning using AI"
      category="AI & Content"
      instructions={[
        "Paste the text you want to rephrase",
        "Select your desired tone (professional, casual, formal, etc.)",
        "Click 'Rephrase Text' to generate alternatives",
        "Copy the rephrased version you prefer"
      ]}
    >
      <AdSpace size="leaderboard" className="mb-6" />
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Text to Rephrase</label>
            <Textarea
              placeholder="Enter text you want to rephrase..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={8}
              className="font-mono"
            />
            <p className="text-sm text-muted-foreground mt-2">
              {input.length} characters, {input.split(/\s+/).filter(w => w).length} words
            </p>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Tone</label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
                <SelectItem value="creative">Creative</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={rephraseText} 
            className="w-full"
            disabled={loading || !input.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Rephrasing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Rephrase Text
              </>
            )}
          </Button>

          {output && (
            <div className="space-y-3">
              <label className="text-sm font-medium block">Rephrased Text</label>
              <Textarea 
                value={output} 
                readOnly 
                rows={8}
                className="font-mono"
              />
              <p className="text-sm text-muted-foreground">
                {output.length} characters, {output.split(/\s+/).filter(w => w).length} words
              </p>
              <Button 
                onClick={copyToClipboard} 
                variant="outline" 
                className="w-full"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Result
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </ToolLayout>
  );
};

export default TextRephraser;
