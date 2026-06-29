import { useCallback, useEffect, useRef, useState } from "react";
import {
  Eraser,
  Paintbrush,
  Undo2,
  Redo2,
  Download,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Pipette,
  PaintBucket,
  Square,
  Circle as CircleIcon,
  Minus,
  Type as TypeIcon,
  Move,
  Crop as CropIcon,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
  Wand2,
  Layers as LayersIcon,
  ChevronUp,
  ChevronDown,
  Copy,
  Hand,
  History as HistoryIcon,
  HelpCircle,
  Sliders,
  Palette,
  Star,
  Hexagon,
  Blend,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

/* ============================================================
   Types
============================================================ */
export type Tool =
  | "move"
  | "hand"
  | "brush"
  | "erase"
  | "restore"
  | "paint"
  | "picker"
  | "bucket"
  | "blur"
  | "rect"
  | "ellipse"
  | "line"
  | "text"
  | "crop"
  | "star"
  | "polygon"
  | "gradient"
  | "magicwand";

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  blendMode: GlobalCompositeOperation;
  canvas: HTMLCanvasElement;
  locked: boolean;
}

interface HistoryEntry {
  layerMeta: Array<{
    id: string;
    name: string;
    visible: boolean;
    opacity: number;
    blendMode: GlobalCompositeOperation;
    locked: boolean;
    data: string | null;
  }>;
}

export interface ImageEditorProps {
  src: string;
  fileName?: string;
}

// Text annotation object
interface TextAnnotation {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  layerId: string;
}

/* ============================================================
   Pixel helpers (same as before, plus flood fill for magic wand)
============================================================ */
const clamp = (v: number, a = 0, b = 255) => Math.min(b, Math.max(a, v));

const applyAdjustments = (
  imageData: ImageData,
  a: {
    brightness: number;
    contrast: number;
    saturation: number;
    hue: number;
    exposure: number;
    temperature: number;
    tint: number;
    vibrance: number;
    gamma: number;
    highlights: number;
    shadows: number;
  },
) => {
  // ... (keep the original implementation, unchanged for brevity)
  // I'll include the exact same function from your code
  const data = imageData.data;
  const b = a.brightness / 100;
  const c = a.contrast / 100;
  const s = a.saturation / 100;
  const exp = Math.pow(2, a.exposure / 100);
  const temp = a.temperature;
  const tint = a.tint;
  const vib = a.vibrance / 100;
  const gamma = 1 / Math.max(0.01, a.gamma / 100);
  const hi = a.highlights / 100;
  const sh = a.shadows / 100;
  const hueRad = (a.hue * Math.PI) / 180;
  const cosH = Math.cos(hueRad);
  const sinH = Math.sin(hueRad);

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let bl = data[i + 2];

    r *= exp; g *= exp; bl *= exp;
    r += temp; bl -= temp;
    g += tint;
    r *= b; g *= b; bl *= b;
    r = (r - 128) * c + 128;
    g = (g - 128) * c + 128;
    bl = (bl - 128) * c + 128;

    const nr =
      (0.299 + 0.701 * cosH + 0.168 * sinH) * r +
      (0.587 - 0.587 * cosH + 0.330 * sinH) * g +
      (0.114 - 0.114 * cosH - 0.497 * sinH) * bl;
    const ng =
      (0.299 - 0.299 * cosH - 0.328 * sinH) * r +
      (0.587 + 0.413 * cosH + 0.035 * sinH) * g +
      (0.114 - 0.114 * cosH + 0.292 * sinH) * bl;
    const nb =
      (0.299 - 0.3 * cosH + 1.25 * sinH) * r +
      (0.587 - 0.588 * cosH - 1.05 * sinH) * g +
      (0.114 + 0.886 * cosH - 0.203 * sinH) * bl;
    r = nr; g = ng; bl = nb;

    const gray = 0.2989 * r + 0.587 * g + 0.114 * bl;
    r = gray + (r - gray) * s;
    g = gray + (g - gray) * s;
    bl = gray + (bl - gray) * s;

    if (vib !== 0) {
      const max = Math.max(r, g, bl);
      const avg = (r + g + bl) / 3;
      const amt = ((Math.abs(max - avg) * 2) / 255) * vib;
      if (r !== max) r += (max - r) * amt;
      if (g !== max) g += (max - g) * amt;
      if (bl !== max) bl += (max - bl) * amt;
    }

    const l = (r + g + bl) / 3 / 255;
    const hiAmt = hi * Math.pow(l, 2);
    const shAmt = sh * Math.pow(1 - l, 2);
    r += hiAmt * 80 - shAmt * 80;
    g += hiAmt * 80 - shAmt * 80;
    bl += hiAmt * 80 - shAmt * 80;

    r = 255 * Math.pow(clamp(r) / 255, gamma);
    g = 255 * Math.pow(clamp(g) / 255, gamma);
    bl = 255 * Math.pow(clamp(bl) / 255, gamma);

    data[i] = clamp(r);
    data[i + 1] = clamp(g);
    data[i + 2] = clamp(bl);
  }
  return imageData;
};

const FILTERS = [
  "none", "vivid", "cool", "warm", "mono", "fade", "noir", "sepia",
  "vintage", "dramatic", "cyberpunk", "dreamy", "invert", "emboss", "edge", "sharpen", "blur",
] as const;
export type FilterName = typeof FILTERS[number];

const convolve = (imageData: ImageData, kernel: number[], divisor = 1, bias = 0) => {
  const w = imageData.width, h = imageData.height;
  const src = new Uint8ClampedArray(imageData.data);
  const dst = imageData.data;
  const side = 3, half = 1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let r = 0, g = 0, b = 0;
      for (let cy = 0; cy < side; cy++) {
        for (let cx = 0; cx < side; cx++) {
          const sy = Math.min(h - 1, Math.max(0, y + cy - half));
          const sx = Math.min(w - 1, Math.max(0, x + cx - half));
          const idx = (sy * w + sx) * 4;
          const k = kernel[cy * side + cx];
          r += src[idx] * k;
          g += src[idx + 1] * k;
          b += src[idx + 2] * k;
        }
      }
      const di = (y * w + x) * 4;
      dst[di] = clamp(r / divisor + bias);
      dst[di + 1] = clamp(g / divisor + bias);
      dst[di + 2] = clamp(b / divisor + bias);
    }
  }
  return imageData;
};

const applyFilter = (imageData: ImageData, filter: FilterName) => {
  // ... (keep the original implementation)
  const data = imageData.data;
  switch (filter) {
    case "vivid":
      for (let i = 0; i < data.length; i += 4) {
        data[i] = clamp(data[i] * 1.2);
        data[i + 1] = clamp(data[i + 1] * 1.2);
        data[i + 2] = clamp(data[i + 2] * 1.2);
      }
      break;
    case "cool":
      for (let i = 0; i < data.length; i += 4) data[i + 2] = clamp(data[i + 2] * 1.3);
      break;
    case "warm":
      for (let i = 0; i < data.length; i += 4) {
        data[i] = clamp(data[i] * 1.2);
        data[i + 1] = clamp(data[i + 1] * 1.05);
      }
      break;
    case "mono":
      for (let i = 0; i < data.length; i += 4) {
        const gr = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        data[i] = data[i + 1] = data[i + 2] = gr;
      }
      break;
    case "fade":
      for (let i = 0; i < data.length; i += 4) {
        data[i] = data[i] * 0.8 + 50;
        data[i + 1] = data[i + 1] * 0.8 + 50;
        data[i + 2] = data[i + 2] * 0.8 + 50;
      }
      break;
    case "noir":
      for (let i = 0; i < data.length; i += 4) {
        const gr = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        const v = gr > 128 ? 255 : 0;
        data[i] = data[i + 1] = data[i + 2] = v;
      }
      break;
    case "sepia":
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        data[i] = clamp(r * 0.393 + g * 0.769 + b * 0.189);
        data[i + 1] = clamp(r * 0.349 + g * 0.686 + b * 0.168);
        data[i + 2] = clamp(r * 0.272 + g * 0.534 + b * 0.131);
      }
      break;
    case "vintage":
      for (let i = 0; i < data.length; i += 4) {
        data[i] = clamp(data[i] * 0.9 + 30);
        data[i + 1] = clamp(data[i + 1] * 0.85 + 20);
        data[i + 2] = clamp(data[i + 2] * 0.7 + 10);
      }
      break;
    case "dramatic":
      for (let i = 0; i < data.length; i += 4) {
        data[i] = clamp((data[i] - 128) * 1.4 + 128);
        data[i + 1] = clamp((data[i + 1] - 128) * 1.4 + 128);
        data[i + 2] = clamp((data[i + 2] - 128) * 1.4 + 128);
      }
      break;
    case "cyberpunk":
      for (let i = 0; i < data.length; i += 4) {
        data[i] = clamp(data[i] * 1.1 + 20);
        data[i + 1] = clamp(data[i + 1] * 0.85);
        data[i + 2] = clamp(data[i + 2] * 1.3 + 30);
      }
      break;
    case "dreamy":
      for (let i = 0; i < data.length; i += 4) {
        data[i] = clamp(data[i] * 0.9 + 25);
        data[i + 1] = clamp(data[i + 1] * 0.95 + 20);
        data[i + 2] = clamp(data[i + 2] * 1.0 + 15);
      }
      break;
    case "invert":
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];
        data[i + 1] = 255 - data[i + 1];
        data[i + 2] = 255 - data[i + 2];
      }
      break;
    case "emboss":
      return convolve(imageData, [-2, -1, 0, -1, 1, 1, 0, 1, 2], 1, 0);
    case "edge":
      return convolve(imageData, [-1, -1, -1, -1, 8, -1, -1, -1, -1], 1, 0);
    case "sharpen":
      return convolve(imageData, [0, -1, 0, -1, 5, -1, 0, -1, 0], 1, 0);
    case "blur":
      return convolve(imageData, [1, 1, 1, 1, 1, 1, 1, 1, 1], 9, 0);
    default:
      break;
  }
  return imageData;
};

/* ============================================================
   Flood fill (paint bucket & magic wand)
============================================================ */
const floodFill = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  fillColor: [number, number, number, number],
  tolerance = 32,
) => {
  const w = ctx.canvas.width, h = ctx.canvas.height;
  const img = ctx.getImageData(0, 0, w, h);
  const data = img.data;
  const startIdx = (y * w + x) * 4;
  const sr = data[startIdx], sg = data[startIdx + 1], sb = data[startIdx + 2], sa = data[startIdx + 3];
  const match = (i: number) =>
    Math.abs(data[i] - sr) <= tolerance &&
    Math.abs(data[i + 1] - sg) <= tolerance &&
    Math.abs(data[i + 2] - sb) <= tolerance &&
    Math.abs(data[i + 3] - sa) <= tolerance;
  const stack = [[x, y]];
  const visited = new Uint8Array(w * h);
  while (stack.length) {
    const [cx, cy] = stack.pop()!;
    if (cx < 0 || cy < 0 || cx >= w || cy >= h) continue;
    const p = cy * w + cx;
    if (visited[p]) continue;
    const i = p * 4;
    if (!match(i)) continue;
    visited[p] = 1;
    data[i] = fillColor[0];
    data[i + 1] = fillColor[1];
    data[i + 2] = fillColor[2];
    data[i + 3] = fillColor[3];
    stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
  }
  ctx.putImageData(img, 0, 0);
};

// Magic wand: returns a canvas with selected area (alpha mask) or creates new layer
const magicWandSelect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tolerance = 32,
): HTMLCanvasElement => {
  const w = ctx.canvas.width, h = ctx.canvas.height;
  const img = ctx.getImageData(0, 0, w, h);
  const data = img.data;
  const startIdx = (y * w + x) * 4;
  const sr = data[startIdx], sg = data[startIdx + 1], sb = data[startIdx + 2], sa = data[startIdx + 3];
  const match = (i: number) =>
    Math.abs(data[i] - sr) <= tolerance &&
    Math.abs(data[i + 1] - sg) <= tolerance &&
    Math.abs(data[i + 2] - sb) <= tolerance &&
    Math.abs(data[i + 3] - sa) <= tolerance;
  const stack = [[x, y]];
  const visited = new Uint8Array(w * h);
  const selectionCanvas = document.createElement("canvas");
  selectionCanvas.width = w;
  selectionCanvas.height = h;
  const selCtx = selectionCanvas.getContext("2d")!;
  selCtx.fillStyle = "rgba(0,0,0,0)";
  selCtx.fillRect(0, 0, w, h);
  selCtx.fillStyle = "rgba(255,255,255,1)";
  while (stack.length) {
    const [cx, cy] = stack.pop()!;
    if (cx < 0 || cy < 0 || cx >= w || cy >= h) continue;
    const p = cy * w + cx;
    if (visited[p]) continue;
    const i = p * 4;
    if (!match(i)) continue;
    visited[p] = 1;
    selCtx.fillRect(cx, cy, 1, 1);
    stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
  }
  return selectionCanvas;
};

const hexToRgba = (hex: string, a = 255): [number, number, number, number] => {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return [r, g, b, a];
};

const newCanvas = (w: number, h: number): HTMLCanvasElement => {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  return c;
};

const BLEND_MODES: GlobalCompositeOperation[] = [
  "source-over", "multiply", "screen", "overlay", "darken", "lighten",
  "color-dodge", "color-burn", "hard-light", "soft-light", "difference",
  "exclusion", "hue", "saturation", "color", "luminosity",
];

/* ============================================================
   Gradient drawing
============================================================ */
const drawLinearGradient = (
  ctx: CanvasRenderingContext2D,
  start: { x: number; y: number },
  end: { x: number; y: number },
  colors: string[],
  opacity: number,
) => {
  const gradient = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
  colors.forEach((c, i) => gradient.addColorStop(i / (colors.length - 1), c));
  ctx.globalAlpha = opacity;
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

/* ============================================================
   Star & polygon drawing
============================================================ */
const drawStar = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  points: number,
  strokeStyle: string,
  lineWidth: number,
) => {
  let rot = Math.PI / 2 * 3;
  const step = Math.PI / points;
  ctx.beginPath();
  for (let i = 0; i < points; i++) {
    const x1 = cx + Math.cos(rot) * outerRadius;
    const y1 = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x1, y1);
    rot += step;
    const x2 = cx + Math.cos(rot) * innerRadius;
    const y2 = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x2, y2);
    rot += step;
  }
  ctx.closePath();
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
};

const drawPolygon = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  sides: number,
  strokeStyle: string,
  lineWidth: number,
) => {
  ctx.beginPath();
  for (let i = 0; i <= sides; i++) {
    const angle = (i * 2 * Math.PI / sides) - Math.PI / 2;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
};

/* ============================================================
   Main component
============================================================ */
export const ImageEditor = ({ src, fileName = "image" }: ImageEditorProps) => {
  const viewCanvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const originalImgRef = useRef<HTMLImageElement | null>(null);
  const [docSize, setDocSize] = useState<{ w: number; h: number } | null>(null);

  const [tool, setTool] = useState<Tool>("brush");
  const [brushSize, setBrushSize] = useState(24);
  const [opacity, setOpacity] = useState(100);
  const [color, setColor] = useState("#ff3366");
  const [secondaryColor, setSecondaryColor] = useState("#111111");
  const [tolerance, setTolerance] = useState(32);
  const [fontSize, setFontSize] = useState(48);
  const [fontFamily, setFontFamily] = useState("Inter");

  const [layers, setLayers] = useState<Layer[]>([]);
  const layersRef = useRef<Layer[]>([]);
  useEffect(() => { layersRef.current = layers; }, [layers]);

  const [activeLayerId, setActiveLayerId] = useState<string>("");

  const [adj, setAdj] = useState({
    brightness: 100, contrast: 100, saturation: 100, hue: 0, exposure: 0,
    temperature: 0, tint: 0, vibrance: 0, gamma: 100, highlights: 0, shadows: 0,
  });
  const [filter, setFilter] = useState<FilterName>("none");
  const [adjustedBase, setAdjustedBase] = useState<HTMLCanvasElement | null>(null);
  const adjustedBaseRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => { adjustedBaseRef.current = adjustedBase; }, [adjustedBase]);

  const [zoom, setZoom] = useState(100);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const panRef = useRef({ x: 0, y: 0, startX: 0, startY: 0, dragging: false });

  const [isDrawing, setIsDrawing] = useState(false);
  const lastPtRef = useRef<{ x: number; y: number } | null>(null);
  const shapeStartRef = useRef<{ x: number; y: number } | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const historyRef = useRef<HistoryEntry[]>([]);
  const historyStepRef = useRef(-1);
  useEffect(() => { historyRef.current = history; }, [history]);
  useEffect(() => { historyStepRef.current = historyStep; }, [historyStep]);
  const HISTORY_MAX = 30;

  // Crop state (with handles)
  type CropRect = {
    x: number; y: number; w: number; h: number;
    isDragging?: boolean;
    dragHandle?: "nw" | "n" | "ne" | "w" | "e" | "sw" | "s" | "se" | "move";
  };
  const [cropRect, setCropRect] = useState<CropRect | null>(null);
  const cropStartRef = useRef<{ x: number; y: number; origRect: CropRect } | null>(null);

  const docSizeRef = useRef<{ w: number; h: number } | null>(null);
  useEffect(() => { docSizeRef.current = docSize; }, [docSize]);

  // Text annotations
  const [textAnnotations, setTextAnnotations] = useState<TextAnnotation[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);

  // Compare original
  const [compareOriginal, setCompareOriginal] = useState(false);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) setCompareOriginal(true);
    };
    const handleKeyUp = () => setCompareOriginal(false);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Shortcuts panel visibility
  const [showShortcuts, setShowShortcuts] = useState(false);
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "?") {
        e.preventDefault();
        setShowShortcuts(v => !v);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Export resize state
  const [exportWidth, setExportWidth] = useState<number | "">("");
  const [exportHeight, setExportHeight] = useState<number | "">("");
  const [keepAspect, setKeepAspect] = useState(true);

  /* ============================================================
     Init
  ============================================================ */
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      originalImgRef.current = img;
      const base = newCanvas(img.width, img.height);
      base.getContext("2d")!.drawImage(img, 0, 0);
      const baseLayer: Layer = {
        id: "base", name: "Background", visible: true,
        opacity: 100, blendMode: "source-over", canvas: base, locked: false,
      };
      setDocSize({ w: img.width, h: img.height });
      setLayers([baseLayer]);
      setActiveLayerId("base");
      setHistory([]);
      setHistoryStep(-1);
      historyRef.current = [];
      historyStepRef.current = -1;
      setTimeout(() => fitToScreen(img.width, img.height), 100);
    };
    img.src = src;
  }, [src]);

  /* Recompute adjusted base */
  useEffect(() => {
    if (!originalImgRef.current || !docSizeRef.current) return;
    const ds = docSizeRef.current;
    const c = newCanvas(ds.w, ds.h);
    const ctx = c.getContext("2d")!;
    ctx.drawImage(originalImgRef.current, 0, 0);
    let id = ctx.getImageData(0, 0, c.width, c.height);
    id = applyAdjustments(id, adj);
    id = applyFilter(id, filter);
    ctx.putImageData(id, 0, 0);
    setAdjustedBase(c);
  }, [adj, filter]);

  /* ============================================================
     Composite render (including text annotations & crop handles)
  ============================================================ */
  const composite = useCallback(() => {
    const view = viewCanvasRef.current;
    const ds = docSizeRef.current;
    if (!view || !ds) return;
    view.width = ds.w;
    view.height = ds.h;
    const ctx = view.getContext("2d")!;
    ctx.clearRect(0, 0, view.width, view.height);
    
    // Composite layers
    layersRef.current.forEach((layer) => {
      if (!layer.visible) return;
      ctx.globalAlpha = layer.opacity / 100;
      ctx.globalCompositeOperation = layer.blendMode;
      if (layer.id === "base" && adjustedBaseRef.current && !compareOriginal) {
        ctx.drawImage(adjustedBaseRef.current, 0, 0);
      } else if (layer.id === "base" && compareOriginal && originalImgRef.current) {
        ctx.drawImage(originalImgRef.current, 0, 0);
      } else {
        ctx.drawImage(layer.canvas, 0, 0);
      }
    });
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";

    // Draw text annotations
    textAnnotations.forEach((txt) => {
      if (txt.layerId !== activeLayerId) return;
      ctx.font = `${txt.fontSize}px ${txt.fontFamily}, sans-serif`;
      ctx.fillStyle = txt.color;
      ctx.shadowBlur = 0;
      ctx.fillText(txt.text, txt.x, txt.y);
      if (selectedTextId === txt.id) {
        const metrics = ctx.measureText(txt.text);
        const w = metrics.width;
        const h = txt.fontSize;
        ctx.strokeStyle = "#09f";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(txt.x - 2, txt.y - h + 2, w + 4, h + 2);
        ctx.setLineDash([]);
      }
    });

    // Draw crop overlay and handles
    const currentTool = toolRef.current;
    const currentCropRect = cropRectRef.current;
    if (currentTool === "crop" && currentCropRect && currentCropRect.w > 0 && currentCropRect.h > 0) {
      ctx.save();
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.fillRect(0, 0, view.width, view.height);
      ctx.clearRect(currentCropRect.x, currentCropRect.y, currentCropRect.w, currentCropRect.h);
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(currentCropRect.x, currentCropRect.y, currentCropRect.w, currentCropRect.h);
      ctx.setLineDash([]);
      // Draw 8 handles
      ctx.fillStyle = "white";
      const handleSize = 8;
      const handles = [
        { x: currentCropRect.x, y: currentCropRect.y, name: "nw" },
        { x: currentCropRect.x + currentCropRect.w/2 - handleSize/2, y: currentCropRect.y, name: "n" },
        { x: currentCropRect.x + currentCropRect.w - handleSize, y: currentCropRect.y, name: "ne" },
        { x: currentCropRect.x, y: currentCropRect.y + currentCropRect.h/2 - handleSize/2, name: "w" },
        { x: currentCropRect.x + currentCropRect.w - handleSize, y: currentCropRect.y + currentCropRect.h/2 - handleSize/2, name: "e" },
        { x: currentCropRect.x, y: currentCropRect.y + currentCropRect.h - handleSize, name: "sw" },
        { x: currentCropRect.x + currentCropRect.w/2 - handleSize/2, y: currentCropRect.y + currentCropRect.h - handleSize, name: "s" },
        { x: currentCropRect.x + currentCropRect.w - handleSize, y: currentCropRect.y + currentCropRect.h - handleSize, name: "se" },
      ];
      for (const h of handles) {
        ctx.fillRect(h.x, h.y, handleSize, handleSize);
        ctx.strokeRect(h.x, h.y, handleSize, handleSize);
      }
      ctx.restore();
    }
    if (previewCanvasRef.current) {
      ctx.drawImage(previewCanvasRef.current, 0, 0);
    }
  }, [compareOriginal, textAnnotations, selectedTextId]);

  const toolRef = useRef<Tool>("brush");
  useEffect(() => { toolRef.current = tool; }, [tool]);
  const cropRectRef = useRef<typeof cropRect>(null);
  useEffect(() => { cropRectRef.current = cropRect; }, [cropRect]);

  useEffect(() => { composite(); }, [layers, adjustedBase, tool, cropRect, compareOriginal, textAnnotations, selectedTextId, composite]);

  /* ============================================================
     History (unchanged)
  ============================================================ */
  const snapshot = useCallback(() => {
    const currentLayers = layersRef.current;
    const entry: HistoryEntry = {
      layerMeta: currentLayers.map((l) => ({
        id: l.id,
        name: l.name,
        visible: l.visible,
        opacity: l.opacity,
        blendMode: l.blendMode,
        locked: l.locked,
        data: l.id === "base" ? null : l.canvas.toDataURL(),
      })),
    };
    const currentStep = historyStepRef.current;
    const currentHistory = historyRef.current;
    const trimmed = currentHistory.slice(0, currentStep + 1);
    const next = [...trimmed, entry].slice(-HISTORY_MAX);
    historyRef.current = next;
    historyStepRef.current = next.length - 1;
    setHistory(next);
    setHistoryStep(next.length - 1);
  }, []);

  const restoreSnap = useCallback((entry: HistoryEntry) => {
    const ds = docSizeRef.current;
    if (!ds) return;
    const currentLayers = layersRef.current;
    const next: Layer[] = entry.layerMeta.map((meta) => {
      if (meta.id === "base") {
        const existing = currentLayers.find((l) => l.id === "base");
        return { ...meta, canvas: existing?.canvas ?? newCanvas(ds.w, ds.h) } as Layer;
      }
      const c = newCanvas(ds.w, ds.h);
      if (meta.data) {
        const img = new Image();
        img.onload = () => { c.getContext("2d")!.drawImage(img, 0, 0); composite(); };
        img.src = meta.data;
      }
      return { ...meta, canvas: c } as Layer;
    });
    setLayers(next);
  }, [composite]);

  const undo = useCallback(() => {
    if (historyStepRef.current <= 0) return;
    const newStep = historyStepRef.current - 1;
    restoreSnap(historyRef.current[newStep]);
    historyStepRef.current = newStep;
    setHistoryStep(newStep);
  }, [restoreSnap]);

  const redo = useCallback(() => {
    if (historyStepRef.current >= historyRef.current.length - 1) return;
    const newStep = historyStepRef.current + 1;
    restoreSnap(historyRef.current[newStep]);
    historyStepRef.current = newStep;
    setHistoryStep(newStep);
  }, [restoreSnap]);

  /* ============================================================
     Coordinate mapping
  ============================================================ */
  const getDocCoords = (e: React.MouseEvent) => {
    const view = viewCanvasRef.current;
    if (!view) return null;
    const rect = view.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * view.width;
    const y = ((e.clientY - rect.top) / rect.height) * view.height;
    return { x, y };
  };

  /* ============================================================
     Drawing primitives (brush, erase, restore, blur, etc.) – unchanged
     (keep original functions from your code)
  ============================================================ */
  const getActiveLayer = () => layersRef.current.find((l) => l.id === activeLayerId);

  const ensurePreview = () => {
    const ds = docSizeRef.current;
    if (!ds) return null;
    if (!previewCanvasRef.current) previewCanvasRef.current = newCanvas(ds.w, ds.h);
    return previewCanvasRef.current;
  };

  const clearPreview = () => {
    if (previewCanvasRef.current) {
      const c = previewCanvasRef.current;
      c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
    }
  };

  const drawBrushStroke = (
    ctx: CanvasRenderingContext2D,
    from: { x: number; y: number },
    to: { x: number; y: number },
  ) => {
    const ds = docSizeRef.current;
    ctx.save();
    ctx.globalAlpha = opacity / 100;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (toolRef.current === "erase") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
    } else if (toolRef.current === "restore") {
      if (!originalImgRef.current || !ds) { ctx.restore(); return; }
      const tmp = newCanvas(ds.w, ds.h);
      tmp.getContext("2d")!.drawImage(originalImgRef.current, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      const mask = newCanvas(ds.w, ds.h);
      const mctx = mask.getContext("2d")!;
      mctx.lineWidth = brushSize;
      mctx.lineCap = "round";
      mctx.lineJoin = "round";
      mctx.strokeStyle = "#fff";
      mctx.beginPath();
      mctx.moveTo(from.x, from.y); mctx.lineTo(to.x, to.y); mctx.stroke();
      mctx.globalCompositeOperation = "source-in";
      mctx.drawImage(tmp, 0, 0);
      ctx.drawImage(mask, 0, 0);
      ctx.restore();
      return;
    } else if (toolRef.current === "blur") {
      const radius = brushSize;
      const sx = Math.max(0, Math.floor(to.x - radius));
      const sy = Math.max(0, Math.floor(to.y - radius));
      const sw = Math.min(ctx.canvas.width - sx, radius * 2);
      const sh = Math.min(ctx.canvas.height - sy, radius * 2);
      if (sw > 0 && sh > 0) {
        const patch = ctx.getImageData(sx, sy, sw, sh);
        convolve(patch, [1, 1, 1, 1, 1, 1, 1, 1, 1], 9, 0);
        ctx.putImageData(patch, sx, sy);
      }
      ctx.restore();
      return;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
    }

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.restore();
  };

  const renderShapePreview = (start: { x: number; y: number }, cur: { x: number; y: number }) => {
    const c = ensurePreview(); if (!c) return;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.save();
    ctx.globalAlpha = opacity / 100;
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(2, brushSize / 4);
    const t = toolRef.current;
    if (t === "rect") ctx.strokeRect(start.x, start.y, cur.x - start.x, cur.y - start.y);
    else if (t === "ellipse") {
      ctx.beginPath();
      ctx.ellipse((start.x + cur.x)/2, (start.y + cur.y)/2, Math.abs(cur.x - start.x)/2, Math.abs(cur.y - start.y)/2, 0, 0, Math.PI*2);
      ctx.stroke();
    } else if (t === "line") { ctx.beginPath(); ctx.moveTo(start.x, start.y); ctx.lineTo(cur.x, cur.y); ctx.stroke(); }
    else if (t === "star") {
      const radius = Math.hypot(cur.x - start.x, cur.y - start.y);
      drawStar(ctx, start.x, start.y, radius, radius * 0.4, 5, color, Math.max(2, brushSize/4));
    } else if (t === "polygon") {
      const radius = Math.hypot(cur.x - start.x, cur.y - start.y);
      drawPolygon(ctx, start.x, start.y, radius, 6, color, Math.max(2, brushSize/4));
    }
    ctx.restore();
  };

  const commitShape = (start: { x: number; y: number }, end: { x: number; y: number }) => {
    const activeLayer = getActiveLayer();
    if (!activeLayer) return;
    const ctx = activeLayer.canvas.getContext("2d")!;
    ctx.save();
    ctx.globalAlpha = opacity / 100;
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(2, brushSize / 4);
    const t = toolRef.current;
    if (t === "rect") ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
    else if (t === "ellipse") {
      ctx.beginPath();
      ctx.ellipse((start.x + end.x)/2, (start.y + end.y)/2, Math.abs(end.x - start.x)/2, Math.abs(end.y - start.y)/2, 0, 0, Math.PI*2);
      ctx.stroke();
    } else if (t === "line") { ctx.beginPath(); ctx.moveTo(start.x, start.y); ctx.lineTo(end.x, end.y); ctx.stroke(); }
    else if (t === "star") {
      const radius = Math.hypot(end.x - start.x, end.y - start.y);
      drawStar(ctx, start.x, start.y, radius, radius * 0.4, 5, color, Math.max(2, brushSize/4));
    } else if (t === "polygon") {
      const radius = Math.hypot(end.x - start.x, end.y - start.y);
      drawPolygon(ctx, start.x, start.y, radius, 6, color, Math.max(2, brushSize/4));
    } else if (t === "gradient") {
      drawLinearGradient(ctx, start, end, [color, secondaryColor], opacity/100);
    }
    ctx.restore();
    clearPreview();
  };

  // Helper for crop handle hit detection
  const getHitHandle = (pt: { x: number; y: number }, rect: CropRect) => {
    const handleSize = 8;
    const handles = [
      { x: rect.x, y: rect.y, name: "nw" as const },
      { x: rect.x + rect.w/2 - handleSize/2, y: rect.y, name: "n" as const },
      { x: rect.x + rect.w - handleSize, y: rect.y, name: "ne" as const },
      { x: rect.x, y: rect.y + rect.h/2 - handleSize/2, name: "w" as const },
      { x: rect.x + rect.w - handleSize, y: rect.y + rect.h/2 - handleSize/2, name: "e" as const },
      { x: rect.x, y: rect.y + rect.h - handleSize, name: "sw" as const },
      { x: rect.x + rect.w/2 - handleSize/2, y: rect.y + rect.h - handleSize, name: "s" as const },
      { x: rect.x + rect.w - handleSize, y: rect.y + rect.h - handleSize, name: "se" as const },
    ];
    for (const h of handles) {
      if (pt.x >= h.x && pt.x <= h.x + handleSize && pt.y >= h.y && pt.y <= h.y + handleSize)
        return h.name;
    }
    return null;
  };

  /* ============================================================
     Pointer handlers (extended for crop handles, gradient, magic wand, text drag)
  ============================================================ */
  const onPointerDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const pt = getDocCoords(e); if (!pt) return;
    const currentTool = toolRef.current;

    if (currentTool === "hand") {
      panRef.current = { x: pan.x, y: pan.y, startX: e.clientX, startY: e.clientY, dragging: true };
      return;
    }

    // Handle text selection/drag
    const hitText = textAnnotations.find(t => {
      const ctx = document.createElement("canvas").getContext("2d")!;
      ctx.font = `${t.fontSize}px ${t.fontFamily}, sans-serif`;
      const w = ctx.measureText(t.text).width;
      const h = t.fontSize;
      return pt.x >= t.x - 2 && pt.x <= t.x + w + 4 && pt.y >= t.y - h + 2 && pt.y <= t.y + 4;
    });
    if (hitText && currentTool === "move") {
      setSelectedTextId(hitText.id);
      // start dragging text
      const dragHandler = (moveEvent: MouseEvent) => {
        const newPt = getDocCoords(moveEvent as any);
        if (newPt) {
          setTextAnnotations(prev => prev.map(t => t.id === hitText.id ? { ...t, x: newPt.x, y: newPt.y } : t));
          composite();
        }
      };
      const upHandler = () => {
        window.removeEventListener("mousemove", dragHandler);
        window.removeEventListener("mouseup", upHandler);
        snapshot();
      };
      window.addEventListener("mousemove", dragHandler);
      window.addEventListener("mouseup", upHandler);
      return;
    }

    const activeLayer = getActiveLayer();
    if (!activeLayer || activeLayer.locked) {
      toast.error("Layer is locked or missing.");
      return;
    }

    if (currentTool === "picker") {
      const view = viewCanvasRef.current;
      if (!view) return;
      const ctx = view.getContext("2d")!;
      const p = ctx.getImageData(Math.floor(pt.x), Math.floor(pt.y), 1, 1).data;
      const hex = `#${[p[0], p[1], p[2]].map(v => v.toString(16).padStart(2, "0")).join("")}`;
      setColor(hex);
      toast.success(`Picked ${hex}`);
      return;
    }

    if (currentTool === "bucket") {
      const ctx = activeLayer.canvas.getContext("2d")!;
      floodFill(ctx, Math.floor(pt.x), Math.floor(pt.y), hexToRgba(color, Math.round((opacity/100)*255)), tolerance);
      composite();
      snapshot();
      return;
    }

    if (currentTool === "magicwand") {
      const ctx = activeLayer.canvas.getContext("2d")!;
      const selectionCanvas = magicWandSelect(ctx, Math.floor(pt.x), Math.floor(pt.y), tolerance);
      // Create a new layer from selection
      const ds = docSizeRef.current!;
      const newLayerCanvas = newCanvas(ds.w, ds.h);
      const newCtx = newLayerCanvas.getContext("2d")!;
      newCtx.drawImage(activeLayer.canvas, 0, 0);
      newCtx.globalCompositeOperation = "destination-in";
      newCtx.drawImage(selectionCanvas, 0, 0);
      const newLayer: Layer = {
        id: `magic-${Date.now()}`,
        name: "Magic selection",
        visible: true, opacity: 100, blendMode: "source-over",
        canvas: newLayerCanvas, locked: false,
      };
      setLayers(prev => [...prev, newLayer]);
      setActiveLayerId(newLayer.id);
      toast.success("Selected area extracted to new layer.");
      snapshot();
      return;
    }

    if (currentTool === "crop") {
      // Existing crop rect handling
      if (cropRect && cropRect.w > 0 && cropRect.h > 0) {
        const handle = getHitHandle(pt, cropRect);
        if (handle) {
          cropStartRef.current = { x: pt.x, y: pt.y, origRect: { ...cropRect } };
          setCropRect(prev => prev ? { ...prev, isDragging: true, dragHandle: handle } : null);
          setIsDrawing(true);
          return;
        }
        if (pt.x >= cropRect.x && pt.x <= cropRect.x + cropRect.w &&
            pt.y >= cropRect.y && pt.y <= cropRect.y + cropRect.h) {
          cropStartRef.current = { x: pt.x, y: pt.y, origRect: { ...cropRect } };
          setCropRect(prev => prev ? { ...prev, isDragging: true, dragHandle: "move" } : null);
          setIsDrawing(true);
          return;
        }
      }
      shapeStartRef.current = pt;
      setCropRect({ x: pt.x, y: pt.y, w: 0, h: 0 });
      setIsDrawing(true);
      return;
    }

    if (currentTool === "text") {
      const txt = window.prompt("Text:");
      if (!txt) return;
      const newText: TextAnnotation = {
        id: `txt-${Date.now()}`,
        text: txt,
        x: pt.x,
        y: pt.y,
        fontSize,
        fontFamily,
        color,
        layerId: activeLayerId,
      };
      setTextAnnotations(prev => [...prev, newText]);
      composite();
      snapshot();
      return;
    }

    if (currentTool === "gradient" || currentTool === "star" || currentTool === "polygon" ||
        currentTool === "rect" || currentTool === "ellipse" || currentTool === "line") {
      shapeStartRef.current = pt;
      setIsDrawing(true);
      return;
    }

    // Brush family
    setIsDrawing(true);
    lastPtRef.current = pt;
    const ctx = activeLayer.canvas.getContext("2d")!;
    drawBrushStroke(ctx, pt, pt);
    composite();
  };

  const onPointerMove = (e: React.MouseEvent) => {
    const currentTool = toolRef.current;
    if (currentTool === "hand" && panRef.current.dragging) {
      setPan({
        x: panRef.current.x + (e.clientX - panRef.current.startX),
        y: panRef.current.y + (e.clientY - panRef.current.startY),
      });
      return;
    }
    if (!isDrawing) return;
    const pt = getDocCoords(e); if (!pt) return;

    if (currentTool === "crop" && cropRect && cropStartRef.current) {
      const { x: startX, y: startY, origRect } = cropStartRef.current;
      const dx = pt.x - startX;
      const dy = pt.y - startY;
      let newRect = { ...origRect };
      const handle = cropRect.dragHandle;
      if (handle === "move") {
        newRect.x = origRect.x + dx;
        newRect.y = origRect.y + dy;
      } else {
        let left = origRect.x, right = origRect.x + origRect.w;
        let top = origRect.y, bottom = origRect.y + origRect.h;
        if (handle?.includes("w")) left = Math.min(right - 10, origRect.x + dx);
        if (handle?.includes("e")) right = Math.max(left + 10, origRect.x + origRect.w + dx);
        if (handle?.includes("n")) top = Math.min(bottom - 10, origRect.y + dy);
        if (handle?.includes("s")) bottom = Math.max(top + 10, origRect.y + origRect.h + dy);
        newRect = { x: left, y: top, w: right - left, h: bottom - top };
      }
      const bounds = docSizeRef.current!;
      newRect.x = Math.max(0, Math.min(bounds.w - newRect.w, newRect.x));
      newRect.y = Math.max(0, Math.min(bounds.h - newRect.h, newRect.y));
      if (newRect.w > 0 && newRect.h > 0) setCropRect({ ...newRect, isDragging: true, dragHandle: handle });
      return;
    }

    if ((currentTool === "rect" || currentTool === "ellipse" || currentTool === "line" ||
         currentTool === "star" || currentTool === "polygon" || currentTool === "gradient") && shapeStartRef.current) {
      renderShapePreview(shapeStartRef.current, pt);
      composite();
      return;
    }

    const activeLayer = getActiveLayer();
    if (!activeLayer || activeLayer.locked) return;
    const ctx = activeLayer.canvas.getContext("2d")!;
    if (lastPtRef.current) drawBrushStroke(ctx, lastPtRef.current, pt);
    lastPtRef.current = pt;
    composite();
  };

  const onPointerUp = (e: React.MouseEvent) => {
    const currentTool = toolRef.current;
    if (currentTool === "hand") { panRef.current.dragging = false; return; }
    if (!isDrawing) return;
    setIsDrawing(false);
    const pt = getDocCoords(e);

    if ((currentTool === "rect" || currentTool === "ellipse" || currentTool === "line" ||
         currentTool === "star" || currentTool === "polygon" || currentTool === "gradient") && shapeStartRef.current && pt) {
      commitShape(shapeStartRef.current, pt);
      composite();
      snapshot();
    } else if (currentTool !== "crop") {
      snapshot();
    }
    shapeStartRef.current = null;
    lastPtRef.current = null;
    if (currentTool === "crop") {
      cropStartRef.current = null;
      setCropRect(prev => prev ? { ...prev, isDragging: false, dragHandle: undefined } : null);
    }
  };

  /* ============================================================
     Layer ops (unchanged)
  ============================================================ */
  const addLayer = () => {
    const ds = docSizeRef.current;
    if (!ds) return;
    const c = newCanvas(ds.w, ds.h);
    const layer: Layer = {
      id: `layer-${Date.now()}`,
      name: `Layer ${layersRef.current.length}`,
      visible: true, opacity: 100, blendMode: "source-over",
      canvas: c, locked: false,
    };
    setLayers((p) => [...p, layer]);
    setActiveLayerId(layer.id);
    setTimeout(snapshot, 0);
  };

  const duplicateLayer = (id: string) => {
    const ds = docSizeRef.current;
    if (!ds) return;
    const srcLayer = layersRef.current.find((l) => l.id === id);
    if (!srcLayer) return;
    const c = newCanvas(ds.w, ds.h);
    c.getContext("2d")!.drawImage(
      srcLayer.id === "base" && adjustedBaseRef.current ? adjustedBaseRef.current : srcLayer.canvas, 0, 0);
    const layer: Layer = { ...srcLayer, id: `layer-${Date.now()}`, name: `${srcLayer.name} copy`, canvas: c };
    setLayers((p) => {
      const idx = p.findIndex((l) => l.id === id);
      const arr = [...p]; arr.splice(idx + 1, 0, layer); return arr;
    });
    setActiveLayerId(layer.id);
    setTimeout(snapshot, 0);
  };

  const deleteLayer = (id: string) => {
    if (id === "base") { toast.error("Cannot delete background."); return; }
    setLayers((p) => p.filter((l) => l.id !== id));
    if (activeLayerId === id) setActiveLayerId("base");
    setTimeout(snapshot, 0);
  };

  const moveLayer = (id: string, dir: -1 | 1) => {
    setLayers((p) => {
      const idx = p.findIndex((l) => l.id === id);
      const ni = idx + dir;
      if (idx < 0 || ni < 0 || ni >= p.length) return p;
      const arr = [...p];
      const [it] = arr.splice(idx, 1);
      arr.splice(ni, 0, it);
      return arr;
    });
  };

  /* ============================================================
     View ops
  ============================================================ */
  const fitToScreen = (w?: number, h?: number) => {
    const wrap = wrapperRef.current; if (!wrap) return;
    const dw = w ?? docSizeRef.current?.w ?? 1;
    const dh = h ?? docSizeRef.current?.h ?? 1;
    const scale = Math.min((wrap.clientWidth - 40) / dw, (wrap.clientHeight - 40) / dh);
    setZoom(Math.max(5, Math.floor(scale * 100)));
    setPan({ x: 0, y: 0 });
  };

  /* ============================================================
     Crop apply (unchanged logic)
  ============================================================ */
  const applyCrop = () => {
    const ds = docSizeRef.current;
    if (!cropRect || !ds) return;
    const { x, y, w, h } = cropRect;
    if (w < 4 || h < 4) { toast.error("Crop area too small."); return; }
    const currentLayers = layersRef.current;
    const newLayers = currentLayers.map((l) => {
      const nc = newCanvas(w, h);
      const srcCanvas = l.id === "base" && adjustedBaseRef.current ? adjustedBaseRef.current : l.canvas;
      nc.getContext("2d")!.drawImage(srcCanvas, -x, -y);
      return { ...l, canvas: nc };
    });
    const newOrig = newCanvas(w, h);
    newOrig.getContext("2d")!.drawImage(originalImgRef.current!, -x, -y);
    const img = new Image();
    img.onload = () => { originalImgRef.current = img; snapshot(); };
    img.src = newOrig.toDataURL();
    setDocSize({ w, h });
    setLayers(newLayers);
    setCropRect(null);
    setTool("brush");
    toast.success("Cropped.");
  };

  /* ============================================================
     Transform
  ============================================================ */
  const rotate90 = () => {
    const ds = docSizeRef.current;
    if (!ds) return;
    const { w, h } = ds;
    const currentLayers = layersRef.current;
    const newLayers = currentLayers.map((l) => {
      const nc = newCanvas(h, w);
      const ctx = nc.getContext("2d")!;
      ctx.translate(h, 0); ctx.rotate(Math.PI / 2);
      ctx.drawImage(l.id === "base" && adjustedBaseRef.current ? adjustedBaseRef.current : l.canvas, 0, 0);
      return { ...l, canvas: nc };
    });
    const orig = newCanvas(h, w);
    const octx = orig.getContext("2d")!;
    octx.translate(h, 0); octx.rotate(Math.PI / 2);
    octx.drawImage(originalImgRef.current!, 0, 0);
    const img = new Image();
    img.onload = () => { originalImgRef.current = img; };
    img.src = orig.toDataURL();
    setDocSize({ w: h, h: w });
    setLayers(newLayers);
    setTimeout(snapshot, 0);
  };

  const flip = (axis: "h" | "v") => {
    const ds = docSizeRef.current;
    if (!ds) return;
    const currentLayers = layersRef.current;
    const newLayers = currentLayers.map((l) => {
      const nc = newCanvas(ds.w, ds.h);
      const ctx = nc.getContext("2d")!;
      if (axis === "h") { ctx.translate(ds.w, 0); ctx.scale(-1, 1); }
      else { ctx.translate(0, ds.h); ctx.scale(1, -1); }
      ctx.drawImage(l.id === "base" && adjustedBaseRef.current ? adjustedBaseRef.current : l.canvas, 0, 0);
      return { ...l, canvas: nc };
    });
    setLayers(newLayers);
    setTimeout(snapshot, 0);
  };

  /* ============================================================
     Export with resize
  ============================================================ */
  const exportImage = (format: "png" | "jpeg" | "webp", quality = 0.92, customWidth?: number, customHeight?: number) => {
    const view = viewCanvasRef.current; if (!view) return;
    let exportCanvas = view;
    if (customWidth && customHeight && customWidth > 0 && customHeight > 0) {
      exportCanvas = newCanvas(customWidth, customHeight);
      const ctx = exportCanvas.getContext("2d")!;
      ctx.drawImage(view, 0, 0, customWidth, customHeight);
    }
    const url = exportCanvas.toDataURL(`image/${format}`, quality);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName.replace(/\.[^.]+$/, "")}-edited.${format}`;
    a.click();
    toast.success(`Exported as ${format.toUpperCase()}`);
  };

  /* ============================================================
     Keyboard shortcuts (add ? for panel, Alt for compare)
  ============================================================ */
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const k = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && k === "z") { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
      if ((e.ctrlKey || e.metaKey) && k === "y") { e.preventDefault(); redo(); return; }
      const map: Record<string, Tool> = {
        b: "brush", e: "erase", r: "restore", i: "picker",
        g: "bucket", u: "rect", o: "ellipse", l: "line", t: "text",
        c: "crop", v: "move", h: "hand", s: "star", p: "polygon",
      };
      if (map[k]) setTool(map[k]);
      if (k === "[") setBrushSize((p) => Math.max(1, p - 4));
      if (k === "]") setBrushSize((p) => Math.min(400, p + 4));
      if (k === "x") { setColor(secondaryColor); setSecondaryColor(color); }
      if (k === "+" || k === "=") setZoom((z) => Math.min(800, z + 10));
      if (k === "-") setZoom((z) => Math.max(5, z - 10));
      if (k === "0") fitToScreen();
      if (k === "?") setShowShortcuts(v => !v);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [undo, redo, color, secondaryColor]);

  /* ============================================================
     UI helpers
  ============================================================ */
  const ToolBtn = ({ id, label, icon: Icon }: { id: Tool; label: string; icon: React.ComponentType<{ className?: string }> }) => (
    <button
      onClick={() => setTool(id)}
      title={label}
      className={`flex h-10 w-10 items-center justify-center rounded-md transition-all ${
        tool === id ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );

  const isBrushLike = ["brush", "erase", "restore", "blur", "paint", "rect", "ellipse", "line", "star", "polygon", "gradient"].includes(tool);

  return (
    <div className="flex h-[calc(100vh-4rem)] min-h-[640px] w-full overflow-auto rounded-xl border border-border bg-card text-card-foreground">
      {/* Shortcuts modal */}
      {showShortcuts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowShortcuts(false)}>
          <div className="max-h-[80vh] w-full max-w-2xl overflow-auto rounded-lg bg-background p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <h2 className="mb-4 text-xl font-bold">Keyboard Shortcuts</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><kbd className="rounded bg-muted px-2 py-1 font-mono">B</kbd> Brush</div>
              <div><kbd className="rounded bg-muted px-2 py-1 font-mono">E</kbd> Eraser</div>
              <div><kbd className="rounded bg-muted px-2 py-1 font-mono">R</kbd> Restore</div>
              <div><kbd className="rounded bg-muted px-2 py-1 font-mono">I</kbd> Color Picker</div>
              <div><kbd className="rounded bg-muted px-2 py-1 font-mono">G</kbd> Bucket</div>
              <div><kbd className="rounded bg-muted px-2 py-1 font-mono">U</kbd> Rectangle</div>
              <div><kbd className="rounded bg-muted px-2 py-1 font-mono">O</kbd> Ellipse</div>
              <div><kbd className="rounded bg-muted px-2 py-1 font-mono">L</kbd> Line</div>
              <div><kbd className="rounded bg-muted px-2 py-1 font-mono">T</kbd> Text</div>
              <div><kbd className="rounded bg-muted px-2 py-1 font-mono">C</kbd> Crop</div>
              <div><kbd className="rounded bg-muted px-2 py-1 font-mono">V</kbd> Move</div>
              <div><kbd className="rounded bg-muted px-2 py-1 font-mono">H</kbd> Hand</div>
              <div><kbd className="rounded bg-muted px-2 py-1 font-mono">S</kbd> Star</div>
              <div><kbd className="rounded bg-muted px-2 py-1 font-mono">P</kbd> Polygon</div>
              <div><kbd className="rounded bg-muted px-2 py-1 font-mono">[ ]</kbd> Decrease/Increase brush size</div>
              <div><kbd className="rounded bg-muted px-2 py-1 font-mono">X</kbd> Swap colors</div>
              <div><kbd className="rounded bg-muted px-2 py-1 font-mono">Ctrl+Z</kbd> Undo</div>
              <div><kbd className="rounded bg-muted px-2 py-1 font-mono">Ctrl+Shift+Z / Ctrl+Y</kbd> Redo</div>
              <div><kbd className="rounded bg-muted px-2 py-1 font-mono">+ / -</kbd> Zoom in/out</div>
              <div><kbd className="rounded bg-muted px-2 py-1 font-mono">0</kbd> Fit to screen</div>
              <div><kbd className="rounded bg-muted px-2 py-1 font-mono">Alt</kbd> Hold to compare with original</div>
              <div><kbd className="rounded bg-muted px-2 py-1 font-mono">?</kbd> Show/hide this panel</div>
            </div>
            <Button className="mt-6 w-full" onClick={() => setShowShortcuts(false)}>Close</Button>
          </div>
        </div>
      )}

      {/* Left tool rail */}
      <aside className="flex w-14 flex-col items-center gap-1 border-r border-border bg-muted/30 p-2">
        <ToolBtn id="move" label="Move (V)" icon={Move} />
        <ToolBtn id="hand" label="Hand (H)" icon={Hand} />
        <div className="my-1 h-px w-8 bg-border" />
        <ToolBtn id="brush" label="Brush (B)" icon={Paintbrush} />
        <ToolBtn id="erase" label="Erase (E)" icon={Eraser} />
        <ToolBtn id="restore" label="Restore (R)" icon={Wand2} />
        <ToolBtn id="bucket" label="Bucket (G)" icon={PaintBucket} />
        <ToolBtn id="blur" label="Blur" icon={Sparkles} />
        <ToolBtn id="picker" label="Picker (I)" icon={Pipette} />
        <ToolBtn id="magicwand" label="Magic Wand" icon={Blend} />
        <div className="my-1 h-px w-8 bg-border" />
        <ToolBtn id="rect" label="Rect (U)" icon={Square} />
        <ToolBtn id="ellipse" label="Ellipse (O)" icon={CircleIcon} />
        <ToolBtn id="line" label="Line (L)" icon={Minus} />
        <ToolBtn id="star" label="Star (S)" icon={Star} />
        <ToolBtn id="polygon" label="Polygon (P)" icon={Hexagon} />
        <ToolBtn id="gradient" label="Gradient" icon={Palette} />
        <ToolBtn id="text" label="Text (T)" icon={TypeIcon} />
        <div className="my-1 h-px w-8 bg-border" />
        <ToolBtn id="crop" label="Crop (C)" icon={CropIcon} />
        <div className="mt-auto flex flex-col items-center gap-2">
          <button
            onClick={() => { const c = color; setColor(secondaryColor); setSecondaryColor(c); }}
            title="Swap colors (X)"
            className="relative h-10 w-10"
          >
            <span className="absolute right-0 top-0 h-6 w-6 rounded border-2 border-background" style={{ background: secondaryColor }} />
            <span className="absolute bottom-0 left-0 h-6 w-6 rounded border-2 border-background" style={{ background: color }} />
          </button>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-8 w-8 cursor-pointer rounded border border-border bg-transparent"
            title="Foreground color"
          />
        </div>
      </aside>

      {/* Center column */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top option bar with responsive wrap */}
        <div className="flex flex-wrap items-center gap-3 border-b border-border bg-muted/20 px-4 py-2 text-sm overflow-x-auto">
          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{tool}</span>
          <div className="h-4 w-px bg-border" />

          {isBrushLike && (
            <>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Size</span>
                <Slider value={[brushSize]} min={1} max={400} step={1} onValueChange={(v) => setBrushSize(v[0])} className="w-32" />
                <span className="w-10 text-xs tabular-nums">{brushSize}px</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Opacity</span>
                <Slider value={[opacity]} min={1} max={100} step={1} onValueChange={(v) => setOpacity(v[0])} className="w-24" />
                <span className="w-10 text-xs tabular-nums">{opacity}%</span>
              </div>
            </>
          )}

          {(tool === "bucket" || tool === "magicwand") && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Tolerance</span>
              <Slider value={[tolerance]} min={0} max={128} step={1} onValueChange={(v) => setTolerance(v[0])} className="w-32" />
              <span className="w-8 text-xs tabular-nums">{tolerance}</span>
            </div>
          )}

          {tool === "text" && (
            <>
              <input
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="h-8 w-32 rounded-md border border-border bg-background px-2 text-xs"
                placeholder="Font family"
              />
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Size</span>
                <Slider value={[fontSize]} min={8} max={240} step={1} onValueChange={(v) => setFontSize(v[0])} className="w-32" />
                <span className="w-10 text-xs tabular-nums">{fontSize}px</span>
              </div>
            </>
          )}

          {tool === "crop" && cropRect && cropRect.w > 4 && cropRect.h > 4 && (
            <Button size="sm" onClick={applyCrop} className="ml-2">Apply crop</Button>
          )}

          <div className="ml-auto flex shrink-0 items-center gap-1">
            <Button size="sm" variant="ghost" onClick={undo} disabled={historyStep <= 0}><Undo2 className="h-4 w-4" /></Button>
            <Button size="sm" variant="ghost" onClick={redo} disabled={historyStep >= history.length - 1}><Redo2 className="h-4 w-4" /></Button>
            <div className="mx-1 h-4 w-px bg-border" />
            <Button size="sm" variant="ghost" onClick={() => setZoom((z) => Math.max(5, z - 10))}><ZoomOut className="h-4 w-4" /></Button>
            <span className="w-12 text-center text-xs tabular-nums">{zoom}%</span>
            <Button size="sm" variant="ghost" onClick={() => setZoom((z) => Math.min(800, z + 10))}><ZoomIn className="h-4 w-4" /></Button>
            <Button size="sm" variant="ghost" onClick={() => fitToScreen()}><Maximize2 className="h-4 w-4" /></Button>
            <div className="mx-1 h-4 w-px bg-border" />
            <Button size="sm" variant="ghost" onClick={() => setShowShortcuts(true)}><HelpCircle className="h-4 w-4" /></Button>
            <div className="mx-1 h-4 w-px bg-border" />
            {/* Export with resize dropdown */}
            <div className="relative group">
              <Button size="sm" className="gap-1"><Download className="h-4 w-4" /> Export</Button>
              <div className="absolute right-0 top-full mt-1 hidden w-64 rounded-md border border-border bg-background p-2 shadow-lg group-hover:block z-20">
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <input type="checkbox" checked={keepAspect} onChange={e => setKeepAspect(e.target.checked)} className="h-3 w-3" />
                    <span className="text-xs">Keep aspect ratio</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Width"
                      value={exportWidth}
                      onChange={e => {
                        const val = e.target.value === "" ? "" : Number(e.target.value);
                        setExportWidth(val);
                        if (keepAspect && docSize && val !== "" && typeof val === "number") {
                          const ratio = docSize.h / docSize.w;
                          setExportHeight(Math.round(val * ratio));
                        }
                      }}
                      className="w-full rounded border border-border bg-background px-1 py-0.5 text-xs"
                    />
                    <span className="text-xs">×</span>
                    <input
                      type="number"
                      placeholder="Height"
                      value={exportHeight}
                      onChange={e => {
                        const val = e.target.value === "" ? "" : Number(e.target.value);
                        setExportHeight(val);
                        if (keepAspect && docSize && val !== "" && typeof val === "number") {
                          const ratio = docSize.w / docSize.h;
                          setExportWidth(Math.round(val * ratio));
                        }
                      }}
                      className="w-full rounded border border-border bg-background px-1 py-0.5 text-xs"
                    />
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" onClick={() => exportImage("png", 1, exportWidth || undefined, exportHeight || undefined)} className="flex-1">PNG</Button>
                    <Button size="sm" variant="outline" onClick={() => exportImage("jpeg", 0.92, exportWidth || undefined, exportHeight || undefined)} className="flex-1">JPG</Button>
                    <Button size="sm" variant="outline" onClick={() => exportImage("webp", 0.9, exportWidth || undefined, exportHeight || undefined)} className="flex-1">WebP</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Canvas viewport */}
        <div
          ref={wrapperRef}
          className="relative flex-1 overflow-hidden bg-[linear-gradient(45deg,#222_25%,transparent_25%,transparent_75%,#222_75%),linear-gradient(45deg,#222_25%,transparent_25%,transparent_75%,#222_75%)] [background-position:0_0,12px_12px] [background-size:24px_24px]"
          style={{ backgroundColor: "#2a2a2a" }}
        >
          <div
            className="absolute left-1/2 top-1/2"
            style={{
              transform: `translate(-50%,-50%) translate(${pan.x}px, ${pan.y}px) scale(${zoom / 100})`,
              transformOrigin: "center",
            }}
          >
            <canvas
              ref={viewCanvasRef}
              onMouseDown={onPointerDown}
              onMouseMove={onPointerMove}
              onMouseUp={onPointerUp}
              onMouseLeave={onPointerUp}
              className="block shadow-2xl ring-1 ring-black/40"
              style={{ cursor: tool === "hand" ? "grab" : "crosshair" }}
            />
          </div>
          <div className="pointer-events-none absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1 font-mono text-[10px] text-white/80">
            {docSize ? `${docSize.w} × ${docSize.h}` : "—"}  ·  {zoom}%
            {compareOriginal && <span className="ml-2 text-yellow-300"> (Comparing original)</span>}
          </div>
        </div>
      </div>

      {/* Right panel - always visible with scroll */}
      <aside className="flex w-72 shrink-0 flex-col gap-3 overflow-y-auto border-l border-border bg-muted/20 p-3 text-sm">
        {/* Adjustments */}
        <section>
          <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" /> Adjustments
          </h3>
          <div className="space-y-2">
            {([
              ["brightness", -100, 200], ["contrast", 0, 200], ["saturation", 0, 200],
              ["exposure", -100, 100], ["hue", -180, 180], ["temperature", -100, 100],
              ["tint", -100, 100], ["vibrance", -100, 100], ["gamma", 10, 300],
              ["highlights", -100, 100], ["shadows", -100, 100],
            ] as const).map(([k, min, max]) => (
              <div key={k}>
                <div className="flex items-center justify-between text-xs">
                  <span className="capitalize text-muted-foreground">{k}</span>
                  <span className="tabular-nums">{adj[k]}</span>
                </div>
                <Slider
                  value={[adj[k]]} min={min} max={max} step={1}
                  onValueChange={(v) => setAdj((p) => ({ ...p, [k]: v[0] }))}
                />
              </div>
            ))}
            <Button size="sm" variant="outline" className="w-full" onClick={() => setAdj({
              brightness: 100, contrast: 100, saturation: 100, hue: 0, exposure: 0,
              temperature: 0, tint: 0, vibrance: 0, gamma: 100, highlights: 0, shadows: 0,
            })}>Reset adjustments</Button>
          </div>
        </section>

        {/* Filters */}
        <section>
          <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Wand2 className="h-3.5 w-3.5" /> Filters
          </h3>
          <div className="grid grid-cols-3 gap-1">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-md border px-2 py-1.5 text-[11px] capitalize transition-colors ${
                  filter === f ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </section>

        {/* Transform */}
        <section>
          <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <RotateCw className="h-3.5 w-3.5" /> Transform
          </h3>
          <div className="grid grid-cols-3 gap-1">
            <Button size="sm" variant="outline" onClick={rotate90} className="gap-1"><RotateCw className="h-3 w-3" />90°</Button>
            <Button size="sm" variant="outline" onClick={() => flip("h")} className="gap-1"><FlipHorizontal className="h-3 w-3" />H</Button>
            <Button size="sm" variant="outline" onClick={() => flip("v")} className="gap-1"><FlipVertical className="h-3 w-3" />V</Button>
          </div>
        </section>

        {/* Layers */}
        <section>
          <h3 className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <span className="flex items-center gap-2"><LayersIcon className="h-3.5 w-3.5" /> Layers</span>
            <button onClick={addLayer} className="rounded p-1 hover:bg-muted" title="New layer"><Plus className="h-3.5 w-3.5" /></button>
          </h3>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {[...layers].reverse().map((layer) => (
              <div
                key={layer.id}
                onClick={() => setActiveLayerId(layer.id)}
                className={`rounded-md border p-2 transition-colors ${
                  activeLayerId === layer.id ? "border-primary bg-primary/5" : "border-border bg-background/50 hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); setLayers((p) => p.map((l) => l.id === layer.id ? { ...l, visible: !l.visible } : l)); }}
                    className="shrink-0"
                  >
                    {layer.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}
                  </button>
                  <input
                    value={layer.name}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setLayers((p) => p.map((l) => l.id === layer.id ? { ...l, name: e.target.value } : l))}
                    className="min-w-0 flex-1 bg-transparent text-xs outline-none"
                  />
                  <button onClick={(e) => { e.stopPropagation(); duplicateLayer(layer.id); }} className="rounded p-1 hover:bg-muted" title="Duplicate">
                    <Copy className="h-3 w-3" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); moveLayer(layer.id, 1); }} className="rounded p-1 hover:bg-muted">
                    <ChevronUp className="h-3 w-3" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); moveLayer(layer.id, -1); }} className="rounded p-1 hover:bg-muted">
                    <ChevronDown className="h-3 w-3" />
                  </button>
                  {layer.id !== "base" && (
                    <button onClick={(e) => { e.stopPropagation(); deleteLayer(layer.id); }} className="rounded p-1 text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <div className="mt-2 grid grid-cols-[1fr_auto] items-center gap-2">
                  <select
                    value={layer.blendMode}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setLayers((p) => p.map((l) => l.id === layer.id ? { ...l, blendMode: e.target.value as GlobalCompositeOperation } : l))}
                    className="h-6 rounded border border-border bg-background px-1 text-[10px] capitalize"
                  >
                    {BLEND_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <span className="text-[10px] tabular-nums text-muted-foreground">{layer.opacity}%</span>
                </div>
                <Slider
                  value={[layer.opacity]} min={0} max={100} step={1}
                  onValueChange={(v) => setLayers((p) => p.map((l) => l.id === layer.id ? { ...l, opacity: v[0] } : l))}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="mt-1.5"
                />
              </div>
            ))}
          </div>
        </section>

        {/* History */}
        <section>
          <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <HistoryIcon className="h-3.5 w-3.5" /> History · {historyStep + 1}/{history.length}
          </h3>
          <div className="text-[11px] text-muted-foreground">
            Ctrl/Cmd+Z undo · Shift+Ctrl/Cmd+Z redo
          </div>
        </section>
      </aside>
    </div>
  );
};

export default ImageEditor;