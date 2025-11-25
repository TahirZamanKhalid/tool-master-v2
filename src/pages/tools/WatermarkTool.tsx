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
  Save,
  FolderOpen,
  Trash2,
  Copy,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid3x3,
  Layers,
  FileImage,
  Package,
  Undo,
  Redo,
  Eye,
  EyeOff,
  Star,
  ImagePlus,
} from "lucide-react";
import { AdWatchModal } from "@/components/AdWatchModal";
import { SEOHead } from "@/components/SEOHead";
import { LazyAdSpace } from "@/components/LazyAdSpace";
import JSZip from "jszip";

type WatermarkType = "text" | "image" | "qrcode";
type Position = "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center" | "tiled" | "custom";
type ExportFormat = "png" | "jpg" | "webp";
type TextAlign = "left" | "center" | "right";

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
  textShadow: boolean;
  textShadowColor: string;
  textShadowBlur: number;
  textOutline: boolean;
  outlineColor: string;
  outlineWidth: number;
  background: boolean;
  backgroundColor: string;
  backgroundPadding: number;
  textAlign: TextAlign;
  multiline: boolean;
  scaleWithImage: boolean;
  tileSpacingX: number;
  tileSpacingY: number;
}

interface Preset {
  id: string;
  name: string;
  config: WatermarkConfig;
}

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  processed: boolean;
}

const DEFAULT_CONFIG: WatermarkConfig = {
  type: "text",
  text: "© Your Brand",
  position: "bottom-right",
  customX: 50,
  customY: 50,
  opacity: 70,
  fontSize: 48,
  watermarkSize: 100,
  rotation: 0,
  color: "#ffffff",
  fontFamily: "Arial",
  textShadow: false,
  textShadowColor: "#000000",
  textShadowBlur: 4,
  textOutline: false,
  outlineColor: "#000000",
  outlineWidth: 2,
  background: false,
  backgroundColor: "#000000",
  backgroundPadding: 10,
  textAlign: "center",
  multiline: false,
  scaleWithImage: true,
  tileSpacingX: 100,
  tileSpacingY: 100,
};

const PRESET_TEMPLATES: Preset[] = [
  {
    id: "photographer",
    name: "Photographer",
    config: {
      ...DEFAULT_CONFIG,
      text: "© Photo by You",
      position: "bottom-right",
      opacity: 40,
      fontSize: 36,
      color: "#ffffff",
      textShadow: true,
      textShadowColor: "#000000",
      textShadowBlur: 6,
    },
  },
  {
    id: "business",
    name: "Business",
    config: {
      ...DEFAULT_CONFIG,
      text: "Your Company™",
      position: "bottom-right",
      opacity: 60,
      fontSize: 42,
      color: "#ffffff",
      background: true,
      backgroundColor: "#000000",
      backgroundPadding: 15,
    },
  },
  {
    id: "subtle",
    name: "Subtle",
    config: {
      ...DEFAULT_CONFIG,
      text: "©",
      position: "bottom-right",
      opacity: 25,
      fontSize: 28,
      color: "#ffffff",
    },
  },
  {
    id: "bold",
    name: "Bold",
    config: {
      ...DEFAULT_CONFIG,
      text: "CONFIDENTIAL",
      position: "center",
      opacity: 30,
      fontSize: 72,
      color: "#ff0000",
      rotation: -45,
    },
  },
  {
    id: "tiled-security",
    name: "Tiled Security",
    config: {
      ...DEFAULT_CONFIG,
      text: "©",
      position: "tiled",
      opacity: 15,
      fontSize: 48,
      color: "#ffffff",
      rotation: -45,
      tileSpacingX: 150,
      tileSpacingY: 150,
    },
  },
];

const WatermarkTool = () => {
  // Image management
  const [images, setImages] = useState<ImageFile[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [watermarkImage, setWatermarkImage] = useState<HTMLImageElement | null>(null);

  // Watermark configuration
  const [config, setConfig] = useState<WatermarkConfig>(DEFAULT_CONFIG);

  // UI states
  const [showAdModal, setShowAdModal] = useState(false);
  const [canDownload, setCanDownload] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);

  // Preview states
  const [zoom, setZoom] = useState(0.3);
  const [showGrid, setShowGrid] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonSlider, setComparisonSlider] = useState(50);
  const [fullScreen, setFullScreen] = useState(false);

  // Export options
  const [exportFormat, setExportFormat] = useState<ExportFormat>("png");
  const [exportQuality, setExportQuality] = useState([95]);
  const [maintainDimensions, setMaintainDimensions] = useState(true);
  const [removeExif, setRemoveExif] = useState(false);

  // Presets
  const [presets, setPresets] = useState<Preset[]>([...PRESET_TEMPLATES]);
  const [showPresetDialog, setShowPresetDialog] = useState(false);
  const [presetName, setPresetName] = useState("");

  // Drag and drop
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [watermarkBounds, setWatermarkBounds] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [resizeHandle, setResizeHandle] = useState<string>("");

  // History
  const [history, setHistory] = useState<WatermarkConfig[]>([DEFAULT_CONFIG]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Collapsible states
  const [openSections, setOpenSections] = useState({
    watermarkType: true,
    textEffects: false,
    position: false,
    appearance: false,
    rotation: false,
    advanced: false,
    export: false,
    batch: false,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const comparisonCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const watermarkInputRef = useRef<HTMLInputElement>(null);
  const batchInputRef = useRef<HTMLInputElement>(null);

  // Update config with history
  const updateConfig = (newConfig: Partial<WatermarkConfig>) => {
    const updated = { ...config, ...newConfig };
    setConfig(updated);
    
    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(updated);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Undo/Redo
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setConfig(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setConfig(history[historyIndex + 1]);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z") {
          e.preventDefault();
          undo();
        } else if (e.key === "y") {
          e.preventDefault();
          redo();
        } else if (e.key === "s") {
          e.preventDefault();
          handleDownload();
        }
      }
      
      // Arrow keys for fine positioning
      if (config.position === "custom" && originalImage) {
        let moved = false;
        const step = e.shiftKey ? 10 : 1;
        
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
      // Only zoom if Ctrl key is pressed
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        
        // Zoom in/out based on wheel direction
        const zoomDelta = e.deltaY > 0 ? -0.1 : 0.1;
        const newZoom = Math.max(0.1, Math.min(5, zoom + zoomDelta));
        setZoom(newZoom);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("wheel", handleWheel, { passive: false });
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("wheel", handleWheel);
    };
  }, [config, historyIndex, originalImage, zoom]);

  useEffect(() => {
    if (originalImage) {
      drawWatermarkedImage();
    }
  }, [
    originalImage,
    watermarkImage,
    config,
    zoom,
    showGrid,
    showComparison,
    comparisonSlider,
  ]);

  // Load current image
  useEffect(() => {
    if (images.length > 0 && images[currentImageIndex]) {
      const img = new Image();
      img.onload = () => {
        setOriginalImage(img);
      };
      img.src = images[currentImageIndex].preview;
    }
  }, [currentImageIndex, images]);

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
        const newImage: ImageFile = {
          id: Date.now().toString(),
          file,
          preview: event.target?.result as string,
          processed: false,
        };
        setImages([newImage]);
        setCurrentImageIndex(0);
        setOriginalImage(img);
        toast.success("Image loaded!");
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleBatchUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      toast.error("No valid image files found");
      return;
    }

    const newImages: ImageFile[] = [];
    let loaded = 0;

    imageFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        newImages.push({
          id: `${Date.now()}-${Math.random()}`,
          file,
          preview: event.target?.result as string,
          processed: false,
        });
        loaded++;

        if (loaded === imageFiles.length) {
          setImages(newImages);
          setCurrentImageIndex(0);
          toast.success(`${imageFiles.length} images loaded!`);
        }
      };
      reader.readAsDataURL(file);
    });
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

    // Draw original image
    ctx.drawImage(originalImage, 0, 0);

    // Draw comparison if enabled
    if (showComparison && comparisonCanvasRef.current) {
      const compCanvas = comparisonCanvasRef.current;
      const compCtx = compCanvas.getContext("2d");
      if (compCtx) {
        compCanvas.width = originalImage.width;
        compCanvas.height = originalImage.height;
        compCtx.drawImage(originalImage, 0, 0);
      }
    }

    // Save context for watermark
    ctx.save();
    ctx.globalAlpha = config.opacity / 100;

    if (config.type === "text") {
      drawTextWatermark(ctx, canvas.width, canvas.height);
    } else if (config.type === "image" && watermarkImage) {
      drawImageWatermark(ctx, canvas.width, canvas.height);
    } else if (config.type === "qrcode") {
      drawQRCodeWatermark(ctx, canvas.width, canvas.height);
    }

    ctx.restore();

    // Draw grid if enabled
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
        previewCtx.drawImage(canvas, 0, 0, previewCanvas.width, previewCanvas.height);
      }
    }
  };

  const drawTextWatermark = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Scale font size if needed
    const fontSize = config.scaleWithImage 
      ? (config.fontSize * Math.min(width, height)) / 1000 
      : config.fontSize;

    ctx.font = `${fontSize}px ${config.fontFamily}`;
    ctx.textAlign = config.textAlign;
    ctx.textBaseline = "middle";

    const lines = config.multiline ? config.text.split("\n") : [config.text];
    const lineHeight = fontSize * 1.2;

    lines.forEach((line, index) => {
      const text = line || "Watermark";
      const textWidth = ctx.measureText(text).width;
      const textHeight = fontSize;

      if (config.position === "tiled") {
        for (let y = 0; y < height + config.tileSpacingY; y += lineHeight + config.tileSpacingY) {
          for (let x = 0; x < width + config.tileSpacingX; x += textWidth + config.tileSpacingX) {
            drawSingleText(ctx, text, x, y + index * lineHeight, textWidth, textHeight);
          }
        }
      } else {
        const pos = getPosition(width, height, textWidth, textHeight * lines.length);
        drawSingleText(ctx, text, pos.x, pos.y + index * lineHeight, textWidth, textHeight);
      }
    });
  };

  const drawSingleText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    ctx.save();
    ctx.translate(x + width / 2, y + height / 2);
    ctx.rotate((config.rotation * Math.PI) / 180);

    // Draw background
    if (config.background) {
      ctx.fillStyle = config.backgroundColor;
      ctx.globalAlpha = (config.opacity / 100) * 0.8;
      const padding = config.backgroundPadding;
      ctx.fillRect(
        -width / 2 - padding,
        -height / 2 - padding,
        width + padding * 2,
        height + padding * 2
      );
      ctx.globalAlpha = config.opacity / 100;
    }

    // Draw text shadow
    if (config.textShadow) {
      ctx.shadowColor = config.textShadowColor;
      ctx.shadowBlur = config.textShadowBlur;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
    }

    // Draw text outline
    if (config.textOutline) {
      ctx.strokeStyle = config.outlineColor;
      ctx.lineWidth = config.outlineWidth;
      ctx.strokeText(text, -width / 2, 0);
    }

    // Draw text
    ctx.fillStyle = config.color;
    ctx.fillText(text, -width / 2, 0);

    ctx.restore();
  };

  const drawImageWatermark = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!watermarkImage) return;

    const scale = config.scaleWithImage
      ? (config.watermarkSize / 100) * Math.min(width, height) / Math.max(watermarkImage.width, watermarkImage.height)
      : config.watermarkSize / 100;

    const wmWidth = watermarkImage.width * scale;
    const wmHeight = watermarkImage.height * scale;

    if (config.position === "tiled") {
      for (let y = 0; y < height + config.tileSpacingY; y += wmHeight + config.tileSpacingY) {
        for (let x = 0; x < width + config.tileSpacingX; x += wmWidth + config.tileSpacingX) {
          drawSingleImage(ctx, x, y, wmWidth, wmHeight);
        }
      }
    } else {
      const pos = getPosition(width, height, wmWidth, wmHeight);
      drawSingleImage(ctx, pos.x, pos.y, wmWidth, wmHeight);
    }
  };

  const drawSingleImage = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) => {
    if (!watermarkImage) return;

    ctx.save();
    ctx.translate(x + width / 2, y + height / 2);
    ctx.rotate((config.rotation * Math.PI) / 180);
    ctx.drawImage(watermarkImage, -width / 2, -height / 2, width, height);
    ctx.restore();
  };

  const drawQRCodeWatermark = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // This would require a QR code library like qrcode
    // For now, we'll draw a placeholder
    const size = config.watermarkSize;
    const pos = getPosition(width, height, size, size);

    ctx.save();
    ctx.translate(pos.x + size / 2, pos.y + size / 2);
    ctx.rotate((config.rotation * Math.PI) / 180);

    ctx.fillStyle = config.color;
    ctx.fillRect(-size / 2, -size / 2, size, size);

    ctx.fillStyle = config.backgroundColor;
    ctx.font = `${size / 4}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("QR", 0, 0);

    ctx.restore();
  };

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 1;

    // Draw vertical lines
    for (let x = 0; x <= width; x += width / 3) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = 0; y <= height; y += height / 3) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.restore();
  };

  const getPosition = (canvasWidth: number, canvasHeight: number, watermarkWidth: number, watermarkHeight: number) => {
    const padding = 20;

    switch (config.position) {
      case "top-left":
        return { x: padding, y: padding };
      case "top-right":
        return { x: canvasWidth - watermarkWidth - padding, y: padding };
      case "bottom-left":
        return { x: padding, y: canvasHeight - watermarkHeight - padding };
      case "bottom-right":
        return {
          x: canvasWidth - watermarkWidth - padding,
          y: canvasHeight - watermarkHeight - padding,
        };
      case "center":
        return {
          x: (canvasWidth - watermarkWidth) / 2,
          y: (canvasHeight - watermarkHeight) / 2,
        };
      case "custom":
        return {
          x: (config.customX / 100) * canvasWidth,
          y: (config.customY / 100) * canvasHeight,
        };
      default:
        return { x: padding, y: padding };
    }
  };

  // Canvas interaction handlers
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!originalImage || config.position !== "custom") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    setIsDragging(true);
    setDragStart({ x, y });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !originalImage) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    const deltaX = x - dragStart.x;
    const deltaY = y - dragStart.y;

    const newX = Math.max(0, Math.min(100, config.customX + (deltaX / canvas.width) * 100));
    const newY = Math.max(0, Math.min(100, config.customY + (deltaY / canvas.height) * 100));

    updateConfig({ customX: newX, customY: newY });
    setDragStart({ x, y });
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setIsRotating(false);
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

    if (images.length > 1) {
      handleBatchDownload();
    } else {
      downloadSingleImage();
    }
  };

  const downloadSingleImage = () => {
    if (!canvasRef.current) return;

    setIsProcessing(true);
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const mimeType = exportFormat === "jpg" ? "image/jpeg" : `image/${exportFormat}`;
      const quality = exportFormat === "png" ? undefined : exportQuality[0] / 100;

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

  const handleBatchDownload = async () => {
    if (images.length === 0) return;

    setIsBatchProcessing(true);
    const zip = new JSZip();
    const folder = zip.folder("watermarked-images");

    for (let i = 0; i < images.length; i++) {
      const imageFile = images[i];
      
      // Load image
      const img = new Image();
      await new Promise((resolve) => {
        img.onload = resolve;
        img.src = imageFile.preview;
      });

      // Create temporary canvas
      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");
      if (!tempCtx) continue;

      tempCanvas.width = img.width;
      tempCanvas.height = img.height;

      // Draw watermarked image
      tempCtx.drawImage(img, 0, 0);
      tempCtx.save();
      tempCtx.globalAlpha = config.opacity / 100;

      if (config.type === "text") {
        drawTextWatermark(tempCtx, tempCanvas.width, tempCanvas.height);
      } else if (config.type === "image" && watermarkImage) {
        drawImageWatermark(tempCtx, tempCanvas.width, tempCanvas.height);
      }

      tempCtx.restore();

      // Get blob
      const blob = await new Promise<Blob>((resolve) => {
        const mimeType = exportFormat === "jpg" ? "image/jpeg" : `image/${exportFormat}`;
        const quality = exportFormat === "png" ? undefined : exportQuality[0] / 100;
        
        tempCanvas.toBlob(
          (b) => resolve(b!),
          mimeType,
          quality
        );
      });

      // Add to zip
      const filename = `watermarked-${i + 1}.${exportFormat}`;
      folder?.file(filename, blob);

      // Update progress
      const processed = i + 1;
      toast.loading(`Processing ${processed}/${images.length}...`, { id: "batch" });
    }

    // Generate and download zip
    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const link = document.createElement("a");
    link.href = url;
    link.download = `watermarked-batch-${Date.now()}.zip`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success(`${images.length} images processed!`, { id: "batch" });
    setIsBatchProcessing(false);
  };

  const savePreset = () => {
    if (!presetName.trim()) {
      toast.error("Please enter a preset name");
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

  const loadPreset = (preset: Preset) => {
    setConfig(preset.config);
    toast.success(`Loaded preset: ${preset.name}`);
  };

  const deletePreset = (id: string) => {
    setPresets(presets.filter((p) => p.id !== id));
    toast.success("Preset deleted");
  };

  const copySettings = () => {
    const settings = JSON.stringify(config, null, 2);
    navigator.clipboard.writeText(settings);
    toast.success("Settings copied to clipboard!");
  };

  const resetSettings = () => {
    setConfig(DEFAULT_CONFIG);
    toast.success("Settings reset!");
  };

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <>
      <SEOHead
        title="Free Online Watermark Tool - Add Watermarks to Images | ToolMaster.cloud"
        description="Professional watermark tool to protect your images. Add text or logo watermarks, batch process multiple images, drag & drop positioning, custom presets, and export in PNG/JPG/WebP. Free online watermarking software."
        keywords="watermark tool, add watermark to image, image watermark, photo watermark, bulk watermark, batch watermark images, watermark maker, online watermark tool, free watermark software, logo watermark, text watermark, protect images, copyright images, image protection, watermark generator, custom watermark, transparent watermark, watermark app, watermark creator, add logo to photo, brand protection, image security, batch image processing, watermark multiple images, professional watermark, photography watermark"
        canonical="https://toolmaster.cloud/tools/watermark"
        ogImage="https://toolmaster.cloud/og-watermark-tool.jpg"
      />

      <ToolLayout
        title="Advanced Watermark Tool"
        description="Add professional watermarks to protect your images. Supports text, logo, batch processing, and custom positioning."
        category="Image Tools"
      >
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
          {/* Top Leaderboard Ad */}
          <div className="lg:col-span-2 min-h-[100px]">
            <ins 
              className="adsbygoogle"
              style={{ display: "inline-block", width: "800px", height: "200px" }}
              data-ad-client="ca-pub-7382531001943020"
              data-ad-slot="4838473293"
            />
          </div>

          {/* Left Column - Controls */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4 space-y-4">
                {/* Upload Section */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Image Upload</Label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <input
                    type="file"
                    ref={batchInputRef}
                    onChange={handleBatchUpload}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      className="w-full"
                      size="sm"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {originalImage ? "Change" : "Upload"}
                    </Button>
                    <Button
                      onClick={() => batchInputRef.current?.click()}
                      variant="outline"
                      className="w-full"
                      size="sm"
                    >
                      <Package className="w-4 h-4 mr-2" />
                      Batch
                    </Button>
                  </div>
                  {images.length > 1 && (
                    <div className="text-xs text-muted-foreground text-center">
                      {images.length} images loaded • Image {currentImageIndex + 1}/{images.length}
                    </div>
                  )}
                </div>

                {originalImage && (
                  <>
                    {/* Quick Actions */}
                    <div className="flex gap-2">
                      <Button
                        onClick={undo}
                        variant="ghost"
                        size="sm"
                        disabled={historyIndex === 0}
                        title="Undo (Ctrl+Z)"
                      >
                        <Undo className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={redo}
                        variant="ghost"
                        size="sm"
                        disabled={historyIndex === history.length - 1}
                        title="Redo (Ctrl+Y)"
                      >
                        <Redo className="w-4 h-4" />
                      </Button>
                      <Button onClick={copySettings} variant="ghost" size="sm" title="Copy Settings">
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button onClick={resetSettings} variant="ghost" size="sm" title="Reset">
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Presets */}
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <Button variant="outline" className="w-full justify-between" size="sm">
                          <span className="flex items-center gap-2">
                            <Star className="w-4 h-4" />
                            Presets
                          </span>
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          {presets.map((preset) => (
                            <div key={preset.id} className="flex gap-1">
                              <Button
                                onClick={() => loadPreset(preset)}
                                variant="outline"
                                size="sm"
                                className="flex-1 text-xs"
                              >
                                {preset.name}
                              </Button>
                              {!PRESET_TEMPLATES.find((p) => p.id === preset.id) && (
                                <Button
                                  onClick={() => deletePreset(preset.id)}
                                  variant="ghost"
                                  size="sm"
                                  className="px-2"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            value={presetName}
                            onChange={(e) => setPresetName(e.target.value)}
                            placeholder="Preset name"
                            className="h-8 text-sm"
                          />
                          <Button onClick={savePreset} size="sm" className="whitespace-nowrap">
                            <Save className="w-4 h-4 mr-1" />
                            Save
                          </Button>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    <Tabs defaultValue="watermark" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="watermark">Watermark</TabsTrigger>
                        <TabsTrigger value="position">Position</TabsTrigger>
                        <TabsTrigger value="export">Export</TabsTrigger>
                      </TabsList>

                      <TabsContent value="watermark" className="space-y-3 mt-4">
                        {/* Watermark Type */}
                        <div className="space-y-2">
                          <Label className="text-sm">Type</Label>
                          <Select
                            value={config.type}
                            onValueChange={(v) => {
                              if (v && (v === "text" || v === "image" || v === "qrcode")) {
                                updateConfig({ type: v as WatermarkType });
                              }
                            }}
                          >
                            <SelectTrigger className="h-8 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="image">Image/Logo</SelectItem>
                              <SelectItem value="qrcode">QR Code</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {config.type === "text" && (
                          <>
                            <div className="space-y-2">
                              <Label className="text-sm">Text</Label>
                              <div className="space-y-2">
                                <Input
                                  value={config.text}
                                  onChange={(e) => updateConfig({ text: e.target.value })}
                                  placeholder="© Your Brand"
                                  className="h-8 text-sm"
                                />
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    id="multiline"
                                    checked={config.multiline}
                                    onChange={(e) => updateConfig({ multiline: e.target.checked })}
                                    className="rounded"
                                  />
                                  <Label htmlFor="multiline" className="text-xs cursor-pointer">
                                    Multi-line
                                  </Label>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm">Font Size: {config.fontSize}px</Label>
                              <Slider
                                value={[config.fontSize]}
                                onValueChange={(v) => updateConfig({ fontSize: v[0] })}
                                min={12}
                                max={200}
                                step={1}
                                className="w-full"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm">Font Family</Label>
                              <Select
                                value={config.fontFamily}
                                onValueChange={(v) => {
                                  if (v) updateConfig({ fontFamily: v });
                                }}
                              >
                                <SelectTrigger className="h-8 text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Arial">Arial</SelectItem>
                                  <SelectItem value="Georgia">Georgia</SelectItem>
                                  <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                                  <SelectItem value="Courier New">Courier New</SelectItem>
                                  <SelectItem value="Verdana">Verdana</SelectItem>
                                  <SelectItem value="Impact">Impact</SelectItem>
                                  <SelectItem value="Comic Sans MS">Comic Sans MS</SelectItem>
                                  <SelectItem value="Trebuchet MS">Trebuchet MS</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm">Text Align</Label>
                              <Select
                                value={config.textAlign}
                                onValueChange={(v) => {
                                  if (v && (v === "left" || v === "center" || v === "right")) {
                                    updateConfig({ textAlign: v as TextAlign });
                                  }
                                }}
                              >
                                <SelectTrigger className="h-8 text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="left">Left</SelectItem>
                                  <SelectItem value="center">Center</SelectItem>
                                  <SelectItem value="right">Right</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm">Color</Label>
                              <div className="flex gap-2">
                                <input
                                  type="color"
                                  value={config.color}
                                  onChange={(e) => updateConfig({ color: e.target.value })}
                                  className="w-16 h-8 rounded cursor-pointer"
                                />
                                <Input
                                  value={config.color}
                                  onChange={(e) => updateConfig({ color: e.target.value })}
                                  placeholder="#ffffff"
                                  className="flex-1 h-8 text-sm"
                                />
                              </div>
                            </div>

                            {/* Text Effects */}
                            <Collapsible
                              open={openSections.textEffects}
                              onOpenChange={() => toggleSection("textEffects")}
                            >
                              <CollapsibleTrigger asChild>
                                <Button variant="outline" className="w-full justify-between" size="sm">
                                  <span className="flex items-center gap-2">
                                    <Palette className="w-4 h-4" />
                                    Text Effects
                                  </span>
                                  <ChevronDown
                                    className={`w-4 h-4 transition-transform ${
                                      openSections.textEffects ? "rotate-180" : ""
                                    }`}
                                  />
                                </Button>
                              </CollapsibleTrigger>
                              <CollapsibleContent className="mt-2 space-y-3">
                                {/* Text Shadow */}
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      id="textShadow"
                                      checked={config.textShadow}
                                      onChange={(e) => updateConfig({ textShadow: e.target.checked })}
                                      className="rounded"
                                    />
                                    <Label htmlFor="textShadow" className="text-xs cursor-pointer">
                                      Text Shadow
                                    </Label>
                                  </div>
                                  {config.textShadow && (
                                    <div className="space-y-2 pl-4">
                                      <div className="flex gap-2">
                                        <input
                                          type="color"
                                          value={config.textShadowColor}
                                          onChange={(e) => updateConfig({ textShadowColor: e.target.value })}
                                          className="w-12 h-7 rounded cursor-pointer"
                                        />
                                        <Input
                                          value={config.textShadowColor}
                                          onChange={(e) => updateConfig({ textShadowColor: e.target.value })}
                                          className="flex-1 h-7 text-xs"
                                        />
                                      </div>
                                      <div>
                                        <Label className="text-xs">Blur: {config.textShadowBlur}px</Label>
                                        <Slider
                                          value={[config.textShadowBlur]}
                                          onValueChange={(v) => updateConfig({ textShadowBlur: v[0] })}
                                          min={0}
                                          max={20}
                                          step={1}
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Text Outline */}
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      id="textOutline"
                                      checked={config.textOutline}
                                      onChange={(e) => updateConfig({ textOutline: e.target.checked })}
                                      className="rounded"
                                    />
                                    <Label htmlFor="textOutline" className="text-xs cursor-pointer">
                                      Text Outline
                                    </Label>
                                  </div>
                                  {config.textOutline && (
                                    <div className="space-y-2 pl-4">
                                      <div className="flex gap-2">
                                        <input
                                          type="color"
                                          value={config.outlineColor}
                                          onChange={(e) => updateConfig({ outlineColor: e.target.value })}
                                          className="w-12 h-7 rounded cursor-pointer"
                                        />
                                        <Input
                                          value={config.outlineColor}
                                          onChange={(e) => updateConfig({ outlineColor: e.target.value })}
                                          className="flex-1 h-7 text-xs"
                                        />
                                      </div>
                                      <div>
                                        <Label className="text-xs">Width: {config.outlineWidth}px</Label>
                                        <Slider
                                          value={[config.outlineWidth]}
                                          onValueChange={(v) => updateConfig({ outlineWidth: v[0] })}
                                          min={1}
                                          max={10}
                                          step={1}
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Background */}
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      id="background"
                                      checked={config.background}
                                      onChange={(e) => updateConfig({ background: e.target.checked })}
                                      className="rounded"
                                    />
                                    <Label htmlFor="background" className="text-xs cursor-pointer">
                                      Background
                                    </Label>
                                  </div>
                                  {config.background && (
                                    <div className="space-y-2 pl-4">
                                      <div className="flex gap-2">
                                        <input
                                          type="color"
                                          value={config.backgroundColor}
                                          onChange={(e) => updateConfig({ backgroundColor: e.target.value })}
                                          className="w-12 h-7 rounded cursor-pointer"
                                        />
                                        <Input
                                          value={config.backgroundColor}
                                          onChange={(e) => updateConfig({ backgroundColor: e.target.value })}
                                          className="flex-1 h-7 text-xs"
                                        />
                                      </div>
                                      <div>
                                        <Label className="text-xs">Padding: {config.backgroundPadding}px</Label>
                                        <Slider
                                          value={[config.backgroundPadding]}
                                          onValueChange={(v) => updateConfig({ backgroundPadding: v[0] })}
                                          min={0}
                                          max={50}
                                          step={1}
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          </>
                        )}

                        {config.type === "image" && (
                          <>
                            <div className="space-y-2">
                              <Label className="text-sm">Watermark Image</Label>
                              <input
                                type="file"
                                ref={watermarkInputRef}
                                onChange={handleWatermarkImageUpload}
                                accept="image/*"
                                className="hidden"
                              />
                              <Button
                                onClick={() => watermarkInputRef.current?.click()}
                                variant="outline"
                                className="w-full h-8"
                                size="sm"
                              >
                                <ImagePlus className="w-4 h-4 mr-2" />
                                {watermarkImage ? "Change Image" : "Upload Image"}
                              </Button>
                              {watermarkImage && (
                                <div className="relative w-full h-20 bg-muted rounded overflow-hidden">
                                  <img
                                    src={watermarkImage.src}
                                    alt="Watermark"
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm">Size: {config.watermarkSize}%</Label>
                              <Slider
                                value={[config.watermarkSize]}
                                onValueChange={(v) => updateConfig({ watermarkSize: v[0] })}
                                min={10}
                                max={200}
                                step={1}
                                className="w-full"
                              />
                            </div>
                          </>
                        )}

                        {config.type === "qrcode" && (
                          <>
                            <div className="space-y-2">
                              <Label className="text-sm">QR Code URL</Label>
                              <Input
                                value={config.text}
                                onChange={(e) => updateConfig({ text: e.target.value })}
                                placeholder="https://toolmaster.cloud"
                                className="h-8 text-sm"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm">Size: {config.watermarkSize}px</Label>
                              <Slider
                                value={[config.watermarkSize]}
                                onValueChange={(v) => updateConfig({ watermarkSize: v[0] })}
                                min={50}
                                max={300}
                                step={1}
                                className="w-full"
                              />
                            </div>
                          </>
                        )}

                        {/* Opacity */}
                        <div className="space-y-2">
                          <Label className="text-sm">Opacity: {config.opacity}%</Label>
                          <Slider
                            value={[config.opacity]}
                            onValueChange={(v) => updateConfig({ opacity: v[0] })}
                            min={0}
                            max={100}
                            step={1}
                            className="w-full"
                          />
                        </div>

                        {/* Rotation */}
                        <div className="space-y-2">
                          <Label className="text-sm">Rotation: {config.rotation}°</Label>
                          <Slider
                            value={[config.rotation]}
                            onValueChange={(v) => updateConfig({ rotation: v[0] })}
                            min={-180}
                            max={180}
                            step={1}
                            className="w-full"
                          />
                        </div>

                        {/* Scale with Image */}
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="scaleWithImage"
                            checked={config.scaleWithImage}
                            onChange={(e) => updateConfig({ scaleWithImage: e.target.checked })}
                            className="rounded"
                          />
                          <Label htmlFor="scaleWithImage" className="text-xs cursor-pointer">
                            Scale with image size
                          </Label>
                        </div>
                      </TabsContent>

                      <TabsContent value="position" className="space-y-3 mt-4">
                        <div className="space-y-2">
                          <Label className="text-sm">Position</Label>
                          <Select
                            value={config.position}
                            onValueChange={(v) => {
                              if (v) updateConfig({ position: v as Position });
                            }}
                          >
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
                              <SelectItem value="custom">Custom (Drag)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {config.position === "custom" && (
                          <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                            <p className="text-xs text-muted-foreground">
                              Click and drag on the preview to position the watermark. Use arrow keys for fine
                              adjustment (Shift + Arrow for larger steps). Use Ctrl + Scroll to zoom.
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-xs">X: {config.customX.toFixed(1)}%</Label>
                                <Slider
                                  value={[config.customX]}
                                  onValueChange={(v) => updateConfig({ customX: v[0] })}
                                  min={0}
                                  max={100}
                                  step={0.1}
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Y: {config.customY.toFixed(1)}%</Label>
                                <Slider
                                  value={[config.customY]}
                                  onValueChange={(v) => updateConfig({ customY: v[0] })}
                                  min={0}
                                  max={100}
                                  step={0.1}
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {config.position === "tiled" && (
                          <>
                            <div className="space-y-2">
                              <Label className="text-sm">Horizontal Spacing: {config.tileSpacingX}px</Label>
                              <Slider
                                value={[config.tileSpacingX]}
                                onValueChange={(v) => updateConfig({ tileSpacingX: v[0] })}
                                min={0}
                                max={500}
                                step={10}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm">Vertical Spacing: {config.tileSpacingY}px</Label>
                              <Slider
                                value={[config.tileSpacingY]}
                                onValueChange={(v) => updateConfig({ tileSpacingY: v[0] })}
                                min={0}
                                max={500}
                                step={10}
                              />
                            </div>
                          </>
                        )}
                      </TabsContent>

                      <TabsContent value="export" className="space-y-3 mt-4">
                        <div className="space-y-2">
                          <Label className="text-sm">Format</Label>
                          <Select
                            value={exportFormat}
                            onValueChange={(v) => {
                              if (v && (v === "png" || v === "jpg" || v === "webp")) {
                                setExportFormat(v as ExportFormat);
                              }
                            }}
                          >
                            <SelectTrigger className="h-8 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="png">PNG (Lossless)</SelectItem>
                              <SelectItem value="jpg">JPG (Compressed)</SelectItem>
                              <SelectItem value="webp">WebP (Modern)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {(exportFormat === "jpg" || exportFormat === "webp") && (
                          <div className="space-y-2">
                            <Label className="text-sm">Quality: {exportQuality[0]}%</Label>
                            <Slider
                              value={exportQuality}
                              onValueChange={setExportQuality}
                              min={1}
                              max={100}
                              step={1}
                              className="w-full"
                            />
                          </div>
                        )}

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="maintainDimensions"
                              checked={maintainDimensions}
                              onChange={(e) => setMaintainDimensions(e.target.checked)}
                              className="rounded"
                            />
                            <Label htmlFor="maintainDimensions" className="text-xs cursor-pointer">
                              Maintain original dimensions
                            </Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="removeExif"
                              checked={removeExif}
                              onChange={(e) => setRemoveExif(e.target.checked)}
                              className="rounded"
                            />
                            <Label htmlFor="removeExif" className="text-xs cursor-pointer">
                              Remove EXIF data
                            </Label>
                          </div>
                        </div>

                        {images.length > 1 && (
                          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                            <p className="text-xs text-blue-600 dark:text-blue-400">
                              Batch mode: {images.length} images will be processed and downloaded as a ZIP file.
                            </p>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>

                    {/* Download Button */}
                    <Button
                      onClick={handleDownload}
                      className="w-full"
                      size="lg"
                      disabled={isProcessing || isBatchProcessing}
                    >
                      {isProcessing || isBatchProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Download {images.length > 1 ? `(${images.length} images)` : ""}
                        </>
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Best Practices */}
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold mb-2">💡 Pro Tips</h3>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <p>
                    <strong>Zoom Control:</strong> Hold Ctrl and scroll mouse wheel to zoom in/out. Default view is 30% for full image visibility.
                  </p>
                  <p>
                    <strong>Text Watermarks:</strong> Use 30-50% opacity for subtle protection. Add shadow
                    for better visibility on varied backgrounds.
                  </p>
                  <p>
                    <strong>Logo Watermarks:</strong> Upload PNG with transparency. Keep size 50-100% for
                    best results.
                  </p>
                  <p>
                    <strong>Tiled Pattern:</strong> Provides maximum protection but can be distracting. Use
                    lower opacity (15-25%).
                  </p>
                  <p>
                    <strong>Shortcuts:</strong> Ctrl+Z (Undo), Ctrl+Y (Redo), Ctrl+S (Download), Ctrl+Scroll (Zoom), Arrow keys (Move)
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Preview */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">Preview</h3>
                  <div className="flex gap-1">
                    <Button
                      onClick={() => setShowGrid(!showGrid)}
                      variant="ghost"
                      size="sm"
                      title="Toggle Grid"
                    >
                      <Grid3x3 className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => setShowComparison(!showComparison)}
                      variant="ghost"
                      size="sm"
                      title="Before/After"
                    >
                      {showComparison ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                    <Button
                      onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}
                      variant="ghost"
                      size="sm"
                      title="Zoom Out"
                      disabled={zoom <= 0.1}
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => setZoom(Math.min(5, zoom + 0.1))}
                      variant="ghost"
                      size="sm"
                      title="Zoom In"
                      disabled={zoom >= 5}
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => setFullScreen(!fullScreen)}
                      variant="ghost"
                      size="sm"
                      title="Fullscreen"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div
                  className={`relative bg-muted rounded overflow-auto ${
                    fullScreen ? "fixed inset-0 z-50 p-8 bg-background" : "min-h-[400px] max-h-[70vh]"
                  }`}
                >
                  {originalImage ? (
                    <>
                      {showComparison ? (
                        <div className="relative inline-block">
                          <div className="relative">
                            <canvas
                              ref={comparisonCanvasRef}
                              className="absolute top-0 left-0"
                              style={{
                                clipPath: `inset(0 ${100 - comparisonSlider}% 0 0)`,
                              }}
                            />
                            <canvas ref={previewCanvasRef} />
                            <div
                              className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize"
                              style={{ left: `${comparisonSlider}%` }}
                              onMouseDown={(e) => {
                                const parent = e.currentTarget.parentElement;
                                const handleMove = (e: MouseEvent) => {
                                  if (parent) {
                                    const rect = parent.getBoundingClientRect();
                                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                                    setComparisonSlider(Math.max(0, Math.min(100, x)));
                                  }
                                };
                                const handleUp = () => {
                                  document.removeEventListener("mousemove", handleMove);
                                  document.removeEventListener("mouseup", handleUp);
                                };
                                document.addEventListener("mousemove", handleMove);
                                document.addEventListener("mouseup", handleUp);
                              }}
                            >
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg">
                                <svg width="20" height="20" viewBox="0 0 20 20">
                                  <path d="M7 10L3 10M3 10L6 7M3 10L6 13M13 10L17 10M17 10L14 7M17 10L14 13" 
                                    stroke="currentColor" 
                                    strokeWidth="2" 
                                    fill="none"
                                  />
                                </svg>
                              </div>
                            </div>
                          </div>
                          <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                            Before
                          </div>
                          <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                            After
                          </div>
                        </div>
                      ) : (
                        <canvas
                          ref={previewCanvasRef}
                          className="inline-block cursor-move"
                          onMouseDown={handleCanvasMouseDown}
                          onMouseMove={handleCanvasMouseMove}
                          onMouseUp={handleCanvasMouseUp}
                          onMouseLeave={handleCanvasMouseUp}
                        />
                      )}
                      <canvas ref={canvasRef} className="hidden" />
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
                      <ImageIcon className="w-16 h-16 mb-4 opacity-20" />
                      <p className="text-sm">Upload an image to preview</p>
                      <p className="text-xs mt-2">Use Ctrl + Scroll to zoom</p>
                    </div>
                  )}
                </div>

                {originalImage && (
                  <div className="mt-2 text-xs text-muted-foreground text-center">
                    {originalImage.width} × {originalImage.height} • Zoom: {(zoom * 100).toFixed(0)}%
                    {config.position === "custom" && " • Drag to position • Ctrl+Scroll to zoom"}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Batch Preview */}
            {images.length > 1 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-sm font-semibold mb-3">Batch Images ({images.length})</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {images.slice(0, 12).map((img, index) => (
                      <div
                        key={img.id}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`relative cursor-pointer rounded overflow-hidden border-2 transition-all ${
                          index === currentImageIndex
                            ? "border-primary ring-2 ring-primary/20"
                            : "border-transparent hover:border-muted-foreground/20"
                        }`}
                      >
                        <img src={img.preview} alt={`Image ${index + 1}`} className="w-full h-20 object-cover" />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-1 py-0.5 text-center">
                          {index + 1}
                        </div>
                        {img.processed && (
                          <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full p-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    ))}
                    {images.length > 12 && (
                      <div className="flex items-center justify-center bg-muted rounded text-xs text-muted-foreground">
                        +{images.length - 12} more
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Bottom Ad Row */}
          <div className="lg:col-span-2 min-h-[100px] mt-6">
            <ins 
              className="adsbygoogle"
              style={{ display: "inline-block", width: "800px", height: "200px" }}
              data-ad-client="ca-pub-7382531001943020"
              data-ad-slot="4838473293"
            />
          </div>
        </div>

        {/* Feature Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <Type className="w-8 h-8 mb-2 text-primary" />
              <h3 className="font-semibold mb-1">Text & Logo</h3>
              <p className="text-xs text-muted-foreground">
                Add custom text or upload your logo. Support for multiple fonts, colors, and effects.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <Package className="w-8 h-8 mb-2 text-primary" />
              <h3 className="font-semibold mb-1">Batch Processing</h3>
              <p className="text-xs text-muted-foreground">
                Upload and watermark multiple images at once. Download as a ZIP file.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <MapPin className="w-8 h-8 mb-2 text-primary" />
              <h3 className="font-semibold mb-1">Drag & Position</h3>
              <p className="text-xs text-muted-foreground">
                Freely drag and position your watermark anywhere on the image with precision.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <Star className="w-8 h-8 mb-2 text-primary" />
              <h3 className="font-semibold mb-1">Save Presets</h3>
              <p className="text-xs text-muted-foreground">
                Save your favorite configurations and quickly apply them to new images.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* SEO Content - Condensed */}
        <div className="mt-8">
          <Card>
            <CardContent className="p-6 prose prose-sm max-w-none dark:prose-invert">
              <h2>Professional Watermark Tool for Image Protection</h2>
              <p>
                Protect your images and establish brand identity with our advanced online watermark tool. Add text or logo watermarks, batch process multiple images, use drag & drop positioning, and export in multiple formats.
              </p>

              <h3>Key Features</h3>
              <ul>
                <li><strong>Text & Logo Watermarks:</strong> Full customization with fonts, colors, shadows, outlines, and backgrounds</li>
                <li><strong>Batch Processing:</strong> Watermark hundreds of images at once, download as ZIP</li>
                <li><strong>Drag & Drop Positioning:</strong> Precise watermark placement with keyboard shortcuts</li>
                <li><strong>Multiple Export Formats:</strong> PNG, JPG, WebP with quality control</li>
                <li><strong>Preset Templates:</strong> Save and load custom configurations</li>
                <li><strong>Privacy Protected:</strong> All processing happens in your browser</li>
              </ul>

              <h3>Perfect For</h3>
              <p>
                Photographers protecting portfolios, businesses branding product images, content creators securing social media posts, and e-commerce stores protecting product photography.
              </p>
            </CardContent>
          </Card>
        </div>
      </ToolLayout>

      <AdWatchModal
        isOpen={showAdModal}
        onClose={() => setShowAdModal(false)}
        onAdComplete={() => {
          setCanDownload(true);
          setShowAdModal(false);
          if (images.length > 1) {
            handleBatchDownload();
          } else {
            downloadSingleImage();
          }
        }}
        title="Watch ad to download watermarked image"
        description="Please watch this short ad to download your watermarked image."
      />
    </>
  );
};

export default WatermarkTool;
