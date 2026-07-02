import { useRef, useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { AdWatchModal } from "@/components/AdWatchModal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { isRasterImageFile } from "@/utils/imageFiles";

const MAX_IMAGE_SIZE = 15 * 1024 * 1024;
const MAX_DIMENSION = 8000;
const SUPPORTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/bmp"];

const ImageResizer = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [resizedImage, setResizedImage] = useState<string | null>(null);
  const [showAdOverlay, setShowAdOverlay] = useState(false);
  const [canDownload, setCanDownload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.currentTarget.value = "";
    if (!file) return;

    if (!isRasterImageFile(file, SUPPORTED_TYPES)) {
      toast.error("Please upload a JPG, PNG, WebP, or BMP image");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("Please upload an image smaller than 15 MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onload = () => {
        setSelectedImage(dataUrl);
        setResizedImage(null);
        setCanDownload(false);
        setWidth(String(img.naturalWidth || img.width));
        setHeight(String(img.naturalHeight || img.height));
      };
      img.onerror = () => toast.error("Could not load this image");
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleResize = () => {
    const targetWidth = Number(width);
    const targetHeight = Number(height);

    if (!selectedImage || !width || !height) {
      toast.error("Please upload an image and set dimensions");
      return;
    }

    if (
      !Number.isInteger(targetWidth) ||
      !Number.isInteger(targetHeight) ||
      targetWidth <= 0 ||
      targetHeight <= 0 ||
      targetWidth > MAX_DIMENSION ||
      targetHeight > MAX_DIMENSION
    ) {
      toast.error(`Width and height must be whole numbers from 1 to ${MAX_DIMENSION}`);
      return;
    }

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        toast.error("Your browser could not resize this image");
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      setResizedImage(canvas.toDataURL());
      setShowAdOverlay(true);
      setCanDownload(false);
    };
    img.onerror = () => toast.error("Could not load this image for resizing");
    img.src = selectedImage;
  };

  const handleAdComplete = () => {
    setCanDownload(true);
    toast.success("Image resized! You can now download it.");
  };

  return (
    <ToolLayout
      title="Image Resizer"
      description="Resize images to custom dimensions"
      category="Image Tools"
    >
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <Label>Upload Image</Label>
            <Input
              ref={fileInputRef}
              type="file"
              accept={SUPPORTED_TYPES.join(",")}
              onChange={handleImageUpload}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Width (px)</Label>
              <Input
                type="number"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                placeholder="800"
              />
            </div>
            <div>
              <Label>Height (px)</Label>
              <Input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="600"
              />
            </div>
          </div>
          <Button onClick={handleResize} className="w-full">
            Resize Image
          </Button>
          {selectedImage && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Original:</p>
              <img src={selectedImage} alt="Original" className="max-w-full h-auto" />
            </div>
          )}
          {resizedImage && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Resized:</p>
              <img src={resizedImage} alt="Resized" className="max-w-full h-auto" />
              {canDownload && (
                <a href={resizedImage} download="resized-image.png">
                  <Button className="mt-2 w-full">Download</Button>
                </a>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {showAdOverlay && (
        <AdWatchModal
          isOpen={showAdOverlay}
          onClose={() => setShowAdOverlay(false)}
          onAdComplete={handleAdComplete}
        />
      )}
    </ToolLayout>
  );
};

export default ImageResizer;
