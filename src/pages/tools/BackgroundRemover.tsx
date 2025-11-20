import { useState, useRef } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { ProcessingOverlay } from "@/components/ProcessingOverlay";
import { ImageEditor } from "@/components/ImageEditor";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Download, Eraser, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SEOHead } from "@/components/SEOHead";
import { removeBackground, validateImageFile } from "@/utils/backgroundRemoval";

const BackgroundRemover = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState<string>("");
  const [backgroundColor, setBackgroundColor] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast({
        title: "Invalid File",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
      setProcessedImage(null);
      setShowEditor(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveBackground = async () => {
    if (!selectedFile || !selectedImage) {
      toast({
        title: "No Image",
        description: "Please select an image first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setProcessingStage("Initializing...");

    try {
      toast({
        title: "Processing Started",
        description: "AI is analyzing your image. This may take 10-30 seconds...",
      });

      // Remove background using our own implementation
      const resultBlob = await removeBackground(
        selectedFile,
        backgroundColor || undefined,
        (progressValue, stage, message) => {
          setProgress(progressValue);
          setProcessingStage(message);
        }
      );

      // Convert blob to base64 for display
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setProcessedImage(base64);
        setIsProcessing(false);
        setProgress(100);
        setProcessingStage("Complete!");
        
        toast({
          title: "Success!",
          description: "Background removed successfully. You can now download or edit the result.",
        });
      };
      reader.readAsDataURL(resultBlob);

    } catch (error) {
      console.error("Background removal error:", error);
      setIsProcessing(false);
      
      toast({
        title: "Error",
        description: error instanceof Error 
          ? error.message 
          : "Failed to remove background. Please try again with a different image.",
        variant: "destructive",
      });
    }
  };

  const downloadImage = () => {
    if (!processedImage) return;
    
    const link = document.createElement("a");
    const timestamp = new Date().getTime();
    link.download = `background-removed-${timestamp}.png`;
    link.href = processedImage;
    link.click();

    toast({
      title: "Downloaded",
      description: "Image saved successfully!",
    });
  };

  const resetAll = () => {
    setSelectedImage(null);
    setSelectedFile(null);
    setProcessedImage(null);
    setShowEditor(false);
    setBackgroundColor("");
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <SEOHead
        title="Free AI Background Remover - Remove Image Background Online"
        description="Remove image backgrounds instantly with powerful AI technology. 100% free, no signup required. Process images entirely in your browser for maximum privacy."
        keywords="background remover, remove background, AI background removal, transparent background, free background remover, online background removal"
        canonical="https://toolmaster.cloud/tools/background-remover"
      />
      <ToolLayout
        title="AI Background Remover"
        description="Remove image backgrounds instantly with state-of-the-art AI technology. Completely free and private - all processing happens in your browser!"
        category="Image Tools"
        instructions={[
          "Upload any image (portrait, product, object, pet, etc.)",
          "Optionally choose a background color to replace transparency",
          "AI automatically detects and removes background with high precision",
          "Download as transparent PNG or with custom background color",
          "Use the editor for fine-tuning if needed",
          "All processing is done locally in your browser - no uploads, maximum privacy!",
        ]}
        relatedTools={[
          { name: "Image Compressor", path: "/tools/image-compressor" },
          { name: "Image Resizer", path: "/tools/image-resizer" },
          { name: "Image Converter", path: "/tools/image-converter" },
        ]}
      >
        <Card className="p-6 space-y-6">
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImageSelect}
              className="hidden"
            />
            
            {!selectedImage ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:border-primary transition-smooth hover:bg-accent/5"
              >
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">Click to upload image</p>
                <p className="text-sm text-muted-foreground">
                  Supports PNG, JPG, WebP (Max 10MB)
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  🔒 100% Private - All processing happens in your browser
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
                  <div className="space-y-3 bg-accent/5 p-4 rounded-lg">
                    <Label htmlFor="bgColor" className="text-base font-medium">
                      Background Color (Optional)
                    </Label>
                    <div className="flex gap-3 items-center">
                      <div className="relative">
                        <Input
                          id="bgColor"
                          type="color"
                          value={backgroundColor || "#ffffff"}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="w-16 h-10 cursor-pointer p-1"
                        />
                      </div>
                      <Input
                        type="text"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        placeholder="Leave empty for transparent"
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
                      💡 Leave empty for transparent background (.png), or choose a color
                    </p>
                  </div>
                )}
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="font-medium mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      Original Image
                    </p>
                    <div className="relative h-[400px] rounded-lg border shadow-sm overflow-hidden bg-gray-50">
                      <img
                        src={selectedImage}
                        alt="Original"
                        className="absolute inset-0 w-full h-full object-contain"
                      />
                    </div>
                  </div>
                  {processedImage && (
                    <div>
                      <p className="font-medium mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Background Removed
                      </p>
                      <div className="relative h-[400px] rounded-lg overflow-hidden shadow-sm">
                        {/* Checkered background to show transparency */}
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,#f0f0f0_25%,transparent_25%,transparent_75%,#f0f0f0_75%,#f0f0f0),linear-gradient(45deg,#f0f0f0_25%,transparent_25%,transparent_75%,#f0f0f0_75%,#f0f0f0)] bg-[length:20px_20px] bg-[position:0_0,10px_10px]"></div>
                        <img
                          src={processedImage}
                          alt="Processed"
                          className="absolute inset-0 w-full h-full object-contain"
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
                  {isProcessing ? "Processing..." : "Remove Background"}
                </Button>
              )}
              
              {selectedImage && (
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  size="lg"
                  disabled={isProcessing}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload New
                </Button>
              )}
              
              {processedImage && !showEditor && (
                <>
                  <Button 
                    onClick={downloadImage} 
                    size="lg" 
                    className="gradient-primary border-0"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button 
                    onClick={() => setShowEditor(true)} 
                    size="lg" 
                    variant="outline"
                  >
                    Edit Result
                  </Button>
                  <Button 
                    onClick={resetAll} 
                    size="lg" 
                    variant="ghost"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Start Over
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Info section */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-sm mb-2 text-blue-900 dark:text-blue-100">
              🔒 Privacy First
            </h3>
            <p className="text-xs text-blue-800 dark:text-blue-200">
              Your images are processed entirely in your browser using AI. No uploads, no servers, 100% private and secure.
            </p>
          </div>
        </Card>
      </ToolLayout>

      {isProcessing && (
        <ProcessingOverlay
          message={processingStage}
          progress={progress}
          showSkip={false}
          onSkip={() => {}}
        />
      )}
    </>
  );
};

export default BackgroundRemover;