import { useState, useRef } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { AdRow } from "@/components/AdRow";
import { ImageEditor } from "@/components/ImageEditor";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";

const AdvancedImageEditor = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setOriginalImage(imageUrl);
        setProcessedImage(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = (imageData: string) => {
    const link = document.createElement("a");
    link.download = "edited-image.png";
    link.href = imageData;
    link.click();
    toast.success("Image downloaded successfully!");
  };

  return (
    <ToolLayout
      title="Advanced Image Editor"
      description="Professional image editing with layers, filters, and advanced tools"
      category="Image Tools"
    >
      <AdRow className="mb-6" />
      
      {!originalImage ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed rounded-lg">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <Upload className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Upload an Image to Edit</h3>
          <p className="text-muted-foreground mb-4">Support for JPG, PNG, WebP</p>
          <Button onClick={() => fileInputRef.current?.click()} size="lg">
            Choose Image
          </Button>
        </div>
      ) : (
        <ImageEditor
          originalImage={originalImage}
          processedImage={processedImage}
          onDownload={handleDownload}
        />
      )}
      
      <AdRow className="mt-6" />
    </ToolLayout>
  );
};

export default AdvancedImageEditor;
