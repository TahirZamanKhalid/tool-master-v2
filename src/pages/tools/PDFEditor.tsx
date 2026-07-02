import { useState, useRef, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import * as pdfjsLib from "pdfjs-dist";
import PdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?worker";
import {
  FileText, Download, Upload, Bold, Italic, Underline,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Heading1, Heading2, Loader2
} from "lucide-react";
import { AdWatchModal } from "@/components/AdWatchModal";
import { SEOHead } from "@/components/SEOHead";

// Set up PDF.js worker from the local bundle so editing works without a CDN.
pdfjsLib.GlobalWorkerOptions.workerPort = new PdfWorker();

const PDFEditor = () => {
  const [fileName, setFileName] = useState("");
  const [showAdModal, setShowAdModal] = useState(false);
  const [canDownload, setCanDownload] = useState(false);
  const [fontSize, setFontSize] = useState("16");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [textColor, setTextColor] = useState("#000000");
  const [isLoading, setIsLoading] = useState(false);
  const [extractedContent, setExtractedContent] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update editor content when extracted content changes
  useEffect(() => {
    if (extractedContent && editorRef.current && !isLoading) {
      // Use setTimeout to avoid React render conflicts
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.innerHTML = extractedContent;
        }
      }, 100);
    }
  }, [extractedContent, isLoading]);

  const escapeHtml = (text: string): string => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name.replace('.pdf', ''));

    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      setIsLoading(true);
      setExtractedContent(""); // Clear previous content

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
          htmlContent += `<div style="margin-bottom: 40px; padding: 20px; background: white; position: relative; page-break-after: always;">`;

          // Sort items by vertical position (y coordinate)
          const items = textContent.items.filter((item: any) => item.str && item.str.trim()).sort((a: any, b: any) => {
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
            if (!text || !text.trim()) return;

            const transform = item.transform;
            const y = viewport.height - transform[5]; // Convert to top-down coordinates
            const fontSize = Math.max(8, Math.min(72, Math.round(Math.abs(transform[0])))); // Clamp font size
            const fontName = item.fontName || "Arial";

            // Determine font family from PDF font name
            let detectedFontFamily = "Arial, sans-serif";
            if (fontName.toLowerCase().includes("times") || fontName.toLowerCase().includes("serif")) {
              detectedFontFamily = "Times New Roman, serif";
            } else if (fontName.toLowerCase().includes("courier") || fontName.toLowerCase().includes("mono")) {
              detectedFontFamily = "Courier New, monospace";
            } else if (fontName.toLowerCase().includes("georgia")) {
              detectedFontFamily = "Georgia, serif";
            } else if (fontName.toLowerCase().includes("verdana")) {
              detectedFontFamily = "Verdana, sans-serif";
            }

            // Detect bold and italic from font name
            const isBold = fontName.toLowerCase().includes("bold");
            const isItalic = fontName.toLowerCase().includes("italic") || fontName.toLowerCase().includes("oblique");

            // Check if this item is on a new line
            if (lastY !== -1 && Math.abs(y - lastY) > lineThreshold) {
              // New line - output current line
              if (currentLine.length > 0) {
                htmlContent += formatLine(currentLine);
                currentLine = [];
              }
            }

            currentLine.push({
              text: escapeHtml(text),
              fontSize,
              fontFamily: detectedFontFamily,
              isBold,
              isItalic
            });

            lastY = y;

            // Output last line
            if (index === items.length - 1 && currentLine.length > 0) {
              htmlContent += formatLine(currentLine);
            }
          });

          htmlContent += `</div>`;
        }

        // Set content and wait for loading to finish
        setExtractedContent(htmlContent || '<p style="font-size: 16px; line-height: 1.6;">No text content found in PDF.</p>');
        toast.success("PDF loaded with original styling! You can now edit the content.");
      } catch (error) {
        console.error("Error loading PDF:", error);
        toast.error("Failed to load PDF. Try uploading a text-based PDF.");
        setExtractedContent('<p style="font-size: 16px; line-height: 1.6; color: #ef4444;">Error loading PDF. Please try a different file.</p>');
      } finally {
        setIsLoading(false);
      }
    } else {
      toast.error("Please upload a PDF file");
    }

    e.target.value = "";
  };

  const formatLine = (lineItems: any[]): string => {
    if (lineItems.length === 0) return "";

    const avgFontSize = lineItems.reduce((sum, item) => sum + item.fontSize, 0) / lineItems.length;
    const lineHeight = Math.max(avgFontSize * 1.4, 12);

    let lineHtml = `<p style="margin: 0 0 ${lineHeight * 0.2}px 0; padding: 0; line-height: ${lineHeight}px; min-height: ${lineHeight}px;">`;

    lineItems.forEach(item => {
      let style = `font-size: ${item.fontSize}px; font-family: '${item.fontFamily}';`;
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
    if (!editorRef.current?.innerHTML.trim() || editorRef.current.innerHTML.includes("Start typing here")) {
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
    setExtractedContent('<p style="font-size: 16px; line-height: 1.6;"><br></p>');
    setFileName("new-document");
    toast.success("New document created");
    setTimeout(() => {
      editorRef.current?.focus();
    }, 150);
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
                <div className="flex items-center justify-center min-h-[400px]">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Extracting PDF with original styling...</p>
                    <p className="text-xs text-muted-foreground mt-2">This may take a few moments</p>
                  </div>
                </div>
              ) : (
                !extractedContent && (
                  <p>
                    <span style={{ color: "#9ca3af" }}>
                      Start typing here or upload a PDF to edit with preserved styling...
                    </span>
                  </p>
                )
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
                <ul className="list-disc list-inside space-y-1">
                  <li>Click "Upload PDF" to load a PDF file</li>
                  <li>Text is extracted with <strong>original styling preserved</strong></li>
                  <li>Fonts, sizes, bold, italic are maintained</li>
                  <li>Edit like a Word document</li>
                  <li>Download as new PDF when done</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Creating New Documents:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Click "New Document" to start fresh</li>
                  <li>Type and format text like in Word</li>
                  <li>Use toolbar for formatting options</li>
                  <li>Download as PDF when complete</li>
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
