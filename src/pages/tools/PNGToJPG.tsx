import { useState, useRef } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Download, Upload, Image as ImageIcon, Trash2, Files } from "lucide-react";
import JSZip from 'jszip';

interface ImageData {
  id: string;
  file: File;
  preview: string;
  originalSize: number;
  convertedBlob?: Blob;
  convertedSize?: number;
}

const PNGToJPG = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [quality, setQuality] = useState<number>(90);
  const [backgroundColor, setBackgroundColor] = useState<string>("#FFFFFF");
  const [bgPreset, setBgPreset] = useState<string>("white");
  const [resize, setResize] = useState<boolean>(false);
  const [resizeWidth, setResizeWidth] = useState<number>(1920);
  const [maintainAspect, setMaintainAspect] = useState<boolean>(true);
  const [converting, setConverting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file =>
      file.type === "image/png" || file.name.toLowerCase().endsWith('.png')
    );

    if (validFiles.length === 0) {
      toast.error("Please select PNG images");
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
          toast.success(`${validFiles.length} PNG image(s) loaded!`);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleBgPresetChange = (value: string) => {
    setBgPreset(value);
    switch (value) {
      case 'white':
        setBackgroundColor('#FFFFFF');
        break;
      case 'black':
        setBackgroundColor('#000000');
        break;
      case 'gray':
        setBackgroundColor('#808080');
        break;
      // 'custom' keeps current backgroundColor
    }
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

        // Fill with background color (JPG doesn't support transparency)
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw image
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        // Convert to JPG
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Conversion failed"));
            }
          },
          'image/jpeg',
          quality / 100
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
    link.download = imageData.file.name.replace(/\.png$/i, '.jpg');
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
      const fileName = imageData.file.name.replace(/\.png$/i, '.jpg');
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
      }, index * 300); // Stagger downloads to avoid browser blocking
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
  const savingsPercentage = totalOriginalSize && totalConvertedSize
    ? ((1 - totalConvertedSize / totalOriginalSize) * 100).toFixed(1)
    : '0';

  return (
    <ToolLayout
      title="PNG to JPG Converter"
      description="Convert PNG images to JPG/JPEG format online. Batch processing, adjustable quality, background color selection, and resize options. 100% free and secure."
      category="File Converters"
      instructions={[
        "Upload one or more PNG images (batch processing supported)",
        "Choose background color for transparent areas",
        "Adjust quality slider (higher = better quality, larger file)",
        "Optionally enable resize to reduce dimensions",
        "Click 'Convert All Images' to process",
        "Download individually or all as ZIP"
      ]}
      relatedTools={[
        { name: "JPG to PNG", path: "/tools/jpg-to-png" },
        { name: "HEIC to JPG", path: "/tools/heic-to-jpg" },
        { name: "WebP to PNG", path: "/tools/webp-to-png" },
        { name: "Image Size Reducer", path: "/tools/image-compressor" }
      ]}
    >
      <div className="grid gap-6">
        <Card>
          <CardContent className="p-6 space-y-6">
            {/* Image Upload */}
            <div>
              <Label htmlFor="png-images">Upload PNG Images (Multiple Supported)</Label>
              <div className="mt-2">
                <label
                  htmlFor="png-images"
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
                          Click to upload PNG images
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Supports batch conversion
                        </p>
                      </>
                    )}
                  </div>
                  <Input
                    id="png-images"
                    type="file"
                    accept="image/png,.png"
                    onChange={handleImageUpload}
                    className="hidden"
                    multiple
                  />
                </label>
              </div>
            </div>

            {/* Quality Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>JPG Quality: {quality}%</Label>
                <span className="text-xs text-muted-foreground">
                  Higher = Better Quality
                </span>
              </div>
              <Slider
                value={[quality]}
                onValueChange={(value) => setQuality(value[0])}
                min={50}
                max={100}
                step={5}
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Small File</span>
                <span>Best Quality</span>
              </div>
            </div>

            {/* Background Color Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Background Color (for transparent areas)</Label>
                <Select value={bgPreset} onValueChange={handleBgPresetChange}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="white">White</SelectItem>
                    <SelectItem value="black">Black</SelectItem>
                    <SelectItem value="gray">Gray</SelectItem>
                    <SelectItem value="custom">Custom Color</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {bgPreset === 'custom' && (
                <div>
                  <Label htmlFor="bg-color">Custom Color</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="bg-color"
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input
                      type="text"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      placeholder="#FFFFFF"
                      className="flex-1"
                    />
                  </div>
                </div>
              )}
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
                    <span>Total Original (PNG):</span>
                    <span className="font-medium">{formatFileSize(totalOriginalSize)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Converted (JPG):</span>
                    <span className="font-medium text-primary">{formatFileSize(totalConvertedSize)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold border-t pt-2">
                    <span>Total Size Reduction:</span>
                    <span className={totalConvertedSize < totalOriginalSize ? "text-green-600" : "text-orange-600"}>
                      {savingsPercentage}%
                    </span>
                  </div>
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
                <span><strong>Batch Processing:</strong> Convert multiple PNG images at once</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Background Color:</strong> Choose white, black, gray, or custom color for transparent areas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Quality Control:</strong> Adjust JPG quality from 50% to 100%</span>
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
                <span><strong>Size Comparison:</strong> See exact file size reduction</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>100% Secure:</strong> All processing happens in your browser</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Info Box */}
        <Card className="border-primary/20">
          <CardContent className="p-6">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-primary" />
              When to Use JPG vs PNG?
            </h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><strong>Use JPG for:</strong> Photos, complex images, web graphics (smaller files)</p>
              <p><strong>Use PNG for:</strong> Logos, screenshots, images with transparency</p>
              <p className="text-xs mt-3 text-amber-600">
                Note: JPG doesn't support transparency. Transparent areas will be filled with the selected background color.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
};

export default PNGToJPG;
