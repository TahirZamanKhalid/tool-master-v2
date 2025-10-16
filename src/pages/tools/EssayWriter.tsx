import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Download, Copy } from "lucide-react";
import { LazyAdSpace } from "@/components/LazyAdSpace";
import { ContentAdBreak } from "@/components/ContentAdBreak";
import { SEOHead } from "@/components/SEOHead";

const EssayWriter = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [essay, setEssay] = useState("");
  
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

    try {
      const { data, error } = await supabase.functions.invoke('generate-essay', {
        body: formData
      });

      if (error) throw error;

      if (data.error) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      setEssay(data.essay);
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

    words.forEach((word, index) => {
      currentChunk.push(word);
      wordCount++;

      if (wordCount >= 500 || index === words.length - 1) {
        chunks.push(
          <div key={`chunk-${index}`}>
            <p className="whitespace-pre-wrap mb-4">{currentChunk.join(' ')}</p>
            {wordCount >= 500 && index !== words.length - 1 && (
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar Ad */}
          <div className="hidden lg:block lg:col-span-2">
            <div className="sticky top-4">
              <LazyAdSpace size="skyscraper" />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8">
            {/* Top Ad */}
            <div className="mb-6">
              <LazyAdSpace size="leaderboard" />
            </div>

            <div className="bg-card rounded-lg border p-6 space-y-6">
              <div className="space-y-4">
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

            {/* Bottom Ad */}
            <div className="mt-6">
              <LazyAdSpace size="leaderboard" />
            </div>
          </div>

          {/* Right Sidebar Ad */}
          <div className="hidden lg:block lg:col-span-2">
            <div className="sticky top-4">
              <LazyAdSpace size="skyscraper" />
            </div>
          </div>
        </div>
      </ToolLayout>
    </>
  );
};

export default EssayWriter;
