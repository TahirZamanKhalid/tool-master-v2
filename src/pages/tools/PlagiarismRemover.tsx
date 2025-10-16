import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AdSpace } from "@/components/AdSpace";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Copy } from "lucide-react";

const PlagiarismRemover = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const removeAndRewrite = async () => {
    if (!input.trim()) {
      toast({ description: "Please enter text to rewrite", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('rewrite-text', {
        body: { text: input }
      });

      if (error) throw error;

      setOutput(data.rewrittenText);
      toast({ description: "Text rewritten successfully!" });
    } catch (error: any) {
      console.error('Error:', error);
      toast({ 
        description: error.message || "Failed to rewrite text. Please try again.", 
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
      title="Plagiarism Remover"
      description="Rewrite text to remove plagiarism while preserving meaning using AI"
      category="AI & Content"
      instructions={[
        "Paste the text you want to rewrite",
        "Click 'Rewrite Text' to generate unique content",
        "Copy the plagiarism-free rewritten text"
      ]}
    >
      <AdSpace size="leaderboard" className="mb-6" />
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Original Text</label>
            <Textarea
              placeholder="Paste text to rewrite and remove plagiarism..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={8}
              className="font-mono"
            />
            <p className="text-sm text-muted-foreground mt-2">
              {input.length} characters, {input.split(/\s+/).filter(w => w).length} words
            </p>
          </div>

          <Button 
            onClick={removeAndRewrite} 
            className="w-full"
            disabled={loading || !input.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Rewriting...
              </>
            ) : (
              'Rewrite Text'
            )}
          </Button>

          {output && (
            <div className="space-y-3">
              <label className="text-sm font-medium block">Rewritten Text</label>
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

export default PlagiarismRemover;
