import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { PDFDocument } from "pdf-lib";
import { FileText, Download, Upload, Scissors } from "lucide-react";
import { AdSpace } from "@/components/AdSpace";
import { AdWatchModal } from "@/components/AdWatchModal";

const PDFSplitter = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageRanges, setPageRanges] = useState("");
  const [processing, setProcessing] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [showAdModal, setShowAdModal] = useState(false);
  const [splitPdfData, setSplitPdfData] = useState<Uint8Array | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      
      // Get page count
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      setPageCount(pdfDoc.getPageCount());
      toast.success(`PDF loaded: ${pdfDoc.getPageCount()} pages`);
    } else {
      toast.error("Please select a valid PDF file");
    }
  };

  const parsePageRanges = (ranges: string, totalPages: number): number[] => {
    const pages: Set<number> = new Set();
    const parts = ranges.split(',').map(p => p.trim());
    
    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(n => parseInt(n.trim()));
        for (let i = start; i <= Math.min(end, totalPages); i++) {
          if (i > 0) pages.add(i - 1); // Convert to 0-indexed
        }
      } else {
        const page = parseInt(part);
        if (page > 0 && page <= totalPages) {
          pages.add(page - 1); // Convert to 0-indexed
        }
      }
    }
    
    return Array.from(pages).sort((a, b) => a - b);
  };

  const splitPDF = async () => {
    if (!file) {
      toast.error("Please select a PDF file");
      return;
    }

    if (!pageRanges.trim()) {
      toast.error("Please enter page ranges (e.g., 1-3, 5, 7-10)");
      return;
    }

    setProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const totalPages = pdfDoc.getPageCount();

      const pages = parsePageRanges(pageRanges, totalPages);
      
      if (pages.length === 0) {
        toast.error("No valid pages selected");
        setProcessing(false);
        return;
      }

      // Create new PDF with selected pages
      const newPdf = await PDFDocument.create();
      const copiedPages = await newPdf.copyPages(pdfDoc, pages);
      copiedPages.forEach(page => newPdf.addPage(page));

      const pdfBytes = await newPdf.save();
      setSplitPdfData(pdfBytes);
      setShowAdModal(true);
    } catch (error) {
      console.error("Error splitting PDF:", error);
      toast.error("Failed to split PDF");
    } finally {
      setProcessing(false);
    }
  };

  const handleAdWatched = () => {
    setShowAdModal(false);
    if (splitPdfData && file) {
      downloadPDF(splitPdfData);
    }
  };

  const downloadPDF = (pdfBytes: Uint8Array) => {
    const blob = new Blob([pdfBytes as unknown as Blob], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `split_${file?.name}`;
    link.click();

    const pages = parsePageRanges(pageRanges, pageCount);
    toast.success(`PDF split successfully! ${pages.length} pages extracted.`);
    setSplitPdfData(null);
  };

  return (
    <ToolLayout
      title="PDF Splitter"
      description="Extract specific pages from PDF documents"
      category="PDF Tools"
      instructions={[
        "Upload your PDF file",
        "Enter page ranges (e.g., 1-5, 10, 15-20)",
        "Click 'Split PDF' to extract selected pages",
        "Download the new PDF with only the selected pages",
      ]}
      relatedTools={[
        { name: "PDF Merger", path: "/tools/pdf-merger" },
        { name: "PDF Compressor", path: "/tools/pdf-compressor" },
        { name: "PDF to Text", path: "/tools/pdf-to-text" },
      ]}
    >
      <AdSpace size="leaderboard" className="mb-6" />
      
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
                        <p className="text-xs text-muted-foreground">{pageCount} pages</p>
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

            {file && (
              <div>
                <Label htmlFor="page-ranges">Page Ranges</Label>
                <Input
                  id="page-ranges"
                  placeholder="e.g., 1-5, 10, 15-20"
                  value={pageRanges}
                  onChange={(e) => setPageRanges(e.target.value)}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter page numbers or ranges, separated by commas. Total pages: {pageCount}
                </p>
              </div>
            )}
          </div>

          <Button
            onClick={splitPDF}
            disabled={!file || processing}
            size="lg"
            className="w-full"
          >
            {processing ? (
              <>Processing...</>
            ) : (
              <>
                <Scissors className="h-4 w-4 mr-2" />
                Watch Ad to Split PDF
              </>
            )}
          </Button>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>💡 <strong>Tips:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Use ranges like "1-10" to select pages 1 through 10</li>
              <li>Separate multiple ranges with commas: "1-3, 5, 10-15"</li>
              <li>All processing happens locally in your browser</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <AdSpace size="leaderboard" className="mt-6" />

      <AdWatchModal
        open={showAdModal}
        onOpenChange={(open) => {
          setShowAdModal(open);
          if (!open) setSplitPdfData(null);
        }}
        onAdWatched={handleAdWatched}
        title="Watch Ad to Continue"
        description="Watch this short ad to download your split PDF"
      />
    </ToolLayout>
  );
};

export default PDFSplitter;
