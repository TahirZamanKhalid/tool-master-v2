import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Download, Upload, FileImage, Loader2, Check } from "lucide-react";
import * as pdfjsLib from 'pdfjs-dist';
import PdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?worker";

// Configure PDF.js worker from the local bundle so conversion works without a CDN.
pdfjsLib.GlobalWorkerOptions.workerPort = new PdfWorker();

const PDFToImages = () => {
  const [file, setFile] = useState<File | null>(null);
  const [converting, setConverting] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [format, setFormat] = useState<'png' | 'jpg'>('png');
  const [quality, setQuality] = useState<number>(1.5); // Scale factor

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && (selectedFile.type === "application/pdf" || selectedFile.name.toLowerCase().endsWith(".pdf"))) {
      setFile(selectedFile);
      setImages([]);
      toast.success("PDF loaded successfully!");
    } else {
      toast.error("Please select a valid PDF file");
    }
    e.target.value = "";
  };

  const convertToImages = async () => {
    if (!file) {
      toast.error("Please select a PDF file");
      return;
    }

    setConverting(true);
    setImages([]);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;

      const imageUrls: string[] = [];

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: quality });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) continue;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport,
          canvas: canvas
        }).promise;

        const imageUrl = canvas.toDataURL(format === 'jpg' ? 'image/jpeg' : 'image/png', 0.95);
        imageUrls.push(imageUrl);
      }

      setImages(imageUrls);
      toast.success(`Converted ${numPages} page${numPages > 1 ? 's' : ''} to images!`);
    } catch (error) {
      console.error("Error converting PDF:", error);
      toast.error("Failed to convert PDF to images");
    } finally {
      setConverting(false);
    }
  };

  const downloadImage = (imageUrl: string, index: number) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `page-${index + 1}.${format}`;
    link.click();
    toast.success(`Page ${index + 1} downloaded!`);
  };

  const downloadAllImages = () => {
    images.forEach((imageUrl, index) => {
      setTimeout(() => {
        downloadImage(imageUrl, index);
      }, index * 300); // Stagger downloads
    });
  };

  return (
    <ToolLayout
      title="PDF to Images Converter"
      description="Convert PDF pages to high-quality JPG or PNG images. Extract all pages from any PDF file instantly and download them individually or all at once."
      category="File Converters"
      instructions={[
        "Upload your PDF file",
        "Choose output format (PNG for quality, JPG for smaller files)",
        "Select image quality/resolution",
        "Click 'Convert to Images' to process all pages",
        "Download images individually or all at once"
      ]}
      relatedTools={[
        { name: "PDF to Text", path: "/tools/pdf-to-text" },
        { name: "PDF Splitter", path: "/tools/pdf-splitter" },
        { name: "Images to PDF", path: "/tools/images-to-pdf" }
      ]}
    >
      <div className="grid gap-6">
        <Card>
          <CardContent className="p-6 space-y-6">
            {/* File Upload */}
            <div>
              <Label htmlFor="pdf-file">Upload PDF File</Label>
              <div className="mt-2">
                <label
                  htmlFor="pdf-file"
                  className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <div className="text-center">
                    {file ? (
                      <>
                        <FileImage className="h-8 w-8 mx-auto mb-2 text-green-600" />
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
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
                    id="pdf-file"
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {file && !images.length && (
              <>
                {/* Format Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Output Format</Label>
                    <Select value={format} onValueChange={(value: 'png' | 'jpg') => setFormat(value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="png">PNG (Best Quality)</SelectItem>
                        <SelectItem value="jpg">JPG (Smaller Size)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Image Quality</Label>
                    <Select value={quality.toString()} onValueChange={(value) => setQuality(parseFloat(value))}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Standard (Faster)</SelectItem>
                        <SelectItem value="1.5">High (Recommended)</SelectItem>
                        <SelectItem value="2">Very High (Slower)</SelectItem>
                        <SelectItem value="3">Maximum</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Convert Button */}
                <Button
                  onClick={convertToImages}
                  disabled={converting}
                  size="lg"
                  className="w-full"
                >
                  {converting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Converting...
                    </>
                  ) : (
                    "Convert to Images"
                  )}
                </Button>
              </>
            )}

            {/* Images Preview and Download */}
            {images.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{images.length} Images Generated</h3>
                  <Button onClick={downloadAllImages} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download All
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto">
                  {images.map((imageUrl, index) => (
                    <Card key={index} className="overflow-hidden">
                      <CardContent className="p-3 space-y-2">
                        <div className="relative aspect-[3/4] border rounded overflow-hidden bg-muted">
                          <img
                            src={imageUrl}
                            alt={`Page ${index + 1}`}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <Button
                          onClick={() => downloadImage(imageUrl, index)}
                          size="sm"
                          className="w-full"
                        >
                          <Download className="h-3 w-3 mr-2" />
                          Page {index + 1}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Button
                  onClick={() => {
                    setFile(null);
                    setImages([]);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Convert Another PDF
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Why Use Our PDF to Images Converter?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span><strong>All Pages at Once:</strong> Convert entire PDF to images in one click</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span><strong>High Quality:</strong> Choose from standard to maximum resolution</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span><strong>100% Private:</strong> All conversion happens in your browser</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span><strong>No File Size Limit:</strong> Convert PDFs of any size</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span><strong>Format Choice:</strong> PNG for quality or JPG for smaller files</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Related Articles & Guides — internal link for SEO */}
      <section className="mt-12 mb-8 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold mb-4 text-foreground">Related Articles & Guides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <RouterLink
            to="/blog/pdf-to-images-converter"
            className="p-4 border border-border/60 rounded-lg bg-card/80 shadow-sm hover:shadow-card-hover transition-shadow no-underline block"
          >
            <span className="text-primary font-semibold hover:underline text-lg block">
              How to Convert PDF to JPG or PNG Images Online
            </span>
            <p className="text-muted-foreground mt-2 text-sm">
              Need to share a PDF document on social media or embed it in an email? Learn how to extract high-quality images from any PDF file instantly.
            </p>
          </RouterLink>
        </div>
      </section>
    </ToolLayout>
  );
};

export default PDFToImages;
