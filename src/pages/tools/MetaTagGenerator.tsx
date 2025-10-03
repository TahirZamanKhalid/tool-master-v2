import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MetaTagGenerator = () => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    keywords: "",
    author: "",
    url: "",
    image: "",
    siteName: "",
    twitterHandle: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const generateBasicMeta = () => {
    const tags = [];
    if (formData.title) tags.push(`<title>${formData.title}</title>`);
    if (formData.description) tags.push(`<meta name="description" content="${formData.description}">`);
    if (formData.keywords) tags.push(`<meta name="keywords" content="${formData.keywords}">`);
    if (formData.author) tags.push(`<meta name="author" content="${formData.author}">`);
    tags.push(`<meta name="viewport" content="width=device-width, initial-scale=1.0">`);
    tags.push(`<meta charset="UTF-8">`);
    return tags.join('\n');
  };

  const generateOpenGraph = () => {
    const tags = [];
    if (formData.title) tags.push(`<meta property="og:title" content="${formData.title}">`);
    if (formData.description) tags.push(`<meta property="og:description" content="${formData.description}">`);
    if (formData.url) tags.push(`<meta property="og:url" content="${formData.url}">`);
    if (formData.image) tags.push(`<meta property="og:image" content="${formData.image}">`);
    if (formData.siteName) tags.push(`<meta property="og:site_name" content="${formData.siteName}">`);
    tags.push(`<meta property="og:type" content="website">`);
    return tags.join('\n');
  };

  const generateTwitterCard = () => {
    const tags = [];
    tags.push(`<meta name="twitter:card" content="summary_large_image">`);
    if (formData.title) tags.push(`<meta name="twitter:title" content="${formData.title}">`);
    if (formData.description) tags.push(`<meta name="twitter:description" content="${formData.description}">`);
    if (formData.image) tags.push(`<meta name="twitter:image" content="${formData.image}">`);
    if (formData.twitterHandle) tags.push(`<meta name="twitter:site" content="@${formData.twitterHandle.replace('@', '')}">`);
    return tags.join('\n');
  };

  const generateAllTags = () => {
    const basicMeta = generateBasicMeta();
    const ogTags = generateOpenGraph();
    const twitterTags = generateTwitterCard();
    return `${basicMeta}\n\n${ogTags}\n\n${twitterTags}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Meta tags copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout
      title="Meta Tag Generator"
      description="Generate SEO-optimized meta tags for your website including Open Graph and Twitter Cards"
      category="SEO & Marketing"
      instructions={[
        "Enter your page title, description, and other details",
        "Fill in Open Graph information for social media sharing",
        "Add Twitter Card details for better Twitter previews",
        "Copy the generated meta tags and paste them in your HTML <head> section",
      ]}
      relatedTools={[
        { name: "Text to Slug", path: "/tools/text-to-slug" },
        { name: "HTML Encoder", path: "/tools/html-encoder" },
      ]}
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Page Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Page Title *</Label>
              <Input
                id="title"
                placeholder="Your awesome page title (60 characters max)"
                maxLength={60}
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">{formData.title.length}/60 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Meta Description *</Label>
              <Textarea
                id="description"
                placeholder="A brief description of your page (160 characters max)"
                maxLength={160}
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">{formData.description.length}/160 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords</Label>
              <Input
                id="keywords"
                placeholder="keyword1, keyword2, keyword3"
                value={formData.keywords}
                onChange={(e) => handleInputChange("keywords", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  placeholder="Your name or company"
                  value={formData.author}
                  onChange={(e) => handleInputChange("author", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">Page URL</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com/page"
                  value={formData.url}
                  onChange={(e) => handleInputChange("url", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="image">Featured Image URL</Label>
                <Input
                  id="image"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={formData.image}
                  onChange={(e) => handleInputChange("image", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  placeholder="Your Site Name"
                  value={formData.siteName}
                  onChange={(e) => handleInputChange("siteName", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitterHandle">Twitter Handle (optional)</Label>
              <Input
                id="twitterHandle"
                placeholder="@yourhandle"
                value={formData.twitterHandle}
                onChange={(e) => handleInputChange("twitterHandle", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generated Meta Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All Tags</TabsTrigger>
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="og">Open Graph</TabsTrigger>
                <TabsTrigger value="twitter">Twitter</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                <div className="relative">
                  <Textarea
                    readOnly
                    value={generateAllTags()}
                    className="font-mono text-xs min-h-[300px]"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(generateAllTags())}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="basic" className="space-y-4">
                <div className="relative">
                  <Textarea
                    readOnly
                    value={generateBasicMeta()}
                    className="font-mono text-xs min-h-[200px]"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(generateBasicMeta())}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="og" className="space-y-4">
                <div className="relative">
                  <Textarea
                    readOnly
                    value={generateOpenGraph()}
                    className="font-mono text-xs min-h-[200px]"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(generateOpenGraph())}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="twitter" className="space-y-4">
                <div className="relative">
                  <Textarea
                    readOnly
                    value={generateTwitterCard()}
                    className="font-mono text-xs min-h-[200px]"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(generateTwitterCard())}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {formData.image && (
          <Card>
            <CardHeader>
              <CardTitle>Social Media Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 space-y-2 bg-muted/30">
                {formData.image && (
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                <h3 className="font-semibold text-lg">{formData.title || "Your Page Title"}</h3>
                <p className="text-sm text-muted-foreground">
                  {formData.description || "Your page description will appear here"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formData.url || "https://example.com"}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
};

export default MetaTagGenerator;
