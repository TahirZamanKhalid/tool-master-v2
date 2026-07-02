import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { TrendingUp, CheckCircle2, AlertCircle, XCircle } from "lucide-react";

interface AnalysisResult {
  score: number;
  wordCount: number;
  keywordDensity: number;
  headings: { h1: number; h2: number; h3: number };
  paragraphs: number;
  readability: string;
  issues: string[];
  recommendations: string[];
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const SEOContentAnalyzer = () => {
  const [title, setTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [content, setContent] = useState("");
  const [focusKeyword, setFocusKeyword] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const analyzeContent = () => {
    if (!content.trim()) {
      setAnalysis(null);
      toast.error("Please enter content to analyze");
      return;
    }

    const wordCount = content.trim().split(/\s+/).length;
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Title analysis
    if (!title.trim()) {
      issues.push("Missing page title");
      score -= 10;
    } else if (title.length < 30) {
      issues.push("Title is too short (< 30 characters)");
      score -= 5;
    } else if (title.length > 60) {
      issues.push("Title is too long (> 60 characters)");
      score -= 5;
    }

    // Meta description analysis
    if (!metaDescription.trim()) {
      issues.push("Missing meta description");
      score -= 10;
    } else if (metaDescription.length < 120) {
      issues.push("Meta description is too short (< 120 characters)");
      score -= 5;
    } else if (metaDescription.length > 160) {
      issues.push("Meta description is too long (> 160 characters)");
      score -= 5;
    }

    // Word count analysis
    if (wordCount < 300) {
      issues.push("Content is too short (< 300 words)");
      score -= 15;
      recommendations.push("Aim for at least 300-500 words for better SEO");
    } else if (wordCount < 500) {
      recommendations.push("Consider expanding to 1000+ words for comprehensive coverage");
    }

    // Keyword density
    let keywordDensity = 0;
    if (focusKeyword.trim()) {
      const keyword = focusKeyword.toLowerCase();
      const contentLower = content.toLowerCase();
      const keywordPattern = new RegExp(`\\b${escapeRegExp(keyword)}\\b`, "g");
      const keywordCount = (contentLower.match(keywordPattern) || []).length;
      keywordDensity = (keywordCount / wordCount) * 100;

      if (keywordCount === 0) {
        issues.push("Focus keyword not found in content");
        score -= 15;
      } else if (keywordDensity < 0.5) {
        issues.push("Keyword density too low (< 0.5%)");
        score -= 5;
      } else if (keywordDensity > 3) {
        issues.push("Keyword density too high (> 3%) - risk of keyword stuffing");
        score -= 10;
      }

      // Check keyword in title
      if (title && !title.toLowerCase().includes(keyword)) {
        issues.push("Focus keyword not in title");
        score -= 10;
      }

      // Check keyword in meta description
      if (metaDescription && !metaDescription.toLowerCase().includes(keyword)) {
        issues.push("Focus keyword not in meta description");
        score -= 5;
      }

      // Check keyword in first paragraph
      const firstPara = content.split("\n")[0];
      if (!firstPara.toLowerCase().includes(keyword)) {
        recommendations.push("Include focus keyword in the first paragraph");
      }
    } else {
      recommendations.push("Define a focus keyword for better optimization");
    }

    // Heading analysis
    const h1Count = (content.match(/^#\s/gm) || []).length;
    const h2Count = (content.match(/^##\s/gm) || []).length;
    const h3Count = (content.match(/^###\s/gm) || []).length;

    if (h1Count === 0) {
      issues.push("No H1 heading found");
      score -= 10;
    } else if (h1Count > 1) {
      issues.push("Multiple H1 headings found (should have only one)");
      score -= 5;
    }

    if (h2Count === 0 && wordCount > 500) {
      issues.push("No H2 headings found - use subheadings for better structure");
      score -= 5;
    }

    // Paragraph analysis
    const paragraphs = content.split("\n\n").filter(p => p.trim().length > 0).length;
    const avgWordsPerParagraph = wordCount / (paragraphs || 1);

    if (avgWordsPerParagraph > 150) {
      recommendations.push("Break long paragraphs into smaller ones (< 150 words each)");
    }

    // Readability
    const avgWordsPerSentence = wordCount / (content.split(/[.!?]+/).length || 1);
    let readability = "Good";
    if (avgWordsPerSentence > 25) {
      readability = "Difficult";
      recommendations.push("Simplify sentences (average > 25 words per sentence)");
    } else if (avgWordsPerSentence > 20) {
      readability = "Moderate";
    }

    // External links
    const externalLinks = (content.match(/\[.*?\]\((https?:\/\/.*?)\)/g) || []).length;
    if (externalLinks === 0 && wordCount > 500) {
      recommendations.push("Consider adding relevant external links to authoritative sources");
    }

    // Internal links suggestion
    recommendations.push("Add internal links to related content on your site");

    // Images
    const images = (content.match(/!\[.*?\]\(.*?\)/g) || []).length;
    if (images === 0 && wordCount > 500) {
      recommendations.push("Add images with descriptive alt text to improve engagement");
    }

    // Ensure score is within bounds
    score = Math.max(0, Math.min(100, score));

    setAnalysis({
      score,
      wordCount,
      keywordDensity: parseFloat(keywordDensity.toFixed(2)),
      headings: { h1: h1Count, h2: h2Count, h3: h3Count },
      paragraphs,
      readability,
      issues,
      recommendations
    });

    toast.success("Content analyzed successfully!");
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Needs Improvement";
    return "Poor";
  };

  return (
    <ToolLayout
      title="SEO Content Analyzer"
      description="Analyze your content for SEO best practices and get actionable recommendations. Free SEO content optimization tool."
      category="SEO & Marketing"
      instructions={[
        "Enter your page title and meta description",
        "Paste your content (supports Markdown)",
        "Enter your focus keyword",
        "Click analyze to get SEO score and recommendations",
        "Implement suggestions to improve your content"
      ]}
      relatedTools={[
        { name: "Keyword Research Tool", path: "/tools/keyword-research" },
        { name: "Title & Meta Checker", path: "/tools/title-meta-checker" },
        { name: "Keyword Density Checker", path: "/tools/keyword-density" }
      ]}
    >
      <div className="grid gap-6">
        <Card>
          <CardContent className="p-6 space-y-6">
            <div>
              <Label htmlFor="title">Page Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Your page title (50-60 characters)"
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {title.length} / 60 characters
              </p>
            </div>

            <div>
              <Label htmlFor="meta-description">Meta Description</Label>
              <Textarea
                id="meta-description"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Your meta description (120-160 characters)"
                className="mt-2 h-20"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {metaDescription.length} / 160 characters
              </p>
            </div>

            <div>
              <Label htmlFor="focus-keyword">Focus Keyword (optional)</Label>
              <Input
                id="focus-keyword"
                value={focusKeyword}
                onChange={(e) => setFocusKeyword(e.target.value)}
                placeholder="e.g., digital marketing tips"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="content">Content (Markdown supported)</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="# Your Main Heading&#10;&#10;Your content goes here..."
                className="mt-2 h-64 font-mono"
              />
            </div>

            <Button onClick={analyzeContent} className="w-full" size="lg">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analyze Content
            </Button>
          </CardContent>
        </Card>

        {analysis && (
          <>
            <Card className="border-primary/20">
              <CardContent className="p-6 space-y-4">
                <div className="text-center">
                  <div className={`text-5xl font-bold ${getScoreColor(analysis.score)}`}>
                    {analysis.score}
                  </div>
                  <div className="text-lg font-semibold mt-2">
                    {getScoreLabel(analysis.score)}
                  </div>
                  <Progress value={analysis.score} className="mt-4" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">{analysis.wordCount}</div>
                    <div className="text-sm text-muted-foreground">Words</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">{analysis.keywordDensity}%</div>
                    <div className="text-sm text-muted-foreground">Keyword Density</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">{analysis.headings.h2}</div>
                    <div className="text-sm text-muted-foreground">H2 Headings</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">{analysis.readability}</div>
                    <div className="text-sm text-muted-foreground">Readability</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {analysis.issues.length > 0 && (
              <Card className="border-red-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <XCircle className="h-5 w-5 text-red-500" />
                    <h3 className="text-lg font-semibold">Issues Found</h3>
                  </div>
                  <ul className="space-y-2">
                    {analysis.issues.map((issue, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {analysis.recommendations.length > 0 && (
              <Card className="border-blue-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="h-5 w-5 text-blue-500" />
                    <h3 className="text-lg font-semibold">Recommendations</h3>
                  </div>
                  <ul className="space-y-2">
                    {analysis.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </>
        )}

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">SEO Content Best Practices</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">-</span>
                <span><strong>Quality over quantity:</strong> Focus on comprehensive, valuable content</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">-</span>
                <span><strong>Keyword placement:</strong> Include keywords naturally in title, headings, and first paragraph</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">-</span>
                <span><strong>Structure:</strong> Use clear heading hierarchy (H1, H2, H3)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">-</span>
                <span><strong>Readability:</strong> Write for humans first, search engines second</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">-</span>
                <span><strong>Links:</strong> Include relevant internal and external links</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
};

export default SEOContentAnalyzer;
