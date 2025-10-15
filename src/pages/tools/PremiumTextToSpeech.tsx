import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Volume2, Download, Loader2 } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";

const PremiumTextToSpeech = () => {
  const [text, setText] = useState("");
  const [voice, setVoice] = useState("alloy");
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");

  const voices = [
    { id: "alloy", name: "Alloy (Neutral)" },
    { id: "echo", name: "Echo (Male)" },
    { id: "fable", name: "Fable (British Male)" },
    { id: "onyx", name: "Onyx (Deep Male)" },
    { id: "nova", name: "Nova (Female)" },
    { id: "shimmer", name: "Shimmer (Soft Female)" },
  ];

  const generateSpeech = async () => {
    if (!text.trim()) {
      toast.error("Please enter some text");
      return;
    }

    if (text.length > 4000) {
      toast.error("Text is too long. Maximum 4000 characters.");
      return;
    }

    setIsGenerating(true);
    setAudioUrl("");

    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, voice }
      });

      if (error) throw error;

      if (!data?.audioContent) {
        throw new Error('No audio received');
      }

      // Convert base64 to blob and create URL
      const audioBlob = new Blob(
        [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
        { type: 'audio/mpeg' }
      );
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);

      toast.success("Speech generated successfully!");
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to generate speech");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadAudio = () => {
    if (!audioUrl) return;
    
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `speech-${Date.now()}.mp3`;
    link.click();
    toast.success("Downloading audio...");
  };

  return (
    <>
      <SEOHead
        title="Premium AI Text to Speech"
        description="Convert text to natural-sounding speech with AI voices. High-quality voice synthesis powered by OpenAI."
        keywords="text to speech, AI voice, TTS, speech synthesis, natural voice, audio generation"
        canonical="https://toolmaster.cloud/tools/premium-text-to-speech"
      />
      <ToolLayout
        title="Premium AI Text to Speech"
        description="Convert text to ultra-realistic speech with AI-powered voices"
        category="AI & Content"
        instructions={[
          "Enter or paste your text (max 4000 characters)",
          "Select a voice that fits your needs",
          "Click 'Generate Speech' and wait 5-10 seconds",
          "Listen to preview and download MP3 file"
        ]}
        relatedTools={[
          { name: "AI Chat", path: "/tools/ai-chat" },
          { name: "Caption Generator", path: "/tools/caption-generator" }
        ]}
      >
        <Card>
          <CardContent className="p-6 space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Enter Text</label>
              <Textarea
                placeholder="Enter text to convert to speech... (max 4000 characters)"
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, 4000))}
                className="min-h-[200px]"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {text.length}/4000 characters
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Select Voice</label>
              <Select value={voice} onValueChange={setVoice}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {voices.map(v => (
                    <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={generateSpeech} 
              disabled={isGenerating || !text.trim()}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Speech...
                </>
              ) : (
                <>
                  <Volume2 className="h-4 w-4 mr-2" />
                  Generate Speech
                </>
              )}
            </Button>

            {audioUrl && (
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg border">
                <h3 className="font-semibold">Generated Speech</h3>
                <audio controls className="w-full" src={audioUrl}>
                  Your browser does not support audio playback.
                </audio>
                <Button onClick={downloadAudio} variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download MP3
                </Button>
              </div>
            )}

            <div className="text-xs text-muted-foreground p-3 bg-muted rounded-lg">
              <strong>Note:</strong> This tool uses OpenAI's advanced TTS model for natural-sounding speech.
              Processing typically takes 5-10 seconds depending on text length.
            </div>
          </CardContent>
        </Card>
      </ToolLayout>
    </>
  );
};

export default PremiumTextToSpeech;
