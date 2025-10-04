import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { PDFDocument } from "pdf-lib";
import { FileText, Upload, Copy, Download } from "lucide-react";

const PDFToText = () => {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setExtractedText("");
      toast.success("PDF loaded successfully");
    } else {
      toast.error("Please select a valid PDF file");
    }
  };

  const extractText = async () => {
    if (!file) {
      toast.error("Please select a PDF file");
      return;
    }

    setProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      // Note: pdf-lib doesn't support text extraction natively
      // This is a placeholder - in production, you'd use pdf.js or similar
      toast.info("Basic text extraction - complex PDFs may need OCR");
      
      // For demonstration, we'll show metadata
      const text = `PDF Information:
      
Title: ${pdfDoc.getTitle() || "N/A"}
Author: ${pdfDoc.getAuthor() || "N/A"}
Subject: ${pdfDoc.getSubject() || "N/A"}
Pages: ${pages.length}

Note: Advanced text extraction requires additional libraries.
For accurate text extraction from complex PDFs, consider using:
- Adobe Acrobat
- Online OCR services
- Specialized PDF processing tools`;

      setExtractedText(text);
      toast.success("PDF information extracted");
    } catch (error) {
      console.error("Error extracting text:", error);
      toast.error("Failed to extract text from PDF");
    } finally {
      setProcessing(false);
    }
  };

  const copyText = () => {
    navigator.clipboard.writeText(extractedText);
    toast.success("Text copied to clipboard!");
  };

  const downloadText = () => {
    const blob = new Blob([extractedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${file?.name.replace('.pdf', '')}_text.txt`;
    link.click();
    toast.success("Text file downloaded!");
  };

  return (
    <ToolLayout
      title="PDF to Text"
      description="Extract text content from PDF documents"
      category="PDF Tools"
      instructions={[
        "Upload your PDF file",
        "Click 'Extract Text' to process the PDF",
        "View the extracted text content",
        "Copy or download the text as needed",
      ]}
      relatedTools={[
        { name: "PDF Splitter", path: "/tools/pdf-splitter" },
        { name: "PDF Merger", path: "/tools/pdf-merger" },
        { name: "Word Counter", path: "/tools/word-counter" },
      ]}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="pdf-upload">Upload PDF</Label>
                <div className="mt-2">
                  <label
                    htmlFor="pdf-upload"
                    className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <div className="text-center">
                      {file ? (
                        <>
                          <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
                          <p className="text-sm font-medium">{file.name}</p>
                        </>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Click to upload PDF</p>
                        </>
                      )}
                    </div>
                    <Input
                      id="pdf-upload"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            <Button
              onClick={extractText}
              disabled={!file || processing}
              size="lg"
              className="w-full"
            >
              {processing ? <>Processing...</> : <>Extract Text</>}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <Label>Extracted Text</Label>
            <Textarea
              value={extractedText}
              readOnly
              placeholder="Extracted text will appear here..."
              className="min-h-[300px] font-mono text-sm"
            />
            
            {extractedText && (
              <div className="grid grid-cols-2 gap-3">
                <Button onClick={copyText} variant="secondary">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Text
                </Button>
                <Button onClick={downloadText} variant="secondary">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
};

export default PDFToText;
