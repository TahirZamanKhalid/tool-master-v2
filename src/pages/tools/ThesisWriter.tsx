import { useState, useRef } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Download, Copy } from "lucide-react";
import { LazyAdSpace } from "@/components/LazyAdSpace";
import { ContentAdBreak } from "@/components/ContentAdBreak";
import { SEOHead } from "@/components/SEOHead";
import { GeneratingAdModal } from "@/components/GeneratingAdModal";

const ThesisWriter = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [thesis, setThesis] = useState("");
  const [showAdModal, setShowAdModal] = useState(false);
  const wordCountRef = useRef(0);
  const lastAdWordCount = useRef(0);
  
  const [formData, setFormData] = useState({
    researchTopic: "",
    fieldOfStudy: "",
    wordCount: "5000",
    chapterType: "",
    researchQuestions: "",
    methodology: "",
    additionalContext: ""
  });

  const generateThesis = async () => {
    if (!formData.researchTopic || !formData.fieldOfStudy || !formData.wordCount || !formData.chapterType) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setThesis("");
    wordCountRef.current = 0;
    lastAdWordCount.current = 0;

    try {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-thesis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to start stream');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;
      let currentContent = "";

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              currentContent += content;
              setThesis(currentContent);

              const words = currentContent.trim().split(/\s+/);
              wordCountRef.current = words.length;

              if (wordCountRef.current - lastAdWordCount.current >= 3000) {
                lastAdWordCount.current = wordCountRef.current;
                setShowAdModal(true);
                setLoading(false);
                await new Promise(resolve => {
                  const checkAdClosed = setInterval(() => {
                    if (!showAdModal) {
                      clearInterval(checkAdClosed);
                      resolve(null);
                    }
                  }, 100);
                });
                setLoading(true);
              }
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      toast({
        title: "Success",
        description: "Thesis content generated successfully!",
      });
    } catch (error) {
      console.error('Error generating thesis:', error);
      toast({
        title: "Error",
        description: "Failed to generate thesis content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(thesis);
    toast({
      title: "Copied",
      description: "Thesis content copied to clipboard",
    });
  };

  const downloadThesis = () => {
    const blob = new Blob([thesis], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `thesis-${formData.researchTopic.substring(0, 30)}.txt`;
    a.click();
  };

  const renderContentWithAds = (content: string) => {
    const words = content.split(' ');
    const chunks: JSX.Element[] = [];
    let currentChunk: string[] = [];
    let wordCount = 0;
    let adIndex = 0;
    const maxAds = 3;

    words.forEach((word, index) => {
      currentChunk.push(word);
      wordCount++;

      if (wordCount >= 500 || index === words.length - 1) {
        chunks.push(
          <div key={`chunk-${index}`}>
            <p className="whitespace-pre-wrap mb-4">{currentChunk.join(' ')}</p>
            {wordCount >= 500 && index !== words.length - 1 && adIndex < maxAds && (
              <ContentAdBreak key={`ad-${adIndex++}`} index={adIndex} />
            )}
          </div>
        );
        currentChunk = [];
        wordCount = 0;
      }
    });

    return chunks;
  };

  return (
    <>
      <SEOHead
        title="AI Thesis Writer - Generate Academic Thesis & Dissertation Content"
        description="Create comprehensive thesis and dissertation chapters with our AI thesis writer. Generate research-quality content for literature reviews, methodology, and more. Free academic writing tool."
        keywords="thesis writer, dissertation writer, AI thesis generator, academic writing, research paper, thesis help, dissertation generator"
        canonical="https://yourdomain.com/tools/thesis-writer"
      />
      
      <ToolLayout
        title="AI Thesis Writer"
        description="Generate comprehensive thesis and dissertation chapters with AI. Perfect for graduate students and researchers working on academic projects."
        category="AI & Content"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="hidden lg:block lg:col-span-2">
            <div className="space-y-4">
              <div className="sticky top-4">
                <LazyAdSpace size="skyscraper" />
              </div>
              <LazyAdSpace size="skyscraper" />
              <LazyAdSpace size="skyscraper" />
              <LazyAdSpace size="skyscraper" />
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="mb-6">
              <LazyAdSpace size="leaderboard" />
            </div>

            <div className="bg-card rounded-lg border p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="researchTopic">Research Topic *</Label>
                  <Input
                    id="researchTopic"
                    value={formData.researchTopic}
                    onChange={(e) => setFormData({...formData, researchTopic: e.target.value})}
                    placeholder="Enter your research topic..."
                  />
                </div>

                <div>
                  <Label htmlFor="fieldOfStudy">Field of Study *</Label>
                  <Select value={formData.fieldOfStudy} onValueChange={(value) => setFormData({...formData, fieldOfStudy: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="computer-science">Computer Science</SelectItem>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="psychology">Psychology</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="medicine">Medicine</SelectItem>
                      <SelectItem value="social-sciences">Social Sciences</SelectItem>
                      <SelectItem value="humanities">Humanities</SelectItem>
                      <SelectItem value="natural-sciences">Natural Sciences</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="chapterType">Chapter/Section Type *</Label>
                  <Select value={formData.chapterType} onValueChange={(value) => setFormData({...formData, chapterType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select chapter type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="introduction">Introduction</SelectItem>
                      <SelectItem value="literature-review">Literature Review</SelectItem>
                      <SelectItem value="methodology">Methodology</SelectItem>
                      <SelectItem value="results">Results</SelectItem>
                      <SelectItem value="discussion">Discussion</SelectItem>
                      <SelectItem value="conclusion">Conclusion</SelectItem>
                      <SelectItem value="abstract">Abstract</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="wordCount">Word Count *</Label>
                  <Select value={formData.wordCount} onValueChange={(value) => setFormData({...formData, wordCount: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select word count" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2000">2000 words</SelectItem>
                      <SelectItem value="3000">3000 words</SelectItem>
                      <SelectItem value="5000">5000 words</SelectItem>
                      <SelectItem value="7500">7500 words</SelectItem>
                      <SelectItem value="10000">10000 words</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="researchQuestions">Research Questions (Optional)</Label>
                  <Textarea
                    id="researchQuestions"
                    value={formData.researchQuestions}
                    onChange={(e) => setFormData({...formData, researchQuestions: e.target.value})}
                    placeholder="List your research questions..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="methodology">Methodology (Optional)</Label>
                  <Textarea
                    id="methodology"
                    value={formData.methodology}
                    onChange={(e) => setFormData({...formData, methodology: e.target.value})}
                    placeholder="Describe your research methodology..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="additionalContext">Additional Context (Optional)</Label>
                  <Textarea
                    id="additionalContext"
                    value={formData.additionalContext}
                    onChange={(e) => setFormData({...formData, additionalContext: e.target.value})}
                    placeholder="Any additional context, frameworks, or specific requirements..."
                    rows={4}
                  />
                </div>

                <Button onClick={generateThesis} disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Thesis Content...
                    </>
                  ) : (
                    "Generate Thesis Content"
                  )}
                </Button>
              </div>

              {thesis && (
                <div className="mt-6 space-y-4">
                  <div className="flex gap-2">
                    <Button onClick={copyToClipboard} variant="outline" size="sm">
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                    <Button onClick={downloadThesis} variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                  
                  <div className="bg-muted p-6 rounded-lg">
                    <h3 className="font-semibold mb-4 text-lg">Generated Content:</h3>
                    <div className="prose prose-sm max-w-none">
                      {renderContentWithAds(thesis)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6">
              <LazyAdSpace size="leaderboard" />
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-2">
            <div className="space-y-4">
              <div className="sticky top-4">
                <LazyAdSpace size="skyscraper" />
              </div>
              <LazyAdSpace size="skyscraper" />
              <LazyAdSpace size="skyscraper" />
              <LazyAdSpace size="skyscraper" />
            </div>
          </div>
        </div>
      </ToolLayout>
      
      <GeneratingAdModal 
        open={showAdModal} 
        onComplete={() => setShowAdModal(false)} 
      />
    </>
  );
};

export default ThesisWriter;
