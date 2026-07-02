import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { FileCheck, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface ValidationResult {
  isValid: boolean;
  urlCount: number;
  issues: string[];
  warnings: string[];
  success: string[];
}

const SitemapValidator = () => {
  const [sitemapXml, setSitemapXml] = useState("");
  const [result, setResult] = useState<ValidationResult | null>(null);

  const validateSitemap = () => {
    if (!sitemapXml.trim()) {
      toast.error("Please enter sitemap XML");
      return;
    }

    const issues: string[] = [];
    const warnings: string[] = [];
    const success: string[] = [];
    let urlCount = 0;
    const parsedXml = new DOMParser().parseFromString(sitemapXml, "application/xml");
    const parserError = parsedXml.querySelector("parsererror");
    if (parserError) {
      issues.push("XML parser error - check for unclosed tags or invalid characters");
    }

    // Check if it's XML
    if (!sitemapXml.trim().startsWith("<?xml") && !sitemapXml.trim().startsWith("<")) {
      issues.push("Not valid XML format - should start with <?xml or <urlset>");
    }

    // Check for urlset tag
    if (!sitemapXml.includes("<urlset")) {
      issues.push("Missing <urlset> root element");
    } else {
      success.push("Valid <urlset> root element found");
    }

    // Check namespace
    if (!sitemapXml.includes("xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\"")) {
      issues.push("Missing or incorrect XML namespace");
    } else {
      success.push("Correct XML namespace declared");
    }

    // Count URLs
    const urlMatches = sitemapXml.match(/<url>/g);
    urlCount = urlMatches ? urlMatches.length : 0;

    if (urlCount === 0) {
      issues.push("No URLs found in sitemap");
    } else if (urlCount > 50000) {
      issues.push(`Too many URLs (${urlCount}). Sitemap should have max 50,000 URLs`);
    } else {
      success.push(`Found ${urlCount} URL${urlCount > 1 ? 's' : ''}`);
    }

    // Check for required elements in each URL
    const locMatches = sitemapXml.match(/<loc>/g);
    if (!locMatches || locMatches.length !== urlCount) {
      issues.push("Some <url> entries missing <loc> element");
    }

    // Check for lastmod dates
    const lastmodMatches = sitemapXml.match(/<lastmod>/g);
    if (lastmodMatches && lastmodMatches.length > 0) {
      success.push(`${lastmodMatches.length} URLs have <lastmod> dates`);
    } else {
      warnings.push("No <lastmod> dates found - consider adding them");
    }

    // Check for priority values
    const priorityMatches = sitemapXml.match(/<priority>(.*?)<\/priority>/g);
    if (priorityMatches) {
      priorityMatches.forEach(match => {
        const value = parseFloat(match.replace(/<\/?priority>/g, ""));
        if (!Number.isFinite(value) || value < 0 || value > 1) {
          issues.push(`Invalid priority value: ${value} (must be 0.0-1.0)`);
        }
      });
    }

    // Check for changefreq values
    const changefreqMatches = sitemapXml.match(/<changefreq>(.*?)<\/changefreq>/g);
    if (changefreqMatches) {
      const validFreqs = ["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"];
      changefreqMatches.forEach(match => {
        const freq = match.replace(/<\/?changefreq>/g, "").trim().toLowerCase();
        if (!validFreqs.includes(freq)) {
          issues.push(`Invalid changefreq value: ${freq}`);
        }
      });
    }

    // Check URL format
    const locUrls = sitemapXml.match(/<loc>(.*?)<\/loc>/g);
    if (locUrls) {
      locUrls.forEach(loc => {
        const url = loc.replace(/<\/?loc>/g, "").trim();
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
          issues.push(`Invalid URL format: ${url.substring(0, 50)}...`);
        }
        if (url.length > 2048) {
          warnings.push("URL exceeds 2048 characters - may cause issues");
        }
      });
    }

    // Check file size (rough estimate)
    const sizeKB = new Blob([sitemapXml]).size / 1024;
    if (sizeKB > 50 * 1024) {
      issues.push(`Sitemap too large (${sizeKB.toFixed(0)}KB). Max size is 50MB`);
    } else {
      success.push(`File size: ${sizeKB.toFixed(1)}KB (within limits)`);
    }

    const isValid = issues.length === 0;

    setResult({
      isValid,
      urlCount,
      issues,
      warnings,
      success
    });

    if (isValid && warnings.length === 0) {
      toast.success("Sitemap is valid!");
    } else if (isValid) {
      toast.success("Sitemap is valid with warnings");
    } else {
      toast.error(`Found ${issues.length} issue(s)`);
    }
  };

  const loadExample = () => {
    const example = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2024-01-15</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://example.com/about</loc>
    <lastmod>2024-01-10</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;
    setSitemapXml(example);
    toast.success("Example sitemap loaded");
  };

  return (
    <ToolLayout
      title="Sitemap Validator"
      description="Validate XML sitemap structure and check for errors. Free sitemap.xml validator for SEO."
      category="SEO & Marketing"
      instructions={[
        "Paste your sitemap XML content",
        "Or load an example to test",
        "Click validate to check structure",
        "Review errors, warnings, and recommendations",
        "Fix any issues before submitting to search engines"
      ]}
      relatedTools={[
        { name: "XML Sitemap Generator", path: "/tools/xml-sitemap-generator" },
        { name: "Robots.txt Generator", path: "/tools/robots-txt-generator" },
        { name: "Canonical URL Generator", path: "/tools/canonical-url-generator" }
      ]}
    >
      <div className="grid gap-6">
        <Card>
          <CardContent className="p-6 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="sitemap-xml">Sitemap XML</Label>
                <Button onClick={loadExample} variant="outline" size="sm">
                  Load Example
                </Button>
              </div>
              <Textarea
                id="sitemap-xml"
                value={sitemapXml}
                onChange={(e) => setSitemapXml(e.target.value)}
                placeholder="<?xml version=&quot;1.0&quot; encoding=&quot;UTF-8&quot;?>&#10;<urlset xmlns=&quot;http://www.sitemaps.org/schemas/sitemap/0.9&quot;>&#10;  <url>...</url>&#10;</urlset>"
                className="mt-2 h-64 font-mono text-sm"
              />
            </div>

            <Button onClick={validateSitemap} className="w-full" size="lg">
              <FileCheck className="h-4 w-4 mr-2" />
              Validate Sitemap
            </Button>
          </CardContent>
        </Card>

        {result && (
          <>
            <Card className={result.isValid ? "border-green-500/20" : "border-red-500/20"}>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  {result.isValid ? (
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-500" />
                  )}
                  <div>
                    <h3 className="text-lg font-semibold">
                      {result.isValid ? "Sitemap is Valid" : "Sitemap has Issues"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {result.urlCount} URL(s) found
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {result.issues.length > 0 && (
              <Card className="border-red-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <XCircle className="h-5 w-5 text-red-500" />
                    <h3 className="text-lg font-semibold">Errors ({result.issues.length})</h3>
                  </div>
                  <ul className="space-y-2">
                    {result.issues.map((issue, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {result.warnings.length > 0 && (
              <Card className="border-yellow-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                    <h3 className="text-lg font-semibold">Warnings ({result.warnings.length})</h3>
                  </div>
                  <ul className="space-y-2">
                    {result.warnings.map((warning, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span>{warning}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {result.success.length > 0 && (
              <Card className="border-green-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <h3 className="text-lg font-semibold">Passed Checks</h3>
                  </div>
                  <ul className="space-y-2">
                    {result.success.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
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
            <h3 className="text-lg font-semibold mb-4">Sitemap Requirements</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">-</span>
                <span><strong>Max URLs:</strong> 50,000 URLs per sitemap file</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">-</span>
                <span><strong>Max size:</strong> 50MB uncompressed (10MB compressed)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">-</span>
                <span><strong>URL format:</strong> Must start with http:// or https://</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">-</span>
                <span><strong>Priority:</strong> Value between 0.0 and 1.0 (optional)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">-</span>
                <span><strong>Changefreq:</strong> always, hourly, daily, weekly, monthly, yearly, never</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">-</span>
                <span><strong>Submit to:</strong> Google Search Console and Bing Webmaster Tools</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
};

export default SitemapValidator;
