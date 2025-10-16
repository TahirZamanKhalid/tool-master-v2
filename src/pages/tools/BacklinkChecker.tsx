import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link2, ExternalLink, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SEOSchema } from "@/components/SEOSchema";

const BacklinkChecker = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const checkBacklinks = () => {
    setLoading(true);
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  };

  const instructions = [
    "Check and analyze backlinks pointing to your website:",
    "",
    "**What Are Backlinks?**",
    "Backlinks are links from other websites pointing to your site. They're crucial for SEO as they signal authority and trustworthiness to search engines.",
    "",
    "**How to Use This Tool:**",
    "1. Enter your website URL or specific page URL",
    "2. Click 'Check Backlinks' to analyze",
    "3. The tool will open professional SEO tools for detailed analysis",
    "",
    "**Why Backlinks Matter:**",
    "- **SEO Ranking**: Major Google ranking factor",
    "- **Referral Traffic**: Direct visitors from other sites",
    "- **Domain Authority**: Build your site's credibility",
    "- **Indexing**: Help search engines discover your content",
    "",
    "**Quality vs Quantity:**",
    "- One high-quality backlink > 100 low-quality links",
    "- Focus on relevant, authoritative sources",
    "- Avoid spammy link schemes",
    "- Natural link building is best",
    "",
    "**Recommended Professional Tools:**",
    "We'll redirect you to industry-leading tools for comprehensive backlink analysis:",
    "- **Ahrefs Backlink Checker**: Industry-leading tool with massive link database",
    "- **Moz Link Explorer**: Comprehensive link analysis and metrics",
    "- **SEMrush Backlink Analytics**: Detailed competitive analysis",
    "- **Google Search Console**: Free tool from Google",
    "",
    "**What to Analyze:**",
    "- Total number of backlinks",
    "- Domain authority of linking sites",
    "- Anchor text distribution",
    "- Link velocity (rate of new links)",
    "- Nofollow vs dofollow ratio",
    "- Toxic or spammy links",
    "",
    "**Best Practices:**",
    "- Regular backlink audits",
    "- Disavow toxic links",
    "- Build quality links naturally",
    "- Monitor competitor backlinks",
    "- Focus on relevant, authoritative sites",
  ];

  const tools = [
    {
      name: "Ahrefs Backlink Checker",
      url: "https://ahrefs.com/backlink-checker",
      description: "Free backlink checker with detailed metrics",
    },
    {
      name: "Moz Link Explorer",
      url: "https://moz.com/link-explorer",
      description: "Analyze backlinks and domain authority",
    },
    {
      name: "SEMrush Backlink Analytics",
      url: "https://www.semrush.com/analytics/backlinks/",
      description: "Comprehensive backlink analysis tool",
    },
    {
      name: "Google Search Console",
      url: "https://search.google.com/search-console",
      description: "Free tool from Google to see your backlinks",
    },
  ];

  return (
    <ToolLayout
      title="Backlink Checker"
      description="Analyze backlinks pointing to your website. Check link quality, domain authority, and identify opportunities to improve your SEO ranking."
      category="SEO & Marketing"
      instructions={instructions}
    >
      <SEOSchema
        type="SoftwareApplication"
        name="Backlink Checker Tool"
        description="Free backlink analysis tool to check and monitor links pointing to your website"
        url="https://toolmaster.cloud/tools/backlink-checker"
      />

      <div className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            For comprehensive backlink analysis, we recommend using professional SEO tools. Enter
            your URL below and we'll help you access the best free backlink checkers.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Enter Website URL
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <Button onClick={checkBacklinks} disabled={!url || loading}>
                {loading ? "Checking..." : "Check Backlinks"}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Enter your full website URL including https://
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Professional Backlink Analysis Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {tools.map((tool, index) => (
                <a
                  key={index}
                  href={url ? `${tool.url}?target=${encodeURIComponent(url)}` : tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold flex items-center gap-2">
                        {tool.name}
                        <ExternalLink className="h-4 w-4" />
                      </h3>
                      <p className="text-sm text-muted-foreground">{tool.description}</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Understanding Backlink Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <h4 className="font-semibold mb-1">Domain Authority (DA)</h4>
                <p className="text-muted-foreground">
                  Score from 1-100 indicating the strength of a domain's backlink profile
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Referring Domains</h4>
                <p className="text-muted-foreground">
                  Number of unique domains linking to your site (more important than total links)
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Anchor Text</h4>
                <p className="text-muted-foreground">
                  The clickable text in a hyperlink - should be natural and varied
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Dofollow vs Nofollow</h4>
                <p className="text-muted-foreground">
                  Dofollow links pass SEO value, nofollow links don't (but still valuable for
                  traffic)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
};

export default BacklinkChecker;
