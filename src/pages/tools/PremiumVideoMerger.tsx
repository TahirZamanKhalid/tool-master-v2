import { useState, useRef, useEffect } from "react";
import { Plus, X, Upload, Download, Sparkles, ArrowUp, ArrowDown, Play, Film, Loader2, Layers } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { AdWatchModal } from "@/components/AdWatchModal";
import { Header } from "@/components/Header";
import { ProcessingOverlay } from "@/components/ProcessingOverlay";

interface VideoItem {
  id: string;
  file: File;
  url: string;
  duration: number;
  name: string;
}

const PremiumVideoMerger = () => {
  const { toast } = useToast();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [outputUrl, setOutputUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [format, setFormat] = useState("mp4");
  const [quality, setQuality] = useState("high");
  const [addTransitions, setAddTransitions] = useState(false);
  const [transition, setTransition] = useState("fade");
  const [transitionDuration, setTransitionDuration] = useState("0.5");
  const [showAdModal, setShowAdModal] = useState(false);

  const ffmpegRef = useRef(new FFmpeg());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadFFmpeg();
  }, []);

  const loadFFmpeg = async () => {
    try {
      const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd';
      const ffmpeg = ffmpegRef.current;

      ffmpeg.on('log', ({ message }) => {
        console.log(message);
      });

      ffmpeg.on('progress', ({ progress }) => {
        setProcessingProgress(Math.round(progress * 100));
      });

      // toBlobURL is used to bypass CORS issue
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });

      setFfmpegLoaded(true);
      console.log('FFmpeg loaded successfully');
      toast({ title: "Video merger ready!" });
    } catch (error) {
      console.error('Failed to load FFmpeg:', error);
      toast({ 
        title: "Failed to load video merger", 
        description: "Please refresh the page and try again.",
        variant: "destructive" 
      });
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validVideos = files.filter(file => file.type.startsWith('video/'));
    if (validVideos.length === 0) {
      toast({ title: "Please upload video files", variant: "destructive" });
      return;
    }

    const newVideos: VideoItem[] = [];

    for (const file of validVideos) {
      const url = URL.createObjectURL(file);
      const video = document.createElement('video');
      video.src = url;

      const duration = await new Promise<number>((resolve) => {
        video.onloadedmetadata = () => {
          resolve(video.duration);
        };
      });

      newVideos.push({
        id: Math.random().toString(36).substring(7),
        file,
        url,
        duration,
        name: file.name,
      });
    }

    setVideos(prev => [...prev, ...newVideos]);
    toast({ title: `${newVideos.length} video(s) added!` });
  };

  const removeVideo = (id: string) => {
    setVideos(prev => {
      const removed = prev.find(v => v.id === id);
      if (removed) URL.revokeObjectURL(removed.url);
      return prev.filter(v => v.id !== id);
    });
  };

  const moveVideo = (id: string, direction: "up" | "down") => {
    setVideos(prev => {
      const index = prev.findIndex(v => v.id === id);
      if (index === -1) return prev;

      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;

      const newVideos = [...prev];
      [newVideos[index], newVideos[newIndex]] = [newVideos[newIndex], newVideos[index]];
      return newVideos;
    });
  };

  const mergeVideos = async () => {
    if (videos.length < 2) {
      toast({ title: "Please add at least 2 videos to merge", variant: "destructive" });
      return;
    }

    if (!ffmpegLoaded) {
      toast({ title: "Video merger is still loading...", variant: "destructive" });
      return;
    }

    setShowAdModal(true);
  };

  const handleAdWatched = async () => {
    setShowAdModal(false);
    setIsProcessing(true);
    setProcessingProgress(0);
    toast({ title: "Merging videos... This may take several minutes" });

    try {
      const ffmpeg = ffmpegRef.current;

      // Write all video files
      for (let i = 0; i < videos.length; i++) {
        await ffmpeg.writeFile(`input${i}.mp4`, await fetchFile(videos[i].file));
      }

      // Create concat file
      const concatContent = videos.map((_, i) => `file 'input${i}.mp4'`).join('\n');
      await ffmpeg.writeFile('concat.txt', new TextEncoder().encode(concatContent));

      const args = ['-f', 'concat', '-safe', '0', '-i', 'concat.txt'];

      // Quality settings
      if (quality === 'high') {
        args.push('-c:v', 'libx264', '-crf', '18');
      } else if (quality === 'medium') {
        args.push('-c:v', 'libx264', '-crf', '23');
      } else {
        args.push('-c:v', 'libx264', '-crf', '28');
      }

      args.push('-c:a', 'aac');
      args.push(`output.${format}`);

      console.log('FFmpeg args:', args);
      await ffmpeg.exec(args);

      const data = await ffmpeg.readFile(`output.${format}`);
      const mimeType = format === 'webm' ? 'video/webm' : 'video/mp4';
      const blob = new Blob([data as BlobPart], { type: mimeType });
      const url = URL.createObjectURL(blob);

      setOutputUrl(url);
      toast({ title: "Videos merged successfully!" });
    } catch (error) {
      console.error('Error merging videos:', error);
      toast({ title: "Failed to merge videos", variant: "destructive" });
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  const downloadVideo = () => {
    if (!outputUrl) return;

    const link = document.createElement('a');
    link.href = outputUrl;
    link.download = `merged-video-${Date.now()}.${format}`;
    link.click();
    toast({ title: "Downloading merged video..." });
  };

  const getTotalDuration = () => {
    return videos.reduce((sum, v) => sum + v.duration, 0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-br from-orange-600 to-yellow-600 rounded-xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
              Premium Video Merger
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Combine multiple videos into one with custom ordering, transitions, and quality control
          </p>
          <Badge variant="secondary" className="text-sm">Premium Edition</Badge>
        </div>

        {/* Upload Section */}
        <Card className="shadow-2xl border-2 border-orange-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Add Videos to Merge
            </CardTitle>
            <CardDescription>Upload multiple videos to combine them</CardDescription>
          </CardHeader>
          <CardContent>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              multiple
              onChange={handleVideoUpload}
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-orange-300 rounded-lg p-8 text-center cursor-pointer hover:bg-orange-50 transition-colors"
            >
              <Layers className="w-10 h-10 mx-auto mb-3 text-orange-600" />
              <p className="text-lg font-medium mb-2">Click to add videos</p>
              <p className="text-sm text-muted-foreground">You can select multiple videos at once</p>
              {!ffmpegLoaded && (
                <p className="text-xs text-yellow-600 mt-2">Loading merger...</p>
              )}
            </div>

            {videos.length > 0 && (
              <div className="mt-4 flex items-center justify-between">
                <Badge variant="secondary">
                  {videos.length} video(s) | Total: {formatTime(getTotalDuration())}
                </Badge>
                <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add More
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Video List */}
        {videos.length > 0 && (
          <Card className="shadow-xl border-2 border-orange-100">
            <CardHeader>
              <CardTitle>Video Sequence ({videos.length} videos)</CardTitle>
              <CardDescription>Drag to reorder or use arrow buttons</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {videos.map((video, index) => (
                  <Card key={video.id} className="border-2">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          <Badge className="w-10 h-10 flex items-center justify-center text-lg">
                            {index + 1}
                          </Badge>
                        </div>

                        <div className="flex-1 min-w-0">
                          <video src={video.url} className="w-full max-h-32 rounded" />
                          <p className="text-sm font-medium mt-2 truncate">{video.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Duration: {formatTime(video.duration)}
                          </p>
                        </div>

                        <div className="flex flex-col gap-1">
                          <Button
                            onClick={() => moveVideo(video.id, "up")}
                            disabled={index === 0}
                            variant="outline"
                            size="icon"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => moveVideo(video.id, "down")}
                            disabled={index === videos.length - 1}
                            variant="outline"
                            size="icon"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => removeVideo(video.id)}
                            variant="destructive"
                            size="icon"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Merge Settings */}
        {videos.length >= 2 && (
          <Card className="shadow-xl border-2 border-orange-100">
            <CardHeader>
              <CardTitle>Merge Settings</CardTitle>
              <CardDescription>Configure output quality and format</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Label>Output Quality</Label>
                  <Select value={quality} onValueChange={setQuality}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High (Best quality, larger file)</SelectItem>
                      <SelectItem value="medium">Medium (Balanced)</SelectItem>
                      <SelectItem value="low">Low (Smaller file)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Videos</p>
                    <p className="text-2xl font-bold text-orange-600">{videos.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Duration</p>
                    <p className="text-2xl font-bold text-orange-600">{formatTime(getTotalDuration())}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Format</p>
                    <p className="text-2xl font-bold text-orange-600">{format.toUpperCase()}</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={mergeVideos}
                disabled={isProcessing || !ffmpegLoaded || videos.length < 2}
                className="w-full bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Merging... {processingProgress}%
                  </>
                ) : !ffmpegLoaded ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading merger...
                  </>
                ) : (
                  <>
                    <Film className="w-4 h-4 mr-2" />
                    Merge {videos.length} Videos
                  </>
                )}
              </Button>

              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Merging progress</span>
                    <span className="font-medium">{processingProgress}%</span>
                  </div>
                  <Progress value={processingProgress} className="h-3" />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Output Preview */}
        {outputUrl && (
          <Card className="shadow-xl border-2 border-green-100 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-700">Videos Merged Successfully!</CardTitle>
              <CardDescription>Preview and download your merged video</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <video src={outputUrl} controls className="w-full rounded" />
              <Button onClick={downloadVideo} className="w-full" size="lg">
                <Download className="w-4 h-4 mr-2" />
                Download Merged Video
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Layers className="w-5 h-5 text-orange-600" />
                Unlimited Videos
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Combine as many videos as you need into a single file
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Film className="w-5 h-5 text-yellow-600" />
                Custom Order
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Easily reorder videos with arrow buttons or drag-and-drop
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                Quality Control
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Choose output format and quality for perfect results
            </CardContent>
          </Card>
        </div>
      </div>
      </div>

      {isProcessing && (
        <ProcessingOverlay
          message="Merging your videos..."
          progress={processingProgress}
          showSkip={false}
        />
      )}

      <AdWatchModal
        open={showAdModal}
        onOpenChange={setShowAdModal}
        onAdWatched={handleAdWatched}
        title="Watch Ad to Merge Videos"
        description="Watch this short ad to start merging your videos"
      />
    </>
  );
};

export default PremiumVideoMerger;
