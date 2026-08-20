import { useState, useRef, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Upload,
  Download,
  Trash2,
  Loader2,
  Grid3x3,
  LayoutGrid,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Move,
  Palette,
  Image as ImageIcon,
  Settings,
} from "lucide-react";
import { AdWatchModal } from "@/components/AdWatchModal";
import { SEOHead } from "@/components/SEOHead";
import { isRasterImageFile } from "@/utils/imageFiles";

const MAX_IMAGE_SIZE = 15 * 1024 * 1024;
const SUPPORTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/bmp"];

interface CollageImage {
  id: string;
  image: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scale: number;
  opacity: number;
  borderRadius: number;
  isDragging: boolean;
  dragOffset: { x: number; y: number };
}

type LayoutType =
  | "grid-2x2"
  | "grid-3x3"
  | "grid-2x3"
  | "grid-3x2"
  | "horizontal"
  | "vertical"
  | "freeform"
  | "pinterest"
  | "diagonal"
  | "circle";
type BorderStyle = "none" | "solid" | "dashed" | "dotted" | "shadow";

const PhotoCollageMaker = () => {
  const [images, setImages] = useState<CollageImage[]>([]);
  const [layout, setLayout] = useState<LayoutType>("grid-2x2");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [spacing, setSpacing] = useState([20]);
  const [border, setBorder] = useState([0]);
  const [borderColor, setBorderColor] = useState("#000000");
  const [borderStyle, setBorderStyle] = useState<BorderStyle>("none");
  const [canvasWidth, setCanvasWidth] = useState(1200);
  const [canvasHeight, setCanvasHeight] = useState(800);
  const [roundCorners, setRoundCorners] = useState([0]);
  const [shadow, setShadow] = useState([0]);
  const [showAdModal, setShowAdModal] = useState(false);
  const [canDownload, setCanDownload] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("layout");
  const [imageQuality, setImageQuality] = useState(1);
  const [autoArrange, setAutoArrange] = useState(true);
  const [aspectRatio, setAspectRatio] = useState("free");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const selectedImage = images.find((img) => img.id === selectedImageId);

  useEffect(() => {
    if (images.length > 0) {
      if (autoArrange && layout !== "freeform") {
        arrangeImages();
      } else {
        drawCanvas();
      }
    }
  }, [
    images.length,
    layout,
    spacing,
    canvasWidth,
    canvasHeight,
    backgroundColor,
    border,
    borderColor,
    borderStyle,
    roundCorners,
    shadow,
    autoArrange,
  ]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.currentTarget.value = "";

    if (files.length === 0) return;

    const imageFiles = files.filter(
      (file) => isRasterImageFile(file, SUPPORTED_TYPES) && file.size <= MAX_IMAGE_SIZE,
    );

    if (imageFiles.length === 0) {
      toast.error("Please upload JPG, PNG, WebP, or BMP images under 15 MB each");
      return;
    }

    if (imageFiles.length !== files.length) {
      toast.warning("Some unsupported or oversized files were skipped");
    }

    let loadedCount = 0;
    const newImages: CollageImage[] = [];

    imageFiles.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        const finishFile = () => {
          loadedCount++;
          if (loadedCount === imageFiles.length) {
            if (newImages.length === 0) {
              toast.error("No readable images were found");
              return;
            }
            setImages((prev) => [...prev, ...newImages]);
            toast.success(`${newImages.length} images loaded!`);
          }
        };

        img.onload = () => {
          newImages.push({
            id: `${Date.now()}-${index}`,
            image: img,
            x: 0,
            y: 0,
            width: img.width,
            height: img.height,
            rotation: 0,
            scale: 1,
            opacity: 1,
            borderRadius: 0,
            isDragging: false,
            dragOffset: { x: 0, y: 0 },
          });

          finishFile();
        };
        img.onerror = finishFile;
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const calculateAspectRatioSize = (width: number, height: number) => {
    switch (aspectRatio) {
      case "1:1":
        const size = Math.min(width, height);
        return { width: size, height: size };
      case "4:3":
        return { width, height: (width * 3) / 4 };
      case "16:9":
        return { width, height: (width * 9) / 16 };
      case "3:4":
        return { width: (height * 3) / 4, height };
      case "9:16":
        return { width: (height * 9) / 16, height };
      default:
        return { width, height };
    }
  };

  const arrangeImages = () => {
    if (!canvasRef.current || images.length === 0) return;

    const canvas = canvasRef.current;
    const { width, height } = calculateAspectRatioSize(canvasWidth, canvasHeight);
    canvas.width = width;
    canvas.height = height;

    const gap = spacing[0];
    let positions: { x: number; y: number; width: number; height: number }[] = [];

    // Calculate positions based on layout
    switch (layout) {
      case "grid-2x2": {
        const cellWidth = (width - gap * 3) / 2;
        const cellHeight = (height - gap * 3) / 2;
        positions = [
          { x: gap, y: gap, width: cellWidth, height: cellHeight },
          { x: gap * 2 + cellWidth, y: gap, width: cellWidth, height: cellHeight },
          { x: gap, y: gap * 2 + cellHeight, width: cellWidth, height: cellHeight },
          { x: gap * 2 + cellWidth, y: gap * 2 + cellHeight, width: cellWidth, height: cellHeight },
        ];
        break;
      }
      case "grid-3x3": {
        const cellWidth = (width - gap * 4) / 3;
        const cellHeight = (height - gap * 4) / 3;
        for (let row = 0; row < 3; row++) {
          for (let col = 0; col < 3; col++) {
            positions.push({
              x: gap + col * (cellWidth + gap),
              y: gap + row * (cellHeight + gap),
              width: cellWidth,
              height: cellHeight,
            });
          }
        }
        break;
      }
      case "grid-2x3": {
        const cellWidth = (width - gap * 3) / 2;
        const cellHeight = (height - gap * 4) / 3;
        for (let row = 0; row < 3; row++) {
          for (let col = 0; col < 2; col++) {
            positions.push({
              x: gap + col * (cellWidth + gap),
              y: gap + row * (cellHeight + gap),
              width: cellWidth,
              height: cellHeight,
            });
          }
        }
        break;
      }
      case "grid-3x2": {
        const cellWidth = (width - gap * 4) / 3;
        const cellHeight = (height - gap * 3) / 2;
        for (let row = 0; row < 2; row++) {
          for (let col = 0; col < 3; col++) {
            positions.push({
              x: gap + col * (cellWidth + gap),
              y: gap + row * (cellHeight + gap),
              width: cellWidth,
              height: cellHeight,
            });
          }
        }
        break;
      }
      case "horizontal": {
        const cellWidth = (width - gap * (images.length + 1)) / images.length;
        const cellHeight = height - gap * 2;
        for (let i = 0; i < images.length; i++) {
          positions.push({
            x: gap + i * (cellWidth + gap),
            y: gap,
            width: cellWidth,
            height: cellHeight,
          });
        }
        break;
      }
      case "vertical": {
        const cellWidth = width - gap * 2;
        const cellHeight = (height - gap * (images.length + 1)) / images.length;
        for (let i = 0; i < images.length; i++) {
          positions.push({
            x: gap,
            y: gap + i * (cellHeight + gap),
            width: cellWidth,
            height: cellHeight,
          });
        }
        break;
      }
      case "pinterest": {
        // Masonry layout
        const columns = Math.ceil(Math.sqrt(images.length));
        const cellWidth = (width - gap * (columns + 1)) / columns;
        const columnHeights = new Array(columns).fill(gap);

        images.forEach((_, index) => {
          const columnIndex = index % columns;
          const cellHeight = cellWidth * (0.8 + Math.random() * 0.8); // Random height for Pinterest effect

          positions.push({
            x: gap + columnIndex * (cellWidth + gap),
            y: columnHeights[columnIndex],
            width: cellWidth,
            height: cellHeight,
          });

          columnHeights[columnIndex] += cellHeight + gap;
        });
        break;
      }
      case "diagonal": {
        const cellWidth = (width - gap * 2) / images.length;
        const cellHeight = (height - gap * 2) / images.length;
        for (let i = 0; i < images.length; i++) {
          positions.push({
            x: gap + i * (cellWidth * 0.8),
            y: gap + i * (cellHeight * 0.6),
            width: cellWidth,
            height: cellHeight,
          });
        }
        break;
      }
      case "circle": {
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) * 0.3;
        const angleStep = (2 * Math.PI) / images.length;

        for (let i = 0; i < images.length; i++) {
          const angle = i * angleStep;
          const cellSize = Math.min(width, height) * 0.2;

          positions.push({
            x: centerX + radius * Math.cos(angle) - cellSize / 2,
            y: centerY + radius * Math.sin(angle) - cellSize / 2,
            width: cellSize,
            height: cellSize,
          });
        }
        break;
      }
      case "freeform": {
        // Initial random positions for freeform
        images.forEach((_, index) => {
          positions.push({
            x: 50 + ((index * 100) % (width - 200)),
            y: 50 + Math.floor(index / 3) * 150,
            width: 200,
            height: 150,
          });
        });
        break;
      }
    }

    // Update images with new positions
    const updatedImages = images.map((img, index) => ({
      ...img,
      ...(index < positions.length ? positions[index] : { x: 0, y: 0, width: 100, height: 100 }),
    }));

    setImages(updatedImages);
    drawCanvas(updatedImages);
  };

  const drawCanvas = (sourceImages = images) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas and set background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw images
    sourceImages.forEach((img) => {
      drawImageOnCanvas(ctx, img);
    });
  };

  const drawImageOnCanvas = (ctx: CanvasRenderingContext2D, img: CollageImage) => {
    ctx.save();

    // Apply shadow
    if (shadow[0] > 0) {
      ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
      ctx.shadowBlur = shadow[0] * 2;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
    }

    // Apply border
    if (border[0] > 0 && borderStyle !== "none") {
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = border[0];

      if (borderStyle === "dashed") {
        ctx.setLineDash([5, 5]);
      } else if (borderStyle === "dotted") {
        ctx.setLineDash([2, 2]);
      }

      ctx.strokeRect(img.x, img.y, img.width, img.height);
      ctx.setLineDash([]);
    }

    // Apply clipping for rounded corners
    if (roundCorners[0] > 0) {
      ctx.beginPath();
      ctx.roundRect(img.x, img.y, img.width, img.height, roundCorners[0]);
      ctx.clip();
    }

    // Apply rotation and scaling
    const centerX = img.x + img.width / 2;
    const centerY = img.y + img.height / 2;
    ctx.translate(centerX, centerY);
    ctx.rotate((img.rotation * Math.PI) / 180);
    ctx.scale(img.scale, img.scale);
    ctx.translate(-centerX, -centerY);

    // Set global alpha for opacity
    ctx.globalAlpha = img.opacity;

    // Draw the image
    drawImageFit(ctx, img.image, img.x, img.y, img.width, img.height);

    ctx.restore();

    // Draw selection border
    if (img.id === selectedImageId) {
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]);
      ctx.strokeRect(img.x - 2, img.y - 2, img.width + 4, img.height + 4);
      ctx.setLineDash([]);
    }
  };

  const drawImageFit = (
    ctx: CanvasRenderingContext2D,
    image: HTMLImageElement,
    x: number,
    y: number,
    maxWidth: number,
    maxHeight: number,
  ) => {
    const imgRatio = image.width / image.height;
    const boxRatio = maxWidth / maxHeight;

    let drawWidth = maxWidth;
    let drawHeight = maxHeight;
    let offsetX = x;
    let offsetY = y;

    if (imgRatio > boxRatio) {
      // Image is wider, fit to height
      drawHeight = maxHeight;
      drawWidth = maxHeight * imgRatio;
      offsetX = x + (maxWidth - drawWidth) / 2;
    } else {
      // Image is taller, fit to width
      drawWidth = maxWidth;
      drawHeight = maxWidth / imgRatio;
      offsetY = y + (maxHeight - drawHeight) / 2;
    }

    ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find clicked image
    const clickedImage = images.find(
      (img) => x >= img.x && x <= img.x + img.width && y >= img.y && y <= img.y + img.height,
    );

    if (clickedImage) {
      setSelectedImageId(clickedImage.id);
      isDragging.current = true;
      dragStart.current = { x, y };
    } else {
      setSelectedImageId(null);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging.current || !selectedImageId || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const deltaX = x - dragStart.current.x;
    const deltaY = y - dragStart.current.y;

    setImages((prev) => {
      const updated = prev.map((img) =>
        img.id === selectedImageId ? { ...img, x: img.x + deltaX, y: img.y + deltaY } : img,
      );
      requestAnimationFrame(() => drawCanvas(updated));
      return updated;
    });

    dragStart.current = { x, y };
  };

  const handleCanvasMouseUp = () => {
    isDragging.current = false;
  };

  const updateSelectedImage = (updates: Partial<CollageImage>) => {
    if (!selectedImageId) return;

    setImages((prev) => {
      const updated = prev.map((img) => (img.id === selectedImageId ? { ...img, ...updates } : img));
      requestAnimationFrame(() => drawCanvas(updated));
      return updated;
    });
  };

  const removeImage = (id: string) => {
    setImages(images.filter((img) => img.id !== id));
    if (selectedImageId === id) {
      setSelectedImageId(null);
    }
    toast.success("Image removed");
  };

  const clearAll = () => {
    setImages([]);
    setSelectedImageId(null);
    toast.success("All images cleared");
  };

  const handleDownload = () => {
    if (images.length === 0) {
      toast.error("Please add images to create a collage");
      return;
    }

    if (!canDownload) {
      setShowAdModal(true);
      return;
    }

    downloadCollage();
  };

  const downloadCollage = () => {
    if (!canvasRef.current) return;

    setIsProcessing(true);

    // Create a high-quality canvas for download
    const downloadCanvas = document.createElement("canvas");
    const { width, height } = calculateAspectRatioSize(canvasWidth * imageQuality, canvasHeight * imageQuality);
    downloadCanvas.width = width;
    downloadCanvas.height = height;

    const ctx = downloadCanvas.getContext("2d");
    if (!ctx) {
      setIsProcessing(false);
      return;
    }

    // Draw background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, downloadCanvas.width, downloadCanvas.height);

    // Draw images with higher quality
    images.forEach((img) => {
      const scaledImg = {
        ...img,
        x: img.x * imageQuality,
        y: img.y * imageQuality,
        width: img.width * imageQuality,
        height: img.height * imageQuality,
      };
      drawImageOnCanvas(ctx, scaledImg);
    });

    setTimeout(() => {
      downloadCanvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `collage-${Date.now()}.png`;
            link.click();
            URL.revokeObjectURL(url);
            toast.success("Collage downloaded!");
          }
          setIsProcessing(false);
        },
        "image/png",
        1.0,
      );
    }, 100);
  };

  const getLayoutDescription = (layout: LayoutType) => {
    switch (layout) {
      case "grid-2x2":
        return "2x2 Grid (4 photos)";
      case "grid-3x3":
        return "3x3 Grid (9 photos)";
      case "grid-2x3":
        return "2x3 Grid (6 photos)";
      case "grid-3x2":
        return "3x2 Grid (6 photos)";
      case "horizontal":
        return "Horizontal Strip";
      case "vertical":
        return "Vertical Strip";
      case "freeform":
        return "Free Form (Drag & Drop)";
      case "pinterest":
        return "Pinterest Style";
      case "diagonal":
        return "Diagonal Layout";
      case "circle":
        return "Circular Layout";
      default:
        return layout;
    }
  };

  return (
    <>
      <SEOHead
        title="Advanced Photo Collage Maker - Create Professional Picture Collages"
        description="Create stunning photo collages with advanced features. Multiple layouts, freeform editing, borders, shadows, and more. Perfect for social media, printing, and memories."
        keywords="photo collage maker, advanced collage, picture collage, photo grid, collage creator, photo layout, image editing"
        canonical="https://toolmaster.cloud/tools/photo-collage-maker"
      />
      <ToolLayout
        title="Advanced Photo Collage Maker"
        description="Create stunning photo collages with professional editing tools"
        category="Image Tools"
        instructions={[
          "Upload multiple images (2-20+ photos supported)",
          "Choose from various layout templates or use freeform",
          "Customize borders, shadows, and effects",
          "Drag & drop to adjust individual images",
          "Download in high quality",
        ]}
        relatedTools={[
          { name: "Image Resizer", path: "/tools/image-resizer" },
          { name: "Advanced Image Editor", path: "/tools/advanced-image-editor" },
          { name: "Watermark Tool", path: "/tools/watermark-tool" },
        ]}
      >
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Controls */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label>Upload Images</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full mt-2">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Images ({images.length} selected)
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Supports multiple images at once (PNG, JPG, WebP)
                  </p>
                </div>

                {images.length > 0 && (
                  <>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="grid grid-cols-3 mb-4">
                        <TabsTrigger value="layout">
                          <LayoutGrid className="h-4 w-4 mr-2" />
                          Layout
                        </TabsTrigger>
                        <TabsTrigger value="style">
                          <Palette className="h-4 w-4 mr-2" />
                          Style
                        </TabsTrigger>
                        <TabsTrigger value="edit">
                          <Settings className="h-4 w-4 mr-2" />
                          Edit
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="layout" className="space-y-4">
                        <div>
                          <Label>Layout Template</Label>
                          <Select value={layout} onValueChange={(v) => setLayout(v as LayoutType)}>
                            <SelectTrigger className="mt-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="grid-2x2">{getLayoutDescription("grid-2x2")}</SelectItem>
                              <SelectItem value="grid-3x3">{getLayoutDescription("grid-3x3")}</SelectItem>
                              <SelectItem value="grid-2x3">{getLayoutDescription("grid-2x3")}</SelectItem>
                              <SelectItem value="grid-3x2">{getLayoutDescription("grid-3x2")}</SelectItem>
                              <SelectItem value="horizontal">{getLayoutDescription("horizontal")}</SelectItem>
                              <SelectItem value="vertical">{getLayoutDescription("vertical")}</SelectItem>
                              <SelectItem value="pinterest">{getLayoutDescription("pinterest")}</SelectItem>
                              <SelectItem value="diagonal">{getLayoutDescription("diagonal")}</SelectItem>
                              <SelectItem value="circle">{getLayoutDescription("circle")}</SelectItem>
                              <SelectItem value="freeform">{getLayoutDescription("freeform")}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch checked={autoArrange} onCheckedChange={setAutoArrange} />
                          <Label>Auto-arrange images</Label>
                        </div>

                        <div>
                          <Label>Aspect Ratio</Label>
                          <Select value={aspectRatio} onValueChange={setAspectRatio}>
                            <SelectTrigger className="mt-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="free">Free Form</SelectItem>
                              <SelectItem value="1:1">Square (1:1)</SelectItem>
                              <SelectItem value="4:3">Standard (4:3)</SelectItem>
                              <SelectItem value="16:9">Widescreen (16:9)</SelectItem>
                              <SelectItem value="3:4">Portrait (3:4)</SelectItem>
                              <SelectItem value="9:16">Story (9:16)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="spacing">Spacing: {spacing[0]}px</Label>
                          <Slider
                            id="spacing"
                            min={0}
                            max={50}
                            step={5}
                            value={spacing}
                            onValueChange={setSpacing}
                            className="mt-2"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor="canvas-width">Width: {canvasWidth}px</Label>
                            <Select value={canvasWidth.toString()} onValueChange={(v) => setCanvasWidth(parseInt(v))}>
                              <SelectTrigger className="mt-2">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="800">800px</SelectItem>
                                <SelectItem value="1000">1000px</SelectItem>
                                <SelectItem value="1200">1200px (Default)</SelectItem>
                                <SelectItem value="1500">1500px</SelectItem>
                                <SelectItem value="1920">1920px (HD)</SelectItem>
                                <SelectItem value="3840">3840px (4K)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="canvas-height">Height: {canvasHeight}px</Label>
                            <Select value={canvasHeight.toString()} onValueChange={(v) => setCanvasHeight(parseInt(v))}>
                              <SelectTrigger className="mt-2">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="600">600px</SelectItem>
                                <SelectItem value="800">800px (Default)</SelectItem>
                                <SelectItem value="1000">1000px</SelectItem>
                                <SelectItem value="1080">1080px (HD)</SelectItem>
                                <SelectItem value="1200">1200px</SelectItem>
                                <SelectItem value="2160">2160px (4K)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="style" className="space-y-4">
                        <div>
                          <Label htmlFor="bg-color">Background Color</Label>
                          <div className="flex gap-2 mt-2">
                            <input
                              id="bg-color"
                              type="color"
                              value={backgroundColor}
                              onChange={(e) => setBackgroundColor(e.target.value)}
                              className="w-20 h-10 rounded border cursor-pointer"
                            />
                            <div className="flex-1 grid grid-cols-5 gap-1">
                              {[
                                "#ffffff",
                                "#000000",
                                "#f3f4f6",
                                "#fef3c7",
                                "#dbeafe",
                                "#fce7f3",
                                "#dcfce7",
                                "#fef3c7",
                                "#e0e7ff",
                                "#f1f5f9",
                              ].map((color) => (
                                <button
                                  key={color}
                                  onClick={() => setBackgroundColor(color)}
                                  className="h-10 rounded border-2 transition-all hover:scale-105"
                                  style={{
                                    backgroundColor: color,
                                    borderColor: backgroundColor === color ? "#3b82f6" : "transparent",
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label>Border</Label>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Label htmlFor="border-width" className="text-xs">
                                Width: {border[0]}px
                              </Label>
                              <Slider
                                id="border-width"
                                min={0}
                                max={20}
                                step={1}
                                value={border}
                                onValueChange={setBorder}
                                className="flex-1"
                              />
                            </div>

                            <div className="flex gap-2">
                              <input
                                type="color"
                                value={borderColor}
                                onChange={(e) => setBorderColor(e.target.value)}
                                className="w-12 h-10 rounded border cursor-pointer"
                              />
                              <Select value={borderStyle} onValueChange={(v) => setBorderStyle(v as BorderStyle)}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">No Border</SelectItem>
                                  <SelectItem value="solid">Solid</SelectItem>
                                  <SelectItem value="dashed">Dashed</SelectItem>
                                  <SelectItem value="dotted">Dotted</SelectItem>
                                  <SelectItem value="shadow">Shadow Only</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="round-corners">Round Corners: {roundCorners[0]}px</Label>
                          <Slider
                            id="round-corners"
                            min={0}
                            max={50}
                            step={5}
                            value={roundCorners}
                            onValueChange={setRoundCorners}
                            className="mt-2"
                          />
                        </div>

                        <div>
                          <Label htmlFor="shadow">Shadow Intensity: {shadow[0]}</Label>
                          <Slider
                            id="shadow"
                            min={0}
                            max={10}
                            step={1}
                            value={shadow}
                            onValueChange={setShadow}
                            className="mt-2"
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="edit" className="space-y-4">
                        {selectedImage && (
                          <>
                            <div className="p-3 bg-muted rounded-lg">
                              <Label>Editing Selected Image</Label>
                              <div className="text-xs text-muted-foreground mt-1">
                                Use mouse to drag or adjust below
                              </div>
                            </div>

                            <div>
                              <Label htmlFor="rotation">Rotation: {selectedImage.rotation}deg</Label>
                              <div className="flex gap-2 mt-2">
                                <Slider
                                  id="rotation"
                                  min={-180}
                                  max={180}
                                  step={1}
                                  value={[selectedImage.rotation]}
                                  onValueChange={([value]) => updateSelectedImage({ rotation: value })}
                                  className="flex-1"
                                />
                                <Button
                                  onClick={() => updateSelectedImage({ rotation: 0 })}
                                  variant="outline"
                                  size="sm"
                                >
                                  <RotateCw className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            <div>
                              <Label htmlFor="scale">Scale: {selectedImage.scale}x</Label>
                              <div className="flex gap-2 mt-2">
                                <Slider
                                  id="scale"
                                  min={0.1}
                                  max={3}
                                  step={0.1}
                                  value={[selectedImage.scale]}
                                  onValueChange={([value]) => updateSelectedImage({ scale: value })}
                                  className="flex-1"
                                />
                                <Button onClick={() => updateSelectedImage({ scale: 1 })} variant="outline" size="sm">
                                  <ZoomIn className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            <div>
                              <Label htmlFor="opacity">Opacity: {Math.round(selectedImage.opacity * 100)}%</Label>
                              <Slider
                                id="opacity"
                                min={0}
                                max={1}
                                step={0.1}
                                value={[selectedImage.opacity]}
                                onValueChange={([value]) => updateSelectedImage({ opacity: value })}
                                className="mt-2"
                              />
                            </div>
                          </>
                        )}

                        <div>
                          <Label htmlFor="quality">Download Quality</Label>
                          <Select value={imageQuality.toString()} onValueChange={(v) => setImageQuality(parseFloat(v))}>
                            <SelectTrigger className="mt-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0.5">Standard (50%)</SelectItem>
                              <SelectItem value="1">High (100%)</SelectItem>
                              <SelectItem value="2">Ultra (200%)</SelectItem>
                              <SelectItem value="3">Maximum (300%)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TabsContent>
                    </Tabs>

                    {/* In-Page Ad - Placed non-intrusively */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 text-center">
                      <div className="text-sm font-semibold text-blue-800 mb-2">Premium Features Unlocked</div>
                      <p className="text-xs text-blue-600 mb-3">
                        Enjoy ad-free experience and faster processing with Premium
                      </p>
                      <Button size="sm" variant="outline" className="w-full text-xs">
                        Upgrade to Premium
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label>Uploaded Images ({images.length})</Label>
                      <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
                        {images.map((img) => (
                          <div
                            key={img.id}
                            className={`relative group cursor-pointer border-2 rounded transition-all ${
                              selectedImageId === img.id ? "border-blue-500" : "border-transparent"
                            }`}
                            onClick={() => setSelectedImageId(img.id)}
                          >
                            <img src={img.image.src} alt="Uploaded" className="w-full h-20 object-cover rounded" />
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeImage(img.id);
                              }}
                              size="sm"
                              variant="destructive"
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
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
                            Download Collage
                          </>
                        )}
                      </Button>
                      <Button onClick={clearAll} variant="outline" size="lg">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear All
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Preview */}
          <div className="lg:col-span-2 lg:sticky lg:top-6 lg:self-start">
            <Card className="border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Preview</h3>
                  {selectedImage && (
                    <div className="text-sm text-muted-foreground">
                      Editing: Image {images.findIndex((img) => img.id === selectedImageId) + 1}
                    </div>
                  )}
                </div>
                <div className="border rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 relative">
                  <canvas
                    ref={canvasRef}
                    className="w-full h-auto cursor-move"
                    style={{ maxHeight: "70vh" }}
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                    onMouseLeave={handleCanvasMouseUp}
                  />
                  {images.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center p-8">
                        <LayoutGrid className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">Upload images to create your collage</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Drag & drop support available in freeform mode
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                {layout === "freeform" && images.length > 0 && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 text-center">
                      <strong>Freeform Mode:</strong> Drag images to reposition, select images to rotate and scale
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="mt-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Advanced Collage Tips</h3>
            <div className="grid md:grid-cols-3 gap-6 text-sm text-muted-foreground">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Layout Selection:</h4>
                <ul className="space-y-1">
                  <li>
                    - <strong>Grid Layouts:</strong> Perfect for organized presentations
                  </li>
                  <li>
                    - <strong>Pinterest:</strong> Great for varied image sizes
                  </li>
                  <li>
                    - <strong>Freeform:</strong> Complete creative control
                  </li>
                  <li>
                    - <strong>Circular:</strong> Artistic and eye-catching
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Editing Features:</h4>
                <ul className="space-y-1">
                  <li>- Drag & drop individual images</li>
                  <li>- Rotate and scale selected images</li>
                  <li>- Adjust opacity for overlay effects</li>
                  <li>- Add borders and shadows</li>
                  <li>- Round corners for modern look</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Export Settings:</h4>
                <ul className="space-y-1">
                  <li>- Multiple aspect ratios available</li>
                  <li>- High-quality export up to 4K</li>
                  <li>- Various background colors</li>
                  <li>- Optimized for social media</li>
                </ul>
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
            to="/blog/free-online-photo-collage-maker"
            className="p-4 border border-border/60 rounded-lg bg-card/80 shadow-sm hover:shadow-card-hover transition-shadow no-underline block"
          >
            <span className="text-primary font-semibold hover:underline text-lg block">
              Best Free Online Photo Collage Maker
            </span>
            <p className="text-muted-foreground mt-2 text-sm">
              Create stunning photo collages with customizable layouts. Best free online collage maker for Instagram and social media.
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
          downloadCollage();
        }}
        title="Watch ad to download your collage"
        description="Support us by watching a short ad to download your high-quality photo collage."
      />
    </>
  );
};

export default PhotoCollageMaker;
