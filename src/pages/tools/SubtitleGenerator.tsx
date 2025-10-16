import { useState, useRef } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, Download, FileVideo, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SEOSchema } from "@/components/SEOSchema";

const SubtitleGenerator = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [subtitles, setSubtitles] = useState("");
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check file size (max 25MB)
      if (selectedFile.size > 25 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 25MB",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
      setSubtitles("");
      setProgress(0);
    }
  };

  const generateSubtitles = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please upload a video or audio file first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(10);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
      });

      setProgress(30);

      const base64Audio = (reader.result as string).split(',')[1];

      setProgress(50);
      
      // Call edge function to transcribe
      const { data, error } = await supabase.functions.invoke('generate-subtitles', {
        body: { 
          audio: base64Audio,
          filename: file.name 
        }
      });

      setProgress(90);

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      // Format as SRT
      const srtContent = formatAsSubtitles(data.text);
      setSubtitles(srtContent);
      setProgress(100);

      toast({
        title: "Success!",
        description: "Subtitles generated successfully",
      });
    } catch (error: any) {
      console.error('Error generating subtitles:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate subtitles. Please try again.",
        variant: "destructive",
      });
      setProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatAsSubtitles = (text: string): string => {
    // Simple SRT format: split text into chunks and add timestamps
    const words = text.split(' ');
    const chunks: string[] = [];
    const wordsPerChunk = 10; // ~10 words per subtitle
    
    for (let i = 0; i < words.length; i += wordsPerChunk) {
      chunks.push(words.slice(i, i + wordsPerChunk).join(' '));
    }

    let srtContent = '';
    const secondsPerChunk = 3; // Each subtitle shows for 3 seconds

    chunks.forEach((chunk, index) => {
      const startTime = index * secondsPerChunk;
      const endTime = (index + 1) * secondsPerChunk;
      
      srtContent += `${index + 1}\n`;
      srtContent += `${formatTime(startTime)} --> ${formatTime(endTime)}\n`;
      srtContent += `${chunk}\n\n`;
    });

    return srtContent;
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
  };

  const downloadSubtitles = () => {
    if (!subtitles) return;

    const blob = new Blob([subtitles], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file ? file.name.replace(/\.[^/.]+$/, '.srt') : 'subtitles.srt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded!",
      description: "Subtitle file saved successfully",
    });
  };

  const instructions = [
    "Generate accurate subtitles for your videos automatically using AI:",
    "",
    "**How to Use:**",
    "1. Upload a video or audio file (MP4, MP3, WAV, etc.)",
    "2. Click 'Generate Subtitles' to start transcription",
    "3. Wait for AI to process your file",
    "4. Download the SRT subtitle file",
    "",
    "**Supported Formats:**",
    "- Video: MP4, MOV, AVI, WebM",
    "- Audio: MP3, WAV, M4A, OGG",
    "- Max file size: 25MB",
    "",
    "**Features:**",
    "- AI-powered speech recognition",
    "- Automatic timestamp generation",
    "- Standard SRT format output",
    "- Free to use with included AI credits",
    "",
    "**Use Cases:**",
    "- YouTube video subtitles",
    "- Social media content",
    "- Educational videos",
    "- Podcasts and interviews",
    "- Accessibility compliance",
    "",
    "**Tips for Best Results:**",
    "- Use clear audio with minimal background noise",
    "- Speak at a normal pace",
    "- For longer videos, consider splitting into segments",
    "- Edit timestamps manually if needed for perfect sync",
  ];

  return (
    <ToolLayout
      title="AI Subtitle Generator"
      description="Generate accurate subtitles for your videos automatically using AI. Free subtitle generation with speech-to-text technology. Create SRT files for YouTube, social media, and accessibility."
      category="Video Tools"
      instructions={instructions}
    >
      <SEOSchema
        type="SoftwareApplication"
        name="AI Subtitle Generator"
        description="Free AI-powered subtitle generator for videos. Automatic speech-to-text transcription with SRT file download."
        url="https://toolmaster.cloud/tools/subtitle-generator"
      />

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileVideo className="h-5 w-5" />
              Upload Video or Audio File
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Select File</Label>
              <div className="flex gap-2">
                <Input
                  id="file-upload"
                  ref={fileInputRef}
                  type="file"
                  accept="video/*,audio/*"
                  onChange={handleFileChange}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Browse
                </Button>
              </div>
              {file && (
                <p className="text-sm text-muted-foreground">
                  Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            <Button
              onClick={generateSubtitles}
              disabled={!file || isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing... {progress}%
                </>
              ) : (
                <>
                  <FileVideo className="h-4 w-4 mr-2" />
                  Generate Subtitles
                </>
              )}
            </Button>

            {isProcessing && (
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {subtitles && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Generated Subtitles (SRT Format)
                </span>
                <Button variant="outline" size="sm" onClick={downloadSubtitles}>
                  <Download className="h-4 w-4 mr-2" />
                  Download SRT
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={subtitles}
                onChange={(e) => setSubtitles(e.target.value)}
                rows={15}
                className="font-mono text-sm"
                placeholder="Generated subtitles will appear here..."
              />
              <p className="text-xs text-muted-foreground mt-2">
                You can edit the subtitles above before downloading
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>How to Use Your Subtitles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <h4 className="font-semibold mb-1">YouTube</h4>
              <p className="text-muted-foreground">
                Upload the SRT file in YouTube Studio under Subtitles section
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Social Media</h4>
              <p className="text-muted-foreground">
                Use with video editors like CapCut, Premiere Pro, or Final Cut to burn subtitles
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Video Players</h4>
              <p className="text-muted-foreground">
                Most video players (VLC, QuickTime) can load external SRT files
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
};

export default SubtitleGenerator;
