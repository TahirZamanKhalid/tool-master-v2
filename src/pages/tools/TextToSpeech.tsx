
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
      layout="full-width"
    >
      <AdGridLayout>
        <Card className="h-full border-none shadow-none bg-transparent">
          <CardContent className="p-0">
            <div className="flex flex-col lg:flex-row gap-6 h-full">
              {/* Left Column: Text Input */}
              <div className="flex-1 min-h-[400px] lg:min-h-[500px] flex flex-col gap-4">
                <div className="relative flex-1">
                  <Textarea
                    placeholder="Enter text to convert to speech..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="h-full min-h-[300px] resize-none text-lg p-6 shadow-sm border-2 focus-visible:ring-primary/20"
                  />
                  <div className="absolute bottom-4 right-4 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded-md border">
                    {text.length} chars
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={speak}
                    disabled={!text.trim()}
                    className="flex-1 h-12 text-lg font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
                    size="lg"
                  >
                    {isSpeaking ? (
                      <>
                        <Pause className="h-5 w-5 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Volume2 className="h-5 w-5 mr-2" />
                        Play Audio
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={stop}
                    disabled={!isSpeaking}
                    variant="destructive"
                    size="lg"
                    className="h-12 px-8 shadow-md hover:shadow-lg"
                  >
                    <StopCircle className="h-5 w-5 mr-2" />
                    Stop
                  </Button>
                </div>
              </div>

              {/* Right Column: Controls */}
              <div className="w-full lg:w-[320px] space-y-6 bg-card rounded-xl border p-6 shadow-sm h-fit">
                <div className="flex items-center gap-2 pb-4 border-b">
                  <Settings2 className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-lg">Voice Settings</h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Voice</label>
                    <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose a voice" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {voices.map((v, i) => (
                          <SelectItem key={i} value={v.name}>
                            <span className="truncate block max-w-[240px]">{v.name}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <label className="text-sm font-medium">Speed</label>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">{rate[0].toFixed(1)}x</span>
                      </div>
                      <Slider
                        value={rate}
                        onValueChange={setRate}
                        min={0.5}
                        max={2}
                        step={0.1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-[10px] text-muted-foreground px-1">
                        <span>Slow</span>
                        <span>Fast</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <label className="text-sm font-medium">Pitch</label>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">{pitch[0].toFixed(1)}</span>
                      </div>
                      <Slider
                        value={pitch}
                        onValueChange={setPitch}
                        min={0.5}
                        max={2}
                        step={0.1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-[10px] text-muted-foreground px-1">
                        <span>Low</span>
                        <span>High</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t text-xs text-muted-foreground">
                  <p>Tip: Different browsers offer different voices. Try Chrome, Edge, or Safari for more options.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </AdGridLayout>
    </ToolLayout>
  </>
);
};

export default TextToSpeech;
