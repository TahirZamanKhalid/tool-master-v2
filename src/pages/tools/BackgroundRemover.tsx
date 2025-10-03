import { useState, useRef } from "react";
import { Header } from "@/components/Header";
import { ToolLayout } from "@/components/ToolLayout";
import { ProcessingOverlay } from "@/components/ProcessingOverlay";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Download, Eraser } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { pipeline, env } from "@huggingface/transformers";

// Configure transformers
env.allowLocalModels = false;
env.useBrowserCache = true;

const BackgroundRemover = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSkip, setShowSkip] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setProcessedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeBackground = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);
    setProgress(0);
    setShowSkip(false);

    try {
      // Simulate minimum display time for ad
      setTimeout(() => setShowSkip(true), 3000);

      setProgress(20);
      const segmenter = await pipeline("image-segmentation", "Xenova/segformer-b0-finetuned-ade-512-512");
      
      setProgress(40);
      const result = await segmenter(selectedImage);
      
      setProgress(60);
      // Create canvas and process image
      const img = new Image();
      img.src = selectedImage;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      
      if (!ctx) throw new Error("Could not get canvas context");

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      setProgress(80);
      // Apply mask (simplified - using first mask result)
      if (result && Array.isArray(result) && result[0]?.mask) {
        for (let i = 0; i < result[0].mask.data.length; i++) {
          const alpha = Math.round((1 - result[0].mask.data[i]) * 255);
          data[i * 4 + 3] = alpha;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      setProgress(100);
      
      const processedUrl = canvas.toDataURL("image/png");
      setProcessedImage(processedUrl);

      toast({
        title: "Success!",
        description: "Background removed successfully",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to remove background. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const downloadImage = () => {
    if (!processedImage) return;
    
    const link = document.createElement("a");
    link.download = "background-removed.png";
    link.href = processedImage;
    link.click();
  };

  return (
    <>
      <Header />
      <ToolLayout
        title="Background Remover"
        description="Remove image backgrounds instantly with AI-powered technology"
        category="Image Tools"
        instructions={[
          "Click 'Upload Image' or drag and drop your image",
          "Wait for the AI to process your image",
          "Download your image with transparent background",
        ]}
        relatedTools={[
          { name: "Image Compressor", path: "/tools/image-compressor" },
          { name: "Image Resizer", path: "/tools/image-resizer" },
        ]}
      >
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
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="font-medium mb-2">Original</p>
                  <img
                    src={selectedImage}
                    alt="Original"
                    className="w-full rounded-lg border"
                  />
                </div>
                {processedImage && (
                  <div>
                    <p className="font-medium mb-2">Background Removed</p>
                    <div className="relative">
                      <div className="absolute inset-0 bg-[linear-gradient(45deg,#f0f0f0_25%,transparent_25%,transparent_75%,#f0f0f0_75%,#f0f0f0),linear-gradient(45deg,#f0f0f0_25%,transparent_25%,transparent_75%,#f0f0f0_75%,#f0f0f0)] bg-[length:20px_20px] bg-[position:0_0,10px_10px] rounded-lg"></div>
                      <img
                        src={processedImage}
                        alt="Processed"
                        className="relative w-full rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-4 justify-center">
            {selectedImage && !processedImage && (
              <Button
                onClick={removeBackground}
                disabled={isProcessing}
                size="lg"
                className="gradient-primary border-0"
              >
                <Eraser className="h-4 w-4 mr-2" />
                Remove Background
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
            
            {processedImage && (
              <Button onClick={downloadImage} size="lg" variant="secondary">
                <Download className="h-4 w-4 mr-2" />
                Download PNG
              </Button>
            )}
          </div>
        </Card>
      </ToolLayout>

      {isProcessing && (
        <ProcessingOverlay
          message="Removing background with AI..."
          progress={progress}
          showSkip={showSkip}
          onSkip={() => setIsProcessing(false)}
        />
      )}
    </>
  );
};

export default BackgroundRemover;
