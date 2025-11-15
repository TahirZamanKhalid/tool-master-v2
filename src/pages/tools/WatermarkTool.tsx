import { useState, useRef, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import {
  Upload,
  Download,
  Type,
  Image as ImageIcon,
  Loader2,
  ChevronDown,
  Settings,
  MapPin,
  Palette,
  RotateCw,
} from "lucide-react";
import { AdWatchModal } from "@/components/AdWatchModal";
import { SEOHead } from "@/components/SEOHead";
import { LazyAdSpace } from "@/components/LazyAdSpace";
import { AdRow } from "@/components/AdRow";
import { getDisplayAdSlot, getAdIndex } from "@/utils/adSlotRotation";

type WatermarkType = "text" | "image";
type Position = "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center" | "tiled";

const WatermarkTool = () => {
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState("");
  const [watermarkType, setWatermarkType] = useState<WatermarkType>("text");
  const [watermarkText, setWatermarkText] = useState("© Your Brand");
  const [watermarkImage, setWatermarkImage] = useState<HTMLImageElement | null>(null);
  const [position, setPosition] = useState<Position>("bottom-right");
  const [opacity, setOpacity] = useState([70]);
  const [fontSize, setFontSize] = useState([48]);
  const [watermarkSize, setWatermarkSize] = useState([100]);
  const [rotation, setRotation] = useState([0]);
  const [color, setColor] = useState("#ffffff");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [showAdModal, setShowAdModal] = useState(false);
  const [canDownload, setCanDownload] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Collapsible states
  const [openSections, setOpenSections] = useState({
    watermarkType: true,
    position: false,
    appearance: false,
    rotation: false,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const watermarkInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (originalImage) {
      drawWatermarkedImage();
    }
  }, [
    originalImage,
    watermarkType,
    watermarkText,
    watermarkImage,
    position,
    opacity,
    fontSize,
    watermarkSize,
    rotation,
    color,
    fontFamily,
  ]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setOriginalImage(img);
        setOriginalImageUrl(event.target?.result as string);
        toast.success("Image loaded!");
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleWatermarkImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setWatermarkImage(img);
        toast.success("Watermark image loaded!");
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const drawWatermarkedImage = () => {
    if (!originalImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = originalImage.width;
    canvas.height = originalImage.height;

    ctx.drawImage(originalImage, 0, 0);
    ctx.globalAlpha = opacity[0] / 100;

    if (watermarkType === "text") {
      drawTextWatermark(ctx, canvas.width, canvas.height);
    } else if (watermarkType === "image" && watermarkImage) {
      drawImageWatermark(ctx, canvas.width, canvas.height);
    }

    ctx.globalAlpha = 1;
  };

  const drawTextWatermark = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.font = `${fontSize[0]}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.textBaseline = "middle";

    const text = watermarkText || "Watermark";
    const textWidth = ctx.measureText(text).width;
    const textHeight = fontSize[0];

    if (position === "tiled") {
      const spacing = 100;
      for (let y = 0; y < height + spacing; y += fontSize[0] + spacing) {
        for (let x = 0; x < width + spacing; x += textWidth + spacing) {
          ctx.save();
          ctx.translate(x + textWidth / 2, y + textHeight / 2);
          ctx.rotate((rotation[0] * Math.PI) / 180);
          ctx.fillText(text, -textWidth / 2, 0);
          ctx.restore();
        }
      }
    } else {
      const pos = getPosition(width, height, textWidth, textHeight);
      ctx.save();
      ctx.translate(pos.x + textWidth / 2, pos.y + textHeight / 2);
      ctx.rotate((rotation[0] * Math.PI) / 180);
      ctx.fillText(text, -textWidth / 2, 0);
      ctx.restore();
    }
  };

  const drawImageWatermark = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!watermarkImage) return;

    const scale = watermarkSize[0] / 100;
    const wmWidth = watermarkImage.width * scale;
    const wmHeight = watermarkImage.height * scale;

    if (position === "tiled") {
      const spacing = 50;
      for (let y = 0; y < height + spacing; y += wmHeight + spacing) {
        for (let x = 0; x < width + spacing; x += wmWidth + spacing) {
          ctx.save();
          ctx.translate(x + wmWidth / 2, y + wmHeight / 2);
          ctx.rotate((rotation[0] * Math.PI) / 180);
          ctx.drawImage(watermarkImage, -wmWidth / 2, -wmHeight / 2, wmWidth, wmHeight);
          ctx.restore();
        }
      }
    } else {
      const pos = getPosition(width, height, wmWidth, wmHeight);
      ctx.save();
      ctx.translate(pos.x + wmWidth / 2, pos.y + wmHeight / 2);
      ctx.rotate((rotation[0] * Math.PI) / 180);
      ctx.drawImage(watermarkImage, -wmWidth / 2, -wmHeight / 2, wmWidth, wmHeight);
      ctx.restore();
    }
  };

  const getPosition = (canvasWidth: number, canvasHeight: number, watermarkWidth: number, watermarkHeight: number) => {
    const padding = 20;

    switch (position) {
      case "top-left":
        return { x: padding, y: padding };
      case "top-right":
        return { x: canvasWidth - watermarkWidth - padding, y: padding };
      case "bottom-left":
        return { x: padding, y: canvasHeight - watermarkHeight - padding };
      case "bottom-right":
        return { x: canvasWidth - watermarkWidth - padding, y: canvasHeight - watermarkHeight - padding };
      case "center":
        return { x: (canvasWidth - watermarkWidth) / 2, y: (canvasHeight - watermarkHeight) / 2 };
      default:
        return { x: padding, y: padding };
    }
  };

  const handleDownload = () => {
    if (!originalImage) {
      toast.error("Please upload an image first");
      return;
    }

    if (!canDownload) {
      setShowAdModal(true);
      return;
    }

    downloadWatermarkedImage();
  };

  const downloadWatermarkedImage = () => {
    if (!canvasRef.current) return;

    setIsProcessing(true);
    setTimeout(() => {
      canvasRef.current?.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `watermarked-${Date.now()}.png`;
          link.click();
          URL.revokeObjectURL(url);
          toast.success("Image downloaded!");
        }
        setIsProcessing(false);
      }, "image/png");
    }, 100);
  };

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <>
      <SEOHead
        title="Watermark Tool - Add Watermarks to Images Online"
        description="Add text or image watermarks to your photos online. Free watermark tool with position, opacity, rotation controls."
        keywords="watermark tool, add watermark, photo watermark, image watermark, copyright protection"
        canonical="https://toolmaster.cloud/tools/watermark-tool"
      />
      <ToolLayout
        title="Watermark Tool"
        description="Add custom text or image watermarks to protect your photos and images"
        category="Image Tools"
        instructions={[
          "Upload your image",
          "Choose text or image watermark",
          "Customize position, opacity, size, and rotation",
          "Preview the watermarked image",
          "Download your protected image",
        ]}
        relatedTools={[
          { name: "Image Compressor", path: "/tools/image-compressor" },
          { name: "Advanced Image Editor", path: "/tools/advanced-image-editor" },
          { name: "Image Resizer", path: "/tools/image-resizer" },
        ]}
      >
        {/* Top Leaderboard Ad */}
        <div className="mb-6">
          <LazyAdSpace type="display" slot={getDisplayAdSlot(getAdIndex('top'))} />
        </div>

        <div className="flex gap-6 relative">
          {/* Left Sidebar Ad */}
          <div className="hidden xl:block flex-shrink-0" style={{ width: "160px", maxWidth: "160px" }}>
            <div className="sticky top-24" style={{ maxHeight: "600px", overflow: "hidden" }}>
              <LazyAdSpace 
                type="display" 
                slot={getDisplayAdSlot(getAdIndex('sidebar-left'))}
                position="sidebar-left"
              />
            </div>
          </div>

          <div className="flex-1 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-4">
              {/* Left Column - Controls */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  {/* Upload Section */}
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      className="w-full"
                      size="sm"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {originalImage ? "Change Image" : "Upload Image"}
                    </Button>
                  </div>

                  {originalImage && (
                    <div className="space-y-2">
                      {/* Watermark Type Section */}
                      <Collapsible
                        open={openSections.watermarkType}
                        onOpenChange={() => toggleSection("watermarkType")}
                      >
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded-md transition-colors">
                          <div className="flex items-center gap-2">
                            <Type className="h-4 w-4 text-primary" />
                            <span className="font-medium text-sm">Watermark Type</span>
                          </div>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${openSections.watermarkType ? "rotate-180" : ""}`}
                          />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pt-3 pb-2 px-2 space-y-3">
                          <Tabs value={watermarkType} onValueChange={(v) => setWatermarkType(v as WatermarkType)}>
                            <TabsList className="grid w-full grid-cols-2 h-8">
                              <TabsTrigger value="text" className="text-xs">
                                <Type className="h-3 w-3 mr-1" />
                                Text
                              </TabsTrigger>
                              <TabsTrigger value="image" className="text-xs">
                                <ImageIcon className="h-3 w-3 mr-1" />
                                Image
                              </TabsTrigger>
                            </TabsList>

                            <TabsContent value="text" className="space-y-3 mt-3">
                              <div>
                                <Label htmlFor="watermark-text" className="text-xs">
                                  Text
                                </Label>
                                <Input
                                  id="watermark-text"
                                  value={watermarkText}
                                  onChange={(e) => setWatermarkText(e.target.value)}
                                  placeholder="© Your Brand"
                                  className="mt-1 h-8 text-sm"
                                />
                              </div>

                              <div>
                                <Label htmlFor="font-size" className="text-xs">
                                  Size: {fontSize[0]}px
                                </Label>
                                <Slider
                                  id="font-size"
                                  min={12}
                                  max={200}
                                  step={1}
                                  value={fontSize}
                                  onValueChange={setFontSize}
                                  className="mt-1"
                                />
                              </div>

                              <div>
                                <Label htmlFor="font-family" className="text-xs">
                                  Font
                                </Label>
                                <Select value={fontFamily} onValueChange={setFontFamily}>
                                  <SelectTrigger className="mt-1 h-8 text-sm">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Arial">Arial</SelectItem>
                                    <SelectItem value="Georgia">Georgia</SelectItem>
                                    <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                                    <SelectItem value="Courier New">Courier New</SelectItem>
                                    <SelectItem value="Verdana">Verdana</SelectItem>
                                    <SelectItem value="Impact">Impact</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label htmlFor="text-color" className="text-xs">
                                  Color
                                </Label>
                                <div className="flex gap-2 mt-1">
                                  <Input
                                    id="text-color"
                                    type="color"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    className="w-16 h-8"
                                  />
                                  <Input
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    placeholder="#ffffff"
                                    className="flex-1 h-8 text-sm"
                                  />
                                </div>
                              </div>
                            </TabsContent>

                            <TabsContent value="image" className="space-y-3 mt-3">
                              <div>
                                <input
                                  ref={watermarkInputRef}
                                  type="file"
                                  accept="image/*"
                                  onChange={handleWatermarkImageUpload}
                                  className="hidden"
                                />
                                <Button
                                  onClick={() => watermarkInputRef.current?.click()}
                                  variant="outline"
                                  className="w-full h-8"
                                  size="sm"
                                >
                                  <Upload className="h-3 w-3 mr-2" />
                                  {watermarkImage ? "Change" : "Upload"}
                                </Button>
                              </div>

                              {watermarkImage && (
                                <div>
                                  <Label htmlFor="watermark-size" className="text-xs">
                                    Size: {watermarkSize[0]}%
                                  </Label>
                                  <Slider
                                    id="watermark-size"
                                    min={10}
                                    max={200}
                                    step={5}
                                    value={watermarkSize}
                                    onValueChange={setWatermarkSize}
                                    className="mt-1"
                                  />
                                </div>
                              )}
                            </TabsContent>
                          </Tabs>
                        </CollapsibleContent>
                      </Collapsible>

                      {/* Position Section */}
                      <Collapsible open={openSections.position} onOpenChange={() => toggleSection("position")}>
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded-md transition-colors">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span className="font-medium text-sm">Position</span>
                          </div>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${openSections.position ? "rotate-180" : ""}`}
                          />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pt-3 pb-2 px-2">
                          <Select value={position} onValueChange={(v) => setPosition(v as Position)}>
                            <SelectTrigger className="h-8 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="top-left">Top Left</SelectItem>
                              <SelectItem value="top-right">Top Right</SelectItem>
                              <SelectItem value="bottom-left">Bottom Left</SelectItem>
                              <SelectItem value="bottom-right">Bottom Right</SelectItem>
                              <SelectItem value="center">Center</SelectItem>
                              <SelectItem value="tiled">Tiled</SelectItem>
                            </SelectContent>
                          </Select>
                        </CollapsibleContent>
                      </Collapsible>

                      {/* Appearance Section */}
                      <Collapsible open={openSections.appearance} onOpenChange={() => toggleSection("appearance")}>
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded-md transition-colors">
                          <div className="flex items-center gap-2">
                            <Palette className="h-4 w-4 text-primary" />
                            <span className="font-medium text-sm">Appearance</span>
                          </div>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${openSections.appearance ? "rotate-180" : ""}`}
                          />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pt-3 pb-2 px-2">
                          <div>
                            <Label htmlFor="opacity" className="text-xs">
                              Opacity: {opacity[0]}%
                            </Label>
                            <Slider
                              id="opacity"
                              min={10}
                              max={100}
                              step={5}
                              value={opacity}
                              onValueChange={setOpacity}
                              className="mt-1"
                            />
                          </div>
                        </CollapsibleContent>
                      </Collapsible>

                      {/* Rotation Section */}
                      <Collapsible open={openSections.rotation} onOpenChange={() => toggleSection("rotation")}>
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded-md transition-colors">
                          <div className="flex items-center gap-2">
                            <RotateCw className="h-4 w-4 text-primary" />
                            <span className="font-medium text-sm">Rotation</span>
                          </div>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${openSections.rotation ? "rotate-180" : ""}`}
                          />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pt-3 pb-2 px-2">
                          <div>
                            <Label htmlFor="rotation" className="text-xs">
                              Angle: {rotation[0]}°
                            </Label>
                            <Slider
                              id="rotation"
                              min={-180}
                              max={180}
                              step={5}
                              value={rotation}
                              onValueChange={setRotation}
                              className="mt-1"
                            />
                          </div>
                        </CollapsibleContent>
                      </Collapsible>

                      {/* Download Button */}
                      <Button onClick={handleDownload} className="w-full mt-2" size="sm" disabled={isProcessing}>
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Right Column - Preview */}
              <Card className="border-primary/20">
                <CardContent className="p-4">
                  <h3 className="text-sm font-semibold mb-2">Preview</h3>
                  {originalImage ? (
                    <div className="border rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900">
                      <canvas ref={canvasRef} className="w-full h-auto max-h-[500px] object-contain" />
                    </div>
                  ) : (
                    <div className="border-2 border-dashed rounded-lg p-8 text-center">
                      <ImageIcon className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Upload an image to preview</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Best Practices */}
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold mb-3">Watermark Best Practices</h3>
                <div className="grid md:grid-cols-2 gap-3 text-xs text-muted-foreground">
                  <div>
                    <h4 className="font-semibold text-foreground mb-1.5 text-sm">Text Watermarks:</h4>
                    <ul className="space-y-0.5">
                      <li>• Use copyright symbol (©) with your brand</li>
                      <li>• 30-50% opacity for subtle protection</li>
                      <li>• Place in corners to minimize distraction</li>
                      <li>• White text works on dark images</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1.5 text-sm">Image Watermarks:</h4>
                    <ul className="space-y-0.5">
                      <li>• Use PNG with transparent background</li>
                      <li>• Keep size reasonable (50-100%)</li>
                      <li>• Tiled pattern provides max protection</li>
                      <li>• Lower opacity to avoid overpowering</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar Ad */}
          <div className="hidden xl:block flex-shrink-0" style={{ width: "160px", maxWidth: "160px" }}>
            <div className="sticky top-24" style={{ maxHeight: "600px", overflow: "hidden" }}>
              <LazyAdSpace 
                type="display" 
                slot={getDisplayAdSlot(getAdIndex('sidebar-right'))}
                position="sidebar-right"
              />
            </div>
          </div>
        </div>

        {/* Bottom Ad Row */}
        <div className="mt-8">
          <AdRow type="display" count={3} position="bottom" />
        </div>
      </ToolLayout>

      <AdWatchModal
        open={showAdModal}
        onOpenChange={setShowAdModal}
        onAdWatched={() => {
          setCanDownload(true);
          setShowAdModal(false);
          downloadWatermarkedImage();
        }}
        title="Watch ad to download watermarked image"
        description="Please watch this short ad to download your watermarked image."
      />
    </>
  );
};

export default WatermarkTool;
