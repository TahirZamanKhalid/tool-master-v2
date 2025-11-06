import { useState, useRef } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { ProcessingOverlay } from "@/components/ProcessingOverlay";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download } from "lucide-react";
import { toast } from "sonner";

const MemeGenerator = () => {
  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showAdOverlay, setShowAdOverlay] = useState(false);
  const [canDownload, setCanDownload] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
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
        const fontSize = Math.floor(img.width / 12);
        ctx.font = `bold ${fontSize}px Impact, sans-serif`;
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.lineWidth = fontSize / 20;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";

        // Draw top text
        if (topText) {
          const topY = fontSize / 2;
          // Draw text outline (stroke)
          ctx.strokeText(topText.toUpperCase(), img.width / 2, topY);
          // Draw text fill
          ctx.fillText(topText.toUpperCase(), img.width / 2, topY);
        }

        // Draw bottom text
        if (bottomText) {
          ctx.textBaseline = "bottom";
          const bottomY = img.height - fontSize / 2;
          // Draw text outline (stroke)
          ctx.strokeText(bottomText.toUpperCase(), img.width / 2, bottomY);
          // Draw text fill
          ctx.fillText(bottomText.toUpperCase(), img.width / 2, bottomY);
        }

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
            <Input type="file" accept="image/*" onChange={handleImageUpload} />
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
                  <div className="absolute top-4 left-0 right-0 text-center text-white text-3xl font-bold uppercase" style={{ textShadow: "2px 2px 4px black" }}>
                    {topText}
                  </div>
                )}
                {bottomText && (
                  <div className="absolute bottom-4 left-0 right-0 text-center text-white text-3xl font-bold uppercase" style={{ textShadow: "2px 2px 4px black" }}>
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
        <ProcessingOverlay
          message="Meme ready! Please view the ad to enable download."
          minAdViewTime={5}
          onAdComplete={handleAdComplete}
          showSkip={canDownload}
          onSkip={() => setShowAdOverlay(false)}
        />
      )}
    </ToolLayout>
  );
};

export default MemeGenerator;
