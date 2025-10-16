import { useState, useRef, useEffect } from "react";
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
import { LazyAdSpace } from "@/components/LazyAdSpace";
import { ProcessingOverlay } from "@/components/ProcessingOverlay";

// Generate or retrieve persistent session ID
const getSessionId = (): string => {
  let sessionId = localStorage.getItem('subtitle_session');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('subtitle_session', sessionId);
  }
  return sessionId;
};

const SubtitleGenerator = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [subtitles, setSubtitles] = useState("");
  const [progress, setProgress] = useState(0);
  const [remainingGenerations, setRemainingGenerations] = useState<number | null>(null);
  const [showAdOverlay, setShowAdOverlay] = useState(false);

  useEffect(() => {
    checkRateLimit();
  }, []);

  const checkRateLimit = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const sessionId = getSessionId();

    const { data, error } = await supabase
      .from('subtitle_rate_limits')
      .select('*')
      .or(`user_id.eq.${user?.id || 'null'},session_id.eq.${sessionId}`)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking rate limit:', error);
      return;
    }

    const limit = user ? 10 : 3; // 10 per day for authenticated, 3 for anonymous
    const count = data?.generations_count || 0;
    const hoursSinceLastGen = data ? (Date.now() - new Date(data.last_generation).getTime()) / (1000 * 60 * 60) : 25;
    
    if (hoursSinceLastGen >= 24) {
      setRemainingGenerations(limit);
    } else {
      setRemainingGenerations(Math.max(0, limit - count));
    }
  };

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

    // Check rate limit
    const { data: { user } } = await supabase.auth.getUser();
    const sessionId = getSessionId();
    const limit = user ? 10 : 3;

    const { data: limitData, error: limitError } = await supabase
      .from('subtitle_rate_limits')
      .select('*')
      .or(`user_id.eq.${user?.id || 'null'},session_id.eq.${sessionId}`)
      .single();

    if (!limitError && limitData) {
      const hoursSinceLastGen = (Date.now() - new Date(limitData.last_generation).getTime()) / (1000 * 60 * 60);
      
      if (limitData.generations_count >= limit && hoursSinceLastGen < 24) {
        toast({
          title: "Rate limit exceeded",
          description: `You can generate ${limit} subtitles per day. ${user ? 'Try again tomorrow.' : 'Sign in for more generations or try again tomorrow.'}`,
          variant: "destructive",
        });
        return;
      }

      if (hoursSinceLastGen >= 24) {
        await supabase
          .from('subtitle_rate_limits')
          .update({ generations_count: 0, last_generation: new Date().toISOString() })
          .eq('id', limitData.id);
      }
    }

    setShowAdOverlay(true);
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

      // Update rate limit
      if (limitData) {
        await supabase
          .from('subtitle_rate_limits')
          .update({ 
            generations_count: limitData.generations_count + 1,
            last_generation: new Date().toISOString()
          })
          .eq('id', limitData.id);
      } else {
        await supabase
          .from('subtitle_rate_limits')
          .insert({
            user_id: user?.id || null,
            session_id: user ? null : sessionId,
            generations_count: 1,
            last_generation: new Date().toISOString()
          });
      }

      await checkRateLimit();

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
      setShowAdOverlay(false);
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

      {showAdOverlay && (
        <ProcessingOverlay
          message="Generating subtitles with AI..."
          progress={progress}
          minAdViewTime={5000}
          onAdComplete={() => {}}
        />
      )}

      <div className="grid gap-6">
        <LazyAdSpace size="leaderboard" className="mb-4" />
        
        {remainingGenerations !== null && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <p className="text-sm font-medium">
                {remainingGenerations > 0 
                  ? `✨ ${remainingGenerations} generation${remainingGenerations !== 1 ? 's' : ''} remaining today` 
                  : "⚠️ Daily limit reached. Please try again tomorrow or sign in for more generations."}
              </p>
            </CardContent>
          </Card>
        )}
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

        <LazyAdSpace size="rectangle" className="my-4" />

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
