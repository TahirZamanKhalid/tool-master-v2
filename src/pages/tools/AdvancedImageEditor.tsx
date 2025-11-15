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
      <div className="mb-6">
        <AdSpace size="leaderboard" />
      </div>

      <div className="space-y-6">
        {/* Main Editor Area - Full Width */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-200px)] min-h-[700px]">
          {/* Left Panel - Collapsible Controls (3 columns) */}
          <div className="lg:col-span-3 h-full">
            <Card className="h-full">
              <CardContent className="p-4 h-full">
                <ScrollArea className="h-full pr-4">
                  <div className="space-y-3">
                    {/* Upload Section */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Upload Image</Label>
                      <Input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="cursor-pointer text-xs"
                      />
                    </div>

                    {image && (
                      <>
                        {/* Quick Actions */}
                        <div className="space-y-2 pt-3 border-t">
                          <Label className="text-sm font-semibold">Quick Actions</Label>
                          <div className="grid grid-cols-2 gap-2">
                            <Button onClick={undo} disabled={historyIndex <= 0} variant="outline" size="sm">
                              <Undo className="h-3 w-3 mr-1" />
                              Undo
                            </Button>
                            <Button
                              onClick={redo}
                              disabled={historyIndex >= history.length - 1}
                              variant="outline"
                              size="sm"
                            >
                              <Redo className="h-3 w-3 mr-1" />
                              Redo
                            </Button>
                            <Button
                              onClick={() => setRotation((prev) => (prev + 90) % 360)}
                              variant="outline"
                              size="sm"
                            >
                              <RotateCw className="h-3 w-3 mr-1" />
                              Rotate
                            </Button>
                            <Button onClick={resetFilters} variant="outline" size="sm">
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Reset
                            </Button>
                            <Button onClick={() => setFlipH(!flipH)} variant="outline" size="sm">
                              <FlipHorizontal className="h-3 w-3 mr-1" />
                              Flip H
                            </Button>
                            <Button onClick={() => setFlipV(!flipV)} variant="outline" size="sm">
                              <FlipVertical className="h-3 w-3 mr-1" />
                              Flip V
                            </Button>
                          </div>
                        </div>

                        {/* Basic Adjustments - Collapsible */}
                        <Collapsible
                          open={openSections.basicAdjustments}
                          onOpenChange={() => toggleSection("basicAdjustments")}
                          className="border rounded-lg"
                        >
                          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-accent rounded-lg">
                            <Label className="text-sm font-semibold cursor-pointer">Basic Adjustments</Label>
                            {openSections.basicAdjustments ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </CollapsibleTrigger>
                          <CollapsibleContent className="p-3 pt-0 space-y-3">
                            {/* Brightness */}
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <Label className="text-xs">Brightness</Label>
                                <span className="text-xs font-medium">{filters.brightness}%</span>
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
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <Label className="text-xs">Contrast</Label>
                                <span className="text-xs font-medium">{filters.contrast}%</span>
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
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <Label className="text-xs">Saturation</Label>
                                <span className="text-xs font-medium">{filters.saturation}%</span>
                              </div>
                              <Slider
                                value={[filters.saturation]}
                                onValueChange={([value]) => setFilters({ ...filters, saturation: value })}
                                min={0}
                                max={200}
                                step={1}
                              />
                            </div>

                            {/* Exposure */}
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <Label className="text-xs">Exposure</Label>
                                <span className="text-xs font-medium">{filters.exposure}%</span>
                              </div>
                              <Slider
                                value={[filters.exposure]}
                                onValueChange={([value]) => setFilters({ ...filters, exposure: value })}
                                min={0}
                                max={200}
                                step={1}
                              />
                            </div>

                            {/* Temperature */}
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <Label className="text-xs">Temperature</Label>
                                <span className="text-xs font-medium">{filters.temperature}</span>
                              </div>
                              <Slider
                                value={[filters.temperature]}
                                onValueChange={([value]) => setFilters({ ...filters, temperature: value })}
                                min={-100}
                                max={100}
                                step={1}
                              />
                            </div>

                            {/* Vibrance */}
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <Label className="text-xs">Vibrance</Label>
                                <span className="text-xs font-medium">{filters.vibrance}%</span>
                              </div>
                              <Slider
                                value={[filters.vibrance]}
                                onValueChange={([value]) => setFilters({ ...filters, vibrance: value })}
                                min={0}
                                max={200}
                                step={1}
                              />
                            </div>
                          </CollapsibleContent>
                        </Collapsible>

                        {/* Advanced Effects - Collapsible */}
                        <Collapsible
                          open={openSections.advancedEffects}
                          onOpenChange={() => toggleSection("advancedEffects")}
                          className="border rounded-lg"
                        >
                          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-accent rounded-lg">
                            <Label className="text-sm font-semibold cursor-pointer">Advanced Effects</Label>
                            {openSections.advancedEffects ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </CollapsibleTrigger>
                          <CollapsibleContent className="p-3 pt-0 space-y-3">
                            {/* Blur */}
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <Label className="text-xs">Blur</Label>
                                <span className="text-xs font-medium">{filters.blur}px</span>
                              </div>
                              <Slider
                                value={[filters.blur]}
                                onValueChange={([value]) => setFilters({ ...filters, blur: value })}
                                min={0}
                                max={20}
                                step={0.5}
                              />
                            </div>

                            {/* Sharpness */}
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <Label className="text-xs">Sharpness</Label>
                                <span className="text-xs font-medium">{filters.sharpness}%</span>
                              </div>
                              <Slider
                                value={[filters.sharpness]}
                                onValueChange={([value]) => setFilters({ ...filters, sharpness: value })}
                                min={0}
                                max={100}
                                step={1}
                              />
                            </div>

                            {/* Vignette */}
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <Label className="text-xs">Vignette</Label>
                                <span className="text-xs font-medium">{filters.vignette}%</span>
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
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <Label className="text-xs">Film Grain</Label>
                                <span className="text-xs font-medium">{filters.grain}%</span>
                              </div>
                              <Slider
                                value={[filters.grain]}
                                onValueChange={([value]) => setFilters({ ...filters, grain: value })}
                                min={0}
                                max={50}
                                step={1}
                              />
                            </div>

                            {/* Hue */}
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <Label className="text-xs">Hue</Label>
                                <span className="text-xs font-medium">{filters.hue}°</span>
                              </div>
                              <Slider
                                value={[filters.hue]}
                                onValueChange={([value]) => setFilters({ ...filters, hue: value })}
                                min={-180}
                                max={180}
                                step={1}
                              />
                            </div>

                            {/* Effect Toggles */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between p-2 rounded border">
                                <Label className="text-xs">Grayscale</Label>
                                <Switch
                                  checked={filters.grayscale}
                                  onCheckedChange={(checked) => setFilters({ ...filters, grayscale: checked })}
                                />
                              </div>
                              <div className="flex items-center justify-between p-2 rounded border">
                                <Label className="text-xs">Sepia</Label>
                                <Switch
                                  checked={filters.sepia}
                                  onCheckedChange={(checked) => setFilters({ ...filters, sepia: checked })}
                                />
                              </div>
                              <div className="flex items-center justify-between p-2 rounded border">
                                <Label className="text-xs">Invert</Label>
                                <Switch
                                  checked={filters.invert}
                                  onCheckedChange={(checked) => setFilters({ ...filters, invert: checked })}
                                />
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>

                        {/* Presets - Collapsible */}
                        <Collapsible
                          open={openSections.presets}
                          onOpenChange={() => toggleSection("presets")}
                          className="border rounded-lg"
                        >
                          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-accent rounded-lg">
                            <Label className="text-sm font-semibold cursor-pointer">Quick Presets</Label>
                            {openSections.presets ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </CollapsibleTrigger>
                          <CollapsibleContent className="p-3 pt-0">
                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                onClick={() => applyPreset("none")}
                                size="sm"
                                variant={activePreset === null ? "default" : "outline"}
                              >
                                None
                              </Button>
                              <Button
                                onClick={() => applyPreset("vintage")}
                                size="sm"
                                variant={activePreset === "vintage" ? "default" : "outline"}
                              >
                                Vintage
                              </Button>
                              <Button
                                onClick={() => applyPreset("bw")}
                                size="sm"
                                variant={activePreset === "bw" ? "default" : "outline"}
                              >
                                B&W
                              </Button>
                              <Button
                                onClick={() => applyPreset("bright")}
                                size="sm"
                                variant={activePreset === "bright" ? "default" : "outline"}
                              >
                                Bright
                              </Button>
                              <Button
                                onClick={() => applyPreset("dramatic")}
                                size="sm"
                                variant={activePreset === "dramatic" ? "default" : "outline"}
                              >
                                Dramatic
                              </Button>
                              <Button
                                onClick={() => applyPreset("cool")}
                                size="sm"
                                variant={activePreset === "cool" ? "default" : "outline"}
                              >
                                Cool
                              </Button>
                              <Button
                                onClick={() => applyPreset("warm")}
                                size="sm"
                                variant={activePreset === "warm" ? "default" : "outline"}
                              >
                                Warm
                              </Button>
                              <Button
                                onClick={() => applyPreset("cinematic")}
                                size="sm"
                                variant={activePreset === "cinematic" ? "default" : "outline"}
                              >
                                Cinematic
                              </Button>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>

                        {/* Tools - Collapsible */}
                        <Collapsible
                          open={openSections.tools}
                          onOpenChange={() => toggleSection("tools")}
                          className="border rounded-lg"
                        >
                          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-accent rounded-lg">
                            <Label className="text-sm font-semibold cursor-pointer">Drawing Tools</Label>
                            {openSections.tools ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </CollapsibleTrigger>
                          <CollapsibleContent className="p-3 pt-0 space-y-2">
                            <div className="space-y-1">
                              <Button
                                onClick={() => setTool("select")}
                                variant={tool === "select" ? "default" : "outline"}
                                className="w-full justify-start"
                                size="sm"
                              >
                                Select / Move
                              </Button>
                              <Button
                                onClick={() => setTool("text")}
                                variant={tool === "text" ? "default" : "outline"}
                                className="w-full justify-start"
                                size="sm"
                              >
                                <Type className="h-3 w-3 mr-2" />
                                Add Text
                              </Button>
                              <Button
                                onClick={() => setTool("draw")}
                                variant={tool === "draw" ? "default" : "outline"}
                                className="w-full justify-start"
                                size="sm"
                              >
                                <Paintbrush className="h-3 w-3 mr-2" />
                                Draw
                              </Button>
                              <Button
                                onClick={() => setTool("shape")}
                                variant={tool === "shape" ? "default" : "outline"}
                                className="w-full justify-start"
                                size="sm"
                              >
                                <Square className="h-3 w-3 mr-2" />
                                Shapes
                              </Button>
                              <Button
                                onClick={() => setTool("eraser")}
                                variant={tool === "eraser" ? "default" : "outline"}
                                className="w-full justify-start"
                                size="sm"
                              >
                                <Eraser className="h-3 w-3 mr-2" />
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
                                  className="text-xs"
                                />
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <Label className="text-xs">Color</Label>
                                    <Input
                                      type="color"
                                      value={currentText.color}
                                      onChange={(e) => setCurrentText({ ...currentText, color: e.target.value })}
                                      className="h-8 mt-1"
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
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="flex items-center space-x-2">
                                    <Switch
                                      checked={currentText.bold}
                                      onCheckedChange={(checked) => setCurrentText({ ...currentText, bold: checked })}
                                    />
                                    <Label className="text-xs">Bold</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Switch
                                      checked={currentText.italic}
                                      onCheckedChange={(checked) => setCurrentText({ ...currentText, italic: checked })}
                                    />
                                    <Label className="text-xs">Italic</Label>
                                  </div>
                                </div>
                              </div>
                            )}

                            {tool === "draw" && (
                              <div className="space-y-2 pt-2 border-t">
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <Label className="text-xs">Color</Label>
                                    <Input
                                      type="color"
                                      value={drawSettings.color}
                                      onChange={(e) => setDrawSettings({ ...drawSettings, color: e.target.value })}
                                      className="h-8 mt-1"
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

                            {tool === "shape" && (
                              <div className="space-y-2 pt-2 border-t">
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <Label className="text-xs">Stroke Color</Label>
                                    <Input
                                      type="color"
                                      value={shapeSettings.strokeColor}
                                      onChange={(e) =>
                                        setShapeSettings({ ...shapeSettings, strokeColor: e.target.value })
                                      }
                                      className="h-8 mt-1"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Fill Color</Label>
                                    <Input
                                      type="color"
                                      value={shapeSettings.fillColor}
                                      onChange={(e) =>
                                        setShapeSettings({ ...shapeSettings, fillColor: e.target.value })
                                      }
                                      className="h-8 mt-1"
                                    />
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    checked={shapeSettings.filled}
                                    onCheckedChange={(checked) =>
                                      setShapeSettings({ ...shapeSettings, filled: checked })
                                    }
                                  />
                                  <Label className="text-xs">Filled</Label>
                                </div>
                              </div>
                            )}
                          </CollapsibleContent>
                        </Collapsible>

                        {/* View Options */}
                        <div className="space-y-2 pt-3 border-t">
                          <div className="flex items-center justify-between p-2 rounded border">
                            <Label className="text-sm">Show Grid</Label>
                            <Switch checked={showGrid} onCheckedChange={setShowGrid} />
                          </div>
                        </div>

                        {/* Keyboard Shortcuts Info */}
                        <div className="pt-3 border-t">
                          <p className="text-xs text-muted-foreground">
                            <strong>Keyboard Shortcuts:</strong>
                            <br />
                            Ctrl + Mouse Wheel = Zoom In/Out
                            <br />
                            Ctrl+Z = Undo
                            <br />
                            Ctrl+Y = Redo
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Center Panel - Large Canvas (9 columns) */}
          <div className="lg:col-span-9 h-full">
            <Card className="h-full">
              <CardContent className="p-6 h-full flex flex-col">
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
                    <div className="text-center space-y-4 p-8">
                      <ImageIcon className="h-24 w-24 mx-auto text-muted-foreground" />
                      <div>
                        <p className="text-2xl font-semibold">Drop Image Here</p>
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
                  <div className="space-y-4 flex-1 flex flex-col">
                    <div className="flex-1 relative">
                      <div
                        ref={canvasContainerRef}
                        className="flex items-center justify-center border-2 rounded-lg bg-gray-100 dark:bg-gray-900 p-4 h-full overflow-hidden relative"
                      >
                        <canvas
                          ref={canvasRef}
                          width={1200}
                          height={800}
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
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col items-center space-y-2 bg-background/80 backdrop-blur-sm p-3 rounded-lg border">
                          <Button onClick={zoomIn} size="sm" variant="outline" className="h-8 w-8 p-0">
                            <ZoomIn className="h-4 w-4" />
                          </Button>

                          <div className="flex flex-col items-center h-32">
                            <Slider
                              value={[canvasScale * 100]}
                              onValueChange={([value]) => setCanvasScale(value / 100)}
                              min={10}
                              max={300}
                              step={1}
                              orientation="vertical"
                              className="h-24"
                            />
                          </div>

                          <div className="text-xs font-medium min-w-[40px] text-center">
                            {Math.round(canvasScale * 100)}%
                          </div>

                          <Button onClick={zoomOut} size="sm" variant="outline" className="h-8 w-8 p-0">
                            <ZoomOut className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Controls */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <Label className="text-sm font-medium min-w-[80px]">
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
                        <div className="flex gap-2">
                          <Button onClick={zoomOut} size="sm" variant="outline">
                            <ZoomOut className="h-4 w-4" />
                          </Button>
                          <Button onClick={zoomIn} size="sm" variant="outline">
                            <ZoomIn className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        Drag the slider to zoom in/out • Use Ctrl+Mouse Wheel for zoom • Drag image to reposition
                      </p>
                    </div>

                    <Button onClick={handleDownload} className="w-full" size="lg">
                      <Download className="h-5 w-5 mr-2" />
                      Download Edited Image
                    </Button>
                  </div>
                )}
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
