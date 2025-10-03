import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Copy, Type } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CaseConverter = () => {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const toTitleCase = (str: string): string => {
    return str.toLowerCase().replace(/(?:^|\s)\w/g, (match) => match.toUpperCase());
  };

  const toSentenceCase = (str: string): string => {
    return str.toLowerCase().replace(/(^\w|\.\s+\w)/g, (match) => match.toUpperCase());
  };

  const toCamelCase = (str: string): string => {
    return str
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
  };

  const toSnakeCase = (str: string): string => {
    return str
      .replace(/\s+/g, '_')
      .replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
      .replace(/^_/, '')
      .toLowerCase();
  };

  const toKebabCase = (str: string): string => {
    return str
      .replace(/\s+/g, '-')
      .replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
      .replace(/^-/, '')
      .toLowerCase();
  };

  const handleConvert = () => {
    if (!input) {
      toast({
        title: "Error",
        description: "Please enter some text",
        variant: "destructive",
      });
      return;
    }

    setResults({
      'UPPERCASE': input.toUpperCase(),
      'lowercase': input.toLowerCase(),
      'Title Case': toTitleCase(input),
      'Sentence case': toSentenceCase(input),
      'camelCase': toCamelCase(input),
      'snake_case': toSnakeCase(input),
      'kebab-case': toKebabCase(input),
    });

    toast({
      title: "Converted!",
      description: "Text converted to all cases",
    });
  };

  const copyResult = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Text copied to clipboard",
    });
  };

  return (
    <ToolLayout
      title="Case Converter"
      description="Convert text between different case styles"
      category="Text Tools"
      instructions={[
        "Enter or paste your text",
        "Click 'Convert All Cases' to see all variations",
        "Copy the case style you need"
      ]}
      relatedTools={[
        { name: "Word Counter", path: "/tools/word-counter" },
        { name: "URL Encoder", path: "/tools/url-encoder" },
        { name: "Base64 Encoder", path: "/tools/base64-encoder" },
      ]}
    >
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <Label htmlFor="input" className="text-base mb-2 block">Input Text</Label>
            <Textarea
              id="input"
              placeholder="Enter text to convert..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[150px] mb-4"
            />
            <Button 
              onClick={handleConvert}
              disabled={!input}
              className="w-full"
            >
              <Type className="mr-2 h-4 w-4" />
              Convert All Cases
            </Button>
          </CardContent>
        </Card>

        {Object.keys(results).length > 0 && (
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(results).map(([caseType, text]) => (
              <Card key={caseType}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-base font-semibold">{caseType}</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyResult(text)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <div className="p-3 bg-muted rounded-lg min-h-[80px] break-all">
                    {text}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default CaseConverter;
