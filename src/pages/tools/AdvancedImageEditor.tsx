import { useState, useRef, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Download, Upload, RotateCw, Crop, Type, Paintbrush, Square, Circle, Undo, Redo, Wand2, Maximize } from "lucide-react";
import { AdWatchModal } from "@/components/AdWatchModal";

interface FilterSettings {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  grayscale: boolean;
  sepia: boolean;
}

const AdvancedImageEditor = () => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [filters, setFilters] = useState<FilterSettings>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    grayscale: false,
    sepia: false,
  });
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [tool, setTool] = useState<"select" | "crop" | "text" | "draw" | "shape">("select");
  const [textInput, setTextInput] = useState("");
  const [textColor, setTextColor] = useState("#000000");
  const [textSize, setTextSize] = useState(32);
  const [drawColor, setDrawColor] = useState("#000000");
  const [shapeType, setShapeType] = useState<"rectangle" | "circle">("rectangle");
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [showAdModal, setShowAdModal] = useState(false);
  const [canDownload, setCanDownload] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (image && canvasRef.current) {
      drawImage();
    }
  }, [image, filters, rotation, flipH, flipV]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        setOriginalImage(img);
        setHistory([]);
        setHistoryIndex(-1);
        toast.success("Image loaded successfully");
      };
      img.src = URL.createObjectURL(file);
    } else {
      toast.error("Please select a valid image file");
    }
  };

  const drawImage = () => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size based on rotation
    if (rotation === 90 || rotation === 270) {
      canvas.width = image.height;
      canvas.height = image.width;
    } else {
      canvas.width = image.width;
      canvas.height = image.height;
    }

    ctx.save();

    // Apply transformations
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

    // Apply filters
    ctx.filter = `
      brightness(${filters.brightness}%)
      contrast(${filters.contrast}%)
      saturate(${filters.saturation}%)
      blur(${filters.blur}px)
      ${filters.grayscale ? "grayscale(100%)" : ""}
      ${filters.sepia ? "sepia(100%)" : ""}
    `.trim();

    ctx.drawImage(image, -image.width / 2, -image.height / 2);

    ctx.restore();
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleFlipH = () => {
    setFlipH((prev) => !prev);
  };

  const handleFlipV = () => {
    setFlipV((prev) => !prev);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || tool !== "text" || !textInput) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    saveHistory();
    ctx.fillStyle = textColor;
    ctx.font = `${textSize}px Arial`;
    ctx.fillText(textInput, x, y);
    setTextInput("");
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool !== "draw" && tool !== "shape") return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setStartPos({ x, y });
    saveHistory();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    if (tool === "draw") {
      ctx.strokeStyle = drawColor;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(startPos.x, startPos.y);
      ctx.lineTo(x, y);
      ctx.stroke();
      setStartPos({ x, y });
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || tool !== "shape" || !canvasRef.current) {
      setIsDrawing(false);
      return;
    }

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = drawColor;
    ctx.lineWidth = 3;

    if (shapeType === "rectangle") {
      ctx.strokeRect(
        Math.min(startPos.x, x),
        Math.min(startPos.y, y),
        Math.abs(x - startPos.x),
        Math.abs(y - startPos.y)
      );
    } else if (shapeType === "circle") {
      const radius = Math.sqrt(
        Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2)
      );
      ctx.beginPath();
      ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
      ctx.stroke();
    }

    setIsDrawing(false);
  };

  const saveHistory = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.getImageData(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(imageData);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex <= 0) return;

    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    setHistoryIndex(historyIndex - 1);
    ctx.putImageData(history[historyIndex - 1], 0, 0);
  };

  const redo = () => {
    if (historyIndex >= history.length - 1) return;

    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    setHistoryIndex(historyIndex + 1);
    ctx.putImageData(history[historyIndex + 1], 0, 0);
  };

  const resetFilters = () => {
    setFilters({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      grayscale: false,
      sepia: false,
    });
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    toast.success("Filters reset");
  };

  const handleDownload = () => {
    if (!canDownload) {
      setShowAdModal(true);
      return;
    }
    performDownload();
  };

  const performDownload = () => {
    if (!canvasRef.current) return;

    canvasRef.current.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `edited-image-${Date.now()}.png`;
        link.click();
        toast.success("Image downloaded successfully!");
      }
    });
  };

  const handleAdWatched = () => {
    setCanDownload(true);
    toast.success("Ad watched! You can now download your edited image.");
    performDownload();
  };

  const applyPreset = (preset: string) => {
    switch (preset) {
      case "vintage":
        setFilters({
          ...filters,
          brightness: 110,
          contrast: 120,
          saturation: 80,
          sepia: true,
        });
        break;
      case "bw":
        setFilters({ ...filters, grayscale: true });
        break;
      case "bright":
        setFilters({ ...filters, brightness: 130, contrast: 110 });
        break;
      case "dramatic":
        setFilters({ ...filters, contrast: 150, saturation: 120 });
        break;
    }
  };

  return (
    <ToolLayout
      title="Advanced Image Editor"
      description="Professional online image editor with filters, text, crop, rotate, and drawing tools. Free image editing software."
      category="Image Tools"
      instructions={[
        "Upload your image",
        "Use filters to adjust brightness, contrast, saturation",
        "Add text, draw, or shapes to your image",
        "Rotate and flip as needed",
        "Watch a short ad to download your edited image"
      ]}
      relatedTools={[
        { name: "Image Compressor", path: "/tools/image-compressor" },
        { name: "Image Cropper", path: "/tools/image-cropper" },
        { name: "Background Remover", path: "/tools/background-remover" }
      ]}
    >
      <div className="grid gap-6">
        <Card>
          <CardContent className="p-6 space-y-6">
            <div>
              <Label htmlFor="image-upload">Upload Image</Label>
              <Input
                ref={fileInputRef}
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-2"
              />
            </div>

            {image && (
              <Tabs defaultValue="filters" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="filters">
                    <Wand2 className="h-4 w-4 mr-2" />
                    Filters
                  </TabsTrigger>
                  <TabsTrigger value="transform">
                    <RotateCw className="h-4 w-4 mr-2" />
                    Transform
                  </TabsTrigger>
                  <TabsTrigger value="tools">
                    <Paintbrush className="h-4 w-4 mr-2" />
                    Tools
                  </TabsTrigger>
                  <TabsTrigger value="presets">
                    <Maximize className="h-4 w-4 mr-2" />
                    Presets
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="filters" className="space-y-4 mt-4">
                  <div>
                    <Label>Brightness: {filters.brightness}%</Label>
                    <Slider
                      value={[filters.brightness]}
                      onValueChange={([value]) =>
                        setFilters({ ...filters, brightness: value })
                      }
                      min={0}
                      max={200}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Contrast: {filters.contrast}%</Label>
                    <Slider
                      value={[filters.contrast]}
                      onValueChange={([value]) =>
                        setFilters({ ...filters, contrast: value })
                      }
                      min={0}
                      max={200}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Saturation: {filters.saturation}%</Label>
                    <Slider
                      value={[filters.saturation]}
                      onValueChange={([value]) =>
                        setFilters({ ...filters, saturation: value })
                      }
                      min={0}
                      max={200}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Blur: {filters.blur}px</Label>
                    <Slider
                      value={[filters.blur]}
                      onValueChange={([value]) =>
                        setFilters({ ...filters, blur: value })
                      }
                      min={0}
                      max={20}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button
                      onClick={() =>
                        setFilters({ ...filters, grayscale: !filters.grayscale })
                      }
                      variant={filters.grayscale ? "default" : "outline"}
                      size="sm"
                    >
                      Grayscale
                    </Button>
                    <Button
                      onClick={() =>
                        setFilters({ ...filters, sepia: !filters.sepia })
                      }
                      variant={filters.sepia ? "default" : "outline"}
                      size="sm"
                    >
                      Sepia
                    </Button>
                    <Button onClick={resetFilters} variant="outline" size="sm">
                      Reset All
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="transform" className="space-y-4 mt-4">
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={handleRotate} variant="outline">
                      <RotateCw className="h-4 w-4 mr-2" />
                      Rotate 90°
                    </Button>
                    <Button onClick={handleFlipH} variant="outline">
                      Flip Horizontal
                    </Button>
                    <Button onClick={handleFlipV} variant="outline">
                      Flip Vertical
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Current rotation: {rotation}° | Flip H: {flipH ? "Yes" : "No"} | Flip V: {flipV ? "Yes" : "No"}
                  </div>
                </TabsContent>

                <TabsContent value="tools" className="space-y-4 mt-4">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => setTool("text")}
                      variant={tool === "text" ? "default" : "outline"}
                      size="sm"
                    >
                      <Type className="h-4 w-4 mr-2" />
                      Text
                    </Button>
                    <Button
                      onClick={() => setTool("draw")}
                      variant={tool === "draw" ? "default" : "outline"}
                      size="sm"
                    >
                      <Paintbrush className="h-4 w-4 mr-2" />
                      Draw
                    </Button>
                    <Button
                      onClick={() => setTool("shape")}
                      variant={tool === "shape" ? "default" : "outline"}
                      size="sm"
                    >
                      <Square className="h-4 w-4 mr-2" />
                      Shape
                    </Button>
                    <Button onClick={undo} variant="outline" size="sm" disabled={historyIndex <= 0}>
                      <Undo className="h-4 w-4" />
                    </Button>
                    <Button onClick={redo} variant="outline" size="sm" disabled={historyIndex >= history.length - 1}>
                      <Redo className="h-4 w-4" />
                    </Button>
                  </div>

                  {tool === "text" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="Enter text..."
                      />
                      <Input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                      />
                      <div>
                        <Label>Size: {textSize}px</Label>
                        <Slider
                          value={[textSize]}
                          onValueChange={([value]) => setTextSize(value)}
                          min={12}
                          max={100}
                          step={1}
                        />
                      </div>
                    </div>
                  )}

                  {(tool === "draw" || tool === "shape") && (
                    <div className="flex gap-4 items-center">
                      <Label>Color:</Label>
                      <Input
                        type="color"
                        value={drawColor}
                        onChange={(e) => setDrawColor(e.target.value)}
                        className="w-20 h-10"
                      />
                      {tool === "shape" && (
                        <Select value={shapeType} onValueChange={(value: any) => setShapeType(value)}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="rectangle">
                              <Square className="h-4 w-4 inline mr-2" />
                              Rectangle
                            </SelectItem>
                            <SelectItem value="circle">
                              <Circle className="h-4 w-4 inline mr-2" />
                              Circle
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="presets" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Button onClick={() => applyPreset("vintage")} variant="outline">
                      Vintage
                    </Button>
                    <Button onClick={() => applyPreset("bw")} variant="outline">
                      Black & White
                    </Button>
                    <Button onClick={() => applyPreset("bright")} variant="outline">
                      Bright
                    </Button>
                    <Button onClick={() => applyPreset("dramatic")} variant="outline">
                      Dramatic
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>

        {image && (
          <Card className="border-primary/20">
            <CardContent className="p-6 space-y-4">
              <div className="border rounded-lg overflow-auto bg-gray-100 dark:bg-gray-900 max-h-[600px]">
                <canvas
                  ref={canvasRef}
                  onClick={handleCanvasClick}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={() => setIsDrawing(false)}
                  className="max-w-full mx-auto cursor-crosshair"
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleDownload} size="lg">
                  <Download className="h-4 w-4 mr-2" />
                  Download Edited Image
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Editor Features</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Filters:</strong> Adjust brightness, contrast, saturation, blur</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Transform:</strong> Rotate, flip horizontally/vertically</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Text Tool:</strong> Add custom text with colors and sizes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Drawing:</strong> Free-hand drawing tool</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Shapes:</strong> Add rectangles and circles</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Presets:</strong> Quick filter presets for common looks</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <AdWatchModal
        open={showAdModal}
        onOpenChange={setShowAdModal}
        onAdWatched={handleAdWatched}
        title="Watch Ad to Download"
        description="Please watch this short ad to download your edited image"
        adDuration={5}
      />
    </ToolLayout>
  );
};

export default AdvancedImageEditor;
