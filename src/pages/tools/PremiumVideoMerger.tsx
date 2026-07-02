import { useState, useRef, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Plus, X, Upload, Download, Sparkles, ArrowUp, ArrowDown, Film, Loader2, Layers, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { AdWatchModal } from "@/components/AdWatchModal";
import { ProcessingOverlay } from "@/components/ProcessingOverlay";
import { getVideoDownloadName, revokeMediaUrl, validateVideoFile } from "@/utils/videoFiles";

interface VideoItem {
  id: string;
  file: File;
  url: string;
  duration: number;
  name: string;
}

const readVideoDuration = (url: string) =>
  new Promise<number>((resolve) => {
    const video = document.createElement("video");
    const finish = (duration: number) => {
      video.onloadedmetadata = null;
      video.onerror = null;
      resolve(Number.isFinite(duration) && duration > 0 ? duration : 0);
    };

    const timeout = window.setTimeout(() => finish(0), 5000);
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      window.clearTimeout(timeout);
      finish(video.duration);
    };
    video.onerror = () => {
      window.clearTimeout(timeout);
      finish(0);
    };
    video.src = url;
  });

const PremiumVideoMerger = () => {
  const { toast } = useToast();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [outputUrl, setOutputUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [showAdModal, setShowAdModal] = useState(false);

  const ffmpegRef = useRef(new FFmpeg());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videosRef = useRef<VideoItem[]>([]);
  const outputUrlRef = useRef("");

  useEffect(() => {
    loadFFmpeg();
  }, []);

  useEffect(() => {
    videosRef.current = videos;
  }, [videos]);

  useEffect(() => {
    outputUrlRef.current = outputUrl;
  }, [outputUrl]);

  useEffect(() => {
    return () => {
      videosRef.current.forEach((video) => revokeMediaUrl(video.url));
      revokeMediaUrl(outputUrlRef.current);
    };
  }, []);

  const loadFFmpeg = async () => {
    try {
      const ffmpeg = ffmpegRef.current;

      ffmpeg.on('progress', ({ progress }) => {
        setProcessingProgress(Math.round(progress * 100));
      });

      // Load from local public folder to avoid CDN issues
      await ffmpeg.load({
        coreURL: '/ffmpeg/ffmpeg-core.js',
        wasmURL: await toBlobURL('https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm', 'application/wasm'),
      });

      setFfmpegLoaded(true);
      toast({ title: "Video merger ready!" });
    } catch {
      toast({ 
        title: "Failed to load merger", 
        description: "Please refresh the page and try again.",
        variant: "destructive" 
      });
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validVideos = files.filter(file => !validateVideoFile(file));
    if (validVideos.length === 0) {
      toast({ title: "Please upload video files", variant: "destructive" });
      return;
    }

    const newVideos: VideoItem[] = [];

    for (const file of validVideos) {
      const url = URL.createObjectURL(file);
      const duration = await readVideoDuration(url);
      if (duration <= 0) {
        revokeMediaUrl(url);
        continue;
      }

      newVideos.push({
        id: Math.random().toString(36).substring(7),
        file,
        url,
        duration,
        name: file.name,
      });
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
    if (newVideos.length === 0) {
      toast({ title: "Could not read video duration", variant: "destructive" });
      return;
    }

    setVideos(prev => [...prev, ...newVideos]);
    const skippedCount = files.length - newVideos.length;
    toast({
      title: `${newVideos.length} video(s) added!`,
      description: skippedCount > 0 ? `${skippedCount} file(s) were skipped.` : undefined,
    });
  };

  const removeVideo = (id: string) => {
    setVideos(prev => {
      const removed = prev.find(v => v.id === id);
      if (removed) revokeMediaUrl(removed.url);
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
    toast({ title: "Merging videos... This may take a moment" });

    try {
      const ffmpeg = ffmpegRef.current;

      // Write all video files to FFmpeg filesystem
      for (let i = 0; i < videos.length; i++) {
        await ffmpeg.writeFile(`input${i}.mp4`, await fetchFile(videos[i].file));
      }

      // Create concat demuxer file list
      const concatContent = videos.map((_, i) => `file 'input${i}.mp4'`).join('\n');
      await ffmpeg.writeFile('concat.txt', new TextEncoder().encode(concatContent));

      // Use concat demuxer with copy codec (no re-encoding!)
      // This is fast and maintains quality when codecs match
      await ffmpeg.exec([
        '-f', 'concat',
        '-safe', '0',
        '-i', 'concat.txt',
        '-c', 'copy', // Copy streams without re-encoding
        '-y',
        'output.mp4'
      ]);

      const data = await ffmpeg.readFile('output.mp4');
      const blob = new Blob([data as BlobPart], { type: 'video/mp4' });
      revokeMediaUrl(outputUrl);
      const url = URL.createObjectURL(blob);

      setOutputUrl(url);
      toast({ title: "Videos merged successfully!" });
    } catch {
      toast({ 
        title: "Failed to merge videos", 
        description: "Please ensure all videos are valid MP4 files",
        variant: "destructive" 
      });
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  const downloadVideo = () => {
    if (!outputUrl) return;

    const link = document.createElement('a');
    link.href = outputUrl;
    link.download = getVideoDownloadName("merged", videos[0]?.file, "mp4");
    link.click();
    toast({ title: "Downloading merged video..." });
  };

  const getTotalDuration = () => {
    return videos.reduce((sum, v) => sum + v.duration, 0);
  };

  const formatTime = (seconds: number) => {
    const safeSeconds = Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
    const mins = Math.floor(safeSeconds / 60);
    const secs = Math.floor(safeSeconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <ToolLayout title="Video Merger" description="Merge multiple videos into one file with custom order and transitions." category="Video Tools">
      <div className="space-y-8">
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
              <p className="text-sm text-muted-foreground">Upload multiple videos to combine them</p>
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
              <CardDescription>Use arrow buttons to reorder videos</CardDescription>
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
              <CardDescription>Combine videos without re-encoding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertTitle>Fast Merge</AlertTitle>
                <AlertDescription>
                  Videos will be merged using FFmpeg's concat demuxer without re-encoding. This preserves quality and is much faster.
                </AlertDescription>
              </Alert>

              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Videos</p>
                    <p className="text-2xl font-bold text-orange-600">{videos.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Duration</p>
                    <p className="text-2xl font-bold text-orange-600">{formatTime(getTotalDuration())}</p>
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
                No Re-encoding
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Fast merge using FFmpeg's concat demuxer - preserves original quality
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                Custom Order
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Easily reorder videos with arrow buttons before merging
            </CardContent>
          </Card>
        </div>
      </div>
      </ToolLayout>

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
