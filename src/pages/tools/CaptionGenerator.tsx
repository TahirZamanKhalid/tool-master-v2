import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Copy, RefreshCw, Image as ImageIcon } from "lucide-react";

const CaptionGenerator = () => {
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [style, setStyle] = useState("casual");
  const [captions, setCaptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const styles = [
    { value: "casual", label: "Casual & Friendly" },
    { value: "professional", label: "Professional" },
    { value: "funny", label: "Funny & Humorous" },
    { value: "inspirational", label: "Inspirational" },
    { value: "minimal", label: "Minimal & Short" },
    { value: "storytelling", label: "Storytelling" },
  ];

  const generateCaptions = async () => {
    if (!imageUrl && !description) {
      toast.error("Please provide an image URL or description");
      return;
    }

    setLoading(true);
    setCaptions([]);

    try {
      const { data, error } = await supabase.functions.invoke("generate-caption", {
        body: {
          imageUrl: imageUrl || null,
          description,
          style,
        },
      });

      if (error) throw error;

      if (data?.captions && Array.isArray(data.captions)) {
        setCaptions(data.captions);
        toast.success("Captions generated successfully!");
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error generating captions:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate captions");
    } finally {
      setLoading(false);
    }
  };

  const copyCaption = (caption: string) => {
    navigator.clipboard.writeText(caption);
    toast.success("Caption copied to clipboard!");
  };

  const copyAllCaptions = () => {
    const allCaptions = captions.join("\n\n");
    navigator.clipboard.writeText(allCaptions);
    toast.success("All captions copied to clipboard!");
  };

  return (
    <ToolLayout
      title="AI Caption Generator"
      description="Generate creative social media captions for your images using AI"
      category="AI & Content"
      instructions={[
        "Paste an image URL or provide a description",
        "Select your preferred caption style",
        "Click 'Generate Captions' to create AI-powered captions",
        "Copy your favorite captions to use on social media",
        "Generate new captions anytime for fresh ideas",
      ]}
      relatedTools={[
        { name: "Meme Generator", path: "/tools/meme-generator" },
        { name: "Background Remover", path: "/tools/background-remover" },
        { name: "Image Compressor", path: "/tools/image-compressor" },
      ]}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="imageUrl">Image URL (Optional)</Label>
                <div className="relative mt-2">
                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="imageUrl"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description or Context</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your image or the context for the caption..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-2 min-h-[100px]"
                />
              </div>

              <div>
                <Label htmlFor="style">Caption Style</Label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger id="style" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {styles.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {imageUrl && (
                <div className="border rounded-lg overflow-hidden">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-48 object-cover"
                    onError={() => toast.error("Failed to load image")}
                  />
                </div>
              )}
            </div>

            <Button
              onClick={generateCaptions}
              disabled={loading}
              size="lg"
              className="w-full"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Captions
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Label>Generated Captions</Label>
              {captions.length > 0 && (
                <Button
                  onClick={copyAllCaptions}
                  size="sm"
                  variant="outline"
                >
                  <Copy className="h-3 w-3 mr-2" />
                  Copy All
                </Button>
              )}
            </div>

            <div className="space-y-3 min-h-[400px] max-h-[500px] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-[400px]">
                  <div className="text-center text-muted-foreground">
                    <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin" />
                    <p>Generating creative captions...</p>
                  </div>
                </div>
              ) : captions.length > 0 ? (
                captions.map((caption, index) => (
                  <div
                    key={index}
                    className="group relative p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    <p className="text-sm pr-10">{caption}</p>
                    <Button
                      onClick={() => copyCaption(caption)}
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-[400px]">
                  <div className="text-center text-muted-foreground">
                    <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Your generated captions will appear here</p>
                  </div>
                </div>
              )}
            </div>

            {captions.length > 0 && (
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground text-center">
                  💡 Tip: Click any caption to copy it, or regenerate for new options
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
};

export default CaptionGenerator;
