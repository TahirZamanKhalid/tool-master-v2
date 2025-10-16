import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Search, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { SEOSchema } from "@/components/SEOSchema";

interface KeywordData {
  keyword: string;
  count: number;
  density: number;
}

const KeywordDensity = () => {
  const [text, setText] = useState("");
  const [keywords, setKeywords] = useState<KeywordData[]>([]);
  const [stats, setStats] = useState({ words: 0, characters: 0 });

  const analyzeText = () => {
    if (!text.trim()) return;

    // Count words and characters
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const totalWords = words.length;
    const totalChars = text.length;

    // Count keyword frequency
    const wordCount: { [key: string]: number } = {};
    words.forEach((word) => {
      if (word.length > 2) { // Ignore very short words
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });

    // Calculate density and sort
    const keywordData: KeywordData[] = Object.entries(wordCount)
      .map(([keyword, count]) => ({
        keyword,
        count,
        density: (count / totalWords) * 100,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20); // Top 20 keywords

    setKeywords(keywordData);
    setStats({ words: totalWords, characters: totalChars });
  };

  const getDensityColor = (density: number) => {
    if (density < 1) return "text-green-600";
    if (density < 2) return "text-yellow-600";
    return "text-red-600";
  };

  const instructions = [
    "Analyze keyword density to optimize your content for SEO:",
    "",
    "**How to Use:**",
    "1. Paste or type your content in the text area",
    "2. Click 'Analyze Keywords' to see results",
    "3. Review keyword frequency and density percentages",
    "4. Optimize content based on recommendations",
    "",
    "**Understanding Keyword Density:**",
    "- **0-1%**: Optimal density for most keywords",
    "- **1-2%**: Moderate density, may need adjustment",
    "- **2%+**: High density, risk of keyword stuffing",
    "",
    "**SEO Best Practices:**",
    "- Natural keyword usage (avoid stuffing)",
    "- Focus on relevant, valuable keywords",
    "- Include variations and related terms",
    "- Maintain readability and user experience",
    "- Use keywords in titles, headings, and meta descriptions",
    "",
    "**What to Look For:**",
    "- Primary keyword appears naturally throughout",
    "- Good balance of related keywords",
    "- Avoid over-optimization penalties",
    "- Focus on content quality over density",
    "",
    "**Tips:**",
    "- Aim for 1-2% density for main keywords",
    "- Use LSI (Latent Semantic Indexing) keywords",
    "- Prioritize user intent over keyword metrics",
    "- Include keywords in first 100 words",
  ];

  return (
    <ToolLayout
      title="Keyword Density Checker"
      description="Analyze keyword frequency and density in your content for better SEO optimization. Check if you're using keywords naturally or over-optimizing."
      category="SEO & Marketing"
      instructions={instructions}
    >
      <SEOSchema
        type="SoftwareApplication"
        name="Keyword Density Checker"
        description="Free SEO tool to analyze keyword frequency and density for content optimization"
        url="https://toolmaster.cloud/tools/keyword-density"
      />

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Enter Your Content
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste your content here to analyze keyword density..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={12}
              className="font-mono text-sm"
            />
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Words: <span className="font-semibold">{stats.words}</span> | Characters:{" "}
                <span className="font-semibold">{stats.characters}</span>
              </div>
              <Button onClick={analyzeText} disabled={!text.trim()}>
                <TrendingUp className="h-4 w-4 mr-2" />
                Analyze Keywords
              </Button>
            </div>
          </CardContent>
        </Card>

        {keywords.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Keyword Analysis Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {keywords.map((kw, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium bg-primary/10 px-2 py-1 rounded">
                          #{index + 1}
                        </span>
                        <span className="font-semibold">{kw.keyword}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">
                          Count: <span className="font-semibold">{kw.count}</span>
                        </span>
                        <span className={getDensityColor(kw.density)}>
                          Density: <span className="font-semibold">{kw.density.toFixed(2)}%</span>
                        </span>
                      </div>
                    </div>
                    <Progress value={Math.min(kw.density * 20, 100)} className="h-2" />
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg space-y-2">
                <h4 className="font-semibold">Optimization Tips</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Ideal keyword density: 0.5-1.5% for natural content</li>
                  <li>• Avoid keyword stuffing (above 2% density)</li>
                  <li>• Use variations and related terms naturally</li>
                  <li>• Focus on user experience, not just SEO</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
};

export default KeywordDensity;
