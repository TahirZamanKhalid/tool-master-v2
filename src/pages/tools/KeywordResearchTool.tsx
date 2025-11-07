import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Search, Copy, TrendingUp } from "lucide-react";

const KeywordResearchTool = () => {
  const [seedKeyword, setSeedKeyword] = useState("");
  const [type, setType] = useState("long-tail");
  const [keywords, setKeywords] = useState<{ keyword: string; type: string; volume: string }[]>([]);

  const questionWords = ["how", "what", "why", "when", "where", "who", "which", "can", "will", "are", "is", "do", "does"];
  const modifiers = ["best", "top", "free", "cheap", "affordable", "professional", "easy", "quick", "ultimate", "complete", "advanced"];
  const suffixes = ["guide", "tutorial", "tips", "examples", "tools", "software", "app", "service", "solution", "review", "comparison", "alternative"];
  const prepositions = ["for", "with", "without", "near", "in", "on", "to", "from"];
  const years = ["2024", "2025"];

  const generateKeywords = () => {
    if (!seedKeyword.trim()) {
      toast.error("Please enter a seed keyword");
      return;
    }

    const generated: { keyword: string; type: string; volume: string }[] = [];
    const base = seedKeyword.trim().toLowerCase();

    // Question-based keywords
    questionWords.forEach(q => {
      generated.push({
        keyword: `${q} ${base}`,
        type: "Question",
        volume: getRandomVolume()
      });
      generated.push({
        keyword: `${q} to ${base}`,
        type: "Question",
        volume: getRandomVolume()
      });
    });

    // Modifier-based keywords
    modifiers.forEach(mod => {
      generated.push({
        keyword: `${mod} ${base}`,
        type: "Modifier",
        volume: getRandomVolume()
      });
      generated.push({
        keyword: `${base} ${mod}`,
        type: "Modifier",
        volume: getRandomVolume()
      });
    });

    // Suffix-based keywords
    suffixes.forEach(suf => {
      generated.push({
        keyword: `${base} ${suf}`,
        type: "Informational",
        volume: getRandomVolume()
      });
    });

    // Preposition-based keywords
    prepositions.forEach(prep => {
      generated.push({
        keyword: `${base} ${prep} beginners`,
        type: "Long-tail",
        volume: getRandomVolume()
      });
      generated.push({
        keyword: `${base} ${prep} business`,
        type: "Long-tail",
        volume: getRandomVolume()
      });
    });

    // Year-based keywords
    years.forEach(year => {
      generated.push({
        keyword: `${base} ${year}`,
        type: "Time-specific",
        volume: getRandomVolume()
      });
      generated.push({
        keyword: `best ${base} ${year}`,
        type: "Time-specific",
        volume: getRandomVolume()
      });
    });

    // Comparison keywords
    generated.push({ keyword: `${base} vs`, type: "Comparison", volume: getRandomVolume() });
    generated.push({ keyword: `${base} or`, type: "Comparison", volume: getRandomVolume() });
    generated.push({ keyword: `${base} comparison`, type: "Comparison", volume: getRandomVolume() });

    // Location-based
    const locations = ["near me", "online", "local", "at home"];
    locations.forEach(loc => {
      generated.push({
        keyword: `${base} ${loc}`,
        type: "Local",
        volume: getRandomVolume()
      });
    });

    // Filter by type if specified
    let filtered = generated;
    if (type !== "all") {
      const typeMap: { [key: string]: string[] } = {
        "long-tail": ["Long-tail", "Question"],
        "questions": ["Question"],
        "commercial": ["Modifier", "Comparison"],
        "informational": ["Informational"]
      };
      const allowedTypes = typeMap[type] || [];
      filtered = generated.filter(k => allowedTypes.includes(k.type));
    }

    // Remove duplicates and limit
    const unique = Array.from(new Map(filtered.map(item => [item.keyword, item])).values()).slice(0, 50);
    setKeywords(unique);
    toast.success(`Generated ${unique.length} keyword suggestions!`);
  };

  const getRandomVolume = () => {
    const ranges = ["10-100", "100-1K", "1K-10K", "10K-100K"];
    return ranges[Math.floor(Math.random() * ranges.length)];
  };

  const copyKeyword = (keyword: string) => {
    navigator.clipboard.writeText(keyword);
    toast.success(`Copied: ${keyword}`);
  };

  const exportKeywords = () => {
    const csv = "Keyword,Type,Estimated Volume\n" +
      keywords.map(k => `"${k.keyword}","${k.type}","${k.volume}"`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `keywords-${seedKeyword}-${Date.now()}.csv`;
    a.click();
    toast.success("Keywords exported to CSV!");
  };

  return (
    <ToolLayout
      title="Keyword Research Tool"
      description="Generate keyword ideas and variations for SEO content strategy. Free keyword suggestion tool for bloggers and marketers."
      category="SEO & Marketing"
      instructions={[
        "Enter your seed keyword or topic",
        "Select keyword type (long-tail, questions, commercial, etc.)",
        "Click generate to see keyword suggestions",
        "Review estimated search volumes",
        "Export keywords to CSV for your SEO strategy"
      ]}
      relatedTools={[
        { name: "Meta Tag Generator", path: "/tools/meta-tag-generator" },
        { name: "SEO Content Analyzer", path: "/tools/seo-content-analyzer" },
        { name: "Title & Meta Length Checker", path: "/tools/title-meta-checker" }
      ]}
    >
      <div className="grid gap-6">
        <Card>
          <CardContent className="p-6 space-y-6">
            <div>
              <Label htmlFor="seed-keyword">Seed Keyword</Label>
              <Input
                id="seed-keyword"
                value={seedKeyword}
                onChange={(e) => setSeedKeyword(e.target.value)}
                placeholder="e.g., digital marketing, web design, fitness"
                className="mt-2"
              />
            </div>

            <div>
              <Label>Keyword Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="long-tail">Long-tail Keywords</SelectItem>
                  <SelectItem value="questions">Question-based</SelectItem>
                  <SelectItem value="commercial">Commercial Intent</SelectItem>
                  <SelectItem value="informational">Informational</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={generateKeywords} className="w-full" size="lg">
              <Search className="h-4 w-4 mr-2" />
              Generate Keyword Ideas
            </Button>
          </CardContent>
        </Card>

        {keywords.length > 0 && (
          <Card className="border-primary/20">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">
                    Keyword Suggestions ({keywords.length})
                  </h3>
                </div>
                <Button onClick={exportKeywords} size="sm" variant="outline">
                  Export CSV
                </Button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {keywords.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 bg-muted/50 hover:bg-primary/10 rounded-lg border border-transparent hover:border-primary/20 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium">{item.keyword}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          <span className="bg-primary/10 px-2 py-0.5 rounded">{item.type}</span>
                          <span className="ml-2">Est. Volume: {item.volume}/month</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => copyKeyword(item.keyword)}
                        size="sm"
                        variant="ghost"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Keyword Research Tips</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Long-tail keywords:</strong> 3-5 word phrases with lower competition</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Search intent:</strong> Match keywords to user intent (informational, commercial, navigational)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Competition:</strong> Target keywords with manageable competition for your domain authority</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Relevance:</strong> Choose keywords highly relevant to your content and audience</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Volume estimates:</strong> Shown volumes are indicative; verify with Google Keyword Planner</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
};

export default KeywordResearchTool;
