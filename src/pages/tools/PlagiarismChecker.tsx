import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AdSpace } from "@/components/AdSpace";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const PlagiarismChecker = () => {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const checkPlagiarism = async () => {
    if (!input.trim()) {
      toast({ description: "Please enter text to check", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-plagiarism', {
        body: { text: input }
      });

      if (error) throw error;

      setResult(data.analysis);
      toast({ description: "Plagiarism check completed!" });
    } catch (error: any) {
      console.error('Error:', error);
      toast({ 
        description: error.message || "Failed to check plagiarism. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout
      title="Plagiarism Checker"
      description="Check your text for potential plagiarism using AI analysis"
      category="AI & Content"
      instructions={[
        "Paste the text you want to check for plagiarism",
        "Click 'Check Plagiarism' to analyze",
        "Review the AI-powered analysis results"
      ]}
    >
      <AdSpace size="leaderboard" className="mb-6" />
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Text to Check</label>
            <Textarea
              placeholder="Paste your text here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={10}
              className="font-mono"
            />
            <p className="text-sm text-muted-foreground mt-2">
              {input.length} characters, {input.split(/\s+/).filter(w => w).length} words
            </p>
          </div>

          <Button 
            onClick={checkPlagiarism} 
            className="w-full"
            disabled={loading || !input.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Check Plagiarism'
            )}
          </Button>

          {result && (
            <div className="space-y-3">
              <label className="text-sm font-medium block">Analysis Result</label>
              <div className="p-4 bg-muted rounded-lg">
                <p className="whitespace-pre-wrap">{result}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </ToolLayout>
  );
};

export default PlagiarismChecker;
