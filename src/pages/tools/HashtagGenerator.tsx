import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Hash, Copy, Sparkles, TrendingUp } from "lucide-react";

const HashtagGenerator = () => {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [style, setStyle] = useState("mixed");
  const [count, setCount] = useState("30");
  const [hashtags, setHashtags] = useState<string[]>([]);

  const hashtagDatabase = {
    instagram: {
      trending: ["#instagood", "#photooftheday", "#love", "#fashion", "#beautiful", "#happy", "#cute", "#followme", "#picoftheday", "#art"],
      engagement: ["#likeforlikes", "#followforfollowback", "#instadaily", "#instalike", "#explorepage", "#viral", "#reels", "#trending"],
      popular: ["#style", "#lifestyle", "#photography", "#travel", "#food", "#fitness", "#nature", "#beauty", "#motivation"]
    },
    tiktok: {
      trending: ["#fyp", "#foryou", "#foryoupage", "#viral", "#trending", "#tiktok", "#xyzbca"],
      engagement: ["#viralvideos", "#explorepage", "#viral", "#trend", "#trending", "#fypシ"],
      popular: ["#dance", "#comedy", "#funny", "#prank", "#challenge", "#duet", "#tutorial"]
    },
    twitter: {
      trending: ["#trending", "#viral", "#news", "#breaking", "#tech", "#business"],
      engagement: ["#follow", "#rt", "#retweet", "#like", "#share"],
      popular: ["#daily", "#tips", "#motivation", "#quote", "#thread", "#discussion"]
    },
    youtube: {
      trending: ["#youtube", "#youtuber", "#subscribe", "#video", "#gaming", "#vlog", "#tutorial"],
      engagement: ["#like", "#comment", "#share", "#subscribe", "#new", "#shorts"],
      popular: ["#howto", "#review", "#unboxing", "#gameplay", "#music", "#comedy", "#travel"]
    }
  };

  const generateHashtags = () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    const platformTags = hashtagDatabase[platform as keyof typeof hashtagDatabase];
    const generated: string[] = [];

    // Add topic-based hashtags
    const topicWords = topic.toLowerCase().split(" ").filter(w => w.length > 2);
    topicWords.forEach(word => {
      generated.push(`#${word}`);
      generated.push(`#${word}gram`);
      generated.push(`#${word}lover`);
      generated.push(`#${word}daily`);
    });

    // Add platform-specific hashtags
    if (style === "trending" || style === "mixed") {
      generated.push(...platformTags.trending);
    }
    if (style === "engagement" || style === "mixed") {
      generated.push(...platformTags.engagement);
    }
    if (style === "popular" || style === "mixed") {
      generated.push(...platformTags.popular);
    }

    // Remove duplicates and limit
    const unique = Array.from(new Set(generated));
    const limited = unique.slice(0, parseInt(count));

    setHashtags(limited);
    toast.success(`Generated ${limited.length} hashtags!`);
  };

  const copyAll = () => {
    const text = hashtags.join(" ");
    navigator.clipboard.writeText(text);
    toast.success("Hashtags copied to clipboard!");
  };

  const copyHashtag = (tag: string) => {
    navigator.clipboard.writeText(tag);
    toast.success(`Copied ${tag}`);
  };

  return (
    <ToolLayout
      title="Hashtag Generator"
      description="Generate trending hashtags for Instagram, TikTok, Twitter, and YouTube. Boost your social media reach with relevant hashtags. Free hashtag generator."
      category="Social Media"
      instructions={[
        "Enter your content topic or keywords",
        "Select social media platform",
        "Choose hashtag style (trending, engagement, popular)",
        "Set how many hashtags you need",
        "Click generate and copy hashtags"
      ]}
      relatedTools={[
        { name: "Instagram Bio Generator", path: "/tools/instagram-bio-generator" },
        { name: "Caption Generator", path: "/tools/caption-generator" },
        { name: "YouTube Title Generator", path: "/tools/youtube-title-generator" }
      ]}
    >
      <div className="grid gap-6">
        <Card>
          <CardContent className="p-6 space-y-6">
            {/* Topic Input */}
            <div>
              <Label htmlFor="topic">Content Topic or Keywords</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., fitness, fashion, travel, food"
                className="mt-2"
              />
            </div>

            {/* Platform Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Platform</Label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="twitter">Twitter</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Hashtag Style</Label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mixed">Mixed (Recommended)</SelectItem>
                    <SelectItem value="trending">Trending Only</SelectItem>
                    <SelectItem value="engagement">High Engagement</SelectItem>
                    <SelectItem value="popular">Popular Tags</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Count Selection */}
            <div>
              <Label>Number of Hashtags</Label>
              <Select value={count} onValueChange={setCount}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 hashtags</SelectItem>
                  <SelectItem value="20">20 hashtags</SelectItem>
                  <SelectItem value="30">30 hashtags (Recommended)</SelectItem>
                  <SelectItem value="50">50 hashtags</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Generate Button */}
            <Button onClick={generateHashtags} className="w-full" size="lg">
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Hashtags
            </Button>
          </CardContent>
        </Card>

        {/* Generated Hashtags */}
        {hashtags.length > 0 && (
          <>
            <Card className="border-primary/20">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Hash className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Generated Hashtags ({hashtags.length})</h3>
                  </div>
                  <Button onClick={copyAll} size="sm">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy All
                  </Button>
                </div>

                {/* Hashtag Grid */}
                <div className="flex flex-wrap gap-2">
                  {hashtags.map((tag, index) => (
                    <button
                      key={index}
                      onClick={() => copyHashtag(tag)}
                      className="px-3 py-2 bg-primary/10 hover:bg-primary/20 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                {/* Copy as Text */}
                <div className="pt-4 border-t">
                  <Label>Copy as Text</Label>
                  <Textarea
                    value={hashtags.join(" ")}
                    readOnly
                    className="mt-2 font-mono text-sm"
                    rows={4}
                    onClick={(e) => e.currentTarget.select()}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Hashtag Best Practices
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>Instagram:</strong> Use 20-30 hashtags for maximum reach</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>TikTok:</strong> Use 3-5 trending hashtags including #fyp</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>Twitter:</strong> Use 1-2 relevant hashtags per tweet</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>YouTube:</strong> Use hashtags in video description and title</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>Mix:</strong> Combine trending, niche, and branded hashtags</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>Research:</strong> Check hashtag popularity before using</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>Relevance:</strong> Only use hashtags related to your content</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </ToolLayout>
  );
};

export default HashtagGenerator;
