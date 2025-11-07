import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Instagram, Copy, Sparkles } from "lucide-react";

const InstagramBioGenerator = () => {
  const [niche, setNiche] = useState("");
  const [vibe, setVibe] = useState("professional");
  const [includeEmojis, setIncludeEmojis] = useState(true);
  const [includeHashtags, setIncludeHashtags] = useState(false);
  const [bios, setBios] = useState<string[]>([]);

  const emojis = {
    professional: ["💼", "📊", "🎯", "✨", "🚀", "💡", "📈", "🏆"],
    creative: ["🎨", "✨", "🌟", "💫", "🎭", "🖌️", "🌈", "💎"],
    lifestyle: ["🌸", "✨", "🌺", "💕", "🦋", "🌟", "💖", "🎀"],
    fitness: ["💪", "🏋️", "🔥", "⚡", "🎯", "🏃", "💯", "✨"],
    food: ["🍕", "🍔", "🍰", "☕", "🥑", "🍜", "🍣", "🎂"],
    travel: ["✈️", "🌍", "🗺️", "📸", "🌴", "🏖️", "🎒", "🌅"],
    tech: ["💻", "📱", "🚀", "⚡", "🔥", "💡", "🌐", "🤖"],
    music: ["🎵", "🎶", "🎸", "🎹", "🎤", "🎧", "🎼", "✨"]
  };

  const templates = {
    professional: [
      "{niche} Expert | Helping you succeed",
      "Professional {niche} | DM for collabs",
      "{niche} Specialist | Building dreams",
      "Your go-to {niche} resource",
      "{niche} Coach | Transforming lives"
    ],
    creative: [
      "Creating magic with {niche}",
      "{niche} artist | Dream believer",
      "Crafting stories through {niche}",
      "{niche} creator | Making waves",
      "Living creatively through {niche}"
    ],
    lifestyle: [
      "Living my best life | {niche} lover",
      "{niche} enthusiast | Coffee addict",
      "Just a {niche} girl/guy in a {niche} world",
      "Collecting moments, not things | {niche}",
      "Life is short, make it {niche}"
    ],
    casual: [
      "{niche} vibes only",
      "Just doing {niche} things",
      "{niche} is my therapy",
      "Part-time {niche}, full-time dreamer",
      "{niche} & chill"
    ]
  };

  const generateBios = () => {
    if (!niche.trim()) {
      toast.error("Please enter your niche or interest");
      return;
    }

    const selectedTemplates = templates[vibe as keyof typeof templates] || templates.professional;
    const selectedEmojis = emojis[niche.toLowerCase() as keyof typeof emojis] || emojis.professional;

    const generated: string[] = [];

    selectedTemplates.forEach(template => {
      let bio = template.replace(/{niche}/g, niche);

      if (includeEmojis) {
        const randomEmojis = selectedEmojis.slice(0, 3).join(" ");
        bio = `${randomEmojis} ${bio}`;
      }

      if (includeHashtags) {
        bio += `\n#${niche.replace(/\s+/g, "")} #lifestyle #daily`;
      }

      generated.push(bio);
    });

    // Add some bonus creative ones
    if (includeEmojis) {
      generated.push(`${selectedEmojis[0]} ${niche} lover\n${selectedEmojis[1]} Creating & inspiring\n${selectedEmojis[2]} DM for collabs`);
      generated.push(`${niche} | Dreamer | Creator\n${selectedEmojis.slice(0, 5).join("")}`);
    }

    setBios(generated);
    toast.success(`Generated ${generated.length} Instagram bios!`);
  };

  const copyBio = (bio: string) => {
    navigator.clipboard.writeText(bio);
    toast.success("Bio copied to clipboard!");
  };

  return (
    <ToolLayout
      title="Instagram Bio Generator"
      description="Generate creative Instagram bio ideas with emojis and hashtags. Perfect for influencers, businesses, and personal accounts. Free Instagram bio generator."
      category="Social Media"
      instructions={[
        "Enter your niche or main interest",
        "Select bio vibe/style",
        "Choose emoji and hashtag options",
        "Click generate for bio ideas",
        "Click to copy your favorite bio"
      ]}
      relatedTools={[
        { name: "Hashtag Generator", path: "/tools/hashtag-generator" },
        { name: "Caption Generator", path: "/tools/caption-generator" },
        { name: "YouTube Title Generator", path: "/tools/youtube-title-generator" }
      ]}
    >
      <div className="grid gap-6">
        <Card>
          <CardContent className="p-6 space-y-6">
            <div>
              <Label htmlFor="niche">Your Niche/Interest</Label>
              <Input
                id="niche"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="e.g., fitness, travel, photography"
                className="mt-2"
              />
            </div>

            <div>
              <Label>Bio Vibe</Label>
              <Select value={vibe} onValueChange={setVibe}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="creative">Creative & Artistic</SelectItem>
                  <SelectItem value="lifestyle">Lifestyle & Fun</SelectItem>
                  <SelectItem value="casual">Casual & Chill</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="emojis"
                  checked={includeEmojis}
                  onCheckedChange={(checked) => setIncludeEmojis(checked as boolean)}
                />
                <label htmlFor="emojis" className="text-sm font-medium">
                  Include emojis (Recommended)
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hashtags"
                  checked={includeHashtags}
                  onCheckedChange={(checked) => setIncludeHashtags(checked as boolean)}
                />
                <label htmlFor="hashtags" className="text-sm font-medium">
                  Include hashtags
                </label>
              </div>
            </div>

            <Button onClick={generateBios} className="w-full" size="lg">
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Instagram Bios
            </Button>
          </CardContent>
        </Card>

        {bios.length > 0 && (
          <Card className="border-primary/20">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Instagram className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Generated Bios ({bios.length})</h3>
              </div>

              <div className="space-y-3">
                {bios.map((bio, index) => (
                  <div
                    key={index}
                    className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer group"
                    onClick={() => copyBio(bio)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm whitespace-pre-line flex-1">{bio}</p>
                      <Copy className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Instagram Bio Tips</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>150 Character Limit:</strong> Keep it concise</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Use Line Breaks:</strong> Makes it easier to read</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Add Personality:</strong> Show who you are</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Include CTA:</strong> Tell people what to do</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Update Regularly:</strong> Keep it fresh and relevant</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
};

export default InstagramBioGenerator;
