import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Link2, Copy, Code } from "lucide-react";

const CanonicalURLGenerator = () => {
  const [pageUrl, setPageUrl] = useState("");
  const [removeParams, setRemoveParams] = useState(true);
  const [removeHash, setRemoveHash] = useState(true);
  const [forceHttps, setForceHttps] = useState(true);
  const [removeTrailingSlash, setRemoveTrailingSlash] = useState(false);
  const [canonicalTag, setCanonicalTag] = useState("");
  const [cleanUrl, setCleanUrl] = useState("");

  const generateCanonical = () => {
    if (!pageUrl.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    let url = pageUrl.trim();

    // Ensure protocol
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    // Force HTTPS
    if (forceHttps) {
      url = url.replace(/^http:\/\//i, "https://");
    }

    // Remove query parameters
    if (removeParams) {
      url = url.split("?")[0];
    }

    // Remove hash
    if (removeHash) {
      url = url.split("#")[0];
    }

    // Handle trailing slash
    if (removeTrailingSlash && url.endsWith("/") && url.split("/").length > 3) {
      url = url.slice(0, -1);
    }

    // Normalize case (lowercase path)
    try {
      const urlObj = new URL(url);
      urlObj.hostname = urlObj.hostname.toLowerCase();
      url = urlObj.href;
    } catch (e) {
      toast.error("Invalid URL format");
      return;
    }

    const tag = `<link rel="canonical" href="${url}" />`;
    setCanonicalTag(tag);
    setCleanUrl(url);
    toast.success("Canonical URL generated!");
  };

  const copyTag = () => {
    navigator.clipboard.writeText(canonicalTag);
    toast.success("Canonical tag copied!");
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(cleanUrl);
    toast.success("URL copied!");
  };

  return (
    <ToolLayout
      title="Canonical URL Generator"
      description="Generate canonical link tags to prevent duplicate content issues. Free canonical URL tool for SEO."
      category="SEO & Marketing"
      instructions={[
        "Enter the page URL",
        "Choose URL normalization options",
        "Generate canonical link tag",
        "Copy and add to your HTML <head> section",
        "Use on all duplicate/similar pages pointing to preferred version"
      ]}
      relatedTools={[
        { name: "Robots.txt Generator", path: "/tools/robots-txt-generator" },
        { name: "Meta Tag Generator", path: "/tools/meta-tag-generator" },
        { name: "Schema Markup Generator", path: "/tools/schema-markup-generator" }
      ]}
    >
      <div className="grid gap-6">
        <Card>
          <CardContent className="p-6 space-y-6">
            <div>
              <Label htmlFor="page-url">Page URL *</Label>
              <Input
                id="page-url"
                value={pageUrl}
                onChange={(e) => setPageUrl(e.target.value)}
                placeholder="https://example.com/page?param=value"
                className="mt-2"
              />
            </div>

            <div className="space-y-3">
              <Label>URL Normalization Options</Label>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="force-https"
                  checked={forceHttps}
                  onCheckedChange={(checked) => setForceHttps(checked as boolean)}
                />
                <Label htmlFor="force-https" className="cursor-pointer">
                  Force HTTPS
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remove-params"
                  checked={removeParams}
                  onCheckedChange={(checked) => setRemoveParams(checked as boolean)}
                />
                <Label htmlFor="remove-params" className="cursor-pointer">
                  Remove query parameters (?param=value)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remove-hash"
                  checked={removeHash}
                  onCheckedChange={(checked) => setRemoveHash(checked as boolean)}
                />
                <Label htmlFor="remove-hash" className="cursor-pointer">
                  Remove hash fragments (#section)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remove-slash"
                  checked={removeTrailingSlash}
                  onCheckedChange={(checked) => setRemoveTrailingSlash(checked as boolean)}
                />
                <Label htmlFor="remove-slash" className="cursor-pointer">
                  Remove trailing slash
                </Label>
              </div>
            </div>

            <Button onClick={generateCanonical} className="w-full" size="lg">
              <Link2 className="h-4 w-4 mr-2" />
              Generate Canonical URL
            </Button>
          </CardContent>
        </Card>

        {canonicalTag && (
          <>
            <Card className="border-primary/20">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Canonical Link Tag</h3>
                  </div>
                  <Button onClick={copyTag} size="sm" variant="outline">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>

                <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto">
                  {canonicalTag}
                </pre>

                <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Where to place:</strong> Add this tag in the &lt;head&gt; section of your HTML,
                    preferably before other link tags.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-500/20">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Link2 className="h-5 w-5 text-green-500" />
                    <h3 className="text-lg font-semibold">Normalized URL</h3>
                  </div>
                  <Button onClick={copyUrl} size="sm" variant="outline">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <code className="text-sm break-all">{cleanUrl}</code>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">When to Use Canonical URLs</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Duplicate content:</strong> When same content exists on multiple URLs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>URL parameters:</strong> Tracking parameters (UTM), session IDs, sorting options</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>HTTP vs HTTPS:</strong> Point to preferred protocol version</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>WWW vs non-WWW:</strong> Specify preferred subdomain</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Pagination:</strong> Point paginated pages to the main page</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Syndicated content:</strong> Reposted content from other sites</span>
              </li>
            </ul>

            <div className="mt-4 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                <strong>Important:</strong> Canonical URLs are hints, not directives. Search engines may choose
                a different canonical if they determine another URL is more appropriate.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
};

export default CanonicalURLGenerator;
