import { useState, useRef } from "react";
import { Images, Download, X, Upload, Sparkles, Settings, Zap, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import JSZip from "jszip";

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  originalWidth: number;
  originalHeight: number;
  newWidth: number;
  newHeight: number;
  processed: boolean;
  processedUrl?: string;
}

const PRESETS = {
  'instagram-square': { width: 1080, height: 1080, name: 'Instagram Square' },
  'instagram-portrait': { width: 1080, height: 1350, name: 'Instagram Portrait' },
  'instagram-story': { width: 1080, height: 1920, name: 'Instagram Story' },
  'facebook-cover': { width: 820, height: 312, name: 'Facebook Cover' },
  'twitter-header': { width: 1500, height: 500, name: 'Twitter Header' },
  'youtube-thumbnail': { width: 1280, height: 720, name: 'YouTube Thumbnail' },
  'linkedin-banner': { width: 1584, height: 396, name: 'LinkedIn Banner' },
  '4k': { width: 3840, height: 2160, name: '4K Ultra HD' },
  '1080p': { width: 1920, height: 1080, name: 'Full HD 1080p' },
  '720p': { width: 1280, height: 720, name: 'HD 720p' },
};

const PremiumPlusBatchImageResizer = () => {
  const { toast } = useToast();
  const [images, setImages] = useState<ImageFile[]>([]);
  const [customWidth, setCustomWidth] = useState<string>("800");
  const [customHeight, setCustomHeight] = useState<string>("600");
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState<string>("custom");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [format, setFormat] = useState<string>("original");
  const [quality, setQuality] = useState<number>(0.9);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newImages: ImageFile[] = [];

    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;

      const id = Math.random().toString(36).substring(7);
      const preview = URL.createObjectURL(file);

      // Get original dimensions
      const img = new Image();
      img.src = preview;

      await new Promise((resolve) => {
        img.onload = () => {
          const width = selectedPreset === 'custom'
            ? parseInt(customWidth) || img.width
            : PRESETS[selectedPreset as keyof typeof PRESETS]?.width || img.width;

          const height = selectedPreset === 'custom'
            ? parseInt(customHeight) || img.height
            : PRESETS[selectedPreset as keyof typeof PRESETS]?.height || img.height;

          newImages.push({
            id,
            file,
            preview,
            originalWidth: img.width,
            originalHeight: img.height,
            newWidth: width,
            newHeight: height,
            processed: false,
          });
          resolve(null);
        };
      });
    }

    setImages(prev => [...prev, ...newImages]);
    toast({ title: `${newImages.length} image(s) added!` });
  };

  // Remove image
  const removeImage = (id: string) => {
    setImages(prev => {
      const updated = prev.filter(img => img.id !== id);
      const removed = prev.find(img => img.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return updated;
    });
  };

  // Apply preset to all images
  const applyPreset = (preset: string) => {
    setSelectedPreset(preset);

    if (preset === 'custom') return;

    const presetData = PRESETS[preset as keyof typeof PRESETS];
    if (!presetData) return;

    setImages(prev => prev.map(img => ({
      ...img,
      newWidth: presetData.width,
      newHeight: presetData.height,
    })));

    toast({ title: `Applied ${presetData.name} preset to all images!` });
  };

  // Apply custom dimensions
  const applyCustomDimensions = () => {
    const width = parseInt(customWidth);
    const height = parseInt(customHeight);

    if (!width || !height || width <= 0 || height <= 0) {
      toast({ title: "Invalid dimensions!", variant: "destructive" });
      return;
    }

    setImages(prev => prev.map(img => {
      if (maintainAspectRatio) {
        const aspectRatio = img.originalWidth / img.originalHeight;
        return {
          ...img,
          newWidth: width,
          newHeight: Math.round(width / aspectRatio),
        };
      }
      return {
        ...img,
        newWidth: width,
        newHeight: height,
      };
    }));

    toast({ title: "Custom dimensions applied to all images!" });
  };

  // Process images
  const processImages = async () => {
    if (images.length === 0) {
      toast({ title: "No images to process!", variant: "destructive" });
      return;
    }

    setProcessing(true);
    setProgress(0);

    const processedImages: ImageFile[] = [];

    for (let i = 0; i < images.length; i++) {
      const img = images[i];

      try {
        const processedUrl = await resizeImage(img);
        processedImages.push({
          ...img,
          processed: true,
          processedUrl,
        });
      } catch (error) {
        console.error('Error processing image:', error);
        processedImages.push(img);
      }

      setProgress(((i + 1) / images.length) * 100);
    }

    setImages(processedImages);
    setProcessing(false);
    toast({ title: "All images processed successfully!" });
  };

  // Resize single image
  const resizeImage = (imageFile: ImageFile): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = imageFile.preview;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = imageFile.newWidth;
        canvas.height = imageFile.newHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, imageFile.newWidth, imageFile.newHeight);

        const outputFormat = format === 'original'
          ? imageFile.file.type
          : `image/${format}`;

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              resolve(url);
            } else {
              reject(new Error('Failed to create blob'));
            }
          },
          outputFormat,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
    });
  };

  // Download single image
  const downloadImage = (img: ImageFile) => {
    if (!img.processedUrl) return;

    const ext = format === 'original'
      ? img.file.name.split('.').pop()
      : format;
    const filename = `${img.file.name.split('.')[0]}_resized.${ext}`;

    const a = document.createElement('a');
    a.href = img.processedUrl;
    a.download = filename;
    a.click();
  };

  // Download all as ZIP
  const downloadAllAsZip = async () => {
    const processedImages = images.filter(img => img.processed && img.processedUrl);

    if (processedImages.length === 0) {
      toast({ title: "No processed images to download!", variant: "destructive" });
      return;
    }

    const zip = new JSZip();

    for (const img of processedImages) {
      if (!img.processedUrl) continue;

      const response = await fetch(img.processedUrl);
      const blob = await response.blob();

      const ext = format === 'original'
        ? img.file.name.split('.').pop()
        : format;
      const filename = `${img.file.name.split('.')[0]}_resized.${ext}`;

      zip.file(filename, blob);
    }

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resized_images.zip';
    a.click();
    URL.revokeObjectURL(url);

    toast({ title: "ZIP file downloaded successfully!" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-br from-orange-600 to-pink-600 rounded-xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
              Premium Plus Batch Image Resizer
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Resize multiple images at once with presets, custom dimensions, and batch export
          </p>
          <Badge variant="secondary" className="text-sm">Premium Plus Edition</Badge>
        </div>

        {/* Upload Area */}
        <Card className="shadow-2xl border-2 border-orange-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Images
            </CardTitle>
            <CardDescription>Select multiple images to resize in batch</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-orange-300 rounded-lg p-12 text-center cursor-pointer hover:bg-orange-50 transition-colors"
            >
              <Images className="w-12 h-12 mx-auto mb-4 text-orange-600" />
              <p className="text-lg font-medium mb-2">Click to upload images</p>
              <p className="text-sm text-muted-foreground">Supports JPG, PNG, WebP, and more</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
            {images.length > 0 && (
              <div className="mt-4">
                <Badge className="text-sm">{images.length} image(s) loaded</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Settings */}
        <Card className="shadow-xl border-2 border-orange-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Resize Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Presets */}
            <div className="space-y-2">
              <Label>Preset Sizes</Label>
              <Select value={selectedPreset} onValueChange={applyPreset}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a preset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom Size</SelectItem>
                  <SelectItem value="instagram-square">{PRESETS['instagram-square'].name}</SelectItem>
                  <SelectItem value="instagram-portrait">{PRESETS['instagram-portrait'].name}</SelectItem>
                  <SelectItem value="instagram-story">{PRESETS['instagram-story'].name}</SelectItem>
                  <SelectItem value="facebook-cover">{PRESETS['facebook-cover'].name}</SelectItem>
                  <SelectItem value="twitter-header">{PRESETS['twitter-header'].name}</SelectItem>
                  <SelectItem value="youtube-thumbnail">{PRESETS['youtube-thumbnail'].name}</SelectItem>
                  <SelectItem value="linkedin-banner">{PRESETS['linkedin-banner'].name}</SelectItem>
                  <SelectItem value="4k">{PRESETS['4k'].name}</SelectItem>
                  <SelectItem value="1080p">{PRESETS['1080p'].name}</SelectItem>
                  <SelectItem value="720p">{PRESETS['720p'].name}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom Dimensions */}
            {selectedPreset === 'custom' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Width (px)</Label>
                    <Input
                      type="number"
                      value={customWidth}
                      onChange={(e) => setCustomWidth(e.target.value)}
                      placeholder="800"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Height (px)</Label>
                    <Input
                      type="number"
                      value={customHeight}
                      onChange={(e) => setCustomHeight(e.target.value)}
                      placeholder="600"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={maintainAspectRatio}
                    onCheckedChange={setMaintainAspectRatio}
                  />
                  <Label>Maintain aspect ratio</Label>
                </div>

                <Button onClick={applyCustomDimensions} variant="outline" className="w-full">
                  <Zap className="w-4 h-4 mr-2" />
                  Apply Custom Dimensions
                </Button>
              </div>
            )}

            {/* Format & Quality */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Output Format</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="original">Keep Original</SelectItem>
                    <SelectItem value="jpeg">JPEG</SelectItem>
                    <SelectItem value="png">PNG</SelectItem>
                    <SelectItem value="webp">WebP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Quality: {Math.round(quality * 100)}%</Label>
                <Input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                />
              </div>
            </div>

            {/* Process Button */}
            <Button
              onClick={processImages}
              disabled={processing || images.length === 0}
              className="w-full bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700"
              size="lg"
            >
              <Zap className="w-4 h-4 mr-2" />
              {processing ? "Processing..." : "Process All Images"}
            </Button>

            {processing && (
              <div className="space-y-2">
                <Progress value={progress} className="h-3" />
                <p className="text-sm text-center text-muted-foreground">{Math.round(progress)}%</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Image Grid */}
        {images.length > 0 && (
          <Card className="shadow-xl border-2 border-orange-100">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Images className="w-5 h-5" />
                  Images ({images.length})
                </CardTitle>
                {images.some(img => img.processed) && (
                  <Button onClick={downloadAllAsZip} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download All as ZIP
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {images.map((img) => (
                  <Card key={img.id} className="relative">
                    <CardContent className="p-4 space-y-3">
                      <div className="relative">
                        <img
                          src={img.processed && img.processedUrl ? img.processedUrl : img.preview}
                          alt={img.file.name}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <Button
                          onClick={() => removeImage(img.id)}
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                        {img.processed && (
                          <Badge className="absolute top-2 left-2 bg-green-600">
                            <Check className="w-3 h-3 mr-1" />
                            Processed
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm font-medium truncate">{img.file.name}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Original: {img.originalWidth}×{img.originalHeight}</span>
                          <span>New: {img.newWidth}×{img.newHeight}</span>
                        </div>
                      </div>

                      {img.processed && img.processedUrl && (
                        <Button
                          onClick={() => downloadImage(img)}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PremiumPlusBatchImageResizer;
