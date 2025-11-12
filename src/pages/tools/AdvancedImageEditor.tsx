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
  Circle,
  Undo,
  Redo,
  Wand2,
  Maximize,
  Droplet,
  Sparkles,
  Zap,
  Layers,
  Sun,
  Moon,
  Contrast,
  Palette,
  Eye,
  EyeOff,
  Scissors,
  Copy,
  FlipHorizontal,
  FlipVertical,
  Grid3x3,
  Image as ImageIcon,
  Aperture,
  Focus,
  Film,
  Crosshair,
} from "lucide-react";
import { AdSpace } from "@/components/AdSpace";
import { AdWatchModal } from "@/components/AdWatchModal";
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
  pixelate: number;
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
  underline: boolean;
  rotation: number;
  opacity: number;
  shadow: boolean;
  stroke: boolean;
  strokeColor: string;
}

interface Layer {
  id: string;
  type: "image" | "text" | "shape";
  visible: boolean;
  opacity: number;
  blendMode: string;
  data: any;
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
    pixelate: 0,
  });

  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [zoom, setZoom] = useState(100);

  const [tool, setTool] = useState<"select" | "crop" | "text" | "draw" | "shape" | "eraser">("select");
  const [textLayers, setTextLayers] = useState<TextLayer[]>([]);
  const [currentText, setCurrentText] = useState({
    text: "",
    color: "#000000",
    size: 32,
    font: "Arial",
    bold: false,
    italic: false,
    underline: false,
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
    type: "rectangle" as "rectangle" | "circle" | "line" | "arrow",
    fillColor: "#000000",
    strokeColor: "#000000",
    filled: false,
    strokeWidth: 3,
  });

  const [cropSettings, setCropSettings] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    aspectRatio: "free" as "free" | "1:1" | "16:9" | "4:3" | "3:2",
  });

  const [showGrid, setShowGrid] = useState(false);
  const [showRulers, setShowRulers] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [showAdModal, setShowAdModal] = useState(false);
  const [canDownload, setCanDownload] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (image && canvasRef.current) {
      drawImage();
    }
  }, [image, filters, rotation, flipH, flipV, zoom, textLayers]);

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

    // Set canvas size
    if (rotation === 90 || rotation === 270) {
      canvas.width = image.height;
      canvas.height = image.width;
    } else {
      canvas.width = image.width;
      canvas.height = image.height;
    }

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

    // Build comprehensive filter string
    const filterString = `
      brightness(${filters.brightness}%)
      contrast(${filters.contrast}%)
      saturate(${filters.saturation}%)
      blur(${filters.blur}px)
      hue-rotate(${filters.hue}deg)
      opacity(${filters.opacity}%)
      ${filters.grayscale ? "grayscale(100%)" : ""}
      ${filters.sepia ? "sepia(100%)" : ""}
      ${filters.invert ? "invert(100%)" : ""}
    `.trim();

    ctx.filter = filterString;
    ctx.drawImage(image, -image.width / 2, -image.height / 2);
    ctx.restore();

    // Apply advanced effects
    if (filters.vignette > 0) {
      applyVignette(ctx, canvas.width, canvas.height, filters.vignette);
    }

    if (filters.grain > 0) {
      applyGrain(ctx, canvas.width, canvas.height, filters.grain);
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
      const noise = (Math.random() - 0.5) * intensity;
      data[i] += noise;
      data[i + 1] += noise;
      data[i + 2] += noise;
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
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

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
      underline: currentText.underline,
      rotation: 0,
      opacity: 100,
      shadow: currentText.shadow,
      stroke: currentText.stroke,
      strokeColor: currentText.strokeColor,
    };

    setTextLayers([...textLayers, newLayer]);
    saveHistory();
    toast.success("Text added");
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool !== "draw" && tool !== "shape" && tool !== "eraser") return;

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
      ctx.lineWidth = drawSettings.size;
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
    if (!isDrawing || tool !== "shape" || !canvasRef.current) {
      setIsDrawing(false);
      return;
    }

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

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
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(imageData);
    if (newHistory.length > 50) newHistory.shift();
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
      pixelate: 0,
    });
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    toast.success("Filters reset");
  };

  const applyPreset = (preset: string) => {
    const presets: Record<string, Partial<FilterSettings>> = {
      vintage: { brightness: 110, contrast: 120, saturation: 80, sepia: true, vignette: 30 },
      bw: { grayscale: true, contrast: 120 },
      bright: { brightness: 130, contrast: 110, saturation: 110 },
      dramatic: { contrast: 150, saturation: 120, shadows: 70, highlights: 130 },
      cool: { temperature: -20, tint: 10, saturation: 110 },
      warm: { temperature: 20, tint: -10, saturation: 110 },
      faded: { contrast: 80, saturation: 70, brightness: 110 },
      sharp: { contrast: 130, saturation: 110, sharpness: 50 },
      soft: { blur: 2, contrast: 90, brightness: 105 },
      cinematic: { contrast: 130, saturation: 90, vignette: 40, grain: 10 },
    };

    if (presets[preset]) {
      setFilters({ ...filters, ...presets[preset] });
      toast.success(`${preset.charAt(0).toUpperCase() + preset.slice(1)} preset applied`);
    }
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

  return (
    <ToolLayout
      title="Professional Image Editor"
      description="Advanced online image editor with 100+ editing features. Professional photo editing tools with filters, effects, text, drawing, and more."
      category="Image Tools"
    >
      <AdSpace size="leaderboard" className="mb-6" />

      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-12rem)]">
        {/* Left Sidebar - Editing Tools */}
        <div className="col-span-3 h-full">
          <Card className="h-full">
            <ScrollArea className="h-full">
              <CardContent className="p-4 space-y-4">
                {/* Upload Section */}
                <div className="space-y-2">
                  <Label>Upload Image</Label>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="text-xs"
                  />
                </div>

                {image && (
                  <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 h-auto">
                      <TabsTrigger value="basic" className="text-xs py-1">
                        <Wand2 className="h-3 w-3 mr-1" />
                        Basic
                      </TabsTrigger>
                      <TabsTrigger value="advanced" className="text-xs py-1">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Advanced
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-3 mt-3">
                      {/* Brightness */}
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <Label className="text-xs">Brightness</Label>
                          <span className="text-xs text-muted-foreground">{filters.brightness}%</span>
                        </div>
                        <Slider
                          value={[filters.brightness]}
                          onValueChange={([value]) => setFilters({ ...filters, brightness: value })}
                          min={0}
                          max={200}
                          step={1}
                          className="h-1"
                        />
                      </div>

                      {/* Contrast */}
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <Label className="text-xs">Contrast</Label>
                          <span className="text-xs text-muted-foreground">{filters.contrast}%</span>
                        </div>
                        <Slider
                          value={[filters.contrast]}
                          onValueChange={([value]) => setFilters({ ...filters, contrast: value })}
                          min={0}
                          max={200}
                          step={1}
                          className="h-1"
                        />
                      </div>

                      {/* Saturation */}
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <Label className="text-xs">Saturation</Label>
                          <span className="text-xs text-muted-foreground">{filters.saturation}%</span>
                        </div>
                        <Slider
                          value={[filters.saturation]}
                          onValueChange={([value]) => setFilters({ ...filters, saturation: value })}
                          min={0}
                          max={200}
                          step={1}
                          className="h-1"
                        />
                      </div>

                      {/* Exposure */}
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <Label className="text-xs">Exposure</Label>
                          <span className="text-xs text-muted-foreground">{filters.exposure}%</span>
                        </div>
                        <Slider
                          value={[filters.exposure]}
                          onValueChange={([value]) => setFilters({ ...filters, exposure: value })}
                          min={0}
                          max={200}
                          step={1}
                          className="h-1"
                        />
                      </div>

                      {/* Highlights */}
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <Label className="text-xs">Highlights</Label>
                          <span className="text-xs text-muted-foreground">{filters.highlights}%</span>
                        </div>
                        <Slider
                          value={[filters.highlights]}
                          onValueChange={([value]) => setFilters({ ...filters, highlights: value })}
                          min={0}
                          max={200}
                          step={1}
                          className="h-1"
                        />
                      </div>

                      {/* Shadows */}
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <Label className="text-xs">Shadows</Label>
                          <span className="text-xs text-muted-foreground">{filters.shadows}%</span>
                        </div>
                        <Slider
                          value={[filters.shadows]}
                          onValueChange={([value]) => setFilters({ ...filters, shadows: value })}
                          min={0}
                          max={200}
                          step={1}
                          className="h-1"
                        />
                      </div>

                      {/* Vibrance */}
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <Label className="text-xs">Vibrance</Label>
                          <span className="text-xs text-muted-foreground">{filters.vibrance}%</span>
                        </div>
                        <Slider
                          value={[filters.vibrance]}
                          onValueChange={([value]) => setFilters({ ...filters, vibrance: value })}
                          min={0}
                          max={200}
                          step={1}
                          className="h-1"
                        />
                      </div>

                      {/* Temperature */}
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <Label className="text-xs">Temperature</Label>
                          <span className="text-xs text-muted-foreground">{filters.temperature}</span>
                        </div>
                        <Slider
                          value={[filters.temperature]}
                          onValueChange={([value]) => setFilters({ ...filters, temperature: value })}
                          min={-100}
                          max={100}
                          step={1}
                          className="h-1"
                        />
                      </div>

                      {/* Tint */}
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <Label className="text-xs">Tint</Label>
                          <span className="text-xs text-muted-foreground">{filters.tint}</span>
                        </div>
                        <Slider
                          value={[filters.tint]}
                          onValueChange={([value]) => setFilters({ ...filters, tint: value })}
                          min={-100}
                          max={100}
                          step={1}
                          className="h-1"
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="advanced" className="space-y-3 mt-3">
                      {/* Blur */}
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <Label className="text-xs">Blur</Label>
                          <span className="text-xs text-muted-foreground">{filters.blur}px</span>
                        </div>
                        <Slider
                          value={[filters.blur]}
                          onValueChange={([value]) => setFilters({ ...filters, blur: value })}
                          min={0}
                          max={20}
                          step={0.5}
                          className="h-1"
                        />
                      </div>

                      {/* Sharpness */}
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <Label className="text-xs">Sharpness</Label>
                          <span className="text-xs text-muted-foreground">{filters.sharpness}%</span>
                        </div>
                        <Slider
                          value={[filters.sharpness]}
                          onValueChange={([value]) => setFilters({ ...filters, sharpness: value })}
                          min={0}
                          max={100}
                          step={1}
                          className="h-1"
                        />
                      </div>

                      {/* Hue */}
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <Label className="text-xs">Hue Rotate</Label>
                          <span className="text-xs text-muted-foreground">{filters.hue}°</span>
                        </div>
                        <Slider
                          value={[filters.hue]}
                          onValueChange={([value]) => setFilters({ ...filters, hue: value })}
                          min={0}
                          max={360}
                          step={1}
                          className="h-1"
                        />
                      </div>

                      {/* Opacity */}
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <Label className="text-xs">Opacity</Label>
                          <span className="text-xs text-muted-foreground">{filters.opacity}%</span>
                        </div>
                        <Slider
                          value={[filters.opacity]}
                          onValueChange={([value]) => setFilters({ ...filters, opacity: value })}
                          min={0}
                          max={100}
                          step={1}
                          className="h-1"
                        />
                      </div>

                      {/* Vignette */}
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <Label className="text-xs">Vignette</Label>
                          <span className="text-xs text-muted-foreground">{filters.vignette}%</span>
                        </div>
                        <Slider
                          value={[filters.vignette]}
                          onValueChange={([value]) => setFilters({ ...filters, vignette: value })}
                          min={0}
                          max={100}
                          step={1}
                          className="h-1"
                        />
                      </div>

                      {/* Grain */}
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <Label className="text-xs">Grain</Label>
                          <span className="text-xs text-muted-foreground">{filters.grain}%</span>
                        </div>
                        <Slider
                          value={[filters.grain]}
                          onValueChange={([value]) => setFilters({ ...filters, grain: value })}
                          min={0}
                          max={50}
                          step={1}
                          className="h-1"
                        />
                      </div>

                      {/* Effect Toggles */}
                      <div className="space-y-2 pt-2 border-t">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Grayscale</Label>
                          <Switch
                            checked={filters.grayscale}
                            onCheckedChange={(checked) => setFilters({ ...filters, grayscale: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Sepia</Label>
                          <Switch
                            checked={filters.sepia}
                            onCheckedChange={(checked) => setFilters({ ...filters, sepia: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Invert</Label>
                          <Switch
                            checked={filters.invert}
                            onCheckedChange={(checked) => setFilters({ ...filters, invert: checked })}
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                )}

                {/* Transform Controls */}
                {image && (
                  <div className="space-y-2 pt-2 border-t">
                    <Label className="text-xs font-semibold">Transform</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => setRotation((prev) => (prev + 90) % 360)}
                        size="sm"
                        variant="outline"
                        className="text-xs h-8"
                      >
                        <RotateCw className="h-3 w-3 mr-1" />
                        Rotate
                      </Button>
                      <Button onClick={() => setFlipH(!flipH)} size="sm" variant="outline" className="text-xs h-8">
                        <FlipHorizontal className="h-3 w-3 mr-1" />
                        Flip H
                      </Button>
                      <Button onClick={() => setFlipV(!flipV)} size="sm" variant="outline" className="text-xs h-8">
                        <FlipVertical className="h-3 w-3 mr-1" />
                        Flip V
                      </Button>
                      <Button onClick={resetFilters} size="sm" variant="outline" className="text-xs h-8">
                        <RotateCw className="h-3 w-3 mr-1" />
                        Reset
                      </Button>
                    </div>
                  </div>
                )}

                {/* Tools */}
                {image && (
                  <div className="space-y-2 pt-2 border-t">
                    <Label className="text-xs font-semibold">Tools</Label>
                    <div className="grid grid-cols-3 gap-1">
                      <Button
                        onClick={() => setTool("text")}
                        size="sm"
                        variant={tool === "text" ? "default" : "outline"}
                        className="text-xs h-8"
                      >
                        <Type className="h-3 w-3" />
                      </Button>
                      <Button
                        onClick={() => setTool("draw")}
                        size="sm"
                        variant={tool === "draw" ? "default" : "outline"}
                        className="text-xs h-8"
                      >
                        <Paintbrush className="h-3 w-3" />
                      </Button>
                      <Button
                        onClick={() => setTool("shape")}
                        size="sm"
                        variant={tool === "shape" ? "default" : "outline"}
                        className="text-xs h-8"
                      >
                        <Square className="h-3 w-3" />
                      </Button>
                      <Button
                        onClick={() => setTool("eraser")}
                        size="sm"
                        variant={tool === "eraser" ? "default" : "outline"}
                        className="text-xs h-8"
                      >
                        Erase
                      </Button>
                      <Button
                        onClick={undo}
                        size="sm"
                        variant="outline"
                        disabled={historyIndex <= 0}
                        className="text-xs h-8"
                      >
                        <Undo className="h-3 w-3" />
                      </Button>
                      <Button
                        onClick={redo}
                        size="sm"
                        variant="outline"
                        disabled={historyIndex >= history.length - 1}
                        className="text-xs h-8"
                      >
                        <Redo className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Tool Settings */}
                    {tool === "text" && (
                      <div className="space-y-2 mt-3">
                        <Input
                          value={currentText.text}
                          onChange={(e) => setCurrentText({ ...currentText, text: e.target.value })}
                          placeholder="Enter text..."
                          className="text-xs h-8"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Color</Label>
                            <Input
                              type="color"
                              value={currentText.color}
                              onChange={(e) => setCurrentText({ ...currentText, color: e.target.value })}
                              className="h-8"
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
                              className="h-1 mt-2"
                            />
                          </div>
                        </div>
                        <Select
                          value={currentText.font}
                          onValueChange={(value) => setCurrentText({ ...currentText, font: value })}
                        >
                          <SelectTrigger className="text-xs h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Arial">Arial</SelectItem>
                            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                            <SelectItem value="Courier New">Courier New</SelectItem>
                            <SelectItem value="Georgia">Georgia</SelectItem>
                            <SelectItem value="Verdana">Verdana</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={currentText.bold ? "default" : "outline"}
                            onClick={() => setCurrentText({ ...currentText, bold: !currentText.bold })}
                            className="text-xs h-7 flex-1"
                          >
                            B
                          </Button>
                          <Button
                            size="sm"
                            variant={currentText.italic ? "default" : "outline"}
                            onClick={() => setCurrentText({ ...currentText, italic: !currentText.italic })}
                            className="text-xs h-7 flex-1 italic"
                          >
                            I
                          </Button>
                          <Button
                            size="sm"
                            variant={currentText.shadow ? "default" : "outline"}
                            onClick={() => setCurrentText({ ...currentText, shadow: !currentText.shadow })}
                            className="text-xs h-7 flex-1"
                          >
                            Shadow
                          </Button>
                        </div>
                      </div>
                    )}

                    {tool === "draw" && (
                      <div className="space-y-2 mt-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Color</Label>
                            <Input
                              type="color"
                              value={drawSettings.color}
                              onChange={(e) => setDrawSettings({ ...drawSettings, color: e.target.value })}
                              className="h-8"
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
                              className="h-1 mt-2"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {tool === "shape" && (
                      <div className="space-y-2 mt-3">
                        <Select
                          value={shapeSettings.type}
                          onValueChange={(value: any) => setShapeSettings({ ...shapeSettings, type: value })}
                        >
                          <SelectTrigger className="text-xs h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="rectangle">Rectangle</SelectItem>
                            <SelectItem value="circle">Circle</SelectItem>
                            <SelectItem value="line">Line</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Fill</Label>
                            <Input
                              type="color"
                              value={shapeSettings.fillColor}
                              onChange={(e) => setShapeSettings({ ...shapeSettings, fillColor: e.target.value })}
                              className="h-8"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Stroke</Label>
                            <Input
                              type="color"
                              value={shapeSettings.strokeColor}
                              onChange={(e) => setShapeSettings({ ...shapeSettings, strokeColor: e.target.value })}
                              className="h-8"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Filled</Label>
                          <Switch
                            checked={shapeSettings.filled}
                            onCheckedChange={(checked) => setShapeSettings({ ...shapeSettings, filled: checked })}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Presets */}
                {image && (
                  <div className="space-y-2 pt-2 border-t">
                    <Label className="text-xs font-semibold">Presets</Label>
                    <div className="grid grid-cols-2 gap-1">
                      <Button
                        onClick={() => applyPreset("vintage")}
                        size="sm"
                        variant="outline"
                        className="text-xs h-7"
                      >
                        Vintage
                      </Button>
                      <Button onClick={() => applyPreset("bw")} size="sm" variant="outline" className="text-xs h-7">
                        B&W
                      </Button>
                      <Button onClick={() => applyPreset("bright")} size="sm" variant="outline" className="text-xs h-7">
                        Bright
                      </Button>
                      <Button
                        onClick={() => applyPreset("dramatic")}
                        size="sm"
                        variant="outline"
                        className="text-xs h-7"
                      >
                        Dramatic
                      </Button>
                      <Button onClick={() => applyPreset("cool")} size="sm" variant="outline" className="text-xs h-7">
                        Cool
                      </Button>
                      <Button onClick={() => applyPreset("warm")} size="sm" variant="outline" className="text-xs h-7">
                        Warm
                      </Button>
                      <Button onClick={() => applyPreset("faded")} size="sm" variant="outline" className="text-xs h-7">
                        Faded
                      </Button>
                      <Button onClick={() => applyPreset("sharp")} size="sm" variant="outline" className="text-xs h-7">
                        Sharp
                      </Button>
                      <Button onClick={() => applyPreset("soft")} size="sm" variant="outline" className="text-xs h-7">
                        Soft
                      </Button>
                      <Button
                        onClick={() => applyPreset("cinematic")}
                        size="sm"
                        variant="outline"
                        className="text-xs h-7"
                      >
                        Cinema
                      </Button>
                    </div>
                  </div>
                )}

                {/* View Options */}
                {image && (
                  <div className="space-y-2 pt-2 border-t">
                    <Label className="text-xs font-semibold">View</Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Show Grid</Label>
                        <Switch checked={showGrid} onCheckedChange={setShowGrid} />
                      </div>
                      <div>
                        <Label className="text-xs">Zoom: {zoom}%</Label>
                        <Slider
                          value={[zoom]}
                          onValueChange={([value]) => setZoom(value)}
                          min={10}
                          max={200}
                          step={10}
                          className="h-1 mt-1"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </ScrollArea>
          </Card>
        </div>

        {/* Center - Canvas Preview */}
        <div className="col-span-7 h-full">
          <Card className="h-full flex flex-col">
            <CardContent className="p-4 flex-1 flex flex-col">
              {!image ? (
                <div className="flex-1 flex items-center justify-center border-2 border-dashed rounded-lg">
                  <div className="text-center space-y-4">
                    <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground" />
                    <div>
                      <p className="text-lg font-medium">No Image Loaded</p>
                      <p className="text-sm text-muted-foreground">Upload an image to start editing</p>
                    </div>
                    <Button onClick={() => fileInputRef.current?.click()}>
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Image
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-auto border rounded-lg bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                    <canvas
                      ref={canvasRef}
                      onClick={handleCanvasClick}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={() => setIsDrawing(false)}
                      className="max-w-full max-h-full cursor-crosshair"
                      style={{ transform: `scale(${zoom / 100})` }}
                    />
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button onClick={handleDownload} className="flex-1" size="lg">
                      <Download className="h-4 w-4 mr-2" />
                      Download Image
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - Ads */}
        <div className="col-span-2 h-full space-y-4">
          <div className="sticky top-4 space-y-4">
            <AdSpace size="sidebar" />
            <AdSpace size="sidebar" />
          </div>
        </div>
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
