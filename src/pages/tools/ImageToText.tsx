import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Copy, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { AdSpace } from "@/components/AdSpace";
import Tesseract from "tesseract.js";

const ImageToText = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [extractedText, setExtractedText] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<number>(0);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/image\/(jpeg|jpg|png|webp|bmp)/)) {
      toast.error("Please select an image file (JPG, PNG, WebP, BMP)");
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    setExtractedText("");
    setProgress(0);
  };

  const extractText = async () => {
    if (!selectedFile || !previewUrl) {
      toast.error("Please select an image first");
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const result = await Tesseract.recognize(previewUrl, "eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      setExtractedText(result.data.text);
      toast.success("Text extracted successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to extract text from image");
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const copyText = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText);
    toast.success("Text copied to clipboard!");
  };

  return (
    <ToolLayout
      title="Image to Text Converter (OCR)"
      description="Extract text from images using powerful OCR technology - 100% free"
      category="Image Tools"
      instructions={[
        "Upload an image containing text (JPG, PNG, WebP, BMP)",
        "Click 'Extract Text' to start OCR processing",
        "Wait for the text recognition to complete",
        "Copy or download the extracted text",
        "Works offline - all processing happens in your browser"
      ]}
      relatedTools={[
        { name: "PDF to Text", path: "/tools/pdf-to-text" },
        { name: "Text to Speech", path: "/tools/text-to-speech" },
        { name: "Image Compressor", path: "/tools/image-compressor" }
      ]}
    >
      <AdSpace size="leaderboard" className="mb-6" />

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-6">
          <div>
            <Label>Upload Image</Label>
            <div className="mt-2">
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="h-12 w-12 mb-4 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">PNG, JPG, WebP, BMP (MAX. 10MB)</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileSelect}
                />
              </label>
            </div>
          </div>

          {previewUrl && (
            <div>
              <Label>Preview</Label>
              <div className="mt-2 border rounded-lg p-4 bg-white">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full h-auto rounded"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                File: {selectedFile?.name}
              </p>
            </div>
          )}

          <Button
            onClick={extractText}
            disabled={!selectedFile || isProcessing}
            size="lg"
            className="w-full"
          >
            <FileText className="h-4 w-4 mr-2" />
            {isProcessing ? `Extracting... ${progress}%` : "Extract Text"}
          </Button>
        </Card>

        <Card className="p-6 space-y-6">
          <div>
            <Label>Extracted Text</Label>
            {extractedText ? (
              <div className="mt-2 space-y-4">
                <textarea
                  value={extractedText}
                  onChange={(e) => setExtractedText(e.target.value)}
                  className="w-full h-96 p-4 border rounded-lg font-mono text-sm"
                  placeholder="Extracted text will appear here..."
                />
                <div className="flex gap-2">
                  <Button onClick={copyText} size="lg" className="flex-1">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Text
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-2 flex items-center justify-center h-96 border-2 border-dashed rounded-lg bg-muted/20">
                <div className="text-center text-muted-foreground">
                  <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Extracted text will appear here</p>
                  <p className="text-sm mt-2">Upload an image to start</p>
                </div>
              </div>
            )}
          </div>

          <div className="text-sm text-muted-foreground space-y-2">
            <p className="font-semibold">Tips for best results:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Use high-resolution images</li>
              <li>Ensure good lighting and contrast</li>
              <li>Text should be clearly visible</li>
              <li>Avoid blurry or distorted images</li>
              <li>Supports English language OCR</li>
            </ul>
          </div>
        </Card>
      </div>

      <AdSpace size="leaderboard" className="mt-6" />
    </ToolLayout>
  );
};

export default ImageToText;
