import { useState, useEffect, useRef } from "react";
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
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

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
  const [isConverting, setIsConverting] = useState(false);
  const ffmpegRef = useRef(new FFmpeg());
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);

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

  useEffect(() => {
    const loadFFmpeg = async () => {
      const ffmpeg = ffmpegRef.current;
      try {
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
        setFfmpegLoaded(true);
        console.log('FFmpeg loaded successfully');
      } catch (error) {
        console.error('Error loading FFmpeg:', error);
        toast.error('Audio converter failed to load. MP3 download may not work.');
      }
    };
    loadFFmpeg();
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

    // Generate audio using MediaRecorder
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = voices.find(v => v.name === selectedVoice);
      
      if (voice) utterance.voice = voice;
      utterance.rate = rate[0];
      utterance.pitch = pitch[0];

      // Create audio context and destination
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const dest = audioContext.createMediaStreamDestination();
      
      // Create oscillator to generate a silent tone (keeps the stream active)
      const oscillator = audioContext.createOscillator();
      oscillator.frequency.value = 0;
      oscillator.connect(dest);
      oscillator.start();

      let mediaRecorder: MediaRecorder;
      const chunks: BlobPart[] = [];
      
      try {
        mediaRecorder = new MediaRecorder(dest.stream, { 
          mimeType: 'audio/webm;codecs=opus' 
        });
      } catch {
        toast.error("Your browser doesn't support audio recording.");
        setShowAdOverlay(false);
        audioContext.close();
        return;
      }

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      
      mediaRecorder.onstop = async () => {
        oscillator.stop();
        await audioContext.close();
        
        if (chunks.length > 0) {
          const webmBlob = new Blob(chunks, { type: 'audio/webm' });
          setAudioBlob(webmBlob);
          toast.success("Audio captured! Converting to your selected format...");
        } else {
          toast.error("No audio captured.");
          setShowAdOverlay(false);
        }
      };

      mediaRecorder.start();
      
      utterance.onend = () => {
        setTimeout(() => {
          mediaRecorder.stop();
        }, 500);
      };

      utterance.onerror = () => {
        mediaRecorder.stop();
        toast.error("Speech synthesis failed");
        setShowAdOverlay(false);
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

  const downloadAudio = async () => {
    if (!audioBlob) {
      toast.error("No audio available");
      return;
    }

    setIsConverting(true);

    try {
      if (downloadFormat === 'mp3' || downloadFormat === 'wav') {
        if (!ffmpegLoaded) {
          toast.error("Audio converter not ready. Try OGG format or wait a moment.");
          setIsConverting(false);
          return;
        }

        // Convert using FFmpeg
        const ffmpeg = ffmpegRef.current;
        
        // Write input file
        await ffmpeg.writeFile('input.webm', await fetchFile(audioBlob));
        
        // Convert to desired format
        if (downloadFormat === 'mp3') {
          await ffmpeg.exec(['-i', 'input.webm', '-codec:a', 'libmp3lame', '-b:a', '192k', 'output.mp3']);
        } else {
          await ffmpeg.exec(['-i', 'input.webm', '-acodec', 'pcm_s16le', '-ar', '44100', 'output.wav']);
        }
        
        // Read output file
        const data = await ffmpeg.readFile(`output.${downloadFormat}`) as Uint8Array;
        const blob = new Blob([new Uint8Array(data)], { type: `audio/${downloadFormat}` });
        
        // Download
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `text-to-speech.${downloadFormat}`;
        link.click();
        URL.revokeObjectURL(url);
        
        toast.success(`Audio downloaded as ${downloadFormat.toUpperCase()}!`);
      } else {
        // Direct OGG download
        const url = URL.createObjectURL(audioBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `text-to-speech.ogg`;
        link.click();
        URL.revokeObjectURL(url);
        
        toast.success("Audio downloaded as OGG!");
      }
    } catch (error) {
      console.error("Conversion error:", error);
      toast.error("Failed to convert audio. Try OGG format.");
    } finally {
      setIsConverting(false);
      setShowAdOverlay(false);
    }
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
            <strong>100% Free MP3 Download:</strong> This tool converts browser speech to MP3/WAV/OGG using FFmpeg - no API needed! 
            For <strong>voice cloning</strong> (record your voice for custom TTS), you'll need ElevenLabs API.
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
                    <SelectItem value="mp3">MP3 - Universal format</SelectItem>
                    <SelectItem value="wav">WAV - Uncompressed quality</SelectItem>
                    <SelectItem value="ogg">OGG - Smallest file size</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={generateAudioForDownload}
                disabled={!text.trim() || !ffmpegLoaded}
                variant="secondary"
                size="lg"
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                {ffmpegLoaded ? 'Download Audio (Watch Ad)' : 'Loading converter...'}
              </Button>
            </div>

            <div className="text-xs text-muted-foreground p-3 bg-muted rounded-lg space-y-1">
              <p><strong>✅ Free MP3/WAV/OGG Downloads:</strong> Powered by FFmpeg in your browser</p>
              <p><strong>🎙️ Voice Cloning:</strong> Record your voice → Custom TTS (requires ElevenLabs API)</p>
              <p className="text-primary">Current: Browser voices only. Want YOUR voice? Get ElevenLabs!</p>
            </div>
          </CardContent>
        </Card>
      </ToolLayout>

      {showAdOverlay && (
        <ProcessingOverlay
          message={isConverting ? `Converting to ${downloadFormat.toUpperCase()}...` : "Generating your audio... Please view the ad to enable download."}
          minAdViewTime={5}
          onAdComplete={handleAdComplete}
          showSkip={canDownload && !isConverting}
          onSkip={canDownload && !isConverting ? downloadAudio : undefined}
        />
      )}
    </>
  );
};

export default TextToSpeech;
