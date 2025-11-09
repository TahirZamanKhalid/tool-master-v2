import { useState, useRef, useEffect } from "react";
import { Video, Upload, Download, Scissors, Sparkles, Wand2, Type, Image as ImageIcon, Volume2, Zap, Play, Pause, RotateCw, Sliders, Loader2, X, Plus } from "lucide-react";
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
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

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

  useEffect(() => {
    loadFFmpeg();
  }, []);

  const loadFFmpeg = async () => {
    const ffmpeg = ffmpegRef.current;
    try {
      ffmpeg.on('log', ({ message }) => {
        console.log(message);
      });

      const bases = [
        'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm',
        'https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm'
      ];

      let loaded = false;
      for (const baseURL of bases) {
        try {
          await ffmpeg.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
            workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript'),
          });
          loaded = true;
          break;
        } catch (e) {
          console.warn('FFmpeg load failed from', baseURL, e);
        }
      }

      if (!loaded) throw new Error('All FFmpeg CDNs failed');

      setFfmpegLoaded(true);
      toast({ title: "Video editor loaded successfully!" });
    } catch (error) {
      console.error('Failed to load FFmpeg:', error);
      toast({ title: "Failed to load video editor", description: 'Please refresh and try again.', variant: "destructive" });
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

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      setDuration(dur);
      setTrimEnd(dur);
    }
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

  const addTextOverlay = () => {
    const newOverlay: TextOverlay = {
      id: Math.random().toString(36).substring(7),
      text: "Your Text Here",
      x: 50,
      y: 50,
      fontSize: 48,
      color: "#ffffff",
      fontFamily: "Arial",
      startTime: 0,
      endTime: duration || 5,
    };
    setTextOverlays(prev => [...prev, newOverlay]);
    toast({ title: "Text overlay added!" });
  };

  const removeTextOverlay = (id: string) => {
    setTextOverlays(prev => prev.filter(t => t.id !== id));
  };

  const updateTextOverlay = (id: string, updates: Partial<TextOverlay>) => {
    setTextOverlays(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const buildFilterString = () => {
    const filters: string[] = [];

    // Color adjustments
    if (settings.brightness !== 1 || settings.contrast !== 1 || settings.saturation !== 1) {
      filters.push(`eq=brightness=${(settings.brightness - 1) * 0.5}:contrast=${settings.contrast}:saturation=${settings.saturation}`);
    }

    // Hue
    if (settings.hue !== 0) {
      filters.push(`hue=h=${settings.hue}`);
    }

    // Blur
    if (settings.blur > 0) {
      filters.push(`boxblur=${settings.blur}:${settings.blur}`);
    }

    // Sharpen
    if (settings.sharpen > 0) {
      filters.push(`unsharp=5:5:${settings.sharpen}:5:5:0`);
    }

    // Rotation
    if (settings.rotation !== 0) {
      const angle = settings.rotation * (Math.PI / 180);
      filters.push(`rotate=${angle}`);
    }

    // Flip
    if (settings.flipHorizontal) {
      filters.push('hflip');
    }
    if (settings.flipVertical) {
      filters.push('vflip');
    }

    // Speed
    if (settings.speed !== 1) {
      filters.push(`setpts=${1 / settings.speed}*PTS`);
    }

    return filters.length > 0 ? filters.join(',') : null;
  };

  const processVideo = async () => {
    if (!videoFile || !ffmpegLoaded) {
      toast({ title: "Please upload a video first", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    toast({ title: "Processing video... This may take a few minutes" });

    try {
      const ffmpeg = ffmpegRef.current;
      await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));

      const args = ['-i', 'input.mp4'];

      // Video filter
      const filterString = buildFilterString();
      if (filterString) {
        args.push('-vf', filterString);
      }

      // Audio filter (volume)
      if (settings.volume !== 1) {
        args.push('-af', `volume=${settings.volume}`);
      }

      // Trim
      if (trimStart > 0) {
        args.push('-ss', trimStart.toString());
      }
      if (trimEnd < duration) {
        args.push('-t', (trimEnd - trimStart).toString());
      }

      // Quality settings
      if (quality === 'high') {
        args.push('-crf', '18');
      } else if (quality === 'medium') {
        args.push('-crf', '23');
      } else {
        args.push('-crf', '28');
      }

      // Output format
      const outputFile = `output.${format}`;
      args.push(outputFile);

      console.log('FFmpeg args:', args);
      await ffmpeg.exec(args);

      const data = await ffmpeg.readFile(outputFile);
      const mimeType = format === 'webm' ? 'video/webm' : format === 'avi' ? 'video/x-msvideo' : 'video/mp4';
      const blob = new Blob([data as BlobPart], { type: mimeType });
      const url = URL.createObjectURL(blob);

      setOutputUrl(url);
      toast({ title: "Video processed successfully!" });
    } catch (error) {
      console.error('Error processing video:', error);
      toast({ title: "Failed to process video", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadVideo = () => {
    if (!outputUrl) return;

    const link = document.createElement('a');
    link.href = outputUrl;
    link.download = `edited-video-${Date.now()}.${format}`;
    link.click();
    toast({ title: "Downloading video..." });
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
    toast({ title: "Settings reset!" });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
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
            Professional video editing with filters, effects, trimming, speed control, and more - all in your browser
          </p>
          <Badge variant="secondary" className="text-sm">Premium Edition</Badge>
        </div>

        {/* Upload Section */}
        <Card className="shadow-2xl border-2 border-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Video
            </CardTitle>
            <CardDescription>Upload your video to start editing</CardDescription>
          </CardHeader>
          <CardContent>
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
                className="border-2 border-dashed border-blue-300 rounded-lg p-12 text-center cursor-pointer hover:bg-blue-50 transition-colors"
              >
                <Video className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                <p className="text-lg font-medium mb-2">Click to upload video</p>
                <p className="text-sm text-muted-foreground">Supports MP4, MOV, AVI, WebM (Max 500MB)</p>
                {!ffmpegLoaded && (
                  <p className="text-xs text-yellow-600 mt-2">Loading editor...</p>
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
                    onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
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
                      `
                    }}
                  />
                  <div className="absolute bottom-4 left-4 flex gap-2">
                    <Button
                      onClick={togglePlay}
                      variant="secondary"
                      size="icon"
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                  </div>
                  <div className="absolute bottom-4 right-4 bg-black/70 px-3 py-1 rounded text-white text-sm">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                  {activeTab !== 'export' && (
                    <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium">
                      Live Preview
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => fileInputRef.current?.click()}
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

        {/* Editor Tabs */}
        {videoUrl && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="trim">
                <Scissors className="w-4 h-4 mr-2" />
                Trim
              </TabsTrigger>
              <TabsTrigger value="filters">
                <Wand2 className="w-4 h-4 mr-2" />
                Filters
              </TabsTrigger>
              <TabsTrigger value="adjust">
                <Sliders className="w-4 h-4 mr-2" />
                Adjust
              </TabsTrigger>
              <TabsTrigger value="transform">
                <RotateCw className="w-4 h-4 mr-2" />
                Transform
              </TabsTrigger>
              <TabsTrigger value="audio">
                <Volume2 className="w-4 h-4 mr-2" />
                Audio
              </TabsTrigger>
              <TabsTrigger value="export">
                <Download className="w-4 h-4 mr-2" />
                Export
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
                  <div className="space-y-2">
                    <Label>Start Time: {formatTime(trimStart)}</Label>
                    <Slider
                      value={[trimStart]}
                      onValueChange={([value]) => setTrimStart(value)}
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

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium">Duration: {formatTime(trimEnd - trimStart)}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Filters Tab */}
            <TabsContent value="filters">
              <Card>
                <CardHeader>
                  <CardTitle>Visual Filters</CardTitle>
                  <CardDescription>Apply visual effects to your video</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Blur: {settings.blur.toFixed(1)}</Label>
                    <Slider
                      value={[settings.blur]}
                      onValueChange={([value]) => setSettings(prev => ({ ...prev, blur: value }))}
                      min={0}
                      max={10}
                      step={0.5}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Sharpen: {settings.sharpen.toFixed(1)}</Label>
                    <Slider
                      value={[settings.sharpen]}
                      onValueChange={([value]) => setSettings(prev => ({ ...prev, sharpen: value }))}
                      min={0}
                      max={3}
                      step={0.1}
                    />
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
                  <div className="space-y-2">
                    <Label>Brightness: {settings.brightness.toFixed(2)}</Label>
                    <Slider
                      value={[settings.brightness]}
                      onValueChange={([value]) => setSettings(prev => ({ ...prev, brightness: value }))}
                      min={0.5}
                      max={1.5}
                      step={0.01}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Contrast: {settings.contrast.toFixed(2)}</Label>
                    <Slider
                      value={[settings.contrast]}
                      onValueChange={([value]) => setSettings(prev => ({ ...prev, contrast: value }))}
                      min={0.5}
                      max={2}
                      step={0.01}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Saturation: {settings.saturation.toFixed(2)}</Label>
                    <Slider
                      value={[settings.saturation]}
                      onValueChange={([value]) => setSettings(prev => ({ ...prev, saturation: value }))}
                      min={0}
                      max={2}
                      step={0.01}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Hue: {settings.hue}°</Label>
                    <Slider
                      value={[settings.hue]}
                      onValueChange={([value]) => setSettings(prev => ({ ...prev, hue: value }))}
                      min={-180}
                      max={180}
                      step={1}
                    />
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
                  <div className="space-y-2">
                    <Label>Rotation: {settings.rotation}°</Label>
                    <Slider
                      value={[settings.rotation]}
                      onValueChange={([value]) => setSettings(prev => ({ ...prev, rotation: value }))}
                      min={0}
                      max={360}
                      step={15}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Playback Speed: {settings.speed.toFixed(2)}x</Label>
                    <Slider
                      value={[settings.speed]}
                      onValueChange={([value]) => setSettings(prev => ({ ...prev, speed: value }))}
                      min={0.25}
                      max={4}
                      step={0.25}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={settings.flipHorizontal}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, flipHorizontal: checked }))}
                    />
                    <Label>Flip Horizontal</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={settings.flipVertical}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, flipVertical: checked }))}
                    />
                    <Label>Flip Vertical</Label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Audio Tab */}
            <TabsContent value="audio">
              <Card>
                <CardHeader>
                  <CardTitle>Audio Settings</CardTitle>
                  <CardDescription>Adjust audio volume and effects</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Volume: {Math.round(settings.volume * 100)}%</Label>
                    <Slider
                      value={[settings.volume]}
                      onValueChange={([value]) => setSettings(prev => ({ ...prev, volume: value }))}
                      min={0}
                      max={2}
                      step={0.1}
                    />
                  </div>

                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      Tip: Values above 100% may cause audio distortion
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Export Tab */}
            <TabsContent value="export">
              <Card>
                <CardHeader>
                  <CardTitle>Export Settings</CardTitle>
                  <CardDescription>Choose format and quality for your video</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Output Format</Label>
                    <Select value={format} onValueChange={setFormat}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mp4">MP4 (Recommended)</SelectItem>
                        <SelectItem value="webm">WebM</SelectItem>
                        <SelectItem value="avi">AVI</SelectItem>
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
                        <SelectItem value="high">High (Larger file)</SelectItem>
                        <SelectItem value="medium">Medium (Balanced)</SelectItem>
                        <SelectItem value="low">Low (Smaller file)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={processVideo}
                      disabled={isProcessing}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
                      size="lg"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : !ffmpegLoaded ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Loading Editor...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Process Video
                        </>
                      )}
                    </Button>

                    <Button onClick={resetSettings} variant="outline" size="lg">
                      <RotateCw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                  </div>

                  {outputUrl && (
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="pt-6 space-y-4">
                        <h3 className="font-semibold text-green-700">Video Processed Successfully!</h3>
                        <video src={outputUrl} controls className="w-full rounded" />
                        <Button onClick={downloadVideo} className="w-full">
                          <Download className="w-4 h-4 mr-2" />
                          Download Edited Video
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-blue-600" />
                Professional Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Apply blur, sharpen, color adjustments, and more with precision controls
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-600" />
                Fast Processing
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              All processing happens in your browser - no upload, 100% private
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Video className="w-5 h-5 text-pink-600" />
                Multiple Formats
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Export to MP4, WebM, or AVI with customizable quality settings
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PremiumVideoEditor;
