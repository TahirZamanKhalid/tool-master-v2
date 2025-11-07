import { useState, useRef } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import * as pdfjsLib from "pdfjs-dist";
import {
  FileText, Download, Upload, Bold, Italic, Underline,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Heading1, Heading2, Loader2
} from "lucide-react";
import { AdWatchModal } from "@/components/AdWatchModal";
import { SEOHead } from "@/components/SEOHead";

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const PDFEditor = () => {
  const [fileName, setFileName] = useState("");
  const [showAdModal, setShowAdModal] = useState(false);
  const [canDownload, setCanDownload] = useState(false);
  const [fontSize, setFontSize] = useState("16");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [textColor, setTextColor] = useState("#000000");
  const [isLoading, setIsLoading] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name.replace('.pdf', ''));

    if (file.type === "application/pdf") {
      setIsLoading(true);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        let htmlContent = "";

        // Extract text with styling from all pages
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          const viewport = page.getViewport({ scale: 1.0 });

          // Create a page container
          htmlContent += `<div style="margin-bottom: 40px; padding: 20px; background: white; min-height: 297mm; position: relative;">`;

          // Sort items by vertical position (y coordinate)
          const items = textContent.items.sort((a: any, b: any) => {
            // Group by lines (items with similar y coordinates)
            const yDiff = Math.abs(a.transform[5] - b.transform[5]);
            if (yDiff < 5) {
              // Same line, sort by x
              return a.transform[4] - b.transform[4];
            }
            // Different lines, sort by y (descending because PDF coords are bottom-up)
            return b.transform[5] - a.transform[5];
          });

          let currentLine: any[] = [];
          let lastY = -1;
          const lineThreshold = 5; // pixels to consider same line

          items.forEach((item: any, index: number) => {
            const text = item.str;
            if (!text.trim()) return;

            const transform = item.transform;
            const x = transform[4];
            const y = viewport.height - transform[5]; // Convert to top-down coordinates
            const fontSize = Math.round(transform[0]);
            const fontName = item.fontName || "Arial";

            // Determine font family from PDF font name
            let fontFamily = "Arial";
            if (fontName.includes("Times") || fontName.includes("Serif")) {
              fontFamily = "Times New Roman";
            } else if (fontName.includes("Courier") || fontName.includes("Mono")) {
              fontFamily = "Courier New";
            } else if (fontName.includes("Georgia")) {
              fontFamily = "Georgia";
            } else if (fontName.includes("Verdana")) {
              fontFamily = "Verdana";
            }

            // Detect bold and italic from font name
            const isBold = fontName.includes("Bold");
            const isItalic = fontName.includes("Italic") || fontName.includes("Oblique");

            // Check if this item is on a new line
            if (lastY !== -1 && Math.abs(y - lastY) > lineThreshold) {
              // New line - output current line
              if (currentLine.length > 0) {
                htmlContent += formatLine(currentLine);
                currentLine = [];
              }
            }

            currentLine.push({
              text,
              fontSize,
              fontFamily,
              isBold,
              isItalic,
              x,
              y
            });

            lastY = y;

            // Output last line
            if (index === items.length - 1 && currentLine.length > 0) {
              htmlContent += formatLine(currentLine);
            }
          });

          htmlContent += `</div>`;
        }

        if (editorRef.current) {
          editorRef.current.innerHTML = htmlContent;
        }

        toast.success("PDF loaded with original styling! You can now edit the content.");
      } catch (error) {
        console.error("Error loading PDF:", error);
        toast.error("Failed to load PDF. Try uploading a text-based PDF.");
      } finally {
        setIsLoading(false);
      }
    } else {
      toast.error("Please upload a PDF file");
    }
  };

  const formatLine = (lineItems: any[]): string => {
    if (lineItems.length === 0) return "";

    const avgFontSize = lineItems.reduce((sum, item) => sum + item.fontSize, 0) / lineItems.length;
    const lineHeight = avgFontSize * 1.5;

    let lineHtml = `<p style="margin: 0; padding: 0; line-height: ${lineHeight}px; min-height: ${lineHeight}px;">`;

    lineItems.forEach(item => {
      let style = `font-size: ${item.fontSize}px; font-family: ${item.fontFamily};`;
      if (item.isBold) style += " font-weight: bold;";
      if (item.isItalic) style += " font-style: italic;";

      lineHtml += `<span style="${style}">${item.text}</span>`;
    });

    lineHtml += "</p>";
    return lineHtml;
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleFontSizeChange = (value: string) => {
    setFontSize(value);
    execCommand("fontSize", "7");
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const span = document.createElement("span");
      span.style.fontSize = value + "px";
      try {
        range.surroundContents(span);
      } catch (e) {
        // If can't surround, just apply to future text
      }
    }
  };

  const handleFontFamilyChange = (value: string) => {
    setFontFamily(value);
    execCommand("fontName", value);
  };

  const handleTextColorChange = (color: string) => {
    setTextColor(color);
    execCommand("foreColor", color);
  };

  const insertHeading = (level: 1 | 2) => {
    const size = level === 1 ? "32" : "24";
    execCommand("fontSize", "7");
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const heading = document.createElement(level === 1 ? "h1" : "h2");
      heading.style.fontSize = size + "px";
      heading.style.fontWeight = "bold";
      heading.style.marginTop = "16px";
      heading.style.marginBottom = "8px";
      try {
        range.surroundContents(heading);
      } catch (e) {
        console.error("Could not insert heading");
      }
    }
  };

  const handleDownload = () => {
    if (!editorRef.current?.innerHTML.trim()) {
      toast.error("Please add some content or upload a PDF first");
      return;
    }

    if (!canDownload) {
      setShowAdModal(true);
      return;
    }

    generatePDF();
  };

  const generatePDF = () => {
    if (!editorRef.current) return;

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - (margin * 2);
      let yPos = margin;

      // Get all the text content
      const content = editorRef.current.innerText;
      const lines = content.split('\n');

      doc.setFontSize(12);

      lines.forEach((line) => {
        if (line.trim()) {
          const textLines = doc.splitTextToSize(line, maxWidth);

          textLines.forEach((textLine: string) => {
            if (yPos > pageHeight - margin) {
              doc.addPage();
              yPos = margin;
            }
            doc.text(textLine, margin, yPos);
            yPos += 7;
          });

          yPos += 3; // Paragraph spacing
        }
      });

      doc.save(`${fileName || 'edited-document'}.pdf`);
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    }
  };

  const createNewDocument = () => {
    if (editorRef.current) {
      editorRef.current.innerHTML = '<p style="font-size: 16px; line-height: 1.6;"><br></p>';
      setFileName("new-document");
      editorRef.current.focus();
      toast.success("New document created");
    }
  };

  return (
    <>
      <SEOHead
        title="PDF Editor - Edit PDF Documents Online Like Word"
        description="Edit PDF files online with our powerful editor. Preserves original formatting. Works like Microsoft Word."
        keywords="pdf editor, edit pdf, pdf text editor, online pdf editor, modify pdf"
        canonical="https://toolmaster.cloud/tools/pdf-editor"
      />
      <ToolLayout
        title="PDF Editor"
        description="Edit PDF documents like Microsoft Word - preserves original formatting and styling"
        category="PDF Tools"
        instructions={[
          "Upload a PDF to extract text with original styling",
          "Or start with a blank document",
          "Use the toolbar to format text (bold, italic, fonts, colors)",
          "Edit content directly in the editor",
          "Download your edited document as PDF"
        ]}
        relatedTools={[
          { name: "PDF Merger", path: "/tools/pdf-merger" },
          { name: "PDF Splitter", path: "/tools/pdf-splitter" },
          { name: "Resume Builder", path: "/tools/resume-builder" }
        ]}
      >
        <Card>
          <CardContent className="p-6 space-y-4">
            {/* Toolbar */}
            <div className="space-y-4">
              {/* File Operations */}
              <div className="flex flex-wrap gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isLoading}
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload PDF
                    </>
                  )}
                </Button>
                <Button
                  onClick={createNewDocument}
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  New Document
                </Button>
                <Button
                  onClick={handleDownload}
                  size="sm"
                  className="ml-auto"
                  disabled={isLoading}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>

              <Separator />

              {/* Text Formatting Toolbar */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Font Family */}
                <Select value={fontFamily} onValueChange={handleFontFamilyChange}>
                  <SelectTrigger className="w-[140px] h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Arial">Arial</SelectItem>
                    <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                    <SelectItem value="Courier New">Courier New</SelectItem>
                    <SelectItem value="Georgia">Georgia</SelectItem>
                    <SelectItem value="Verdana">Verdana</SelectItem>
                    <SelectItem value="Comic Sans MS">Comic Sans MS</SelectItem>
                  </SelectContent>
                </Select>

                {/* Font Size */}
                <Select value={fontSize} onValueChange={handleFontSizeChange}>
                  <SelectTrigger className="w-[80px] h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="12">12</SelectItem>
                    <SelectItem value="14">14</SelectItem>
                    <SelectItem value="16">16</SelectItem>
                    <SelectItem value="18">18</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="24">24</SelectItem>
                    <SelectItem value="28">28</SelectItem>
                    <SelectItem value="32">32</SelectItem>
                    <SelectItem value="36">36</SelectItem>
                  </SelectContent>
                </Select>

                <div className="h-6 w-px bg-border mx-1" />

                {/* Text Style Buttons */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => execCommand("bold")}
                  className="h-9 w-9 p-0"
                  title="Bold (Ctrl+B)"
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => execCommand("italic")}
                  className="h-9 w-9 p-0"
                  title="Italic (Ctrl+I)"
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => execCommand("underline")}
                  className="h-9 w-9 p-0"
                  title="Underline (Ctrl+U)"
                >
                  <Underline className="h-4 w-4" />
                </Button>

                <div className="h-6 w-px bg-border mx-1" />

                {/* Text Color */}
                <div className="flex items-center gap-2">
                  <Label className="text-xs">Color:</Label>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => handleTextColorChange(e.target.value)}
                    className="h-9 w-16 cursor-pointer rounded border"
                    title="Text Color"
                  />
                </div>

                <div className="h-6 w-px bg-border mx-1" />

                {/* Alignment */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => execCommand("justifyLeft")}
                  className="h-9 w-9 p-0"
                  title="Align Left"
                >
                  <AlignLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => execCommand("justifyCenter")}
                  className="h-9 w-9 p-0"
                  title="Align Center"
                >
                  <AlignCenter className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => execCommand("justifyRight")}
                  className="h-9 w-9 p-0"
                  title="Align Right"
                >
                  <AlignRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => execCommand("justifyFull")}
                  className="h-9 w-9 p-0"
                  title="Justify"
                >
                  <AlignJustify className="h-4 w-4" />
                </Button>

                <div className="h-6 w-px bg-border mx-1" />

                {/* Lists */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => execCommand("insertUnorderedList")}
                  className="h-9 w-9 p-0"
                  title="Bullet List"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => execCommand("insertOrderedList")}
                  className="h-9 w-9 p-0"
                  title="Numbered List"
                >
                  <ListOrdered className="h-4 w-4" />
                </Button>

                <div className="h-6 w-px bg-border mx-1" />

                {/* Headings */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => insertHeading(1)}
                  className="h-9 px-2"
                  title="Heading 1"
                >
                  <Heading1 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => insertHeading(2)}
                  className="h-9 px-2"
                  title="Heading 2"
                >
                  <Heading2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Editor */}
            <div
              ref={editorRef}
              contentEditable={!isLoading}
              className="min-h-[600px] w-full p-8 border-2 border-dashed rounded-lg focus:outline-none focus:border-primary bg-white text-black overflow-auto"
              style={{
                fontFamily: fontFamily,
                fontSize: fontSize + "px",
                lineHeight: "1.6",
                maxWidth: "210mm", // A4 width
                margin: "0 auto",
                boxShadow: "0 0 10px rgba(0,0,0,0.1)"
              }}
              suppressContentEditableWarning
            >
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Extracting PDF with original styling...</p>
                  </div>
                </div>
              ) : (
                <p>
                  <span style={{ color: "#9ca3af" }}>
                    Start typing here or upload a PDF to edit with preserved styling...
                  </span>
                </p>
              )}
            </div>

            <div className="text-sm text-muted-foreground">
              <strong>Tips:</strong> Use Ctrl+B for bold, Ctrl+I for italic, Ctrl+U for underline.
              This editor preserves original PDF fonts, sizes, and formatting when you upload!
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">How to Use PDF Editor</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Editing Existing PDFs:</h4>
                <ul className="space-y-1">
                  <li>• Click "Upload PDF" to load a PDF file</li>
                  <li>• Text is extracted with <strong>original styling preserved</strong></li>
                  <li>• Fonts, sizes, bold, italic are maintained</li>
                  <li>• Edit like a Word document</li>
                  <li>• Download as new PDF when done</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Creating New Documents:</h4>
                <ul className="space-y-1">
                  <li>• Click "New Document" to start fresh</li>
                  <li>• Type and format text like in Word</li>
                  <li>• Use toolbar for formatting options</li>
                  <li>• Download as PDF when complete</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </ToolLayout>

      <AdWatchModal
        open={showAdModal}
        onOpenChange={setShowAdModal}
        onAdWatched={() => {
          setCanDownload(true);
          setShowAdModal(false);
          generatePDF();
        }}
        title="Watch ad to download your PDF"
        description="Please watch this short ad to download your edited PDF document."
      />
    </>
  );
};

export default PDFEditor;
