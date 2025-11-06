import { useState, useRef } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Download, Upload, Image as ImageIcon } from "lucide-react";

const PNGToJPG = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [quality, setQuality] = useState<number>(90);
  const [converting, setConverting] = useState(false);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [convertedSize, setConvertedSize] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === "image/png" || file.name.toLowerCase().endsWith('.png')) {
        setOriginalSize(file.size);
        setFileName(file.name.replace(/\.png$/i, '.jpg'));

        const reader = new FileReader();
        reader.onload = (event) => {
          setSelectedImage(event.target?.result as string);
        };
        reader.readAsDataURL(file);

        toast.success("PNG image loaded!");
      } else {
        toast.error("Please select a PNG image");
      }
    }
  };

  const convertToJPG = () => {
    if (!selectedImage) {
      toast.error("Please select an image first");
      return;
    }

    setConverting(true);

    const img = new window.Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Set canvas dimensions to match image
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Fill with white background (JPG doesn't support transparency)
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw image
      ctx.drawImage(img, 0, 0);

      // Convert to JPG
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
        'image/jpeg',
        quality / 100
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

  const savingsPercentage = originalSize && convertedSize
    ? ((1 - convertedSize / originalSize) * 100).toFixed(1)
    : '0';

  return (
    <ToolLayout
      title="PNG to JPG Converter"
      description="Convert PNG images to JPG/JPEG format online. Free, fast, and secure - all conversion happens in your browser with adjustable quality."
      category="File Converters"
      instructions={[
        "Click 'Choose PNG Image' and select your PNG file",
        "Adjust quality slider (higher = better quality, larger file)",
        "Preview the image before conversion",
        "Click 'Convert to JPG' to process",
        "Image will download automatically as JPG"
      ]}
      relatedTools={[
        { name: "JPG to PNG", path: "/tools/jpg-to-png" },
        { name: "HEIC to JPG", path: "/tools/heic-to-jpg" },
        { name: "WebP to PNG", path: "/tools/webp-to-png" },
        { name: "Image Compressor", path: "/tools/image-compressor" }
      ]}
    >
      <div className="grid gap-6">
        <Card>
          <CardContent className="p-6 space-y-6">
            {/* Image Upload */}
            <div>
              <Label htmlFor="png-image">Upload PNG Image</Label>
              <div className="mt-2">
                <label
                  htmlFor="png-image"
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
                        Click to upload PNG image
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Maximum quality, lossless conversion
                      </p>
                    </div>
                  )}
                  <Input
                    id="png-image"
                    type="file"
                    accept="image/png,.png"
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

            {/* Quality Slider */}
            {selectedImage && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>JPG Quality: {quality}%</Label>
                  <span className="text-xs text-muted-foreground">
                    Higher = Better Quality
                  </span>
                </div>
                <Slider
                  value={[quality]}
                  onValueChange={(value) => setQuality(value[0])}
                  min={50}
                  max={100}
                  step={5}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Small File</span>
                  <span>Best Quality</span>
                </div>
              </div>
            )}

            {/* File Name Input */}
            {selectedImage && (
              <div>
                <Label htmlFor="file-name">Output File Name</Label>
                <Input
                  id="file-name"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="converted-image.jpg"
                  className="mt-2"
                />
              </div>
            )}

            {/* File Size Comparison */}
            {convertedSize > 0 && (
              <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Original (PNG):</span>
                  <span className="font-medium">{formatFileSize(originalSize)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Converted (JPG):</span>
                  <span className="font-medium text-primary">{formatFileSize(convertedSize)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold border-t pt-2">
                  <span>Size Reduction:</span>
                  <span className={convertedSize < originalSize ? "text-green-600" : "text-orange-600"}>
                    {savingsPercentage}%
                  </span>
                </div>
              </div>
            )}

            {/* Convert Button */}
            <Button
              onClick={convertToJPG}
              disabled={!selectedImage || converting}
              size="lg"
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              {converting ? "Converting..." : "Convert to JPG"}
            </Button>

            {/* Hidden Canvas */}
            <canvas ref={canvasRef} className="hidden" />
          </CardContent>
        </Card>

        {/* Features Section */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Why Convert PNG to JPG?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Smaller File Size:</strong> JPG files are typically 50-80% smaller than PNG</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Faster Loading:</strong> Ideal for websites and email attachments</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Universal Support:</strong> JPG works everywhere - all devices and platforms</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Adjustable Quality:</strong> Control the balance between quality and file size</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>100% Private:</strong> All conversion happens in your browser</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>No Upload Needed:</strong> Your images never leave your device</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Batch Ready:</strong> Convert multiple images by repeating the process</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Info Box */}
        <Card className="border-primary/20">
          <CardContent className="p-6">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-primary" />
              When to Use JPG vs PNG?
            </h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><strong>Use JPG for:</strong> Photos, complex images, web graphics (smaller files)</p>
              <p><strong>Use PNG for:</strong> Logos, screenshots, images with transparency</p>
              <p className="text-xs mt-3 text-amber-600">
                Note: JPG doesn't support transparency. Transparent areas will be white.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
};

export default PNGToJPG;
