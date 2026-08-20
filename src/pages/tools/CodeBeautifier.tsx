import { useState, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
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
import { AdSpace } from "@/components/AdSpace";

interface ValidationError {
  line?: number;
  column?: number;
  message: string;
  type: "error" | "warning";
}

const CodeBeautifier = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState<
    "json" | "html" | "css" | "javascript" | "xml" | "react" | "typescript" | "python" | "dart" | "php" | "sql"
  >("json");
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
      throw new Error(err.message);
    }
  };

  const beautifyHTML = (code: string) => {
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

    if (removeComments) {
      formatted = formatted.replace(/\/\*[\s\S]*?\*\//g, "");
    }

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

    if (removeComments) {
      formatted = formatted.replace(/\/\/.*$/gm, "");
      formatted = formatted.replace(/\/\*[\s\S]*?\*\//g, "");
    }

    const tokens = formatted.split(/([{}();,\n])/);
    let currentLine = "";

    tokens.forEach((token) => {
      const trimmed = token.trim();
      if (!trimmed) return;

      if (trimmed === "{") {
        currentLine += " " + trimmed;
        lines.push(indentStr.repeat(indent) + currentLine.trim());
        currentLine = "";
        indent++;
      } else if (trimmed === "}") {
        if (currentLine.trim()) {
          lines.push(indentStr.repeat(indent) + currentLine.trim());
          currentLine = "";
        }
        indent = Math.max(0, indent - 1);
        lines.push(indentStr.repeat(indent) + trimmed);
      } else if (trimmed === ";") {
        currentLine += trimmed;
        lines.push(indentStr.repeat(indent) + currentLine.trim());
        currentLine = "";
      } else {
        currentLine += " " + trimmed;
      }
    });

    if (currentLine.trim()) {
      lines.push(indentStr.repeat(indent) + currentLine.trim());
    }

    return lines
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
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

  const beautifyReact = (code: string) => {
    // React/JSX uses similar formatting to JavaScript
    return beautifyJavaScript(code);
  };

  const beautifyTypeScript = (code: string) => {
    // TypeScript uses similar formatting to JavaScript
    return beautifyJavaScript(code);
  };

  const beautifyPython = (code: string) => {
    let formatted = code;
    const indentStr = getIndent();

    if (removeComments) {
      formatted = formatted.replace(/#.*$/gm, "");
    }

    const lines = formatted.split("\n");
    let indent = 0;
    const result: string[] = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Decrease indent for lines starting with keywords that close blocks
      if (trimmed.match(/^(elif|else|except|finally)[\s:]/)) {
        indent = Math.max(0, indent - 1);
      }

      result.push(indentStr.repeat(indent) + trimmed);

      // Increase indent after lines ending with :
      if (trimmed.endsWith(":")) {
        indent++;
      }

      // Decrease indent after return, break, continue, pass
      if (trimmed.match(/^(return|break|continue|pass)(\s|$)/)) {
        // Keep current indent for next line
      }
    });

    return result.join("\n").trim();
  };

  const beautifyDart = (code: string) => {
    // Dart/Flutter uses similar C-style formatting
    return beautifyJavaScript(code);
  };

  const beautifyPHP = (code: string) => {
    let formatted = code;

    if (removeComments) {
      formatted = formatted.replace(/\/\/.*$/gm, "");
      formatted = formatted.replace(/\/\*[\s\S]*?\*\//g, "");
      formatted = formatted.replace(/#.*$/gm, "");
    }

    return beautifyJavaScript(formatted);
  };

  const beautifySQL = (code: string) => {
    let formatted = code;
    const indentStr = getIndent();

    if (removeComments) {
      formatted = formatted.replace(/--.*$/gm, "");
      formatted = formatted.replace(/\/\*[\s\S]*?\*\//g, "");
    }

    // SQL keywords to uppercase
    const keywords = [
      "SELECT",
      "FROM",
      "WHERE",
      "JOIN",
      "LEFT",
      "RIGHT",
      "INNER",
      "OUTER",
      "ON",
      "AND",
      "OR",
      "ORDER BY",
      "GROUP BY",
      "HAVING",
      "INSERT",
      "UPDATE",
      "DELETE",
      "CREATE",
      "ALTER",
      "DROP",
      "TABLE",
      "DATABASE",
      "INDEX",
    ];

    keywords.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, "gi");
      formatted = formatted.replace(regex, keyword);
    });

    // Add newlines for major clauses
    formatted = formatted.replace(/\s+(SELECT|FROM|WHERE|JOIN|ORDER BY|GROUP BY|HAVING)\s+/gi, "\n$1 ");
    formatted = formatted.replace(/\s*,\s*/g, ",\n" + indentStr);

    return formatted.trim();
  };

  const validateCode = (code: string, lang: string): ValidationError[] => {
    const errors: ValidationError[] = [];

    try {
      if (lang === "json") {
        JSON.parse(code);
      } else if (lang === "html" || lang === "xml") {
        // Basic HTML/XML validation - skip React/JSX components (PascalCase)
        const openTags: string[] = [];
        const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g;
        let match;

        while ((match = tagRegex.exec(code)) !== null) {
          const tagName = match[1];

          // Skip React components (PascalCase like MyComponent)
          if (/^[A-Z]/.test(tagName)) continue;

          const isClosing = match[0].startsWith("</");
          const tagNameLower = tagName.toLowerCase();
          const isSelfClosing =
            match[0].endsWith("/>") ||
            [
              "br",
              "hr",
              "img",
              "input",
              "meta",
              "link",
              "area",
              "base",
              "col",
              "embed",
              "source",
              "track",
              "wbr",
            ].includes(tagNameLower);

          if (isSelfClosing) continue;

          if (isClosing) {
            if (openTags.length === 0 || openTags[openTags.length - 1] !== tagNameLower) {
              errors.push({
                message: `Mismatched closing tag: </${tagNameLower}>`,
                type: "error",
              });
            } else {
              openTags.pop();
            }
          } else {
            openTags.push(tagNameLower);
          }
        }

        if (openTags.length > 0 && openTags.length < 10) {
          errors.push({
            message: `Unclosed tags: ${openTags.join(", ")}`,
            type: "warning",
          });
        }
      } else if (lang === "css") {
        const braceCount = (code.match(/{/g) || []).length - (code.match(/}/g) || []).length;
        if (braceCount !== 0) {
          errors.push({
            message: `Unmatched braces (${Math.abs(braceCount)} ${braceCount > 0 ? "opening" : "closing"})`,
            type: "error",
          });
        }
      } else if (
        lang === "javascript" ||
        lang === "typescript" ||
        lang === "react" ||
        lang === "dart" ||
        lang === "php"
      ) {
        const braceCount = (code.match(/{/g) || []).length - (code.match(/}/g) || []).length;
        const parenCount = (code.match(/\(/g) || []).length - (code.match(/\)/g) || []).length;
        const bracketCount = (code.match(/\[/g) || []).length - (code.match(/\]/g) || []).length;

        if (braceCount !== 0) {
          errors.push({
            message: `Unmatched braces: ${Math.abs(braceCount)} ${braceCount > 0 ? "opening" : "closing"}`,
            type: "error",
          });
        }
        if (parenCount !== 0) {
          errors.push({
            message: `Unmatched parentheses: ${Math.abs(parenCount)} ${parenCount > 0 ? "opening" : "closing"}`,
            type: "warning",
          });
        }
        if (bracketCount !== 0) {
          errors.push({
            message: `Unmatched brackets: ${Math.abs(bracketCount)} ${bracketCount > 0 ? "opening" : "closing"}`,
            type: "warning",
          });
        }
      } else if (lang === "python") {
        // Basic Python validation - check indentation consistency
        const lines = code.split("\n").filter((l) => l.trim());
        const indentPattern = lines[0]?.match(/^\s*/)?.[0];
        // Just do basic checks
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

    await new Promise((resolve) => setTimeout(resolve, 300));

    try {
      const validationErrors = validateCode(input, language);
      setErrors(validationErrors);
      setIsValid(validationErrors.filter((e) => e.type === "error").length === 0);

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
        case "react":
          result = beautifyReact(input);
          break;
        case "typescript":
          result = beautifyTypeScript(input);
          break;
        case "python":
          result = beautifyPython(input);
          break;
        case "dart":
          result = beautifyDart(input);
          break;
        case "php":
          result = beautifyPHP(input);
          break;
        case "sql":
          result = beautifySQL(input);
          break;
      }

      if (addLineNumbers) {
        const lines = result.split("\n");
        const maxDigits = String(lines.length).length;
        result = lines.map((line, i) => `${String(i + 1).padStart(maxDigits, " ")} | ${line}`).join("\n");
      }

      setOutput(result);
      toast.success(validationErrors.length === 0 ? "Code beautified successfully!" : "Code beautified with warnings");
    } catch (error: any) {
      setIsValid(false);
      setErrors([{ message: error.message || "Invalid code format", type: "error" }]);
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
      } else if (
        language === "javascript" ||
        language === "typescript" ||
        language === "react" ||
        language === "dart" ||
        language === "php"
      ) {
        result = input
          .replace(/\s+/g, " ")
          .replace(/\s*([{}();,])\s*/g, "$1")
          .trim();
      } else if (language === "python") {
        result = input
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line)
          .join("\n");
      } else if (language === "sql") {
        result = input.replace(/\s+/g, " ").trim();
      }

      setOutput(result);
      setErrors([]);
      setIsValid(null);
      toast.success("Code minified!");
    } catch (error) {
      toast.error("Failed to minify code");
    }
  };

  const copyToClipboard = () => {
    if (!output) {
      toast.error("Nothing to copy");
      return;
    }
    navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard!");
  };

  const downloadCode = () => {
    if (!output) {
      toast.error("Nothing to download");
      return;
    }

    const extensions: Record<string, string> = {
      json: "json",
      html: "html",
      css: "css",
      javascript: "js",
      xml: "xml",
      react: "jsx",
      typescript: "ts",
      python: "py",
      dart: "dart",
      php: "php",
      sql: "sql",
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
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Please upload a text file smaller than 2 MB");
        e.target.value = "";
        return;
      }

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
      description="Professional code formatter with syntax validation, minification, and advanced formatting options for JSON, HTML, CSS, JavaScript, TypeScript, React, Python, Flutter/Dart, PHP, SQL, and XML"
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
                  <Label className="text-lg font-semibold">Select Language</Label>
                </div>
                <RadioGroup
                  value={language}
                  onValueChange={(v) => {
                    setLanguage(v as typeof language);
                    setErrors([]);
                    setIsValid(null);
                  }}
                  className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3"
                >
                  {[
                    { value: "json", label: "JSON", icon: "{ }" },
                    { value: "html", label: "HTML", icon: "<>" },
                    { value: "css", label: "CSS", icon: "{;}" },
                    { value: "javascript", label: "JavaScript", icon: "JS" },
                    { value: "react", label: "React/JSX", icon: "⚛" },
                    { value: "typescript", label: "TypeScript", icon: "TS" },
                    { value: "python", label: "Python", icon: "🐍" },
                    { value: "dart", label: "Flutter/Dart", icon: "🎯" },
                    { value: "php", label: "PHP", icon: "🐘" },
                    { value: "sql", label: "SQL", icon: "🗄" },
                    { value: "xml", label: "XML", icon: "<?>" },
                  ].map((lang) => (
                    <div key={lang.value} className="relative">
                      <RadioGroupItem value={lang.value} id={lang.value} className="peer sr-only" />
                      <Label
                        htmlFor={lang.value}
                        className="flex flex-col items-center justify-center p-3 bg-background border-2 rounded-lg cursor-pointer transition-all hover:bg-accent hover:scale-105 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:shadow-lg peer-data-[state=checked]:scale-105"
                      >
                        <span className="text-2xl mb-1">{lang.icon}</span>
                        <span className="font-medium text-xs text-center">{lang.label}</span>
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
                      <Label>
                        Indent Size: {indentSize} {indentType === "spaces" ? "spaces" : "tab"}
                      </Label>
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
                      <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg hover:bg-accent transition-colors">
                        <Label htmlFor="sort-keys" className="cursor-pointer font-medium">
                          Sort Object Keys
                        </Label>
                        <Switch id="sort-keys" checked={sortKeys} onCheckedChange={setSortKeys} />
                      </div>
                    )}

                    {!["sql"].includes(language) && (
                      <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg hover:bg-accent transition-colors">
                        <Label htmlFor="remove-comments" className="cursor-pointer font-medium">
                          Remove Comments
                        </Label>
                        <Switch id="remove-comments" checked={removeComments} onCheckedChange={setRemoveComments} />
                      </div>
                    )}

                    <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg hover:bg-accent transition-colors">
                      <Label htmlFor="line-numbers" className="cursor-pointer font-medium">
                        Add Line Numbers
                      </Label>
                      <Switch id="line-numbers" checked={addLineNumbers} onCheckedChange={setAddLineNumbers} />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg hover:bg-accent transition-colors">
                      <Label htmlFor="wrap-lines" className="cursor-pointer font-medium">
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
                      accept=".json,.html,.css,.js,.jsx,.ts,.tsx,.py,.dart,.php,.sql,.xml"
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
                      {isValid ? "✅ Validation Passed" : "⚠️ Validation Issues Found"}
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
                  <p className="font-semibold">🚀 Pro Tips:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>
                      Supports 11 languages: JSON, HTML, CSS, JS, React, TypeScript, Python, Flutter/Dart, PHP, SQL, XML
                    </li>
                    <li>Use advanced options to customize formatting (indentation, comments, line numbers)</li>
                    <li>Automatic syntax validation with detailed error messages</li>
                    <li>Minify option reduces file size for production</li>
                    <li>Upload files directly or paste code for instant formatting</li>
                    <li>Download formatted code with proper file extensions</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sticky Sidebar with Google Ads */}
        <div className="lg:col-span-3">
          <div className="sticky top-6 space-y-6">
            {/* Ad Slot 1 - 300x250 */}
            <Card className="border-2 overflow-hidden">
              <CardContent className="p-4">
                <AdSpace type="display" slot="7713152297" position="sidebar-right" className="w-full" />
              </CardContent>
            </Card>

            {/* Ad Slot 2 - 300x600 */}
            <Card className="border-2 overflow-hidden">
              <CardContent className="p-4">
                <AdSpace type="display" slot="7110517063" position="sidebar-right" className="w-full" />
              </CardContent>
            </Card>

            {/* Ad Slot 3 - 300x300 */}
            <Card className="border-2 overflow-hidden">
              <CardContent className="p-4">
                <AdSpace type="display" slot="4153181237" position="sidebar-right" className="w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Related Articles & Guides — internal link for SEO */}
      <section className="mt-12 mb-8 w-full max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-foreground">Related Articles & Guides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <RouterLink
            to="/blog/best-free-code-beautifier"
            className="p-4 border border-border/60 rounded-lg bg-card/80 shadow-sm hover:shadow-card-hover transition-shadow no-underline block"
          >
            <span className="text-primary font-semibold hover:underline text-lg block">
              Best Free Online Code Beautifier & Formatter
            </span>
            <p className="text-muted-foreground mt-2 text-sm">
              Format and beautify HTML, CSS, JavaScript, and JSON instantly to clean up messy code.
            </p>
          </RouterLink>
        </div>
      </section>
    </ToolLayout>
  );
};

export default CodeBeautifier;
