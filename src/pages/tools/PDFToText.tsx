import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import PdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?worker";
import { FileText, Upload, Copy, Download } from "lucide-react";
import { AdSpace } from "@/components/AdSpace";
import { AdWatchModal } from "@/components/AdWatchModal";

// Configure PDF.js worker (Vite)
GlobalWorkerOptions.workerPort = new PdfWorker();

const PDFToText = () => {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [processing, setProcessing] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'copy' | 'download' | null>(null);

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
      const loadingTask = getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      let fullText = "";
      const numPages = pdf.numPages;

      // Extract text from each page
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");
        
        fullText += `\n--- Page ${pageNum} ---\n${pageText}\n`;
      }

      if (!fullText.trim()) {
        toast.info("No text found. PDF may contain only images or scanned content.");
        setExtractedText("No text content found in this PDF. The document may contain only images or be a scanned document.");
      } else {
        setExtractedText(fullText.trim());
        toast.success(`Text extracted from ${numPages} page(s)!`);
      }
    } catch (error) {
      console.error("Error extracting text:", error);
      toast.error("Failed to extract text from PDF");
    } finally {
      setProcessing(false);
    }
  };

  const handleCopyClick = () => {
    setPendingAction('copy');
    setShowAdModal(true);
  };

  const handleDownloadClick = () => {
    setPendingAction('download');
    setShowAdModal(true);
  };

  const handleAdWatched = () => {
    setShowAdModal(false);
    if (pendingAction === 'copy') {
      copyText();
    } else if (pendingAction === 'download') {
      downloadText();
    }
    setPendingAction(null);
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
      <AdSpace className="mb-6" />
      
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
            <pre
              aria-label="Extracted text (copy disabled)"
              className="min-h-[300px] font-mono text-sm whitespace-pre-wrap break-words select-none cursor-not-allowed bg-muted/50 p-3 rounded"
              onCopy={(e) => { e.preventDefault(); toast.info("Use \"Watch Ad to Copy\" to copy text"); }}
              onContextMenu={(e) => { e.preventDefault(); toast.info("Copying is disabled. Use the copy button"); }}
              
            >
              {extractedText || "Extracted text will appear here..."}
            </pre>
            
            {extractedText && (
              <div className="grid grid-cols-2 gap-3">
                <Button onClick={handleCopyClick} variant="secondary">
                  <Copy className="h-4 w-4 mr-2" />
                  Watch Ad to Copy
                </Button>
                <Button onClick={handleDownloadClick} variant="secondary">
                  <Download className="h-4 w-4 mr-2" />
                  Watch Ad to Download
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <AdSpace className="mt-6" />

      <AdWatchModal
        open={showAdModal}
        onOpenChange={(open) => {
          setShowAdModal(open);
          if (!open) setPendingAction(null);
        }}
        onAdWatched={handleAdWatched}
        title="Watch Ad to Continue"
        description={`Watch this short ad to ${pendingAction === 'copy' ? 'copy' : 'download'} the extracted text`}
      />
    </ToolLayout>
  );
};

export default PDFToText;
