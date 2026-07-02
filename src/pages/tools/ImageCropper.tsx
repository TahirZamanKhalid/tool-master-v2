import { useState, useRef } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { AdWatchModal } from "@/components/AdWatchModal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Download } from "lucide-react";
import { isRasterImageFile } from "@/utils/imageFiles";

const MAX_IMAGE_SIZE = 15 * 1024 * 1024;
const SUPPORTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/bmp"];

const ImageCropper = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 50,
    height: 50,
    x: 25,
    y: 25
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [showAdOverlay, setShowAdOverlay] = useState(false);
  const [canDownload, setCanDownload] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

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
      setSelectedImage(reader.result as string);
      setCompletedCrop(null);
      setShowAdOverlay(true);
      setCanDownload(false);
    };
    reader.readAsDataURL(file);
  };

  const setDefaultCompletedCrop = (img: HTMLImageElement) => {
    setCompletedCrop({
      unit: "px",
      x: Math.round(img.width * 0.25),
      y: Math.round(img.height * 0.25),
      width: Math.max(1, Math.round(img.width * 0.5)),
      height: Math.max(1, Math.round(img.height * 0.5)),
    });
  };

  const handleAdComplete = () => {
    setCanDownload(true);
    toast.success("Image loaded! You can now crop your image.");
  };

  const downloadCroppedImage = () => {
    if (!completedCrop || !imgRef.current || !canDownload) return;

    const canvas = document.createElement('canvas');
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    
    canvas.width = Math.max(1, Math.round(completedCrop.width * scaleX));
    canvas.height = Math.max(1, Math.round(completedCrop.height * scaleY));
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(
      imgRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = 'cropped-image.png';
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  return (
    <ToolLayout
      title="Image Cropper"
      description="Crop images to your desired size with flexible selection"
      category="Image Tools"
      instructions={[
        "Upload an image using the file input",
        "Drag the crop area to select the portion you want to keep",
        "Resize the crop area by dragging the corners or edges",
        "Click Download to save your cropped image"
      ]}
      relatedTools={[
        { name: "Image Resizer", path: "/tools/image-resizer" },
        { name: "Image Size Reducer", path: "/tools/image-size-reducer" },
      ]}
    >
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <Label>Upload Image</Label>
            <Input type="file" accept={SUPPORTED_TYPES.join(",")} onChange={handleImageUpload} />
          </div>
          
          {selectedImage && canDownload && (
            <div className="space-y-4">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={undefined}
              >
                <img 
                  ref={imgRef}
                  src={selectedImage} 
                  alt="Crop preview" 
                  className="max-w-full h-auto"
                  onLoad={(e) => setDefaultCompletedCrop(e.currentTarget)}
                />
              </ReactCrop>
              
              <div className="flex gap-4 justify-center">
                <Button 
                  onClick={downloadCroppedImage}
                  disabled={!completedCrop}
                  size="lg"
                  className="gradient-primary border-0"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Cropped Image
                </Button>
              </div>
            </div>
          )}
          
          {selectedImage && !canDownload && (
            <div>
              <img src={selectedImage} alt="Preview" className="max-w-full h-auto border rounded opacity-50" />
              <p className="text-sm text-muted-foreground mt-4">
                Please wait for the ad to complete...
              </p>
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

export default ImageCropper;
