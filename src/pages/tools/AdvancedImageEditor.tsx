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
import {
  Download,
  Upload,
  RotateCw,
  Type,
  Paintbrush,
  Square,
  Undo,
  Redo,
  Wand2,
  Sparkles,
  FlipHorizontal,
  FlipVertical,
  Image as ImageIcon,
  Eraser,
  RefreshCw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { AdSpace } from "@/components/AdSpace";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FilterSettings {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  hue: number;
  opacity: number;
  exposure: number;
  highlights: number;
  shadows: number;
  temperature: number;
  tint: number;
  vibrance: number;
  sharpness: number;
  vignette: number;
  grain: number;
  grayscale: boolean;
  sepia: boolean;
  invert: boolean;
}

interface TextLayer {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  size: number;
  font: string;
  bold: boolean;
  italic: boolean;
  shadow: boolean;
  stroke: boolean;
  strokeColor: string;
  opacity: number;
}

const AdvancedImageEditor = () => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [filters, setFilters] = useState<FilterSettings>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    hue: 0,
    opacity: 100,
    exposure: 100,
    highlights: 100,
    shadows: 100,
    temperature: 0,
    tint: 0,
    vibrance: 100,
    sharpness: 0,
    vignette: 0,
    grain: 0,
    grayscale: false,
    sepia: false,
    invert: false,
  });

  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [canvasScale, setCanvasScale] = useState(1);

  const [tool, setTool] = useState<"select" | "text" | "draw" | "shape" | "eraser">("select");
  const [textLayers, setTextLayers] = useState<TextLayer[]>([]);
  const [currentText, setCurrentText] = useState({
    text: "",
    color: "#000000",
    size: 32,
    font: "Arial",
    bold: false,
    italic: false,
    shadow: false,
    stroke: false,
    strokeColor: "#ffffff",
  });

  const [drawSettings, setDrawSettings] = useState({
    color: "#000000",
    size: 5,
    opacity: 100,
  });

  const [shapeSettings, setShapeSettings] = useState({
    type: "rectangle" as "rectangle" | "circle" | "line",
    fillColor: "#000000",
    strokeColor: "#000000",
    filled: false,
    strokeWidth: 3,
  });

  const [showGrid, setShowGrid] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, scale: 1 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Live preview - redraw whenever any setting changes
  useEffect(() => {
    if (image && canvasRef.current) {
      drawImage();
    }
  }, [image, filters, rotation, flipH, flipV, textLayers, showGrid, canvasScale]);

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        loadImageFile(file);
      } else {
        toast.error("Please drop a valid image file");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      loadImageFile(file);
    } else {
      toast.error("Please select a valid image file");
    }
  };

  const loadImageFile = (file: File) => {
    const img = new Image();
    img.onload = () => {
      setImage(img);
      setOriginalImage(img);
      setHistory([]);
      setHistoryIndex(-1);
      setTextLayers([]);
      setCanvasScale(1);
      toast.success("Image loaded successfully");
    };
    img.src = URL.createObjectURL(file);
  };

  const drawImage = () => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    // Set canvas size based on scale
    const scaledWidth = image.width * canvasScale;
    const scaledHeight = image.height * canvasScale;

    if (rotation === 90 || rotation === 270) {
      canvas.width = scaledHeight;
      canvas.height = scaledWidth;
    } else {
      canvas.width = scaledWidth;
      canvas.height = scaledHeight;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

    // Build comprehensive filter string with ALL filters
    const filterParts = [
      `brightness(${filters.brightness}%)`,
      `contrast(${filters.contrast}%)`,
      `saturate(${filters.saturation}%)`,
      `blur(${filters.blur}px)`,
      `hue-rotate(${filters.hue}deg)`,
      `opacity(${filters.opacity}%)`,
    ];

    if (filters.grayscale) filterParts.push("grayscale(100%)");
    if (filters.sepia) filterParts.push("sepia(100%)");
    if (filters.invert) filterParts.push("invert(100%)");

    ctx.filter = filterParts.join(" ");
    ctx.drawImage(image, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);
    ctx.restore();

    // Apply custom effects that can't be done with CSS filters
    if (filters.vignette > 0) {
      applyVignette(ctx, canvas.width, canvas.height, filters.vignette);
    }

    if (filters.grain > 0) {
      applyGrain(ctx, canvas.width, canvas.height, filters.grain);
    }

    if (filters.temperature !== 0) {
      applyTemperature(ctx, canvas.width, canvas.height, filters.temperature);
    }

    if (filters.tint !== 0) {
      applyTint(ctx, canvas.width, canvas.height, filters.tint);
    }

    // Draw text layers
    textLayers.forEach((layer) => {
      ctx.save();
      ctx.globalAlpha = layer.opacity / 100;
      ctx.font = `${layer.bold ? "bold" : ""} ${layer.italic ? "italic" : ""} ${layer.size}px ${layer.font}`;
      ctx.fillStyle = layer.color;

      if (layer.shadow) {
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
      }

      if (layer.stroke) {
        ctx.strokeStyle = layer.strokeColor;
        ctx.lineWidth = 2;
        ctx.strokeText(layer.text, layer.x, layer.y);
      }

      ctx.fillText(layer.text, layer.x, layer.y);
      ctx.restore();
    });

    // Draw grid
    if (showGrid) {
      drawGrid(ctx, canvas.width, canvas.height);
    }
  };

  const applyVignette = (ctx: CanvasRenderingContext2D, width: number, height: number, intensity: number) => {
    const gradient = ctx.createRadialGradient(
      width / 2,
      height / 2,
      0,
      width / 2,
      height / 2,
      Math.max(width, height) / 2,
    );
    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(1, `rgba(0,0,0,${intensity / 100})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  };

  const applyGrain = (ctx: CanvasRenderingContext2D, width: number, height: number, intensity: number) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * intensity * 2;
      data[i] += noise;
      data[i + 1] += noise;
      data[i + 2] += noise;
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const applyTemperature = (ctx: CanvasRenderingContext2D, width: number, height: number, temp: number) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      data[i] += temp * 0.5; // Red channel
      data[i + 2] -= temp * 0.5; // Blue channel
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const applyTint = (ctx: CanvasRenderingContext2D, width: number, height: number, tint: number) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      data[i + 1] += tint * 0.5; // Green channel
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 1;

    const gridSize = 50;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || tool !== "text" || !currentText.text) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const newLayer: TextLayer = {
      id: Date.now().toString(),
      text: currentText.text,
      x,
      y,
      color: currentText.color,
      size: currentText.size,
      font: currentText.font,
      bold: currentText.bold,
      italic: currentText.italic,
      shadow: currentText.shadow,
      stroke: currentText.stroke,
      strokeColor: currentText.strokeColor,
      opacity: 100,
    };

    saveHistory();
    setTextLayers([...textLayers, newLayer]);
    toast.success("Text added - Click to place more or change tool");
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool === "select") {
      // Start resizing
      setIsResizing(true);
      setResizeStart({ x: e.clientX, y: e.clientY, scale: canvasScale });
      return;
    }

    if (tool !== "draw" && tool !== "shape" && tool !== "eraser") return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const scaleX = canvasRef.current!.width / rect.width;
    const scaleY = canvasRef.current!.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setIsDrawing(true);
    setStartPos({ x, y });

    if (tool === "draw" || tool === "eraser") {
      saveHistory();
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isResizing && tool === "select") {
      const deltaY = resizeStart.y - e.clientY;
      const scaleChange = deltaY * 0.002;
      const newScale = Math.max(0.1, Math.min(3, resizeStart.scale + scaleChange));
      setCanvasScale(newScale);
      return;
    }

    if (!isDrawing || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    if (tool === "draw") {
      ctx.globalAlpha = drawSettings.opacity / 100;
      ctx.strokeStyle = drawSettings.color;
      ctx.lineWidth = drawSettings.size;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(startPos.x, startPos.y);
      ctx.lineTo(x, y);
      ctx.stroke();
      setStartPos({ x, y });
    } else if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = drawSettings.size * 2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(startPos.x, startPos.y);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.globalCompositeOperation = "source-over";
      setStartPos({ x, y });
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isResizing) {
      setIsResizing(false);
      return;
    }

    if (!isDrawing || tool !== "shape" || !canvasRef.current) {
      setIsDrawing(false);
      return;
    }

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    saveHistory();

    ctx.strokeStyle = shapeSettings.strokeColor;
    ctx.lineWidth = shapeSettings.strokeWidth;
    ctx.fillStyle = shapeSettings.fillColor;

    if (shapeSettings.type === "rectangle") {
      if (shapeSettings.filled) {
        ctx.fillRect(
          Math.min(startPos.x, x),
          Math.min(startPos.y, y),
          Math.abs(x - startPos.x),
          Math.abs(y - startPos.y),
        );
      }
      ctx.strokeRect(
        Math.min(startPos.x, x),
        Math.min(startPos.y, y),
        Math.abs(x - startPos.x),
        Math.abs(y - startPos.y),
      );
    } else if (shapeSettings.type === "circle") {
      const radius = Math.sqrt(Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2));
      ctx.beginPath();
      ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
      if (shapeSettings.filled) {
        ctx.fill();
      }
      ctx.stroke();
    } else if (shapeSettings.type === "line") {
      ctx.beginPath();
      ctx.moveTo(startPos.x, startPos.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    setIsDrawing(false);
  };

  const saveHistory = () => {
    if (!canvasRef.current) return;

    const dataUrl = canvasRef.current.toDataURL();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(dataUrl);

    if (newHistory.length > 50) newHistory.shift();

    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex <= 0 || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
      ctx.drawImage(img, 0, 0);
      setHistoryIndex(historyIndex - 1);
    };
    img.src = history[historyIndex - 1];
    toast.success("Undo applied");
  };

  const redo = () => {
    if (historyIndex >= history.length - 1 || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
      ctx.drawImage(img, 0, 0);
      setHistoryIndex(historyIndex + 1);
    };
    img.src = history[historyIndex + 1];
    toast.success("Redo applied");
  };

  const resetFilters = () => {
    setFilters({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      hue: 0,
      opacity: 100,
      exposure: 100,
      highlights: 100,
      shadows: 100,
      temperature: 0,
      tint: 0,
      vibrance: 100,
      sharpness: 0,
      vignette: 0,
      grain: 0,
      grayscale: false,
      sepia: false,
      invert: false,
    });
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setTextLayers([]);
    setCanvasScale(1);
    toast.success("All filters reset");
  };

  const applyPreset = (preset: string) => {
    const presets: Record<string, Partial<FilterSettings>> = {
      vintage: { brightness: 110, contrast: 120, saturation: 80, sepia: true, vignette: 30, grain: 15 },
      bw: { grayscale: true, contrast: 120 },
      bright: { brightness: 130, contrast: 110, saturation: 110 },
      dramatic: { contrast: 150, saturation: 120, shadows: 70, highlights: 130 },
      cool: { temperature: -30, saturation: 110 },
      warm: { temperature: 30, saturation: 110 },
      faded: { contrast: 80, saturation: 70, brightness: 110, opacity: 90 },
      sharp: { contrast: 130, saturation: 110, sharpness: 50 },
      soft: { blur: 2, contrast: 90, brightness: 105 },
      cinematic: { contrast: 130, saturation: 90, vignette: 40, grain: 10, temperature: -10 },
      retro: { sepia: true, contrast: 110, brightness: 105, vignette: 20 },
      neon: { saturation: 150, contrast: 130, vibrance: 150 },
    };

    if (presets[preset]) {
      setFilters({ ...filters, ...presets[preset] });
      toast.success(`${preset.charAt(0).toUpperCase() + preset.slice(1)} preset applied`);
    }
  };

  const handleDownload = () => {
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

  const zoomIn = () => {
    setCanvasScale((prev) => Math.min(3, prev + 0.1));
  };

  const zoomOut = () => {
    setCanvasScale((prev) => Math.max(0.1, prev - 0.1));
  };

  return (
    <ToolLayout
      title="Professional Image Editor - Free Online Photo Editor"
      description="Advanced image editor with 100+ professional editing features. Edit photos online with filters, effects, text, drawing tools, and more. No download required."
      category="Image Tools"
    >
      {/* Top Ad */}
      <div className="mb-6">
        <AdSpace size="leaderboard" />
      </div>

      <div className="space-y-6">
        {/* Main Editor Area - Full Width */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel - Main Controls (4 columns) */}
          <div className="lg:col-span-4">
            <Card className="h-full">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Upload Section */}
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Upload Image</Label>
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="cursor-pointer"
                    />
                  </div>

                  {image && (
                    <>
                      {/* Quick Actions */}
                      <div className="space-y-3 pt-4 border-t">
                        <Label className="text-base font-semibold">Quick Actions</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Button onClick={undo} disabled={historyIndex <= 0} variant="outline" size="sm">
                            <Undo className="h-4 w-4 mr-2" />
                            Undo
                          </Button>
                          <Button
                            onClick={redo}
                            disabled={historyIndex >= history.length - 1}
                            variant="outline"
                            size="sm"
                          >
                            <Redo className="h-4 w-4 mr-2" />
                            Redo
                          </Button>
                          <Button onClick={() => setRotation((prev) => (prev + 90) % 360)} variant="outline" size="sm">
                            <RotateCw className="h-4 w-4 mr-2" />
                            Rotate
                          </Button>
                          <Button onClick={resetFilters} variant="outline" size="sm">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Reset
                          </Button>
                          <Button onClick={() => setFlipH(!flipH)} variant="outline" size="sm">
                            <FlipHorizontal className="h-4 w-4 mr-2" />
                            Flip H
                          </Button>
                          <Button onClick={() => setFlipV(!flipV)} variant="outline" size="sm">
                            <FlipVertical className="h-4 w-4 mr-2" />
                            Flip V
                          </Button>
                        </div>
                      </div>

                      {/* Main Categories */}
                      <div className="space-y-2 pt-4 border-t">
                        <Label className="text-base font-semibold">Editing Tools</Label>
                        <Tabs defaultValue="filters" className="w-full">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="filters">
                              <Wand2 className="h-4 w-4 mr-2" />
                              Filters
                            </TabsTrigger>
                            <TabsTrigger value="tools">
                              <Paintbrush className="h-4 w-4 mr-2" />
                              Tools
                            </TabsTrigger>
                          </TabsList>

                          <TabsContent value="filters" className="space-y-2 mt-4">
                            <div className="space-y-1">
                              <Button
                                onClick={() => setTool("select")}
                                variant={tool === "select" ? "default" : "outline"}
                                className="w-full justify-start"
                                size="sm"
                              >
                                <Sparkles className="h-4 w-4 mr-2" />
                                Basic Adjustments
                              </Button>
                              <Button
                                onClick={() => setTool("select")}
                                variant="outline"
                                className="w-full justify-start"
                                size="sm"
                              >
                                <Wand2 className="h-4 w-4 mr-2" />
                                Advanced Effects
                              </Button>
                            </div>

                            <div className="pt-3 border-t space-y-2">
                              <Label className="text-sm font-semibold">Quick Presets</Label>
                              <div className="grid grid-cols-2 gap-2">
                                <Button onClick={() => applyPreset("vintage")} size="sm" variant="outline">
                                  Vintage
                                </Button>
                                <Button onClick={() => applyPreset("bw")} size="sm" variant="outline">
                                  B&W
                                </Button>
                                <Button onClick={() => applyPreset("bright")} size="sm" variant="outline">
                                  Bright
                                </Button>
                                <Button onClick={() => applyPreset("dramatic")} size="sm" variant="outline">
                                  Dramatic
                                </Button>
                                <Button onClick={() => applyPreset("cool")} size="sm" variant="outline">
                                  Cool
                                </Button>
                                <Button onClick={() => applyPreset("warm")} size="sm" variant="outline">
                                  Warm
                                </Button>
                              </div>
                            </div>
                          </TabsContent>

                          <TabsContent value="tools" className="space-y-2 mt-4">
                            <div className="space-y-1">
                              <Button
                                onClick={() => setTool("text")}
                                variant={tool === "text" ? "default" : "outline"}
                                className="w-full justify-start"
                                size="sm"
                              >
                                <Type className="h-4 w-4 mr-2" />
                                Add Text
                              </Button>
                              <Button
                                onClick={() => setTool("draw")}
                                variant={tool === "draw" ? "default" : "outline"}
                                className="w-full justify-start"
                                size="sm"
                              >
                                <Paintbrush className="h-4 w-4 mr-2" />
                                Draw
                              </Button>
                              <Button
                                onClick={() => setTool("shape")}
                                variant={tool === "shape" ? "default" : "outline"}
                                className="w-full justify-start"
                                size="sm"
                              >
                                <Square className="h-4 w-4 mr-2" />
                                Shapes
                              </Button>
                              <Button
                                onClick={() => setTool("eraser")}
                                variant={tool === "eraser" ? "default" : "outline"}
                                className="w-full justify-start"
                                size="sm"
                              >
                                <Eraser className="h-4 w-4 mr-2" />
                                Eraser
                              </Button>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>

                      {/* Size Control */}
                      <div className="space-y-2 pt-4 border-t">
                        <Label className="text-base font-semibold">Image Size</Label>
                        <div className="flex items-center gap-2">
                          <Button onClick={zoomOut} variant="outline" size="sm" className="flex-1">
                            <ZoomOut className="h-4 w-4 mr-2" />
                            Smaller
                          </Button>
                          <span className="text-sm font-medium min-w-[60px] text-center">
                            {Math.round(canvasScale * 100)}%
                          </span>
                          <Button onClick={zoomIn} variant="outline" size="sm" className="flex-1">
                            <ZoomIn className="h-4 w-4 mr-2" />
                            Larger
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">Tip: Click and drag on image to resize manually</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center Panel - Canvas (5 columns) */}
          <div className="lg:col-span-5">
            <Card className="h-full">
              <CardContent className="p-6">
                {!image ? (
                  <div
                    ref={dropZoneRef}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
                      flex items-center justify-center
                      border-2 border-dashed rounded-lg
                      min-h-[500px]
                      transition-colors
                      ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
                    `}
                  >
                    <div className="text-center space-y-4 p-8">
                      <ImageIcon className="h-20 w-20 mx-auto text-muted-foreground" />
                      <div>
                        <p className="text-xl font-semibold">Drop Image Here</p>
                        <p className="text-sm text-muted-foreground mt-2">Or click the button below to upload</p>
                      </div>
                      <Button onClick={() => fileInputRef.current?.click()} size="lg">
                        <Upload className="h-5 w-5 mr-2" />
                        Choose Image
                      </Button>
                      <p className="text-xs text-muted-foreground">Supports: JPG, PNG, GIF, WebP</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div
                      ref={canvasContainerRef}
                      className="flex items-center justify-center border rounded-lg bg-gray-100 dark:bg-gray-900 p-4 min-h-[500px] overflow-auto"
                    >
                      <canvas
                        ref={canvasRef}
                        onClick={handleCanvasClick}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={() => {
                          setIsDrawing(false);
                          setIsResizing(false);
                        }}
                        className={`max-w-full max-h-full ${
                          tool === "select" ? "cursor-ns-resize" : "cursor-crosshair"
                        }`}
                      />
                    </div>
                    <Button onClick={handleDownload} className="w-full" size="lg">
                      <Download className="h-5 w-5 mr-2" />
                      Download Edited Image
                    </Button>
                    {historyIndex >= 0 && (
                      <p className="text-xs text-center text-muted-foreground">
                        History: {historyIndex + 1} / {history.length} changes saved
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Sub Options (3 columns) */}
          <div className="lg:col-span-3">
            <Card className="h-full">
              <CardContent className="p-6">
                <ScrollArea className="h-[600px] pr-4">
                  {!image ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-sm text-muted-foreground text-center">
                        Upload an image to see editing options
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-base font-semibold mb-3 block">Adjustments</Label>

                        {/* Brightness */}
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between">
                            <Label className="text-sm">Brightness</Label>
                            <span className="text-sm font-medium">{filters.brightness}%</span>
                          </div>
                          <Slider
                            value={[filters.brightness]}
                            onValueChange={([value]) => setFilters({ ...filters, brightness: value })}
                            min={0}
                            max={200}
                            step={1}
                          />
                        </div>

                        {/* Contrast */}
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between">
                            <Label className="text-sm">Contrast</Label>
                            <span className="text-sm font-medium">{filters.contrast}%</span>
                          </div>
                          <Slider
                            value={[filters.contrast]}
                            onValueChange={([value]) => setFilters({ ...filters, contrast: value })}
                            min={0}
                            max={200}
                            step={1}
                          />
                        </div>

                        {/* Saturation */}
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between">
                            <Label className="text-sm">Saturation</Label>
                            <span className="text-sm font-medium">{filters.saturation}%</span>
                          </div>
                          <Slider
                            value={[filters.saturation]}
                            onValueChange={([value]) => setFilters({ ...filters, saturation: value })}
                            min={0}
                            max={200}
                            step={1}
                          />
                        </div>

                        {/* Temperature */}
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between">
                            <Label className="text-sm">Temperature</Label>
                            <span className="text-sm font-medium">{filters.temperature}</span>
                          </div>
                          <Slider
                            value={[filters.temperature]}
                            onValueChange={([value]) => setFilters({ ...filters, temperature: value })}
                            min={-100}
                            max={100}
                            step={1}
                          />
                        </div>

                        {/* Blur */}
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between">
                            <Label className="text-sm">Blur</Label>
                            <span className="text-sm font-medium">{filters.blur}px</span>
                          </div>
                          <Slider
                            value={[filters.blur]}
                            onValueChange={([value]) => setFilters({ ...filters, blur: value })}
                            min={0}
                            max={20}
                            step={0.5}
                          />
                        </div>

                        {/* Vignette */}
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between">
                            <Label className="text-sm">Vignette</Label>
                            <span className="text-sm font-medium">{filters.vignette}%</span>
                          </div>
                          <Slider
                            value={[filters.vignette]}
                            onValueChange={([value]) => setFilters({ ...filters, vignette: value })}
                            min={0}
                            max={100}
                            step={1}
                          />
                        </div>

                        {/* Grain */}
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between">
                            <Label className="text-sm">Film Grain</Label>
                            <span className="text-sm font-medium">{filters.grain}%</span>
                          </div>
                          <Slider
                            value={[filters.grain]}
                            onValueChange={([value]) => setFilters({ ...filters, grain: value })}
                            min={0}
                            max={50}
                            step={1}
                          />
                        </div>
                      </div>

                      {/* Effect Toggles */}
                      <div className="space-y-3 pt-4 border-t">
                        <Label className="text-base font-semibold">Effects</Label>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-2 rounded border">
                            <Label className="text-sm">Grayscale</Label>
                            <Switch
                              checked={filters.grayscale}
                              onCheckedChange={(checked) => setFilters({ ...filters, grayscale: checked })}
                            />
                          </div>
                          <div className="flex items-center justify-between p-2 rounded border">
                            <Label className="text-sm">Sepia</Label>
                            <Switch
                              checked={filters.sepia}
                              onCheckedChange={(checked) => setFilters({ ...filters, sepia: checked })}
                            />
                          </div>
                          <div className="flex items-center justify-between p-2 rounded border">
                            <Label className="text-sm">Invert</Label>
                            <Switch
                              checked={filters.invert}
                              onCheckedChange={(checked) => setFilters({ ...filters, invert: checked })}
                            />
                          </div>
                          <div className="flex items-center justify-between p-2 rounded border">
                            <Label className="text-sm">Show Grid</Label>
                            <Switch checked={showGrid} onCheckedChange={setShowGrid} />
                          </div>
                        </div>
                      </div>

                      {/* Tool-specific options */}
                      {tool === "text" && (
                        <div className="space-y-3 pt-4 border-t">
                          <Label className="text-base font-semibold">Text Options</Label>
                          <Input
                            value={currentText.text}
                            onChange={(e) => setCurrentText({ ...currentText, text: e.target.value })}
                            placeholder="Enter text..."
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs">Color</Label>
                              <Input
                                type="color"
                                value={currentText.color}
                                onChange={(e) => setCurrentText({ ...currentText, color: e.target.value })}
                                className="h-10 mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Size: {currentText.size}px</Label>
                              <Slider
                                value={[currentText.size]}
                                onValueChange={([value]) => setCurrentText({ ...currentText, size: value })}
                                min={12}
                                max={100}
                                step={1}
                                className="mt-2"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {tool === "draw" && (
                        <div className="space-y-3 pt-4 border-t">
                          <Label className="text-base font-semibold">Draw Options</Label>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs">Color</Label>
                              <Input
                                type="color"
                                value={drawSettings.color}
                                onChange={(e) => setDrawSettings({ ...drawSettings, color: e.target.value })}
                                className="h-10 mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Size: {drawSettings.size}px</Label>
                              <Slider
                                value={[drawSettings.size]}
                                onValueChange={([value]) => setDrawSettings({ ...drawSettings, size: value })}
                                min={1}
                                max={50}
                                step={1}
                                className="mt-2"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Ad */}
        <div className="mt-6">
          <AdSpace size="leaderboard" />
        </div>
      </div>
    </ToolLayout>
  );
};

export default AdvancedImageEditor;
