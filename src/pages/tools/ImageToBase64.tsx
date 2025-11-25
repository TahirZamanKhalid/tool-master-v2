import { useState, useRef } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Upload, Copy } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";

const ImageToBase64 = () => {
  const [base64, setBase64] = useState("");
  const [preview, setPreview] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setBase64(result);
      setPreview(result);
      toast.success("Image converted to Base64");
    };
    reader.readAsDataURL(file);
  };

  const copyBase64 = () => {
    navigator.clipboard.writeText(base64);
    toast.success("Base64 copied to clipboard");
  };

  return (
    <>
      <SEOHead
        title="Image to Base64 Converter"
        description="Convert images to Base64 encoded strings for embedding in HTML, CSS, or JSON"
        keywords="image to base64, base64 image, encode image, image encoder"
        canonical="https://toolmaster.cloud/tools/image-to-base64"
      />
      <ToolLayout
        title="Image to Base64 Converter"
        description="Convert any image to Base64 encoded string"
        category="Image Tools"
        instructions={[
          "Click upload or drag an image",
          "Image is automatically converted to Base64",
          "Preview the image result",
          "Copy Base64 string for use in your code"
        ]}
        relatedTools={[
          { name: "Base64 Image Encoder", path: "/tools/base64-image" },
          { name: "Image Compressor", path: "/tools/image-compressor" }
        ]}
      >
        <Card>
          <CardContent className="p-6 space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {!preview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:border-primary transition-smooth"
              >
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">Click to upload image</p>
                <p className="text-sm text-muted-foreground">
                  Supports PNG, JPG, GIF, WebP
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Preview</h3>
                  <img src={preview} alt="Preview" className="max-w-full max-h-64 mx-auto rounded-lg border" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">Base64 String</h3>
                    <Button onClick={copyBase64} variant="outline" size="sm">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <Textarea
                    value={base64}
                    readOnly
                    className="min-h-[200px] font-mono text-xs"
                  />
                </div>

                <Button onClick={() => fileInputRef.current?.click()} className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Different Image
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </ToolLayout>
    </>
  );
};

export default ImageToBase64;
