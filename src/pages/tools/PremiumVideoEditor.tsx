import { useState, useRef, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import {
  Video,
  Upload,
  Download,
  Scissors,
  Sparkles,
  Wand2,
  Type,
  Image as ImageIcon,
  Volume2,
  Zap,
  Play,
  Pause,
  RotateCw,
  Sliders,
  Loader2,
  X,
  Plus,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { SEOHead } from "@/components/SEOHead";
import { deleteFFmpegFiles, loadFFmpegCore } from "@/utils/ffmpeg";
import {
  getAtempoFilters,
  getVideoDownloadName,
  getVideoMimeType,
  revokeMediaUrl,
  validateVideoFile,
} from "@/utils/videoFiles";

interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
  startTime: number;
  endTime: number;
}

interface VideoSettings {
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  blur: number;
  sharpen: number;
  volume: number;
  speed: number;
  rotation: number;
  flipHorizontal: boolean;
  flipVertical: boolean;
}

const PremiumVideoEditor = () => {
  const { toast } = useToast();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [outputUrl, setOutputUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [format, setFormat] = useState("mp4");
  const [quality, setQuality] = useState("high");
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [activeTab, setActiveTab] = useState("trim");
  const [isAudioReady, setIsAudioReady] = useState(false);

  const [settings, setSettings] = useState<VideoSettings>({
    brightness: 1,
    contrast: 1,
    saturation: 1,
    hue: 0,
    blur: 0,
    sharpen: 0,
    volume: 1,
    speed: 1,
    rotation: 0,
    flipHorizontal: false,
    flipVertical: false,
  });

  const ffmpegRef = useRef(new FFmpeg());
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);

  useEffect(() => {
    loadFFmpeg();
  }, []);

  const loadFFmpeg = async () => {
    const ffmpeg = ffmpegRef.current;
    try {
      await loadFFmpegCore(ffmpeg);

      setFfmpegLoaded(true);
      toast({
        title: "Video editor loaded successfully!",
        description: "You can now upload and edit your videos",
      });
    } catch {
      toast({
        title: "Failed to load video editor",
        description: "Please refresh and try again.",
        variant: "destructive",
      });
    }
  };

  // Enhanced audio setup with better error handling
  const setupAudio = async () => {
    if (!videoRef.current || isAudioReady) return;

    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContext();

      sourceNodeRef.current = audioContextRef.current.createMediaElementSource(videoRef.current);
      gainNodeRef.current = audioContextRef.current.createGain();

      sourceNodeRef.current.connect(gainNodeRef.current);
      gainNodeRef.current.connect(audioContextRef.current.destination);

      // Set initial volume
      gainNodeRef.current.gain.value = settings.volume;

      setIsAudioReady(true);
    } catch {
      setIsAudioReady(false);
    }
  };

  // Enhanced video event handlers
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration || 0;
      setDuration(dur);
      setTrimEnd(dur);

      // Setup audio when metadata is loaded
      setupAudio();
    }
  };

  // Enhanced volume control
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isAudioReady && gainNodeRef.current) {
      // Use Web Audio API for advanced volume control
      gainNodeRef.current.gain.value = settings.volume;
      video.muted = false;
    } else {
      // Fallback to native volume control
      video.volume = Math.min(settings.volume, 1);
      video.muted = settings.volume > 1;
    }
  }, [settings.volume, isAudioReady]);

  // Enhanced playback speed control
  useEffect(() => {
    const video = videoRef.current;
    if (video && video.playbackRate !== undefined) {
      video.playbackRate = settings.speed;
    }
  }, [settings.speed]);

  // Enhanced trim preview
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isPlaying) return;

    const checkTime = () => {
      if (video.currentTime >= trimEnd && trimEnd > 0) {
        video.pause();
        setIsPlaying(false);
        video.currentTime = trimStart;
      }
    };

    const interval = setInterval(checkTime, 100);
    return () => clearInterval(interval);
  }, [trimStart, trimEnd, isPlaying]);

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateVideoFile(file);
    if (validationError) {
      toast({
        title: "Invalid video",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    // Clean up previous URLs
    revokeMediaUrl(videoUrl);
    revokeMediaUrl(outputUrl);

    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setOutputUrl("");
    setIsAudioReady(false);

    toast({
      title: "Video loaded successfully!",
      description: "You can now start editing your video",
    });
  };

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (isPlaying) {
        video.pause();
        setIsPlaying(false);
      } else {
        // Ensure audio context is resumed on user gesture
        if (audioContextRef.current?.state === "suspended") {
          await audioContextRef.current.resume();
        }

        // Set playback rate
        video.playbackRate = settings.speed;

        // Ensure we're within trim bounds
        if (video.currentTime < trimStart) {
          video.currentTime = trimStart;
        }

        await video.play();
        setIsPlaying(true);
      }
    } catch {
      toast({
        title: "Playback error",
        description: "Could not play the video",
        variant: "destructive",
      });
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    const currentTime = video.currentTime;
    setCurrentTime(currentTime);

    // Auto-pause at trim end
    if (isPlaying && trimEnd > 0 && currentTime >= trimEnd) {
      video.pause();
      setIsPlaying(false);
      video.currentTime = trimStart;
    }
  };

  const seekVideo = (time: number) => {
    const video = videoRef.current;
    if (!video) return;

    const seekTime = Math.max(0, Math.min(time, duration));
    video.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const buildFilterString = () => {
    const filters: string[] = [];

    // Color adjustments with better filter composition
    const colorFilters = [];
    if (settings.brightness !== 1 || settings.contrast !== 1 || settings.saturation !== 1) {
      colorFilters.push(
        `eq=brightness=${(settings.brightness - 1) * 0.3}:contrast=${settings.contrast}:saturation=${settings.saturation}`
      );
    }

    if (colorFilters.length > 0) {
      filters.push(colorFilters.join(","));
    }

    // Hue rotation
    if (settings.hue !== 0) {
      filters.push(`hue=h=${settings.hue}:s=1`);
    }

    // Blur with better performance
    if (settings.blur > 0) {
      filters.push(`gblur=sigma=${settings.blur}`);
    }

    // Sharpen with better parameters
    if (settings.sharpen > 0) {
      filters.push(`unsharp=3:3:${settings.sharpen}:3:3:0`);
    }

    // Rotation and flip
    const transformFilters = [];
    if (settings.rotation !== 0) {
      transformFilters.push(`rotate=${(settings.rotation * Math.PI) / 180}`);
    }
    if (settings.flipHorizontal) {
      transformFilters.push("hflip");
    }
    if (settings.flipVertical) {
      transformFilters.push("vflip");
    }

    if (transformFilters.length > 0) {
      filters.push(transformFilters.join(","));
    }

    return filters.length > 0 ? filters.join(",") : null;
  };

  const processVideo = async () => {
    if (!videoFile || !ffmpegLoaded) {
      toast({
        title: "Cannot process video",
        description: "Please upload a video and wait for editor to load",
        variant: "destructive",
      });
      return;
    }

    if (trimStart >= trimEnd) {
      toast({
        title: "Invalid trim range",
        description: "Start time must be before end time.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    toast({
      title: "Processing started",
      description: "Your video is being processed. This may take a few minutes...",
    });

    try {
      const ffmpeg = ffmpegRef.current;

      // Write input file
      await ffmpeg.writeFile("input.mp4", await fetchFile(videoFile));

      const args = ["-i", "input.mp4"];
      const videoFilters = [];
      const audioFilters = [];

      // Build video filters
      const filterString = buildFilterString();
      if (filterString) {
        videoFilters.push(filterString);
      }

      // Speed adjustment
      if (settings.speed !== 1) {
        videoFilters.push(`setpts=${1 / settings.speed}*PTS`);
        audioFilters.push(...getAtempoFilters(settings.speed));
      }

      // Add trim if specified
      if (trimStart > 0 || trimEnd < duration) {
        args.push("-ss", trimStart.toString());
        args.push("-t", (trimEnd - trimStart).toString());
      }

      // Apply video filters
      if (videoFilters.length > 0) {
        args.push("-vf", videoFilters.join(","));
      }

      if (settings.volume !== 1) {
        audioFilters.push(`volume=${settings.volume}`);
      }
      if (audioFilters.length > 0) {
        args.push("-af", audioFilters.join(","));
      }

      // Quality settings
      const qualitySettings = {
        high: ["-crf", "18", "-preset", "medium"],
        medium: ["-crf", "23", "-preset", "fast"],
        low: ["-crf", "28", "-preset", "veryfast"],
      };

      args.push(...qualitySettings[quality as keyof typeof qualitySettings]);

      // Output format specific settings
      if (format === "webm") {
        args.push("-c:v", "libvpx-vp9", "-b:v", "2M");
        args.push("-c:a", "libopus");
      } else if (format === "avi") {
        args.push("-c:v", "mpeg4", "-qscale:v", "3");
      } else {
        args.push("-c:v", "libx264", "-profile:v", "high", "-level", "4.0");
        args.push("-c:a", "aac");
        args.push("-movflags", "+faststart");
      }

      args.push("-y"); // Overwrite output file

      const outputFile = `output.${format}`;
      args.push(outputFile);

      await ffmpeg.exec(args);

      // Read and create output URL
      const data = await ffmpeg.readFile(outputFile);
      const mimeType = getVideoMimeType(format);
      const blob = new Blob([data as BlobPart], { type: mimeType });
      await deleteFFmpegFiles(ffmpeg, ["input.mp4", outputFile]);
      revokeMediaUrl(outputUrl);
      const url = URL.createObjectURL(blob);

      setOutputUrl(url);

      toast({
        title: "Processing complete!",
        description: "Your video is ready for download",
      });
    } catch {
      toast({
        title: "Processing failed",
        description: "There was an error processing your video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadVideo = () => {
    if (!outputUrl) return;

    const link = document.createElement("a");
    link.href = outputUrl;
    link.download = getVideoDownloadName("edited", videoFile, format);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({ title: "Download started!" });
  };

  const resetSettings = () => {
    setSettings({
      brightness: 1,
      contrast: 1,
      saturation: 1,
      hue: 0,
      blur: 0,
      sharpen: 0,
      volume: 1,
      speed: 1,
      rotation: 0,
      flipHorizontal: false,
      flipVertical: false,
    });
    setTrimStart(0);
    setTrimEnd(duration);
    setTextOverlays([]);

    toast({ title: "All settings have been reset!" });
  };

  const formatTime = (seconds: number) => {
    const safeSeconds = Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
    const mins = Math.floor(safeSeconds / 60);
    const secs = Math.floor(safeSeconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      revokeMediaUrl(videoUrl);
      revokeMediaUrl(outputUrl);
    };
  }, [videoUrl, outputUrl]);

  return (
    <ToolLayout title="AI Video Editor" description="Edit videos with AI-powered tools including trim, merge, and effects." category="Video Tools">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Premium Video Editor
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Professional video editing with real-time preview, advanced filters, and high-quality exports
          </p>
          <div className="flex gap-2 justify-center">
            <Badge variant="secondary" className="text-sm">
              100% Private
            </Badge>
            <Badge variant="secondary" className="text-sm">
              Browser-Based
            </Badge>
            <Badge variant="secondary" className="text-sm">
              No Watermark
            </Badge>
          </div>
        </div>

        {/* Upload Section */}
        <Card className="shadow-2xl border-2 border-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Video
            </CardTitle>
            <CardDescription>
              {ffmpegLoaded ? "Upload your video to start editing" : "Loading video editor... Please wait"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              className="hidden"
              disabled={!ffmpegLoaded}
            />

            {!videoUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all ${
                  ffmpegLoaded
                    ? "border-blue-300 hover:border-blue-500 hover:bg-blue-50"
                    : "border-gray-300 bg-gray-50 cursor-not-allowed"
                }`}
              >
                <Video className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                <p className="text-lg font-medium mb-2">
                  {ffmpegLoaded ? "Click to upload video" : "Loading editor..."}
                </p>
                <p className="text-sm text-muted-foreground">Supports MP4, MOV, AVI, WebM (Max 500MB)</p>
                {!ffmpegLoaded && (
                  <div className="mt-4 flex justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden bg-black">
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    className="w-full max-h-[500px]"
                    onLoadedMetadata={handleLoadedMetadata}
                    onTimeUpdate={handleTimeUpdate}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                    style={{
                      filter: `
                        brightness(${settings.brightness})
                        contrast(${settings.contrast})
                        saturate(${settings.saturation})
                        hue-rotate(${settings.hue}deg)
                        blur(${settings.blur}px)
                      `,
                      transform: `
                        rotate(${settings.rotation}deg)
                        scaleX(${settings.flipHorizontal ? -1 : 1})
                        scaleY(${settings.flipVertical ? -1 : 1})
                      `,
                      transformOrigin: "center",
                    }}
                  />

                  {/* Video Controls */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex items-center gap-4 mb-2">
                      <Button
                        onClick={togglePlay}
                        variant="secondary"
                        size="icon"
                        className="bg-white/20 hover:bg-white/30 text-white"
                      >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>

                      <div className="flex-1">
                        <Slider
                          value={[currentTime]}
                          onValueChange={([value]) => seekVideo(value)}
                          min={0}
                          max={duration}
                          step={0.1}
                          className="cursor-pointer"
                        />
                      </div>

                      <div className="text-white text-sm font-medium min-w-[80px] text-right">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </div>
                    </div>
                  </div>

                  {/* Live Preview Badge */}
                  <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    Live Preview
                  </div>

                  {/* Audio Status */}
                  {isAudioReady && (
                    <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Audio Enhanced
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="flex-1">
                    <Upload className="w-4 h-4 mr-2" />
                    Change Video
                  </Button>

                  <Button onClick={resetSettings} variant="outline">
                    <RotateCw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Editor Tabs */}
        {videoUrl && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6 lg:grid-cols-6 md:grid-cols-3 sm:grid-cols-2 gap-1">
              <TabsTrigger value="trim" className="flex items-center gap-2">
                <Scissors className="w-4 h-4" />
                <span className="hidden sm:inline">Trim</span>
              </TabsTrigger>
              <TabsTrigger value="filters" className="flex items-center gap-2">
                <Wand2 className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
              </TabsTrigger>
              <TabsTrigger value="adjust" className="flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                <span className="hidden sm:inline">Adjust</span>
              </TabsTrigger>
              <TabsTrigger value="transform" className="flex items-center gap-2">
                <RotateCw className="w-4 h-4" />
                <span className="hidden sm:inline">Transform</span>
              </TabsTrigger>
              <TabsTrigger value="audio" className="flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                <span className="hidden sm:inline">Audio</span>
              </TabsTrigger>
              <TabsTrigger value="export" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </TabsTrigger>
            </TabsList>

            {/* Trim Tab */}
            <TabsContent value="trim">
              <Card>
                <CardHeader>
                  <CardTitle>Trim Video</CardTitle>
                  <CardDescription>Set start and end points for your video</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Start Time: {formatTime(trimStart)}</Label>
                      <Slider
                        value={[trimStart]}
                        onValueChange={([value]) => {
                          setTrimStart(value);
                          if (value > currentTime) seekVideo(value);
                        }}
                        min={0}
                        max={duration}
                        step={0.1}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>End Time: {formatTime(trimEnd)}</Label>
                      <Slider
                        value={[trimEnd]}
                        onValueChange={([value]) => setTrimEnd(value)}
                        min={0}
                        max={duration}
                        step={0.1}
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-blue-900">Trimmed Duration:</span>
                      <span className="text-lg font-bold text-blue-700">{formatTime(trimEnd - trimStart)}</span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      Original: {formatTime(duration)} - Removed: {formatTime(duration - (trimEnd - trimStart))}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Filters Tab */}
            <TabsContent value="filters">
              <Card>
                <CardHeader>
                  <CardTitle>Visual Effects</CardTitle>
                  <CardDescription>Apply blur and sharpen effects</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="flex justify-between">
                        <span>Blur</span>
                        <span className="text-blue-600 font-mono">{settings.blur.toFixed(1)}px</span>
                      </Label>
                      <Slider
                        value={[settings.blur]}
                        onValueChange={([value]) => setSettings((prev) => ({ ...prev, blur: value }))}
                        min={0}
                        max={10}
                        step={0.5}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex justify-between">
                        <span>Sharpen</span>
                        <span className="text-blue-600 font-mono">{settings.sharpen.toFixed(1)}</span>
                      </Label>
                      <Slider
                        value={[settings.sharpen]}
                        onValueChange={([value]) => setSettings((prev) => ({ ...prev, sharpen: value }))}
                        min={0}
                        max={3}
                        step={0.1}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Adjust Tab */}
            <TabsContent value="adjust">
              <Card>
                <CardHeader>
                  <CardTitle>Color Adjustments</CardTitle>
                  <CardDescription>Fine-tune colors and lighting</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="flex justify-between">
                        <span>Brightness</span>
                        <span className="text-blue-600 font-mono">{settings.brightness.toFixed(2)}</span>
                      </Label>
                      <Slider
                        value={[settings.brightness]}
                        onValueChange={([value]) => setSettings((prev) => ({ ...prev, brightness: value }))}
                        min={0.5}
                        max={1.5}
                        step={0.01}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex justify-between">
                        <span>Contrast</span>
                        <span className="text-blue-600 font-mono">{settings.contrast.toFixed(2)}</span>
                      </Label>
                      <Slider
                        value={[settings.contrast]}
                        onValueChange={([value]) => setSettings((prev) => ({ ...prev, contrast: value }))}
                        min={0.5}
                        max={2}
                        step={0.01}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex justify-between">
                        <span>Saturation</span>
                        <span className="text-blue-600 font-mono">{settings.saturation.toFixed(2)}</span>
                      </Label>
                      <Slider
                        value={[settings.saturation]}
                        onValueChange={([value]) => setSettings((prev) => ({ ...prev, saturation: value }))}
                        min={0}
                        max={2}
                        step={0.01}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex justify-between">
                        <span>Hue</span>
                        <span className="text-blue-600 font-mono">{settings.hue} deg</span>
                      </Label>
                      <Slider
                        value={[settings.hue]}
                        onValueChange={([value]) => setSettings((prev) => ({ ...prev, hue: value }))}
                        min={-180}
                        max={180}
                        step={1}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Transform Tab */}
            <TabsContent value="transform">
              <Card>
                <CardHeader>
                  <CardTitle>Transform Video</CardTitle>
                  <CardDescription>Rotate, flip, and change playback speed</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="flex justify-between">
                        <span>Rotation</span>
                        <span className="text-blue-600 font-mono">{settings.rotation} deg</span>
                      </Label>
                      <Slider
                        value={[settings.rotation]}
                        onValueChange={([value]) => setSettings((prev) => ({ ...prev, rotation: value }))}
                        min={0}
                        max={360}
                        step={15}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex justify-between">
                        <span>Playback Speed</span>
                        <span className="text-blue-600 font-mono">{settings.speed.toFixed(2)}x</span>
                      </Label>
                      <Slider
                        value={[settings.speed]}
                        onValueChange={([value]) => setSettings((prev) => ({ ...prev, speed: value }))}
                        min={0.25}
                        max={4}
                        step={0.25}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={settings.flipHorizontal}
                          onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, flipHorizontal: checked }))}
                        />
                        <Label>Flip Horizontal</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={settings.flipVertical}
                          onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, flipVertical: checked }))}
                        />
                        <Label>Flip Vertical</Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Audio Tab */}
            <TabsContent value="audio">
              <Card>
                <CardHeader>
                  <CardTitle>Audio Settings</CardTitle>
                  <CardDescription>Adjust volume and audio effects</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="flex justify-between">
                        <span>Volume</span>
                        <span className="text-blue-600 font-mono">{Math.round(settings.volume * 100)}%</span>
                      </Label>
                      <Slider
                        value={[settings.volume]}
                        onValueChange={([value]) => setSettings((prev) => ({ ...prev, volume: value }))}
                        min={0}
                        max={2}
                        step={0.1}
                      />
                    </div>

                    {settings.volume > 1 && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800 flex items-center gap-2">
                          <Volume2 className="w-4 h-4" />
                          Volume boost active ({Math.round(settings.volume * 100)}%)
                        </p>
                      </div>
                    )}

                    {isAudioReady && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800 flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          Enhanced audio processing enabled
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Export Tab */}
            <TabsContent value="export">
              <Card>
                <CardHeader>
                  <CardTitle>Export Settings</CardTitle>
                  <CardDescription>Choose format and quality for your final video</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Output Format</Label>
                      <Select value={format} onValueChange={setFormat}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mp4">MP4 (Recommended)</SelectItem>
                          <SelectItem value="webm">WebM (Smaller)</SelectItem>
                          <SelectItem value="avi">AVI (High Quality)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Quality</Label>
                      <Select value={quality} onValueChange={setQuality}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High Quality</SelectItem>
                          <SelectItem value="medium">Medium Quality</SelectItem>
                          <SelectItem value="low">Smaller File</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={processVideo}
                      disabled={isProcessing || !ffmpegLoaded}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      size="lg"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing Video...
                        </>
                      ) : !ffmpegLoaded ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Loading Editor...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Process & Export Video
                        </>
                      )}
                    </Button>
                  </div>

                  {outputUrl && (
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="pt-6 space-y-4">
                        <div className="flex items-center gap-2 text-green-700">
                          <Zap className="w-5 h-5" />
                          <h3 className="font-semibold">Video Ready for Download!</h3>
                        </div>

                        <div className="rounded-lg overflow-hidden border border-green-300">
                          <video src={outputUrl} controls className="w-full max-h-64" />
                        </div>

                        <div className="flex gap-2">
                          <Button onClick={downloadVideo} className="flex-1 bg-green-600 hover:bg-green-700">
                            <Download className="w-4 h-4 mr-2" />
                            Download Video
                          </Button>

                          <Button onClick={() => setActiveTab("trim")} variant="outline">
                            Edit Again
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {isProcessing && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                        <div>
                          <p className="font-medium text-blue-900">Processing your video...</p>
                          <p className="text-sm text-blue-600">
                            This may take a few minutes depending on video length and effects
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Features Grid */}
        {!videoUrl && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Wand2 className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Real-time Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">See changes instantly with live preview while you edit</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Advanced Audio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Volume boost up to 200% with enhanced audio processing</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                  <Video className="w-6 h-6 text-pink-600" />
                </div>
                <CardTitle>Multiple Formats</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Export to MP4, WebM, or AVI with quality controls</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default PremiumVideoEditor;
