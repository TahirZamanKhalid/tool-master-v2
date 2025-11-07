import { useState, useRef } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import * as pdfjsLib from "pdfjs-dist";
import {
  FileText, Download, Upload, Bold, Italic, Underline,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Heading1, Heading2, Type
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
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name.replace('.pdf', ''));

    if (file.type === "application/pdf") {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        let extractedText = "";

        // Extract text from all pages
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(" ");
          extractedText += pageText + "\n\n";
        }

        if (editorRef.current) {
          // Set the extracted text with basic formatting
          editorRef.current.innerHTML = extractedText
            .split('\n\n')
            .map(para => para.trim())
            .filter(para => para.length > 0)
            .map(para => `<p style="margin-bottom: 12px;">${para}</p>`)
            .join('');
        }

        toast.success("PDF loaded! You can now edit the content.");
      } catch (error) {
        console.error("Error loading PDF:", error);
        toast.error("Failed to load PDF. Try uploading a text-based PDF.");
      }
    } else {
      toast.error("Please upload a PDF file");
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleFontSizeChange = (value: string) => {
    setFontSize(value);
    execCommand("fontSize", "7");
    // Wrap in span with actual size
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
      editorRef.current.innerHTML = '<p><br></p>';
      setFileName("new-document");
      editorRef.current.focus();
      toast.success("New document created");
    }
  };

  return (
    <>
      <SEOHead
        title="PDF Editor - Edit PDF Documents Online Like Word"
        description="Edit PDF files online with our powerful editor. Format text, add content, and download as PDF. Works like Microsoft Word."
        keywords="pdf editor, edit pdf, pdf text editor, online pdf editor, modify pdf"
        canonical="https://toolmaster.cloud/tools/pdf-editor"
      />
      <ToolLayout
        title="PDF Editor"
        description="Edit PDF documents like Microsoft Word - format text, add content, and download"
        category="PDF Tools"
        instructions={[
          "Upload a PDF to extract and edit its text",
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
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  size="sm"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload PDF
                </Button>
                <Button
                  onClick={createNewDocument}
                  variant="outline"
                  size="sm"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  New Document
                </Button>
                <Button
                  onClick={handleDownload}
                  size="sm"
                  className="ml-auto"
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
              contentEditable
              className="min-h-[600px] w-full p-8 border-2 border-dashed rounded-lg focus:outline-none focus:border-primary bg-white text-black"
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
              <p>
                <span style={{ color: "#9ca3af" }}>
                  Start typing here or upload a PDF to edit...
                </span>
              </p>
            </div>

            <div className="text-sm text-muted-foreground">
              <strong>Tips:</strong> Use Ctrl+B for bold, Ctrl+I for italic, Ctrl+U for underline.
              This editor works like Microsoft Word - format text, change fonts, add headings, and more!
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
                  <li>• Text will be extracted and editable</li>
                  <li>• Format, modify, and rearrange content</li>
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
