// pages/PDFToText.tsx
import { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import PdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?worker";
import {
  FileText,
  Upload,
  Copy,
  Download,
  Search,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Type,
  Code,
  FileCode,
  Eye,
  Loader2,
  Info,
  Shield,
  Zap,
  Star,
  X,
  Check,
  Settings,
  Layers,
  LayoutGrid,
  List,
  ChevronDown,
  FileImage,
  RefreshCw,
} from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { Breadcrumbs, BREADCRUMB_PRESETS } from "@/components/Breadcrumbs";
import { SidebarAd } from "@/components/SidebarAd";
import { InFeedAd } from "@/components/InFeedAd";
import { AdWatchModal } from "@/components/AdWatchModal";
import { StyledTextViewer } from "@/components/PDF To Text/StyledTextViewer";
import { FontInfoPanel } from "@/components/PDF To Text/FontInfoPanel";
import {
  extractPDFWithStyles,
  toHTML,
  toPlainText,
  toRTF,
  ExtractionResult,
  PageContent,
} from "../../utils/pdfTextExtractor";

// Configure PDF.js worker
GlobalWorkerOptions.workerPort = new PdfWorker();

// Ad slots
const AD_SLOTS = {
  leftSidebar1: "5204253730",
  leftSidebar2: "8153850707",
  rightSidebar1: "4351073152",
  rightSidebar2: "1724909816",
  inFeed1: "6510332635",
  inFeed2: "4159501466",
};

type ExportFormat = "txt" | "html" | "rtf";
type ViewMode = "styled" | "plain" | "raw";

const PDFToText = () => {
  // File state
  const [file, setFile] = useState<File | null>(null);
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");

  // View state
  const [activeTab, setActiveTab] = useState("upload");
  const [viewMode, setViewMode] = useState<ViewMode>("styled");
  const [currentPage, setCurrentPage] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  // Export state
  const [exportFormat, setExportFormat] = useState<ExportFormat>("txt");

  // Ad modal state
  const [showAdModal, setShowAdModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<"copy" | "download" | null>(null);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      toast.error("Please select a valid PDF file");
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      toast.error("File size must be less than 50MB");
      return;
    }

    setFile(selectedFile);
    setExtractionResult(null);
    setCurrentPage(0);
    toast.success("PDF loaded successfully");
  };

  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === "application/pdf") {
      setFile(droppedFile);
      setExtractionResult(null);
      setCurrentPage(0);
      toast.success("PDF loaded successfully");
    } else {
      toast.error("Please drop a valid PDF file");
    }
  }, []);

  // Extract text with styling
  const extractText = async () => {
    if (!file) {
      toast.error("Please select a PDF file first");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setProgressMessage("Starting extraction...");

    try {
      const result = await extractPDFWithStyles(file, (prog, msg) => {
        setProgress(prog);
        setProgressMessage(msg);
      });

      setExtractionResult(result);
      setActiveTab("view");
      toast.success(`Extracted text from ${result.totalPages} page(s)!`);
    } catch (error) {
      console.error("Extraction error:", error);
      toast.error("Failed to extract text. The PDF may be corrupted or encrypted.");
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setProgressMessage("");
    }
  };

  // Handle copy action
  const handleCopy = () => {
    setPendingAction("copy");
    setShowAdModal(true);
  };

  // Handle download action
  const handleDownload = () => {
    setPendingAction("download");
    setShowAdModal(true);
  };

  // Execute action after ad
  const executeAction = () => {
    setShowAdModal(false);

    if (pendingAction === "copy") {
      copyText();
    } else if (pendingAction === "download") {
      downloadText();
    }

    setPendingAction(null);
  };

  // Copy text to clipboard
  const copyText = () => {
    if (!extractionResult) return;

    let content = "";
    switch (exportFormat) {
      case "txt":
        content = toPlainText(extractionResult);
        break;
      case "html":
        content = toHTML(extractionResult);
        break;
      case "rtf":
        content = toRTF(extractionResult);
        break;
    }

    navigator.clipboard.writeText(content);
    toast.success("Text copied to clipboard!");
  };

  // Download text file
  const downloadText = () => {
    if (!extractionResult || !file) return;

    let content = "";
    let mimeType = "text/plain";
    let extension = "txt";

    switch (exportFormat) {
      case "txt":
        content = toPlainText(extractionResult);
        mimeType = "text/plain";
        extension = "txt";
        break;
      case "html":
        content = toHTML(extractionResult);
        mimeType = "text/html";
        extension = "html";
        break;
      case "rtf":
        content = toRTF(extractionResult);
        mimeType = "application/rtf";
        extension = "rtf";
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${file.name.replace(".pdf", "")}_extracted.${extension}`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("File downloaded!");
  };

  // Reset
  const reset = () => {
    setFile(null);
    setExtractionResult(null);
    setCurrentPage(0);
    setSearchQuery("");
    setActiveTab("upload");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Breadcrumbs
  const breadcrumbItems = BREADCRUMB_PRESETS.pdfTools("PDF to Text", "/tools/pdf-to-text");

  // Get plain text for display
  const getPlainText = () => {
    if (!extractionResult) return "";
    return toPlainText(extractionResult);
  };

  // Get raw text content
  const getRawText = () => {
    if (!extractionResult) return "";
    return extractionResult.pages.map((p) => p.rawText).join("\n\n---\n\n");
  };

  // Calculate word count
  const getWordCount = () => {
    if (!extractionResult) return 0;
    const text = extractionResult.pages.map((p) => p.rawText).join(" ");
    return text.split(/\s+/).filter(Boolean).length;
  };

  // Calculate character count
  const getCharCount = () => {
    if (!extractionResult) return 0;
    return extractionResult.pages.map((p) => p.rawText).join("").length;
  };

  return (
    <>
      <SEOHead
        title="PDF to Text Converter - Extract Text with Formatting | ToolMaster"
        description="Free online PDF to text converter that preserves fonts, styles, and formatting. Extract text from PDF with original typography, export to TXT, HTML, or RTF. 100% free, works in your browser."
        keywords="pdf to text, extract text from pdf, pdf text extractor, pdf converter, convert pdf to text, pdf to txt, pdf to html, pdf formatting, pdf fonts, free pdf tool"
        canonical="https://toolmaster.cloud/tools/pdf-to-text"
      />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7382531001943020"
          crossOrigin="anonymous"
        />

        <div className="container mx-auto px-4 py-4 lg:py-6">
          {/* Breadcrumbs */}
          <Breadcrumbs items={breadcrumbItems} />

          {/* Main Layout */}
          <div className="flex gap-4">
            {/* Left Sidebar Ads */}
            <aside className="hidden 2xl:flex flex-col gap-4 w-[300px] flex-shrink-0">
              <div className="sticky top-4 space-y-4">
                <SidebarAd slot={AD_SLOTS.leftSidebar1} position="left" index={1} />
                <SidebarAd slot={AD_SLOTS.leftSidebar2} position="left" index={2} />
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    PDF to Text Converter
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Extract text with original fonts, styles, and formatting
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="hidden sm:flex gap-1">
                    <Shield className="h-3 w-3" />
                    Private
                  </Badge>
                  <Badge variant="outline" className="hidden sm:flex gap-1">
                    <Zap className="h-3 w-3" />
                    Fast
                  </Badge>
                </div>
              </div>

              {/* Main Card */}
              <Card className="overflow-hidden">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <div className="border-b px-4">
                    <TabsList className="h-12 bg-transparent gap-2">
                      <TabsTrigger value="upload" className="data-[state=active]:bg-primary/10">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </TabsTrigger>
                      <TabsTrigger
                        value="view"
                        disabled={!extractionResult}
                        className="data-[state=active]:bg-primary/10"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </TabsTrigger>
                      <TabsTrigger
                        value="fonts"
                        disabled={!extractionResult}
                        className="data-[state=active]:bg-primary/10"
                      >
                        <Type className="h-4 w-4 mr-2" />
                        Fonts
                      </TabsTrigger>
                      <TabsTrigger
                        value="export"
                        disabled={!extractionResult}
                        className="data-[state=active]:bg-primary/10"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  {/* Upload Tab */}
                  <TabsContent value="upload" className="p-6 m-0">
                    <div className="max-w-xl mx-auto space-y-6">
                      {/* File Drop Zone */}
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        onDrop={handleDrop}
                        onDragOver={(e) => e.preventDefault()}
                        className={`
                          border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
                          transition-all duration-200
                          ${file ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:border-primary hover:bg-primary/5"}
                        `}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,application/pdf"
                          onChange={handleFileChange}
                          className="hidden"
                        />

                        {file ? (
                          <div className="space-y-3">
                            <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
                              <FileText className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{file.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                reset();
                              }}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center mx-auto">
                              <Upload className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium">Drop your PDF here</p>
                              <p className="text-sm text-muted-foreground">
                                or click to browse (Max 50MB)
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Progress */}
                      {isProcessing && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{progressMessage}</span>
                            <span className="font-medium">{Math.round(progress)}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      )}

                      {/* Extract Button */}
                      <Button
                        size="lg"
                        className="w-full"
                        onClick={extractText}
                        disabled={!file || isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Extracting...
                          </>
                        ) : (
                          <>
                            <FileText className="h-4 w-4 mr-2" />
                            Extract Text with Formatting
                          </>
                        )}
                      </Button>

                      {/* Info */}
                      <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                        <h4 className="font-medium text-sm text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                          <Info className="h-4 w-4" />
                          What This Tool Extracts
                        </h4>
                        <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                          <li>✓ Text content with original positioning</li>
                          <li>✓ Font families, sizes, and weights</li>
                          <li>✓ Bold, italic, and other styles</li>
                          <li>✓ Text colors (when available)</li>
                          <li>✓ Document metadata</li>
                        </ul>
                      </div>
                    </div>

                    {/* In-Feed Ad */}
                    <div className="mt-8">
                      <InFeedAd slot={AD_SLOTS.inFeed1} />
                    </div>
                  </TabsContent>

                  {/* View Tab */}
                  <TabsContent value="view" className="m-0">
                    {extractionResult && (
                      <div className="flex flex-col lg:flex-row h-[500px]">
                        {/* Left Panel - Controls */}
                        <div className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r shrink-0 p-4 space-y-4">
                          {/* View Mode */}
                          <div className="space-y-2">
                            <Label className="text-xs">View Mode</Label>
                            <div className="grid grid-cols-3 gap-1">
                              <Button
                                variant={viewMode === "styled" ? "default" : "outline"}
                                size="sm"
                                className="text-xs"
                                onClick={() => setViewMode("styled")}
                              >
                                <Layers className="h-3 w-3 mr-1" />
                                Styled
                              </Button>
                              <Button
                                variant={viewMode === "plain" ? "default" : "outline"}
                                size="sm"
                                className="text-xs"
                                onClick={() => setViewMode("plain")}
                              >
                                <List className="h-3 w-3 mr-1" />
                                Plain
                              </Button>
                              <Button
                                variant={viewMode === "raw" ? "default" : "outline"}
                                size="sm"
                                className="text-xs"
                                onClick={() => setViewMode("raw")}
                              >
                                <Code className="h-3 w-3 mr-1" />
                                Raw
                              </Button>
                            </div>
                          </div>

                          {/* Search */}
                          <div className="space-y-2">
                            <Label className="text-xs">Search</Label>
                            <div className="relative">
                              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search text..."
                                className="h-8 pl-8 text-sm"
                              />
                              {searchQuery && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                                  onClick={() => setSearchQuery("")}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="space-y-2">
                            <Label className="text-xs">Document Stats</Label>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="p-2 bg-muted/50 rounded">
                                <div className="font-bold text-lg">{extractionResult.totalPages}</div>
                                <div className="text-muted-foreground">Pages</div>
                              </div>
                              <div className="p-2 bg-muted/50 rounded">
                                <div className="font-bold text-lg">{getWordCount().toLocaleString()}</div>
                                <div className="text-muted-foreground">Words</div>
                              </div>
                              <div className="p-2 bg-muted/50 rounded">
                                <div className="font-bold text-lg">{getCharCount().toLocaleString()}</div>
                                <div className="text-muted-foreground">Characters</div>
                              </div>
                              <div className="p-2 bg-muted/50 rounded">
                                <div className="font-bold text-lg">{extractionResult.fonts.size}</div>
                                <div className="text-muted-foreground">Fonts</div>
                              </div>
                            </div>
                          </div>

                          {/* Metadata */}
                          {extractionResult.metadata.title && (
                            <div className="space-y-1">
                              <Label className="text-xs">Metadata</Label>
                              <div className="text-xs space-y-1 p-2 bg-muted/50 rounded">
                                {extractionResult.metadata.title && (
                                  <div className="truncate">
                                    <span className="text-muted-foreground">Title:</span>{" "}
                                    {extractionResult.metadata.title}
                                  </div>
                                )}
                                {extractionResult.metadata.author && (
                                  <div className="truncate">
                                    <span className="text-muted-foreground">Author:</span>{" "}
                                    {extractionResult.metadata.author}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Right Panel - Content */}
                        <div className="flex-1 min-w-0 flex flex-col">
                          {viewMode === "styled" ? (
                            <StyledTextViewer
                              pages={extractionResult.pages}
                              currentPage={currentPage}
                              onPageChange={setCurrentPage}
                              zoom={zoom}
                              onZoomChange={setZoom}
                              searchQuery={searchQuery}
                            />
                          ) : (
                            <ScrollArea className="flex-1">
                              <pre
                                className="p-4 text-sm whitespace-pre-wrap font-mono"
                                style={{ fontSize: `${14 * zoom}px` }}
                              >
                                {viewMode === "plain" ? getPlainText() : getRawText()}
                              </pre>
                            </ScrollArea>
                          )}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  {/* Fonts Tab */}
                  <TabsContent value="fonts" className="m-0 p-4">
                    {extractionResult && (
                      <div className="max-w-2xl mx-auto">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          <Type className="h-5 w-5 text-primary" />
                          Detected Fonts
                        </h3>
                        <FontInfoPanel fonts={extractionResult.fonts} />
                      </div>
                    )}
                  </TabsContent>

                  {/* Export Tab */}
                  <TabsContent value="export" className="p-6 m-0">
                    {extractionResult && (
                      <div className="max-w-md mx-auto space-y-6">
                        {/* Format Selection */}
                        <div className="space-y-3">
                          <Label>Export Format</Label>
                          <div className="grid grid-cols-3 gap-3">
                            {[
                              { value: "txt", label: "Plain Text", icon: FileText, desc: ".txt" },
                              { value: "html", label: "HTML", icon: FileCode, desc: ".html (styled)" },
                              { value: "rtf", label: "RTF", icon: FileImage, desc: ".rtf (Word)" },
                            ].map((format) => (
                              <Button
                                key={format.value}
                                variant={exportFormat === format.value ? "default" : "outline"}
                                className="flex flex-col h-20 gap-1"
                                onClick={() => setExportFormat(format.value as ExportFormat)}
                              >
                                <format.icon className="h-5 w-5" />
                                <span className="text-xs font-medium">{format.label}</span>
                                <span className="text-xs opacity-70">{format.desc}</span>
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* Format Info */}
                        <div className="p-4 bg-muted/50 rounded-lg text-sm">
                          {exportFormat === "txt" && (
                            <p>Plain text format preserves content only. Best for simple text extraction.</p>
                          )}
                          {exportFormat === "html" && (
                            <p>HTML format preserves fonts, sizes, colors, and styling. Opens in any browser.</p>
                          )}
                          {exportFormat === "rtf" && (
                            <p>RTF format preserves basic formatting. Compatible with Word and other editors.</p>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-3">
                          <Button variant="outline" onClick={handleCopy} className="h-12">
                            <Copy className="h-4 w-4 mr-2" />
                            Copy to Clipboard
                          </Button>
                          <Button onClick={handleDownload} className="h-12">
                            <Download className="h-4 w-4 mr-2" />
                            Download File
                          </Button>
                        </div>

                        {/* In-Feed Ad */}
                        <InFeedAd slot={AD_SLOTS.inFeed2} className="mt-6" />
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </Card>

              {/* Features */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {[
                  { icon: Type, title: "Preserves Fonts", desc: "Original typography" },
                  { icon: Layers, title: "Styled Output", desc: "Colors & weights" },
                  { icon: FileCode, title: "Multiple Formats", desc: "TXT, HTML, RTF" },
                  { icon: Shield, title: "100% Private", desc: "Browser processing" },
                ].map((feature) => (
                  <Card key={feature.title} className="p-4">
                    <feature.icon className="h-8 w-8 mb-2 text-primary" />
                    <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground">{feature.desc}</p>
                  </Card>
                ))}
              </div>

              {/* SEO Content */}
              <Card className="mt-6 p-6">
                <h2 className="text-xl font-bold mb-4">Advanced PDF to Text Converter</h2>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <p>
                    Our advanced PDF to Text converter extracts text while preserving original
                    formatting, fonts, and styles. Unlike basic converters, we maintain the visual
                    appearance of your document.
                  </p>
                  <h3>Key Features</h3>
                  <ul>
                    <li><strong>Font Preservation:</strong> Detects and maps PDF fonts to web fonts</li>
                    <li><strong>Style Retention:</strong> Keeps bold, italic, sizes, and colors</li>
                    <li><strong>Multiple Exports:</strong> Plain text, styled HTML, or RTF format</li>
                    <li><strong>Page Navigation:</strong> Browse through multi-page documents</li>
                    <li><strong>Search Function:</strong> Find text within extracted content</li>
                    <li><strong>Privacy First:</strong> All processing happens in your browser</li>
                  </ul>
                </div>
              </Card>

              {/* Related Tools */}
              <div className="mt-6">
                <h3 className="font-semibold mb-4">Related Tools</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { name: "PDF Splitter", path: "/tools/pdf-splitter" },
                    { name: "PDF Merger", path: "/tools/pdf-merger" },
                    { name: "Word Counter", path: "/tools/word-counter" },
                    { name: "PDF Compressor", path: "/tools/pdf-compressor" },
                  ].map((tool) => (
                    <Link
                      key={tool.path}
                      to={tool.path}
                      className="block p-3 bg-muted/50 rounded-lg hover:bg-primary/5 transition-colors text-sm font-medium text-center"
                    >
                      {tool.name}
                    </Link>
                  ))}
                </div>
              </div>
            </main>

            {/* Right Sidebar Ads */}
            <aside className="hidden 2xl:flex flex-col gap-4 w-[300px] flex-shrink-0">
              <div className="sticky top-4 space-y-4">
                <SidebarAd slot={AD_SLOTS.rightSidebar1} position="right" index={1} />
                <SidebarAd slot={AD_SLOTS.rightSidebar2} position="right" index={2} />
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Ad Watch Modal */}
      <AdWatchModal
        open={showAdModal}
        onOpenChange={(open) => {
          setShowAdModal(open);
          if (!open) setPendingAction(null);
        }}
        onAdWatched={executeAction}
        title="Watch Ad to Continue"
        description={`Watch this short ad to ${pendingAction === "copy" ? "copy" : "download"} the extracted text`}
      />
    </>
  );
};

export default PDFToText;