import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Heading, CheckCircle2, AlertCircle, XCircle } from "lucide-react";

interface HeadingItem {
  level: number;
  text: string;
  issues: string[];
}

const HeadingAnalyzer = () => {
  const [html, setHtml] = useState("");
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [issues, setIssues] = useState<string[]>([]);

  const analyzeHeadings = () => {
    if (!html.trim()) {
      toast.error("Please enter HTML content");
      return;
    }

    const foundHeadings: HeadingItem[] = [];
    const allIssues: string[] = [];

    const doc = new DOMParser().parseFromString(html, "text/html");
    const headingElements = Array.from(doc.querySelectorAll("h1, h2, h3, h4, h5, h6"));

    headingElements.forEach((element) => {
      const level = parseInt(element.tagName.substring(1), 10);
      const text = element.textContent?.replace(/\s+/g, " ").trim() || "";

      const itemIssues: string[] = [];

      // Check for empty headings
      if (!text) {
        itemIssues.push("Empty heading");
      }

      // Check heading length
      if (text.length > 70) {
        itemIssues.push("Too long (> 70 characters)");
      }

      // Check for ALL CAPS
      if (text === text.toUpperCase() && text.length > 3) {
        itemIssues.push("ALL CAPS not recommended");
      }

      foundHeadings.push({ level, text: text || "(empty)", issues: itemIssues });
    });

    // Analyze structure
    const h1Count = foundHeadings.filter(h => h.level === 1).length;
    const h2Count = foundHeadings.filter(h => h.level === 2).length;

    // Check for missing H1
    if (h1Count === 0) {
      allIssues.push("No H1 heading found - every page should have exactly one H1");
    }

    // Check for multiple H1s
    if (h1Count > 1) {
      allIssues.push(`Multiple H1 headings found (${h1Count}) - should have only one`);
    }

    // Check for skipped heading levels
    for (let i = 1; i < foundHeadings.length; i++) {
      const current = foundHeadings[i].level;
      const previous = foundHeadings[i - 1].level;

      if (current - previous > 1) {
        allIssues.push(`Skipped heading level: H${previous} -> H${current} (line ${i + 1})`);
      }
    }

    // Check if first heading is H1
    if (foundHeadings.length > 0 && foundHeadings[0].level !== 1) {
      allIssues.push("First heading should be H1");
    }

    // Check for insufficient subheadings
    if (h2Count === 0 && foundHeadings.length > 1) {
      allIssues.push("No H2 headings found - use subheadings for better structure");
    }

    setHeadings(foundHeadings);
    setIssues(allIssues);

    if (foundHeadings.length === 0) {
      toast.error("No headings found in HTML");
    } else {
      toast.success(`Found ${foundHeadings.length} headings`);
    }
  };

  const getHeadingColor = (level: number) => {
    const colors = [
      "text-red-600 font-bold",
      "text-orange-600 font-semibold",
      "text-yellow-600 font-semibold",
      "text-green-600",
      "text-blue-600",
      "text-purple-600"
    ];
    return colors[level - 1] || "text-gray-600";
  };

  return (
    <ToolLayout
      title="Heading Structure Analyzer"
      description="Analyze HTML heading structure (H1-H6) for SEO and accessibility. Check heading hierarchy and best practices."
      category="SEO & Marketing"
      instructions={[
        "Paste your HTML content",
        "Click analyze to check heading structure",
        "Review heading hierarchy visualization",
        "Check for SEO and accessibility issues",
        "Fix any structural problems identified"
      ]}
      relatedTools={[
        { name: "SEO Content Analyzer", path: "/tools/seo-content-analyzer" },
        { name: "Title & Meta Checker", path: "/tools/title-meta-checker" },
        { name: "HTML Preview", path: "/tools/html-preview" }
      ]}
    >
      <div className="grid gap-6">
        <Card>
          <CardContent className="p-6 space-y-6">
            <div>
              <Label htmlFor="html">HTML Content</Label>
              <Textarea
                id="html"
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                placeholder="<h1>Main Title</h1>&#10;<h2>Section 1</h2>&#10;<h3>Subsection 1.1</h3>..."
                className="mt-2 h-64 font-mono text-sm"
              />
            </div>

            <Button onClick={analyzeHeadings} className="w-full" size="lg">
              <Heading className="h-4 w-4 mr-2" />
              Analyze Heading Structure
            </Button>
          </CardContent>
        </Card>

        {headings.length > 0 && (
          <>
            {issues.length > 0 && (
              <Card className="border-red-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <XCircle className="h-5 w-5 text-red-500" />
                    <h3 className="text-lg font-semibold">Structure Issues ({issues.length})</h3>
                  </div>
                  <ul className="space-y-2">
                    {issues.map((issue, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <Card className="border-primary/20">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heading className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Heading Hierarchy ({headings.length})</h3>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    H1: {headings.filter(h => h.level === 1).length} |
                    H2: {headings.filter(h => h.level === 2).length} |
                    H3: {headings.filter(h => h.level === 3).length}
                  </div>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {headings.map((heading, index) => (
                    <div
                      key={index}
                      className="p-3 bg-muted/50 rounded-lg"
                      style={{ paddingLeft: `${0.75 + (heading.level - 1) * 1}rem` }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-mono text-xs px-2 py-0.5 rounded ${getHeadingColor(heading.level)}`}>
                              H{heading.level}
                            </span>
                            <span className="font-medium">{heading.text}</span>
                          </div>
                          {heading.issues.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {heading.issues.map((issue, i) => (
                                <div key={i} className="flex items-center gap-1 text-xs text-yellow-600">
                                  <AlertCircle className="h-3 w-3" />
                                  <span>{issue}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Heading Best Practices</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>One H1 per page:</strong> Use exactly one H1 for the main title</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Logical hierarchy:</strong> Don't skip heading levels (H1, H2, H3)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Descriptive text:</strong> Make headings clear and meaningful</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Include keywords:</strong> Use relevant keywords naturally in headings</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Accessibility:</strong> Proper heading structure helps screen readers</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Length:</strong> Keep headings concise (under 70 characters)</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
};

export default HeadingAnalyzer;
