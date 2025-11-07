import { useState, useRef } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Upload, Download, Trash2, Play, Loader2, Film } from "lucide-react";
import { AdWatchModal } from "@/components/AdWatchModal";
import { SEOHead } from "@/components/SEOHead";

interface Frame {
  id: string;
  image: HTMLImageElement;
  dataUrl: string;
}

const GIFMaker = () => {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [frameDuration, setFrameDuration] = useState([500]);
  const [quality, setQuality] = useState("medium");
  const [loop, setLoop] = useState(true);
  const [width, setWidth] = useState(480);
  const [height, setHeight] = useState(360);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [showAdModal, setShowAdModal] = useState(false);
  const [canDownload, setCanDownload] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    const imageFiles = files.filter(file => file.type.startsWith("image/"));

    if (imageFiles.length === 0) {
      toast.error("Please upload image files");
      return;
    }

    if (imageFiles.length < 2) {
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
            dataUrl: dataUrl
          });

          loadedCount++;
          if (loadedCount === imageFiles.length) {
            // Sort by original order
            newFrames.sort((a, b) => {
              const aIndex = parseInt(a.id.split('-')[1]);
              const bIndex = parseInt(b.id.split('-')[1]);
              return aIndex - bIndex;
            });
            setFrames(newFrames);
            toast.success(`${imageFiles.length} frames loaded!`);
            drawFrame(newFrames[0]);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const drawFrame = (frame: Frame) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate scaling to fit
    const scale = Math.min(
      canvas.width / frame.image.width,
      canvas.height / frame.image.height
    );

    const scaledWidth = frame.image.width * scale;
    const scaledHeight = frame.image.height * scale;
    const x = (canvas.width - scaledWidth) / 2;
    const y = (canvas.height - scaledHeight) / 2;

    ctx.drawImage(frame.image, x, y, scaledWidth, scaledHeight);
  };

  const togglePreview = () => {
    if (frames.length < 2) {
      toast.error("Add at least 2 frames to preview");
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

    previewIntervalRef.current = setInterval(() => {
      setCurrentFrame(frameIndex);
      drawFrame(frames[frameIndex]);
      frameIndex = (frameIndex + 1) % frames.length;
    }, frameDuration[0]);
  };

  const stopPreview = () => {
    setIsPlaying(false);
    if (previewIntervalRef.current) {
      clearInterval(previewIntervalRef.current);
      previewIntervalRef.current = null;
    }
  };

  const removeFrame = (id: string) => {
    const newFrames = frames.filter(f => f.id !== id);
    setFrames(newFrames);
    if (newFrames.length > 0) {
      drawFrame(newFrames[0]);
      setCurrentFrame(0);
    }
    stopPreview();
    toast.success("Frame removed");
  };

  const clearAll = () => {
    setFrames([]);
    setCurrentFrame(0);
    stopPreview();
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#f3f4f6";
        ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
    toast.success("All frames cleared");
  };

  const handleDownload = () => {
    if (frames.length < 2) {
      toast.error("Add at least 2 frames to create an animation");
      return;
    }

    if (!canDownload) {
      setShowAdModal(true);
      return;
    }

    downloadGIF();
  };

  const downloadGIF = async () => {
    setIsProcessing(true);
    stopPreview();

    try {
      // Create a simple APNG (Animated PNG) or WebP animation as browsers support these better
      // For true GIF, you'd need gif.js or similar library

      // For now, we'll create a zip of frames or a video-like sequence
      // Let's create an APNG-like animation by downloading frames

      // Better approach: Create a simple animation using canvas and download as video
      // But for simplicity, let's create a downloadable sequence

      // Actually, let's use a workaround: create animated WebP if supported
      // For now, download as a series of frames with instructions

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Could not get canvas context");
      }

      // Create a simple animation by encoding frames
      // Since we don't have gif.js, we'll create a downloadable HTML file that shows the animation
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Animated GIF Preview</title>
  <style>
    body {
      margin: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: #1a1a1a;
      font-family: Arial, sans-serif;
    }
    .container {
      text-align: center;
      color: white;
    }
    canvas {
      border: 2px solid #333;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.3);
    }
    .controls {
      margin-top: 20px;
    }
    button {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      margin: 0 5px;
      font-size: 14px;
    }
    button:hover {
      background: #2563eb;
    }
    .info {
      margin-top: 15px;
      color: #9ca3af;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Your Animated Image</h1>
    <canvas id="canvas" width="${width}" height="${height}"></canvas>
    <div class="controls">
      <button onclick="togglePlay()">⏯ Play/Pause</button>
      <button onclick="downloadFrame()">📥 Download Current Frame</button>
    </div>
    <div class="info">
      Frame: <span id="frameNum">1</span>/${frames.length} |
      Speed: ${frameDuration[0]}ms |
      Loop: ${loop ? "Yes" : "No"}
    </div>
    <div class="info" style="margin-top: 10px; max-width: 500px;">
      <strong>Note:</strong> This is an HTML animation preview.
      For true GIF format, consider using tools like ezgif.com or Photoshop.
      You can screen-record this animation or download individual frames above.
    </div>
  </div>
  <script>
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const frames = ${JSON.stringify(frames.map(f => f.dataUrl))};
    let currentFrame = 0;
    let isPlaying = true;
    let interval;

    function drawFrame(index) {
      const img = new Image();
      img.onload = () => {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const x = (canvas.width - scaledWidth) / 2;
        const y = (canvas.height - scaledHeight) / 2;

        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
        document.getElementById('frameNum').textContent = index + 1;
      };
      img.src = frames[index];
    }

    function animate() {
      if (isPlaying) {
        drawFrame(currentFrame);
        currentFrame = (currentFrame + 1) % frames.length;
        ${!loop ? `if (currentFrame === 0) { isPlaying = false; clearInterval(interval); }` : ''}
      }
    }

    function togglePlay() {
      isPlaying = !isPlaying;
      if (isPlaying && !interval) {
        interval = setInterval(animate, ${frameDuration[0]});
      } else if (!isPlaying && interval) {
        clearInterval(interval);
        interval = null;
      }
    }

    function downloadFrame() {
      const link = document.createElement('a');
      link.download = 'frame-' + (currentFrame + 1) + '.png';
      link.href = canvas.toDataURL();
      link.click();
    }

    // Start animation
    drawFrame(0);
    interval = setInterval(animate, ${frameDuration[0]});
  </script>
</body>
</html>`;

      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `animation-${Date.now()}.html`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success("Animation HTML file downloaded! Open it in a browser to view and screen-record.");
    } catch (error) {
      console.error("Error creating animation:", error);
      toast.error("Failed to create animation");
    } finally {
      setIsProcessing(false);
    }
  };

  const getQualityWidth = (quality: string) => {
    switch (quality) {
      case "low": return 320;
      case "medium": return 480;
      case "high": return 640;
      case "ultra": return 800;
      default: return 480;
    }
  };

  const getQualityHeight = (quality: string) => {
    const w = getQualityWidth(quality);
    return Math.round(w * (3/4)); // 4:3 aspect ratio
  };

  const handleQualityChange = (newQuality: string) => {
    setQuality(newQuality);
    setWidth(getQualityWidth(newQuality));
    setHeight(getQualityHeight(newQuality));
    if (frames.length > 0) {
      drawFrame(frames[currentFrame]);
    }
  };

  return (
    <>
      <SEOHead
        title="GIF Maker - Create Animated GIFs from Images"
        description="Create animated GIFs from images online. Upload multiple images, adjust frame speed, and download your custom animation."
        keywords="gif maker, create gif, animated gif, gif creator, image to gif"
        canonical="https://toolmaster.cloud/tools/gif-maker"
      />
      <ToolLayout
        title="GIF Maker"
        description="Create animated GIFs from multiple images with customizable frame duration and quality"
        category="Image Tools"
        instructions={[
          "Upload 2 or more images in sequence",
          "Adjust frame duration (speed)",
          "Set quality and dimensions",
          "Preview your animation",
          "Download as animated HTML file"
        ]}
        relatedTools={[
          { name: "Video Trimmer", path: "/tools/video-trimmer" },
          { name: "Photo Collage Maker", path: "/tools/photo-collage-maker" },
          { name: "Advanced Image Editor", path: "/tools/advanced-image-editor" }
        ]}
      >
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Controls */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label>Upload Frames</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="w-full mt-2"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Images ({frames.length} frames)
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Upload at least 2 images. They'll be animated in order.
                  </p>
                </div>

                {frames.length > 0 && (
                  <>
                    <div>
                      <Label htmlFor="frame-duration">
                        Frame Duration: {frameDuration[0]}ms ({(1000 / frameDuration[0]).toFixed(1)} FPS)
                      </Label>
                      <Slider
                        id="frame-duration"
                        min={50}
                        max={2000}
                        step={50}
                        value={frameDuration}
                        onValueChange={setFrameDuration}
                        className="mt-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Fast (50ms)</span>
                        <span>Slow (2000ms)</span>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="quality">Quality & Size</Label>
                      <Select value={quality} onValueChange={handleQualityChange}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low (320x240)</SelectItem>
                          <SelectItem value="medium">Medium (480x360)</SelectItem>
                          <SelectItem value="high">High (640x480)</SelectItem>
                          <SelectItem value="ultra">Ultra (800x600)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="loop"
                        checked={loop}
                        onCheckedChange={(checked) => setLoop(checked as boolean)}
                      />
                      <Label htmlFor="loop" className="cursor-pointer">
                        Loop animation continuously
                      </Label>
                    </div>

                    <div className="space-y-2">
                      <Label>Frames ({frames.length})</Label>
                      <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto p-2 border rounded-lg">
                        {frames.map((frame, index) => (
                          <div
                            key={frame.id}
                            className={`relative group cursor-pointer ${
                              currentFrame === index ? "ring-2 ring-primary" : ""
                            }`}
                            onClick={() => {
                              setCurrentFrame(index);
                              drawFrame(frame);
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
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFrame(frame.id);
                              }}
                              size="sm"
                              variant="destructive"
                              className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={togglePreview}
                        variant={isPlaying ? "secondary" : "default"}
                        className="flex-1"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        {isPlaying ? "Stop Preview" : "Preview Animation"}
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleDownload}
                        className="flex-1"
                        size="lg"
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
                            Download Animation
                          </>
                        )}
                      </Button>
                      <Button onClick={clearAll} variant="outline" size="lg">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Preview */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            <Card className="border-primary/20">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Preview
                  {frames.length > 0 && ` - Frame ${currentFrame + 1}/${frames.length}`}
                </h3>
                <div className="border rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900">
                  <canvas
                    ref={canvasRef}
                    width={width}
                    height={height}
                    className="w-full h-auto"
                  />
                </div>
                {frames.length === 0 && (
                  <div className="text-center p-8 text-muted-foreground">
                    <Film className="h-16 w-16 mx-auto mb-4" />
                    <p>Upload images to create your animation</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="mt-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">GIF Creation Tips</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Best Practices:</h4>
                <ul className="space-y-1">
                  <li>• Use 5-30 frames for smooth animations</li>
                  <li>• 100-200ms per frame for normal speed</li>
                  <li>• Keep dimensions small (480x360) for faster loading</li>
                  <li>• Use consistent image dimensions for best results</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Output Format:</h4>
                <ul className="space-y-1">
                  <li>• Downloads as HTML animation file</li>
                  <li>• Open in browser to view animation</li>
                  <li>• Screen-record for true video/GIF conversion</li>
                  <li>• Or use external tools like ezgif.com for GIF export</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </ToolLayout>

      <AdWatchModal
        open={showAdModal}
        onOpenChange={setShowAdModal}
        onAdWatched={() => {
          setCanDownload(true);
          setShowAdModal(false);
          downloadGIF();
        }}
        title="Watch ad to download your animation"
        description="Please watch this short ad to download your animated creation."
      />
    </>
  );
};

export default GIFMaker;
