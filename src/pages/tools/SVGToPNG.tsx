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
import { Download, Upload, Trash2, Files } from "lucide-react";
import JSZip from 'jszip';

interface SVGData {
  id: string;
  file: File;
  svgText: string;
  originalSize: number;
  convertedBlob?: Blob;
  convertedSize?: number;
}

const SVGToPNG = () => {
  const [svgFiles, setSvgFiles] = useState<SVGData[]>([]);
  const [scale, setScale] = useState<number>(1);
  const [backgroundColor, setBackgroundColor] = useState<string>("transparent");
  const [bgPreset, setBgPreset] = useState<string>("transparent");
  const [width, setWidth] = useState<number>(1000);
  const [height, setHeight] = useState<number>(1000);
  const [maintainAspect, setMaintainAspect] = useState<boolean>(true);
  const [converting, setConverting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file =>
      file.type === "image/svg+xml" || file.name.toLowerCase().endsWith('.svg')
    );

    if (validFiles.length === 0) {
      toast.error("Please select SVG files");
      return;
    }

    const newSvgs: SVGData[] = [];

    for (const file of validFiles) {
      const text = await file.text();
      newSvgs.push({
        id: `${Date.now()}-${Math.random()}`,
        file,
        svgText: text,
        originalSize: file.size,
      });
    }

    setSvgFiles(prev => [...prev, ...newSvgs]);
    toast.success(`${validFiles.length} SVG file(s) loaded!`);
  };

  const handleBgPresetChange = (value: string) => {
    setBgPreset(value);
    switch (value) {
      case 'transparent':
        setBackgroundColor('transparent');
        break;
      case 'white':
        setBackgroundColor('#FFFFFF');
        break;
      case 'black':
        setBackgroundColor('#000000');
        break;
      // 'custom' keeps current backgroundColor
    }
  };

  const removeSvg = (id: string) => {
    setSvgFiles(prev => prev.filter(svg => svg.id !== id));
  };

  const convertSvg = (svgData: SVGData): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        reject(new Error("Canvas not available"));
        return;
      }

      const img = new Image();
      const svgBlob = new Blob([svgData.svgText], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        const targetWidth = maintainAspect ? width : img.width * scale;
        const targetHeight = maintainAspect ? height : img.height * scale;

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error("Context not available"));
          return;
        }

        // Fill background
        if (backgroundColor !== 'transparent') {
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Draw SVG
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url);
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Conversion failed"));
            }
          },
          'image/png'
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Failed to load SVG"));
      };

      img.src = url;
    });
  };

  const convertAll = async () => {
    if (svgFiles.length === 0) {
      toast.error("Please select SVG files first");
      return;
    }

    setConverting(true);

    try {
      const updatedSvgs = [...svgFiles];

      for (let i = 0; i < updatedSvgs.length; i++) {
        const blob = await convertSvg(updatedSvgs[i]);
        updatedSvgs[i].convertedBlob = blob;
        updatedSvgs[i].convertedSize = blob.size;
      }

      setSvgFiles(updatedSvgs);
      toast.success(`Converted ${svgFiles.length} SVG(s) successfully!`);
    } catch (error) {
      console.error("Error converting SVGs:", error);
      toast.error("Failed to convert SVG files");
    } finally {
      setConverting(false);
    }
  };

  const downloadSingle = (svgData: SVGData) => {
    if (!svgData.convertedBlob) {
      toast.error("Please convert SVGs first");
      return;
    }

    const url = URL.createObjectURL(svgData.convertedBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = svgData.file.name.replace(/\.svg$/i, '.png');
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${svgData.file.name}`);
  };

  const downloadAllAsZip = async () => {
    const convertedSvgs = svgFiles.filter(svg => svg.convertedBlob);

    if (convertedSvgs.length === 0) {
      toast.error("Please convert SVGs first");
      return;
    }

    const zip = new JSZip();

    convertedSvgs.forEach((svgData) => {
      const fileName = svgData.file.name.replace(/\.svg$/i, '.png');
      zip.file(fileName, svgData.convertedBlob!);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `converted-svgs-${Date.now()}.zip`;
    link.click();
    URL.revokeObjectURL(link.href);
    toast.success(`Downloaded ${convertedSvgs.length} PNG(s) as ZIP`);
  };

  const downloadAllIndividually = () => {
    const convertedSvgs = svgFiles.filter(svg => svg.convertedBlob);

    if (convertedSvgs.length === 0) {
      toast.error("Please convert SVGs first");
      return;
    }

    convertedSvgs.forEach((svgData, index) => {
      setTimeout(() => {
        downloadSingle(svgData);
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

  const totalOriginalSize = svgFiles.reduce((sum, svg) => sum + svg.originalSize, 0);
  const totalConvertedSize = svgFiles.reduce((sum, svg) => sum + (svg.convertedSize || 0), 0);

  return (
    <ToolLayout
      title="SVG to PNG Converter"
      description="Convert SVG vector images to PNG raster format. Batch processing, custom dimensions, background colors. Perfect for logos, icons, and graphics. 100% free."
      category="File Converters"
      instructions={[
        "Upload one or more SVG files (batch processing supported)",
        "Set output dimensions or scale",
        "Choose background color (transparent, white, black, custom)",
        "Click 'Convert All SVGs' to process",
        "Download individually or all as ZIP"
      ]}
      relatedTools={[
        { name: "PNG to JPG", path: "/tools/png-to-jpg" },
        { name: "Image Compressor", path: "/tools/image-compressor" },
        { name: "Image Resizer", path: "/tools/image-resizer" }
      ]}
    >
      <div className="grid gap-6">
        <Card>
          <CardContent className="p-6 space-y-6">
            {/* File Upload */}
            <div>
              <Label htmlFor="svg-files">Upload SVG Files (Multiple Supported)</Label>
              <div className="mt-2">
                <label
                  htmlFor="svg-files"
                  className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <div className="text-center">
                    {svgFiles.length > 0 ? (
                      <>
                        <Files className="h-8 w-8 mx-auto mb-2 text-green-600" />
                        <p className="text-sm font-medium">{svgFiles.length} SVG(s) selected</p>
                        <p className="text-xs text-muted-foreground">
                          Total size: {formatFileSize(totalOriginalSize)}
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload SVG files
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Supports batch conversion
                        </p>
                      </>
                    )}
                  </div>
                  <Input
                    id="svg-files"
                    type="file"
                    accept=".svg,image/svg+xml"
                    onChange={handleFileUpload}
                    className="hidden"
                    multiple
                  />
                </label>
              </div>
            </div>

            {/* Dimensions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="width">Width (pixels)</Label>
                <Input
                  id="width"
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  min={10}
                  max={10000}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="height">Height (pixels)</Label>
                <Input
                  id="height"
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  min={10}
                  max={10000}
                  className="mt-2"
                />
              </div>
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
                Use fixed dimensions (unchecked = scale based on original ratio)
              </label>
            </div>

            {/* Scale Slider */}
            {!maintainAspect && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Scale: {scale}x</Label>
                </div>
                <Slider
                  value={[scale]}
                  onValueChange={(value) => setScale(value[0])}
                  min={0.5}
                  max={5}
                  step={0.5}
                  className="mt-2"
                />
              </div>
            )}

            {/* Background Color */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Background Color</Label>
                <Select value={bgPreset} onValueChange={handleBgPresetChange}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transparent">Transparent</SelectItem>
                    <SelectItem value="white">White</SelectItem>
                    <SelectItem value="black">Black</SelectItem>
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

            {/* Convert Button */}
            <Button
              onClick={convertAll}
              disabled={svgFiles.length === 0 || converting}
              size="lg"
              className="w-full"
            >
              {converting ? "Converting..." : `Convert ${svgFiles.length > 0 ? `All ${svgFiles.length}` : ''} SVG${svgFiles.length !== 1 ? 's' : ''}`}
            </Button>

            {/* Hidden Canvas */}
            <canvas ref={canvasRef} className="hidden" />
          </CardContent>
        </Card>

        {/* SVG Files Preview */}
        {svgFiles.length > 0 && (
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  SVG Files ({svgFiles.length})
                </h3>
                <Button
                  onClick={() => setSvgFiles([])}
                  variant="outline"
                  size="sm"
                >
                  Clear All
                </Button>
              </div>

              {/* Files Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {svgFiles.map((svgData) => (
                  <div
                    key={svgData.id}
                    className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{svgData.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(svgData.originalSize)}
                        {svgData.convertedSize && (
                          <> → {formatFileSize(svgData.convertedSize)}</>
                        )}
                      </p>
                      {svgData.convertedBlob && (
                        <Button
                          onClick={() => downloadSingle(svgData)}
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
                      onClick={() => removeSvg(svgData.id)}
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
                    <span>Total Original (SVG):</span>
                    <span className="font-medium">{formatFileSize(totalOriginalSize)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Converted (PNG):</span>
                    <span className="font-medium text-primary">{formatFileSize(totalConvertedSize)}</span>
                  </div>
                </div>
              )}

              {/* Download Buttons */}
              {svgFiles.some(svg => svg.convertedBlob) && (
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
            <h3 className="text-lg font-semibold mb-4">Features</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Batch Processing:</strong> Convert multiple SVG files at once</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Custom Dimensions:</strong> Set exact width and height or scale proportionally</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Background Options:</strong> Transparent, white, black, or custom color</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>ZIP Download:</strong> Download all converted files as one archive</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>High Quality:</strong> Maintains visual quality during conversion</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>100% Secure:</strong> All processing happens in your browser</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
};

export default SVGToPNG;
