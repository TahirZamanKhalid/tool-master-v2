import { useState, useRef } from "react";
import { Header } from "@/components/Header";
import { ToolLayout } from "@/components/ToolLayout";
import { AdWatchModal } from "@/components/AdWatchModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Upload, Download, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AdRow } from "@/components/AdRow";

const ImageCompressor = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [compressedImage, setCompressedImage] = useState<string | null>(null);
  const [quality, setQuality] = useState([80]);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [showAdOverlay, setShowAdOverlay] = useState(false);
  const [canDownload, setCanDownload] = useState(false);
  const [imageFormat, setImageFormat] = useState<string>("image/jpeg");
  const [originalFormat, setOriginalFormat] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOriginalSize(file.size);
      setOriginalFormat(file.type);
      // Default to JPEG for compression, unless it's PNG with transparency
      setImageFormat("image/jpeg");
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setCompressedImage(null);
        setCompressedSize(0);
      };
      reader.readAsDataURL(file);
    }
  };

  const compressImage = () => {
    if (!selectedImage) return;

    const img = new Image();
    img.src = selectedImage;

    img.onload = () => {
      const canvas = document.createElement("canvas");

      // Calculate new dimensions (reduce by quality factor for better compression)
      const scaleFactor = Math.max(0.5, quality[0] / 100);
      canvas.width = Math.floor(img.width * scaleFactor);
      canvas.height = Math.floor(img.height * scaleFactor);

      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      // Use better image smoothing for quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = quality[0] > 70 ? 'high' : quality[0] > 40 ? 'medium' : 'low';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Use JPEG format with quality parameter
      canvas.toBlob(
        (blob) => {
          if (blob) {
            setCompressedSize(blob.size);
            const url = URL.createObjectURL(blob);
            setCompressedImage(url);
            setShowAdOverlay(true);
            setCanDownload(false);

            if (blob.size >= originalSize) {
              toast({
                title: "Note",
                description: "Image Reduced size is similar to original. Try lower quality for better compression.",
                variant: "default",
              });
            }
          }
        },
        "image/jpeg",
        quality[0] / 100
      );
    };
  };

  const handleAdComplete = () => {
    setCanDownload(true);
    toast({
      title: "Success!",
      description: `Image Size Reduced to ${formatFileSize(compressedSize)}. You can now download it.`,
    });
  };

  const downloadImage = () => {
    if (!compressedImage) return;

    const link = document.createElement("a");
    link.download = "compressed-image.jpg";
    link.href = compressedImage;
    link.click();
  };

  const savingPercentage = originalSize > 0 && compressedSize > 0
    ? Math.round(((originalSize - compressedSize) / originalSize) * 100)
    : 0;

  return (
    <>
      <Header />
      <ToolLayout
        title="Image Size Reducer"
        description="Reduce image file size while maintaining quality"
        category="Image Tools"
        instructions={[
          "Upload your image (PNG, JPG, WebP)",
          "Adjust quality slider to reduce image size (lower = smaller file)",
          "Click 'Compress Image' to process",
          "Download your Image with reduced size",
        ]}
        relatedTools={[
          { name: "Image Resizer", path: "/tools/image-resizer" },
          { name: "Format Converter", path: "/tools/format-converter" },
        ]}
      >
        <AdRow className="mb-6" />
        <Card className="p-6 space-y-6">
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />

            {!selectedImage ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:border-primary transition-smooth"
              >
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">Click to upload image</p>
                <p className="text-sm text-muted-foreground">
                  Supports PNG, JPG, WebP (Max 10MB)
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="font-medium mb-2">Original ({formatFileSize(originalSize)})</p>
                    <img src={selectedImage} alt="Original" className="w-full rounded-lg border" />
                  </div>
                  {compressedImage && (
                    <div>
                      <p className="font-medium mb-2">
                        Compressed ({formatFileSize(compressedSize)})
                        <span className="text-green-600 ml-2">-{savingPercentage}%</span>
                      </p>
                      <img src={compressedImage} alt="Compressed" className="w-full rounded-lg border" />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Quality: {quality[0]}%</Label>
                  <Slider
                    value={quality}
                    onValueChange={setQuality}
                    min={10}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground">
                    Lower quality = smaller file size
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 justify-center">
            {selectedImage && !compressedImage && (
              <Button onClick={compressImage} size="lg" className="gradient-primary border-0">
                <ImageIcon className="h-4 w-4 mr-2" />
                Compress Image
              </Button>
            )}

            {selectedImage && (
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                size="lg"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload New
              </Button>
            )}

            {compressedImage && canDownload && (
              <Button onClick={downloadImage} size="lg" variant="secondary">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
          </div>
        </Card>
        <AdRow className="mt-6" />
      </ToolLayout>

      {showAdOverlay && (
        <AdWatchModal
          isOpen={showAdOverlay}
          onClose={() => setShowAdOverlay(false)}
          onAdComplete={handleAdComplete}
        />
      )}
    </>
  );
};

export default ImageCompressor;
