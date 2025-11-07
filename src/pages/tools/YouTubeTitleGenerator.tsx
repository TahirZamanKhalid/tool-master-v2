import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Youtube, Copy, Sparkles } from "lucide-react";

const YouTubeTitleGenerator = () => {
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState("howto");
  const [titles, setTitles] = useState<string[]>([]);

  const templates = {
    howto: [
      "How to {topic} in 2024 (Step-by-Step Guide)",
      "{topic} Tutorial for Beginners - EASY METHOD!",
      "Learn {topic} in 10 Minutes",
      "The ULTIMATE Guide to {topic}",
      "{topic} Explained Simply"
    ],
    review: [
      "{topic} Review - Is It Worth It?",
      "I Tried {topic} for 30 Days - Here's What Happened",
      "{topic} - Honest Review & Demo",
      "The Truth About {topic} (Review)",
      "Is {topic} ACTUALLY Good? Full Review"
    ],
    listicle: [
      "Top 10 {topic} You NEED to Know",
      "7 Amazing {topic} Tips That Actually Work",
      "5 Best {topic} in 2024",
      "10 {topic} Hacks Everyone Should Know",
      "Best {topic} - Complete List & Guide"
    ],
    vlog: [
      "A Day in My Life: {topic} Edition",
      "I Tried {topic} - Day in the Life",
      "24 Hours of {topic} Challenge",
      "My {topic} Routine Revealed",
      "Behind the Scenes: {topic}"
    ]
  };

  const generateTitles = () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    const selectedTemplates = templates[category as keyof typeof templates];
    const generated = selectedTemplates.map(t => 
      t.replace(/{topic}/g, topic.charAt(0).toUpperCase() + topic.slice(1))
    );

    setTitles(generated);
    toast.success(`Generated ${generated.length} title ideas!`);
  };

  return (
    <ToolLayout
      title="YouTube Title Generator"
      description="Generate catchy YouTube video titles that get clicks. SEO-optimized titles for tutorials, reviews, vlogs. Free YouTube title generator."
      category="Social Media"
      instructions={[
        "Enter your video topic or keyword",
        "Select video category type",
        "Click generate for title ideas",
        "Copy your favorite title"
      ]}
      relatedTools={[
        { name: "Hashtag Generator", path: "/tools/hashtag-generator" },
        { name: "Instagram Bio Generator", path: "/tools/instagram-bio-generator" }
      ]}
    >
      <div className="grid gap-6">
        <Card>
          <CardContent className="p-6 space-y-6">
            <div>
              <Label htmlFor="topic">Video Topic</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., editing photos, making coffee"
                className="mt-2"
              />
            </div>

            <div>
              <Label>Video Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="howto">How-To / Tutorial</SelectItem>
                  <SelectItem value="review">Review / Unboxing</SelectItem>
                  <SelectItem value="listicle">Top 10 / Listicle</SelectItem>
                  <SelectItem value="vlog">Vlog / Day in Life</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={generateTitles} className="w-full" size="lg">
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Titles
            </Button>
          </CardContent>
        </Card>

        {titles.length > 0 && (
          <Card className="border-primary/20">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Youtube className="h-5 w-5 text-red-600" />
                <h3 className="text-lg font-semibold">Title Ideas ({titles.length})</h3>
              </div>

              <div className="space-y-3">
                {titles.map((title, index) => (
                  <div
                    key={index}
                    className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer group"
                    onClick={() => {
                      navigator.clipboard.writeText(title);
                      toast.success("Title copied!");
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm flex-1">{title}</p>
                      <Copy className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">YouTube Title Best Practices</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Under 60 Characters:</strong> Prevents truncation in search</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Front-load Keywords:</strong> Put main keyword first</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Create Curiosity:</strong> Make viewers want to click</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Be Specific:</strong> Tell exactly what video is about</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Use Numbers:</strong> Lists and data perform well</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
};

export default YouTubeTitleGenerator;
