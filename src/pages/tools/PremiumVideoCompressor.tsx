import { useState, useRef, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Minimize2, Upload, Download, Sparkles, Zap, Settings, BarChart3, Play, Pause, Loader2, FileVideo } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { deleteFFmpegFiles, loadFFmpegCore } from "@/utils/ffmpeg";
import {
  formatFileSize,
  getVideoDownloadName,
  getVideoMimeType,
  revokeMediaUrl,
  validateVideoFile,
} from "@/utils/videoFiles";

type CompressionPreset = "ultrafast" | "superfast" | "veryfast" | "faster" | "fast" | "medium" | "slow" | "slower" | "veryslow";
type Resolution = "keep" | "4k" | "1080p" | "720p" | "480p" | "360p";

const PremiumVideoCompressor = () => {
  const { toast } = useToast();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [outputUrl, setOutputUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("quick");

  // Compression settings
  const [compressionMode, setCompressionMode] = useState<"quality" | "custom">("quality");
  const [qualityLevel, setQualityLevel] = useState(23); // CRF value
  const [preset, setPreset] = useState<CompressionPreset>("medium");
  const [resolution, setResolution] = useState<Resolution>("keep");
  const [format, setFormat] = useState("mp4");
  const [lastOutputFormat, setLastOutputFormat] = useState("mp4");
  const [codec, setCodec] = useState("h264");
  const [fps, setFps] = useState("keep");
  const [bitrate, setBitrate] = useState("2000");
  const [audioBitrate, setAudioBitrate] = useState("128");
  const [twoPass, setTwoPass] = useState(false);
  const [removeAudio, setRemoveAudio] = useState(false);

  const ffmpegRef = useRef(new FFmpeg());
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadFFmpeg();
  }, []);

  useEffect(() => {
    return () => {
      revokeMediaUrl(videoUrl);
      revokeMediaUrl(outputUrl);
    };
  }, [videoUrl, outputUrl]);

  const loadFFmpeg = async () => {
    try {
      const ffmpeg = ffmpegRef.current;

      ffmpeg.on('progress', ({ progress }) => {
        setProcessingProgress(Math.round(progress * 100));
      });

      await loadFFmpegCore(ffmpeg);

      setFfmpegLoaded(true);
      toast({ title: "Video compressor loaded!" });
    } catch {
      toast({ title: "Failed to load compressor", variant: "destructive" });
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateVideoFile(file);
    if (validationError) {
      toast({ title: validationError, variant: "destructive" });
      return;
    }

    revokeMediaUrl(videoUrl);
    revokeMediaUrl(outputUrl);
    setVideoFile(file);
    setOriginalSize(file.size);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setOutputUrl("");
    setCompressedSize(0);
    setActiveTab("quick");
    toast({ title: "Video loaded successfully!" });
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

  const getResolutionFilter = () => {
    const resolutionMap = {
      "4k": "scale=3840:2160",
      "1080p": "scale=1920:1080",
      "720p": "scale=1280:720",
      "480p": "scale=854:480",
      "360p": "scale=640:360",
    };
    return resolution !== "keep" ? resolutionMap[resolution] : null;
  };

  const compressVideo = async () => {
    if (!videoFile || !ffmpegLoaded) {
      toast({ title: "Please upload a video first", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);
    toast({ title: "Compressing video... This may take several minutes" });

    try {
      const ffmpeg = ffmpegRef.current;
      await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));

      const outputFormat = codec === "vp9" || format === "webm" ? "webm" : format;
      const args = ['-i', 'input.mp4'];

      // Video codec
      args.push('-c:v', outputFormat === 'webm' ? 'libvpx-vp9' : codec === 'h265' ? 'libx265' : 'libx264');

      // Preset (encoding speed)
      args.push('-preset', preset);

      // Quality/Compression
      if (compressionMode === "quality") {
        args.push('-crf', qualityLevel.toString());
      } else {
        args.push('-b:v', `${bitrate}k`);
      }

      // Resolution
      const resFilter = getResolutionFilter();
      if (resFilter) {
        args.push('-vf', resFilter);
      }

      // FPS
      if (fps !== "keep") {
        args.push('-r', fps);
      }

      // Audio settings
      if (removeAudio) {
        args.push('-an');
      } else {
        args.push('-c:a', outputFormat === 'webm' ? 'libopus' : 'aac');
        args.push('-b:a', `${audioBitrate}k`);
      }

      // Optimize for web
      if (outputFormat === 'mp4') {
        args.push('-movflags', '+faststart');
      }

      // Output
      const outputFile = `output.${outputFormat}`;
      args.push('-y');
      args.push(outputFile);

      await ffmpeg.exec(args);

      const data = await ffmpeg.readFile(outputFile);
      const mimeType = getVideoMimeType(outputFormat);
      const blob = new Blob([data as BlobPart], { type: mimeType });
      await deleteFFmpegFiles(ffmpeg, ["input.mp4", outputFile]);
      setCompressedSize(blob.size);
      revokeMediaUrl(outputUrl);
      const url = URL.createObjectURL(blob);

      setLastOutputFormat(outputFormat);
      setOutputUrl(url);
      toast({ title: "Video compressed successfully!" });
    } catch {
      toast({ title: "Failed to compress video", variant: "destructive" });
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  const downloadVideo = () => {
    if (!outputUrl) return;

    const link = document.createElement('a');
    link.href = outputUrl;
    link.download = getVideoDownloadName("compressed", videoFile, lastOutputFormat);
    link.click();
    toast({ title: "Downloading compressed video..." });
  };

  const getCompressionRatio = () => {
    if (originalSize === 0 || compressedSize === 0) return 0;
    return Math.round(((originalSize - compressedSize) / originalSize) * 100);
  };

  return (
    <ToolLayout title="AI Video Compressor" description="Compress videos without quality loss using AI technology." category="Video Tools">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-br from-green-600 to-teal-600 rounded-xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
              Premium Video Compressor
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Compress videos with advanced codecs, customizable quality, resolution control, and format conversion
          </p>
          <Badge variant="secondary" className="text-sm">Premium Edition</Badge>
        </div>

        {/* Upload Section */}
        <Card className="shadow-2xl border-2 border-green-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Video
            </CardTitle>
            <CardDescription>Upload your video to compress</CardDescription>
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
                className="border-2 border-dashed border-green-300 rounded-lg p-12 text-center cursor-pointer hover:bg-green-50 transition-colors"
              >
                <FileVideo className="w-12 h-12 mx-auto mb-4 text-green-600" />
                <p className="text-lg font-medium mb-2">Click to upload video</p>
                <p className="text-sm text-muted-foreground">All common video formats supported - up to 500MB</p>
                {!ffmpegLoaded && (
                  <p className="text-xs text-yellow-600 mt-2">Loading compressor...</p>
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
                  <div className="absolute top-4 right-4 bg-black/70 px-3 py-1 rounded text-white text-sm">
                    Original: {formatFileSize(originalSize)}
                  </div>
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

        {/* Compression Settings */}
        {videoUrl && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="quick">
                <Zap className="w-4 h-4 mr-2" />
                Quick Compress
              </TabsTrigger>
              <TabsTrigger value="advanced">
                <Settings className="w-4 h-4 mr-2" />
                Advanced
              </TabsTrigger>
              <TabsTrigger value="stats">
                <BarChart3 className="w-4 h-4 mr-2" />
                Statistics
              </TabsTrigger>
            </TabsList>

            {/* Quick Compress */}
            <TabsContent value="quick">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Compression</CardTitle>
                  <CardDescription>Simple quality-based compression</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Compression Level</Label>
                    <RadioGroup value={qualityLevel.toString()} onValueChange={(v) => setQualityLevel(parseInt(v))}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="18" id="high" />
                        <Label htmlFor="high">High Quality (Less compression, larger file)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="23" id="medium" />
                        <Label htmlFor="medium">Medium Quality (Balanced)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="28" id="low" />
                        <Label htmlFor="low">Low Quality (More compression, smaller file)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="32" id="verylow" />
                        <Label htmlFor="verylow">Very Low Quality (Maximum compression)</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label>Output Format</Label>
                    <Select value={format} onValueChange={setFormat}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mp4">MP4 (Best compatibility)</SelectItem>
                        <SelectItem value="webm">WebM (Better compression)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Resolution</Label>
                    <Select value={resolution} onValueChange={(v) => setResolution(v as Resolution)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="keep">Keep Original</SelectItem>
                        <SelectItem value="4k">4K (3840x2160)</SelectItem>
                        <SelectItem value="1080p">1080p (1920x1080)</SelectItem>
                        <SelectItem value="720p">720p (1280x720)</SelectItem>
                        <SelectItem value="480p">480p (854x480)</SelectItem>
                        <SelectItem value="360p">360p (640x360)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className={`grid gap-3 ${outputUrl && !isProcessing ? "md:grid-cols-2" : ""}`}>
                    <Button
                      onClick={compressVideo}
                      disabled={isProcessing || !ffmpegLoaded}
                      className="w-full bg-gradient-to-r from-green-600 to-teal-600"
                      size="lg"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Compressing... {processingProgress}%
                        </>
                      ) : (
                        <>
                          <Minimize2 className="w-4 h-4 mr-2" />
                          {outputUrl ? "Compress Again" : "Compress Video"}
                        </>
                      )}
                    </Button>

                    {outputUrl && !isProcessing && (
                      <Button onClick={downloadVideo} className="w-full" size="lg">
                        <Download className="w-4 h-4 mr-2" />
                        Download Compressed Video
                      </Button>
                    )}
                  </div>

                  {isProcessing && (
                    <Progress value={processingProgress} className="h-2" />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advanced Settings */}
            <TabsContent value="advanced">
              <Card>
                <CardHeader>
                  <CardTitle>Advanced Compression Settings</CardTitle>
                  <CardDescription>Full control over compression parameters</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Compression Mode</Label>
                    <RadioGroup value={compressionMode} onValueChange={(v) => setCompressionMode(v as "quality" | "custom")}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="quality" id="quality-mode" />
                        <Label htmlFor="quality-mode">Quality-based (CRF)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="custom" id="custom-mode" />
                        <Label htmlFor="custom-mode">Bitrate-based</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {compressionMode === "quality" ? (
                    <div className="space-y-2">
                      <Label>Quality (CRF): {qualityLevel}</Label>
                      <Slider
                        value={[qualityLevel]}
                        onValueChange={([value]) => setQualityLevel(value)}
                        min={0}
                        max={51}
                        step={1}
                      />
                      <p className="text-xs text-muted-foreground">Lower = better quality, larger file</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label>Video Bitrate (kbps)</Label>
                      <Select value={bitrate} onValueChange={setBitrate}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="500">500 kbps (Very Low)</SelectItem>
                          <SelectItem value="1000">1000 kbps (Low)</SelectItem>
                          <SelectItem value="2000">2000 kbps (Medium)</SelectItem>
                          <SelectItem value="4000">4000 kbps (High)</SelectItem>
                          <SelectItem value="8000">8000 kbps (Very High)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Video Codec</Label>
                    <Select value={codec} onValueChange={setCodec}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="h264">H.264 (Best compatibility)</SelectItem>
                        <SelectItem value="h265">H.265 (Better compression)</SelectItem>
                        <SelectItem value="vp9">VP9 (WebM)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Encoding Preset</Label>
                    <Select value={preset} onValueChange={(v) => setPreset(v as CompressionPreset)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ultrafast">Ultra Fast (Lower quality)</SelectItem>
                        <SelectItem value="superfast">Super Fast</SelectItem>
                        <SelectItem value="veryfast">Very Fast</SelectItem>
                        <SelectItem value="faster">Faster</SelectItem>
                        <SelectItem value="fast">Fast</SelectItem>
                        <SelectItem value="medium">Medium (Recommended)</SelectItem>
                        <SelectItem value="slow">Slow (Better quality)</SelectItem>
                        <SelectItem value="slower">Slower</SelectItem>
                        <SelectItem value="veryslow">Very Slow (Best quality)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Frame Rate (FPS)</Label>
                    <Select value={fps} onValueChange={setFps}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="keep">Keep Original</SelectItem>
                        <SelectItem value="24">24 fps</SelectItem>
                        <SelectItem value="30">30 fps</SelectItem>
                        <SelectItem value="60">60 fps</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Audio Bitrate (kbps)</Label>
                    <Select value={audioBitrate} onValueChange={setAudioBitrate}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="64">64 kbps</SelectItem>
                        <SelectItem value="96">96 kbps</SelectItem>
                        <SelectItem value="128">128 kbps (Recommended)</SelectItem>
                        <SelectItem value="192">192 kbps</SelectItem>
                        <SelectItem value="256">256 kbps</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={removeAudio}
                      onCheckedChange={setRemoveAudio}
                    />
                    <Label>Remove Audio (Video only)</Label>
                  </div>

                  <div className={`grid gap-3 ${outputUrl && !isProcessing ? "md:grid-cols-2" : ""}`}>
                    <Button
                      onClick={compressVideo}
                      disabled={isProcessing || !ffmpegLoaded}
                      className="w-full bg-gradient-to-r from-green-600 to-teal-600"
                      size="lg"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Compressing...
                        </>
                      ) : (
                        <>
                          <Minimize2 className="w-4 h-4 mr-2" />
                          {outputUrl ? "Compress Again" : "Compress with Advanced Settings"}
                        </>
                      )}
                    </Button>

                    {outputUrl && !isProcessing && (
                      <Button onClick={downloadVideo} className="w-full" size="lg">
                        <Download className="w-4 h-4 mr-2" />
                        Download Compressed Video
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Statistics */}
            <TabsContent value="stats">
              <Card>
                <CardHeader>
                  <CardTitle>Compression Statistics</CardTitle>
                  <CardDescription>Compare original and compressed versions</CardDescription>
                </CardHeader>
                <CardContent>
                  {compressedSize > 0 ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm text-muted-foreground">Original Size</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-3xl font-bold text-blue-600">
                              {formatFileSize(originalSize)}
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm text-muted-foreground">Compressed Size</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-3xl font-bold text-green-600">
                              {formatFileSize(compressedSize)}
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <Card className="bg-green-50 border-green-200">
                        <CardContent className="pt-6">
                          <div className="text-center space-y-2">
                            <p className="text-sm text-muted-foreground">Space Saved</p>
                            <p className="text-5xl font-bold text-green-600">
                              {getCompressionRatio()}%
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatFileSize(originalSize - compressedSize)} saved
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      {outputUrl && (
                        <div className="space-y-4">
                          <h3 className="font-semibold">Preview Compressed Video</h3>
                          <video src={outputUrl} controls className="w-full rounded" />
                          <Button onClick={downloadVideo} className="w-full" size="lg">
                            <Download className="w-4 h-4 mr-2" />
                            Download Compressed Video
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No compression statistics yet</p>
                      <p className="text-sm">Compress a video to see statistics</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </ToolLayout>
  );
};

export default PremiumVideoCompressor;
