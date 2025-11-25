import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ImageIcon, Copy, Sparkles } from "lucide-react";
import { AdRow } from "@/components/AdRow";

const AltTextGenerator = () => {
  const [imageUrl, setImageUrl] = useState("");
  const [context, setContext] = useState("");
  const [imageType, setImageType] = useState("general");
  const [keywords, setKeywords] = useState("");
  const [altText, setAltText] = useState<string[]>([]);

  const templates = {
    general: [
      "{keyword} displayed on {context}",
      "Image showing {keyword} with {context}",
      "{keyword} illustration for {context}",
      "Visual representation of {keyword} in {context}",
      "{keyword} - {context} example"
    ],
    product: [
      "{keyword} product photo on {context} background",
      "{keyword} - front view",
      "{keyword} - detail shot showing {context}",
      "{keyword} product image with {context}",
      "High-quality {keyword} showcasing {context}"
    ],
    infographic: [
      "Infographic explaining {keyword} with {context} data",
      "{keyword} statistics and {context} visual chart",
      "Visual guide to {keyword} featuring {context}",
      "{keyword} infographic with {context} information",
      "Data visualization of {keyword} and {context}"
    ],
    screenshot: [
      "Screenshot of {keyword} interface showing {context}",
      "{keyword} dashboard displaying {context}",
      "{keyword} screen capture with {context} highlighted",
      "User interface of {keyword} demonstrating {context}",
      "{keyword} software screenshot featuring {context}"
    ],
    person: [
      "Photo of person {context} with {keyword}",
      "Portrait showing {keyword} in {context} setting",
      "Individual demonstrating {keyword} for {context}",
      "{keyword} performed by person in {context}",
      "Professional photo of {keyword} with {context}"
    ]
  };

  const generateAltText = () => {
    if (!keywords.trim()) {
      toast.error("Please enter keywords");
      return;
    }

    const keyword = keywords.trim();
    const ctx = context.trim() || "professional setting";
    const selectedTemplates = templates[imageType as keyof typeof templates];

    const generated = selectedTemplates.map(template =>
      template.replace(/{keyword}/g, keyword).replace(/{context}/g, ctx)
    );

    // Add some specific variations
    generated.push(`${keyword} - detailed view`);
    generated.push(`${keyword} for ${ctx}`);
    generated.push(`Professional ${keyword} image`);

    if (imageType === "product") {
      generated.push(`Buy ${keyword} - ${ctx}`);
      generated.push(`${keyword} for sale`);
    }

    setAltText(generated);
    toast.success(`Generated ${generated.length} alt text suggestions!`);
  };

  const copyAlt = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <ToolLayout
      title="Alt Text Generator"
      description="Generate descriptive alt text for images to improve SEO and accessibility. Free image alt attribute generator."
      category="SEO & Marketing"
      instructions={[
        "Enter keywords describing the image",
        "Add context or setting (optional)",
        "Select image type",
        "Generate alt text suggestions",
        "Copy and use in your HTML img tags"
      ]}
      relatedTools={[
        { name: "SEO Content Analyzer", path: "/tools/seo-content-analyzer" },
        { name: "Heading Analyzer", path: "/tools/heading-analyzer" },
        { name: "Meta Tag Generator", path: "/tools/meta-tag-generator" }
      ]}
    >
      <AdRow className="mb-6" />
      <div className="grid gap-6">
        <Card>
          <CardContent className="p-6 space-y-6">
            <div>
              <Label htmlFor="keywords">Image Keywords *</Label>
              <Input
                id="keywords"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g., laptop, coffee cup, team meeting"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="context">Context/Setting (optional)</Label>
              <Input
                id="context"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="e.g., modern office, white background, outdoor"
                className="mt-2"
              />
            </div>

            <div>
              <Label>Image Type</Label>
              <Select value={imageType} onValueChange={setImageType}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Image</SelectItem>
                  <SelectItem value="product">Product Photo</SelectItem>
                  <SelectItem value="infographic">Infographic/Chart</SelectItem>
                  <SelectItem value="screenshot">Screenshot/UI</SelectItem>
                  <SelectItem value="person">Person/Portrait</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={generateAltText} className="w-full" size="lg">
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Alt Text
            </Button>
          </CardContent>
        </Card>

        {altText.length > 0 && (
          <Card className="border-primary/20">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Alt Text Suggestions ({altText.length})</h3>
              </div>

              <div className="space-y-2">
                {altText.map((text, index) => (
                  <div
                    key={index}
                    className="p-3 bg-muted/50 hover:bg-primary/10 rounded-lg border border-transparent hover:border-primary/20 transition-all group cursor-pointer"
                    onClick={() => copyAlt(text)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{text}</span>
                      <Copy className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {text.length} characters
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Alt Text Best Practices</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Be specific:</strong> Describe what's actually in the image</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Keep it concise:</strong> Aim for under 125 characters</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Include keywords:</strong> Use relevant SEO keywords naturally</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Skip "image of":</strong> Screen readers already announce it's an image</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Context matters:</strong> Describe the image's purpose on the page</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Decorative images:</strong> Use empty alt="" for purely decorative images</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
      <AdRow className="mt-6" />
    </ToolLayout>
  );
};

export default AltTextGenerator;
