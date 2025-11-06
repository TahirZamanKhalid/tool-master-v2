import { useState, useRef } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Download, Upload } from "lucide-react";

const WebPToPNG = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [converting, setConverting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === "image/webp" || file.name.toLowerCase().endsWith('.webp')) {
        setFileName(file.name.replace(/\.webp$/i, '.png'));

        const reader = new FileReader();
        reader.onload = (event) => {
          setSelectedImage(event.target?.result as string);
        };
        reader.readAsDataURL(file);

        toast.success("WebP image loaded!");
      } else {
        toast.error("Please select a WebP image");
      }
    }
  };

  const convertToPNG = () => {
    if (!selectedImage) {
      toast.error("Please select an image first");
      return;
    }

    setConverting(true);

    const img = new window.Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            link.click();
            URL.revokeObjectURL(url);

            toast.success("Image converted and downloaded!");
          }
          setConverting(false);
        },
        'image/png'
      );
    };

    img.src = selectedImage;
  };

  return (
    <ToolLayout
      title="WebP to PNG Converter"
      description="Convert WebP images to PNG format online. Free, fast, and secure - perfect for universal compatibility across all platforms."
      category="File Converters"
      instructions={[
        "Upload your WebP image",
        "Preview the image",
        "Click 'Convert to PNG'",
        "PNG file downloads automatically",
        "Works with transparency - lossless conversion"
      ]}
      relatedTools={[
        { name: "PNG to JPG", path: "/tools/png-to-jpg" },
        { name: "HEIC to PNG", path: "/tools/heic-to-png" },
        { name: "Image Compressor", path: "/tools/image-compressor" }
      ]}
    >
      <Card>
        <CardContent className="p-6 space-y-6">
          <div>
            <Label htmlFor="webp-image">Upload WebP Image</Label>
            <div className="mt-2">
              <label
                htmlFor="webp-image"
                className="flex items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors overflow-hidden"
              >
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt="Preview"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Click to upload WebP image</p>
                  </div>
                )}
                <Input
                  id="webp-image"
                  type="file"
                  accept="image/webp,.webp"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {selectedImage && (
            <div>
              <Label htmlFor="file-name">Output File Name</Label>
              <Input
                id="file-name"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="image.png"
                className="mt-2"
              />
            </div>
          )}

          <Button
            onClick={convertToPNG}
            disabled={!selectedImage || converting}
            size="lg"
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            {converting ? "Converting..." : "Convert to PNG"}
          </Button>

          <canvas ref={canvasRef} className="hidden" />
        </CardContent>
      </Card>
    </ToolLayout>
  );
};

export default WebPToPNG;
