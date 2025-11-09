import { useState, useRef, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Upload, Film, Download, Loader2 } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

const VideoToGIF = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [startTime, setStartTime] = useState(0);
  const [duration, setDuration] = useState(3);
  const [fps, setFps] = useState(10);
  const [width, setWidth] = useState(480);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState("");
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const ffmpegRef = useRef(new FFmpeg());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadFFmpeg();
  }, []);

  const loadFFmpeg = async () => {
    try {
      const ffmpeg = ffmpegRef.current;
      const bases = [
        '/ffmpeg',
        'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd',
        'https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd',
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
        } catch (error) {
          console.warn('FFmpeg load failed from', baseURL, error);
        }
      }

      if (!loaded) throw new Error('All FFmpeg sources failed');

      setFfmpegLoaded(true);
      toast.success("GIF converter ready!");
    } catch (error) {
      console.error('Failed to load FFmpeg:', error);
      toast.error("Failed to load converter");
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

  const convertToGIF = async () => {
    if (!videoFile || !ffmpegLoaded) {
      toast.error("Please upload a video first");
      return;
    }

    setIsProcessing(true);

    try {
      const ffmpeg = ffmpegRef.current;
      
      await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));

      toast.info("Converting to GIF... This may take a minute");

      // Convert with optimizations
      await ffmpeg.exec([
        '-i', 'input.mp4',
        '-ss', startTime.toString(),
        '-t', duration.toString(),
        '-vf', `fps=${fps},scale=${width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`,
        '-loop', '0',
        'output.gif'
      ]);

      const data = await ffmpeg.readFile('output.gif');
      const blob = new Blob([data as BlobPart], { type: 'image/gif' });
      const url = URL.createObjectURL(blob);
      
      setOutputUrl(url);
      toast.success("GIF created successfully!");
    } catch (error) {
      console.error('Error converting to GIF:', error);
      toast.error("Failed to create GIF");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadGIF = () => {
    if (!outputUrl) return;
    
    const link = document.createElement('a');
    link.href = outputUrl;
    link.download = `video-${Date.now()}.gif`;
    link.click();
    toast.success("Downloading GIF...");
  };

  return (
    <>
      <SEOHead
        title="Video to GIF Converter"
        description="Convert videos to high-quality animated GIFs online. Free, fast, and no upload required."
        keywords="video to gif, gif maker, convert video to gif, animated gif, gif converter"
        canonical="https://toolmaster.cloud/tools/video-to-gif"
      />
      <ToolLayout
        title="Video to GIF Converter"
        description="Convert any video to a high-quality animated GIF"
        category="Video & Audio"
        instructions={[
          "Upload a video file",
          "Adjust start time, duration, and quality settings",
          "Click 'Convert to GIF'",
          "Download your animated GIF"
        ]}
        relatedTools={[
          { name: "Video Trimmer", path: "/tools/video-trimmer" },
          { name: "Meme Generator", path: "/tools/meme-generator" }
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
                  Supports MP4, MOV, AVI, WebM
                </p>
                {!ffmpegLoaded && (
                  <p className="text-xs text-yellow-600 mt-2">Loading converter...</p>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="rounded-lg overflow-hidden bg-black">
                  <video src={videoUrl} controls className="w-full max-h-96" />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Start Time: {startTime}s
                    </label>
                    <Slider
                      min={0}
                      max={30}
                      step={1}
                      value={[startTime]}
                      onValueChange={([value]) => setStartTime(value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Duration: {duration}s
                    </label>
                    <Slider
                      min={1}
                      max={10}
                      step={1}
                      value={[duration]}
                      onValueChange={([value]) => setDuration(value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      FPS (Quality): {fps}
                    </label>
                    <Slider
                      min={5}
                      max={30}
                      step={5}
                      value={[fps]}
                      onValueChange={([value]) => setFps(value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Width: {width}px
                    </label>
                    <Slider
                      min={320}
                      max={1024}
                      step={32}
                      value={[width]}
                      onValueChange={([value]) => setWidth(value)}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={convertToGIF}
                    disabled={isProcessing || !ffmpegLoaded}
                    className="flex-1"
                    size="lg"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Converting...
                      </>
                    ) : (
                      <>
                        <Film className="h-4 w-4 mr-2" />
                        Convert to GIF
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
                      GIF Created Successfully!
                    </h3>
                    <img src={outputUrl} alt="Generated GIF" className="w-full rounded mb-2" />
                    <Button onClick={downloadGIF} className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download GIF
                    </Button>
                  </div>
                )}
              </div>
            )}

            <div className="text-xs text-muted-foreground p-3 bg-muted rounded-lg">
              <strong>Tips:</strong> Lower FPS and smaller width = smaller file size. 
              Keep duration under 5 seconds for best results.
            </div>
          </CardContent>
        </Card>
      </ToolLayout>
    </>
  );
};

export default VideoToGIF;
