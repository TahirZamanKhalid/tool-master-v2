import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Volume2, Square } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";

const TextToSpeech = () => {
  const [text, setText] = useState("");
  const [voice, setVoice] = useState("default");
  const [rate, setRate] = useState("1");
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = () => {
    if (!text) {
      toast.error("Please enter some text");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = parseFloat(rate);
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      toast.error("Speech synthesis failed");
    };

    window.speechSynthesis.speak(utterance);
    toast.success("Speaking...");
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <>
      <SEOHead
        title="Text to Speech Converter"
        description="Convert text to natural speech with adjustable voice and speed settings"
        keywords="text to speech, TTS, speech synthesis, read aloud"
        canonical="https://toolmaster.cloud/tools/text-to-speech"
      />
      <ToolLayout
        title="Text to Speech"
        description="Convert text to natural-sounding speech"
        category="Text Tools"
        instructions={[
          "Enter or paste your text",
          "Select voice and speed preferences",
          "Click 'Speak' to hear the text",
          "Use 'Stop' to cancel playback"
        ]}
        relatedTools={[
          { name: "Word Counter", path: "/tools/word-counter" },
          { name: "Lorem Ipsum", path: "/tools/lorem-ipsum" }
        ]}
      >
        <Card>
          <CardContent className="p-6 space-y-4">
            <Textarea
              placeholder="Enter text to speak..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[200px]"
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Speed</label>
                <Select value={rate} onValueChange={setRate}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.5">Slow (0.5x)</SelectItem>
                    <SelectItem value="1">Normal (1x)</SelectItem>
                    <SelectItem value="1.5">Fast (1.5x)</SelectItem>
                    <SelectItem value="2">Very Fast (2x)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={speak} disabled={isSpeaking} className="flex-1">
                <Volume2 className="h-4 w-4 mr-2" />
                Speak
              </Button>
              <Button onClick={stop} variant="destructive" disabled={!isSpeaking}>
                <Square className="h-4 w-4 mr-2" />
                Stop
              </Button>
            </div>
          </CardContent>
        </Card>
      </ToolLayout>
    </>
  );
};

export default TextToSpeech;
