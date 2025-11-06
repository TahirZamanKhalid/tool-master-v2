import { useState, useRef } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Download, Upload } from "lucide-react";

const JPGToPNG = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [converting, setConverting] = useState(false);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [convertedSize, setConvertedSize] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === "image/jpeg" || file.type === "image/jpg" ||
          file.name.toLowerCase().endsWith('.jpg') || file.name.toLowerCase().endsWith('.jpeg')) {
        setOriginalSize(file.size);
        setFileName(file.name.replace(/\.(jpg|jpeg)$/i, '.png'));

        const reader = new FileReader();
        reader.onload = (event) => {
          setSelectedImage(event.target?.result as string);
        };
        reader.readAsDataURL(file);

        toast.success("JPG image loaded!");
      } else {
        toast.error("Please select a JPG/JPEG image");
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

      // Draw image (PNG supports transparency, so no background needed)
      ctx.drawImage(img, 0, 0);

      // Convert to PNG
      canvas.toBlob(
        (blob) => {
          if (blob) {
            setConvertedSize(blob.size);
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

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <ToolLayout
      title="JPG to PNG Converter"
      description="Convert JPG/JPEG images to PNG format online. Free, fast, and lossless - perfect for images that need transparency or editing."
      category="File Converters"
      instructions={[
        "Click 'Choose JPG Image' and select your JPG/JPEG file",
        "Preview the image before conversion",
        "Click 'Convert to PNG' to process",
        "PNG image will download automatically",
        "PNG preserves perfect quality - no compression loss"
      ]}
      relatedTools={[
        { name: "PNG to JPG", path: "/tools/png-to-jpg" },
        { name: "HEIC to PNG", path: "/tools/heic-to-png" },
        { name: "WebP to PNG", path: "/tools/webp-to-png" }
      ]}
    >
      <div className="grid gap-6">
        <Card>
          <CardContent className="p-6 space-y-6">
            <div>
              <Label htmlFor="jpg-image">Upload JPG/JPEG Image</Label>
              <div className="mt-2">
                <label
                  htmlFor="jpg-image"
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
                      <p className="text-sm text-muted-foreground">
                        Click to upload JPG/JPEG image
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Lossless conversion to PNG
                      </p>
                    </div>
                  )}
                  <Input
                    id="jpg-image"
                    type="file"
                    accept="image/jpeg,image/jpg,.jpg,.jpeg"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
              {originalSize > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Original size: {formatFileSize(originalSize)}
                </p>
              )}
            </div>

            {selectedImage && (
              <div>
                <Label htmlFor="file-name">Output File Name</Label>
                <Input
                  id="file-name"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="converted-image.png"
                  className="mt-2"
                />
              </div>
            )}

            {convertedSize > 0 && (
              <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Original (JPG):</span>
                  <span className="font-medium">{formatFileSize(originalSize)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Converted (PNG):</span>
                  <span className="font-medium text-primary">{formatFileSize(convertedSize)}</span>
                </div>
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

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Why Convert JPG to PNG?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Lossless Quality:</strong> PNG doesn't compress - perfect for editing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Transparency Support:</strong> Add transparent backgrounds later</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Better for Graphics:</strong> Ideal for logos, icons, and text</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>No Artifacts:</strong> Clean edges without JPG compression artifacts</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
};

export default JPGToPNG;
