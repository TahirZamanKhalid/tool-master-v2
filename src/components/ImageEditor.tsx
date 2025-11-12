import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Eraser, Paintbrush, Undo, Redo, Download } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ImageEditorProps {
  originalImage: string;
  processedImage: string;
  onDownload: (imageData: string) => void;
}

export const ImageEditor = ({ originalImage, processedImage, onDownload }: ImageEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [brushSize, setBrushSize] = useState(20);
  const [isErasing, setIsErasing] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const originalImageRef = useRef<HTMLImageElement | null>(null);

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
      ctx.drawImage(processedImg, 0, 0);
      
      // Save initial state
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory([imageData]);
      setHistoryStep(0);
    };
    
    originalImg.onload = () => {
      originalImageRef.current = originalImg;
    };
  }, [processedImage]);

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
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveState();
    }
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

    if (isErasing) {
      // Erase by setting alpha to 0
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, brushSize, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Restore by painting from original image
      if (!originalImageRef.current) return;
      
      ctx.globalCompositeOperation = "source-over";
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, brushSize, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(originalImageRef.current, 0, 0, canvas.width, canvas.height);
      ctx.restore();
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const imageData = canvas.toDataURL("image/png");
    onDownload(imageData);
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={isErasing ? "default" : "outline"}
            size="sm"
            onClick={() => setIsErasing(true)}
          >
            <Eraser className="h-4 w-4 mr-2" />
            Erase
          </Button>
          <Button
            variant={!isErasing ? "default" : "outline"}
            size="sm"
            onClick={() => setIsErasing(false)}
          >
            <Paintbrush className="h-4 w-4 mr-2" />
            Restore
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

      <div className="relative">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,#f0f0f0_25%,transparent_25%,transparent_75%,#f0f0f0_75%,#f0f0f0),linear-gradient(45deg,#f0f0f0_25%,transparent_25%,transparent_75%,#f0f0f0_75%,#f0f0f0)] bg-[length:20px_20px] bg-[position:0_0,10px_10px] rounded-lg"></div>
        <canvas
          ref={canvasRef}
          className="relative w-full rounded-lg cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>

      <p className="text-sm text-muted-foreground text-center">
        Use <strong>Erase</strong> to remove parts or <strong>Restore</strong> to bring back areas from the original image
      </p>
    </Card>
  );
};
