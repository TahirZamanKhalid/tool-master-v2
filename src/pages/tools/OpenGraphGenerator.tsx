import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const OpenGraphGenerator = () => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    url: "",
    siteName: "",
    type: "website",
    locale: "en_US",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const generateOpenGraphTags = () => {
    const tags = [];
    
    if (formData.title) tags.push(`<meta property="og:title" content="${formData.title}" />`);
    if (formData.description) tags.push(`<meta property="og:description" content="${formData.description}" />`);
    if (formData.image) tags.push(`<meta property="og:image" content="${formData.image}" />`);
    if (formData.url) tags.push(`<meta property="og:url" content="${formData.url}" />`);
    if (formData.siteName) tags.push(`<meta property="og:site_name" content="${formData.siteName}" />`);
    tags.push(`<meta property="og:type" content="${formData.type}" />`);
    tags.push(`<meta property="og:locale" content="${formData.locale}" />`);
    
    // Twitter Card tags
    if (formData.title) tags.push(`<meta name="twitter:title" content="${formData.title}" />`);
    if (formData.description) tags.push(`<meta name="twitter:description" content="${formData.description}" />`);
    if (formData.image) tags.push(`<meta name="twitter:image" content="${formData.image}" />`);
    tags.push(`<meta name="twitter:card" content="summary_large_image" />`);

    return tags.join('\n');
  };

  const copyToClipboard = async () => {
    const tags = generateOpenGraphTags();
    await navigator.clipboard.writeText(tags);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Open Graph tags copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const instructions = [
    "Enter your page details to generate Open Graph meta tags:",
    "",
    "1. **Title**: Page title (50-60 characters recommended)",
    "2. **Description**: Brief description (155-160 characters)",
    "3. **Image URL**: Full URL to your social share image (1200x630px recommended)",
    "4. **Page URL**: Full URL of your page",
    "5. **Site Name**: Your website or brand name",
    "6. **Type**: Content type (website, article, product, etc.)",
    "7. **Locale**: Language and region code",
    "",
    "**Why Open Graph Tags Matter:**",
    "- Control how your content appears when shared on social media",
    "- Increase click-through rates from social platforms",
    "- Professional appearance on Facebook, LinkedIn, Twitter",
    "- Essential for social media marketing",
    "",
    "**Best Practices:**",
    "- Use high-quality images (minimum 1200x630px)",
    "- Keep titles under 60 characters",
    "- Write compelling descriptions",
    "- Test on Facebook Sharing Debugger",
    "- Include all required tags for best results",
  ];

  return (
    <ToolLayout
      title="Open Graph Generator"
      description="Generate Open Graph and Twitter Card meta tags for better social media sharing. Control how your content appears on Facebook, LinkedIn, Twitter, and other social platforms."
      category="SEO & Marketing"
      instructions={instructions}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Enter Page Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Page Title *</Label>
              <Input
                id="title"
                name="title"
                placeholder="Your Amazing Page Title"
                value={formData.title}
                onChange={handleInputChange}
                maxLength={60}
              />
              <p className="text-xs text-muted-foreground">
                {formData.title.length}/60 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="A compelling description of your page content"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                maxLength={160}
              />
              <p className="text-xs text-muted-foreground">
                {formData.description.length}/160 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Image URL *</Label>
              <Input
                id="image"
                name="image"
                placeholder="https://example.com/image.jpg"
                value={formData.image}
                onChange={handleInputChange}
              />
              <p className="text-xs text-muted-foreground">
                Recommended: 1200x630px
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">Page URL *</Label>
              <Input
                id="url"
                name="url"
                placeholder="https://example.com/page"
                value={formData.url}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                name="siteName"
                placeholder="Your Brand Name"
                value={formData.siteName}
                onChange={handleInputChange}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Generated Open Graph Tags
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                disabled={!formData.title || !formData.description}
              >
                {copied ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                {copied ? "Copied!" : "Copy Tags"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={generateOpenGraphTags()}
              readOnly
              rows={20}
              className="font-mono text-sm"
              placeholder="Fill in the required fields to generate tags"
            />
          </CardContent>
        </Card>
      </div>

      {formData.image && (
        <Card>
          <CardHeader>
            <CardTitle>Social Media Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 space-y-3">
              <img
                src={formData.image}
                alt="Preview"
                className="w-full h-64 object-cover rounded"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                }}
              />
              <div>
                <h3 className="font-semibold text-lg">
                  {formData.title || "Your Page Title"}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {formData.description || "Your page description will appear here"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.url || "example.com"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </ToolLayout>
  );
};

export default OpenGraphGenerator;
