import { useState, useRef, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import { FileText, Download, Upload, Type, Highlighter, Eraser, MousePointer, Undo, Redo, ZoomIn, ZoomOut } from "lucide-react";
import { AdWatchModal } from "@/components/AdWatchModal";

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface Annotation {
  type: "text" | "highlight" | "draw";
  page: number;
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  color?: string;
  fontSize?: number;
  points?: { x: number; y: number }[];
}

const PDFEditor = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [tool, setTool] = useState<"select" | "text" | "highlight" | "draw" | "eraser">("select");
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [undoStack, setUndoStack] = useState<Annotation[][]>([]);
  const [redoStack, setRedoStack] = useState<Annotation[][]>([]);
  const [textInput, setTextInput] = useState("");
  const [textColor, setTextColor] = useState("#000000");
  const [textSize, setTextSize] = useState(16);
  const [highlightColor, setHighlightColor] = useState("#FFFF00");
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDrawPoints, setCurrentDrawPoints] = useState<{ x: number; y: number }[]>([]);
  const [showAdModal, setShowAdModal] = useState(false);
  const [canDownload, setCanDownload] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (file && pdfDoc) {
      renderPage(currentPage);
    }
  }, [currentPage, zoom, pdfDoc, annotations]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      const arrayBuffer = await selectedFile.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);
      setPdfData(data);

      const loadingTask = pdfjsLib.getDocument({ data });
      const pdf = await loadingTask.promise;
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      setCurrentPage(1);
      setAnnotations([]);
      setUndoStack([]);
      setRedoStack([]);
      toast.success("PDF loaded successfully");
    } else {
      toast.error("Please select a valid PDF file");
    }
  };

  const renderPage = async (pageNumber: number) => {
    if (!pdfDoc || !canvasRef.current) return;

    const page = await pdfDoc.getPage(pageNumber);
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;

    const viewport = page.getViewport({ scale: zoom });
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;

    // Draw annotations for current page
    const pageAnnotations = annotations.filter(a => a.page === pageNumber);
    pageAnnotations.forEach(annotation => {
      if (annotation.type === "text" && annotation.text) {
        context.fillStyle = annotation.color || "#000000";
        context.font = `${(annotation.fontSize || 16) * zoom}px Arial`;
        context.fillText(annotation.text, annotation.x * zoom, annotation.y * zoom);
      } else if (annotation.type === "highlight" && annotation.width && annotation.height) {
        context.fillStyle = annotation.color || "#FFFF0080";
        context.fillRect(
          annotation.x * zoom,
          annotation.y * zoom,
          annotation.width * zoom,
          annotation.height * zoom
        );
      } else if (annotation.type === "draw" && annotation.points && annotation.points.length > 1) {
        context.strokeStyle = annotation.color || "#000000";
        context.lineWidth = 2 * zoom;
        context.lineCap = "round";
        context.lineJoin = "round";
        context.beginPath();
        context.moveTo(annotation.points[0].x * zoom, annotation.points[0].y * zoom);
        annotation.points.forEach(point => {
          context.lineTo(point.x * zoom, point.y * zoom);
        });
        context.stroke();
      }
    });
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || tool === "select") return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    if (tool === "text" && textInput) {
      addAnnotation({
        type: "text",
        page: currentPage,
        x,
        y,
        text: textInput,
        color: textColor,
        fontSize: textSize,
      });
      setTextInput("");
    } else if (tool === "highlight") {
      addAnnotation({
        type: "highlight",
        page: currentPage,
        x,
        y,
        width: 100,
        height: 20,
        color: highlightColor + "80",
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool !== "draw" || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    setIsDrawing(true);
    setCurrentDrawPoints([{ x, y }]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || tool !== "draw" || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    setCurrentDrawPoints(prev => [...prev, { x, y }]);

    // Draw temporarily
    const context = canvasRef.current.getContext("2d");
    if (context && currentDrawPoints.length > 0) {
      context.strokeStyle = textColor;
      context.lineWidth = 2 * zoom;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.beginPath();
      const last = currentDrawPoints[currentDrawPoints.length - 1];
      context.moveTo(last.x * zoom, last.y * zoom);
      context.lineTo(x * zoom, y * zoom);
      context.stroke();
    }
  };

  const handleMouseUp = () => {
    if (isDrawing && tool === "draw" && currentDrawPoints.length > 1) {
      addAnnotation({
        type: "draw",
        page: currentPage,
        x: 0,
        y: 0,
        points: currentDrawPoints,
        color: textColor,
      });
    }
    setIsDrawing(false);
    setCurrentDrawPoints([]);
  };

  const addAnnotation = (annotation: Annotation) => {
    setUndoStack(prev => [...prev, annotations]);
    setAnnotations(prev => [...prev, annotation]);
    setRedoStack([]);
  };

  const undo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setRedoStack(prev => [...prev, annotations]);
    setAnnotations(previous);
    setUndoStack(prev => prev.slice(0, -1));
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack(prev => [...prev, annotations]);
    setAnnotations(next);
    setRedoStack(prev => prev.slice(0, -1));
  };

  const clearAnnotations = () => {
    if (annotations.length === 0) return;
    setUndoStack(prev => [...prev, annotations]);
    setAnnotations([]);
    setRedoStack([]);
    toast.success("All annotations cleared");
  };

  const handleDownload = () => {
    if (!canDownload) {
      setShowAdModal(true);
      return;
    }
    performDownload();
  };

  const performDownload = async () => {
    if (!pdfData) {
      toast.error("No PDF loaded");
      return;
    }

    try {
      const pdfDoc = await PDFDocument.load(pdfData);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      // Apply annotations to PDF
      for (const annotation of annotations) {
        const page = pdfDoc.getPage(annotation.page - 1);
        const { height } = page.getSize();

        if (annotation.type === "text" && annotation.text) {
          page.drawText(annotation.text, {
            x: annotation.x,
            y: height - annotation.y,
            size: annotation.fontSize || 16,
            font: font,
            color: hexToRgb(annotation.color || "#000000"),
          });
        } else if (annotation.type === "highlight" && annotation.width && annotation.height) {
          page.drawRectangle({
            x: annotation.x,
            y: height - annotation.y - annotation.height,
            width: annotation.width,
            height: annotation.height,
            color: hexToRgb(annotation.color || "#FFFF0080"),
            opacity: 0.5,
          });
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `edited_${file?.name || "document.pdf"}`;
      link.click();

      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("Error saving PDF:", error);
      toast.error("Failed to save PDF");
    }
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})/i.exec(hex);
    return result
      ? rgb(
          parseInt(result[1], 16) / 255,
          parseInt(result[2], 16) / 255,
          parseInt(result[3], 16) / 255
        )
      : rgb(0, 0, 0);
  };

  const handleAdWatched = () => {
    setCanDownload(true);
    toast.success("Ad watched! You can now download your edited PDF.");
    performDownload();
  };

  return (
    <ToolLayout
      title="Online PDF Editor"
      description="Edit PDF files online - add text, highlights, and annotations. Free online PDF editor with no signup required."
      category="PDF Tools"
      instructions={[
        "Upload your PDF file",
        "Select a tool (text, highlight, or draw)",
        "Click on the PDF to add annotations",
        "Navigate between pages and zoom as needed",
        "Watch a short ad to download your edited PDF"
      ]}
      relatedTools={[
        { name: "PDF Merger", path: "/tools/pdf-merger" },
        { name: "PDF Splitter", path: "/tools/pdf-splitter" },
        { name: "PDF Compressor", path: "/tools/pdf-compressor" }
      ]}
    >
      <div className="grid gap-6">
        <Card>
          <CardContent className="p-6 space-y-6">
            <div>
              <Label htmlFor="pdf-upload">Upload PDF</Label>
              <Input
                id="pdf-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="mt-2"
              />
            </div>

            {file && (
              <>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => setTool("select")}
                    variant={tool === "select" ? "default" : "outline"}
                    size="sm"
                  >
                    <MousePointer className="h-4 w-4 mr-2" />
                    Select
                  </Button>
                  <Button
                    onClick={() => setTool("text")}
                    variant={tool === "text" ? "default" : "outline"}
                    size="sm"
                  >
                    <Type className="h-4 w-4 mr-2" />
                    Text
                  </Button>
                  <Button
                    onClick={() => setTool("highlight")}
                    variant={tool === "highlight" ? "default" : "outline"}
                    size="sm"
                  >
                    <Highlighter className="h-4 w-4 mr-2" />
                    Highlight
                  </Button>
                  <Button
                    onClick={() => setTool("draw")}
                    variant={tool === "draw" ? "default" : "outline"}
                    size="sm"
                  >
                    Draw
                  </Button>
                  <Button onClick={undo} variant="outline" size="sm" disabled={undoStack.length === 0}>
                    <Undo className="h-4 w-4" />
                  </Button>
                  <Button onClick={redo} variant="outline" size="sm" disabled={redoStack.length === 0}>
                    <Redo className="h-4 w-4" />
                  </Button>
                  <Button onClick={clearAnnotations} variant="outline" size="sm">
                    <Eraser className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                </div>

                {tool === "text" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="text-input">Text</Label>
                      <Input
                        id="text-input"
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="Enter text..."
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="text-color">Color</Label>
                      <Input
                        id="text-color"
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="mt-2 h-10"
                      />
                    </div>
                    <div>
                      <Label>Size: {textSize}px</Label>
                      <Slider
                        value={[textSize]}
                        onValueChange={(value) => setTextSize(value[0])}
                        min={8}
                        max={48}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                  </div>
                )}

                {tool === "highlight" && (
                  <div>
                    <Label htmlFor="highlight-color">Highlight Color</Label>
                    <Input
                      id="highlight-color"
                      type="color"
                      value={highlightColor}
                      onChange={(e) => setHighlightColor(e.target.value)}
                      className="mt-2 h-10 w-32"
                    />
                  </div>
                )}

                {(tool === "draw") && (
                  <div>
                    <Label htmlFor="draw-color">Draw Color</Label>
                    <Input
                      id="draw-color"
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="mt-2 h-10 w-32"
                    />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {pdfDoc && (
          <Card className="border-primary/20">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    size="sm"
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    size="sm"
                  >
                    Next
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                    size="sm"
                    variant="outline"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">{Math.round(zoom * 100)}%</span>
                  <Button
                    onClick={() => setZoom(Math.min(2, zoom + 0.25))}
                    size="sm"
                    variant="outline"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg overflow-auto bg-gray-100 dark:bg-gray-900" style={{ maxHeight: "600px" }}>
                <canvas
                  ref={canvasRef}
                  onClick={handleCanvasClick}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  className="cursor-crosshair mx-auto"
                  style={{ display: "block" }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {annotations.length} annotation{annotations.length !== 1 ? "s" : ""} added
                </div>
                <Button onClick={handleDownload} size="lg">
                  <Download className="h-4 w-4 mr-2" />
                  Download Edited PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">PDF Editor Features</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Text Tool:</strong> Add custom text anywhere on your PDF pages</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Highlight Tool:</strong> Mark important sections with colored highlights</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Draw Tool:</strong> Free-hand drawing for signatures and annotations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Undo/Redo:</strong> Easy correction of mistakes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Multi-page:</strong> Navigate and edit all pages in your PDF</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Privacy:</strong> All editing happens in your browser - files are not uploaded</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <AdWatchModal
        open={showAdModal}
        onOpenChange={setShowAdModal}
        onAdWatched={handleAdWatched}
        title="Watch Ad to Download"
        description="Please watch this short ad to download your edited PDF"
        adDuration={5}
      />
    </ToolLayout>
  );
};

export default PDFEditor;
