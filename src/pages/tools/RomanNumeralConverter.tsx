import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowRightLeft } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";

const RomanNumeralConverter = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<'toRoman' | 'toNumber'>('toRoman');

  const toRoman = (num: number): string => {
    const map: [number, string][] = [
      [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
      [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
      [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
    ];
    
    let result = '';
    for (const [value, numeral] of map) {
      while (num >= value) {
        result += numeral;
        num -= value;
      }
    }
    return result;
  };

  const toNumber = (roman: string): number => {
    const map: Record<string, number> = {
      'I': 1, 'V': 5, 'X': 10, 'L': 50,
      'C': 100, 'D': 500, 'M': 1000
    };
    
    let result = 0;
    for (let i = 0; i < roman.length; i++) {
      const current = map[roman[i]];
      const next = map[roman[i + 1]];
      if (next && current < next) {
        result -= current;
      } else {
        result += current;
      }
    }
    return result;
  };

  const convert = () => {
    if (!input) {
      toast.error("Please enter a value");
      return;
    }

    try {
      if (mode === 'toRoman') {
        const num = parseInt(input);
        if (isNaN(num) || num < 1 || num > 3999) {
          toast.error("Enter a number between 1 and 3999");
          return;
        }
        setOutput(toRoman(num));
      } else {
        const roman = input.toUpperCase();
        if (!/^[IVXLCDM]+$/.test(roman)) {
          toast.error("Invalid Roman numeral");
          return;
        }
        setOutput(toNumber(roman).toString());
      }
      toast.success("Converted successfully");
    } catch (error) {
      toast.error("Conversion failed");
    }
  };

  const toggleMode = () => {
    setMode(mode === 'toRoman' ? 'toNumber' : 'toRoman');
    setInput("");
    setOutput("");
  };

  return (
    <>
      <SEOHead
        title="Roman Numeral Converter"
        description="Convert between Roman numerals and decimal numbers instantly"
        keywords="roman numerals, roman converter, number to roman, roman to number"
        canonical="https://toolmaster.cloud/tools/roman-numeral-converter"
      />
      <ToolLayout
        title="Roman Numeral Converter"
        description="Convert between Roman numerals and numbers"
        category="Calculators"
        instructions={[
          "Enter a number (1-3999) or Roman numeral",
          "Click 'Convert' to translate",
          "Use arrow button to switch modes",
          "Result appears instantly"
        ]}
        relatedTools={[
          { name: "Number Base Converter", path: "/tools/number-base-converter" },
          { name: "Unit Converter", path: "/tools/premium-plus-unit-converter" }
        ]}
      >
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">
                {mode === 'toRoman' ? 'Number to Roman' : 'Roman to Number'}
              </h3>
              <Button onClick={toggleMode} variant="outline" size="sm">
                <ArrowRightLeft className="h-4 w-4 mr-2" />
                Switch
              </Button>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder={mode === 'toRoman' ? 'Enter number (1-3999)...' : 'Enter Roman numeral...'}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && convert()}
              />
              <Button onClick={convert}>
                Convert
              </Button>
            </div>

            {output && (
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm font-medium mb-1">Result:</p>
                <p className="text-3xl font-bold text-primary">{output}</p>
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              <p><strong>Roman Numerals:</strong> I=1, V=5, X=10, L=50, C=100, D=500, M=1000</p>
              <p className="mt-1"><strong>Range:</strong> 1 to 3999</p>
            </div>
          </CardContent>
        </Card>
      </ToolLayout>
    </>
  );
};

export default RomanNumeralConverter;
