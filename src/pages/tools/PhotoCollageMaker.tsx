import { useState, useRef, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Upload, Download, Trash2, Loader2, Grid3x3, LayoutGrid } from "lucide-react";
import { AdWatchModal } from "@/components/AdWatchModal";
import { SEOHead } from "@/components/SEOHead";

interface CollageImage {
  id: string;
  image: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
}

type LayoutType = "grid-2x2" | "grid-3x3" | "grid-2x3" | "grid-3x2" | "horizontal" | "vertical";

const PhotoCollageMaker = () => {
  const [images, setImages] = useState<CollageImage[]>([]);
  const [layout, setLayout] = useState<LayoutType>("grid-2x2");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [spacing, setSpacing] = useState([20]);
  const [canvasWidth, setCanvasWidth] = useState(1200);
  const [canvasHeight, setCanvasHeight] = useState(800);
  const [showAdModal, setShowAdModal] = useState(false);
  const [canDownload, setCanDownload] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (images.length > 0) {
      arrangeImages();
    }
  }, [images.length, layout, spacing, canvasWidth, canvasHeight, backgroundColor]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    const imageFiles = files.filter(file => file.type.startsWith("image/"));

    if (imageFiles.length === 0) {
      toast.error("Please upload image files");
      return;
    }

    let loadedCount = 0;
    const newImages: CollageImage[] = [];

    imageFiles.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          newImages.push({
            id: `${Date.now()}-${index}`,
            image: img,
            x: 0,
            y: 0,
            width: img.width,
            height: img.height
          });

          loadedCount++;
          if (loadedCount === imageFiles.length) {
            setImages(prev => [...prev, ...newImages]);
            toast.success(`${imageFiles.length} images loaded!`);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const arrangeImages = () => {
    if (!canvasRef.current || images.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Clear canvas and set background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const gap = spacing[0];
    let positions: { x: number; y: number; width: number; height: number }[] = [];

    // Calculate positions based on layout
    switch (layout) {
      case "grid-2x2": {
        const cellWidth = (canvas.width - gap * 3) / 2;
        const cellHeight = (canvas.height - gap * 3) / 2;
        positions = [
          { x: gap, y: gap, width: cellWidth, height: cellHeight },
          { x: gap * 2 + cellWidth, y: gap, width: cellWidth, height: cellHeight },
          { x: gap, y: gap * 2 + cellHeight, width: cellWidth, height: cellHeight },
          { x: gap * 2 + cellWidth, y: gap * 2 + cellHeight, width: cellWidth, height: cellHeight }
        ];
        break;
      }
      case "grid-3x3": {
        const cellWidth = (canvas.width - gap * 4) / 3;
        const cellHeight = (canvas.height - gap * 4) / 3;
        for (let row = 0; row < 3; row++) {
          for (let col = 0; col < 3; col++) {
            positions.push({
              x: gap + col * (cellWidth + gap),
              y: gap + row * (cellHeight + gap),
              width: cellWidth,
              height: cellHeight
            });
          }
        }
        break;
      }
      case "grid-2x3": {
        const cellWidth = (canvas.width - gap * 3) / 2;
        const cellHeight = (canvas.height - gap * 4) / 3;
        for (let row = 0; row < 3; row++) {
          for (let col = 0; col < 2; col++) {
            positions.push({
              x: gap + col * (cellWidth + gap),
              y: gap + row * (cellHeight + gap),
              width: cellWidth,
              height: cellHeight
            });
          }
        }
        break;
      }
      case "grid-3x2": {
        const cellWidth = (canvas.width - gap * 4) / 3;
        const cellHeight = (canvas.height - gap * 3) / 2;
        for (let row = 0; row < 2; row++) {
          for (let col = 0; col < 3; col++) {
            positions.push({
              x: gap + col * (cellWidth + gap),
              y: gap + row * (cellHeight + gap),
              width: cellWidth,
              height: cellHeight
            });
          }
        }
        break;
      }
      case "horizontal": {
        const cellWidth = (canvas.width - gap * (images.length + 1)) / images.length;
        const cellHeight = canvas.height - gap * 2;
        for (let i = 0; i < images.length; i++) {
          positions.push({
            x: gap + i * (cellWidth + gap),
            y: gap,
            width: cellWidth,
            height: cellHeight
          });
        }
        break;
      }
      case "vertical": {
        const cellWidth = canvas.width - gap * 2;
        const cellHeight = (canvas.height - gap * (images.length + 1)) / images.length;
        for (let i = 0; i < images.length; i++) {
          positions.push({
            x: gap,
            y: gap + i * (cellHeight + gap),
            width: cellWidth,
            height: cellHeight
          });
        }
        break;
      }
    }

    // Draw images
    images.forEach((img, index) => {
      if (index < positions.length) {
        const pos = positions[index];
        drawImageFit(ctx, img.image, pos.x, pos.y, pos.width, pos.height);
      }
    });
  };

  const drawImageFit = (
    ctx: CanvasRenderingContext2D,
    image: HTMLImageElement,
    x: number,
    y: number,
    maxWidth: number,
    maxHeight: number
  ) => {
    const imgRatio = image.width / image.height;
    const boxRatio = maxWidth / maxHeight;

    let drawWidth = maxWidth;
    let drawHeight = maxHeight;
    let offsetX = x;
    let offsetY = y;

    if (imgRatio > boxRatio) {
      // Image is wider, fit to height
      drawHeight = maxHeight;
      drawWidth = maxHeight * imgRatio;
      offsetX = x + (maxWidth - drawWidth) / 2;
    } else {
      // Image is taller, fit to width
      drawWidth = maxWidth;
      drawHeight = maxWidth / imgRatio;
      offsetY = y + (maxHeight - drawHeight) / 2;
    }

    // Use clipping to ensure image doesn't overflow
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, maxWidth, maxHeight);
    ctx.clip();
    ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
    ctx.restore();
  };

  const removeImage = (id: string) => {
    setImages(images.filter(img => img.id !== id));
    toast.success("Image removed");
  };

  const clearAll = () => {
    setImages([]);
    toast.success("All images cleared");
  };

  const handleDownload = () => {
    if (images.length === 0) {
      toast.error("Please add images to create a collage");
      return;
    }

    if (!canDownload) {
      setShowAdModal(true);
      return;
    }

    downloadCollage();
  };

  const downloadCollage = () => {
    if (!canvasRef.current) return;

    setIsProcessing(true);
    setTimeout(() => {
      canvasRef.current?.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `collage-${Date.now()}.png`;
          link.click();
          URL.revokeObjectURL(url);
          toast.success("Collage downloaded!");
        }
        setIsProcessing(false);
      }, "image/png");
    }, 100);
  };

  const getLayoutDescription = (layout: LayoutType) => {
    switch (layout) {
      case "grid-2x2": return "2x2 Grid (4 photos)";
      case "grid-3x3": return "3x3 Grid (9 photos)";
      case "grid-2x3": return "2x3 Grid (6 photos)";
      case "grid-3x2": return "3x2 Grid (6 photos)";
      case "horizontal": return "Horizontal Strip";
      case "vertical": return "Vertical Strip";
      default: return layout;
    }
  };

  return (
    <>
      <SEOHead
        title="Photo Collage Maker - Create Picture Collages Online"
        description="Create beautiful photo collages online for free. Multiple layout options, easy to use, no watermarks. Perfect for Instagram, Facebook, and printing."
        keywords="photo collage maker, picture collage, photo grid, collage creator, photo layout"
        canonical="https://toolmaster.cloud/tools/photo-collage-maker"
      />
      <ToolLayout
        title="Photo Collage Maker"
        description="Create beautiful photo collages with multiple layout options"
        category="Image Tools"
        instructions={[
          "Upload multiple images (2-9 photos)",
          "Choose a layout template",
          "Adjust spacing and background color",
          "Customize canvas size if needed",
          "Download your finished collage"
        ]}
        relatedTools={[
          { name: "Image Resizer", path: "/tools/image-resizer" },
          { name: "Advanced Image Editor", path: "/tools/advanced-image-editor" },
          { name: "Watermark Tool", path: "/tools/watermark-tool" }
        ]}
      >
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Controls */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label>Upload Images</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="w-full mt-2"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Images ({images.length} selected)
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    You can select multiple images at once
                  </p>
                </div>

                {images.length > 0 && (
                  <>
                    <div>
                      <Label>Layout Template</Label>
                      <Select value={layout} onValueChange={(v) => setLayout(v as LayoutType)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="grid-2x2">
                            <div className="flex items-center gap-2">
                              <Grid3x3 className="h-4 w-4" />
                              {getLayoutDescription("grid-2x2")}
                            </div>
                          </SelectItem>
                          <SelectItem value="grid-3x3">
                            <div className="flex items-center gap-2">
                              <LayoutGrid className="h-4 w-4" />
                              {getLayoutDescription("grid-3x3")}
                            </div>
                          </SelectItem>
                          <SelectItem value="grid-2x3">{getLayoutDescription("grid-2x3")}</SelectItem>
                          <SelectItem value="grid-3x2">{getLayoutDescription("grid-3x2")}</SelectItem>
                          <SelectItem value="horizontal">{getLayoutDescription("horizontal")}</SelectItem>
                          <SelectItem value="vertical">{getLayoutDescription("vertical")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="spacing">Spacing: {spacing[0]}px</Label>
                      <Slider
                        id="spacing"
                        min={0}
                        max={50}
                        step={5}
                        value={spacing}
                        onValueChange={setSpacing}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="bg-color">Background Color</Label>
                      <div className="flex gap-2 mt-2">
                        <input
                          id="bg-color"
                          type="color"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="w-20 h-10 rounded border cursor-pointer"
                        />
                        <div className="flex-1 grid grid-cols-5 gap-1">
                          {["#ffffff", "#000000", "#f3f4f6", "#fef3c7", "#dbeafe"].map(color => (
                            <button
                              key={color}
                              onClick={() => setBackgroundColor(color)}
                              className="h-10 rounded border-2 transition-all hover:scale-105"
                              style={{
                                backgroundColor: color,
                                borderColor: backgroundColor === color ? "#3b82f6" : "transparent"
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="canvas-width">Width: {canvasWidth}px</Label>
                        <Select value={canvasWidth.toString()} onValueChange={(v) => setCanvasWidth(parseInt(v))}>
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="800">800px</SelectItem>
                            <SelectItem value="1000">1000px</SelectItem>
                            <SelectItem value="1200">1200px (Default)</SelectItem>
                            <SelectItem value="1500">1500px</SelectItem>
                            <SelectItem value="1920">1920px (HD)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="canvas-height">Height: {canvasHeight}px</Label>
                        <Select value={canvasHeight.toString()} onValueChange={(v) => setCanvasHeight(parseInt(v))}>
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="600">600px</SelectItem>
                            <SelectItem value="800">800px (Default)</SelectItem>
                            <SelectItem value="1000">1000px</SelectItem>
                            <SelectItem value="1080">1080px (HD)</SelectItem>
                            <SelectItem value="1200">1200px</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Uploaded Images ({images.length})</Label>
                      <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
                        {images.map((img) => (
                          <div key={img.id} className="relative group">
                            <img
                              src={img.image.src}
                              alt="Uploaded"
                              className="w-full h-20 object-cover rounded"
                            />
                            <Button
                              onClick={() => removeImage(img.id)}
                              size="sm"
                              variant="destructive"
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleDownload} className="flex-1" size="lg" disabled={isProcessing}>
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Download Collage
                          </>
                        )}
                      </Button>
                      <Button onClick={clearAll} variant="outline" size="lg">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear All
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Preview */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            <Card className="border-primary/20">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Preview</h3>
                <div className="border rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900">
                  <canvas
                    ref={canvasRef}
                    className="w-full h-auto"
                    style={{ maxHeight: "600px" }}
                  />
                </div>
                {images.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-8">
                      <LayoutGrid className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">Upload images to create your collage</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="mt-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Collage Tips</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Layout Selection:</h4>
                <ul className="space-y-1">
                  <li>• 2x2 Grid: Perfect for 4 photos, balanced composition</li>
                  <li>• 3x3 Grid: Great for showcasing 9 moments</li>
                  <li>• Horizontal/Vertical: Ideal for timeline or story</li>
                  <li>• Match layout to your photo count for best results</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Best Practices:</h4>
                <ul className="space-y-1">
                  <li>• Use images with similar dimensions for consistency</li>
                  <li>• White background works well for most collages</li>
                  <li>• 10-20px spacing prevents photos from touching</li>
                  <li>• 1200x800px is ideal for social media sharing</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </ToolLayout>

      <AdWatchModal
        open={showAdModal}
        onOpenChange={setShowAdModal}
        onAdWatched={() => {
          setCanDownload(true);
          setShowAdModal(false);
          downloadCollage();
        }}
        title="Watch ad to download your collage"
        description="Please watch this short ad to download your beautiful photo collage."
      />
    </>
  );
};

export default PhotoCollageMaker;
