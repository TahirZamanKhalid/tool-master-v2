import { useState, useRef, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Upload,
  Scissors,
  Download,
  Loader2,
  Play,
  Pause,
  RotateCw,
  Volume2,
  VolumeX,
  FastForward,
  Zap,
  Settings,
  Film,
  Crop,
  FileVideo,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { LazyAdSpace } from "@/components/LazyAdSpace";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface VideoSettings {
  format: string;
  quality: string;
  codec: string;
  resolution: string;
  bitrate: string;
  fps: string;
  rotation: number;
  speed: number;
  volume: number;
  brightness: number;
  contrast: number;
  saturation: number;
  audioCodec: string;
  removeAudio: boolean;
  fadeIn: boolean;
  fadeOut: boolean;
  grayscale: boolean;
  blur: number;
}

const VideoTrimmer = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [outputUrl, setOutputUrl] = useState("");
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [videoInfo, setVideoInfo] = useState<any>(null);

  const [settings, setSettings] = useState<VideoSettings>({
    format: "mp4",
    quality: "high",
    codec: "libx264",
    resolution: "original",
    bitrate: "auto",
    fps: "original",
    rotation: 0,
    speed: 1,
    volume: 100,
    brightness: 0,
    contrast: 0,
    saturation: 0,
    audioCodec: "aac",
    removeAudio: false,
    fadeIn: false,
    fadeOut: false,
    grayscale: false,
    blur: 0,
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const ffmpegRef = useRef(new FFmpeg());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadFFmpeg();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    video.addEventListener("timeupdate", updateTime);

    return () => video.removeEventListener("timeupdate", updateTime);
  }, [videoUrl]);

  const loadFFmpeg = async () => {
    try {
      const ffmpeg = ffmpegRef.current;
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd";

      ffmpeg.on("log", ({ message }) => {
        console.log(message);
      });

      ffmpeg.on("progress", ({ progress }) => {
        setProcessingProgress(Math.round(progress * 100));
      });

      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
        workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, "text/javascript"),
      });

      setFfmpegLoaded(true);
      toast.success("Video editor ready!");
    } catch (error) {
      console.error("Failed to load FFmpeg:", error);
      toast.error("Failed to load video editor. Please refresh the page.");
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("Please upload a video file");
      return;
    }

    if (file.size > 500 * 1024 * 1024) {
      toast.error("File too large. Maximum size is 500MB");
      return;
    }

    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setOutputUrl("");
    toast.success("Video loaded!");
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      const vidWidth = videoRef.current.videoWidth;
      const vidHeight = videoRef.current.videoHeight;

      setDuration(dur);
      setEndTime(dur);
      setVideoInfo({
        duration: dur,
        width: vidWidth,
        height: vidHeight,
        size: videoFile?.size,
        type: videoFile?.type,
      });
    }
  };

  const buildFFmpegCommand = () => {
    const commands: string[] = [];
    const filters: string[] = [];

    // Input
    commands.push("-i", "input.mp4");

    // Trim
    commands.push("-ss", startTime.toString());
    commands.push("-t", (endTime - startTime).toString());

    // Speed
    if (settings.speed !== 1) {
      const speedValue = 1 / settings.speed;
      filters.push(`setpts=${speedValue}*PTS`);
      if (!settings.removeAudio) {
        // Handle atempo (must be between 0.5 and 2.0, chain if needed)
        let tempoValue = settings.speed;
        while (tempoValue > 2.0) {
          filters.push(`atempo=2.0`);
          tempoValue /= 2.0;
        }
        while (tempoValue < 0.5) {
          filters.push(`atempo=0.5`);
          tempoValue /= 0.5;
        }
        if (tempoValue !== 1.0) {
          filters.push(`atempo=${tempoValue}`);
        }
      }
    }

    // Rotation
    if (settings.rotation !== 0) {
      const rotations = {
        90: "transpose=1",
        180: "transpose=1,transpose=1",
        270: "transpose=2",
      };
      filters.push(rotations[settings.rotation as keyof typeof rotations] || "");
    }

    // Video filters
    const videoFilters: string[] = [];

    if (settings.brightness !== 0) {
      videoFilters.push(`eq=brightness=${settings.brightness / 100}`);
    }
    if (settings.contrast !== 0) {
      videoFilters.push(`eq=contrast=${1 + settings.contrast / 100}`);
    }
    if (settings.saturation !== 0) {
      videoFilters.push(`eq=saturation=${1 + settings.saturation / 100}`);
    }
    if (settings.grayscale) {
      videoFilters.push("hue=s=0");
    }
    if (settings.blur > 0) {
      videoFilters.push(`boxblur=${settings.blur}:${settings.blur}`);
    }

    // Resolution
    if (settings.resolution !== "original") {
      videoFilters.push(`scale=${settings.resolution}`);
    }

    // FPS
    if (settings.fps !== "original") {
      videoFilters.push(`fps=${settings.fps}`);
    }

    // Fade effects
    if (settings.fadeIn) {
      videoFilters.push("fade=t=in:st=0:d=1");
    }
    if (settings.fadeOut) {
      const fadeStart = endTime - startTime - 1;
      videoFilters.push(`fade=t=out:st=${fadeStart}:d=1`);
    }

    // Combine video filters
    if (videoFilters.length > 0) {
      filters.push(videoFilters.join(","));
    }

    // Apply filters
    if (filters.length > 0) {
      commands.push("-vf", filters.join(","));
    }

    // Audio settings
    if (settings.removeAudio) {
      commands.push("-an");
    } else {
      commands.push("-c:a", settings.audioCodec);
      if (settings.volume !== 100) {
        commands.push("-af", `volume=${settings.volume / 100}`);
      }
    }

    // Video codec and quality
    commands.push("-c:v", settings.codec);

    const qualitySettings = {
      low: "28",
      medium: "23",
      high: "18",
      best: "15",
    };
    commands.push("-crf", qualitySettings[settings.quality as keyof typeof qualitySettings]);

    // Bitrate
    if (settings.bitrate !== "auto") {
      commands.push("-b:v", settings.bitrate);
    }

    // Output format
    const outputFile = `output.${settings.format}`;
    commands.push(outputFile);

    return { commands, outputFile };
  };

  const processVideo = async () => {
    if (!videoFile || !ffmpegLoaded) {
      toast.error("Please upload a video first");
      return;
    }

    if (startTime >= endTime) {
      toast.error("Start time must be less than end time");
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      const ffmpeg = ffmpegRef.current;

      await ffmpeg.writeFile("input.mp4", await fetchFile(videoFile));

      const { commands, outputFile } = buildFFmpegCommand();

      toast.info("Processing video... This may take a few minutes");

      await ffmpeg.exec(commands);

      const data = await ffmpeg.readFile(outputFile);
      const mimeTypes: { [key: string]: string } = {
        mp4: "video/mp4",
        webm: "video/webm",
        avi: "video/x-msvideo",
        mov: "video/quicktime",
        mkv: "video/x-matroska",
      };

      const blob = new Blob([data as BlobPart], {
        type: mimeTypes[settings.format] || "video/mp4",
      });
      const url = URL.createObjectURL(blob);

      setOutputUrl(url);
      toast.success("Video processed successfully!");
    } catch (error) {
      console.error("Error processing video:", error);
      toast.error("Failed to process video. Try different settings.");
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  const downloadVideo = () => {
    if (!outputUrl) return;

    const link = document.createElement("a");
    link.href = outputUrl;
    link.download = `processed-video-${Date.now()}.${settings.format}`;
    link.click();
    toast.success("Downloading...");
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

  const seekToTime = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <>
      <SEOHead
        title="Advanced Video Editor & Trimmer - Cut, Convert, Compress Videos Online"
        description="Professional video editing tool with trimming, cutting, conversion, compression, filters, rotation, speed control and more. Process videos directly in your browser with no upload required."
        keywords="video editor, video trimmer, video cutter, convert video, compress video, video filters, rotate video, speed video, trim video online, ffmpeg"
        canonical="https://toolmaster.cloud/tools/video-trimmer"
      />
      <ToolLayout
        title="Advanced Video Editor & Trimmer"
        description="Professional video editing with trimming, conversion, compression, filters and more - all in your browser!"
        category="Video & Audio"
        instructions={[
          "Upload a video file (MP4, MOV, AVI, WebM, MKV - Max 500MB)",
          "Use the timeline to set start and end times for trimming",
          "Customize video settings: format, quality, filters, rotation, speed",
          "Apply effects like brightness, contrast, blur, fade in/out",
          "Click 'Process Video' to apply all changes",
          "Preview and download your edited video",
        ]}
        relatedTools={[
          { name: "Image Compressor", path: "/tools/image-compressor" },
          { name: "PDF Compressor", path: "/tools/pdf-compressor" },
        ]}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content Area - 8 columns */}
          <div className="lg:col-span-8 space-y-6">
            <Card>
              <CardContent className="p-6 space-y-6">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                />

                {!videoUrl ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:border-primary transition-all hover:bg-muted/50"
                  >
                    <Upload className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-xl font-semibold mb-2">Click to upload video</p>
                    <p className="text-sm text-muted-foreground mb-4">Supports MP4, MOV, AVI, WebM, MKV (Max 500MB)</p>
                    {!ffmpegLoaded ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <p className="text-sm text-yellow-600">Loading video editor...</p>
                      </div>
                    ) : (
                      <p className="text-sm text-green-600 flex items-center justify-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Editor ready!
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Video Preview */}
                    <div className="relative rounded-lg overflow-hidden bg-black">
                      <video
                        ref={videoRef}
                        src={videoUrl}
                        className="w-full max-h-[500px]"
                        onLoadedMetadata={handleLoadedMetadata}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <Button onClick={togglePlay} variant="secondary" size="icon" className="h-10 w-10">
                            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                          </Button>
                          <div className="flex-1">
                            <input
                              type="range"
                              min="0"
                              max={duration}
                              step="0.1"
                              value={currentTime}
                              onChange={(e) => seekToTime(parseFloat(e.target.value))}
                              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>
                          <span className="text-white text-sm font-medium">
                            {formatTime(currentTime)} / {formatTime(duration)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Video Info */}
                    {videoInfo && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-muted rounded-lg">
                        <div>
                          <p className="text-xs text-muted-foreground">Duration</p>
                          <p className="font-semibold">{formatTime(videoInfo.duration)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Resolution</p>
                          <p className="font-semibold">
                            {videoInfo.width}x{videoInfo.height}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Size</p>
                          <p className="font-semibold">{formatFileSize(videoInfo.size)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Format</p>
                          <p className="font-semibold">{videoInfo.type?.split("/")[1]?.toUpperCase()}</p>
                        </div>
                      </div>
                    )}

                    {/* Trim Controls */}
                    <Card className="border-2">
                      <CardContent className="p-4 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Scissors className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold text-lg">Trim Timeline</h3>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <Label className="text-sm font-medium">Start Time</Label>
                              <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                                {formatTime(startTime)}
                              </span>
                            </div>
                            <Slider
                              value={[startTime]}
                              onValueChange={(value) => setStartTime(value[0])}
                              max={duration}
                              step={0.1}
                              className="w-full"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <Label className="text-sm font-medium">End Time</Label>
                              <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                                {formatTime(endTime)}
                              </span>
                            </div>
                            <Slider
                              value={[endTime]}
                              onValueChange={(value) => setEndTime(value[0])}
                              max={duration}
                              step={0.1}
                              className="w-full"
                            />
                          </div>

                          <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                            <span className="text-sm font-medium">Trim Duration:</span>
                            <span className="text-lg font-bold text-primary">{formatTime(endTime - startTime)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Advanced Settings */}
                    <Card className="border-2">
                      <CardContent className="p-4">
                        <Tabs defaultValue="basic" className="w-full">
                          <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="basic">Basic</TabsTrigger>
                            <TabsTrigger value="effects">Effects</TabsTrigger>
                            <TabsTrigger value="advanced">Advanced</TabsTrigger>
                          </TabsList>

                          {/* Basic Settings */}
                          <TabsContent value="basic" className="space-y-4 mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Output Format</Label>
                                <Select
                                  value={settings.format}
                                  onValueChange={(value) => setSettings({ ...settings, format: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="mp4">MP4 (Recommended)</SelectItem>
                                    <SelectItem value="webm">WebM</SelectItem>
                                    <SelectItem value="avi">AVI</SelectItem>
                                    <SelectItem value="mov">MOV</SelectItem>
                                    <SelectItem value="mkv">MKV</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label>Quality</Label>
                                <Select
                                  value={settings.quality}
                                  onValueChange={(value) => setSettings({ ...settings, quality: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="best">Best (Largest file)</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="low">Low (Smallest file)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label>Resolution</Label>
                                <Select
                                  value={settings.resolution}
                                  onValueChange={(value) => setSettings({ ...settings, resolution: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="original">Original</SelectItem>
                                    <SelectItem value="1920:1080">1080p (1920x1080)</SelectItem>
                                    <SelectItem value="1280:720">720p (1280x720)</SelectItem>
                                    <SelectItem value="854:480">480p (854x480)</SelectItem>
                                    <SelectItem value="640:360">360p (640x360)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label>Rotation</Label>
                                <Select
                                  value={settings.rotation.toString()}
                                  onValueChange={(value) => setSettings({ ...settings, rotation: parseInt(value) })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="0">No Rotation</SelectItem>
                                    <SelectItem value="90">90° Clockwise</SelectItem>
                                    <SelectItem value="180">180°</SelectItem>
                                    <SelectItem value="270">270° Clockwise</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div>
                                <div className="flex justify-between items-center mb-2">
                                  <Label>Speed: {settings.speed}x</Label>
                                </div>
                                <Slider
                                  value={[settings.speed]}
                                  onValueChange={(value) => setSettings({ ...settings, speed: value[0] })}
                                  min={0.25}
                                  max={4}
                                  step={0.25}
                                  className="w-full"
                                />
                                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                  <span>0.25x (Slow)</span>
                                  <span>4x (Fast)</span>
                                </div>
                              </div>

                              <div>
                                <div className="flex justify-between items-center mb-2">
                                  <Label>Volume: {settings.volume}%</Label>
                                </div>
                                <Slider
                                  value={[settings.volume]}
                                  onValueChange={(value) => setSettings({ ...settings, volume: value[0] })}
                                  max={200}
                                  step={5}
                                  className="w-full"
                                />
                              </div>

                              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <Label htmlFor="remove-audio">Remove Audio</Label>
                                <Switch
                                  id="remove-audio"
                                  checked={settings.removeAudio}
                                  onCheckedChange={(checked) => setSettings({ ...settings, removeAudio: checked })}
                                />
                              </div>
                            </div>
                          </TabsContent>

                          {/* Effects */}
                          <TabsContent value="effects" className="space-y-4 mt-4">
                            <div className="space-y-4">
                              <div>
                                <div className="flex justify-between items-center mb-2">
                                  <Label>
                                    Brightness: {settings.brightness > 0 ? "+" : ""}
                                    {settings.brightness}
                                  </Label>
                                </div>
                                <Slider
                                  value={[settings.brightness]}
                                  onValueChange={(value) => setSettings({ ...settings, brightness: value[0] })}
                                  min={-100}
                                  max={100}
                                  step={5}
                                />
                              </div>

                              <div>
                                <div className="flex justify-between items-center mb-2">
                                  <Label>
                                    Contrast: {settings.contrast > 0 ? "+" : ""}
                                    {settings.contrast}
                                  </Label>
                                </div>
                                <Slider
                                  value={[settings.contrast]}
                                  onValueChange={(value) => setSettings({ ...settings, contrast: value[0] })}
                                  min={-100}
                                  max={100}
                                  step={5}
                                />
                              </div>

                              <div>
                                <div className="flex justify-between items-center mb-2">
                                  <Label>
                                    Saturation: {settings.saturation > 0 ? "+" : ""}
                                    {settings.saturation}
                                  </Label>
                                </div>
                                <Slider
                                  value={[settings.saturation]}
                                  onValueChange={(value) => setSettings({ ...settings, saturation: value[0] })}
                                  min={-100}
                                  max={100}
                                  step={5}
                                />
                              </div>

                              <div>
                                <div className="flex justify-between items-center mb-2">
                                  <Label>Blur: {settings.blur}</Label>
                                </div>
                                <Slider
                                  value={[settings.blur]}
                                  onValueChange={(value) => setSettings({ ...settings, blur: value[0] })}
                                  max={20}
                                  step={1}
                                />
                              </div>

                              <div className="space-y-3 pt-2">
                                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                  <Label htmlFor="grayscale">Grayscale</Label>
                                  <Switch
                                    id="grayscale"
                                    checked={settings.grayscale}
                                    onCheckedChange={(checked) => setSettings({ ...settings, grayscale: checked })}
                                  />
                                </div>

                                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                  <Label htmlFor="fade-in">Fade In</Label>
                                  <Switch
                                    id="fade-in"
                                    checked={settings.fadeIn}
                                    onCheckedChange={(checked) => setSettings({ ...settings, fadeIn: checked })}
                                  />
                                </div>

                                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                  <Label htmlFor="fade-out">Fade Out</Label>
                                  <Switch
                                    id="fade-out"
                                    checked={settings.fadeOut}
                                    onCheckedChange={(checked) => setSettings({ ...settings, fadeOut: checked })}
                                  />
                                </div>
                              </div>
                            </div>
                          </TabsContent>

                          {/* Advanced */}
                          <TabsContent value="advanced" className="space-y-4 mt-4">
                            <div className="grid grid-cols-1 gap-4">
                              <div className="space-y-2">
                                <Label>Video Codec</Label>
                                <Select
                                  value={settings.codec}
                                  onValueChange={(value) => setSettings({ ...settings, codec: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="libx264">H.264 (Best compatibility)</SelectItem>
                                    <SelectItem value="libx265">H.265/HEVC (Better compression)</SelectItem>
                                    <SelectItem value="libvpx-vp9">VP9 (WebM)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label>Audio Codec</Label>
                                <Select
                                  value={settings.audioCodec}
                                  onValueChange={(value) => setSettings({ ...settings, audioCodec: value })}
                                  disabled={settings.removeAudio}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="aac">AAC</SelectItem>
                                    <SelectItem value="mp3">MP3</SelectItem>
                                    <SelectItem value="libopus">Opus</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label>Frame Rate (FPS)</Label>
                                <Select
                                  value={settings.fps}
                                  onValueChange={(value) => setSettings({ ...settings, fps: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="original">Original</SelectItem>
                                    <SelectItem value="24">24 FPS (Cinematic)</SelectItem>
                                    <SelectItem value="30">30 FPS</SelectItem>
                                    <SelectItem value="60">60 FPS (Smooth)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label>Bitrate</Label>
                                <Select
                                  value={settings.bitrate}
                                  onValueChange={(value) => setSettings({ ...settings, bitrate: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="auto">Auto</SelectItem>
                                    <SelectItem value="500k">500 Kbps</SelectItem>
                                    <SelectItem value="1M">1 Mbps</SelectItem>
                                    <SelectItem value="2M">2 Mbps</SelectItem>
                                    <SelectItem value="5M">5 Mbps</SelectItem>
                                    <SelectItem value="10M">10 Mbps</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={processVideo}
                        disabled={isProcessing || !ffmpegLoaded}
                        className="flex-1"
                        size="lg"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Processing... {processingProgress}%
                          </>
                        ) : (
                          <>
                            <Zap className="h-5 w-5 mr-2" />
                            Process Video
                          </>
                        )}
                      </Button>

                      <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="lg">
                        <Upload className="h-5 w-5 mr-2" />
                        New Video
                      </Button>
                    </div>

                    {/* Output Preview */}
                    {outputUrl && (
                      <Card className="border-2 border-green-500">
                        <CardContent className="p-6 space-y-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                              <Sparkles className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-bold text-lg">Video Processed Successfully!</h3>
                              <p className="text-sm text-muted-foreground">Preview and download your edited video</p>
                            </div>
                          </div>

                          <video src={outputUrl} controls className="w-full rounded-lg border-2" />

                          <Button onClick={downloadVideo} className="w-full" size="lg">
                            <Download className="h-5 w-5 mr-2" />
                            Download Video
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {/* Privacy Notice */}
                <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200">
                  <Film className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">100% Private & Secure</p>
                    <p className="text-blue-700 dark:text-blue-200">
                      All video processing happens locally in your browser using WebAssembly. Your videos are never
                      uploaded to any server. Maximum privacy guaranteed.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar for Ads - 4 columns */}
          <div className="lg:col-span-4 space-y-6">
            {/* Ad Space 1 */}
            <Card className="sticky top-6">
              <CardContent className="p-6">
                <LazyAdSpace
                  type="display"
                  slot="8364314011"
                  className="min-h-[250px]"
                />
              </CardContent>
            </Card>

            {/* Features Info */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Features
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Trim & cut videos with precision</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Convert between formats (MP4, WebM, AVI, MOV)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Compress with quality control</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Adjust speed (0.25x to 4x)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Rotate & flip videos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Apply filters & effects</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Adjust brightness, contrast, saturation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Add fade in/out effects</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Control volume or remove audio</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>No watermarks or file limits</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Ad Space 2 */}
            <Card>
              <CardContent className="p-6">
                <LazyAdSpace
                  type="display"
                  slot="5105501959"
                  className="min-h-[250px]"
                />
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card>
              <CardContent className="p-6 space-y-3">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Quick Tips
                </h3>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="text-sm">Best Quality Settings</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      Use "High" or "Best" quality with H.264 codec for maximum compatibility and excellent quality
                      balance.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger className="text-sm">Reduce File Size</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      Lower the quality to "Medium" or "Low", reduce resolution to 720p or 480p, and use lower bitrates
                      like 1-2 Mbps.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger className="text-sm">Processing Time</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      Longer videos and higher quality settings take more time. Using "copy" mode (no filters) is
                      fastest.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </div>
      </ToolLayout>
    </>
  );
};

export default VideoTrimmer;
