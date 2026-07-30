import { useState, useRef } from "react";
import { SEOHead } from "@/components/SEOHead";
import { ToolLayout } from "@/components/ToolLayout";
import { ProcessingOverlay } from "@/components/ProcessingOverlay";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Download, FileDown, X, ArrowUp, ArrowDown, ShieldCheck, Zap, FileText, CheckCircle2, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PDFDocument } from "pdf-lib";
import { AdWatchModal } from "@/components/AdWatchModal";
import { AdRow } from "@/components/AdRow";

const PDFMerger = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSkip, setShowSkip] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const [mergedPdfData, setMergedPdfData] = useState<Uint8Array | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const pdfFiles = selectedFiles.filter((file) => file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"));

    if (pdfFiles.length !== selectedFiles.length) {
      toast({
        title: "Warning",
        description: "Only PDF files are allowed",
        variant: "destructive",
      });
    }

    setFiles((prev) => [...prev, ...pdfFiles]);
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const moveFile = (index: number, direction: "up" | "down") => {
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= files.length) return;

    setFiles((prev) => {
      const next = [...prev];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  };

  const mergePDFs = async () => {
    if (files.length < 2) {
      toast({
        title: "Error",
        description: "Please select at least 2 PDF files",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setShowSkip(false);

    try {
      setTimeout(() => setShowSkip(true), 3000);

      const mergedPdf = await PDFDocument.create();

      for (let i = 0; i < files.length; i++) {
        setProgress(Math.round(((i + 1) / files.length) * 80));

        const arrayBuffer = await files[i].arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      setProgress(90);
      const mergedPdfBytes = await mergedPdf.save();
      setProgress(100);

      setMergedPdfData(mergedPdfBytes);
      setShowAdModal(true);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to merge PDFs. Please check if your PDF files are password protected.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleAdWatched = () => {
    setShowAdModal(false);
    if (mergedPdfData) {
      downloadPDF(mergedPdfData);
    }
  };

  const downloadPDF = (pdfBytes: Uint8Array) => {
    const blob = new Blob([pdfBytes as unknown as Blob], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "merged-document.pdf";
    link.click();

    toast({
      title: "Success!",
      description: "PDFs merged successfully",
    });
    setMergedPdfData(null);
  };

  const customFAQs = [
    {
      question: "Is this online PDF Merger 100% free?",
      answer: "Yes! ToolMasterPro's PDF Merger is completely free to use with no account creation, no subscriptions, and no added watermarks.",
    },
    {
      question: "Are my PDF documents safe and private?",
      answer: "100% yes! All PDF merging takes place entirely inside your web browser using WebAssembly and client-side JavaScript. Your confidential files are never uploaded to any server.",
    },
    {
      question: "Is there a limit on how many PDF files I can merge?",
      answer: "No! You can upload and combine as many PDF files as you need. There are no restrictions on page counts or file numbers.",
    },
    {
      question: "Can I reorder files before combining them?",
      answer: "Yes! Use the up and down arrow controls next to each uploaded PDF file to arrange them in your exact desired order before merging.",
    },
    {
      question: "Does this tool work on mobile devices?",
      answer: "Yes, ToolMasterPro is fully responsive and works on iPhone, Android, iPad, Mac, Windows, and Linux without installing software.",
    },
  ];

  const featuresList = [
    "100% Browser-Based Security — Files Never Leave Your Device",
    "Combine Unlimited PDF Files into One Single Document",
    "Reorder & Arrange PDFs with Instant Controls",
    "Preserves High Resolution Images, Formatting & Vector Graphics",
    "No Software Installation or Registration Required",
  ];

  const extraContent = (
    <div className="space-y-10 mt-10 text-foreground">
      {/* Privacy & Security Feature Card */}
      <section className="bg-card border border-border/60 rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-xl text-primary shrink-0">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">100% Secure & Client-Side PDF Processing</h3>
            <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
              Unlike traditional online PDF tools that require uploading your private files to third-party servers,
              ToolMasterPro merges your documents <strong>locally in your browser</strong> using client-side WebAssembly technology.
              Your financial statements, legal contracts, and personal records remain 100% confidential.
            </p>
          </div>
        </div>
      </section>

      {/* Practical Use Cases */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black mb-2">Common Use Cases for PDF Merger</h2>
          <p className="text-muted-foreground text-sm md:text-base">
            Streamline your daily document management across professional, academic, and personal workflows.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl border border-border/50 bg-card/60 space-y-2">
            <div className="flex items-center gap-2 font-bold text-primary">
              <FileText className="h-5 w-5" />
              <span>Business & Accounting</span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              Combine monthly invoices, purchase orders, receipts, and expense summaries into one organized PDF for easy tax filing and auditing.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-border/50 bg-card/60 space-y-2">
            <div className="flex items-center gap-2 font-bold text-primary">
              <ShieldCheck className="h-5 w-5" />
              <span>Legal & Contracts</span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              Merge client agreements, non-disclosure agreements (NDAs), appendices, and signature pages into a unified legal document.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-border/50 bg-card/60 space-y-2">
            <div className="flex items-center gap-2 font-bold text-primary">
              <Zap className="h-5 w-5" />
              <span>Academic & Education</span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              Join chapter drafts, research papers, assignment sheets, and study guides into a single comprehensive ebook or study file.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-border/50 bg-card/60 space-y-2">
            <div className="flex items-center gap-2 font-bold text-primary">
              <CheckCircle2 className="h-5 w-5" />
              <span>Job Applications & HR</span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              Bundle your resume, cover letter, portfolio samples, and reference letters into a clean single PDF attachment for recruiters.
            </p>
          </div>
        </div>
      </section>
    </div>
  );

  return (
    <>
      <SEOHead
        title="Free Online PDF Merger - Combine Multiple PDFs Fast | ToolMasterPro"
        description="Best free online PDF merger tool. Combine multiple PDF documents into a single file easily and securely in your browser. 100% free, private, no signup required."
        keywords="pdf merger, combine pdf, merge pdf files, online pdf tool, free pdf merger, join pdf documents"
        canonical="https://toolmaster.cloud/tools/pdf-merger"
      />
      <ToolLayout
        title="PDF Merger"
        description="Combine multiple PDF files into a single organized document instantly and securely."
        category="PDF Tools"
        instructions={[
          "Upload 2 or more PDF files using drag & drop or the file selector.",
          "Reorder your files using the Up and Down buttons to get the exact sequence.",
          "Click 'Watch Ad to Merge PDFs' to process your files in the browser.",
          "Download your combined single PDF file instantly.",
        ]}
        features={featuresList}
        customFAQs={customFAQs}
        extraContent={extraContent}
        relatedTools={[
          { name: "PDF Splitter", path: "/tools/pdf-splitter" },
          { name: "PDF Compressor", path: "/tools/pdf-compressor" },
          { name: "PDF to Text", path: "/tools/pdf-to-text" },
          { name: "Images to PDF", path: "/tools/images-to-pdf" },
        ]}
      >
        <AdRow className="mb-6" />

        <Card className="p-6 space-y-6">
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-xl p-10 md:p-14 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all duration-200"
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-primary" />
              <p className="text-lg font-bold mb-1">Click or Drag & Drop PDF files here</p>
              <p className="text-sm text-muted-foreground">
                Select 2 or more PDF documents to combine into a single file
              </p>
            </div>

            {files.length > 0 && (
              <div className="space-y-2.5">
                <p className="font-bold text-sm text-foreground">{files.length} PDF file(s) selected:</p>
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3.5 bg-muted/60 border border-border/50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <FileDown className="h-5 w-5 text-primary shrink-0" />
                      <div>
                        <p className="font-semibold text-sm line-clamp-1">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveFile(index, "up")}
                        disabled={index === 0}
                        title="Move up"
                        className="h-8 w-8 p-0"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveFile(index, "down")}
                        disabled={index === files.length - 1}
                        title="Move down"
                        className="h-8 w-8 p-0"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        title="Remove file"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-4 justify-center pt-2">
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              size="lg"
              className="rounded-xl font-semibold"
            >
              <Upload className="h-4 w-4 mr-2" />
              Add More Files
            </Button>

            {files.length >= 2 && (
              <Button
                onClick={mergePDFs}
                disabled={isProcessing}
                size="lg"
                className="gradient-primary border-0 font-bold shadow-md shadow-primary/25 rounded-xl"
              >
                <Download className="h-4 w-4 mr-2" />
                Watch Ad to Merge PDFs
              </Button>
            )}
          </div>
        </Card>

        <AdRow className="mt-6" />
      </ToolLayout>

      {isProcessing && (
        <ProcessingOverlay
          message="Merging your PDF files..."
          progress={progress}
          showSkip={showSkip}
          onSkip={() => setIsProcessing(false)}
        />
      )}

      <AdWatchModal
        open={showAdModal}
        onOpenChange={(open) => {
          setShowAdModal(open);
          if (!open) setMergedPdfData(null);
        }}
        onAdWatched={handleAdWatched}
        title="Watch Ad to Continue"
        description="Watch this short ad to download your merged PDF document."
      />
    </>
  );
};

export default PDFMerger;
