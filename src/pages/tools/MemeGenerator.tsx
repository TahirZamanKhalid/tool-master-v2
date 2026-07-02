import { useState, useRef } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { AdWatchModal } from "@/components/AdWatchModal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { isRasterImageFile } from "@/utils/imageFiles";

const MAX_IMAGE_SIZE = 15 * 1024 * 1024;
const SUPPORTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/bmp"];

const MemeGenerator = () => {
  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showAdOverlay, setShowAdOverlay] = useState(false);
  const [canDownload, setCanDownload] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.currentTarget.value = "";
    if (!file) return;

    if (!isRasterImageFile(file, SUPPORTED_TYPES)) {
      toast.error("Please upload a JPG, PNG, WebP, or BMP image");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("Please upload an image smaller than 15 MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setCanDownload(false);
    };
    reader.readAsDataURL(file);
  };

  const getWrappedLines = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
    const words = text.toUpperCase().trim().split(/\s+/);
    const lines: string[] = [];
    let currentLine = "";

    words.forEach((word) => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (ctx.measureText(testLine).width <= maxWidth || !currentLine) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    });

    if (currentLine) lines.push(currentLine);
    return lines;
  };

  const drawWrappedMemeText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    y: number,
    anchor: "top" | "bottom",
    imageWidth: number,
    fontSize: number,
  ) => {
    if (!text.trim()) return;
    const lines = getWrappedLines(ctx, text, imageWidth * 0.92);
    const lineHeight = fontSize * 1.15;
    const totalHeight = lines.length * lineHeight;
    const startY = anchor === "top" ? y : y - totalHeight + lineHeight;

    lines.forEach((line, index) => {
      const lineY = startY + index * lineHeight;
      ctx.strokeText(line, imageWidth / 2, lineY);
      ctx.fillText(line, imageWidth / 2, lineY);
    });
  };

  const generateMeme = () => {
    if (!selectedImage) {
      toast.error("Please upload an image first");
      return;
    }
    setShowAdOverlay(true);
    setCanDownload(false);
  };

  const drawMemeToCanvas = () => {
    return new Promise<void>((resolve) => {
      const canvas = canvasRef.current;
      if (!canvas || !selectedImage) {
        resolve();
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve();
        return;
      }

      const img = new Image();
      img.onload = () => {
        // Set canvas dimensions to match image
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw the image
        ctx.drawImage(img, 0, 0);

        // Set text properties
        const fontSize = Math.max(24, Math.floor(img.width / 12));
        ctx.font = `bold ${fontSize}px Impact, sans-serif`;
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.lineWidth = Math.max(2, fontSize / 18);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Draw top text
        if (topText) {
          drawWrappedMemeText(ctx, topText, fontSize * 0.8, "top", img.width, fontSize);
        }

        // Draw bottom text
        if (bottomText) {
          drawWrappedMemeText(ctx, bottomText, img.height - fontSize * 0.4, "bottom", img.width, fontSize);
        }

        resolve();
      };
      img.onerror = () => {
        toast.error("Could not load this image");
        resolve();
      };
      img.src = selectedImage;
    });
  };

  const handleAdComplete = async () => {
    await drawMemeToCanvas();
    setCanDownload(true);
    toast.success("Meme created! You can now download it.");
  };

  const downloadMeme = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = "meme.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <ToolLayout
      title="Meme Generator"
      description="Create funny memes with custom text"
      category="Image Tools"
    >
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <Label>Upload Image</Label>
            <Input type="file" accept={SUPPORTED_TYPES.join(",")} onChange={handleImageUpload} />
          </div>
          <div>
            <Label>Top Text</Label>
            <Input
              value={topText}
              onChange={(e) => setTopText(e.target.value)}
              placeholder="Enter top text"
            />
          </div>
          <div>
            <Label>Bottom Text</Label>
            <Input
              value={bottomText}
              onChange={(e) => setBottomText(e.target.value)}
              placeholder="Enter bottom text"
            />
          </div>
          <Button onClick={generateMeme} className="w-full">
            Generate Meme
          </Button>
          {selectedImage && (
            <div className="space-y-4">
              <canvas ref={canvasRef} className="hidden" />
              <div className="relative">
                <img src={selectedImage} alt="Meme" className="w-full" />
                {topText && (
                  <div className="absolute top-4 left-0 right-0 px-4 text-center text-white text-3xl font-bold uppercase break-words" style={{ textShadow: "2px 2px 4px black" }}>
                    {topText}
                  </div>
                )}
                {bottomText && (
                  <div className="absolute bottom-4 left-0 right-0 px-4 text-center text-white text-3xl font-bold uppercase break-words" style={{ textShadow: "2px 2px 4px black" }}>
                    {bottomText}
                  </div>
                )}
              </div>
              {canDownload && (
                <Button onClick={downloadMeme} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download Meme
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {showAdOverlay && (
        <AdWatchModal
          isOpen={showAdOverlay}
          onClose={() => setShowAdOverlay(false)}
          onAdComplete={handleAdComplete}
        />
      )}
    </ToolLayout>
  );
};

export default MemeGenerator;
