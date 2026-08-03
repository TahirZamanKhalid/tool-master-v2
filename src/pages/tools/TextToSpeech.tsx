import { useState, useEffect, useMemo } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Volume2, Pause, StopCircle, Info, RefreshCw, HelpCircle, Languages, Sparkles } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { useSpeechVoices } from "@/hooks/useSpeechVoices";
import { getLanguageLabel, getAccentLabel, getBaseLanguage, getVoicePreviewText, isEnhancedVoice } from "@/utils/speechSynthesis";

const TextToSpeech = () => {
  const [text, setText] = useState("");
  const [selectedVoiceName, setSelectedVoiceName] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [rate, setRate] = useState([1]);
  const [pitch, setPitch] = useState([1]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const { voices, isLoading, isSupported, refreshVoices } = useSpeechVoices();

  // Extract unique languages available among loaded voices
  const availableLanguages = useMemo(() => {
    const langMap = new Map<string, string>();
    voices.forEach((v) => {
      const base = getBaseLanguage(v.lang);
      if (!langMap.has(base)) {
        langMap.set(base, getLanguageLabel(v.lang));
      }
    });
    return Array.from(langMap.entries())
      .map(([code, label]) => ({ code, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [voices]);

  // Filter voices by selected language filter
  const filteredVoices = useMemo(() => {
    if (selectedLanguage === "all") return voices;
    return voices.filter((v) => getBaseLanguage(v.lang) === selectedLanguage);
  }, [voices, selectedLanguage]);

  // Handle voice auto-selection when voices load or language changes
  useEffect(() => {
    if (filteredVoices.length > 0) {
      const currentExists = filteredVoices.some((v) => v.name === selectedVoiceName);
      if (!currentExists) {
        setSelectedVoiceName(filteredVoices[0].name);
      }
    }
  }, [filteredVoices, selectedVoiceName]);

  // Quick insert sample text for selected language
  const handleInsertSampleText = () => {
    const targetLang = selectedLanguage !== "all" ? selectedLanguage : "en";
    const sample = getVoicePreviewText(targetLang);
    setText(sample);
    toast.success(`Inserted sample text (${getLanguageLabel(targetLang)})`);
  };

  const handleManualRescan = () => {
    const loaded = refreshVoices();
    toast.info(`Scanned ${loaded.length} voice(s) from your system/browser`);
  };

  const speak = () => {
    if (!text.trim()) {
      toast.error("Please enter some text");
      return;
    }

    if (!isSupported) {
      toast.error("Text-to-speech is not supported by your browser");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.pause();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    const voiceObj = voices.find((v) => v.name === selectedVoiceName);
    
    if (voiceObj) {
      utterance.voice = voiceObj;
      utterance.lang = voiceObj.lang;
    }
    
    utterance.rate = rate[0];
    utterance.pitch = pitch[0];

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      setIsSpeaking(false);
      console.error("Speech synthesis error:", e);
      toast.error("Speech synthesis failed. Please check voice settings.");
    };

    window.speechSynthesis.speak(utterance);
  };

  const stop = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const currentVoiceObj = useMemo(
    () => voices.find((v) => v.name === selectedVoiceName),
    [voices, selectedVoiceName]
  );

  return (
    <>
      <SEOHead
        title="Free Text to Speech - Natural Voice Generator"
        description="Convert text to speech for free using browser's built-in and system voices. Supports multiple languages including English, Urdu, Hindi, Spanish, and more."
        keywords="text to speech, TTS, speech synthesis, voice generator, free TTS, urdu tts"
        canonical="https://toolmaster.cloud/tools/text-to-speech"
      />
      <ToolLayout
        title="Free Text to Speech Generator"
        description="Convert text to natural spoken audio using system and browser voices - with multi-language support"
        category="Text Tools"
        instructions={[
          "Select a language filter or choose from all detected system voices",
          "Choose your preferred voice (Natural, Neural, or Local)",
          "Enter or paste text (or insert sample text for test)",
          "Adjust speed and pitch to your preference and click Play"
        ]}
        relatedTools={[
          { name: "Morse Code Translator", path: "/tools/morse-code" },
          { name: "Word Counter", path: "/tools/premium-plus-word-counter" }
        ]}
      >
        <Card className="shadow-md border-border/60">
          <CardContent className="p-6 space-y-6">
            {!isSupported && (
              <Alert variant="destructive">
                <Info className="h-4 w-4" />
                <AlertTitle>Speech Synthesis Not Supported</AlertTitle>
                <AlertDescription>
                  Your browser does not support the Web Speech API (`window.speechSynthesis`). Please try Chrome, Edge, or Safari.
                </AlertDescription>
              </Alert>
            )}

            {/* Voice Detection Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-lg bg-muted/40 border border-border/50">
              <div className="flex items-center gap-2">
                <Languages className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-sm font-semibold">
                    Detected System Voices: {voices.length} {isLoading && "(Scanning...)"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Available languages: {availableLanguages.length > 0 ? availableLanguages.map(l => l.label).slice(0, 5).join(", ") + (availableLanguages.length > 5 ? "..." : "") : "None detected yet"}
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualRescan}
                disabled={isLoading}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                Rescan System Voices
              </Button>
            </div>

            {/* Language & Voice Selection Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 flex items-center justify-between">
                  <span>Filter by Language</span>
                  {selectedLanguage !== "all" && (
                    <Badge variant="secondary" className="text-xs">
                      {filteredVoices.length} voice(s)
                    </Badge>
                  )}
                </label>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Languages" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <SelectItem value="all">🌐 All Languages ({voices.length} voices)</SelectItem>
                    {availableLanguages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.label} ({voices.filter(v => getBaseLanguage(v.lang) === lang.code).length})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Select Voice</label>
                <Select value={selectedVoiceName} onValueChange={setSelectedVoiceName}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a voice" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {filteredVoices.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No voices found for this filter
                      </SelectItem>
                    ) : (
                      filteredVoices.map((v, i) => {
                        const langName = getLanguageLabel(v.lang);
                        const accent = getAccentLabel(v.lang);
                        const enhanced = isEnhancedVoice(v);
                        return (
                          <SelectItem key={i} value={v.name}>
                            <div className="flex items-center justify-between gap-2 w-full">
                              <span>
                                {v.name} <span className="text-xs text-muted-foreground">({accent || langName})</span>
                              </span>
                              {enhanced && (
                                <Badge variant="outline" className="text-[10px] px-1 py-0 border-primary/40 text-primary">
                                  Natural
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        );
                      })
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Selected Voice Info Badge */}
            {currentVoiceObj && (
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground bg-accent/30 p-2.5 rounded-md">
                <span className="font-medium text-foreground">Active Voice:</span> {currentVoiceObj.name}
                <span>•</span>
                <span>Language: {getLanguageLabel(currentVoiceObj.lang)} ({currentVoiceObj.lang})</span>
                <span>•</span>
                <span>Source: {currentVoiceObj.localService ? "Local System Voice" : "Browser Network Voice"}</span>
              </div>
            )}

            {/* Text Input Area */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Enter Text to Speak</label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleInsertSampleText}
                  className="text-xs text-primary hover:text-primary/80 h-7 px-2 gap-1"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Insert Sample Text ({selectedLanguage !== "all" ? getLanguageLabel(selectedLanguage) : "English"})
                </Button>
              </div>
              <Textarea
                placeholder="Enter text to convert to speech..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[180px] text-base leading-relaxed"
                dir={selectedLanguage === "ur" || (currentVoiceObj && getBaseLanguage(currentVoiceObj.lang) === "ur") ? "rtl" : "ltr"}
              />
            </div>

            {/* Pitch and Speed Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div>
                <label className="text-sm font-medium mb-2 block">Speed (Rate): {rate[0].toFixed(1)}x</label>
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
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button 
                onClick={speak} 
                disabled={!text.trim() || !isSupported}
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
                    Play Audio
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

            {/* Troubleshooting Guide for Missing System Voices (e.g. Urdu) */}
            <div className="pt-4 border-t border-border/50">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="tts-help" className="border-none">
                  <AccordionTrigger className="hover:no-underline py-2 text-sm font-semibold text-primary">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4" />
                      <span>Don't see your language (e.g. Urdu) in the voice list? Click here</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 text-sm space-y-4 text-muted-foreground">
                    <Alert className="bg-muted/50 border-border">
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Browsers read Text-to-Speech (TTS) voices directly from your Operating System (Windows/Mac) and browser online engines. Simply installing a language keyboard layout (e.g. Urdu keyboard) is <strong>not the same</strong> as installing a Text-To-Speech voice package.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-foreground">How to enable Urdu & other system voices:</h4>
                      
                      <div className="space-y-2">
                        <p className="font-medium text-foreground text-xs uppercase tracking-wider">Method 1: Windows 10/11 Settings (Local TTS Voice)</p>
                        <ol className="list-decimal pl-5 space-y-1 text-xs">
                          <li>Open <strong>Settings</strong> on your Windows PC (Press <kbd className="px-1 bg-muted border rounded">Win + I</kbd>).</li>
                          <li>Go to <strong>Time & Language</strong> &rarr; <strong>Speech</strong> (or <strong>Language & Region</strong>).</li>
                          <li>Under <em>Manage Voices</em> or <em>Add voices</em>, click <strong>Add voices</strong>.</li>
                          <li>Search for <strong>Urdu</strong> (or your desired language), check the speech package, and click <strong>Add</strong>.</li>
                          <li>Wait for Windows to finish installing the Voice package, then click the <strong className="text-foreground">Rescan System Voices</strong> button above.</li>
                        </ol>
                      </div>

                      <div className="space-y-2">
                        <p className="font-medium text-foreground text-xs uppercase tracking-wider">Method 2: Use Microsoft Edge Browser (Instant Cloud Voices)</p>
                        <ul className="list-disc pl-5 space-y-1 text-xs">
                          <li>Open this page in <strong>Microsoft Edge</strong>. Edge automatically includes free online high-quality natural voices for Urdu (such as <em>Microsoft Asad Online - Urdu</em> and <em>Microsoft Gul Online - Urdu</em>) without needing Windows Speech installation!</li>
                        </ul>
                      </div>

                      <div className="space-y-2">
                        <p className="font-medium text-foreground text-xs uppercase tracking-wider">Method 3: Google Chrome Speech Engine</p>
                        <ul className="list-disc pl-5 space-y-1 text-xs">
                          <li>Ensure Google Chrome is updated to the latest version. Chrome includes built-in Google Speech Synthesis voices for multiple languages.</li>
                        </ul>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

          </CardContent>
        </Card>
      </ToolLayout>
    </>
  );
};

export default TextToSpeech;
