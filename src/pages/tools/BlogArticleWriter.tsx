import { useState, useRef } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Download, Copy } from "lucide-react";
import { LazyAdSpace } from "@/components/LazyAdSpace";
import { ContentAdBreak } from "@/components/ContentAdBreak";
import { SEOHead } from "@/components/SEOHead";
import { GeneratingAdModal } from "@/components/GeneratingAdModal";

const BlogArticleWriter = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [blog, setBlog] = useState("");
  const [showAdModal, setShowAdModal] = useState(false);
  const wordCountRef = useRef(0);
  const lastAdWordCount = useRef(0);
  
  const [formData, setFormData] = useState({
    topic: "",
    blogType: "",
    wordCount: "1500",
    targetAudience: "",
    tone: "",
    keywords: "",
    includeImages: false,
    additionalNotes: ""
  });

  const generateBlog = async () => {
    if (!formData.topic || !formData.blogType || !formData.wordCount || !formData.targetAudience || !formData.tone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setBlog("");
    wordCountRef.current = 0;
    lastAdWordCount.current = 0;

    try {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-blog`, {
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
              setBlog(currentContent);

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
        description: "Blog article generated successfully!",
      });
    } catch (error) {
      console.error('Error generating blog:', error);
      toast({
        title: "Error",
        description: "Failed to generate blog article. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(blog);
    toast({
      title: "Copied",
      description: "Blog article copied to clipboard",
    });
  };

  const downloadBlog = () => {
    const blob = new Blob([blog], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blog-${formData.topic.substring(0, 30)}.txt`;
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
        title="AI Blog Article Writer - Generate SEO-Optimized Blog Posts Free"
        description="Create engaging, SEO-optimized blog articles with our AI blog writer. Generate professional blog posts for any topic, audience, and word count. Free online blog generator tool."
        keywords="blog writer, AI blog generator, blog post generator, content writer, SEO blog, article writer, free blog generator"
        canonical="https://yourdomain.com/tools/blog-article-writer"
      />
      
      <ToolLayout
        title="AI Blog Article Writer"
        description="Generate engaging, SEO-optimized blog articles with AI. Perfect for bloggers, marketers, and content creators."
        category="AI & Content"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="hidden lg:block lg:col-span-2">
            <div className="sticky top-4">
              <LazyAdSpace type="display" slot="2918331088" />
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="mb-6">
              <LazyAdSpace type="display" slot="4402803148" />
            </div>

            <div className="bg-card rounded-lg border p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="topic">Blog Topic *</Label>
                  <Input
                    id="topic"
                    value={formData.topic}
                    onChange={(e) => setFormData({...formData, topic: e.target.value})}
                    placeholder="Enter your blog topic..."
                  />
                </div>

                <div>
                  <Label htmlFor="blogType">Blog Type *</Label>
                  <Select value={formData.blogType} onValueChange={(value) => setFormData({...formData, blogType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select blog type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="how-to">How-to Guide</SelectItem>
                      <SelectItem value="listicle">Listicle</SelectItem>
                      <SelectItem value="tutorial">Tutorial</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="comparison">Comparison</SelectItem>
                      <SelectItem value="news">News/Update</SelectItem>
                      <SelectItem value="opinion">Opinion Piece</SelectItem>
                      <SelectItem value="case-study">Case Study</SelectItem>
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
                      <SelectItem value="500">500 words</SelectItem>
                      <SelectItem value="750">750 words</SelectItem>
                      <SelectItem value="1000">1000 words</SelectItem>
                      <SelectItem value="1500">1500 words</SelectItem>
                      <SelectItem value="2000">2000 words</SelectItem>
                      <SelectItem value="2500">2500 words</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="targetAudience">Target Audience *</Label>
                  <Select value={formData.targetAudience} onValueChange={(value) => setFormData({...formData, targetAudience: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select target audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginners">Beginners</SelectItem>
                      <SelectItem value="intermediate">Intermediate Users</SelectItem>
                      <SelectItem value="experts">Experts/Professionals</SelectItem>
                      <SelectItem value="general">General Audience</SelectItem>
                      <SelectItem value="business">Business Professionals</SelectItem>
                      <SelectItem value="students">Students</SelectItem>
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
                      <SelectItem value="conversational">Conversational</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="authoritative">Authoritative</SelectItem>
                      <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                      <SelectItem value="informative">Informative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="keywords">SEO Keywords (Optional)</Label>
                  <Input
                    id="keywords"
                    value={formData.keywords}
                    onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                    placeholder="Enter keywords separated by commas..."
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeImages"
                    checked={formData.includeImages}
                    onCheckedChange={(checked) => setFormData({...formData, includeImages: checked as boolean})}
                  />
                  <Label htmlFor="includeImages" className="cursor-pointer">
                    Include image placeholders
                  </Label>
                </div>

                <div>
                  <Label htmlFor="additionalNotes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="additionalNotes"
                    value={formData.additionalNotes}
                    onChange={(e) => setFormData({...formData, additionalNotes: e.target.value})}
                    placeholder="Any specific requirements, examples to include, or special instructions..."
                    rows={4}
                  />
                </div>

                <Button onClick={generateBlog} disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Blog Article...
                    </>
                  ) : (
                    "Generate Blog Article"
                  )}
                </Button>
              </div>

              {blog && (
                <div className="mt-6 space-y-4">
                  <div className="flex gap-2">
                    <Button onClick={copyToClipboard} variant="outline" size="sm">
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                    <Button onClick={downloadBlog} variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                  
                  <div className="bg-muted p-6 rounded-lg">
                    <h3 className="font-semibold mb-4 text-lg">Generated Blog Article:</h3>
                    <div className="prose prose-sm max-w-none">
                      {renderContentWithAds(blog)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6">
              <LazyAdSpace type="multiplex" slot="4356563508" />
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-2">
            <div className="sticky top-4">
              <LazyAdSpace type="display" slot="4402803148" />
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

export default BlogArticleWriter;
