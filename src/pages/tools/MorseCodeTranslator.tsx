import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowRightLeft, Copy } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";

const morseCode: Record<string, string> = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
  'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
  'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
  '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
  '8': '---..', '9': '----.', ' ': '/'
};

const MorseCodeTranslator = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');

  const reverseMorse = Object.fromEntries(
    Object.entries(morseCode).map(([k, v]) => [v, k])
  );

  const translate = () => {
    if (!input) {
      toast.error("Please enter text");
      return;
    }

    try {
      if (mode === 'encode') {
        const result = input.toUpperCase().split('').map(char => 
          morseCode[char] || char
        ).join(' ');
        setOutput(result);
      } else {
        const result = input.split(' ').map(code =>
          reverseMorse[code] || code
        ).join('');
        setOutput(result);
      }
      toast.success("Translated successfully");
    } catch (error) {
      toast.error("Translation failed");
    }
  };

  const toggleMode = () => {
    setMode(mode === 'encode' ? 'decode' : 'encode');
    setInput(output);
    setOutput(input);
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard");
  };

  return (
    <>
      <SEOHead
        title="Morse Code Translator"
        description="Convert text to Morse code and vice versa with instant translation"
        keywords="morse code, morse translator, encode morse, decode morse"
        canonical="https://toolmaster.cloud/tools/morse-code"
      />
      <ToolLayout
        title="Morse Code Translator"
        description="Translate between text and Morse code"
        category="Text Tools"
        instructions={[
          "Enter text or Morse code",
          "Select encode or decode mode",
          "Click 'Translate' to convert",
          "Use arrow button to swap modes"
        ]}
        relatedTools={[
          { name: "Base64 Encoder", path: "/tools/base64-encoder" },
          { name: "Hash Generator", path: "/tools/hash-generator" }
        ]}
      >
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{mode === 'encode' ? 'Text' : 'Morse Code'}</h3>
              <Button onClick={toggleMode} variant="outline" size="sm">
                <ArrowRightLeft className="h-4 w-4 mr-2" />
                Switch Mode
              </Button>
            </div>
            
            <Textarea
              placeholder={mode === 'encode' ? 'Enter text...' : 'Enter Morse code...'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[150px]"
            />

            <Button onClick={translate} className="w-full">
              Translate
            </Button>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{mode === 'encode' ? 'Morse Code' : 'Text'}</h3>
                {output && (
                  <Button onClick={copyOutput} variant="outline" size="sm">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                )}
              </div>
              <Textarea
                value={output}
                readOnly
                className="min-h-[150px] font-mono"
                placeholder="Output will appear here..."
              />
            </div>
          </CardContent>
        </Card>
      </ToolLayout>
    </>
  );
};

export default MorseCodeTranslator;
