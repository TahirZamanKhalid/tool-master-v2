import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertCircle, Monitor, Smartphone } from "lucide-react";

const TitleMetaChecker = () => {
  const [title, setTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  const TITLE_MIN = 30;
  const TITLE_MAX = 60;
  const TITLE_MOBILE_MAX = 55;
  const META_MIN = 120;
  const META_MAX = 160;
  const META_MOBILE_MAX = 120;

  const getTitleStatus = () => {
    const length = title.length;
    if (length === 0) return { status: "empty", color: "text-gray-500", message: "Enter a title" };
    if (length < TITLE_MIN) return { status: "short", color: "text-yellow-600", message: "Too short" };
    if (length > TITLE_MAX) return { status: "long", color: "text-red-600", message: "Too long - will be truncated" };
    return { status: "good", color: "text-green-600", message: "Optimal length" };
  };

  const getMetaStatus = () => {
    const length = metaDescription.length;
    if (length === 0) return { status: "empty", color: "text-gray-500", message: "Enter a meta description" };
    if (length < META_MIN) return { status: "short", color: "text-yellow-600", message: "Too short" };
    if (length > META_MAX) return { status: "long", color: "text-red-600", message: "Too long - will be truncated" };
    return { status: "good", color: "text-green-600", message: "Optimal length" };
  };

  const getTitleProgress = () => {
    return Math.min((title.length / TITLE_MAX) * 100, 100);
  };

  const getMetaProgress = () => {
    return Math.min((metaDescription.length / META_MAX) * 100, 100);
  };

  const titleStatus = getTitleStatus();
  const metaStatus = getMetaStatus();

  const getTruncatedText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const pixelWidth = (text: string) => {
    // Rough estimate: average character is ~8px, but W is ~14px, i is ~4px
    let width = 0;
    for (const char of text) {
      if ("iIl1.,;:!|".includes(char)) width += 4;
      else if ("mMwW".includes(char)) width += 14;
      else if (char === " ") width += 4;
      else width += 8;
    }
    return width;
  };

  const getTitlePixelStatus = () => {
    const pixels = pixelWidth(title);
    const maxPixels = 600; // Google's approximate limit
    return {
      pixels,
      maxPixels,
      status: pixels > maxPixels ? "truncated" : "visible"
    };
  };

  return (
    <ToolLayout
      title="Title & Meta Length Checker"
      description="Check if your page title and meta description are optimal length for search engines. Free SEO title checker."
      category="SEO & Marketing"
      instructions={[
        "Enter your page title",
        "Enter your meta description",
        "View character counts and pixel width",
        "See desktop and mobile previews",
        "Adjust length to fit within optimal ranges"
      ]}
      relatedTools={[
        { name: "Meta Tag Generator", path: "/tools/meta-tag-generator" },
        { name: "SEO Content Analyzer", path: "/tools/seo-content-analyzer" },
        { name: "Keyword Research Tool", path: "/tools/keyword-research" }
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
                placeholder="Enter your page title..."
                className="mt-2"
              />
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className={titleStatus.color}>{titleStatus.message}</span>
                  <span className="text-muted-foreground">
                    {title.length} / {TITLE_MAX} characters
                  </span>
                </div>
                <Progress
                  value={getTitleProgress()}
                  className={`h-2 ${titleStatus.status === 'long' ? '[&>*]:bg-red-600' : titleStatus.status === 'short' ? '[&>*]:bg-yellow-600' : ''}`}
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Min: {TITLE_MIN}</span>
                  <span>Max: {TITLE_MAX}</span>
                </div>
              </div>

              {title.length > 0 && (
                <div className="mt-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <div className="text-xs text-blue-700 dark:text-blue-300 mb-1">
                    Pixel Width: {getTitlePixelStatus().pixels} / {getTitlePixelStatus().maxPixels}px
                    {getTitlePixelStatus().status === "truncated" && " (Will be truncated)"}
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="meta-description">Meta Description</Label>
              <Textarea
                id="meta-description"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Enter your meta description..."
                className="mt-2 h-24"
              />
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className={metaStatus.color}>{metaStatus.message}</span>
                  <span className="text-muted-foreground">
                    {metaDescription.length} / {META_MAX} characters
                  </span>
                </div>
                <Progress
                  value={getMetaProgress()}
                  className={`h-2 ${metaStatus.status === 'long' ? '[&>*]:bg-red-600' : metaStatus.status === 'short' ? '[&>*]:bg-yellow-600' : ''}`}
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Min: {META_MIN}</span>
                  <span>Max: {META_MAX}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {(title || metaDescription) && (
          <>
            <Card className="border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Monitor className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Desktop Preview (Google)</h3>
                </div>

                <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border">
                  <div className="text-blue-600 dark:text-blue-400 text-lg hover:underline cursor-pointer">
                    {title || "Your Page Title"}
                  </div>
                  <div className="text-green-700 dark:text-green-500 text-sm mt-1">
                    https://example.com/page
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                    {metaDescription || "Your meta description will appear here..."}
                  </div>
                </div>

                {title.length > TITLE_MAX && (
                  <div className="mt-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-yellow-700 dark:text-yellow-300">
                      <strong>Truncated:</strong> "{getTruncatedText(title, TITLE_MAX)}"
                    </div>
                  </div>
                )}

                {metaDescription.length > META_MAX && (
                  <div className="mt-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-yellow-700 dark:text-yellow-300">
                      <strong>Truncated:</strong> "{getTruncatedText(metaDescription, META_MAX)}"
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Smartphone className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Mobile Preview (Google)</h3>
                </div>

                <div className="max-w-sm p-4 bg-white dark:bg-gray-900 rounded-lg border">
                  <div className="text-blue-600 dark:text-blue-400 text-base hover:underline cursor-pointer leading-snug">
                    {getTruncatedText(title || "Your Page Title", TITLE_MOBILE_MAX)}
                  </div>
                  <div className="text-green-700 dark:text-green-500 text-xs mt-1">
                    https://example.com
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-xs mt-2 leading-relaxed">
                    {getTruncatedText(metaDescription || "Your meta description...", META_MOBILE_MAX)}
                  </div>
                </div>

                {(title.length > TITLE_MOBILE_MAX || metaDescription.length > META_MOBILE_MAX) && (
                  <div className="mt-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      <strong>Note:</strong> Mobile displays are more limited. Title shows {TITLE_MOBILE_MAX} chars,
                      meta description shows {META_MOBILE_MAX} chars.
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Optimization Guidelines</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Page Title Best Practices
                </h4>
                <ul className="space-y-1 text-sm text-muted-foreground ml-6">
                  <li>- Keep between 30-60 characters</li>
                  <li>- Include your primary keyword near the beginning</li>
                  <li>- Make it compelling to encourage clicks</li>
                  <li>- Use your brand name at the end (if space allows)</li>
                  <li>- Avoid ALL CAPS or excessive punctuation</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Meta Description Best Practices
                </h4>
                <ul className="space-y-1 text-sm text-muted-foreground ml-6">
                  <li>- Aim for 120-160 characters</li>
                  <li>- Include your primary keyword naturally</li>
                  <li>- Write a clear call-to-action</li>
                  <li>- Accurately describe the page content</li>
                  <li>- Make every page's description unique</li>
                </ul>
              </div>

              <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm">
                  <strong className="text-primary">Pro Tip:</strong> While Google may sometimes rewrite
                  your meta descriptions, following these guidelines increases the chances they'll use yours
                  and helps with click-through rates.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
};

export default TitleMetaChecker;
