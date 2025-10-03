import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const ImageCropper = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        toast.success("Image uploaded! Crop functionality coming soon.");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <ToolLayout
      title="Image Cropper"
      description="Crop images to your desired size"
      category="Image Tools"
    >
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <Label>Upload Image</Label>
            <Input type="file" accept="image/*" onChange={handleImageUpload} />
          </div>
          {selectedImage && (
            <div>
              <img src={selectedImage} alt="Preview" className="max-w-full h-auto border rounded" />
              <p className="text-sm text-muted-foreground mt-4">
                Advanced cropping interface coming soon!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </ToolLayout>
  );
};

export default ImageCropper;
