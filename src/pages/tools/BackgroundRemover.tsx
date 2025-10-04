import { useState, useRef } from "react";
import { Header } from "@/components/Header";
import { ToolLayout } from "@/components/ToolLayout";
import { ProcessingOverlay } from "@/components/ProcessingOverlay";
import { ImageEditor } from "@/components/ImageEditor";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Download, Eraser } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { pipeline, env, RawImage } from "@huggingface/transformers";

// Configure transformers for optimal background removal
env.allowLocalModels = false;
env.useBrowserCache = true;

const MAX_IMAGE_DIMENSION = 2048;

const BackgroundRemover = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSkip, setShowSkip] = useState(false);
  const [canDownload, setCanDownload] = useState(false);
  const [showAdOverlay, setShowAdOverlay] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setProcessedImage(null);
        setShowEditor(false);
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
      setTimeout(() => setShowSkip(true), 5000);

      setProgress(10);
      toast({
        title: "Loading AI Model",
        description: "Initializing state-of-the-art background removal...",
      });
      
      // Load image
      const img = new Image();
      img.src = selectedImage;
      await new Promise((resolve) => img.onload = resolve);

      setProgress(20);

      // Resize if needed while maintaining aspect ratio
      let canvas = document.createElement("canvas");
      let ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");

      let width = img.naturalWidth;
      let height = img.naturalHeight;

      if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
        if (width > height) {
          height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
          width = MAX_IMAGE_DIMENSION;
        } else {
          width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
          height = MAX_IMAGE_DIMENSION;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      setProgress(35);
      toast({
        title: "Processing Image",
        description: "AI is analyzing and removing background...",
      });
      
      // Use RMBG-1.4 - State-of-the-art background removal model
      // This model is specifically trained for background removal with superior quality
      const segmenter = await pipeline(
        "image-segmentation", 
        "briaai/RMBG-1.4",
        { 
          device: "webgpu",
        }
      );
      
      setProgress(55);
      
      // Convert canvas to image data
      const imageData = canvas.toDataURL("image/png");
      const result = await segmenter(imageData);
      
      setProgress(75);

      if (!result || !Array.isArray(result) || result.length === 0) {
        throw new Error("No segmentation result received");
      }

      // The RMBG model returns a binary mask - use it directly
      const mask = result[0].mask;
      
      setProgress(85);

      // Apply mask with high precision
      const outputImageData = ctx.getImageData(0, 0, width, height);
      const data = outputImageData.data;

      // Apply the mask to create transparency
      for (let i = 0; i < mask.data.length; i++) {
        // The mask value is already optimized by RMBG model
        const alpha = Math.round(mask.data[i] * 255);
        data[i * 4 + 3] = alpha;
      }

      ctx.putImageData(outputImageData, 0, 0);
      setProgress(100);
      
      toast({
        title: "Complete!",
        description: "Background removed with AI precision",
      });

      const processedUrl = canvas.toDataURL("image/png");
      setProcessedImage(processedUrl);
      setIsProcessing(false);
      setShowAdOverlay(true);
      setCanDownload(false);
    } catch (error) {
      console.error("Background removal error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove background. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const handleAdComplete = () => {
    setCanDownload(true);
    setShowEditor(true);
    toast({
      title: "Success!",
      description: "Background removed. You can now download or edit the result.",
    });
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
        title="AI Background Remover"
        description="Remove image backgrounds instantly with state-of-the-art AI technology - no manual editing needed!"
        category="Image Tools"
        instructions={[
          "Upload any image (portrait, product, object, etc.)",
          "AI automatically detects and removes background with precision",
          "Download transparent PNG or use brush tools for fine-tuning",
          "Optional: Use erase/keep brushes if you want to refine the result",
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
            ) : showEditor && processedImage ? (
              <ImageEditor
                originalImage={selectedImage}
                processedImage={processedImage}
                onDownload={downloadImage}
              />
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

          {!showEditor && (
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
              
              {processedImage && !showEditor && (
                <Button 
                  onClick={() => setShowEditor(true)} 
                  size="lg" 
                  variant="secondary"
                >
                  Edit Result
                </Button>
              )}
            </div>
          )}
        </Card>
      </ToolLayout>

      {isProcessing && (
        <ProcessingOverlay
          message="AI is intelligently removing background... This may take 10-30 seconds for best quality"
          progress={progress}
          showSkip={showSkip}
          onSkip={() => setIsProcessing(false)}
        />
      )}

      {showAdOverlay && (
        <ProcessingOverlay
          message="Processing complete! Please view the ad to enable download."
          adViewTime={10}
          onAdComplete={handleAdComplete}
          showSkip={canDownload}
          onSkip={() => setShowAdOverlay(false)}
        />
      )}
    </>
  );
};

export default BackgroundRemover;
