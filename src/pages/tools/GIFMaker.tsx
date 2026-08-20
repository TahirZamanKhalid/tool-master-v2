import { useState, useRef, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Upload,
  Download,
  Trash2,
  Play,
  Loader2,
  Film,
  Pause,
  SkipBack,
  SkipForward,
  Type,
  Sticker,
  Wand2,
  Copy,
  Scissors,
  FlipHorizontal,
  FlipVertical,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Settings2,
  Sparkles,
  Image as ImageIcon,
  Clock,
  Palette,
  Layers,
  Move,
  RefreshCw,
} from "lucide-react";
import { AdWatchModal } from "@/components/AdWatchModal";
import { SEOHead } from "@/components/SEOHead";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isRasterImageFile } from "@/utils/imageFiles";
import { encodeGif, type GifFrameInput } from "@/utils/simpleGifEncoder";

const MAX_FRAME_SIZE = 10 * 1024 * 1024;
const SUPPORTED_FRAME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/bmp"];

interface Frame {
  id: string;
  image: HTMLImageElement;
  dataUrl: string;
  duration: number; // Individual frame duration
  text?: TextOverlay;
  filters?: ImageFilters;
}

interface TextOverlay {
  content: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
  bold: boolean;
  italic: boolean;
  stroke: boolean;
  strokeColor: string;
  animation?: "none" | "fade" | "slide" | "bounce";
}

interface ImageFilters {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  hue: number;
  sepia: number;
  grayscale: number;
}

const defaultFilters: ImageFilters = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  blur: 0,
  hue: 0,
  sepia: 0,
  grayscale: 0,
};

const GIFMaker = () => {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [selectedFrames, setSelectedFrames] = useState<Set<string>>(new Set());
  const [globalFrameDuration, setGlobalFrameDuration] = useState([200]);
  const [quality, setQuality] = useState("medium");
  const [loop, setLoop] = useState(true);
  const [loopCount, setLoopCount] = useState(0); // 0 = infinite
  const [width, setWidth] = useState(480);
  const [height, setHeight] = useState(360);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [showAdModal, setShowAdModal] = useState(false);
  const [canDownload, setCanDownload] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Text overlay state
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [textContent, setTextContent] = useState("");
  const [textColor, setTextColor] = useState("#ffffff");
  const [textSize, setTextSize] = useState([32]);
  const [textFont, setTextFont] = useState("Arial");
  const [textBold, setTextBold] = useState(false);
  const [textItalic, setTextItalic] = useState(false);
  const [textStroke, setTextStroke] = useState(true);
  const [textAnimation, setTextAnimation] = useState<"none" | "fade" | "slide" | "bounce">("none");

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [brightness, setBrightness] = useState([100]);
  const [contrast, setContrast] = useState([100]);
  const [saturation, setSaturation] = useState([100]);
  const [blur, setBlur] = useState([0]);
  const [hue, setHue] = useState([0]);
  const [sepia, setSepia] = useState([0]);
  const [grayscale, setGrayscale] = useState([0]);

  // Advanced options
  const [reverseFrames, setReverseFrames] = useState(false);
  const [boomerang, setBoomerang] = useState(false);
  const [fadeTransition, setFadeTransition] = useState(false);
  const [optimizeSize, setOptimizeSize] = useState(true);
  const [transparentBackground, setTransparentBackground] = useState(false);
  const [exportFormat, setExportFormat] = useState<"gif" | "webp" | "mp4">("gif");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const draggedFrameRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewIntervalRef.current) {
        clearInterval(previewIntervalRef.current);
      }
    };
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.currentTarget.value = "";

    if (files.length === 0) return;

    const imageFiles = files.filter(
      (file) => isRasterImageFile(file, SUPPORTED_FRAME_TYPES) && file.size <= MAX_FRAME_SIZE,
    );

    if (imageFiles.length === 0) {
      toast.error("Please upload JPG, PNG, WebP, or BMP images under 10 MB each");
      return;
    }

    if (imageFiles.length !== files.length) {
      toast.warning("Some unsupported or oversized files were skipped");
    }

    if (frames.length + imageFiles.length < 2) {
      toast.error("Please upload at least 2 images to create an animation");
      return;
    }

    let loadedCount = 0;
    const newFrames: Frame[] = [];

    imageFiles.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const dataUrl = event.target?.result as string;
          newFrames.push({
            id: `${Date.now()}-${index}`,
            image: img,
            dataUrl: dataUrl,
            duration: globalFrameDuration[0],
            filters: { ...defaultFilters },
          });

          loadedCount++;
          if (loadedCount === imageFiles.length) {
            newFrames.sort((a, b) => {
              const aIndex = parseInt(a.id.split("-")[1]);
              const bIndex = parseInt(b.id.split("-")[1]);
              return aIndex - bIndex;
            });
            setFrames((prev) => [...prev, ...newFrames]);
            toast.success(`${imageFiles.length} frames loaded!`);
            if (frames.length === 0) {
              drawFrame(newFrames[0]);
            }
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const applyFilters = (ctx: CanvasRenderingContext2D, filters: ImageFilters) => {
    const filterString = `
      brightness(${filters.brightness}%)
      contrast(${filters.contrast}%)
      saturate(${filters.saturation}%)
      blur(${filters.blur}px)
      hue-rotate(${filters.hue}deg)
      sepia(${filters.sepia}%)
      grayscale(${filters.grayscale}%)
    `.trim();
    ctx.filter = filterString;
  };

  const drawFrame = (frame: Frame, frameIndex?: number) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    if (transparentBackground) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Apply filters
    if (frame.filters) {
      applyFilters(ctx, frame.filters);
    }

    // Calculate scaling to fit
    const scale = Math.min(canvas.width / frame.image.width, canvas.height / frame.image.height);

    const scaledWidth = frame.image.width * scale;
    const scaledHeight = frame.image.height * scale;
    const x = (canvas.width - scaledWidth) / 2;
    const y = (canvas.height - scaledHeight) / 2;

    ctx.drawImage(frame.image, x, y, scaledWidth, scaledHeight);

    // Reset filter
    ctx.filter = "none";

    // Draw text overlay if exists
    if (frame.text) {
      drawTextOverlay(ctx, frame.text, frameIndex);
    }
  };

  const drawTextOverlay = (ctx: CanvasRenderingContext2D, text: TextOverlay, frameIndex?: number) => {
    ctx.save();

    // Setup font
    const fontStyle = `${text.italic ? "italic" : ""} ${text.bold ? "bold" : ""} ${text.fontSize}px ${text.fontFamily}`;
    ctx.font = fontStyle;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Animation effects
    let alpha = 1;
    let offsetX = 0;
    let offsetY = 0;

    if (text.animation && frameIndex !== undefined) {
      const progress = (frameIndex % frames.length) / frames.length;

      switch (text.animation) {
        case "fade":
          alpha = Math.sin(progress * Math.PI);
          break;
        case "slide":
          offsetX = (1 - progress) * ctx.canvas.width - ctx.canvas.width / 2;
          break;
        case "bounce":
          offsetY = Math.abs(Math.sin(progress * Math.PI * 2)) * 20;
          break;
      }
    }

    ctx.globalAlpha = alpha;

    const textX = text.x + offsetX;
    const textY = text.y + offsetY;

    // Draw stroke
    if (text.stroke) {
      ctx.strokeStyle = text.strokeColor;
      ctx.lineWidth = 3;
      ctx.strokeText(text.content, textX, textY);
    }

    // Draw text
    ctx.fillStyle = text.color;
    ctx.fillText(text.content, textX, textY);

    ctx.restore();
  };

  const togglePreview = () => {
    if (frames.length < 1) {
      toast.error("Add at least 1 frame to preview");
      return;
    }

    if (isPlaying) {
      stopPreview();
    } else {
      startPreview();
    }
  };

  const startPreview = () => {
    setIsPlaying(true);
    let frameIndex = 0;
    const framesToPlay = getProcessedFrames();

    const playNextFrame = () => {
      if (frameIndex >= framesToPlay.length) {
        if (loop) {
          frameIndex = 0;
        } else {
          stopPreview();
          return;
        }
      }

      setCurrentFrame(frameIndex);
      drawFrame(framesToPlay[frameIndex], frameIndex);

      const duration = framesToPlay[frameIndex].duration / playbackSpeed;

      previewIntervalRef.current = setTimeout(() => {
        frameIndex++;
        playNextFrame();
      }, duration);
    };

    playNextFrame();
  };

  const stopPreview = () => {
    setIsPlaying(false);
    if (previewIntervalRef.current) {
      clearTimeout(previewIntervalRef.current);
      previewIntervalRef.current = null;
    }
  };

  const getProcessedFrames = (): Frame[] => {
    let processedFrames = [...frames];

    if (reverseFrames) {
      processedFrames = processedFrames.reverse();
    }

    if (boomerang) {
      processedFrames = [...processedFrames, ...processedFrames.slice().reverse()];
    }

    return processedFrames;
  };

  const removeFrame = (id: string) => {
    const newFrames = frames.filter((f) => f.id !== id);
    setFrames(newFrames);
    setSelectedFrames((prev) => {
      const updated = new Set(prev);
      updated.delete(id);
      return updated;
    });

    if (newFrames.length > 0) {
      const newIndex = Math.min(currentFrame, newFrames.length - 1);
      setCurrentFrame(newIndex);
      drawFrame(newFrames[newIndex]);
    } else {
      clearCanvas();
    }

    stopPreview();
    toast.success("Frame removed");
  };

  const duplicateFrame = (id: string) => {
    const frameIndex = frames.findIndex((f) => f.id === id);
    if (frameIndex === -1) return;

    const frameToDuplicate = frames[frameIndex];
    const newFrame: Frame = {
      ...frameToDuplicate,
      id: `${Date.now()}-duplicate`,
      text: frameToDuplicate.text ? { ...frameToDuplicate.text } : undefined,
      filters: frameToDuplicate.filters ? { ...frameToDuplicate.filters } : undefined,
    };

    const newFrames = [...frames];
    newFrames.splice(frameIndex + 1, 0, newFrame);
    setFrames(newFrames);
    toast.success("Frame duplicated");
  };

  const clearCanvas = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#f3f4f6";
        ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  };

  const clearAll = () => {
    setFrames([]);
    setSelectedFrames(new Set());
    setCurrentFrame(0);
    stopPreview();
    clearCanvas();
    toast.success("All frames cleared");
  };

  const addTextToFrame = () => {
    if (!textContent.trim()) {
      toast.error("Please enter some text");
      return;
    }

    const textOverlay: TextOverlay = {
      content: textContent,
      x: width / 2,
      y: height / 2,
      fontSize: textSize[0],
      color: textColor,
      fontFamily: textFont,
      bold: textBold,
      italic: textItalic,
      stroke: textStroke,
      strokeColor: "#000000",
      animation: textAnimation,
    };

    if (selectedFrames.size > 0) {
      // Add text to selected frames
      const updatedFrames = frames.map((frame) => {
        if (selectedFrames.has(frame.id)) {
          return { ...frame, text: textOverlay };
        }
        return frame;
      });
      setFrames(updatedFrames);
      toast.success(`Text added to ${selectedFrames.size} frame(s)`);
      drawFrame(updatedFrames[currentFrame], currentFrame);
    } else {
      // Add text to current frame
      const updatedFrames = [...frames];
      updatedFrames[currentFrame] = {
        ...updatedFrames[currentFrame],
        text: textOverlay,
      };
      setFrames(updatedFrames);
      toast.success("Text added to current frame");
      drawFrame(updatedFrames[currentFrame], currentFrame);
    }

    setShowTextEditor(false);
  };

  const applyFiltersToFrames = () => {
    const filters: ImageFilters = {
      brightness: brightness[0],
      contrast: contrast[0],
      saturation: saturation[0],
      blur: blur[0],
      hue: hue[0],
      sepia: sepia[0],
      grayscale: grayscale[0],
    };

    if (selectedFrames.size > 0) {
      const updatedFrames = frames.map((frame) => {
        if (selectedFrames.has(frame.id)) {
          return { ...frame, filters };
        }
        return frame;
      });
      setFrames(updatedFrames);
      toast.success(`Filters applied to ${selectedFrames.size} frame(s)`);
      drawFrame(updatedFrames[currentFrame], currentFrame);
    } else {
      const updatedFrames = [...frames];
      updatedFrames[currentFrame] = {
        ...updatedFrames[currentFrame],
        filters,
      };
      setFrames(updatedFrames);
      toast.success("Filters applied to current frame");
      drawFrame(updatedFrames[currentFrame], currentFrame);
    }
  };

  const resetFilters = () => {
    setBrightness([100]);
    setContrast([100]);
    setSaturation([100]);
    setBlur([0]);
    setHue([0]);
    setSepia([0]);
    setGrayscale([0]);
  };

  const handleFrameSelect = (id: string, isShiftKey: boolean) => {
    setSelectedFrames((prev) => {
      const updated = new Set(prev);
      if (isShiftKey) {
        if (updated.has(id)) {
          updated.delete(id);
        } else {
          updated.add(id);
        }
      } else {
        updated.clear();
        updated.add(id);
      }
      return updated;
    });
  };

  const deleteSelectedFrames = () => {
    if (selectedFrames.size === 0) return;

    const newFrames = frames.filter((f) => !selectedFrames.has(f.id));
    setFrames(newFrames);
    setSelectedFrames(new Set());

    if (newFrames.length > 0) {
      setCurrentFrame(0);
      drawFrame(newFrames[0]);
    } else {
      clearCanvas();
    }

    toast.success(`${selectedFrames.size} frame(s) deleted`);
  };

  const handleDragStart = (e: React.DragEvent, frameId: string) => {
    draggedFrameRef.current = frameId;
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();

    if (!draggedFrameRef.current || draggedFrameRef.current === targetId) return;

    const draggedIndex = frames.findIndex((f) => f.id === draggedFrameRef.current);
    const targetIndex = frames.findIndex((f) => f.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newFrames = [...frames];
    const [draggedFrame] = newFrames.splice(draggedIndex, 1);
    newFrames.splice(targetIndex, 0, draggedFrame);

    setFrames(newFrames);
    draggedFrameRef.current = null;
    toast.success("Frame order updated");
  };

  const updateFrameDuration = (value: number[]) => {
    setGlobalFrameDuration(value);
    setFrames((prev) => prev.map((frame) => ({ ...frame, duration: value[0] })));
  };

  const handleDownload = () => {
    if (frames.length < 1) {
      toast.error("Add at least 1 frame to create an animation");
      return;
    }

    if (!canDownload) {
      setShowAdModal(true);
      return;
    }

    downloadAnimation();
  };

  const downloadAnimation = async () => {
    setIsProcessing(true);
    stopPreview();

    try {
      const processedFrames = getProcessedFrames();
      await downloadAsGIF(processedFrames);
    } catch (error) {
      console.error("Error creating animation:", error);
      toast.error("Failed to create animation");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadAsGIF = async (processedFrames: Frame[]) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get canvas context");

    const gifFrames: GifFrameInput[] = processedFrames.map((frame, index) => {
      if (transparentBackground) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      if (frame.filters) applyFilters(ctx, frame.filters);

      const scale = Math.min(canvas.width / frame.image.width, canvas.height / frame.image.height);
      const scaledWidth = frame.image.width * scale;
      const scaledHeight = frame.image.height * scale;
      const x = (canvas.width - scaledWidth) / 2;
      const y = (canvas.height - scaledHeight) / 2;

      ctx.drawImage(frame.image, x, y, scaledWidth, scaledHeight);
      ctx.filter = "none";

      if (frame.text) drawTextOverlay(ctx, frame.text, index);

      return {
        data: ctx.getImageData(0, 0, canvas.width, canvas.height).data,
        width: canvas.width,
        height: canvas.height,
        delayMs: Math.max(50, frame.duration),
      };
    });

    const blob = encodeGif(gifFrames, loop ? loopCount : 1);
    downloadBlob(blob, `animation-${Date.now()}.gif`);
    toast.success("GIF downloaded successfully!");
  };

  const downloadAsWebP = async (processedFrames: Frame[]) => {
    toast.info("WebP export coming soon! Downloading as HTML animation instead.");
    await downloadAsGIF(processedFrames);
  };

  const downloadAsVideo = async (processedFrames: Frame[]) => {
    toast.info("MP4 export coming soon! Downloading as HTML animation instead.");
    await downloadAsGIF(processedFrames);
  };

  const generateAnimationHTML = (frameData: Array<{ dataUrl: string; duration: number }>) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Animated GIF - ToolMasterPro</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      max-width: 900px;
      width: 100%;
    }
    h1 {
      text-align: center;
      color: #333;
      margin-bottom: 10px;
      font-size: 28px;
    }
    .subtitle {
      text-align: center;
      color: #666;
      margin-bottom: 30px;
      font-size: 14px;
    }
    .canvas-wrapper {
      position: relative;
      display: inline-block;
      width: 100%;
    }
    canvas {
      width: 100%;
      height: auto;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      display: block;
      background: ${transparentBackground ? "url(\"data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='10' height='10' fill='%23f0f0f0'/%3E%3Crect x='10' width='10' height='10' fill='%23fff'/%3E%3Crect y='10' width='10' height='10' fill='%23fff'/%3E%3Crect x='10' y='10' width='10' height='10' fill='%23f0f0f0'/%3E%3C/svg%3E\")" : "#fff"};
    }
    .controls {
      display: flex;
      gap: 10px;
      justify-content: center;
      margin-top: 25px;
      flex-wrap: wrap;
    }
    button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      transition: transform 0.2s, box-shadow 0.2s;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
    button:active {
      transform: translateY(0);
    }
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .info {
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
      font-size: 13px;
      color: #555;
    }
    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .info-label {
      font-weight: 600;
      color: #333;
    }
    .speed-control {
      margin-top: 20px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
    }
    .speed-control label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #333;
      font-size: 13px;
    }
    input[type="range"] {
      width: 100%;
      height: 6px;
      border-radius: 3px;
      background: #ddd;
      outline: none;
      -webkit-appearance: none;
    }
    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      cursor: pointer;
    }
    .note {
      margin-top: 20px;
      padding: 15px;
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      border-radius: 4px;
      font-size: 13px;
      color: #856404;
    }
    .watermark {
      text-align: center;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      color: #999;
      font-size: 12px;
    }
    .watermark a {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
    }
    @media (max-width: 640px) {
      .container { padding: 20px; }
      h1 { font-size: 22px; }
      .controls { flex-direction: column; }
      button { width: 100%; justify-content: center; }
      .info { flex-direction: column; gap: 10px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎬 Your Animated Creation</h1>
    <p class="subtitle">Created with ToolMasterPro GIF Maker</p>
    
    <div class="canvas-wrapper">
      <canvas id="canvas" width="${width}" height="${height}"></canvas>
    </div>
    
    <div class="controls">
      <button onclick="togglePlay()" id="playBtn">
        <span id="playIcon">⏸️</span> 
        <span id="playText">Pause</span>
      </button>
      <button onclick="previousFrame()">⏮️ Previous</button>
      <button onclick="nextFrame()">Next ⏭️</button>
      <button onclick="restart()">🔄 Restart</button>
      <button onclick="downloadFrame()">💾 Save Frame</button>
    </div>
    
    <div class="speed-control">
      <label for="speedSlider">
        Playback Speed: <span id="speedValue">1.0</span>x
      </label>
      <input 
        type="range" 
        id="speedSlider" 
        min="0.25" 
        max="3" 
        step="0.25" 
        value="1"
        oninput="updateSpeed(this.value)"
      >
    </div>
    
    <div class="info">
      <div class="info-item">
        <span class="info-label">Current Frame</span>
        <span id="frameNum">1</span> / ${frameData.length}
      </div>
      <div class="info-item">
        <span class="info-label">Dimensions</span>
        <span>${width}  x  ${height}px</span>
      </div>
      <div class="info-item">
        <span class="info-label">Total Frames</span>
        <span>${frameData.length}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Loop</span>
        <span>${loop ? "Infinite" : loopCount + " times"}</span>
      </div>
    </div>
    
    <div class="note">
      <strong>Tip:</strong> Use screen recording software (OBS, QuickTime, etc.) to capture this animation 
      and convert it to GIF or MP4 format. Or use online tools like ezgif.com for conversion.
    </div>
    
    <div class="watermark">
      Made with ❤️ using <a href="https://toolmaster.cloud" target="_blank">ToolMasterPro</a>
    </div>
  </div>

  <script>
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const frameData = ${JSON.stringify(frameData)};
    let currentFrameIndex = 0;
    let isPlaying = true;
    let playbackSpeed = 1;
    let animationTimeout = null;
    let loopCount = 0;
    const maxLoops = ${loop ? 0 : loopCount};

    function drawFrame(index) {
      const frame = frameData[index];
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ${!transparentBackground ? "ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height);" : ""}
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        document.getElementById('frameNum').textContent = index + 1;
      };
      img.src = frame.dataUrl;
    }

    function animate() {
      if (!isPlaying) return;

      drawFrame(currentFrameIndex);
      const duration = frameData[currentFrameIndex].duration / playbackSpeed;
      
      animationTimeout = setTimeout(() => {
        currentFrameIndex++;
        
        if (currentFrameIndex >= frameData.length) {
          currentFrameIndex = 0;
          loopCount++;
          
          if (maxLoops > 0 && loopCount >= maxLoops) {
            isPlaying = false;
            updatePlayButton();
            return;
          }
        }
        
        animate();
      }, duration);
    }

    function togglePlay() {
      isPlaying = !isPlaying;
      updatePlayButton();
      
      if (isPlaying) {
        animate();
      } else {
        clearTimeout(animationTimeout);
      }
    }

    function updatePlayButton() {
      const playBtn = document.getElementById('playBtn');
      const playIcon = document.getElementById('playIcon');
      const playText = document.getElementById('playText');
      
      if (isPlaying) {
        playIcon.textContent = '⏸️';
        playText.textContent = 'Pause';
      } else {
        playIcon.textContent = '▶️';
        playText.textContent = 'Play';
      }
    }

    function previousFrame() {
      const wasPlaying = isPlaying;
      if (isPlaying) togglePlay();
      
      currentFrameIndex = (currentFrameIndex - 1 + frameData.length) % frameData.length;
      drawFrame(currentFrameIndex);
      
      if (wasPlaying) togglePlay();
    }

    function nextFrame() {
      const wasPlaying = isPlaying;
      if (isPlaying) togglePlay();
      
      currentFrameIndex = (currentFrameIndex + 1) % frameData.length;
      drawFrame(currentFrameIndex);
      
      if (wasPlaying) togglePlay();
    }

    function restart() {
      currentFrameIndex = 0;
      loopCount = 0;
      drawFrame(0);
      if (!isPlaying) {
        isPlaying = true;
        updatePlayButton();
        animate();
      }
    }

    function updateSpeed(value) {
      playbackSpeed = parseFloat(value);
      document.getElementById('speedValue').textContent = playbackSpeed.toFixed(2);
    }

    function downloadFrame() {
      const link = document.createElement('a');
      link.download = \`frame-\${currentFrameIndex + 1}-of-${frameData.length}.png\`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }

    // Initialize
    drawFrame(0);
    animate();
  </script>
</body>
</html>`;
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    downloadBlob(blob, filename);
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getQualityWidth = (quality: string) => {
    switch (quality) {
      case "low":
        return 320;
      case "medium":
        return 480;
      case "high":
        return 640;
      case "ultra":
        return 800;
      case "hd":
        return 1280;
      default:
        return 480;
    }
  };

  const getQualityHeight = (quality: string) => {
    const w = getQualityWidth(quality);
    return Math.round(w * (3 / 4));
  };

  const handleQualityChange = (newQuality: string) => {
    setQuality(newQuality);
    const newWidth = getQualityWidth(newQuality);
    const newHeight = getQualityHeight(newQuality);
    setWidth(newWidth);
    setHeight(newHeight);
    if (frames.length > 0) {
      drawFrame(frames[currentFrame], currentFrame);
    }
  };

  const goToPreviousFrame = () => {
    if (frames.length === 0) return;
    const newIndex = currentFrame === 0 ? frames.length - 1 : currentFrame - 1;
    setCurrentFrame(newIndex);
    drawFrame(frames[newIndex], newIndex);
  };

  const goToNextFrame = () => {
    if (frames.length === 0) return;
    const newIndex = (currentFrame + 1) % frames.length;
    setCurrentFrame(newIndex);
    drawFrame(frames[newIndex], newIndex);
  };

  return (
    <>
      <SEOHead
        title="Professional GIF Maker - Create Animated GIFs Online Free | ToolMaster"
        description="Create stunning animated GIFs with our advanced online GIF maker. Add text, filters, effects, and more. No watermark, free to use. Perfect for social media, websites, and presentations."
        keywords="gif maker, create gif, animated gif, gif creator, image to gif, gif editor, free gif maker, online gif maker, gif animation, gif tool"
        canonical="https://toolmaster.cloud/tools/gif-maker"
      />
      <ToolLayout
        title="Professional GIF Maker"
        description="Create stunning animated GIFs with advanced features: text overlays, filters, effects, frame editing, and more"
        category="Image Tools"
        layout="with-sidebar"
        instructions={[
          "Upload 2 or more images to create your animation",
          "Customize frame duration, add text overlays and filters",
          "Use timeline controls to edit individual frames",
          "Apply effects like boomerang, reverse, and transitions",
          "Preview your animation with playback controls",
          "Download a real animated GIF file",
        ]}
        relatedTools={[
          { name: "Video Trimmer", path: "/tools/video-trimmer" },
          { name: "Photo Collage Maker", path: "/tools/photo-collage-maker" },
          { name: "Advanced Image Editor", path: "/tools/advanced-image-editor" },
          { name: "Video to GIF Converter", path: "/tools/video-to-gif" },
        ]}
      >
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Controls */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="basic">Basic</TabsTrigger>
                    <TabsTrigger value="text">Text</TabsTrigger>
                    <TabsTrigger value="filters">Filters</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4">
                    <div>
                      <Label>Upload Frames</Label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept={SUPPORTED_FRAME_TYPES.join(",")}
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full mt-2">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Images ({frames.length} frames)
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">Upload 2+ images. Drag frames to reorder.</p>
                    </div>

                    {frames.length > 0 && (
                      <>
                        <div>
                          <Label htmlFor="frame-duration">Frame Duration: {globalFrameDuration[0]}ms</Label>
                          <Slider
                            id="frame-duration"
                            min={50}
                            max={2000}
                            step={50}
                            value={globalFrameDuration}
                            onValueChange={updateFrameDuration}
                            className="mt-2"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>Fast (50ms)</span>
                            <span>Slow (2s)</span>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="playback-speed">Playback Speed: {playbackSpeed}x</Label>
                          <Slider
                            id="playback-speed"
                            min={0.25}
                            max={3}
                            step={0.25}
                            value={[playbackSpeed]}
                            onValueChange={(v) => {
                              setPlaybackSpeed(v[0]);
                              if (isPlaying) {
                                stopPreview();
                                startPreview();
                              }
                            }}
                            className="mt-2"
                          />
                        </div>

                        <div>
                          <Label htmlFor="quality">Output Quality</Label>
                          <Select value={quality} onValueChange={handleQualityChange}>
                            <SelectTrigger className="mt-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low (320x240)</SelectItem>
                              <SelectItem value="medium">Medium (480x360)</SelectItem>
                              <SelectItem value="high">High (640x480)</SelectItem>
                              <SelectItem value="ultra">Ultra (800x600)</SelectItem>
                              <SelectItem value="hd">HD (1280x960)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Export Format</Label>
                          <Select value={exportFormat} onValueChange={(v: any) => setExportFormat(v)}>
                            <SelectTrigger className="mt-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="gif">GIF (.gif)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="loop"
                              checked={loop}
                              onCheckedChange={(checked) => setLoop(checked as boolean)}
                            />
                            <Label htmlFor="loop" className="cursor-pointer">
                              Loop continuously
                            </Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="boomerang"
                              checked={boomerang}
                              onCheckedChange={(checked) => setBoomerang(checked as boolean)}
                            />
                            <Label htmlFor="boomerang" className="cursor-pointer">
                              Boomerang effect (forward + reverse)
                            </Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="reverse"
                              checked={reverseFrames}
                              onCheckedChange={(checked) => setReverseFrames(checked as boolean)}
                            />
                            <Label htmlFor="reverse" className="cursor-pointer">
                              Reverse frame order
                            </Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="transparent"
                              checked={transparentBackground}
                              onCheckedChange={(checked) => setTransparentBackground(checked as boolean)}
                            />
                            <Label htmlFor="transparent" className="cursor-pointer">
                              Transparent background
                            </Label>
                          </div>
                        </div>
                      </>
                    )}
                  </TabsContent>

                  <TabsContent value="text" className="space-y-4">
                    <div>
                      <Label htmlFor="text-content">Text Content</Label>
                      <Textarea
                        id="text-content"
                        placeholder="Enter text to overlay..."
                        value={textContent}
                        onChange={(e) => setTextContent(e.target.value)}
                        className="mt-2"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="text-color">Color</Label>
                        <Input
                          id="text-color"
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="mt-2 h-10"
                        />
                      </div>

                      <div>
                        <Label htmlFor="text-font">Font</Label>
                        <Select value={textFont} onValueChange={setTextFont}>
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Arial">Arial</SelectItem>
                            <SelectItem value="Impact">Impact</SelectItem>
                            <SelectItem value="Comic Sans MS">Comic Sans</SelectItem>
                            <SelectItem value="Courier New">Courier</SelectItem>
                            <SelectItem value="Georgia">Georgia</SelectItem>
                            <SelectItem value="Times New Roman">Times</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="text-size">Size: {textSize[0]}px</Label>
                      <Slider
                        id="text-size"
                        min={12}
                        max={120}
                        step={2}
                        value={textSize}
                        onValueChange={setTextSize}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label>Animation</Label>
                      <Select value={textAnimation} onValueChange={(v: any) => setTextAnimation(v)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="fade">Fade In/Out</SelectItem>
                          <SelectItem value="slide">Slide In</SelectItem>
                          <SelectItem value="bounce">Bounce</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="text-bold"
                          checked={textBold}
                          onCheckedChange={(checked) => setTextBold(checked as boolean)}
                        />
                        <Label htmlFor="text-bold" className="cursor-pointer">
                          Bold
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="text-italic"
                          checked={textItalic}
                          onCheckedChange={(checked) => setTextItalic(checked as boolean)}
                        />
                        <Label htmlFor="text-italic" className="cursor-pointer">
                          Italic
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="text-stroke"
                          checked={textStroke}
                          onCheckedChange={(checked) => setTextStroke(checked as boolean)}
                        />
                        <Label htmlFor="text-stroke" className="cursor-pointer">
                          Outline
                        </Label>
                      </div>
                    </div>

                    <Button onClick={addTextToFrame} className="w-full" variant="default">
                      <Type className="h-4 w-4 mr-2" />
                      Add Text to Frame{selectedFrames.size > 0 ? `s (${selectedFrames.size})` : ""}
                    </Button>
                  </TabsContent>

                  <TabsContent value="filters" className="space-y-4">
                    <div>
                      <Label>Brightness: {brightness[0]}%</Label>
                      <Slider min={0} max={200} value={brightness} onValueChange={setBrightness} className="mt-2" />
                    </div>

                    <div>
                      <Label>Contrast: {contrast[0]}%</Label>
                      <Slider min={0} max={200} value={contrast} onValueChange={setContrast} className="mt-2" />
                    </div>

                    <div>
                      <Label>Saturation: {saturation[0]}%</Label>
                      <Slider min={0} max={200} value={saturation} onValueChange={setSaturation} className="mt-2" />
                    </div>

                    <div>
                      <Label>Blur: {blur[0]}px</Label>
                      <Slider min={0} max={20} value={blur} onValueChange={setBlur} className="mt-2" />
                    </div>

                    <div>
                      <Label>Hue Rotate: {hue[0]}deg</Label>
                      <Slider min={0} max={360} value={hue} onValueChange={setHue} className="mt-2" />
                    </div>

                    <div>
                      <Label>Sepia: {sepia[0]}%</Label>
                      <Slider min={0} max={100} value={sepia} onValueChange={setSepia} className="mt-2" />
                    </div>

                    <div>
                      <Label>Grayscale: {grayscale[0]}%</Label>
                      <Slider min={0} max={100} value={grayscale} onValueChange={setGrayscale} className="mt-2" />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={applyFiltersToFrames} className="flex-1">
                        <Wand2 className="h-4 w-4 mr-2" />
                        Apply
                      </Button>
                      <Button onClick={resetFilters} variant="outline" className="flex-1">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reset
                      </Button>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {selectedFrames.size > 0
                        ? `Will apply to ${selectedFrames.size} selected frame(s)`
                        : "Will apply to current frame"}
                    </p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {frames.length > 0 && (
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Timeline ({frames.length} frames)</Label>
                    {selectedFrames.size > 0 && (
                      <Button onClick={deleteSelectedFrames} variant="destructive" size="sm">
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete ({selectedFrames.size})
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-5 gap-2 max-h-80 overflow-y-auto p-2 border rounded-lg">
                    {frames.map((frame, index) => (
                      <div
                        key={frame.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, frame.id)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, frame.id)}
                        className={`relative group cursor-move ${
                          currentFrame === index ? "ring-2 ring-primary" : ""
                        } ${selectedFrames.has(frame.id) ? "ring-2 ring-blue-500" : ""}`}
                        onClick={(e) => {
                          if (!e.shiftKey) {
                            setCurrentFrame(index);
                            drawFrame(frame, index);
                          }
                          handleFrameSelect(frame.id, e.shiftKey);
                        }}
                      >
                        <img
                          src={frame.dataUrl}
                          alt={`Frame ${index + 1}`}
                          className="w-full h-16 object-cover rounded"
                        />
                        <div className="absolute top-0 left-0 bg-black/70 text-white text-xs px-1 rounded-br">
                          {index + 1}
                        </div>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="flex gap-1">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicateFrame(frame.id);
                              }}
                              size="sm"
                              variant="secondary"
                              className="h-6 w-6 p-0"
                              title="Duplicate"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFrame(frame.id);
                              }}
                              size="sm"
                              variant="destructive"
                              className="h-6 w-6 p-0"
                              title="Delete"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        {frame.text && (
                          <div className="absolute bottom-0 right-0 bg-blue-500 text-white text-xs px-1 rounded-tl">
                            <Type className="h-2 w-2" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={goToPreviousFrame} variant="outline" size="sm" className="flex-1">
                      <SkipBack className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={togglePreview}
                      variant={isPlaying ? "secondary" : "default"}
                      size="sm"
                      className="flex-1"
                    >
                      {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                      {isPlaying ? "Pause" : "Play"}
                    </Button>
                    <Button onClick={goToNextFrame} variant="outline" size="sm" className="flex-1">
                      <SkipForward className="h-4 w-4" />
                    </Button>
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
                          Download
                        </>
                      )}
                    </Button>
                    <Button onClick={clearAll} variant="outline" size="lg">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Preview */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            <Card className="border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    Preview
                    {frames.length > 0 && ` - Frame ${currentFrame + 1}/${frames.length}`}
                  </h3>
                  {frames.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {frames[currentFrame]?.duration || globalFrameDuration[0]}ms
                    </div>
                  )}
                </div>

                <div className="border rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 relative">
                  <canvas
                    ref={canvasRef}
                    width={width}
                    height={height}
                    className="w-full h-auto"
                    style={{
                      background: transparentBackground
                        ? "repeating-conic-gradient(#f0f0f0 0% 25%, white 0% 50%) 50% / 20px 20px"
                        : "#ffffff",
                    }}
                  />
                  {frames.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                      <Film className="h-16 w-16 mb-4" />
                      <p className="text-center px-4">
                        Upload images to start creating
                        <br />
                        your animated masterpiece
                      </p>
                    </div>
                  )}
                </div>

                {frames.length > 0 && (
                  <div className="mt-4 p-3 bg-muted rounded-lg text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dimensions:</span>
                      <span className="font-medium">
                        {width}  x  {height}px
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Frames:</span>
                      <span className="font-medium">{getProcessedFrames().length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-medium">
                        {(getProcessedFrames().reduce((sum, f) => sum + f.duration, 0) / 1000).toFixed(2)}s
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Pro Tips
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>- Use 5-30 frames for smooth animations</li>
                  <li>- 100-200ms per frame = natural speed</li>
                  <li>- Shift+Click to select multiple frames</li>
                  <li>- Drag frames to reorder them</li>
                  <li>- Add text with animations for impact</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="mt-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Advanced Features
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  Text Overlays
                </h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>- Multiple font options</li>
                  <li>- Custom colors & sizes</li>
                  <li>- Text animations (fade, slide, bounce)</li>
                  <li>- Bold, italic, outline effects</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Image Filters
                </h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>- Brightness & contrast</li>
                  <li>- Saturation & hue rotation</li>
                  <li>- Blur, sepia, grayscale</li>
                  <li>- Apply to individual/all frames</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Settings2 className="h-4 w-4" />
                  Special Effects
                </h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>- Boomerang effect</li>
                  <li>- Reverse playback</li>
                  <li>- Variable playback speed</li>
                  <li>- Transparent backgrounds</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6 border-amber-200 dark:border-amber-800">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-amber-500" />
              How to Convert HTML to GIF/MP4
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Method 1: Screen Recording</h4>
                <ol className="space-y-1 list-decimal list-inside">
                  <li>Open downloaded HTML file in browser</li>
                  <li>Use screen recorder (OBS, QuickTime, etc.)</li>
                  <li>Record the animation</li>
                  <li>Convert video to GIF if needed</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Method 2: Online Converters</h4>
                <ol className="space-y-1 list-decimal list-inside">
                  <li>Save individual frames from HTML</li>
                  <li>Visit ezgif.com or similar tools</li>
                  <li>Upload all frames</li>
                  <li>Generate and download GIF</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </ToolLayout>

      {/* Related Articles & Guides — internal link for SEO */}
      <section className="mt-12 mb-8 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold mb-4 text-foreground">Related Articles & Guides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <RouterLink
            to="/blog/best-free-online-gif-maker"
            className="p-4 border border-border/60 rounded-lg bg-card/80 shadow-sm hover:shadow-card-hover transition-shadow no-underline block"
          >
            <span className="text-primary font-semibold hover:underline text-lg block">
              Best Free Online GIF Maker: Animate Your Images
            </span>
            <p className="text-muted-foreground mt-2 text-sm">
              Create animated GIFs from static images instantly with customizable speed and quality controls.
            </p>
          </RouterLink>
        </div>
      </section>

      <AdWatchModal
        open={showAdModal}
        onOpenChange={setShowAdModal}
        onAdWatched={() => {
          setCanDownload(true);
          setShowAdModal(false);
          downloadAnimation();
        }}
        title="Watch ad to download your animation"
        description="Support ToolMasterPro by watching this short ad to download your creation."
      />
    </>
  );
};

export default GIFMaker;
