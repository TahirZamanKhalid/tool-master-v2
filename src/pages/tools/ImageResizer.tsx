import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { ProcessingOverlay } from "@/components/ProcessingOverlay";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const ImageResizer = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [resizedImage, setResizedImage] = useState<string | null>(null);
  const [showAdOverlay, setShowAdOverlay] = useState(false);
  const [canDownload, setCanDownload] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleResize = () => {
    if (!selectedImage || !width || !height) {
      toast.error("Please upload an image and set dimensions");
      return;
    }

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = parseInt(width);
      canvas.height = parseInt(height);
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      setResizedImage(canvas.toDataURL());
      setShowAdOverlay(true);
      setCanDownload(false);
    };
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
            <Input type="file" accept="image/*" onChange={handleImageUpload} />
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
        <ProcessingOverlay
          message="Resize complete! Please view the ad to enable download."
          adViewTime={8}
          onAdComplete={handleAdComplete}
          showSkip={canDownload}
          onSkip={() => setShowAdOverlay(false)}
        />
      )}
    </ToolLayout>
  );
};

export default ImageResizer;
