import { useState, useRef, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Shield, Upload, Download, Sparkles, Type, Image as ImageIcon, Play, Pause, Loader2, Droplet } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

type WatermarkType = "text" | "image";
type Position = "topleft" | "topright" | "bottomleft" | "bottomright" | "center";

const PremiumVideoWatermark = () => {
  const { toast } = useToast();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [watermarkImage, setWatermarkImage] = useState<File | null>(null);
  const [watermarkImageUrl, setWatermarkImageUrl] = useState("");
  const [outputUrl, setOutputUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);

  // Watermark settings
  const [watermarkType, setWatermarkType] = useState<WatermarkType>("text");
  const [watermarkText, setWatermarkText] = useState("Your Watermark");
  const [position, setPosition] = useState<Position>("bottomright");
  const [fontSize, setFontSize] = useState([48]);
  const [textColor, setTextColor] = useState("#ffffff");
  const [backgroundColor, setBackgroundColor] = useState("#000000");
  const [backgroundOpacity, setBackgroundOpacity] = useState([0.5]);
  const [textOpacity, setTextOpacity] = useState([1]);
  const [padding, setPadding] = useState([20]);
  const [imageScale, setImageScale] = useState([0.2]); // For image watermarks
  const [imageOpacity, setImageOpacity] = useState([0.7]);

  const ffmpegRef = useRef(new FFmpeg());
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadFFmpeg();
  }, []);

  const loadFFmpeg = async () => {
    try {
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      const ffmpeg = ffmpegRef.current;

      ffmpeg.on('log', ({ message }) => {
        console.log(message);
      });

      ffmpeg.on('progress', ({ progress }) => {
        setProcessingProgress(Math.round(progress * 100));
      });

      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });

      setFfmpegLoaded(true);
      toast({ title: "Watermark tool loaded!" });
    } catch (error) {
      console.error('Failed to load FFmpeg:', error);
      toast({ title: "Failed to load watermark tool", variant: "destructive" });
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast({ title: "Please upload a video file", variant: "destructive" });
      return;
    }

    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setOutputUrl("");
    toast({ title: "Video loaded successfully!" });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: "Please upload an image file", variant: "destructive" });
      return;
    }

    setWatermarkImage(file);
    const url = URL.createObjectURL(file);
    setWatermarkImageUrl(url);
    toast({ title: "Watermark image loaded!" });
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const getPositionCoordinates = () => {
    const p = padding[0];
    switch (position) {
      case "topleft":
        return `x=${p}:y=${p}`;
      case "topright":
        return `x=W-w-${p}:y=${p}`;
      case "bottomleft":
        return `x=${p}:y=H-h-${p}`;
      case "bottomright":
        return `x=W-w-${p}:y=H-h-${p}`;
      case "center":
        return `x=(W-w)/2:y=(H-h)/2`;
      default:
        return `x=W-w-${p}:y=H-h-${p}`;
    }
  };

  const applyWatermark = async () => {
    if (!videoFile || !ffmpegLoaded) {
      toast({ title: "Please upload a video first", variant: "destructive" });
      return;
    }

    if (watermarkType === "text" && !watermarkText.trim()) {
      toast({ title: "Please enter watermark text", variant: "destructive" });
      return;
    }

    if (watermarkType === "image" && !watermarkImage) {
      toast({ title: "Please upload a watermark image", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);
    toast({ title: "Adding watermark... This may take a few minutes" });

    try {
      const ffmpeg = ffmpegRef.current;
      await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));

      const args = ['-i', 'input.mp4'];

      if (watermarkType === "text") {
        // Text watermark using drawtext filter
        const posCoords = getPositionCoordinates();
        const bgColor = backgroundColor.replace('#', '');
        const fgColor = textColor.replace('#', '');
        const bgAlpha = Math.round(backgroundOpacity[0] * 255).toString(16).padStart(2, '0');
        const fgAlpha = Math.round(textOpacity[0] * 255).toString(16).padStart(2, '0');

        const drawtext = `drawtext=text='${watermarkText}':fontsize=${fontSize[0]}:fontcolor=0x${fgColor}${fgAlpha}:${posCoords}:box=1:boxcolor=0x${bgColor}${bgAlpha}:boxborderw=5`;

        args.push('-vf', drawtext);
      } else {
        // Image watermark
        await ffmpeg.writeFile('watermark.png', await fetchFile(watermarkImage!));
        const posCoords = getPositionCoordinates();
        const scale = imageScale[0];
        const opacity = imageOpacity[0];

        const overlay = `[0:v][1:v]overlay=${posCoords}:format=auto:alpha=${opacity}`;
        const scaleFilter = `[1:v]scale=iw*${scale}:ih*${scale}[wm];[0:v][wm]overlay=${posCoords}`;

        args.push('-i', 'watermark.png');
        args.push('-filter_complex', scaleFilter);
      }

      args.push('-codec:a', 'copy');
      args.push('-c:v', 'libx264');
      args.push('-crf', '23');
      args.push('output.mp4');

      console.log('FFmpeg args:', args);
      await ffmpeg.exec(args);

      const data = await ffmpeg.readFile('output.mp4');
      const blob = new Blob([data as BlobPart], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);

      setOutputUrl(url);
      toast({ title: "Watermark added successfully!" });
    } catch (error) {
      console.error('Error adding watermark:', error);
      toast({ title: "Failed to add watermark", variant: "destructive" });
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  const downloadVideo = () => {
    if (!outputUrl) return;

    const link = document.createElement('a');
    link.href = outputUrl;
    link.download = `watermarked-video-${Date.now()}.mp4`;
    link.click();
    toast({ title: "Downloading watermarked video..." });
  };

  return (
    <ToolLayout title="Video Watermark Tool" description="Add text or image watermarks to your videos easily." category="Video Tools">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-br from-cyan-600 to-indigo-600 rounded-xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-600 to-indigo-600 bg-clip-text text-transparent">
              Premium Video Watermark
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Add professional text or image watermarks to protect your videos with full customization
          </p>
          <Badge variant="secondary" className="text-sm">Premium Edition</Badge>
        </div>

        {/* Upload Video */}
        <Card className="shadow-2xl border-2 border-cyan-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Video
            </CardTitle>
            <CardDescription>Upload your video to add watermark</CardDescription>
          </CardHeader>
          <CardContent>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              className="hidden"
            />

            {!videoUrl ? (
              <div
                onClick={() => videoInputRef.current?.click()}
                className="border-2 border-dashed border-cyan-300 rounded-lg p-12 text-center cursor-pointer hover:bg-cyan-50 transition-colors"
              >
                <Droplet className="w-12 h-12 mx-auto mb-4 text-cyan-600" />
                <p className="text-lg font-medium mb-2">Click to upload video</p>
                <p className="text-sm text-muted-foreground">Supports all video formats</p>
                {!ffmpegLoaded && (
                  <p className="text-xs text-yellow-600 mt-2">Loading watermark tool...</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden bg-black">
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    className="w-full max-h-[400px]"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                  <Button
                    onClick={togglePlay}
                    variant="secondary"
                    size="icon"
                    className="absolute bottom-4 left-4"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                </div>

                <Button
                  onClick={() => videoInputRef.current?.click()}
                  variant="outline"
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Different Video
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Watermark Settings */}
        {videoUrl && (
          <Tabs value={watermarkType} onValueChange={(v) => setWatermarkType(v as WatermarkType)} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="text">
                <Type className="w-4 h-4 mr-2" />
                Text Watermark
              </TabsTrigger>
              <TabsTrigger value="image">
                <ImageIcon className="w-4 h-4 mr-2" />
                Image Watermark
              </TabsTrigger>
            </TabsList>

            {/* Text Watermark */}
            <TabsContent value="text">
              <Card>
                <CardHeader>
                  <CardTitle>Text Watermark Settings</CardTitle>
                  <CardDescription>Customize your text watermark</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Watermark Text</Label>
                    <Textarea
                      value={watermarkText}
                      onChange={(e) => setWatermarkText(e.target.value)}
                      placeholder="Enter your watermark text"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Position</Label>
                    <Select value={position} onValueChange={(v) => setPosition(v as Position)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="topleft">Top Left</SelectItem>
                        <SelectItem value="topright">Top Right</SelectItem>
                        <SelectItem value="bottomleft">Bottom Left</SelectItem>
                        <SelectItem value="bottomright">Bottom Right</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Font Size: {fontSize[0]}px</Label>
                    <Slider
                      value={fontSize}
                      onValueChange={setFontSize}
                      min={12}
                      max={120}
                      step={1}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Text Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="w-20"
                        />
                        <Input
                          type="text"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          placeholder="#ffffff"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Background Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="w-20"
                        />
                        <Input
                          type="text"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Text Opacity: {Math.round(textOpacity[0] * 100)}%</Label>
                    <Slider
                      value={textOpacity}
                      onValueChange={setTextOpacity}
                      min={0}
                      max={1}
                      step={0.1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Background Opacity: {Math.round(backgroundOpacity[0] * 100)}%</Label>
                    <Slider
                      value={backgroundOpacity}
                      onValueChange={setBackgroundOpacity}
                      min={0}
                      max={1}
                      step={0.1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Padding: {padding[0]}px</Label>
                    <Slider
                      value={padding}
                      onValueChange={setPadding}
                      min={0}
                      max={100}
                      step={5}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Image Watermark */}
            <TabsContent value="image">
              <Card>
                <CardHeader>
                  <CardTitle>Image Watermark Settings</CardTitle>
                  <CardDescription>Upload and customize your watermark image</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  {!watermarkImageUrl ? (
                    <div
                      onClick={() => imageInputRef.current?.click()}
                      className="border-2 border-dashed border-cyan-300 rounded-lg p-8 text-center cursor-pointer hover:bg-cyan-50 transition-colors"
                    >
                      <ImageIcon className="w-10 h-10 mx-auto mb-3 text-cyan-600" />
                      <p className="text-lg font-medium mb-2">Click to upload watermark image</p>
                      <p className="text-sm text-muted-foreground">PNG with transparency recommended</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative rounded-lg overflow-hidden bg-gray-100 p-4">
                        <img
                          src={watermarkImageUrl}
                          alt="Watermark"
                          className="max-h-40 mx-auto"
                        />
                      </div>
                      <Button
                        onClick={() => imageInputRef.current?.click()}
                        variant="outline"
                        className="w-full"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Different Image
                      </Button>
                    </div>
                  )}

                  {watermarkImageUrl && (
                    <>
                      <div className="space-y-2">
                        <Label>Position</Label>
                        <Select value={position} onValueChange={(v) => setPosition(v as Position)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="topleft">Top Left</SelectItem>
                            <SelectItem value="topright">Top Right</SelectItem>
                            <SelectItem value="bottomleft">Bottom Left</SelectItem>
                            <SelectItem value="bottomright">Bottom Right</SelectItem>
                            <SelectItem value="center">Center</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Size: {Math.round(imageScale[0] * 100)}%</Label>
                        <Slider
                          value={imageScale}
                          onValueChange={setImageScale}
                          min={0.05}
                          max={1}
                          step={0.05}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Opacity: {Math.round(imageOpacity[0] * 100)}%</Label>
                        <Slider
                          value={imageOpacity}
                          onValueChange={setImageOpacity}
                          min={0}
                          max={1}
                          step={0.1}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Padding: {padding[0]}px</Label>
                        <Slider
                          value={padding}
                          onValueChange={setPadding}
                          min={0}
                          max={100}
                          step={5}
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Apply Button */}
        {videoUrl && (
          <Card className="shadow-xl border-2 border-cyan-100">
            <CardContent className="pt-6 space-y-4">
              <Button
                onClick={applyWatermark}
                disabled={isProcessing || !ffmpegLoaded || (watermarkType === "image" && !watermarkImage)}
                className="w-full bg-gradient-to-r from-cyan-600 to-indigo-600"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding Watermark... {processingProgress}%
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Add Watermark to Video
                  </>
                )}
              </Button>

              {isProcessing && (
                <Progress value={processingProgress} className="h-3" />
              )}
            </CardContent>
          </Card>
        )}

        {/* Output Preview */}
        {outputUrl && (
          <Card className="shadow-xl border-2 border-green-100 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-700">Watermark Added Successfully!</CardTitle>
              <CardDescription>Preview and download your watermarked video</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <video src={outputUrl} controls className="w-full rounded" />
              <Button onClick={downloadVideo} className="w-full" size="lg">
                <Download className="w-4 h-4 mr-2" />
                Download Watermarked Video
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Type className="w-5 h-5 text-cyan-600" />
                Text Watermarks
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Add custom text with full control over font, color, opacity, and position
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-600" />
                Image Watermarks
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Use your logo or any image as a watermark with size and opacity control
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                Protect Content
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Permanently embed watermarks to protect your video content from theft
            </CardContent>
          </Card>
        </div>
      </div>
    </ToolLayout>
  );
};

export default PremiumVideoWatermark;
