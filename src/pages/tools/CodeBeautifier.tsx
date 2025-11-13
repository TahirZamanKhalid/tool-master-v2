import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import {
  Code,
  Copy,
  Download,
  Upload,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Wand2,
  Settings,
  FileJson,
  FileCode,
  Palette,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ValidationError {
  line?: number;
  column?: number;
  message: string;
  type: "error" | "warning";
}

const CodeBeautifier = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState<"json" | "html" | "css" | "javascript" | "xml">("json");
  const [indentSize, setIndentSize] = useState(2);
  const [indentType, setIndentType] = useState<"spaces" | "tabs">("spaces");
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [stats, setStats] = useState({ lines: 0, chars: 0, size: "0 B" });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Advanced options
  const [sortKeys, setSortKeys] = useState(false);
  const [removeComments, setRemoveComments] = useState(false);
  const [addLineNumbers, setAddLineNumbers] = useState(false);
  const [wrapLines, setWrapLines] = useState(false);
  const [colorScheme, setColorScheme] = useState("default");

  // Calculate stats
  useEffect(() => {
    const lines = output.split("\n").length;
    const chars = output.length;
    const bytes = new Blob([output]).size;
    const size =
      bytes < 1024
        ? `${bytes} B`
        : bytes < 1048576
          ? `${(bytes / 1024).toFixed(2)} KB`
          : `${(bytes / 1048576).toFixed(2)} MB`;
    setStats({ lines, chars, size });
  }, [output]);

  const getIndent = () => {
    return indentType === "tabs" ? "\t" : " ".repeat(indentSize);
  };

  const beautifyJSON = (code: string) => {
    try {
      let parsed = JSON.parse(code);

      if (sortKeys) {
        parsed = sortObjectKeys(parsed);
      }

      const indent = getIndent();
      const indentCount = indentType === "tabs" ? 1 : indentSize;
      return JSON.stringify(parsed, null, indentCount).replace(/\t/g, indent);
    } catch (error) {
      const err = error as Error;
      const match = err.message.match(/position (\d+)/);
      throw {
        message: err.message,
        position: match ? parseInt(match[1]) : undefined,
      };
    }
  };

  const sortObjectKeys = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map((item) => sortObjectKeys(item));
    } else if (obj !== null && typeof obj === "object") {
      return Object.keys(obj)
        .sort()
        .reduce((result: any, key) => {
          result[key] = sortObjectKeys(obj[key]);
          return result;
        }, {});
    }
    return obj;
  };

  const beautifyHTML = (code: string) => {
    let formatted = code;
    let indent = 0;
    const lines: string[] = [];
    const indentStr = getIndent();

    // Remove comments if option is enabled
    if (removeComments) {
      formatted = formatted.replace(/<!--[\s\S]*?-->/g, "");
    }

    formatted = formatted.replace(/>\s*</g, "><");
    const tags = formatted.split("<");

    tags.forEach((tag) => {
      if (!tag) return;

      const isClosing = tag.startsWith("/");
      const isSelfClosing =
        tag.endsWith("/") || tag.match(/^(br|hr|img|input|meta|link|area|base|col|embed|source|track|wbr)/i);

      if (isClosing) {
        indent = Math.max(0, indent - 1);
      }

      const line = indentStr.repeat(indent) + "<" + tag;
      lines.push(line);

      if (!isClosing && !isSelfClosing) {
        indent++;
      }
    });

    return lines.join("\n").trim();
  };

  const beautifyCSS = (code: string) => {
    let formatted = code;
    const indentStr = getIndent();

    // Remove comments if option is enabled
    if (removeComments) {
      formatted = formatted.replace(/\/\*[\s\S]*?\*\//g, "");
    }

    // Format CSS
    formatted = formatted.replace(/\s*{\s*/g, " {\n" + indentStr);
    formatted = formatted.replace(/\s*}\s*/g, "\n}\n\n");
    formatted = formatted.replace(/\s*;\s*/g, ";\n" + indentStr);
    formatted = formatted.replace(/\n\s*\n\s*\n/g, "\n\n");

    return formatted.trim();
  };

  const beautifyJavaScript = (code: string) => {
    let formatted = code;
    let indent = 0;
    const lines: string[] = [];
    const indentStr = getIndent();

    // Remove comments if option is enabled
    if (removeComments) {
      formatted = formatted.replace(/\/\/.*$/gm, "");
      formatted = formatted.replace(/\/\*[\s\S]*?\*\//g, "");
    }

    // Basic JavaScript formatting
    const tokens = formatted.split(/([{}();,]|\n)/);

    tokens.forEach((token) => {
      const trimmed = token.trim();
      if (!trimmed) return;

      if (trimmed === "{") {
        lines.push(indentStr.repeat(indent) + trimmed);
        indent++;
      } else if (trimmed === "}") {
        indent = Math.max(0, indent - 1);
        lines.push(indentStr.repeat(indent) + trimmed);
      } else if (trimmed === ";") {
        if (lines.length > 0) {
          lines[lines.length - 1] += trimmed;
        }
      } else {
        lines.push(indentStr.repeat(indent) + trimmed);
      }
    });

    return lines.join("\n").trim();
  };

  const beautifyXML = (code: string) => {
    let formatted = code;
    let indent = 0;
    const lines: string[] = [];
    const indentStr = getIndent();

    if (removeComments) {
      formatted = formatted.replace(/<!--[\s\S]*?-->/g, "");
    }

    formatted = formatted.replace(/>\s*</g, "><");
    const tags = formatted.split("<");

    tags.forEach((tag) => {
      if (!tag) return;

      const isClosing = tag.startsWith("/");
      const isSelfClosing = tag.endsWith("/>");

      if (isClosing) {
        indent = Math.max(0, indent - 1);
      }

      lines.push(indentStr.repeat(indent) + "<" + tag);

      if (!isClosing && !isSelfClosing) {
        indent++;
      }
    });

    return lines.join("\n").trim();
  };

  const validateCode = (code: string, lang: string): ValidationError[] => {
    const errors: ValidationError[] = [];

    try {
      if (lang === "json") {
        JSON.parse(code);
      } else if (lang === "html" || lang === "xml") {
        // Basic HTML/XML validation
        const openTags: string[] = [];
        const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g;
        let match;

        while ((match = tagRegex.exec(code)) !== null) {
          const isClosing = match[0].startsWith("</");
          const tagName = match[1].toLowerCase();
          const isSelfClosing =
            match[0].endsWith("/>") || ["br", "hr", "img", "input", "meta", "link"].includes(tagName);

          if (isSelfClosing) continue;

          if (isClosing) {
            if (openTags.length === 0 || openTags[openTags.length - 1] !== tagName) {
              errors.push({
                message: `Mismatched closing tag: </${tagName}>`,
                type: "error",
              });
            } else {
              openTags.pop();
            }
          } else {
            openTags.push(tagName);
          }
        }

        if (openTags.length > 0) {
          errors.push({
            message: `Unclosed tags: ${openTags.join(", ")}`,
            type: "warning",
          });
        }
      } else if (lang === "css") {
        // Basic CSS validation
        const braceCount = (code.match(/{/g) || []).length - (code.match(/}/g) || []).length;
        if (braceCount !== 0) {
          errors.push({
            message: `Unmatched braces (${Math.abs(braceCount)} ${braceCount > 0 ? "opening" : "closing"})`,
            type: "error",
          });
        }
      }
    } catch (error) {
      const err = error as any;
      errors.push({
        message: err.message || "Syntax error detected",
        type: "error",
      });
    }

    return errors;
  };

  const handleBeautify = async () => {
    if (!input.trim()) {
      toast.error("Please enter some code");
      return;
    }

    setIsProcessing(true);

    // Simulate processing for animation
    await new Promise((resolve) => setTimeout(resolve, 300));

    try {
      // Validate first
      const validationErrors = validateCode(input, language);
      setErrors(validationErrors);
      setIsValid(validationErrors.length === 0);

      let result = "";

      switch (language) {
        case "json":
          result = beautifyJSON(input);
          break;
        case "html":
          result = beautifyHTML(input);
          break;
        case "css":
          result = beautifyCSS(input);
          break;
        case "javascript":
          result = beautifyJavaScript(input);
          break;
        case "xml":
          result = beautifyXML(input);
          break;
      }

      if (addLineNumbers) {
        const lines = result.split("\n");
        result = lines.map((line, i) => `${String(i + 1).padStart(4, " ")} | ${line}`).join("\n");
      }

      setOutput(result);
      toast.success(validationErrors.length === 0 ? "Code beautified successfully!" : "Code beautified with warnings");
    } catch (error: any) {
      const err = error as any;
      setIsValid(false);
      setErrors([{ message: err.message || "Invalid code format", type: "error" }]);
      toast.error("Failed to beautify code");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMinify = () => {
    if (!input.trim()) {
      toast.error("Please enter some code");
      return;
    }

    try {
      let result = input;

      if (language === "json") {
        const parsed = JSON.parse(input);
        result = JSON.stringify(parsed);
      } else if (language === "html" || language === "xml") {
        result = input
          .replace(/>\s+</g, "><")
          .replace(/\s{2,}/g, " ")
          .trim();
      } else if (language === "css") {
        result = input
          .replace(/\s+/g, " ")
          .replace(/\s*([{}:;,])\s*/g, "$1")
          .trim();
      } else if (language === "javascript") {
        result = input
          .replace(/\s+/g, " ")
          .replace(/\s*([{}();,])\s*/g, "$1")
          .trim();
      }

      setOutput(result);
      toast.success("Code minified!");
    } catch (error) {
      toast.error("Failed to minify code");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard!");
  };

  const downloadCode = () => {
    const extensions: Record<string, string> = {
      json: "json",
      html: "html",
      css: "css",
      javascript: "js",
      xml: "xml",
    };

    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `beautified.${extensions[language]}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("File downloaded!");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setInput(text);
        toast.success("File loaded!");
      };
      reader.readAsText(file);
    }
  };

  const clearAll = () => {
    setInput("");
    setOutput("");
    setErrors([]);
    setIsValid(null);
    toast.info("Cleared all content");
  };

  return (
    <ToolLayout
      title="Advanced Code Beautifier & Formatter"
      description="Professional code formatter with syntax validation, minification, and advanced formatting options for JSON, HTML, CSS, JavaScript, and XML"
      category="Developer Tools"
      relatedTools={[
        { name: "JSON Formatter", path: "/tools/json-formatter" },
        { name: "HTML Encoder", path: "/tools/html-encoder" },
        { name: "Markdown Preview", path: "/tools/markdown-preview" },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-9 space-y-6">
          {/* Language Selection */}
          <Card className="border-2 hover:border-primary/50 transition-all duration-300">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FileCode className="h-5 w-5 text-primary" />
                  <Label className="text-lg font-semibold">Language</Label>
                </div>
                <RadioGroup
                  value={language}
                  onValueChange={(v) => {
                    setLanguage(v as typeof language);
                    setErrors([]);
                    setIsValid(null);
                  }}
                  className="grid grid-cols-2 md:grid-cols-5 gap-3"
                >
                  {[
                    { value: "json", label: "JSON", icon: "{ }" },
                    { value: "html", label: "HTML", icon: "<>" },
                    { value: "css", label: "CSS", icon: "{;}" },
                    { value: "javascript", label: "JavaScript", icon: "JS" },
                    { value: "xml", label: "XML", icon: "<?>" },
                  ].map((lang) => (
                    <div key={lang.value} className="relative">
                      <RadioGroupItem value={lang.value} id={lang.value} className="peer sr-only" />
                      <Label
                        htmlFor={lang.value}
                        className="flex flex-col items-center justify-center p-4 bg-background border-2 rounded-lg cursor-pointer transition-all hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:shadow-lg"
                      >
                        <span className="text-2xl font-mono mb-2">{lang.icon}</span>
                        <span className="font-medium">{lang.label}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Options */}
          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <Card className="border-2">
              <CardContent className="pt-6">
                <CollapsibleTrigger className="flex items-center justify-between w-full group">
                  <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" />
                    <Label className="text-lg font-semibold cursor-pointer">Advanced Options</Label>
                  </div>
                  {showAdvanced ? (
                    <ChevronUp className="h-5 w-5 transition-transform group-hover:scale-110" />
                  ) : (
                    <ChevronDown className="h-5 w-5 transition-transform group-hover:scale-110" />
                  )}
                </CollapsibleTrigger>

                <CollapsibleContent className="mt-6 space-y-6">
                  {/* Indentation Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label>Indentation Type</Label>
                      <Select value={indentType} onValueChange={(v) => setIndentType(v as typeof indentType)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="spaces">Spaces</SelectItem>
                          <SelectItem value="tabs">Tabs</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label>Indent Size: {indentSize}</Label>
                      <Slider
                        value={[indentSize]}
                        onValueChange={(v) => setIndentSize(v[0])}
                        min={2}
                        max={8}
                        step={1}
                        className="py-4"
                        disabled={indentType === "tabs"}
                      />
                    </div>
                  </div>

                  {/* Toggle Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {language === "json" && (
                      <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                        <Label htmlFor="sort-keys" className="cursor-pointer">
                          Sort Object Keys
                        </Label>
                        <Switch id="sort-keys" checked={sortKeys} onCheckedChange={setSortKeys} />
                      </div>
                    )}

                    <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                      <Label htmlFor="remove-comments" className="cursor-pointer">
                        Remove Comments
                      </Label>
                      <Switch id="remove-comments" checked={removeComments} onCheckedChange={setRemoveComments} />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                      <Label htmlFor="line-numbers" className="cursor-pointer">
                        Add Line Numbers
                      </Label>
                      <Switch id="line-numbers" checked={addLineNumbers} onCheckedChange={setAddLineNumbers} />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                      <Label htmlFor="wrap-lines" className="cursor-pointer">
                        Wrap Long Lines
                      </Label>
                      <Switch id="wrap-lines" checked={wrapLines} onCheckedChange={setWrapLines} />
                    </div>
                  </div>
                </CollapsibleContent>
              </CardContent>
            </Card>
          </Collapsible>

          {/* Input Section */}
          <Card className="border-2 hover:border-primary/30 transition-all duration-300">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label htmlFor="input" className="text-lg font-semibold">
                    Input Code
                  </Label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => document.getElementById("file-upload")?.click()}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                    <input
                      id="file-upload"
                      type="file"
                      accept=".json,.html,.css,.js,.xml"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button variant="outline" size="sm" onClick={clearAll}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                  </div>
                </div>
                <Textarea
                  id="input"
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    setErrors([]);
                    setIsValid(null);
                  }}
                  className={`min-h-[350px] font-mono text-sm transition-all duration-300 ${
                    wrapLines ? "" : "whitespace-pre overflow-x-auto"
                  }`}
                  placeholder={`Paste your ${language.toUpperCase()} code here...`}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={handleBeautify}
              className="w-full h-14 text-lg font-semibold group hover:scale-105 transition-all duration-300"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Wand2 className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
                  Beautify Code
                </>
              )}
            </Button>
            <Button
              onClick={handleMinify}
              variant="outline"
              className="w-full h-14 text-lg font-semibold hover:scale-105 transition-all duration-300"
            >
              <Code className="h-5 w-5 mr-2" />
              Minify Code
            </Button>
          </div>

          {/* Validation Results */}
          {isValid !== null && (
            <Card
              className={`border-2 animate-in fade-in slide-in-from-top-4 duration-500 ${
                isValid
                  ? "border-green-500 bg-green-50 dark:bg-green-950"
                  : "border-amber-500 bg-amber-50 dark:bg-amber-950"
              }`}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  {isValid ? (
                    <CheckCircle2 className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-amber-600 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">
                      {isValid ? "Validation Passed" : "Validation Issues Found"}
                    </h3>
                    {errors.length > 0 && (
                      <ul className="space-y-1">
                        {errors.map((error, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <Badge variant={error.type === "error" ? "destructive" : "secondary"} className="mt-0.5">
                              {error.type}
                            </Badge>
                            <span>{error.message}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Output Section */}
          {output && (
            <Card className="border-2 border-primary/50 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-lg font-semibold">Beautified Output</Label>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {stats.lines} lines
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {stats.chars} chars
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {stats.size}
                      </Badge>
                    </div>
                  </div>

                  <Textarea
                    value={output}
                    readOnly
                    className={`min-h-[350px] font-mono text-sm bg-accent/50 ${
                      wrapLines ? "" : "whitespace-pre overflow-x-auto"
                    }`}
                  />

                  <div className="flex gap-2">
                    <Button onClick={copyToClipboard} variant="outline" className="flex-1 group">
                      <Copy className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                      Copy to Clipboard
                    </Button>
                    <Button onClick={downloadCode} variant="outline" className="flex-1 group">
                      <Download className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                      Download File
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info Card */}
          <Card className="border-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm space-y-2">
                  <p className="font-semibold">Pro Tips:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Use the advanced options to customize formatting to your coding style</li>
                    <li>Validation runs automatically when you beautify your code</li>
                    <li>Minify option reduces file size by removing unnecessary whitespace</li>
                    <li>Upload files directly or paste code for quick formatting</li>
                    <li>Download formatted code with proper file extensions</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sticky Sidebar Ads */}
        <div className="lg:col-span-3">
          <div className="sticky top-6 space-y-6">
            {/* Ad Slot 1 - Flexible size */}
            <Card className="border-2 border-dashed border-muted-foreground/20 overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 aspect-[300/250] flex items-center justify-center">
                  <div className="text-center p-4">
                    <Palette className="h-12 w-12 mx-auto mb-2 text-purple-600" />
                    <p className="text-sm font-semibold text-muted-foreground">Ad Space</p>
                    <p className="text-xs text-muted-foreground">300x250</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ad Slot 2 - Flexible size */}
            <Card className="border-2 border-dashed border-muted-foreground/20 overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 aspect-[300/600] flex items-center justify-center">
                  <div className="text-center p-4">
                    <Code className="h-12 w-12 mx-auto mb-2 text-blue-600" />
                    <p className="text-sm font-semibold text-muted-foreground">Ad Space</p>
                    <p className="text-xs text-muted-foreground">300x600</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ad Slot 3 - Square */}
            <Card className="border-2 border-dashed border-muted-foreground/20 overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 aspect-square flex items-center justify-center">
                  <div className="text-center p-4">
                    <Wand2 className="h-12 w-12 mx-auto mb-2 text-green-600" />
                    <p className="text-sm font-semibold text-muted-foreground">Ad Space</p>
                    <p className="text-xs text-muted-foreground">300x300</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default CodeBeautifier;
