import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { PDFDocument } from "pdf-lib";
import { Upload, FileDown, X, ArrowUp, ArrowDown } from "lucide-react";
import { AdSpace } from "@/components/AdSpace";
import { AdWatchModal } from "@/components/AdWatchModal";

const ImagesToPDF = () => {
  const [images, setImages] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file =>
      file.type === 'image/jpeg' ||
      file.type === 'image/png' ||
      /\.(jpe?g|png)$/i.test(file.name)
    );
    
    if (imageFiles.length !== files.length) {
      toast.error("Only JPG and PNG files are supported. Other files were skipped.");
    }

    if (imageFiles.length === 0) {
      e.target.value = "";
      return;
    }

    setImages(prev => [...prev, ...imageFiles]);
    toast.success(`${imageFiles.length} image(s) added`);
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    toast.success("Image removed");
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const newImages = [...images];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < images.length) {
      [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
      setImages(newImages);
    }
  };

  const createPDF = async () => {
    if (images.length === 0) {
      toast.error("Please add at least one image");
      return;
    }

    setProcessing(true);

    try {
      const pdfDoc = await PDFDocument.create();

      let embeddedImages = 0;

      for (const imageFile of images) {
        const imageBytes = await imageFile.arrayBuffer();
        let image;

        if (imageFile.type === 'image/jpeg' || imageFile.type === 'image/jpg') {
          image = await pdfDoc.embedJpg(imageBytes);
        } else if (imageFile.type === 'image/png') {
          image = await pdfDoc.embedPng(imageBytes);
        } else {
          continue;
        }

        embeddedImages += 1;

        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        });
      }

      if (embeddedImages === 0) {
        throw new Error("No supported images found");
      }

      const pdfBytes = await pdfDoc.save();
      setPdfData(pdfBytes);
      setShowAdModal(true);
    } catch (error) {
      console.error("Error creating PDF:", error);
      toast.error("Failed to create PDF");
    } finally {
      setProcessing(false);
    }
  };

  const handleAdWatched = () => {
    setShowAdModal(false);
    if (pdfData) {
      downloadPDF(pdfData);
    }
  };

  const downloadPDF = (pdfBytes: Uint8Array) => {
    const blob = new Blob([pdfBytes as unknown as Blob], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `images_${Date.now()}.pdf`;
    link.click();

    toast.success(`PDF created with ${images.length} image(s)!`);
    setPdfData(null);
  };

  return (
    <ToolLayout
      title="Images to PDF"
      description="Convert multiple images into a single PDF document"
      category="PDF Tools"
      instructions={[
        "Upload one or more images (JPG, PNG)",
        "Reorder images using the arrow buttons",
        "Click 'Create PDF' to combine all images",
        "Download the generated PDF file",
      ]}
      relatedTools={[
        { name: "PDF Merger", path: "/tools/pdf-merger" },
        { name: "Image Size Reducer", path: "/tools/image-size-reducer" },
        { name: "PDF Splitter", path: "/tools/pdf-splitter" },
      ]}
    >
      <AdSpace size="leaderboard" className="mb-6" />
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6 space-y-6">
            <div>
              <Label htmlFor="image-upload">Upload Images</Label>
              <div className="mt-2">
                <label
                  htmlFor="image-upload"
                  className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <div className="text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Click to upload images</p>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG supported</p>
                  </div>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <Button
              onClick={createPDF}
              disabled={images.length === 0 || processing}
              size="lg"
              className="w-full"
            >
              {processing ? (
                <>Processing...</>
              ) : (
                <>
                  <FileDown className="h-4 w-4 mr-2" />
                  Watch Ad to Create PDF ({images.length} images)
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <Label>Images ({images.length})</Label>
            <div className="mt-2 space-y-2 max-h-[400px] overflow-y-auto">
              {images.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-12">
                  No images added yet
                </p>
              ) : (
                images.map((image, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-muted rounded-lg"
                  >
                    <img
                      src={URL.createObjectURL(image)}
                      alt={image.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{image.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(image.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => moveImage(index, 'up')}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => moveImage(index, 'down')}
                        disabled={index === images.length - 1}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <AdSpace size="leaderboard" className="mt-6" />

      <AdWatchModal
        open={showAdModal}
        onOpenChange={(open) => {
          setShowAdModal(open);
          if (!open) setPdfData(null);
        }}
        onAdWatched={handleAdWatched}
        title="Watch Ad to Continue"
        description="Watch this short ad to download your PDF"
      />
    </ToolLayout>
  );
};

export default ImagesToPDF;
