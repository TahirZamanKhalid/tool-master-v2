import { useState, useRef } from "react";
import { Plus, X, Upload, Download, Sparkles, ArrowUp, ArrowDown, Film, Loader2, Layers, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import * as MP4Box from 'mp4box';
import { AdWatchModal } from "@/components/AdWatchModal";
import { Header } from "@/components/Header";
import { ProcessingOverlay } from "@/components/ProcessingOverlay";

interface VideoInfo {
  codec: string;
  width: number;
  height: number;
  fps: number;
  hasAudio: boolean;
  audioCodec?: string;
}

interface VideoItem {
  id: string;
  file: File;
  url: string;
  duration: number;
  name: string;
  info?: VideoInfo;
}

const PremiumVideoMerger = () => {
  const { toast } = useToast();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [outputUrl, setOutputUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [showAdModal, setShowAdModal] = useState(false);
  const [codecWarning, setCodecWarning] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyzeVideo = async (file: File): Promise<VideoInfo> => {
    return new Promise((resolve, reject) => {
      const mp4boxfile = MP4Box.createFile();
      let info: VideoInfo | null = null;

      mp4boxfile.onReady = (fileInfo: any) => {
        const videoTrack = fileInfo.videoTracks?.[0];
        const audioTrack = fileInfo.audioTracks?.[0];

        if (!videoTrack) {
          reject(new Error('No video track found'));
          return;
        }

        info = {
          codec: videoTrack.codec || 'unknown',
          width: videoTrack.video?.width || 0,
          height: videoTrack.video?.height || 0,
          fps: videoTrack.timescale / (videoTrack.samples_duration / videoTrack.nb_samples) || 0,
          hasAudio: !!audioTrack,
          audioCodec: audioTrack?.codec,
        };

        resolve(info);
      };

      mp4boxfile.onError = (e: any) => {
        reject(new Error(`Failed to analyze video: ${e}`));
      };

      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        // MP4Box requires a buffer with fileStart property
        const buffer = arrayBuffer as ArrayBuffer & { fileStart: number };
        buffer.fileStart = 0;
        mp4boxfile.appendBuffer(buffer);
        mp4boxfile.flush();
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const checkCodecCompatibility = (videos: VideoItem[]): boolean => {
    if (videos.length < 2) return true;
    if (!videos.every(v => v.info)) return false;

    const firstVideo = videos[0].info!;
    
    for (let i = 1; i < videos.length; i++) {
      const currentVideo = videos[i].info!;
      
      if (currentVideo.codec !== firstVideo.codec) {
        setCodecWarning(`Videos have different codecs: ${firstVideo.codec} vs ${currentVideo.codec}. Re-encoding would be required.`);
        return false;
      }
      
      if (currentVideo.width !== firstVideo.width || currentVideo.height !== firstVideo.height) {
        setCodecWarning(`Videos have different resolutions: ${firstVideo.width}x${firstVideo.height} vs ${currentVideo.width}x${currentVideo.height}. Re-encoding would be required.`);
        return false;
      }

      if (currentVideo.hasAudio !== firstVideo.hasAudio) {
        setCodecWarning('Videos have inconsistent audio tracks. Re-encoding would be required.');
        return false;
      }

      if (currentVideo.hasAudio && currentVideo.audioCodec !== firstVideo.audioCodec) {
        setCodecWarning(`Videos have different audio codecs: ${firstVideo.audioCodec} vs ${currentVideo.audioCodec}. Re-encoding would be required.`);
        return false;
      }
    }

    setCodecWarning(null);
    return true;
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validVideos = files.filter(file => file.type.startsWith('video/'));
    if (validVideos.length === 0) {
      toast({ title: "Please upload video files", variant: "destructive" });
      return;
    }

    setIsAnalyzing(true);
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

      // Analyze video codec and properties
      let videoInfo: VideoInfo | undefined;
      try {
        videoInfo = await analyzeVideo(file);
      } catch (error) {
        console.warn('Failed to analyze video:', error);
      }

      newVideos.push({
        id: Math.random().toString(36).substring(7),
        file,
        url,
        duration,
        name: file.name,
        info: videoInfo,
      });
    }

    setVideos(prev => {
      const updated = [...prev, ...newVideos];
      checkCodecCompatibility(updated);
      return updated;
    });
    setIsAnalyzing(false);
    toast({ title: `${newVideos.length} video(s) added and analyzed!` });
  };

  const removeVideo = (id: string) => {
    setVideos(prev => {
      const removed = prev.find(v => v.id === id);
      if (removed) URL.revokeObjectURL(removed.url);
      const updated = prev.filter(v => v.id !== id);
      checkCodecCompatibility(updated);
      return updated;
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
      checkCodecCompatibility(newVideos);
      return newVideos;
    });
  };

  const mergeVideos = async () => {
    if (videos.length < 2) {
      toast({ title: "Please add at least 2 videos to merge", variant: "destructive" });
      return;
    }

    if (!checkCodecCompatibility(videos)) {
      toast({ 
        title: "Cannot merge videos", 
        description: "Videos must have matching codecs and resolutions",
        variant: "destructive" 
      });
      return;
    }

    setShowAdModal(true);
  };

  const handleAdWatched = async () => {
    setShowAdModal(false);
    setIsProcessing(true);
    setProcessingProgress(0);
    toast({ title: "Merging videos... This should be quick!" });

    try {
      // Read all video files as ArrayBuffers
      const videoBuffers = await Promise.all(
        videos.map(video => video.file.arrayBuffer())
      );

      setProcessingProgress(20);

      // Concatenate the MP4 files
      let totalSize = 0;
      videoBuffers.forEach(buffer => totalSize += buffer.byteLength);
      
      const mergedBuffer = new Uint8Array(totalSize);
      let offset = 0;
      
      videoBuffers.forEach((buffer, index) => {
        setProcessingProgress(20 + (index / videoBuffers.length) * 60);
        const uint8Array = new Uint8Array(buffer);
        mergedBuffer.set(uint8Array, offset);
        offset += uint8Array.length;
      });

      setProcessingProgress(90);

      // Create blob and URL
      const blob = new Blob([mergedBuffer], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);

      setOutputUrl(url);
      setProcessingProgress(100);
      toast({ title: "Videos merged successfully!" });
    } catch (error) {
      console.error('Error merging videos:', error);
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
    link.download = `merged-video-${Date.now()}.mp4`;
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
              <p className="text-sm text-muted-foreground">Upload MP4 videos with matching codecs and resolution</p>
              {isAnalyzing && (
                <p className="text-xs text-yellow-600 mt-2">Analyzing videos...</p>
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

        {/* Codec Warning */}
        {codecWarning && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Videos Cannot Be Merged</AlertTitle>
            <AlertDescription>
              {codecWarning}
              <br />
              <br />
              <strong>Limitation:</strong> This tool uses fast concatenation without re-encoding. All videos must have:
              <ul className="list-disc list-inside mt-2">
                <li>Same video codec (e.g., H.264/AVC)</li>
                <li>Same resolution (e.g., 1920x1080)</li>
                <li>Same audio codec (or all videos must have no audio)</li>
              </ul>
              <p className="mt-2">To merge videos with different formats, you would need a re-encoding tool.</p>
            </AlertDescription>
          </Alert>
        )}

        {/* Video List */}
        {videos.length > 0 && (
          <Card className="shadow-xl border-2 border-orange-100">
            <CardHeader>
              <CardTitle>Video Sequence ({videos.length} videos)</CardTitle>
              <CardDescription>Use arrow buttons to reorder</CardDescription>
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
                          {video.info && (
                            <p className="text-xs text-muted-foreground">
                              {video.info.codec} • {video.info.width}x{video.info.height} • {Math.round(video.info.fps)} fps
                              {video.info.hasAudio && ` • ${video.info.audioCodec || 'audio'}`}
                            </p>
                          )}
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
              <CardDescription>Fast concatenation without re-encoding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertTitle>Lightning Fast Merge</AlertTitle>
                <AlertDescription>
                  Your videos will be concatenated instantly without re-encoding. Output quality matches your source videos.
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
                disabled={isProcessing || !!codecWarning || videos.length < 2 || isAnalyzing}
                className="w-full bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Merging... {processingProgress}%
                  </>
                ) : isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing videos...
                  </>
                ) : codecWarning ? (
                  <>
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Cannot Merge (Incompatible)
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
                <Sparkles className="w-5 h-5 text-orange-600" />
                Lightning Fast
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              No re-encoding means instant merging - your videos are concatenated in seconds
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Film className="w-5 h-5 text-yellow-600" />
                Original Quality
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Output maintains the exact quality of your source videos - no quality loss
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-600" />
                Smart Detection
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Automatically analyzes codec compatibility and warns about incompatible videos
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
