import { useState, useRef } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { ProcessingOverlay } from "@/components/ProcessingOverlay";
import { ImageEditor } from "@/components/ImageEditor";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Download, Eraser } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SEOHead } from "@/components/SEOHead";
import { removeBackground, loadImage } from "@/utils/backgroundRemoval";
import { supabase } from "@/integrations/supabase/client";

const BackgroundRemover = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSkip, setShowSkip] = useState(false);
  const [canDownload, setCanDownload] = useState(false);
  const [showAdOverlay, setShowAdOverlay] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState<string>("");
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

  const handleRemoveBackground = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);
    setProgress(5);
    setShowSkip(false);

    try {
      toast({
        title: "Processing",
        description: "Removing background locally for best quality (no credits used)...",
      });

      // 1) Try high-quality local matting first (WebGPU/CPU)
      const originalResp = await fetch(selectedImage);
      const originalBlob = await originalResp.blob();
      const imageElement = await loadImage(originalBlob);

      const resultBlob = await removeBackground(
        imageElement,
        backgroundColor || undefined,
        (p) => setProgress(Math.min(95, p))
      );

      const reader = new FileReader();
      reader.onloadend = () => {
        setProcessedImage(reader.result as string);
        setIsProcessing(false);
        setShowAdOverlay(true);
        setCanDownload(false);
        toast({ title: "Complete!", description: "Background removed with local AI." });
      };
      reader.readAsDataURL(resultBlob);
    } catch (localError) {
      console.warn("Local background removal failed, falling back to cloud:", localError);
      try {
        // 2) Fallback to Lovable AI (uses credits)
        setProgress(30);
        const { data, error } = await supabase.functions.invoke('remove-background', {
          body: { imageUrl: selectedImage }
        });
        if (error) throw new Error(error.message || 'Failed to remove background');
        if (!data?.processedImage) throw new Error('No processed image received');

        let finalImage: string = data.processedImage;
        if (backgroundColor) {
          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = data.processedImage;
          });
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            finalImage = canvas.toDataURL('image/png');
          }
        }

        setProgress(100);
        setProcessedImage(finalImage);
        setIsProcessing(false);
        setShowAdOverlay(true);
        setCanDownload(false);
        toast({ title: "Complete!", description: "Background removed with cloud AI." });
      } catch (cloudError) {
        console.error("Background removal error:", cloudError);
        toast({
          title: "Error",
          description: cloudError instanceof Error ? cloudError.message : "Failed to remove background. Please try again.",
          variant: "destructive",
        });
        setIsProcessing(false);
      }
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
      <SEOHead
        title="AI Background Remover"
        description="Remove image backgrounds instantly with state-of-the-art AI technology - no manual editing needed!"
        keywords="background remover, remove background, AI background removal, transparent background"
        canonical="https://toolmaster.cloud/tools/background-remover"
      />
      <ToolLayout
        title="AI Background Remover"
        description="Remove image backgrounds instantly with state-of-the-art AI technology - no manual editing needed!"
        category="Image Tools"
        instructions={[
          "Upload any image (portrait, product, object, etc.)",
          "Optionally choose a background color to replace the removed background",
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
              <>
                {!processedImage && (
                  <div className="space-y-3">
                    <Label htmlFor="bgColor">Background Color (Optional)</Label>
                    <div className="flex gap-3 items-center">
                      <Input
                        id="bgColor"
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-20 h-10 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        placeholder="#ffffff or transparent"
                        className="flex-1"
                      />
                      {backgroundColor && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setBackgroundColor("")}
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Leave empty for transparent background
                    </p>
                  </div>
                )}
                
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
              </>
            )}
          </div>

          {!showEditor && (
            <div className="flex gap-4 justify-center flex-wrap">
              {selectedImage && !processedImage && (
                <Button
                  onClick={handleRemoveBackground}
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
          message="AI is removing background with high precision..."
          progress={progress}
          showSkip={false}
          onSkip={() => setIsProcessing(false)}
        />
      )}

      {showAdOverlay && (
        <ProcessingOverlay
          message="Processing complete! Please view the ad to enable download."
          minAdViewTime={5}
          onAdComplete={handleAdComplete}
          showSkip={canDownload}
          onSkip={() => setShowAdOverlay(false)}
        />
      )}
    </>
  );
};

export default BackgroundRemover;
