import { useState, useRef } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Download, Upload, Trash2, Files } from "lucide-react";
import JSZip from 'jszip';

interface ImageData {
  id: string;
  file: File;
  preview: string;
  originalSize: number;
  convertedBlob?: Blob;
  convertedSize?: number;
}

const WebPToPNG = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [resize, setResize] = useState<boolean>(false);
  const [resizeWidth, setResizeWidth] = useState<number>(1920);
  const [maintainAspect, setMaintainAspect] = useState<boolean>(true);
  const [converting, setConverting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file =>
      file.type === "image/webp" || file.name.toLowerCase().endsWith('.webp')
    );

    if (validFiles.length === 0) {
      toast.error("Please select WebP images");
      return;
    }

    const newImages: ImageData[] = [];

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData: ImageData = {
          id: `${Date.now()}-${Math.random()}`,
          file,
          preview: event.target?.result as string,
          originalSize: file.size,
        };
        newImages.push(imageData);

        if (newImages.length === validFiles.length) {
          setImages(prev => [...prev, ...newImages]);
          toast.success(`${validFiles.length} WebP image(s) loaded!`);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const convertImage = (imageData: ImageData): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) {
          reject(new Error("Canvas not available"));
          return;
        }

        // Calculate dimensions
        let targetWidth = img.width;
        let targetHeight = img.height;

        if (resize && resizeWidth && resizeWidth < img.width) {
          targetWidth = resizeWidth;
          if (maintainAspect) {
            targetHeight = Math.round((img.height / img.width) * resizeWidth);
          } else {
            targetHeight = img.height;
          }
        }

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error("Context not available"));
          return;
        }

        // Draw image (PNG supports transparency like WebP)
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        // Convert to PNG
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Conversion failed"));
            }
          },
          'image/png'
        );
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = imageData.preview;
    });
  };

  const convertAll = async () => {
    if (images.length === 0) {
      toast.error("Please select images first");
      return;
    }

    setConverting(true);

    try {
      const updatedImages = [...images];

      for (let i = 0; i < updatedImages.length; i++) {
        const blob = await convertImage(updatedImages[i]);
        updatedImages[i].convertedBlob = blob;
        updatedImages[i].convertedSize = blob.size;
      }

      setImages(updatedImages);
      toast.success(`Converted ${images.length} image(s) successfully!`);
    } catch (error) {
      console.error("Error converting images:", error);
      toast.error("Failed to convert images");
    } finally {
      setConverting(false);
    }
  };

  const downloadSingle = (imageData: ImageData) => {
    if (!imageData.convertedBlob) {
      toast.error("Please convert images first");
      return;
    }

    const url = URL.createObjectURL(imageData.convertedBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = imageData.file.name.replace(/\.webp$/i, '.png');
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${imageData.file.name}`);
  };

  const downloadAllAsZip = async () => {
    const convertedImages = images.filter(img => img.convertedBlob);

    if (convertedImages.length === 0) {
      toast.error("Please convert images first");
      return;
    }

    const zip = new JSZip();

    convertedImages.forEach((imageData) => {
      const fileName = imageData.file.name.replace(/\.webp$/i, '.png');
      zip.file(fileName, imageData.convertedBlob!);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `converted-images-${Date.now()}.zip`;
    link.click();
    URL.revokeObjectURL(link.href);
    toast.success(`Downloaded ${convertedImages.length} image(s) as ZIP`);
  };

  const downloadAllIndividually = () => {
    const convertedImages = images.filter(img => img.convertedBlob);

    if (convertedImages.length === 0) {
      toast.error("Please convert images first");
      return;
    }

    convertedImages.forEach((imageData, index) => {
      setTimeout(() => {
        downloadSingle(imageData);
      }, index * 300);
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const totalOriginalSize = images.reduce((sum, img) => sum + img.originalSize, 0);
  const totalConvertedSize = images.reduce((sum, img) => sum + (img.convertedSize || 0), 0);

  return (
    <ToolLayout
      title="WebP to PNG Converter"
      description="Convert WebP images to PNG format online. Batch processing, resize options, preserves transparency. Perfect for universal compatibility. 100% free and secure."
      category="File Converters"
      instructions={[
        "Upload one or more WebP images (batch processing supported)",
        "Optionally enable resize to reduce dimensions",
        "Click 'Convert All Images' to process",
        "PNG preserves transparency from WebP",
        "Download individually or all as ZIP"
      ]}
      relatedTools={[
        { name: "PNG to JPG", path: "/tools/png-to-jpg" },
        { name: "JPG to PNG", path: "/tools/jpg-to-png" },
        { name: "HEIC to PNG", path: "/tools/heic-to-png" },
        { name: "Image Size Reducer", path: "/tools/image-size-reducer" }
      ]}
    >
      <div className="grid gap-6">
        <Card>
          <CardContent className="p-6 space-y-6">
            {/* Image Upload */}
            <div>
              <Label htmlFor="webp-images">Upload WebP Images (Multiple Supported)</Label>
              <div className="mt-2">
                <label
                  htmlFor="webp-images"
                  className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <div className="text-center">
                    {images.length > 0 ? (
                      <>
                        <Files className="h-8 w-8 mx-auto mb-2 text-green-600" />
                        <p className="text-sm font-medium">{images.length} image(s) selected</p>
                        <p className="text-xs text-muted-foreground">
                          Total size: {formatFileSize(totalOriginalSize)}
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload WebP images
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Supports batch conversion
                        </p>
                      </>
                    )}
                  </div>
                  <Input
                    id="webp-images"
                    type="file"
                    accept="image/webp,.webp"
                    onChange={handleImageUpload}
                    className="hidden"
                    multiple
                  />
                </label>
              </div>
            </div>

            {/* Resize Options */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="resize-enable"
                  checked={resize}
                  onCheckedChange={(checked) => setResize(checked as boolean)}
                />
                <label
                  htmlFor="resize-enable"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Resize images during conversion
                </label>
              </div>

              {resize && (
                <>
                  <div>
                    <Label htmlFor="resize-width">Max Width (pixels)</Label>
                    <Input
                      id="resize-width"
                      type="number"
                      value={resizeWidth}
                      onChange={(e) => setResizeWidth(Number(e.target.value))}
                      min={100}
                      max={10000}
                      className="mt-2"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="maintain-aspect"
                      checked={maintainAspect}
                      onCheckedChange={(checked) => setMaintainAspect(checked as boolean)}
                    />
                    <label
                      htmlFor="maintain-aspect"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Maintain aspect ratio
                    </label>
                  </div>
                </>
              )}
            </div>

            {/* Convert Button */}
            <Button
              onClick={convertAll}
              disabled={images.length === 0 || converting}
              size="lg"
              className="w-full"
            >
              {converting ? "Converting..." : `Convert ${images.length > 0 ? `All ${images.length}` : ''} Image${images.length !== 1 ? 's' : ''}`}
            </Button>

            {/* Hidden Canvas */}
            <canvas ref={canvasRef} className="hidden" />
          </CardContent>
        </Card>

        {/* Images Preview and Management */}
        {images.length > 0 && (
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Images ({images.length})
                </h3>
                <Button
                  onClick={() => setImages([])}
                  variant="outline"
                  size="sm"
                >
                  Clear All
                </Button>
              </div>

              {/* Images Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {images.map((imageData) => (
                  <div
                    key={imageData.id}
                    className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30"
                  >
                    <img
                      src={imageData.preview}
                      alt={imageData.file.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{imageData.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(imageData.originalSize)}
                        {imageData.convertedSize && (
                          <> → {formatFileSize(imageData.convertedSize)}</>
                        )}
                      </p>
                      {imageData.convertedBlob && (
                        <Button
                          onClick={() => downloadSingle(imageData)}
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-xs"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      )}
                    </div>
                    <Button
                      onClick={() => removeImage(imageData.id)}
                      variant="ghost"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Size Comparison */}
              {totalConvertedSize > 0 && (
                <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Original (WebP):</span>
                    <span className="font-medium">{formatFileSize(totalOriginalSize)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Converted (PNG):</span>
                    <span className="font-medium text-primary">{formatFileSize(totalConvertedSize)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Note: PNG files may be larger but offer better compatibility
                  </p>
                </div>
              )}

              {/* Download Buttons */}
              {images.some(img => img.convertedBlob) && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button onClick={downloadAllAsZip} className="flex-1" size="lg">
                    <Download className="h-4 w-4 mr-2" />
                    Download All as ZIP
                  </Button>
                  <Button onClick={downloadAllIndividually} variant="outline" className="flex-1" size="lg">
                    <Download className="h-4 w-4 mr-2" />
                    Download All Individually
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Features Section */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Advanced Features</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Batch Processing:</strong> Convert multiple WebP images at once</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Transparency Preserved:</strong> PNG maintains WebP transparency</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Resize Option:</strong> Optionally resize images during conversion</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>ZIP Download:</strong> Download all converted images as single ZIP file</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Universal Compatibility:</strong> PNG works on all platforms and browsers</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Image Preview:</strong> View thumbnails of all uploaded images</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>100% Secure:</strong> All processing happens in your browser</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Info Box */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Why Convert WebP to PNG?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Universal Compatibility:</strong> PNG works everywhere, WebP isn't supported by all platforms</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Better for Editing:</strong> PNG is widely supported by image editors</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Transparency Support:</strong> PNG maintains WebP's transparency perfectly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>No Browser Issues:</strong> All browsers support PNG without any issues</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Professional Standard:</strong> PNG is still the industry standard for many uses</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
};

export default WebPToPNG;
