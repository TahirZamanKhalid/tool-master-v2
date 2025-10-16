import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Copy, Check, FileCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SEOSchema } from "@/components/SEOSchema";

interface URLEntry {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
}

const XMLSitemapGenerator = () => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [urls, setUrls] = useState("");
  const [domain, setDomain] = useState("");
  const [sitemap, setSitemap] = useState("");

  const generateSitemap = () => {
    if (!urls.trim() || !domain.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter domain and URLs",
        variant: "destructive",
      });
      return;
    }

    const urlList = urls.split("\n").filter((url) => url.trim());
    const today = new Date().toISOString().split("T")[0];
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    urlList.forEach((url) => {
      const cleanUrl = url.trim();
      const fullUrl = cleanUrl.startsWith("http") ? cleanUrl : `${domain}${cleanUrl}`;
      
      xml += '  <url>\n';
      xml += `    <loc>${fullUrl}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.8</priority>\n';
      xml += '  </url>\n';
    });

    xml += '</urlset>';
    setSitemap(xml);
  };

  const downloadSitemap = () => {
    const blob = new Blob([sitemap], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sitemap.xml";
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded!",
      description: "Sitemap downloaded as sitemap.xml",
    });
  };

  const copySitemap = async () => {
    await navigator.clipboard.writeText(sitemap);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Sitemap copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout
      title="XML Sitemap Generator"
      description="Generate XML sitemaps for search engines. Help Google, Bing, and other search engines discover and index all pages on your website for better SEO."
      category="SEO & Marketing"
    >
      <SEOSchema
        type="SoftwareApplication"
        name="XML Sitemap Generator"
        description="Free tool to generate XML sitemaps for better search engine indexing"
        url="https://toolmaster.cloud/tools/xml-sitemap-generator"
      />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCode className="h-5 w-5" />
                Enter Your URLs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="domain">Domain URL</Label>
                <Input
                  id="domain"
                  type="url"
                  placeholder="https://example.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="urls">Page URLs (one per line)</Label>
                <Textarea
                  id="urls"
                  placeholder="/&#10;/about&#10;/services&#10;/contact&#10;/blog"
                  value={urls}
                  onChange={(e) => setUrls(e.target.value)}
                  rows={12}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Enter relative URLs (starting with /) or full URLs
                </p>
              </div>

              <Button onClick={generateSitemap} className="w-full" disabled={!urls || !domain}>
                Generate Sitemap
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Generated XML Sitemap
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copySitemap}
                    disabled={!sitemap}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 mr-2" />
                    ) : (
                      <Copy className="h-4 w-4 mr-2" />
                    )}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadSitemap}
                    disabled={!sitemap}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={sitemap}
                readOnly
                rows={18}
                className="font-mono text-xs"
                placeholder="Your XML sitemap will appear here..."
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How to Use Your Sitemap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">1. Upload to Your Website</h4>
              <p className="text-muted-foreground">
                Place the sitemap.xml file in your website's root directory (https://example.com/sitemap.xml)
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">2. Submit to Search Engines</h4>
              <p className="text-muted-foreground mb-2">
                Submit your sitemap URL to search engines:
              </p>
              <ul className="space-y-1 text-muted-foreground list-disc pl-5">
                <li>Google Search Console: search.google.com/search-console</li>
                <li>Bing Webmaster Tools: bing.com/webmasters</li>
                <li>Add to robots.txt: Sitemap: https://example.com/sitemap.xml</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">3. Update Regularly</h4>
              <p className="text-muted-foreground">
                Regenerate your sitemap whenever you add new pages or make significant changes to your site
              </p>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Sitemap Best Practices</h4>
              <ul className="space-y-1 text-muted-foreground list-disc pl-5">
                <li>Include only important, indexable pages</li>
                <li>Update lastmod dates when content changes</li>
                <li>Use priority values (0.0-1.0) to indicate page importance</li>
                <li>Keep sitemap under 50,000 URLs and 50MB</li>
                <li>Use sitemap index for large sites</li>
                <li>Don't include blocked URLs (in robots.txt)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </ToolLayout>
  );
};

export default XMLSitemapGenerator;
