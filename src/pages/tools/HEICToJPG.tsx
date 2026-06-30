import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Download, Upload, Smartphone } from "lucide-react";
import heic2any from 'heic2any';

const HEICToJPG = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [convertedImage, setConvertedImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [quality, setQuality] = useState<number>(90);
  const [converting, setConverting] = useState(false);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [convertedSize, setConvertedSize] = useState<number>(0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === "image/heic" || file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
        setSelectedFile(file);
        setOriginalSize(file.size);
        setFileName(file.name.replace(/\.(heic|heif)$/i, '.jpg'));
        setConvertedImage(null);
        setConvertedSize(0);
        toast.success("HEIC file loaded!");
      } else {
        toast.error("Please select a HEIC file");
      }
    }
  };

  const convertToJPG = async () => {
    if (!selectedFile) {
      toast.error("Please select a HEIC file first");
      return;
    }

    setConverting(true);

    try {
      // Convert HEIC to JPG using heic2any library
      const convertedBlob = await heic2any({
        blob: selectedFile,
        toType: 'image/jpeg',
        quality: quality / 100
      });

      const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
      setConvertedSize(blob.size);

      // Create preview URL
      const url = URL.createObjectURL(blob);
      setConvertedImage(url);

      toast.success("Conversion successful! Preview your image below.");
    } catch (error) {
      console.error("Error converting HEIC:", error);
      toast.error("Failed to convert HEIC file. Make sure it's a valid HEIC image.");
    } finally {
      setConverting(false);
    }
  };

  const downloadJPG = () => {
    if (!convertedImage) {
      toast.error("Please convert the file first");
      return;
    }

    const link = document.createElement('a');
    link.href = convertedImage;
    link.download = fileName;
    link.click();

    toast.success("JPG image downloaded!");
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <ToolLayout
      title="HEIC to JPG Converter"
      description="Convert iPhone HEIC/HEIF images to JPG format. Free, fast, and works offline - perfect for sharing iPhone photos on any device."
      category="File Converters"
      instructions={[
        "Click 'Choose HEIC Image' and select your iPhone photo",
        "Adjust quality slider for file size control",
        "Click 'Convert to JPG' to process",
        "Preview the converted image",
        "Click 'Download JPG' to save the file"
      ]}
      relatedTools={[
        { name: "PNG to JPG", path: "/tools/png-to-jpg" },
        { name: "WebP to JPG", path: "/tools/webp-to-jpg" },
        { name: "Image Size Reducer", path: "/tools/image-size-reducer" }
      ]}
    >
      <div className="grid gap-6">
        <Card>
          <CardContent className="p-6 space-y-6">
            <div>
              <Label htmlFor="heic-file">Upload HEIC/HEIF Image</Label>
              <div className="mt-2">
                <label
                  htmlFor="heic-file"
                  className="flex items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors overflow-hidden"
                >
                  {convertedImage ? (
                    <img
                      src={convertedImage}
                      alt="Converted preview"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : selectedFile ? (
                    <div className="text-center">
                      <Smartphone className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <p className="text-sm font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(originalSize)}
                      </p>
                      <p className="text-xs text-primary mt-2">
                        Ready to convert
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload HEIC image
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        From iPhone or iPad
                      </p>
                    </div>
                  )}
                  <Input
                    id="heic-file"
                    type="file"
                    accept=".heic,.heif,image/heic,image/heif"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {selectedFile && !convertedImage && (
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
                  min={60}
                  max={100}
                  step={5}
                  className="mt-2"
                />
              </div>
            )}

            {selectedFile && !convertedImage && (
              <Button
                onClick={convertToJPG}
                disabled={converting}
                size="lg"
                className="w-full"
              >
                {converting ? "Converting..." : "Convert to JPG"}
              </Button>
            )}

            {convertedImage && (
              <>
                <div>
                  <Label htmlFor="file-name">Output File Name</Label>
                  <Input
                    id="file-name"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="image.jpg"
                    className="mt-2"
                  />
                </div>

                <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Original (HEIC):</span>
                    <span className="font-medium">{formatFileSize(originalSize)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Converted (JPG):</span>
                    <span className="font-medium text-primary">{formatFileSize(convertedSize)}</span>
                  </div>
                </div>

                <Button
                  onClick={downloadJPG}
                  size="lg"
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download JPG
                </Button>

                <Button
                  onClick={() => {
                    setSelectedFile(null);
                    setConvertedImage(null);
                    setConvertedSize(0);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Convert Another Image
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">About HEIC Format</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>What is HEIC?</strong> High Efficiency Image Format used by iPhone/iPad since iOS 11</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Why Convert?</strong> HEIC isn't supported on all devices - JPG works everywhere</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Safe & Private:</strong> All conversion happens in your browser</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>No Upload:</strong> Your photos never leave your device</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Free Forever:</strong> No limits, no registration required</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardContent className="p-6">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-primary" />
              Tip for iPhone Users
            </h4>
            <p className="text-sm text-muted-foreground">
              To avoid HEIC format in the future, go to Settings → Camera → Formats, and select "Most Compatible".
              This will make your iPhone save photos as JPG instead of HEIC.
            </p>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
};

export default HEICToJPG;
