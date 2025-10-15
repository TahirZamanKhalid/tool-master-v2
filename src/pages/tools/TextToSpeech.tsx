import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Volume2, Pause, StopCircle, Download, Info } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { ProcessingOverlay } from "@/components/ProcessingOverlay";
import { Alert, AlertDescription } from "@/components/ui/alert";

const TextToSpeech = () => {
  const [text, setText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [rate, setRate] = useState([1]);
  const [pitch, setPitch] = useState([1]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [showAdOverlay, setShowAdOverlay] = useState(false);
  const [canDownload, setCanDownload] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'mp3' | 'wav' | 'ogg'>('mp3');

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0 && !selectedVoice) {
        setSelectedVoice(availableVoices[0].name);
      }
    };

    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      speechSynthesis.cancel();
    };
  }, []);

  const speak = () => {
    if (!text.trim()) {
      toast.error("Please enter some text");
      return;
    }

    if (isSpeaking) {
      speechSynthesis.pause();
      setIsSpeaking(false);
      return;
    }

    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = voices.find(v => v.name === selectedVoice);
    
    if (voice) utterance.voice = voice;
    utterance.rate = rate[0];
    utterance.pitch = pitch[0];

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      toast.error("Speech synthesis failed");
    };

    speechSynthesis.speak(utterance);
  };

  const stop = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const generateAudioForDownload = async () => {
    if (!text.trim()) {
      toast.error("Please enter some text");
      return;
    }

    toast.info("Note: Browser TTS has limitations. For voice cloning, you'll need ElevenLabs API key (free tier available)");
    
    // Show ad overlay first
    setShowAdOverlay(true);
    setCanDownload(false);

    // Generate audio using Web Audio API
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = voices.find(v => v.name === selectedVoice);
      
      if (voice) utterance.voice = voice;
      utterance.rate = rate[0];
      utterance.pitch = pitch[0];

      // Create a simple audio buffer
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const dest = audioContext.createMediaStreamDestination();
      
      // Try to capture system audio (limited browser support)
      let mediaRecorder: MediaRecorder;
      const chunks: BlobPart[] = [];
      
      try {
        // Attempt to capture audio stream
        mediaRecorder = new MediaRecorder(dest.stream, { 
          mimeType: 'audio/webm;codecs=opus' 
        });
      } catch {
        toast.warning("Audio capture limited in this browser. Download may not work perfectly.");
        setShowAdOverlay(false);
        return;
      }

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      
      mediaRecorder.onstop = async () => {
        if (chunks.length > 0) {
          const webmBlob = new Blob(chunks, { type: 'audio/webm' });
          setAudioBlob(webmBlob);
        } else {
          toast.error("No audio captured. Browser TTS limitations - consider using ElevenLabs for reliable downloads.");
          setShowAdOverlay(false);
        }
      };

      mediaRecorder.start();
      
      utterance.onend = () => {
        setTimeout(() => {
          mediaRecorder.stop();
          audioContext.close();
        }, 500);
      };

      utterance.onerror = () => {
        mediaRecorder.stop();
        audioContext.close();
        toast.error("Speech failed");
        setShowAdOverlay(false);
      };

      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("Audio generation error:", error);
      toast.error("Browser TTS has limitations. For reliable audio downloads with voice cloning, use ElevenLabs API.");
      setShowAdOverlay(false);
    }
  };

  const handleAdComplete = () => {
    setCanDownload(true);
    toast.success("You can now download your audio!");
  };

  const downloadAudio = async () => {
    if (!audioBlob) {
      toast.error("No audio available");
      return;
    }

    // For now, we can only download as WebM (browser limitation)
    // For MP3/WAV conversion, we'd need a backend service or library
    const url = URL.createObjectURL(audioBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `text-to-speech.webm`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success("Audio downloaded as WebM! For MP3/WAV and voice cloning, use ElevenLabs API.");
    setShowAdOverlay(false);
  };

  return (
    <>
      <SEOHead
        title="Free Text to Speech - Natural Voice Generator"
        description="Convert text to speech for free using browser's built-in voices. Adjust speed, pitch, and choose from multiple voices."
        keywords="text to speech, TTS, speech synthesis, voice generator, free TTS"
        canonical="https://toolmaster.cloud/tools/text-to-speech"
      />
      <ToolLayout
        title="Free Text to Speech"
        description="Convert text to natural speech with customizable voices - completely free"
        category="Text Tools"
        instructions={[
          "Enter or paste your text",
          "Select a voice from available options",
          "Adjust speed and pitch to your preference",
          "Click Play to hear your text spoken aloud"
        ]}
        relatedTools={[
          { name: "Morse Code Translator", path: "/tools/morse-code-translator" },
          { name: "Word Counter", path: "/tools/word-counter" }
        ]}
      >
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Browser TTS Limitations:</strong> This free version uses browser voices (limited download support). 
            For <strong>voice cloning</strong> (record your voice 3-10 times for custom TTS), <strong>reliable MP3/WAV downloads</strong>, 
            and <strong>premium voices</strong>, you'll need an <strong>ElevenLabs API key</strong> (free tier: 10,000 chars/month).
          </AlertDescription>
        </Alert>

        <Card>
          <CardContent className="p-6 space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Enter Text</label>
              <Textarea
                placeholder="Enter text to convert to speech..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[200px]"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Select Voice</label>
              <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a voice" />
                </SelectTrigger>
                <SelectContent>
                  {voices.map((v, i) => (
                    <SelectItem key={i} value={v.name}>
                      {v.name} ({v.lang})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Speed: {rate[0].toFixed(1)}</label>
              <Slider
                value={rate}
                onValueChange={setRate}
                min={0.5}
                max={2}
                step={0.1}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Pitch: {pitch[0].toFixed(1)}</label>
              <Slider
                value={pitch}
                onValueChange={setPitch}
                min={0.5}
                max={2}
                step={0.1}
                className="w-full"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={speak} 
                disabled={!text.trim()}
                className="flex-1"
                size="lg"
              >
                {isSpeaking ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Volume2 className="h-4 w-4 mr-2" />
                    Play
                  </>
                )}
              </Button>
              <Button 
                onClick={stop}
                disabled={!isSpeaking}
                variant="outline"
                size="lg"
              >
                <StopCircle className="h-4 w-4 mr-2" />
                Stop
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-2 block">Download Format</label>
                <Select value={downloadFormat} onValueChange={(v) => setDownloadFormat(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mp3">MP3 (requires API)</SelectItem>
                    <SelectItem value="wav">WAV (requires API)</SelectItem>
                    <SelectItem value="ogg">WebM (browser only)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={generateAudioForDownload}
                disabled={!text.trim()}
                variant="secondary"
                size="lg"
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Audio (Watch Ad)
              </Button>
            </div>

            <div className="text-xs text-muted-foreground p-3 bg-muted rounded-lg space-y-1">
              <p><strong>Basic (Free):</strong> Browser voices, WebM downloads only</p>
              <p><strong>Voice Cloning (Requires API):</strong> Record 3-10 samples → Get custom voice → Download as MP3/WAV</p>
              <p className="text-primary">Want voice cloning? Sign up for ElevenLabs free tier!</p>
            </div>
          </CardContent>
        </Card>
      </ToolLayout>

      {showAdOverlay && (
        <ProcessingOverlay
          message="Generating your audio... Please view the ad to enable download."
          minAdViewTime={5}
          onAdComplete={handleAdComplete}
          showSkip={canDownload}
          onSkip={canDownload ? downloadAudio : undefined}
        />
      )}
    </>
  );
};

export default TextToSpeech;
