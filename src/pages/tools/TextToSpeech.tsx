import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Volume2, Pause, StopCircle, Download } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { ProcessingOverlay } from "@/components/ProcessingOverlay";

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

    // Show ad overlay first
    setShowAdOverlay(true);
    setCanDownload(false);

    // Generate audio in background while user watches ad
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = voices.find(v => v.name === selectedVoice);
      
      if (voice) utterance.voice = voice;
      utterance.rate = rate[0];
      utterance.pitch = pitch[0];

      // Create audio context to capture the speech
      const audioContext = new AudioContext();
      const destination = audioContext.createMediaStreamDestination();
      const mediaRecorder = new MediaRecorder(destination.stream);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
      };

      mediaRecorder.start();
      
      utterance.onend = () => {
        setTimeout(() => {
          mediaRecorder.stop();
          audioContext.close();
        }, 500);
      };

      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("Audio generation error:", error);
      toast.error("Failed to generate audio");
      setShowAdOverlay(false);
    }
  };

  const handleAdComplete = () => {
    setCanDownload(true);
    toast.success("You can now download your audio!");
  };

  const downloadAudio = () => {
    if (!audioBlob) {
      toast.error("No audio available");
      return;
    }

    const url = URL.createObjectURL(audioBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "text-to-speech.webm";
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success("Audio downloaded!");
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

            <div className="text-xs text-muted-foreground p-3 bg-muted rounded-lg">
              <strong>100% Free:</strong> This tool uses your browser's built-in speech synthesis.
              No API keys required, works offline, and completely free to use!
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
