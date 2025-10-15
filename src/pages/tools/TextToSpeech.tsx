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
        console.log('Loading FFmpeg...');
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.15/dist/esm';
        
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
        
        setFfmpegLoaded(true);
        console.log('FFmpeg loaded successfully!');
        toast.success('Audio converter ready!');
      } catch (error) {
        console.error('FFmpeg load error:', error);
        // FFmpeg failed to load, but we can still offer WebM/OGG downloads
        setFfmpegLoaded(false);
        toast.info('MP3/WAV converter unavailable. You can still download as OGG format.');
      }
    };
    
    // Add a small delay before loading
    const timer = setTimeout(() => {
      loadFFmpeg();
    }, 1000);
    
    return () => clearTimeout(timer);
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

    // Show ad overlay first (audio will generate in background)
    setShowAdOverlay(true);
    setCanDownload(false);

    try {
      // 1) Capture TAB audio (requires choosing "This Tab" and checking "Share tab audio")
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      if (!stream.getAudioTracks().length) {
        toast.error("No tab audio detected. In the share dialog, select 'This Tab' and enable 'Share tab audio'.");
        setShowAdOverlay(false);
        stream.getTracks().forEach(t => t.stop());
        return;
      }

      const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';
      const mediaRecorder = new MediaRecorder(stream, { mimeType: mime });
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        // Stop tracks
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start();

      // 2) Speak the text with selected voice (will play through tab audio)
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = voices.find(v => v.name === selectedVoice);
      if (voice) utterance.voice = voice;
      utterance.rate = rate[0];
      utterance.pitch = pitch[0];

      utterance.onend = () => {
        // Small delay to make sure recorder flushes last chunk
        setTimeout(() => mediaRecorder.stop(), 200);
      };
      utterance.onerror = () => {
        try { mediaRecorder.stop(); } catch {}
        toast.error("Speech synthesis failed");
        setShowAdOverlay(false);
      };

      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("Audio capture error:", error);
      toast.error("Please select 'This Tab' and enable 'Share tab audio' in the picker.");
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
      // If MP3/WAV requested but FFmpeg not available, fallback to OGG
      if ((downloadFormat === 'mp3' || downloadFormat === 'wav') && !ffmpegLoaded) {
        toast.warning(`FFmpeg unavailable. Downloading as OGG instead of ${downloadFormat.toUpperCase()}.`);
        
        const url = URL.createObjectURL(audioBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `text-to-speech.ogg`;
        link.click();
        URL.revokeObjectURL(url);
        
        toast.success("Audio downloaded as OGG!");
        setIsConverting(false);
        setShowAdOverlay(false);
        return;
      }

      if (downloadFormat === 'mp3' || downloadFormat === 'wav') {
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
      toast.error("Conversion failed. Downloading as OGG instead.");
      
      // Fallback to direct download
      const url = URL.createObjectURL(audioBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `text-to-speech.ogg`;
      link.click();
      URL.revokeObjectURL(url);
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
                disabled={!text.trim()}
                variant="secondary"
                size="lg"
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                {!ffmpegLoaded ? 'Download Audio (OGG only)' : 'Download Audio (Watch Ad)'}
              </Button>
              
              {!ffmpegLoaded && (
                <p className="text-xs text-muted-foreground text-center">
                  MP3/WAV converter unavailable. Downloads will be in OGG format.
                </p>
              )}
            </div>

            <div className="text-xs text-muted-foreground p-3 bg-muted rounded-lg space-y-1">
              <p><strong>✅ Free MP3/WAV/OGG Downloads:</strong> Powered by FFmpeg in your browser</p>
              <p><strong>🎙️ Voice Cloning:</strong> Record your voice → Custom TTS (requires ElevenLabs API)</p>
              <p>Tip: When prompted, choose <strong>This Tab</strong> and enable <strong>Share tab audio</strong> to capture the voice.</p>
              <p className="text-primary">Current: Browser voices only. Want YOUR voice? Get ElevenLabs!</p>
            </div>
          </CardContent>
        </Card>
      </ToolLayout>

      {showAdOverlay && (
        <ProcessingOverlay
          message={isConverting ? `Converting to ${downloadFormat.toUpperCase()}...` : (audioBlob ? "Ready to download. Please close when the ad finishes." : "Capturing tab audio... Please view the ad to enable download.")}
          minAdViewTime={5}
          onAdComplete={handleAdComplete}
          showSkip={canDownload && !!audioBlob && !isConverting}
          onSkip={canDownload && !!audioBlob && !isConverting ? downloadAudio : undefined}
        />
      )}
    </>
  );
};

export default TextToSpeech;
