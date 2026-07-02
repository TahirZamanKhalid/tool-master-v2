import { useEffect, useRef, useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Check, Download, Upload, Image as ImageIcon } from "lucide-react";
import { SidebarAd } from "@/components/SidebarAd";
import { AdRow } from "@/components/AdRow";

import { SEOHead } from "@/components/SEOHead";
import { formatFileSize, getOutputExtension, getSafeFileStem, isRasterImageFile } from "@/utils/imageFiles";

const MAX_IMAGE_SIZE = 15 * 1024 * 1024;
const MAX_DIMENSION = 8000;
const SUPPORTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const AdvancedImageCompressor = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [compressedImage, setCompressedImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [quality, setQuality] = useState<number>(80);
  const [format, setFormat] = useState<'jpeg' | 'png' | 'webp'>('jpeg');
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [maxWidth, setMaxWidth] = useState<number>(0);
  const [maxHeight, setMaxHeight] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    return () => {
      if (compressedImage) URL.revokeObjectURL(compressedImage);
    };
  }, [compressedImage]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.currentTarget.value = "";

    if (!file) return;

    if (!isRasterImageFile(file, SUPPORTED_TYPES)) {
      toast.error("Please select a JPG, PNG, or WebP image");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("Please upload an image smaller than 15 MB");
      return;
    }

    setOriginalSize(file.size);
    setFileName(`${getSafeFileStem(file.name)}.${getOutputExtension(format)}`);
    setCompressedImage(null);
    setCompressedSize(0);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        setMaxWidth(img.width);
        setMaxHeight(img.height);
        setSelectedImage(event.target?.result as string);
      };
      img.onerror = () => toast.error("Could not load this image");
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);

    toast.success("Image loaded!");
  };

  const compressImage = () => {
    if (!selectedImage) {
      toast.error("Please select an image first");
      return;
    }

    if (maxWidth < 0 || maxHeight < 0 || maxWidth > MAX_DIMENSION || maxHeight > MAX_DIMENSION) {
      toast.error(`Max width and height must be no more than ${MAX_DIMENSION}px`);
      return;
    }

    const img = new window.Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Calculate dimensions (respect max width/height if set)
      let width = img.width;
      let height = img.height;

      if (maxWidth && width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      if (maxHeight && height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Enable image smoothing for better quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      if (format === "jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            setCompressedSize(blob.size);
            const url = URL.createObjectURL(blob);
            setCompressedImage(url);
            toast.success("Image compressed successfully!");
          } else {
            toast.error("This browser could not export the selected format");
          }
        },
        `image/${format}`,
        quality / 100
      );
    };

    img.onerror = () => toast.error("Could not load this image for compression");
    img.src = selectedImage;
  };

  const downloadCompressed = () => {
    if (!compressedImage) {
      toast.error("Please compress the image first");
      return;
    }

    const link = document.createElement('a');
    link.href = compressedImage;
    link.download = fileName || `compressed-image.${getOutputExtension(format)}`;
    link.click();

    toast.success("Compressed image downloaded!");
  };

  const savingsPercentage = originalSize && compressedSize
    ? Math.abs((1 - compressedSize / originalSize) * 100).toFixed(1)
    : '0.0';
  const isSmaller = compressedSize > 0 && compressedSize <= originalSize;

  return (
    <>
      <SEOHead
        title="Advanced Image Size Reducer - Compress Images Online"
        description="Compress images with full control over quality, format, and dimensions. Reduce file size by up to 90% while maintaining visual quality. Supports JPG, PNG, and WebP."
        keywords="image compressor, reduce image size, advanced image compression, online image compressor, free image tools"
        canonical="https://toolmaster.cloud/tools/advanced-image-compressor"
      />
      <ToolLayout
        title="Advanced Image Size Reducer"
        description="Compress images with full control over quality, format, and dimensions. Reduce file size by up to 90% while maintaining visual quality. Supports JPG, PNG, and WebP."
        category="Image Tools"
        instructions={[
          "Upload your image (JPG, PNG, or WebP)",
          "Choose output format and quality level",
          "Optionally resize by setting max width/height",
          "Click 'Compress Image' to process",
          "Preview and download the compressed image"
        ]}
        relatedTools={[
          { name: "Image Resizer", path: "/tools/image-resizer" },
          { name: "PNG to JPG", path: "/tools/png-to-jpg" },
          { name: "WebP to PNG", path: "/tools/webp-to-png" }
        ]}
      >
        <div className="flex gap-4">
          {/* Left Sidebar Ad */}
          <div className="hidden xl:block w-[200px] flex-shrink-0">
            <SidebarAd slot="5204253730" position="left" index={1} />
          </div>

          <div className="flex-1 grid gap-6">
            <Card>
              <CardContent className="p-6 space-y-6">
                {/* Image Upload */}
                <div>
                  <Label htmlFor="image-upload">Upload Image</Label>
                  <div className="mt-2">
                    <label
                      htmlFor="image-upload"
                      className="flex items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors overflow-hidden"
                    >
                      {selectedImage ? (
                        <img
                          src={selectedImage}
                          alt="Original"
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <div className="text-center">
                          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Click to upload image</p>
                          <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP</p>
                        </div>
                      )}
                      <Input
                        id="image-upload"
                        type="file"
                        accept={SUPPORTED_TYPES.join(",")}
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {originalSize > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Original: {formatFileSize(originalSize)}
                    </p>
                  )}
                </div>

                {selectedImage && (
                  <>
                    {/* Format and Quality Settings */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Output Format</Label>
                        <Select value={format} onValueChange={(value: 'jpeg' | 'png' | 'webp') => {
                          setFormat(value);
                          setFileName(`${getSafeFileStem(fileName)}.${getOutputExtension(value)}`);
                          setCompressedImage(null);
                          setCompressedSize(0);
                        }}>
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="jpeg">JPG (Best Compression)</SelectItem>
                            <SelectItem value="png">PNG (Lossless)</SelectItem>
                            <SelectItem value="webp">WebP (Modern)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="file-name">File Name</Label>
                        <Input
                          id="file-name"
                          value={fileName}
                          onChange={(e) => setFileName(e.target.value)}
                          placeholder="image.jpg"
                          className="mt-2"
                        />
                      </div>
                    </div>

                    {/* Quality Slider */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Quality: {quality}%</Label>
                        <span className="text-xs text-muted-foreground">
                          {quality >= 90 ? "Excellent" : quality >= 70 ? "Good" : quality >= 50 ? "Medium" : "Low"}
                        </span>
                      </div>
                      <Slider
                        value={[quality]}
                        onValueChange={(value) => setQuality(value[0])}
                        min={10}
                        max={100}
                        step={5}
                        className="mt-2"
                      />
                    </div>

                    {/* Dimension Controls */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="max-width">Max Width (optional)</Label>
                        <Input
                          id="max-width"
                          type="number"
                          value={maxWidth || ''}
                          onChange={(e) => setMaxWidth(parseInt(e.target.value) || 0)}
                          placeholder="Auto"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="max-height">Max Height (optional)</Label>
                        <Input
                          id="max-height"
                          type="number"
                          value={maxHeight || ''}
                          onChange={(e) => setMaxHeight(parseInt(e.target.value) || 0)}
                          placeholder="Auto"
                          className="mt-2"
                        />
                      </div>
                    </div>

                    {/* Compress Button */}
                    <Button onClick={compressImage} size="lg" className="w-full">
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Compress Image
                    </Button>

                    {/* Results */}
                    {compressedImage && (
                      <>
                        <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Original Size:</span>
                            <span className="font-medium">{formatFileSize(originalSize)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Compressed Size:</span>
                            <span className="font-medium text-primary">{formatFileSize(compressedSize)}</span>
                          </div>
                          <div className="flex justify-between text-sm font-semibold border-t pt-2">
                            <span>Size Change:</span>
                            <span className={isSmaller ? "text-green-600" : "text-amber-600"}>
                              {isSmaller ? "Reduced" : "Larger"} by {savingsPercentage}%
                            </span>
                          </div>
                        </div>

                        {/* Preview Compressed */}
                        <div>
                          <Label>Compressed Preview</Label>
                          <div className="mt-2 border rounded-lg overflow-hidden">
                            <img
                              src={compressedImage}
                              alt="Compressed"
                              className="w-full h-auto"
                            />
                          </div>
                        </div>

                        <Button onClick={downloadCompressed} size="lg" className="w-full">
                          <Download className="h-4 w-4 mr-2" />
                          Download Compressed Image
                        </Button>
                      </>
                    )}
                  </>
                )}

                <canvas ref={canvasRef} className="hidden" />
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Advanced Compression Features</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-primary" />
                    <span><strong>Multiple Formats:</strong> Save as JPG, PNG, or WebP</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-primary" />
                    <span><strong>Quality Control:</strong> Adjust compression level from 10% to 100%</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-primary" />
                    <span><strong>Smart Resizing:</strong> Optionally resize while compressing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-primary" />
                    <span><strong>Live Preview:</strong> See results before downloading</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-primary" />
                    <span><strong>100% Private:</strong> All processing in your browser</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Bottom Ad Row */}
            <AdRow />
          </div>

          {/* Right Sidebar Ad */}
          <div className="hidden xl:block w-[200px] flex-shrink-0">
            <SidebarAd slot="4351073152" position="right" index={1} />
          </div>
        </div>
      </ToolLayout>
    </>
  );
};

export default AdvancedImageCompressor;
