import { useState, useRef, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Upload, Scissors, Download, Loader2, Play, Pause } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const ffmpegRef = useRef(new FFmpeg());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadFFmpeg();
  }, []);

  const loadFFmpeg = async () => {
    try {
      const ffmpeg = ffmpegRef.current;
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd';

      ffmpeg.on('log', ({ message }) => {
        console.log(message);
      });

      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript'),
      });

      setFfmpegLoaded(true);
      toast.success("Video editor ready!");
    } catch (error) {
      console.error('Failed to load FFmpeg:', error);
      toast.error("Failed to load video editor. Please refresh the page.");
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast.error("Please upload a video file");
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
      setDuration(dur);
      setEndTime(dur);
    }
  };

  const trimVideo = async () => {
    if (!videoFile || !ffmpegLoaded) {
      toast.error("Please upload a video first");
      return;
    }

    if (startTime >= endTime) {
      toast.error("Start time must be less than end time");
      return;
    }

    setIsProcessing(true);

    try {
      const ffmpeg = ffmpegRef.current;
      
      // Write input file
      await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));

      // Calculate trim duration
      const trimDuration = endTime - startTime;

      toast.info("Processing video... This may take a minute");

      // Trim video
      await ffmpeg.exec([
        '-i', 'input.mp4',
        '-ss', startTime.toString(),
        '-t', trimDuration.toString(),
        '-c', 'copy',
        'output.mp4'
      ]);

      // Read output file
      const data = await ffmpeg.readFile('output.mp4');
      const blob = new Blob([data as BlobPart], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      
      setOutputUrl(url);
      toast.success("Video trimmed successfully!");
    } catch (error) {
      console.error('Error trimming video:', error);
      toast.error("Failed to trim video");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadVideo = () => {
    if (!outputUrl) return;
    
    const link = document.createElement('a');
    link.href = outputUrl;
    link.download = `trimmed-video-${Date.now()}.mp4`;
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <SEOHead
        title="Video Trimmer & Cutter"
        description="Cut and trim videos online for free. Client-side processing with no upload required. Supports MP4, MOV, AVI and more."
        keywords="video trimmer, video cutter, cut video, trim video online, video editor, ffmpeg"
        canonical="https://toolmaster.cloud/tools/video-trimmer"
      />
      <ToolLayout
        title="Video Trimmer & Cutter"
        description="Cut and trim videos directly in your browser - no upload required!"
        category="Video & Audio"
        instructions={[
          "Upload a video file (MP4, MOV, AVI, etc.)",
          "Set start and end times using the controls",
          "Click 'Trim Video' to process",
          "Download your trimmed video"
        ]}
        relatedTools={[
          { name: "Image Compressor", path: "/tools/image-compressor" },
          { name: "PDF Compressor", path: "/tools/pdf-compressor" }
        ]}
      >
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
                className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:border-primary transition-smooth"
              >
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">Click to upload video</p>
                <p className="text-sm text-muted-foreground">
                  Supports MP4, MOV, AVI, WebM (Max 500MB)
                </p>
                {!ffmpegLoaded && (
                  <p className="text-xs text-yellow-600 mt-2">Loading video editor...</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden bg-black">
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    className="w-full max-h-96"
                    onLoadedMetadata={handleLoadedMetadata}
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Start Time: {formatTime(startTime)}
                    </label>
                    <Input
                      type="range"
                      min="0"
                      max={duration}
                      step="0.1"
                      value={startTime}
                      onChange={(e) => setStartTime(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      End Time: {formatTime(endTime)}
                    </label>
                    <Input
                      type="range"
                      min="0"
                      max={duration}
                      step="0.1"
                      value={endTime}
                      onChange={(e) => setEndTime(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="text-sm text-muted-foreground text-center">
                  Trim Duration: {formatTime(endTime - startTime)} | Total: {formatTime(duration)}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={trimVideo}
                    disabled={isProcessing || !ffmpegLoaded}
                    className="flex-1"
                    size="lg"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Scissors className="h-4 w-4 mr-2" />
                        Trim Video
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    size="lg"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    New Video
                  </Button>
                </div>

                {outputUrl && (
                  <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200">
                    <h3 className="font-semibold mb-2 text-green-700 dark:text-green-300">
                      Video Trimmed Successfully!
                    </h3>
                    <video src={outputUrl} controls className="w-full rounded mb-2" />
                    <Button onClick={downloadVideo} className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download Trimmed Video
                    </Button>
                  </div>
                )}
              </div>
            )}

            <div className="text-xs text-muted-foreground p-3 bg-muted rounded-lg">
              <strong>Privacy:</strong> All processing happens in your browser. No video data is uploaded to servers.
            </div>
          </CardContent>
        </Card>
      </ToolLayout>
    </>
  );
};

export default VideoTrimmer;
