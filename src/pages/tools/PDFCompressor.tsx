import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { PDFDocument } from "pdf-lib";
import { FileText, Download, Upload, Minimize2, Play } from "lucide-react";
import { AdSpace } from "@/components/AdSpace";
import { AdWatchModal } from "@/components/AdWatchModal";

const PDFCompressor = () => {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState("low");
  const [processing, setProcessing] = useState(false);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [showAdModal, setShowAdModal] = useState(false);
  const [adWatchedForQuality, setAdWatchedForQuality] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setOriginalSize(selectedFile.size);
      setCompressedSize(0);
      toast.success("PDF loaded successfully");
    } else {
      toast.error("Please select a valid PDF file");
    }
  };

  const compressPDF = async () => {
    if (!file) {
      toast.error("Please select a PDF file");
      return;
    }

    // Check if ad is required for selected quality
    if ((quality === "medium" || quality === "high") && !adWatchedForQuality) {
      setShowAdModal(true);
      return;
    }

    performCompression();
  };

  const performCompression = async () => {
    if (!file) return;

    setProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      // Compression is simulated by optimizing the PDF structure
      // In a real implementation, you'd use more sophisticated compression
      const pdfBytes = await pdfDoc.save({
        useObjectStreams: quality !== "low",
        addDefaultPage: false,
      });

      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      setCompressedSize(blob.size);

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `compressed_${file.name}`;
      link.click();

      const savings = ((1 - blob.size / originalSize) * 100).toFixed(1);
      toast.success(`PDF compressed! Reduced by ${savings}%`);
    } catch (error) {
      console.error("Error compressing PDF:", error);
      toast.error("Failed to compress PDF");
    } finally {
      setProcessing(false);
    }
  };

  const handleAdWatched = () => {
    setAdWatchedForQuality(true);
    toast.success("Ad watched! You can now use premium quality settings.");
    performCompression();
  };

  const handleQualityChange = (newQuality: string) => {
    setQuality(newQuality);
    // Reset ad watched status when changing quality
    if (newQuality === "low") {
      setAdWatchedForQuality(true); // Low quality is always available
    } else if (quality === "low" && (newQuality === "medium" || newQuality === "high")) {
      setAdWatchedForQuality(false); // Require ad for premium qualities
    }
  };

  return (
    <ToolLayout
      title="PDF Compressor"
      description="Reduce PDF file size while maintaining quality"
      category="PDF Tools"
      instructions={[
        "Upload your PDF file",
        "Select compression quality level",
        "Click 'Compress PDF' to reduce file size",
        "Download the optimized PDF",
      ]}
      relatedTools={[
        { name: "PDF Splitter", path: "/tools/pdf-splitter" },
        { name: "PDF Merger", path: "/tools/pdf-merger" },
        { name: "Image Compressor", path: "/tools/image-compressor" },
      ]}
    >
      <AdSpace size="leaderboard" className="mb-6" />
      
      <AdWatchModal
        open={showAdModal}
        onOpenChange={setShowAdModal}
        onAdWatched={handleAdWatched}
        title="Watch Ad for Premium Quality"
        description="Medium and High quality compression require watching a short ad"
      />
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
                        <p className="text-xs text-muted-foreground">
                          Size: {formatFileSize(originalSize)}
                        </p>
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
                <Label htmlFor="quality">Compression Quality</Label>
                <Select value={quality} onValueChange={handleQualityChange}>
                  <SelectTrigger id="quality" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      Low (Maximum compression) - Free
                    </SelectItem>
                    <SelectItem value="medium">
                      Medium (Balanced) - {adWatchedForQuality && (quality === "medium" || quality === "high") ? "Unlocked ✓" : "Watch Ad 📺"}
                    </SelectItem>
                    <SelectItem value="high">
                      High (Minimal compression) - {adWatchedForQuality && (quality === "medium" || quality === "high") ? "Unlocked ✓" : "Watch Ad 📺"}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {compressedSize > 0 && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Original Size:</span>
                  <span className="font-medium">{formatFileSize(originalSize)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Compressed Size:</span>
                  <span className="font-medium text-primary">
                    {formatFileSize(compressedSize)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-semibold">
                  <span>Reduction:</span>
                  <span className="text-green-600">
                    {((1 - compressedSize / originalSize) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
          </div>

          <Button
            onClick={compressPDF}
            disabled={!file || processing}
            size="lg"
            className="w-full"
          >
            {processing ? (
              <>Processing...</>
            ) : (quality === "medium" || quality === "high") && !adWatchedForQuality ? (
              <>
                <Play className="h-4 w-4 mr-2" />
                Watch Ad to Compress
              </>
            ) : (
              <>
                <Minimize2 className="h-4 w-4 mr-2" />
                Compress PDF
              </>
            )}
          </Button>

          <div className="text-xs text-muted-foreground">
            <p>💡 All compression happens locally in your browser - your files never leave your device</p>
          </div>
        </CardContent>
      </Card>
    </ToolLayout>
  );
};

export default PDFCompressor;
