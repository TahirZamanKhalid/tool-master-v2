// pages/WatermarkTool.tsx
import { useState, useRef, useEffect, useCallback } from "react";
import { Link, Link as RouterLink } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Upload,
  Download,
  Type,
  Image as ImageIcon,
  Loader2,
  Settings,
  Palette,
  RotateCw,
  Save,
  Trash2,
  Copy,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid3X3,
  Layers,
  Package,
  Undo,
  Redo,
  Eye,
  EyeOff,
  Star,
  ImagePlus,
  Move,
  Shield,
  Zap,
  ChevronDown,
  ChevronRight,
  Keyboard,
  HelpCircle,
  X,
  Check,
  FileImage,
  LayoutGrid,
  SlidersHorizontal,
  Paintbrush,
  AlignCenter,
  Bold,
  Italic,
  Underline,
  CornerDownRight,
  Square,
  Circle,
  Triangle,
  Minimize2,
  Home,
} from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { Breadcrumbs, BREADCRUMB_PRESETS } from "@/components/Breadcrumbs";
import { SidebarAd } from "@/components/SidebarAd";
import { AdWatchModal } from "@/components/AdWatchModal";
import JSZip from "jszip";
import { isRasterImageFile } from "@/utils/imageFiles";

const MAX_WATERMARK_IMAGE_SIZE = 15 * 1024 * 1024;
const SUPPORTED_WATERMARK_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/bmp"];

// Types
type WatermarkType = "text" | "image" | "shape";
type Position = "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center" | "tiled" | "custom";
type ExportFormat = "png" | "jpg" | "webp";
type TextAlign = "left" | "center" | "right";
type FontWeight = "normal" | "bold";
type FontStyle = "normal" | "italic";
type ShapeType = "rectangle" | "circle" | "triangle" | "line";

interface WatermarkConfig {
  type: WatermarkType;
  text: string;
  position: Position;
  customX: number;
  customY: number;
  opacity: number;
  fontSize: number;
  watermarkSize: number;
  rotation: number;
  color: string;
  fontFamily: string;
  fontWeight: FontWeight;
  fontStyle: FontStyle;
  textShadow: boolean;
  textShadowColor: string;
  textShadowBlur: number;
  textOutline: boolean;
  outlineColor: string;
  outlineWidth: number;
  background: boolean;
  backgroundColor: string;
  backgroundPadding: number;
  backgroundRadius: number;
  textAlign: TextAlign;
  letterSpacing: number;
  scaleWithImage: boolean;
  tileSpacingX: number;
  tileSpacingY: number;
  shapeType: ShapeType;
  shapeWidth: number;
  shapeHeight: number;
  shapeFill: boolean;
  shapeStrokeWidth: number;
}

interface Preset {
  id: string;
  name: string;
  config: WatermarkConfig;
  isBuiltIn?: boolean;
}

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  name: string;
  size: number;
  processed: boolean;
}

// Default configuration
const DEFAULT_CONFIG: WatermarkConfig = {
  type: "text",
  text: "(c) Your Brand",
  position: "bottom-right",
  customX: 50,
  customY: 50,
  opacity: 70,
  fontSize: 48,
  watermarkSize: 100,
  rotation: 0,
  color: "#ffffff",
  fontFamily: "Arial",
  fontWeight: "normal",
  fontStyle: "normal",
  textShadow: true,
  textShadowColor: "#000000",
  textShadowBlur: 4,
  textOutline: false,
  outlineColor: "#000000",
  outlineWidth: 2,
  background: false,
  backgroundColor: "#000000",
  backgroundPadding: 10,
  backgroundRadius: 4,
  textAlign: "center",
  letterSpacing: 0,
  scaleWithImage: true,
  tileSpacingX: 150,
  tileSpacingY: 150,
  shapeType: "rectangle",
  shapeWidth: 100,
  shapeHeight: 50,
  shapeFill: false,
  shapeStrokeWidth: 2,
};

// Built-in presets
const BUILT_IN_PRESETS: Preset[] = [
  {
    id: "photographer",
    name: "📸 Photographer",
    isBuiltIn: true,
    config: { ...DEFAULT_CONFIG, text: "(c) Photo by You", opacity: 40, fontSize: 36, textShadow: true, textShadowBlur: 6 },
  },
  {
    id: "business",
    name: "💼 Business",
    isBuiltIn: true,
    config: { ...DEFAULT_CONFIG, text: "Your Company TM", opacity: 60, fontSize: 42, background: true, backgroundPadding: 15 },
  },
  {
    id: "subtle",
    name: "👁 Subtle",
    isBuiltIn: true,
    config: { ...DEFAULT_CONFIG, text: "(c)", opacity: 25, fontSize: 28 },
  },
  {
    id: "bold-red",
    name: "🔴 Bold Red",
    isBuiltIn: true,
    config: { ...DEFAULT_CONFIG, text: "CONFIDENTIAL", position: "center", opacity: 30, fontSize: 72, color: "#ff0000", rotation: -45 },
  },
  {
    id: "tiled",
    name: "🔲 Tiled",
    isBuiltIn: true,
    config: { ...DEFAULT_CONFIG, text: "(c)", position: "tiled", opacity: 15, fontSize: 48, rotation: -45 },
  },
  {
    id: "corner-logo",
    name: "📍 Corner Logo",
    isBuiltIn: true,
    config: { ...DEFAULT_CONFIG, type: "image", position: "bottom-right", opacity: 80, watermarkSize: 80 },
  },
];

// Font options
const FONTS = [
  { value: "Arial", label: "Arial" },
  { value: "Georgia", label: "Georgia" },
  { value: "Times New Roman", label: "Times New Roman" },
  { value: "Courier New", label: "Courier New" },
  { value: "Verdana", label: "Verdana" },
  { value: "Impact", label: "Impact" },
  { value: "Trebuchet MS", label: "Trebuchet MS" },
  { value: "Palatino Linotype", label: "Palatino" },
  { value: "Lucida Console", label: "Lucida Console" },
  { value: "Comic Sans MS", label: "Comic Sans" },
];

const getPresetDisplayName = (preset: Preset) => {
  if (!preset.isBuiltIn) return preset.name;

  const names: Record<string, string> = {
    photographer: "Photographer",
    business: "Business",
    subtle: "Subtle",
    "bold-red": "Bold Red",
    tiled: "Tiled",
    "corner-logo": "Corner Logo",
  };

  return names[preset.id] || preset.name;
};

// Ad slots
const AD_SLOTS = {
  leftSidebar1: "9343110614", // 150x600
  leftSidebar2: "2677639655", // 150x600
  rightSidebar1: "6536993616", // 150x600
  rightSidebar2: "6732434737", // 150x600
};

// Keyboard shortcuts
const SHORTCUTS = [
  { key: "Ctrl + Z", action: "Undo" },
  { key: "Ctrl + Y", action: "Redo" },
  { key: "Ctrl + S", action: "Download" },
  { key: "Ctrl + Scroll", action: "Zoom" },
  { key: "Arrow Keys", action: "Move (custom position)" },
  { key: "Shift + Arrow", action: "Move faster" },
  { key: "Ctrl + C", action: "Copy settings" },
  { key: "Ctrl + R", action: "Reset settings" },
  { key: "G", action: "Toggle grid" },
  { key: "Space", action: "Toggle before/after" },
];

const WatermarkTool = () => {
  // Image state
  const [images, setImages] = useState<ImageFile[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [watermarkImage, setWatermarkImage] = useState<HTMLImageElement | null>(null);

  // Config state
  const [config, setConfig] = useState<WatermarkConfig>(DEFAULT_CONFIG);
  const [presets, setPresets] = useState<Preset[]>([...BUILT_IN_PRESETS]);

  // UI state
  const [activeTab, setActiveTab] = useState("upload");
  const [activeControlTab, setActiveControlTab] = useState("type");
  const [showAdModal, setShowAdModal] = useState(false);
  const [canDownload, setCanDownload] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);

  // Preview state
  const [zoom, setZoom] = useState(0.5);
  const [showGrid, setShowGrid] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonPosition, setComparisonPosition] = useState(50);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Export state
  const [exportFormat, setExportFormat] = useState<ExportFormat>("png");
  const [exportQuality, setExportQuality] = useState(95);

  // History state
  const [history, setHistory] = useState<WatermarkConfig[]>([DEFAULT_CONFIG]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Dialog state
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showPresetDialog, setShowPresetDialog] = useState(false);
  const [presetName, setPresetName] = useState("");

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const comparisonCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const batchInputRef = useRef<HTMLInputElement>(null);
  const watermarkInputRef = useRef<HTMLInputElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Update config with history tracking
  const updateConfig = useCallback((updates: Partial<WatermarkConfig>) => {
    setConfig((prev) => {
      const newConfig = { ...prev, ...updates };

      // Add to history
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newConfig);
      if (newHistory.length > 50) newHistory.shift();
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);

      return newConfig;
    });
  }, [history, historyIndex]);

  // Undo/Redo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setConfig(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setConfig(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  // Reset config
  const resetConfig = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
    setHistory([DEFAULT_CONFIG]);
    setHistoryIndex(0);
    toast.success("Settings reset to default");
  }, []);

  // Copy settings
  const copySettings = useCallback(() => {
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    toast.success("Settings copied to clipboard");
  }, [config]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const isCtrl = e.ctrlKey || e.metaKey;

      if (isCtrl && e.key === "z") {
        e.preventDefault();
        undo();
      } else if (isCtrl && e.key === "y") {
        e.preventDefault();
        redo();
      } else if (isCtrl && e.key === "s") {
        e.preventDefault();
        handleDownload();
      } else if (isCtrl && e.key === "c" && !window.getSelection()?.toString()) {
        e.preventDefault();
        copySettings();
      } else if (isCtrl && e.key === "r") {
        e.preventDefault();
        resetConfig();
      } else if (e.key === "g") {
        setShowGrid((prev) => !prev);
      } else if (e.key === " ") {
        e.preventDefault();
        setShowComparison((prev) => !prev);
      }

      // Arrow keys for custom position
      if (config.position === "custom" && originalImage) {
        const step = e.shiftKey ? 5 : 1;
        let moved = false;

        if (e.key === "ArrowLeft") {
          updateConfig({ customX: Math.max(0, config.customX - step) });
          moved = true;
        } else if (e.key === "ArrowRight") {
          updateConfig({ customX: Math.min(100, config.customX + step) });
          moved = true;
        } else if (e.key === "ArrowUp") {
          updateConfig({ customY: Math.max(0, config.customY - step) });
          moved = true;
        } else if (e.key === "ArrowDown") {
          updateConfig({ customY: Math.min(100, config.customY + step) });
          moved = true;
        }

        if (moved) e.preventDefault();
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoom((prev) => Math.max(0.1, Math.min(3, prev + delta)));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("wheel", handleWheel);
    };
  }, [config, originalImage, undo, redo, copySettings, resetConfig, updateConfig]);

  // Draw watermarked image
  useEffect(() => {
    if (originalImage) {
      drawWatermarkedImage();
    }
  }, [originalImage, watermarkImage, config, zoom, showGrid, showComparison, comparisonPosition]);

  // Load current image when index changes
  useEffect(() => {
    if (images.length > 0 && images[currentImageIndex]) {
      const img = new Image();
      img.onload = () => setOriginalImage(img);
      img.src = images[currentImageIndex].preview;
    }
  }, [currentImageIndex, images]);

  const validateImageUpload = (file: File) => {
    if (!isRasterImageFile(file, SUPPORTED_WATERMARK_TYPES)) {
      toast.error("Please upload a JPG, PNG, WebP, or BMP image");
      return false;
    }

    if (file.size > MAX_WATERMARK_IMAGE_SIZE) {
      toast.error("Please upload an image smaller than 15 MB");
      return false;
    }

    return true;
  };

  // Handle single image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.currentTarget.value = "";
    if (!file) return;

    if (!validateImageUpload(file)) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const newImage: ImageFile = {
          id: Date.now().toString(),
          file,
          preview: event.target?.result as string,
          name: file.name,
          size: file.size,
          processed: false,
        };
        setImages([newImage]);
        setCurrentImageIndex(0);
        setOriginalImage(img);
        setActiveTab("edit");
        toast.success("Image loaded successfully!");
      };
      img.onerror = () => toast.error("Could not load this image");
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Handle batch upload
  const handleBatchUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.currentTarget.value = "";
    if (files.length === 0) return;

    const imageFiles = files.filter(
      (file) => isRasterImageFile(file, SUPPORTED_WATERMARK_TYPES) && file.size <= MAX_WATERMARK_IMAGE_SIZE,
    );
    if (imageFiles.length === 0) {
      toast.error("No valid image files found. Use JPG, PNG, WebP, or BMP under 15 MB.");
      return;
    }

    if (imageFiles.length !== files.length) {
      toast.warning("Some unsupported or oversized files were skipped");
    }

    const newImages: ImageFile[] = [];
    let loaded = 0;

    imageFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        const finishFile = () => {
          loaded++;
          if (loaded === imageFiles.length) {
            if (newImages.length === 0) {
              toast.error("No readable images were found");
              return;
            }
            setImages(newImages);
            setCurrentImageIndex(0);
            setActiveTab("edit");
            toast.success(`${newImages.length} images loaded!`);
          }
        };

        img.onload = () => {
          newImages.push({
            id: `${Date.now()}-${Math.random()}`,
            file,
            preview: event.target?.result as string,
            name: file.name,
            size: file.size,
            processed: false,
          });
          finishFile();
        };
        img.onerror = finishFile;
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle watermark image upload
  const handleWatermarkImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.currentTarget.value = "";
    if (!file) return;

    if (!validateImageUpload(file)) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setWatermarkImage(img);
        toast.success("Watermark image loaded!");
      };
      img.onerror = () => toast.error("Could not load this watermark image");
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Draw watermarked image on canvas
  const drawWatermarkedImage = () => {
    if (!originalImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = originalImage.width;
    canvas.height = originalImage.height;

    // Draw original image
    ctx.drawImage(originalImage, 0, 0);

    // Draw comparison canvas (original only)
    if (showComparison && comparisonCanvasRef.current) {
      const compCanvas = comparisonCanvasRef.current;
      const compCtx = compCanvas.getContext("2d");
      if (compCtx) {
        compCanvas.width = originalImage.width;
        compCanvas.height = originalImage.height;
        compCtx.drawImage(originalImage, 0, 0);
      }
    }

    // Apply watermark
    ctx.save();
    ctx.globalAlpha = config.opacity / 100;

    if (config.type === "text") {
      drawTextWatermark(ctx, canvas.width, canvas.height);
    } else if (config.type === "image" && watermarkImage) {
      drawImageWatermark(ctx, canvas.width, canvas.height);
    } else if (config.type === "shape") {
      drawShapeWatermark(ctx, canvas.width, canvas.height);
    }

    ctx.restore();

    // Draw grid overlay
    if (showGrid) {
      drawGrid(ctx, canvas.width, canvas.height);
    }

    // Draw to preview canvas with zoom
    if (previewCanvasRef.current) {
      const previewCanvas = previewCanvasRef.current;
      const previewCtx = previewCanvas.getContext("2d");
      if (previewCtx) {
        previewCanvas.width = canvas.width * zoom;
        previewCanvas.height = canvas.height * zoom;
        previewCtx.imageSmoothingEnabled = true;
        previewCtx.imageSmoothingQuality = "high";
        previewCtx.drawImage(canvas, 0, 0, previewCanvas.width, previewCanvas.height);
      }
    }
  };

  // Draw text watermark
  const drawTextWatermark = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const fontSize = config.scaleWithImage
      ? (config.fontSize * Math.min(width, height)) / 1000
      : config.fontSize;

    const fontStyle = config.fontStyle === "italic" ? "italic " : "";
    const fontWeight = config.fontWeight === "bold" ? "bold " : "";
    ctx.font = `${fontStyle}${fontWeight}${fontSize}px ${config.fontFamily}`;
    ctx.textAlign = config.textAlign;
    ctx.textBaseline = "middle";
    ctx.letterSpacing = `${config.letterSpacing}px`;

    const lines = config.text.split("\n");
    const lineHeight = fontSize * 1.3;
    const totalHeight = lines.length * lineHeight;

    const drawAtPosition = (x: number, y: number) => {
      lines.forEach((line, index) => {
        const text = line || " ";
        const textMetrics = ctx.measureText(text);
        const textWidth = textMetrics.width;
        const textY = y + (index - (lines.length - 1) / 2) * lineHeight;

        ctx.save();
        ctx.translate(x, textY);
        ctx.rotate((config.rotation * Math.PI) / 180);

        // Background
        if (config.background) {
          ctx.fillStyle = config.backgroundColor;
          const bgAlpha = ctx.globalAlpha * 0.8;
          ctx.globalAlpha = bgAlpha;
          const padding = config.backgroundPadding;
          const bgX = config.textAlign === "center" ? -textWidth / 2 - padding :
            config.textAlign === "right" ? -textWidth - padding : -padding;
          ctx.beginPath();
          ctx.roundRect(bgX, -fontSize / 2 - padding, textWidth + padding * 2, fontSize + padding * 2, config.backgroundRadius);
          ctx.fill();
          ctx.globalAlpha = config.opacity / 100;
        }

        // Shadow
        if (config.textShadow) {
          ctx.shadowColor = config.textShadowColor;
          ctx.shadowBlur = config.textShadowBlur;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;
        }

        // Outline
        if (config.textOutline) {
          ctx.strokeStyle = config.outlineColor;
          ctx.lineWidth = config.outlineWidth;
          ctx.strokeText(text, 0, 0);
        }

        // Fill text
        ctx.fillStyle = config.color;
        ctx.fillText(text, 0, 0);

        ctx.restore();
      });
    };

    if (config.position === "tiled") {
      for (let y = config.tileSpacingY / 2; y < height + config.tileSpacingY; y += config.tileSpacingY) {
        for (let x = config.tileSpacingX / 2; x < width + config.tileSpacingX; x += config.tileSpacingX) {
          drawAtPosition(x, y);
        }
      }
    } else {
      const textMetrics = ctx.measureText(config.text);
      const pos = getPosition(width, height, textMetrics.width, totalHeight);
      drawAtPosition(pos.x, pos.y);
    }
  };

  // Draw image watermark
  const drawImageWatermark = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!watermarkImage) return;

    const scale = config.scaleWithImage
      ? (config.watermarkSize / 100) * Math.min(width, height) / Math.max(watermarkImage.width, watermarkImage.height)
      : config.watermarkSize / 100;

    const wmWidth = watermarkImage.width * scale;
    const wmHeight = watermarkImage.height * scale;

    const drawAtPosition = (x: number, y: number) => {
      ctx.save();
      ctx.translate(x + wmWidth / 2, y + wmHeight / 2);
      ctx.rotate((config.rotation * Math.PI) / 180);
      ctx.drawImage(watermarkImage, -wmWidth / 2, -wmHeight / 2, wmWidth, wmHeight);
      ctx.restore();
    };

    if (config.position === "tiled") {
      for (let y = 0; y < height + config.tileSpacingY; y += wmHeight + config.tileSpacingY) {
        for (let x = 0; x < width + config.tileSpacingX; x += wmWidth + config.tileSpacingX) {
          drawAtPosition(x, y);
        }
      }
    } else {
      const pos = getPosition(width, height, wmWidth, wmHeight);
      drawAtPosition(pos.x, pos.y);
    }
  };

  // Draw shape watermark
  const drawShapeWatermark = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const shapeWidth = config.scaleWithImage
      ? (config.shapeWidth * Math.min(width, height)) / 1000
      : config.shapeWidth;
    const shapeHeight = config.scaleWithImage
      ? (config.shapeHeight * Math.min(width, height)) / 1000
      : config.shapeHeight;

    const pos = getPosition(width, height, shapeWidth, shapeHeight);

    ctx.save();
    ctx.translate(pos.x + shapeWidth / 2, pos.y + shapeHeight / 2);
    ctx.rotate((config.rotation * Math.PI) / 180);

    if (config.shapeFill) {
      ctx.fillStyle = config.color;
    } else {
      ctx.strokeStyle = config.color;
      ctx.lineWidth = config.shapeStrokeWidth;
    }

    switch (config.shapeType) {
      case "rectangle":
        if (config.shapeFill) {
          ctx.fillRect(-shapeWidth / 2, -shapeHeight / 2, shapeWidth, shapeHeight);
        } else {
          ctx.strokeRect(-shapeWidth / 2, -shapeHeight / 2, shapeWidth, shapeHeight);
        }
        break;
      case "circle":
        ctx.beginPath();
        ctx.arc(0, 0, Math.min(shapeWidth, shapeHeight) / 2, 0, Math.PI * 2);
        config.shapeFill ? ctx.fill() : ctx.stroke();
        break;
      case "triangle":
        ctx.beginPath();
        ctx.moveTo(0, -shapeHeight / 2);
        ctx.lineTo(shapeWidth / 2, shapeHeight / 2);
        ctx.lineTo(-shapeWidth / 2, shapeHeight / 2);
        ctx.closePath();
        config.shapeFill ? ctx.fill() : ctx.stroke();
        break;
      case "line":
        ctx.beginPath();
        ctx.moveTo(-shapeWidth / 2, 0);
        ctx.lineTo(shapeWidth / 2, 0);
        ctx.stroke();
        break;
    }

    ctx.restore();
  };

  // Draw grid
  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 1;

    for (let i = 1; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo((width / 3) * i, 0);
      ctx.lineTo((width / 3) * i, height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, (height / 3) * i);
      ctx.lineTo(width, (height / 3) * i);
      ctx.stroke();
    }

    ctx.restore();
  };

  // Get position based on config
  const getPosition = (canvasWidth: number, canvasHeight: number, wmWidth: number, wmHeight: number) => {
    const padding = Math.min(canvasWidth, canvasHeight) * 0.02;

    switch (config.position) {
      case "top-left":
        return { x: padding, y: padding };
      case "top-right":
        return { x: canvasWidth - wmWidth - padding, y: padding };
      case "bottom-left":
        return { x: padding, y: canvasHeight - wmHeight - padding };
      case "bottom-right":
        return { x: canvasWidth - wmWidth - padding, y: canvasHeight - wmHeight - padding };
      case "center":
        return { x: (canvasWidth - wmWidth) / 2, y: (canvasHeight - wmHeight) / 2 };
      case "custom":
        return {
          x: (config.customX / 100) * (canvasWidth - wmWidth),
          y: (config.customY / 100) * (canvasHeight - wmHeight),
        };
      default:
        return { x: padding, y: padding };
    }
  };

  // Canvas drag handlers
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (config.position !== "custom" || !originalImage) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !previewCanvasRef.current) return;

    const canvas = previewCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const deltaX = ((e.clientX - dragStart.x) / rect.width) * 100;
    const deltaY = ((e.clientY - dragStart.y) / rect.height) * 100;

    const newX = Math.max(0, Math.min(100, config.customX + deltaX));
    const newY = Math.max(0, Math.min(100, config.customY + deltaY));

    setConfig((prev) => ({ ...prev, customX: newX, customY: newY }));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleCanvasMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      // Add to history after drag ends
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(config);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  // Download handler
  const handleDownload = () => {
    if (!originalImage) {
      toast.error("Please upload an image first");
      return;
    }

    if (!canDownload) {
      setShowAdModal(true);
      return;
    }

    if (images.length > 1) {
      downloadBatch();
    } else {
      downloadSingle();
    }
  };

  // Single image download
  const downloadSingle = () => {
    if (!canvasRef.current) return;

    setIsProcessing(true);

    setTimeout(() => {
      const canvas = canvasRef.current!;
      const mimeType = exportFormat === "jpg" ? "image/jpeg" : `image/${exportFormat}`;
      const quality = exportFormat === "png" ? undefined : exportQuality / 100;

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `watermarked-${Date.now()}.${exportFormat}`;
            link.click();
            URL.revokeObjectURL(url);
            toast.success("Image downloaded!");
          }
          setIsProcessing(false);
        },
        mimeType,
        quality
      );
    }, 100);
  };

  // Batch download
  const downloadBatch = async () => {
    setIsProcessing(true);
    setBatchProgress(0);

    const zip = new JSZip();
    const folder = zip.folder("watermarked-images");

    for (let i = 0; i < images.length; i++) {
      const imageFile = images[i];

      // Load image
      const img = new Image();
      const imageLoaded = await new Promise<boolean>((resolve) => {
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = imageFile.preview;
      });

      if (!imageLoaded) {
        setBatchProgress(((i + 1) / images.length) * 100);
        continue;
      }

      // Create temp canvas
      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");
      if (!tempCtx) continue;

      tempCanvas.width = img.width;
      tempCanvas.height = img.height;

      // Draw image
      tempCtx.drawImage(img, 0, 0);
      tempCtx.save();
      tempCtx.globalAlpha = config.opacity / 100;

      // Apply watermark
      if (config.type === "text") {
        drawTextWatermark(tempCtx, tempCanvas.width, tempCanvas.height);
      } else if (config.type === "image" && watermarkImage) {
        drawImageWatermark(tempCtx, tempCanvas.width, tempCanvas.height);
      } else if (config.type === "shape") {
        drawShapeWatermark(tempCtx, tempCanvas.width, tempCanvas.height);
      }

      tempCtx.restore();

      // Get blob
      const blob = await new Promise<Blob | null>((resolve) => {
        const mimeType = exportFormat === "jpg" ? "image/jpeg" : `image/${exportFormat}`;
        const quality = exportFormat === "png" ? undefined : exportQuality / 100;
        tempCanvas.toBlob((b) => resolve(b), mimeType, quality);
      });

      // Add to zip
      const filename = `watermarked-${i + 1}.${exportFormat}`;
      if (blob) folder?.file(filename, blob);

      setBatchProgress(((i + 1) / images.length) * 100);
    }

    // Download zip
    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const link = document.createElement("a");
    link.href = url;
    link.download = `watermarked-batch-${Date.now()}.zip`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success(`${images.length} images processed!`);
    setIsProcessing(false);
    setBatchProgress(0);
  };

  // Load preset
  const loadPreset = (preset: Preset) => {
    setConfig(preset.config);
    toast.success(`Loaded: ${getPresetDisplayName(preset)}`);
  };

  // Save preset
  const savePreset = () => {
    if (!presetName.trim()) {
      toast.error("Enter a preset name");
      return;
    }

    const newPreset: Preset = {
      id: Date.now().toString(),
      name: presetName,
      config: { ...config },
    };

    setPresets([...presets, newPreset]);
    setPresetName("");
    setShowPresetDialog(false);
    toast.success("Preset saved!");
  };

  // Delete preset
  const deletePreset = (id: string) => {
    setPresets(presets.filter((p) => p.id !== id));
    toast.success("Preset deleted");
  };

  // Remove image from batch
  const removeImage = (id: string) => {
    const newImages = images.filter((img) => img.id !== id);
    setImages(newImages);
    if (currentImageIndex >= newImages.length) {
      setCurrentImageIndex(Math.max(0, newImages.length - 1));
    }
  };

  // Clear all images
  const clearImages = () => {
    setImages([]);
    setOriginalImage(null);
    setCurrentImageIndex(0);
    setActiveTab("upload");
  };

  // Breadcrumbs
  const breadcrumbItems = BREADCRUMB_PRESETS.imageTools("Watermark Tool", "/tools/watermark-tool");

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <>
      <SEOHead
        title="Free Online Watermark Tool - Add Text & Logo Watermarks to Images | ToolMaster"
        description="Professional watermark tool to protect your images. Add text or logo watermarks, batch process multiple images, drag & drop positioning, custom presets. 100% free, works in your browser."
        keywords="watermark tool, add watermark, image watermark, photo watermark, batch watermark, watermark maker, logo watermark, text watermark, protect images, copyright images, watermark generator, free watermark"
        canonical="https://toolmaster.cloud/tools/watermark-tool"
      />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7382531001943020"
          crossOrigin="anonymous"
        />

        <div className="container mx-auto px-4 py-4 lg:py-6">
          {/* Breadcrumbs */}
          <Breadcrumbs items={breadcrumbItems} />

          {/* Main Layout with Dual Sidebars */}
          <div className="flex flex-col lg:flex-row gap-6 max-w-[1920px] mx-auto">
            {/* Left Sidebar Ads */}
            <aside className="hidden xl:flex flex-col gap-6 w-[150px] flex-shrink-0">
              <div className="sticky top-4 space-y-6">
                <SidebarAd slot={AD_SLOTS.leftSidebar1} position="left" index={1} width={150} height={600} />
                <SidebarAd slot={AD_SLOTS.leftSidebar2} position="left" index={2} width={150} height={600} />
              </div>
            </aside>

            {/* Main Center Content */}
            <main className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    Watermark Tool
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Protect your images with professional watermarks
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Keyboard shortcuts */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowShortcuts(true)}
                        >
                          <Keyboard className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Keyboard Shortcuts</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {/* Trust badges */}
                  <Badge variant="outline" className="hidden sm:flex gap-1">
                    <Shield className="h-3 w-3" />
                    Private
                  </Badge>
                  <Badge variant="outline" className="hidden sm:flex gap-1">
                    <Zap className="h-3 w-3" />
                    Fast
                  </Badge>
                </div>
              </div>

              {/* Main Card */}
              <Card className="overflow-hidden">
                {/* Main Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <div className="border-b px-4">
                    <TabsList className="h-12 bg-transparent gap-2">
                      <TabsTrigger
                        value="upload"
                        className="data-[state=active]:bg-primary/10"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </TabsTrigger>
                      <TabsTrigger
                        value="edit"
                        disabled={!originalImage}
                        className="data-[state=active]:bg-primary/10"
                      >
                        <Paintbrush className="h-4 w-4 mr-2" />
                        Edit
                      </TabsTrigger>
                      <TabsTrigger
                        value="export"
                        disabled={!originalImage}
                        className="data-[state=active]:bg-primary/10"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </TabsTrigger>
                      {images.length > 1 && (
                        <TabsTrigger
                          value="batch"
                          className="data-[state=active]:bg-primary/10"
                        >
                          <Package className="h-4 w-4 mr-2" />
                          Batch ({images.length})
                        </TabsTrigger>
                      )}
                    </TabsList>
                  </div>

                  {/* Upload Tab */}
                  <TabsContent value="upload" className="p-6 m-0">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Single Upload */}
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept={SUPPORTED_WATERMARK_TYPES.join(",")}
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="font-medium mb-1">Upload Single Image</p>
                        <p className="text-sm text-muted-foreground">
                          Click or drag to upload
                        </p>
                      </div>

                      {/* Batch Upload */}
                      <div
                        onClick={() => batchInputRef.current?.click()}
                        className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                      >
                        <input
                          ref={batchInputRef}
                          type="file"
                          accept={SUPPORTED_WATERMARK_TYPES.join(",")}
                          multiple
                          onChange={handleBatchUpload}
                          className="hidden"
                        />
                        <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="font-medium mb-1">Batch Upload</p>
                        <p className="text-sm text-muted-foreground">
                          Select multiple images
                        </p>
                      </div>
                    </div>

                    {/* Presets */}
                    <div className="mt-6">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        Quick Start Presets
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                        {BUILT_IN_PRESETS.map((preset) => (
                          <Button
                            key={preset.id}
                            variant="outline"
                            size="sm"
                            onClick={() => loadPreset(preset)}
                            className="text-xs justify-start"
                          >
                            {getPresetDisplayName(preset)}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Edit Tab */}
                  <TabsContent value="edit" className="m-0">
                    <div className="flex flex-col lg:flex-row">
                      {/* Controls Panel */}
                      <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r shrink-0">
                        <div className="p-3 border-b flex items-center justify-between">
                          <span className="font-medium text-sm">Controls</span>
                          <div className="flex gap-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={undo}
                                    disabled={historyIndex === 0}
                                  >
                                    <Undo className="h-3.5 w-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={redo}
                                    disabled={historyIndex === history.length - 1}
                                  >
                                    <Redo className="h-3.5 w-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={resetConfig}
                                  >
                                    <RefreshCw className="h-3.5 w-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Reset (Ctrl+R)</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>

                        <Tabs
                          value={activeControlTab}
                          onValueChange={setActiveControlTab}
                          className="w-full"
                        >
                          <div className="px-2 pt-2">
                            <TabsList className="w-full grid grid-cols-4 h-8">
                              <TabsTrigger value="type" className="text-xs px-2">
                                Type
                              </TabsTrigger>
                              <TabsTrigger value="style" className="text-xs px-2">
                                Style
                              </TabsTrigger>
                              <TabsTrigger value="position" className="text-xs px-2">
                                Position
                              </TabsTrigger>
                              <TabsTrigger value="presets" className="text-xs px-2">
                                Presets
                              </TabsTrigger>
                            </TabsList>
                          </div>

                          <ScrollArea className="h-[350px]">
                            {/* Type Tab */}
                            <TabsContent value="type" className="p-3 m-0 space-y-4">
                              <div className="space-y-2">
                                <Label className="text-xs">Watermark Type</Label>
                                <div className="grid grid-cols-3 gap-2">
                                  {[
                                    { value: "text", icon: Type, label: "Text" },
                                    { value: "image", icon: ImageIcon, label: "Image" },
                                    { value: "shape", icon: Square, label: "Shape" },
                                  ].map((type) => (
                                    <Button
                                      key={type.value}
                                      variant={config.type === type.value ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => updateConfig({ type: type.value as WatermarkType })}
                                      className="flex flex-col h-16 gap-1"
                                    >
                                      <type.icon className="h-4 w-4" />
                                      <span className="text-xs">{type.label}</span>
                                    </Button>
                                  ))}
                                </div>
                              </div>

                              {config.type === "text" && (
                                <>
                                  <div className="space-y-2">
                                    <Label className="text-xs">Text</Label>
                                    <Input
                                      value={config.text}
                                      onChange={(e) => updateConfig({ text: e.target.value })}
                                      placeholder="(c) Your Brand"
                                      className="h-8 text-sm"
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label className="text-xs">Font</Label>
                                    <Select
                                      value={config.fontFamily}
                                      onValueChange={(v) => updateConfig({ fontFamily: v })}
                                    >
                                      <SelectTrigger className="h-8 text-sm">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {FONTS.map((font) => (
                                          <SelectItem key={font.value} value={font.value}>
                                            <span style={{ fontFamily: font.value }}>{font.label}</span>
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="flex gap-2">
                                    <Button
                                      variant={config.fontWeight === "bold" ? "default" : "outline"}
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() =>
                                        updateConfig({
                                          fontWeight: config.fontWeight === "bold" ? "normal" : "bold",
                                        })
                                      }
                                    >
                                      <Bold className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      variant={config.fontStyle === "italic" ? "default" : "outline"}
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() =>
                                        updateConfig({
                                          fontStyle: config.fontStyle === "italic" ? "normal" : "italic",
                                        })
                                      }
                                    >
                                      <Italic className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>

                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <Label className="text-xs">Font Size</Label>
                                      <span className="text-xs text-muted-foreground">{config.fontSize}px</span>
                                    </div>
                                    <Slider
                                      value={[config.fontSize]}
                                      onValueChange={([v]) => updateConfig({ fontSize: v })}
                                      min={12}
                                      max={200}
                                      step={1}
                                    />
                                  </div>
                                </>
                              )}

                              {config.type === "image" && (
                                <>
                                  <div className="space-y-2">
                                    <Label className="text-xs">Watermark Image</Label>
                                    <input
                                      ref={watermarkInputRef}
                                      type="file"
                                      accept={SUPPORTED_WATERMARK_TYPES.join(",")}
                                      onChange={handleWatermarkImageUpload}
                                      className="hidden"
                                    />
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="w-full"
                                      onClick={() => watermarkInputRef.current?.click()}
                                    >
                                      <ImagePlus className="h-4 w-4 mr-2" />
                                      {watermarkImage ? "Change Image" : "Upload Image"}
                                    </Button>
                                    {watermarkImage && (
                                      <div className="relative h-16 bg-muted rounded overflow-hidden">
                                        <img
                                          src={watermarkImage.src}
                                          alt="Watermark"
                                          className="w-full h-full object-contain"
                                        />
                                      </div>
                                    )}
                                  </div>

                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <Label className="text-xs">Size</Label>
                                      <span className="text-xs text-muted-foreground">{config.watermarkSize}%</span>
                                    </div>
                                    <Slider
                                      value={[config.watermarkSize]}
                                      onValueChange={([v]) => updateConfig({ watermarkSize: v })}
                                      min={10}
                                      max={200}
                                      step={1}
                                    />
                                  </div>
                                </>
                              )}

                              {config.type === "shape" && (
                                <>
                                  <div className="space-y-2">
                                    <Label className="text-xs">Shape</Label>
                                    <div className="grid grid-cols-4 gap-2">
                                      {[
                                        { value: "rectangle", icon: Square },
                                        { value: "circle", icon: Circle },
                                        { value: "triangle", icon: Triangle },
                                        { value: "line", icon: () => <span>-</span> },
                                      ].map((shape) => (
                                        <Button
                                          key={shape.value}
                                          variant={config.shapeType === shape.value ? "default" : "outline"}
                                          size="icon"
                                          className="h-8 w-8"
                                          onClick={() => updateConfig({ shapeType: shape.value as ShapeType })}
                                        >
                                          <shape.icon className="h-4 w-4" />
                                        </Button>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <Switch
                                      checked={config.shapeFill}
                                      onCheckedChange={(v) => updateConfig({ shapeFill: v })}
                                    />
                                    <Label className="text-xs">Filled</Label>
                                  </div>

                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                      <Label className="text-xs">Width</Label>
                                      <Input
                                        type="number"
                                        value={config.shapeWidth}
                                        onChange={(e) => updateConfig({ shapeWidth: Number(e.target.value) })}
                                        className="h-7 text-xs"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-xs">Height</Label>
                                      <Input
                                        type="number"
                                        value={config.shapeHeight}
                                        onChange={(e) => updateConfig({ shapeHeight: Number(e.target.value) })}
                                        className="h-7 text-xs"
                                      />
                                    </div>
                                  </div>
                                </>
                              )}
                            </TabsContent>

                            {/* Style Tab */}
                            <TabsContent value="style" className="p-3 m-0 space-y-4">
                              <div className="space-y-2">
                                <Label className="text-xs">Color</Label>
                                <div className="flex gap-2">
                                  <input
                                    type="color"
                                    value={config.color}
                                    onChange={(e) => updateConfig({ color: e.target.value })}
                                    className="w-10 h-8 rounded cursor-pointer border"
                                  />
                                  <Input
                                    value={config.color}
                                    onChange={(e) => updateConfig({ color: e.target.value })}
                                    className="h-8 text-xs flex-1"
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <Label className="text-xs">Opacity</Label>
                                  <span className="text-xs text-muted-foreground">{config.opacity}%</span>
                                </div>
                                <Slider
                                  value={[config.opacity]}
                                  onValueChange={([v]) => updateConfig({ opacity: v })}
                                  min={0}
                                  max={100}
                                  step={1}
                                />
                              </div>

                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <Label className="text-xs">Rotation</Label>
                                  <span className="text-xs text-muted-foreground">{config.rotation}deg</span>
                                </div>
                                <Slider
                                  value={[config.rotation]}
                                  onValueChange={([v]) => updateConfig({ rotation: v })}
                                  min={-180}
                                  max={180}
                                  step={1}
                                />
                              </div>

                              {config.type === "text" && (
                                <>
                                  <div className="flex items-center justify-between">
                                    <Label className="text-xs">Text Shadow</Label>
                                    <Switch
                                      checked={config.textShadow}
                                      onCheckedChange={(v) => updateConfig({ textShadow: v })}
                                    />
                                  </div>

                                  {config.textShadow && (
                                    <div className="pl-3 space-y-2 border-l-2">
                                      <div className="flex gap-2">
                                        <input
                                          type="color"
                                          value={config.textShadowColor}
                                          onChange={(e) => updateConfig({ textShadowColor: e.target.value })}
                                          className="w-8 h-6 rounded cursor-pointer border"
                                        />
                                        <div className="flex-1 space-y-1">
                                          <Label className="text-xs">Blur: {config.textShadowBlur}px</Label>
                                          <Slider
                                            value={[config.textShadowBlur]}
                                            onValueChange={([v]) => updateConfig({ textShadowBlur: v })}
                                            min={0}
                                            max={20}
                                            step={1}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  <div className="flex items-center justify-between">
                                    <Label className="text-xs">Text Outline</Label>
                                    <Switch
                                      checked={config.textOutline}
                                      onCheckedChange={(v) => updateConfig({ textOutline: v })}
                                    />
                                  </div>

                                  {config.textOutline && (
                                    <div className="pl-3 space-y-2 border-l-2">
                                      <div className="flex gap-2">
                                        <input
                                          type="color"
                                          value={config.outlineColor}
                                          onChange={(e) => updateConfig({ outlineColor: e.target.value })}
                                          className="w-8 h-6 rounded cursor-pointer border"
                                        />
                                        <div className="flex-1 space-y-1">
                                          <Label className="text-xs">Width: {config.outlineWidth}px</Label>
                                          <Slider
                                            value={[config.outlineWidth]}
                                            onValueChange={([v]) => updateConfig({ outlineWidth: v })}
                                            min={1}
                                            max={10}
                                            step={1}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  <div className="flex items-center justify-between">
                                    <Label className="text-xs">Background</Label>
                                    <Switch
                                      checked={config.background}
                                      onCheckedChange={(v) => updateConfig({ background: v })}
                                    />
                                  </div>

                                  {config.background && (
                                    <div className="pl-3 space-y-2 border-l-2">
                                      <div className="flex gap-2">
                                        <input
                                          type="color"
                                          value={config.backgroundColor}
                                          onChange={(e) => updateConfig({ backgroundColor: e.target.value })}
                                          className="w-8 h-6 rounded cursor-pointer border"
                                        />
                                        <div className="flex-1 space-y-1">
                                          <Label className="text-xs">Padding: {config.backgroundPadding}px</Label>
                                          <Slider
                                            value={[config.backgroundPadding]}
                                            onValueChange={([v]) => updateConfig({ backgroundPadding: v })}
                                            min={0}
                                            max={50}
                                            step={1}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </>
                              )}

                              <div className="flex items-center justify-between">
                                <Label className="text-xs">Scale with Image</Label>
                                <Switch
                                  checked={config.scaleWithImage}
                                  onCheckedChange={(v) => updateConfig({ scaleWithImage: v })}
                                />
                              </div>
                            </TabsContent>

                            {/* Position Tab */}
                            <TabsContent value="position" className="p-3 m-0 space-y-4">
                              <div className="space-y-2">
                                <Label className="text-xs">Position</Label>
                                <div className="grid grid-cols-3 gap-1">
                                  {[
                                    { value: "top-left", label: "↖" },
                                    { value: "center", label: "⊙" },
                                    { value: "top-right", label: "↗" },
                                    { value: "custom", label: "⊕" },
                                    { value: "tiled", label: "⊞" },
                                    { value: "bottom-left", label: "↙" },
                                    { value: "", label: "" },
                                    { value: "bottom-right", label: "↘" },
                                  ].filter(p => p.value).map((pos) => (
                                    <Button
                                      key={pos.value}
                                      variant={config.position === pos.value ? "default" : "outline"}
                                      size="sm"
                                      className="h-10 text-lg"
                                      onClick={() => updateConfig({ position: pos.value as Position })}
                                    >
                                      {pos.label}
                                    </Button>
                                  ))}
                                </div>
                              </div>

                              {config.position === "custom" && (
                                <div className="p-3 bg-muted/50 rounded-lg space-y-3">
                                  <p className="text-xs text-muted-foreground">
                                    Drag on preview or use sliders. Arrow keys for fine control.
                                  </p>
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <Label className="text-xs">X Position</Label>
                                      <span className="text-xs text-muted-foreground">{config.customX.toFixed(0)}%</span>
                                    </div>
                                    <Slider
                                      value={[config.customX]}
                                      onValueChange={([v]) => updateConfig({ customX: v })}
                                      min={0}
                                      max={100}
                                      step={1}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <Label className="text-xs">Y Position</Label>
                                      <span className="text-xs text-muted-foreground">{config.customY.toFixed(0)}%</span>
                                    </div>
                                    <Slider
                                      value={[config.customY]}
                                      onValueChange={([v]) => updateConfig({ customY: v })}
                                      min={0}
                                      max={100}
                                      step={1}
                                    />
                                  </div>
                                </div>
                              )}

                              {config.position === "tiled" && (
                                <div className="space-y-3">
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <Label className="text-xs">Horizontal Spacing</Label>
                                      <span className="text-xs text-muted-foreground">{config.tileSpacingX}px</span>
                                    </div>
                                    <Slider
                                      value={[config.tileSpacingX]}
                                      onValueChange={([v]) => updateConfig({ tileSpacingX: v })}
                                      min={50}
                                      max={500}
                                      step={10}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <Label className="text-xs">Vertical Spacing</Label>
                                      <span className="text-xs text-muted-foreground">{config.tileSpacingY}px</span>
                                    </div>
                                    <Slider
                                      value={[config.tileSpacingY]}
                                      onValueChange={([v]) => updateConfig({ tileSpacingY: v })}
                                      min={50}
                                      max={500}
                                      step={10}
                                    />
                                  </div>
                                </div>
                              )}
                            </TabsContent>

                            {/* Presets Tab */}
                            <TabsContent value="presets" className="p-3 m-0 space-y-4">
                              <div className="space-y-2">
                                {presets.map((preset) => (
                                  <div
                                    key={preset.id}
                                    className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                                  >
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="flex-1 justify-start text-xs h-7"
                                      onClick={() => loadPreset(preset)}
                                    >
                                      {getPresetDisplayName(preset)}
                                    </Button>
                                    {!preset.isBuiltIn && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                        onClick={() => deletePreset(preset.id)}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    )}
                                  </div>
                                ))}
                              </div>

                              <div className="pt-2 border-t space-y-2">
                                <Label className="text-xs">Save Current Settings</Label>
                                <div className="flex gap-2">
                                  <Input
                                    value={presetName}
                                    onChange={(e) => setPresetName(e.target.value)}
                                    placeholder="Preset name"
                                    className="h-8 text-xs flex-1"
                                  />
                                  <Button
                                    size="sm"
                                    className="h-8"
                                    onClick={savePreset}
                                    disabled={!presetName.trim()}
                                  >
                                    <Save className="h-3 w-3 mr-1" />
                                    Save
                                  </Button>
                                </div>
                              </div>
                            </TabsContent>
                          </ScrollArea>
                        </Tabs>
                      </div>

                      {/* Preview Area */}
                      <div className="flex-1 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Preview</span>
                            {originalImage && (
                              <Badge variant="outline" className="text-xs">
                                {originalImage.width}  x  {originalImage.height}
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant={showGrid ? "default" : "ghost"}
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => setShowGrid(!showGrid)}
                                  >
                                    <Grid3X3 className="h-3.5 w-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Toggle Grid (G)</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant={showComparison ? "default" : "ghost"}
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => setShowComparison(!showComparison)}
                                  >
                                    {showComparison ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Before/After (Space)</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}
                              disabled={zoom <= 0.1}
                            >
                              <ZoomOut className="h-3.5 w-3.5" />
                            </Button>
                            <span className="text-xs w-10 text-center">{Math.round(zoom * 100)}%</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                              disabled={zoom >= 3}
                            >
                              <ZoomIn className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>

                        <div
                          ref={previewContainerRef}
                          className={`relative bg-[repeating-conic-gradient(#e5e5e5_0%_25%,#ffffff_0%_50%)] bg-[length:16px_16px] rounded-lg overflow-auto ${isFullscreen ? "fixed inset-0 z-50 p-8 bg-background" : "max-h-[400px]"
                            }`}
                        >
                          {originalImage ? (
                            <>
                              <canvas
                                ref={previewCanvasRef}
                                className={`inline-block ${config.position === "custom" ? "cursor-move" : ""}`}
                                onMouseDown={handleCanvasMouseDown}
                                onMouseMove={handleCanvasMouseMove}
                                onMouseUp={handleCanvasMouseUp}
                                onMouseLeave={handleCanvasMouseUp}
                              />
                            </>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                              <ImageIcon className="h-12 w-12 mb-3 opacity-30" />
                              <p className="text-sm">Upload an image to preview</p>
                            </div>
                          )}
                        </div>

                        {config.position === "custom" && originalImage && (
                          <p className="text-xs text-muted-foreground text-center mt-2">
                            <Move className="h-3 w-3 inline mr-1" />
                            Drag to position - Ctrl+Scroll to zoom - Arrow keys for precision
                          </p>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Export Tab */}
                  <TabsContent value="export" className="p-6 m-0">
                    <div className="max-w-md mx-auto space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Export Format</Label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { value: "png", label: "PNG", desc: "Lossless" },
                              { value: "jpg", label: "JPG", desc: "Smaller" },
                              { value: "webp", label: "WebP", desc: "Modern" },
                            ].map((format) => (
                              <Button
                                key={format.value}
                                variant={exportFormat === format.value ? "default" : "outline"}
                                className="flex flex-col h-16"
                                onClick={() => setExportFormat(format.value as ExportFormat)}
                              >
                                <span className="font-medium">{format.label}</span>
                                <span className="text-xs opacity-70">{format.desc}</span>
                              </Button>
                            ))}
                          </div>
                        </div>

                        {exportFormat !== "png" && (
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <Label>Quality</Label>
                              <span className="text-sm text-muted-foreground">{exportQuality}%</span>
                            </div>
                            <Slider
                              value={[exportQuality]}
                              onValueChange={([v]) => setExportQuality(v)}
                              min={10}
                              max={100}
                              step={5}
                            />
                          </div>
                        )}

                        {images.length > 1 && (
                          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                              <Package className="h-4 w-4 inline mr-2" />
                              Batch mode: {images.length} images will be downloaded as ZIP
                            </p>
                          </div>
                        )}
                      </div>

                      <Button
                        size="lg"
                        className="w-full"
                        onClick={handleDownload}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Download {images.length > 1 ? `${images.length} Images` : "Image"}
                          </>
                        )}
                      </Button>

                      {isProcessing && images.length > 1 && (
                        <Progress value={batchProgress} className="h-2" />
                      )}
                    </div>

                  </TabsContent>

                  {/* Batch Tab */}
                  <TabsContent value="batch" className="p-4 m-0">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium">
                        {images.length} Images Selected
                      </h3>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => batchInputRef.current?.click()}
                        >
                          <ImagePlus className="h-4 w-4 mr-2" />
                          Add More
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearImages}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Clear All
                        </Button>
                      </div>
                    </div>

                    <ScrollArea className="h-[300px]">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {images.map((img, index) => (
                          <div
                            key={img.id}
                            className={`relative group rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${index === currentImageIndex
                              ? "border-primary ring-2 ring-primary/20"
                              : "border-transparent hover:border-muted-foreground/30"
                              }`}
                            onClick={() => setCurrentImageIndex(index)}
                          >
                            <img
                              src={img.preview}
                              alt={img.name}
                              className="w-full h-24 object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Button
                                variant="destructive"
                                size="icon"
                                className="h-7 w-7"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeImage(img.id);
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-1 py-0.5 truncate">
                              {img.name}
                            </div>
                            {index === currentImageIndex && (
                              <div className="absolute top-1 left-1 bg-primary text-white rounded-full p-0.5">
                                <Check className="h-3 w-3" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </Card>

              {/* Features Section */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {[
                  { icon: Type, title: "Text & Logo", desc: "Custom fonts & effects" },
                  { icon: Package, title: "Batch Process", desc: "Multiple images at once" },
                  { icon: Move, title: "Drag & Drop", desc: "Precise positioning" },
                  { icon: Star, title: "Save Presets", desc: "Reuse configurations" },
                ].map((feature) => (
                  <Card key={feature.title} className="p-4">
                    <feature.icon className="h-8 w-8 mb-2 text-primary" />
                    <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground">{feature.desc}</p>
                  </Card>
                ))}
              </div>

              {/* SEO Content */}
              <Card className="mt-6 p-6">
                <h2 className="text-xl font-bold mb-4">Professional Online Watermark Tool</h2>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <p>
                    Protect your images with our advanced watermark tool. Add text, logos, or shapes with full customization including fonts, colors, shadows, and positioning. Perfect for photographers, businesses, and content creators.
                  </p>
                  <h3>Key Features</h3>
                  <ul>
                    <li><strong>Text Watermarks:</strong> Multiple fonts, shadows, outlines, and backgrounds</li>
                    <li><strong>Logo Watermarks:</strong> Upload and position your brand logo</li>
                    <li><strong>Batch Processing:</strong> Watermark hundreds of images at once</li>
                    <li><strong>Drag & Drop:</strong> Position watermarks with precision</li>
                    <li><strong>Presets:</strong> Save and reuse your favorite configurations</li>
                    <li><strong>Export Options:</strong> PNG, JPG, WebP with quality control</li>
                  </ul>
                </div>
              </Card>

              {/* Related Tools */}
              <div className="mt-6">
                <h3 className="font-semibold mb-4">Related Tools</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { name: "Background Remover", path: "/tools/background-remover" },
                    { name: "Image Resizer", path: "/tools/image-resizer" },
                    { name: "Advanced Image Compressor", path: "/tools/advanced-image-compressor" },
                    { name: "Image Compressor", path: "/tools/advanced-image-compressor" },
                  ].map((tool) => (
                    <Link
                      key={tool.path}
                      to={tool.path}
                      className="block p-3 bg-muted/50 rounded-lg hover:bg-primary/5 transition-colors text-sm font-medium text-center"
                    >
                      {tool.name}
                    </Link>
                  ))}
                </div>
                {/* Hidden processing canvases - kept outside tabs to stay mounted */}
                <div className="hidden">
                  <canvas ref={canvasRef} />
                  {showComparison && <canvas ref={comparisonCanvasRef} />}
                </div>
              </div>
            </main>

            {/* Right Sidebar Ads */}
            <aside className="hidden xl:flex flex-col gap-6 w-[150px] flex-shrink-0">
              <div className="sticky top-4 space-y-6">
                <SidebarAd slot={AD_SLOTS.rightSidebar1} position="right" index={1} width={150} height={600} />
                <SidebarAd slot={AD_SLOTS.rightSidebar2} position="right" index={2} width={150} height={600} />
              </div>
            </aside>
          </div>
          
          {/* Related Articles & Guides — internal link for SEO */}
          <section className="mt-12 mb-8 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold mb-4 text-foreground">Related Articles & Guides</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <RouterLink
                to="/blog/free-online-watermark-tool"
                className="p-4 border border-border/60 rounded-lg bg-card/80 shadow-sm hover:shadow-card-hover transition-shadow no-underline block"
              >
                <span className="text-primary font-semibold hover:underline text-lg block">
                  Free Online Watermark Tool: Protect Your Photos
                </span>
                <p className="text-muted-foreground mt-2 text-sm">
                  Add text or image watermarks to protect your photos from theft. Best free online watermark maker.
                </p>
              </RouterLink>
            </div>
          </section>
        </div>
      </div>

      {/* Keyboard Shortcuts Dialog */}
      <Dialog open={showShortcuts} onOpenChange={setShowShortcuts}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              Keyboard Shortcuts
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {SHORTCUTS.map((shortcut) => (
              <div
                key={shortcut.key}
                className="flex justify-between items-center py-2 border-b last:border-0"
              >
                <span className="text-sm">{shortcut.action}</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Ad Watch Modal */}
      <AdWatchModal
        isOpen={showAdModal}
        onClose={() => setShowAdModal(false)}
        onAdComplete={() => {
          setCanDownload(true);
          setShowAdModal(false);
          if (images.length > 1) {
            downloadBatch();
          } else {
            downloadSingle();
          }
        }}
        title="Watch ad to download"
        description="Please watch this short ad to download your watermarked image."
      />
    </>
  );
};

export default WatermarkTool;
