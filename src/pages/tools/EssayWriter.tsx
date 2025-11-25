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

const EssayWriter = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [essay, setEssay] = useState("");
  const [showAdModal, setShowAdModal] = useState(false);
  const wordCountRef = useRef(0);
  const lastAdWordCount = useRef(0);
  
  const [formData, setFormData] = useState({
    essayType: "",
    topic: "",
    wordCount: "1000",
    academicLevel: "",
    tone: "",
    additionalInstructions: ""
  });

  const generateEssay = async () => {
    if (!formData.essayType || !formData.topic || !formData.wordCount || !formData.academicLevel || !formData.tone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setEssay("");
    wordCountRef.current = 0;
    lastAdWordCount.current = 0;

    try {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-essay`, {
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
              setEssay(currentContent);

              // Count words
              const words = currentContent.trim().split(/\s+/);
              wordCountRef.current = words.length;

              // Show ad every 3000 words
              if (wordCountRef.current - lastAdWordCount.current >= 3000) {
                lastAdWordCount.current = wordCountRef.current;
                setShowAdModal(true);
                setLoading(false);
                // Pause streaming while ad is shown
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
        description: "Essay generated successfully!",
      });
    } catch (error) {
      console.error('Error generating essay:', error);
      toast({
        title: "Error",
        description: "Failed to generate essay. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(essay);
    toast({
      title: "Copied",
      description: "Essay copied to clipboard",
    });
  };

  const downloadEssay = () => {
    const blob = new Blob([essay], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `essay-${formData.topic.substring(0, 30)}.txt`;
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
        title="AI Essay Writer - Generate Academic Essays Online Free"
        description="Create high-quality academic essays with our AI essay writer. Generate well-structured essays for any topic, academic level, and word count. Free online essay generator tool."
        keywords="essay writer, AI essay generator, academic essay, essay maker, free essay writer, essay writing tool, automatic essay writer"
        canonical="https://yourdomain.com/tools/essay-writer"
      />
      
      <ToolLayout
        title="AI Essay Writer"
        description="Generate well-structured, academic essays on any topic with AI assistance. Perfect for students and researchers."
        category="AI & Content"
      >
        <div className="bg-card rounded-lg border p-6 space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="essayType">Essay Type *</Label>
                <Select value={formData.essayType} onValueChange={(value) => setFormData({...formData, essayType: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select essay type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="argumentative">Argumentative</SelectItem>
                    <SelectItem value="persuasive">Persuasive</SelectItem>
                    <SelectItem value="expository">Expository</SelectItem>
                    <SelectItem value="descriptive">Descriptive</SelectItem>
                    <SelectItem value="narrative">Narrative</SelectItem>
                    <SelectItem value="analytical">Analytical</SelectItem>
                    <SelectItem value="compare-contrast">Compare and Contrast</SelectItem>
                    <SelectItem value="cause-effect">Cause and Effect</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="topic">Essay Topic *</Label>
                <Input
                  id="topic"
                  value={formData.topic}
                  onChange={(e) => setFormData({...formData, topic: e.target.value})}
                  placeholder="Enter your essay topic..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="wordCount">Word Count *</Label>
                <Select value={formData.wordCount} onValueChange={(value) => setFormData({...formData, wordCount: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select word count" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="500">500 words</SelectItem>
                    <SelectItem value="750">750 words</SelectItem>
                    <SelectItem value="1000">1000 words</SelectItem>
                    <SelectItem value="1500">1500 words</SelectItem>
                    <SelectItem value="2000">2000 words</SelectItem>
                    <SelectItem value="2500">2500 words</SelectItem>
                    <SelectItem value="3000">3000 words</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="academicLevel">Academic Level *</Label>
                <Select value={formData.academicLevel} onValueChange={(value) => setFormData({...formData, academicLevel: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select academic level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high-school">High School</SelectItem>
                    <SelectItem value="undergraduate">Undergraduate</SelectItem>
                    <SelectItem value="graduate">Graduate</SelectItem>
                    <SelectItem value="phd">PhD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tone">Writing Tone *</Label>
                <Select value={formData.tone} onValueChange={(value) => setFormData({...formData, tone: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="additionalInstructions">Additional Instructions (Optional)</Label>
              <Textarea
                id="additionalInstructions"
                value={formData.additionalInstructions}
                onChange={(e) => setFormData({...formData, additionalInstructions: e.target.value})}
                placeholder="Any specific requirements, sources to include, or special instructions..."
                rows={4}
              />
            </div>

            <Button onClick={generateEssay} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Essay...
                </>
              ) : (
                "Generate Essay"
              )}
            </Button>
          </div>

          {essay && (
            <div className="mt-6 space-y-4">
              <div className="flex gap-2">
                <Button onClick={copyToClipboard} variant="outline" size="sm">
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
                <Button onClick={downloadEssay} variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
              
              <div className="bg-muted p-6 rounded-lg">
                <h3 className="font-semibold mb-4 text-lg">Generated Essay:</h3>
                <div className="prose prose-sm max-w-none">
                  {renderContentWithAds(essay)}
                </div>
              </div>
            </div>
          )}
        </div>
      </ToolLayout>
      
      <GeneratingAdModal 
        open={showAdModal} 
        onComplete={() => setShowAdModal(false)} 
      />
    </>
  );
};

export default EssayWriter;
