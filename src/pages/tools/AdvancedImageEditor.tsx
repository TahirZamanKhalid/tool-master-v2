import { useState, useRef, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
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
  FlipHorizontal,
  FlipVertical,
  Image as ImageIcon,
  Eraser,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { AdSpace } from "@/components/AdSpace";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });

  const [tool, setTool] = useState<"select" | "text" | "draw" | "shape" | "eraser">("select");
  const [textLayers, setTextLayers] = useState<TextLayer[]>([]);
  const [currentText, setCurrentText] = useState({
    text: "",
    color: "#000000",
    size: 24,
    font: "Arial",
    bold: false,
    italic: false,
    shadow: false,
    stroke: false,
    strokeColor: "#ffffff",
  });

  const [drawSettings, setDrawSettings] = useState({
    color: "#000000",
    size: 3,
    opacity: 100,
  });

  const [shapeSettings, setShapeSettings] = useState({
    type: "rectangle" as "rectangle" | "circle" | "line",
    fillColor: "#000000",
    strokeColor: "#000000",
    filled: false,
    strokeWidth: 2,
  });

  const [showGrid, setShowGrid] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [activePreset, setActivePreset] = useState<string | null>(null);

  // Collapsible states
  const [openSections, setOpenSections] = useState({
    basicAdjustments: true,
    advancedEffects: false,
    presets: false,
    tools: false,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcuts and mouse wheel zoom
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        redo();
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey && image) {
        e.preventDefault();
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        setCanvasScale((prev) => {
          const newScale = prev * zoomFactor;
          return Math.max(0.1, Math.min(5, newScale));
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("wheel", handleWheel);
    };
  }, [image]);

  // Live preview - redraw whenever any setting changes
  useEffect(() => {
    if (image && canvasRef.current) {
      drawImage();
    }
  }, [image, filters, rotation, flipH, flipV, textLayers, showGrid, canvasScale, imagePosition]);

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
      setImagePosition({ x: 0, y: 0 });
      toast.success("Image loaded successfully");
    };
    img.src = URL.createObjectURL(file);
  };

  const drawImage = () => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();

    // Apply image position offset
    ctx.translate(canvas.width / 2 + imagePosition.x, canvas.height / 2 + imagePosition.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

    // Calculate scaled dimensions
    const scaledWidth = image.width * canvasScale;
    const scaledHeight = image.height * canvasScale;

    // Build comprehensive filter string
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

    // Draw image based on rotation
    if (rotation === 90 || rotation === 270) {
      ctx.drawImage(image, -scaledHeight / 2, -scaledWidth / 2, scaledHeight, scaledWidth);
    } else {
      ctx.drawImage(image, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);
    }

    ctx.restore();

    // Apply custom effects
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

    if (filters.sharpness > 0) {
      applySharpness(ctx, canvas.width, canvas.height, filters.sharpness);
    }

    if (filters.exposure !== 100) {
      applyExposure(ctx, canvas.width, canvas.height, filters.exposure);
    }

    if (filters.vibrance !== 100) {
      applyVibrance(ctx, canvas.width, canvas.height, filters.vibrance);
    }

    // Draw text layers
    textLayers.forEach((layer) => {
      ctx.save();
      ctx.globalAlpha = layer.opacity / 100;
      ctx.font = `${layer.bold ? "bold" : ""} ${layer.italic ? "italic" : ""} ${layer.size}px ${layer.font}`;
      ctx.fillStyle = layer.color;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";

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
    ctx.globalCompositeOperation = "multiply";
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = "source-over";
  };

  const applyGrain = (ctx: CanvasRenderingContext2D, width: number, height: number, intensity: number) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * intensity;
      data[i] = Math.max(0, Math.min(255, data[i] + noise));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const applyTemperature = (ctx: CanvasRenderingContext2D, width: number, height: number, temp: number) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.max(0, Math.min(255, data[i] + temp * 0.5));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] - temp * 0.5));
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const applyTint = (ctx: CanvasRenderingContext2D, width: number, height: number, tint: number) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + tint * 0.5));
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const applySharpness = (ctx: CanvasRenderingContext2D, width: number, height: number, sharpness: number) => {
    // Simple sharpening using convolution
    const imageData = ctx.getImageData(0, 0, width, height);
    const tempData = new Uint8ClampedArray(imageData.data);

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) {
          const idx = (y * width + x) * 4 + c;
          const sharpValue =
            tempData[idx] * (1 + sharpness / 100) -
            (tempData[idx - 4] + tempData[idx + 4] + tempData[idx - width * 4] + tempData[idx + width * 4]) *
              (sharpness / 400);
          imageData.data[idx] = Math.max(0, Math.min(255, sharpValue));
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const applyExposure = (ctx: CanvasRenderingContext2D, width: number, height: number, exposure: number) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const factor = exposure / 100;

    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.max(0, Math.min(255, data[i] * factor));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] * factor));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] * factor));
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const applyVibrance = (ctx: CanvasRenderingContext2D, width: number, height: number, vibrance: number) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const factor = vibrance / 100;

    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = Math.max(0, Math.min(255, avg + (data[i] - avg) * factor));
      data[i + 1] = Math.max(0, Math.min(255, avg + (data[i + 1] - avg) * factor));
      data[i + 2] = Math.max(0, Math.min(255, avg + (data[i + 2] - avg) * factor));
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
    setCurrentText({ ...currentText, text: "" });
    toast.success("Text added");
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool === "select") {
      setIsDraggingImage(true);
      setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y });
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
    if (isDraggingImage && tool === "select") {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
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

  const handleMouseUp = () => {
    if (isDraggingImage) {
      setIsDraggingImage(false);
      return;
    }

    if (!isDrawing || tool !== "shape") {
      setIsDrawing(false);
      return;
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
      toast.success("Undo applied");
    };
    img.src = history[historyIndex - 1];
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
      toast.success("Redo applied");
    };
    img.src = history[historyIndex + 1];
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
    setImagePosition({ x: 0, y: 0 });
    setActivePreset(null);
    toast.success("All filters reset");
  };

  const applyPreset = (preset: string) => {
    if (activePreset === preset) {
      resetFilters();
      return;
    }

    const presets: Record<string, Partial<FilterSettings>> = {
      none: {},
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

    if (preset === "none") {
      resetFilters();
    } else if (presets[preset]) {
      const defaultFilters = {
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
      };
      setFilters({ ...defaultFilters, ...presets[preset] });
      setActivePreset(preset);
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

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const zoomIn = () => {
    setCanvasScale((prev) => Math.min(5, prev * 1.2));
  };

  const zoomOut = () => {
    setCanvasScale((prev) => Math.max(0.1, prev / 1.2));
  };

  return (
    <ToolLayout
      title="Professional Image Editor - Free Online Photo Editor"
      description="Advanced image editor with 100+ professional editing features. Edit photos online with filters, effects, text, drawing tools, and more. No download required."
      category="Image Tools"
    >
      {/* Top Ad */}
      <div className="mb-4">
        <AdSpace size="leaderboard" />
      </div>

      <div className="space-y-6">
        {/* Main Editor Area - Compact Design */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[500px] mb-8">
          {/* Left Panel - Tools (3 columns) */}
          <div className="lg:col-span-3 h-full overflow-hidden">
            <Card className="h-full flex flex-col">
              <CardContent className="p-3 flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="space-y-3 pr-3 pb-3">
                    {/* Upload Section */}
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold">UPLOAD IMAGE</Label>
                      <Input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="cursor-pointer text-xs h-8"
                      />
                    </div>

                    {image && (
                      <>
                        {/* Quick Actions */}
                        <div className="space-y-2 pt-2 border-t">
                          <Label className="text-xs font-semibold">QUICK ACTIONS</Label>
                          <div className="grid grid-cols-3 gap-1">
                            <Button
                              onClick={undo}
                              disabled={historyIndex <= 0}
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                            >
                              <Undo className="h-3 w-3" />
                            </Button>
                            <Button
                              onClick={redo}
                              disabled={historyIndex >= history.length - 1}
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                            >
                              <Redo className="h-3 w-3" />
                            </Button>
                            <Button
                              onClick={() => setRotation((prev) => (prev + 90) % 360)}
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                            >
                              <RotateCw className="h-3 w-3" />
                            </Button>
                            <Button onClick={resetFilters} variant="outline" size="sm" className="h-7 text-xs">
                              <RefreshCw className="h-3 w-3" />
                            </Button>
                            <Button
                              onClick={() => setFlipH(!flipH)}
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                            >
                              <FlipHorizontal className="h-3 w-3" />
                            </Button>
                            <Button
                              onClick={() => setFlipV(!flipV)}
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                            >
                              <FlipVertical className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Basic Adjustments - Collapsible */}
                        <Collapsible
                          open={openSections.basicAdjustments}
                          onOpenChange={() => toggleSection("basicAdjustments")}
                          className="border rounded-md"
                        >
                          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-accent rounded-md">
                            <Label className="text-xs font-semibold cursor-pointer">BASIC ADJUSTMENTS</Label>
                            {openSections.basicAdjustments ? (
                              <ChevronUp className="h-3 w-3" />
                            ) : (
                              <ChevronDown className="h-3 w-3" />
                            )}
                          </CollapsibleTrigger>
                          <CollapsibleContent className="p-2 pt-0 space-y-2">
                            {[
                              { label: "Brightness", value: filters.brightness, min: 0, max: 200, unit: "%" },
                              { label: "Contrast", value: filters.contrast, min: 0, max: 200, unit: "%" },
                              { label: "Saturation", value: filters.saturation, min: 0, max: 200, unit: "%" },
                              { label: "Exposure", value: filters.exposure, min: 0, max: 200, unit: "%" },
                              { label: "Temperature", value: filters.temperature, min: -100, max: 100, unit: "" },
                              { label: "Vibrance", value: filters.vibrance, min: 0, max: 200, unit: "%" },
                            ].map((setting) => (
                              <div key={setting.label} className="space-y-1">
                                <div className="flex justify-between">
                                  <Label className="text-xs">{setting.label}</Label>
                                  <span className="text-xs font-medium">
                                    {setting.value}
                                    {setting.unit}
                                  </span>
                                </div>
                                <Slider
                                  value={[setting.value]}
                                  onValueChange={([value]) =>
                                    setFilters({ ...filters, [setting.label.toLowerCase()]: value })
                                  }
                                  min={setting.min}
                                  max={setting.max}
                                  step={1}
                                  className="my-1"
                                />
                              </div>
                            ))}
                          </CollapsibleContent>
                        </Collapsible>

                        {/* Advanced Effects - Collapsible */}
                        <Collapsible
                          open={openSections.advancedEffects}
                          onOpenChange={() => toggleSection("advancedEffects")}
                          className="border rounded-md"
                        >
                          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-accent rounded-md">
                            <Label className="text-xs font-semibold cursor-pointer">ADVANCED EFFECTS</Label>
                            {openSections.advancedEffects ? (
                              <ChevronUp className="h-3 w-3" />
                            ) : (
                              <ChevronDown className="h-3 w-3" />
                            )}
                          </CollapsibleTrigger>
                          <CollapsibleContent className="p-2 pt-0 space-y-2">
                            {[
                              { label: "Blur", value: filters.blur, min: 0, max: 20, unit: "px", step: 0.5 },
                              { label: "Sharpness", value: filters.sharpness, min: 0, max: 100, unit: "%" },
                              { label: "Vignette", value: filters.vignette, min: 0, max: 100, unit: "%" },
                              { label: "Grain", value: filters.grain, min: 0, max: 50, unit: "%" },
                              { label: "Hue", value: filters.hue, min: -180, max: 180, unit: "°" },
                            ].map((setting) => (
                              <div key={setting.label} className="space-y-1">
                                <div className="flex justify-between">
                                  <Label className="text-xs">{setting.label}</Label>
                                  <span className="text-xs font-medium">
                                    {setting.value}
                                    {setting.unit}
                                  </span>
                                </div>
                                <Slider
                                  value={[setting.value]}
                                  onValueChange={([value]) =>
                                    setFilters({ ...filters, [setting.label.toLowerCase()]: value })
                                  }
                                  min={setting.min}
                                  max={setting.max}
                                  step={setting.step || 1}
                                  className="my-1"
                                />
                              </div>
                            ))}

                            {/* Effect Toggles */}
                            <div className="space-y-1 pt-1">
                              {[
                                { label: "Grayscale", checked: filters.grayscale, key: "grayscale" },
                                { label: "Sepia", checked: filters.sepia, key: "sepia" },
                                { label: "Invert", checked: filters.invert, key: "invert" },
                              ].map((toggle) => (
                                <div key={toggle.key} className="flex items-center justify-between p-1 rounded border">
                                  <Label className="text-xs">{toggle.label}</Label>
                                  <Switch
                                    checked={toggle.checked}
                                    onCheckedChange={(checked) => setFilters({ ...filters, [toggle.key]: checked })}
                                    className="scale-75"
                                  />
                                </div>
                              ))}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>

                        {/* Presets - Collapsible */}
                        <Collapsible
                          open={openSections.presets}
                          onOpenChange={() => toggleSection("presets")}
                          className="border rounded-md"
                        >
                          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-accent rounded-md">
                            <Label className="text-xs font-semibold cursor-pointer">QUICK PRESETS</Label>
                            {openSections.presets ? (
                              <ChevronUp className="h-3 w-3" />
                            ) : (
                              <ChevronDown className="h-3 w-3" />
                            )}
                          </CollapsibleTrigger>
                          <CollapsibleContent className="p-2 pt-0">
                            <div className="grid grid-cols-2 gap-1">
                              {["none", "vintage", "bw", "bright", "dramatic", "cool", "warm", "cinematic"].map(
                                (preset) => (
                                  <Button
                                    key={preset}
                                    onClick={() => applyPreset(preset)}
                                    size="sm"
                                    variant={activePreset === preset ? "default" : "outline"}
                                    className="h-6 text-xs"
                                  >
                                    {preset === "bw" ? "B&W" : preset.charAt(0).toUpperCase() + preset.slice(1)}
                                  </Button>
                                ),
                              )}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>

                        {/* Tools - Collapsible */}
                        <Collapsible
                          open={openSections.tools}
                          onOpenChange={() => toggleSection("tools")}
                          className="border rounded-md"
                        >
                          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-accent rounded-md">
                            <Label className="text-xs font-semibold cursor-pointer">DRAWING TOOLS</Label>
                            {openSections.tools ? (
                              <ChevronUp className="h-3 w-3" />
                            ) : (
                              <ChevronDown className="h-3 w-3" />
                            )}
                          </CollapsibleTrigger>
                          <CollapsibleContent className="p-2 pt-0 space-y-2">
                            <div className="grid grid-cols-2 gap-1">
                              <Button
                                onClick={() => setTool("select")}
                                variant={tool === "select" ? "default" : "outline"}
                                className="h-7 text-xs"
                              >
                                Select
                              </Button>
                              <Button
                                onClick={() => setTool("text")}
                                variant={tool === "text" ? "default" : "outline"}
                                className="h-7 text-xs"
                              >
                                <Type className="h-3 w-3 mr-1" />
                                Text
                              </Button>
                              <Button
                                onClick={() => setTool("draw")}
                                variant={tool === "draw" ? "default" : "outline"}
                                className="h-7 text-xs"
                              >
                                <Paintbrush className="h-3 w-3 mr-1" />
                                Draw
                              </Button>
                              <Button
                                onClick={() => setTool("shape")}
                                variant={tool === "shape" ? "default" : "outline"}
                                className="h-7 text-xs"
                              >
                                <Square className="h-3 w-3 mr-1" />
                                Shapes
                              </Button>
                              <Button
                                onClick={() => setTool("eraser")}
                                variant={tool === "eraser" ? "default" : "outline"}
                                className="h-7 text-xs"
                              >
                                <Eraser className="h-3 w-3 mr-1" />
                                Eraser
                              </Button>
                            </div>

                            {/* Tool-specific options */}
                            {tool === "text" && (
                              <div className="space-y-2 pt-2 border-t">
                                <Input
                                  value={currentText.text}
                                  onChange={(e) => setCurrentText({ ...currentText, text: e.target.value })}
                                  placeholder="Enter text..."
                                  className="text-xs h-7"
                                />
                                <div className="grid grid-cols-2 gap-1">
                                  <div>
                                    <Label className="text-xs">Color</Label>
                                    <Input
                                      type="color"
                                      value={currentText.color}
                                      onChange={(e) => setCurrentText({ ...currentText, color: e.target.value })}
                                      className="h-6 mt-1"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Size: {currentText.size}px</Label>
                                    <Slider
                                      value={[currentText.size]}
                                      onValueChange={([value]) => setCurrentText({ ...currentText, size: value })}
                                      min={12}
                                      max={72}
                                      step={1}
                                      className="mt-1"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {tool === "draw" && (
                              <div className="space-y-2 pt-2 border-t">
                                <div className="grid grid-cols-2 gap-1">
                                  <div>
                                    <Label className="text-xs">Color</Label>
                                    <Input
                                      type="color"
                                      value={drawSettings.color}
                                      onChange={(e) => setDrawSettings({ ...drawSettings, color: e.target.value })}
                                      className="h-6 mt-1"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Size: {drawSettings.size}px</Label>
                                    <Slider
                                      value={[drawSettings.size]}
                                      onValueChange={([value]) => setDrawSettings({ ...drawSettings, size: value })}
                                      min={1}
                                      max={20}
                                      step={1}
                                      className="mt-1"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </CollapsibleContent>
                        </Collapsible>

                        {/* View Options */}
                        <div className="space-y-1 pt-2 border-t">
                          <div className="flex items-center justify-between p-1 rounded border">
                            <Label className="text-xs">Show Grid</Label>
                            <Switch checked={showGrid} onCheckedChange={setShowGrid} className="scale-75" />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Center Panel - Canvas (9 columns) */}
          <div className="lg:col-span-9 h-full">
            <Card className="h-full">
              <CardContent className="p-4 h-full flex flex-col">
                {!image ? (
                  <div
                    ref={dropZoneRef}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
                      flex items-center justify-center
                      border-2 border-dashed rounded-lg
                      flex-1
                      transition-colors
                      ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
                    `}
                  >
                    <div className="text-center space-y-3 p-6">
                      <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground" />
                      <div>
                        <p className="text-lg font-semibold">Drop Image Here</p>
                        <p className="text-sm text-muted-foreground mt-1">Or click the button below to upload</p>
                      </div>
                      <Button onClick={() => fileInputRef.current?.click()} size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Image
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 flex-1 flex flex-col">
                    <div className="flex-1 relative">
                      <div
                        ref={canvasContainerRef}
                        className="flex items-center justify-center border rounded-lg bg-gray-100 dark:bg-gray-900 p-3 h-full overflow-hidden relative"
                      >
                        <canvas
                          ref={canvasRef}
                          width={1000}
                          height={600}
                          onClick={handleCanvasClick}
                          onMouseDown={handleMouseDown}
                          onMouseMove={handleMouseMove}
                          onMouseUp={handleMouseUp}
                          onMouseLeave={() => {
                            setIsDrawing(false);
                            setIsDraggingImage(false);
                          }}
                          className={`border border-gray-300 dark:border-gray-700 ${
                            tool === "select" ? "cursor-move" : "cursor-crosshair"
                          }`}
                        />

                        {/* Vertical Zoom Controls */}
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col items-center space-y-1 bg-background/80 backdrop-blur-sm p-2 rounded border">
                          <Button onClick={zoomIn} size="sm" variant="outline" className="h-6 w-6 p-0">
                            <ZoomIn className="h-3 w-3" />
                          </Button>

                          <div className="flex flex-col items-center h-20">
                            <Slider
                              value={[canvasScale * 100]}
                              onValueChange={([value]) => setCanvasScale(value / 100)}
                              min={10}
                              max={300}
                              step={1}
                              orientation="vertical"
                              className="h-16"
                            />
                          </div>

                          <div className="text-xs font-medium min-w-[30px] text-center">
                            {Math.round(canvasScale * 100)}%
                          </div>

                          <Button onClick={zoomOut} size="sm" variant="outline" className="h-6 w-6 p-0">
                            <ZoomOut className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Controls */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Label className="text-xs font-medium min-w-[60px]">
                          Zoom: {Math.round(canvasScale * 100)}%
                        </Label>
                        <Slider
                          value={[canvasScale * 100]}
                          onValueChange={([value]) => setCanvasScale(value / 100)}
                          min={10}
                          max={300}
                          step={1}
                          className="flex-1"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        Ctrl + Mouse Wheel to zoom • Drag image to reposition
                      </p>
                    </div>

                    <Button onClick={handleDownload} className="w-full" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download Edited Image
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Ad */}
        <div className="mt-4">
          <AdSpace size="leaderboard" />
        </div>
      </div>
    </ToolLayout>
  );
};

export default AdvancedImageEditor;
