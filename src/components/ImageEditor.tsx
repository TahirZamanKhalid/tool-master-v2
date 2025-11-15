import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Eraser, Paintbrush, Undo, Redo, Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ImageEditorLayerPanel, Layer } from "./ImageEditorLayerPanel";
import { ImageEditorColorPicker } from "./ImageEditorColorPicker";

interface ImageEditorProps {
  originalImage: string;
  processedImage: string;
  onDownload: (imageData: string) => void;
}

type Tool = "erase" | "restore" | "paint" | "picker";

export const ImageEditor = ({ originalImage, processedImage, onDownload }: ImageEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const layerCanvasRef = useRef<HTMLCanvasElement[]>([]);
  const [brushSize, setBrushSize] = useState(20);
  const [opacity, setOpacity] = useState(100);
  const [activeTool, setActiveTool] = useState<Tool>("erase");
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const originalImageRef = useRef<HTMLImageElement | null>(null);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  
  // Layer system
  const [layers, setLayers] = useState<Layer[]>([
    { id: "base", name: "Background", visible: true, imageData: null }
  ]);
  const [activeLayerId, setActiveLayerId] = useState("base");
  
  // Color picker
  const [selectedColor, setSelectedColor] = useState("#000000");

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key.toLowerCase()) {
        case 'e':
          setActiveTool("erase");
          break;
        case 'r':
          setActiveTool("restore");
          break;
        case 'p':
          setActiveTool("paint");
          break;
        case 'i':
          setActiveTool("picker");
          break;
        case 'z':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            undo();
          }
          break;
        case 'y':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            redo();
          }
          break;
        case '[':
          e.preventDefault();
          setBrushSize(prev => Math.max(5, prev - 5));
          break;
        case ']':
          e.preventDefault();
          setBrushSize(prev => Math.min(100, prev + 5));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyStep, history]);

  // Initialize canvas with processed image
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const processedImg = new Image();
    processedImg.crossOrigin = "anonymous";
    processedImg.src = processedImage;
    
    const originalImg = new Image();
    originalImg.crossOrigin = "anonymous";
    originalImg.src = originalImage;
    
    processedImg.onload = () => {
      canvas.width = processedImg.width;
      canvas.height = processedImg.height;
      renderLayers();
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory([imageData]);
      setHistoryStep(0);
      
      // Initialize base layer
      setLayers(prev => [{
        ...prev[0],
        imageData: imageData
      }]);
    };
    
    originalImg.onload = () => {
      originalImageRef.current = originalImg;
    };
  }, [processedImage, originalImage]);

  // Render all visible layers
  const renderLayers = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw processed image as base
    const processedImg = new Image();
    processedImg.crossOrigin = "anonymous";
    processedImg.src = processedImage;
    processedImg.onload = () => {
      ctx.drawImage(processedImg, 0, 0);
      
      // Draw each visible layer on top
      layers.forEach(layer => {
        if (layer.visible && layer.imageData) {
          ctx.putImageData(layer.imageData, 0, 0);
        }
      });
    };
  }, [layers, processedImage]);

  // Re-render when layers change
  useEffect(() => {
    renderLayers();
  }, [layers, renderLayers]);

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(imageData);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
    
    // Update active layer
    setLayers(prev => prev.map(layer => 
      layer.id === activeLayerId 
        ? { ...layer, imageData }
        : layer
    ));
  };

  const undo = () => {
    if (historyStep <= 0) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const newStep = historyStep - 1;
    ctx.putImageData(history[newStep], 0, 0);
    setHistoryStep(newStep);
  };

  const redo = () => {
    if (historyStep >= history.length - 1) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const newStep = historyStep + 1;
    ctx.putImageData(history[newStep], 0, 0);
    setHistoryStep(newStep);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    // Color picker tool
    if (activeTool === "picker") {
      pickColor(x, y);
      return;
    }
    
    setIsDrawing(true);
    lastPointRef.current = { x, y };
    draw(e);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveState();
      lastPointRef.current = null;
    }
  };

  const pickColor = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1)}`;
    setSelectedColor(hex);
    setActiveTool("paint");
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing && e.type !== "mousedown") return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (activeTool === "erase") {
      // Erase by removing transparency
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0, 0, 0, 1)";
      
      if (lastPointRef.current && e.type !== "mousedown") {
        ctx.lineWidth = brushSize;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
        ctx.lineTo(x, y);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (activeTool === "restore") {
      // Restore from original image
      if (!originalImageRef.current) return;
      
      ctx.save();
      ctx.globalAlpha = opacity / 100;
      ctx.globalCompositeOperation = "source-over";
      
      if (lastPointRef.current && e.type !== "mousedown") {
        ctx.lineWidth = brushSize;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
        ctx.lineTo(x, y);
        ctx.clip();
      } else {
        ctx.beginPath();
        ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
        ctx.clip();
      }
      
      ctx.drawImage(originalImageRef.current, 0, 0, canvas.width, canvas.height);
      ctx.restore();
    } else if (activeTool === "paint") {
      // Paint with selected color
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = opacity / 100;
      ctx.strokeStyle = selectedColor;
      ctx.fillStyle = selectedColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      
      if (lastPointRef.current && e.type !== "mousedown") {
        ctx.beginPath();
        ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
        ctx.lineTo(x, y);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    lastPointRef.current = { x, y };
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const imageData = canvas.toDataURL("image/png");
    onDownload(imageData);
  };

  // Layer management functions
  const handleLayerAdd = () => {
    const newLayer: Layer = {
      id: `layer-${Date.now()}`,
      name: `Layer ${layers.length}`,
      visible: true,
      imageData: null
    };
    setLayers(prev => [...prev, newLayer]);
    setActiveLayerId(newLayer.id);
  };

  const handleLayerDelete = (layerId: string) => {
    if (layers.length <= 1) return;
    setLayers(prev => prev.filter(l => l.id !== layerId));
    if (activeLayerId === layerId) {
      setActiveLayerId(layers[0].id);
    }
  };

  const handleLayerToggle = (layerId: string) => {
    setLayers(prev => prev.map(layer =>
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    ));
  };

  const handleLayerRename = (layerId: string, name: string) => {
    setLayers(prev => prev.map(layer =>
      layer.id === layerId ? { ...layer, name } : layer
    ));
  };

  const getCursorStyle = () => {
    if (activeTool === "picker") return "crosshair";
    return "crosshair";
  };

  return (
    <div className="space-y-4">
      <Card className="p-6 space-y-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant={activeTool === "erase" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTool("erase")}
            >
              <Eraser className="h-4 w-4 mr-2" />
              Erase (E)
            </Button>
            <Button
              variant={activeTool === "restore" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTool("restore")}
            >
              <Paintbrush className="h-4 w-4 mr-2" />
              Restore (R)
            </Button>
            <Button
              variant={activeTool === "paint" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTool("paint")}
            >
              <Paintbrush className="h-4 w-4 mr-2" />
              Paint (P)
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={undo}
              disabled={historyStep <= 0}
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={redo}
              disabled={historyStep >= history.length - 1}
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>

          <Button onClick={handleDownload} variant="secondary">
            <Download className="h-4 w-4 mr-2" />
            Download PNG
          </Button>
        </div>

        <div className="grid md:grid-cols-[1fr_250px] gap-4">
          <div className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Brush Size: {brushSize}px
                </label>
                <Slider
                  value={[brushSize]}
                  onValueChange={(v) => setBrushSize(v[0])}
                  min={5}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>

              {(activeTool === "restore" || activeTool === "paint") && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Opacity: {opacity}%
                  </label>
                  <Slider
                    value={[opacity]}
                    onValueChange={(v) => setOpacity(v[0])}
                    min={10}
                    max={100}
                    step={10}
                    className="w-full"
                  />
                </div>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-[linear-gradient(45deg,#f0f0f0_25%,transparent_25%,transparent_75%,#f0f0f0_75%,#f0f0f0),linear-gradient(45deg,#f0f0f0_25%,transparent_25%,transparent_75%,#f0f0f0_75%,#f0f0f0)] bg-[length:20px_20px] bg-[position:0_0,10px_10px] rounded-lg"></div>
              <canvas
                ref={canvasRef}
                className="relative w-full rounded-lg"
                style={{ cursor: getCursorStyle() }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />
            </div>

            <p className="text-sm text-muted-foreground text-center">
              <strong>E</strong>/erase • <strong>R</strong>/restore • <strong>P</strong>/paint • <strong>I</strong>/pick color
              <br />
              <span className="text-xs">Z/Y to undo/redo • [ / ] to adjust brush size</span>
            </p>
          </div>

          <div className="space-y-4">
            <ImageEditorColorPicker
              selectedColor={selectedColor}
              onColorChange={setSelectedColor}
              isPickerActive={activeTool === "picker"}
              onTogglePicker={() => setActiveTool(activeTool === "picker" ? "paint" : "picker")}
            />
            
            <ImageEditorLayerPanel
              layers={layers}
              activeLayerId={activeLayerId}
              onLayerSelect={setActiveLayerId}
              onLayerToggle={handleLayerToggle}
              onLayerAdd={handleLayerAdd}
              onLayerDelete={handleLayerDelete}
              onLayerRename={handleLayerRename}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};
