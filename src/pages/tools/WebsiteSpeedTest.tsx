import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Zap, ExternalLink, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const WebsiteSpeedTest = () => {
  const [url, setUrl] = useState("");

  const testSpeed = (service: string) => {
    if (!url) return;
    const encodedUrl = encodeURIComponent(url);
    
    const urls: { [key: string]: string } = {
      pagespeed: `https://pagespeed.web.dev/analysis?url=${encodedUrl}`,
      gtmetrix: `https://gtmetrix.com/?url=${encodedUrl}`,
      pingdom: `https://tools.pingdom.com/#${encodedUrl}`,
      webpagetest: `https://www.webpagetest.org/?url=${encodedUrl}`,
    };

    window.open(urls[service], "_blank");
  };

  return (
    <ToolLayout
      title="Website Speed Test"
      description="Test your website loading speed and performance. Page speed is a crucial SEO ranking factor and directly impacts user experience and conversions."
      category="SEO & Marketing"
    >
      <div className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Page speed is a direct Google ranking factor. Use professional testing tools below for
            comprehensive performance analysis.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Enter Website URL
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Enter your full website URL to test loading speed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Professional Speed Testing Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 border rounded-lg space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  Google PageSpeed Insights
                  <ExternalLink className="h-4 w-4" />
                </h3>
                <p className="text-sm text-muted-foreground">
                  Official Google tool with Core Web Vitals and mobile/desktop analysis
                </p>
                <Button onClick={() => testSpeed("pagespeed")} disabled={!url} className="w-full">
                  Test with PageSpeed
                </Button>
              </div>

              <div className="p-4 border rounded-lg space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  GTmetrix
                  <ExternalLink className="h-4 w-4" />
                </h3>
                <p className="text-sm text-muted-foreground">
                  Detailed performance reports with waterfall analysis and recommendations
                </p>
                <Button onClick={() => testSpeed("gtmetrix")} disabled={!url} className="w-full">
                  Test with GTmetrix
                </Button>
              </div>

              <div className="p-4 border rounded-lg space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  Pingdom
                  <ExternalLink className="h-4 w-4" />
                </h3>
                <p className="text-sm text-muted-foreground">
                  Test from multiple locations worldwide with detailed performance insights
                </p>
                <Button onClick={() => testSpeed("pingdom")} disabled={!url} className="w-full">
                  Test with Pingdom
                </Button>
              </div>

              <div className="p-4 border rounded-lg space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  WebPageTest
                  <ExternalLink className="h-4 w-4" />
                </h3>
                <p className="text-sm text-muted-foreground">
                  Advanced testing with video capture and connection throttling options
                </p>
                <Button onClick={() => testSpeed("webpagetest")} disabled={!url} className="w-full">
                  Test with WebPageTest
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Why Page Speed Matters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <h4 className="font-semibold mb-1">SEO Rankings</h4>
                <p className="text-muted-foreground">
                  Google uses page speed as a ranking factor, especially for mobile searches
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">User Experience</h4>
                <p className="text-muted-foreground">
                  53% of mobile users abandon sites that take over 3 seconds to load
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Conversion Rates</h4>
                <p className="text-muted-foreground">
                  A 1-second delay can reduce conversions by 7%
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Core Web Vitals</h4>
                <p className="text-muted-foreground">
                  LCP, FID, and CLS are essential metrics for Google's page experience signal
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Speed Optimization Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
              <li>Optimize and compress images</li>
              <li>Minify CSS, JavaScript, and HTML</li>
              <li>Enable browser caching</li>
              <li>Use a Content Delivery Network (CDN)</li>
              <li>Reduce server response time</li>
              <li>Eliminate render-blocking resources</li>
              <li>Enable text compression (gzip)</li>
              <li>Lazy load images and videos</li>
              <li>Minimize HTTP requests</li>
              <li>Use modern image formats (WebP)</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
};

export default WebsiteSpeedTest;
