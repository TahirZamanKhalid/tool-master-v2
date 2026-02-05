import { useState, useRef } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Download, Upload, Image as ImageIcon } from "lucide-react";
import { SidebarAd } from "@/components/SidebarAd";
import { AdRow } from "@/components/AdRow";

const AdvancedImageSizeReducer = () => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [compressedImage, setCompressedImage] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>("");
    const [quality, setQuality] = useState<number>(80);
    const [format, setFormat] = useState<'jpeg' | 'png' | 'webp'>('jpeg');
    const [originalSize, setOriginalSize] = useState<number>(0);
    const [compressedSize, setCompressedSize] = useState<number>(0);
    const [maxWidth, setMaxWidth] = useState<number>(0);
    const [maxHeight, setMaxHeight] = useState<number>(0);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setOriginalSize(file.size);
            setFileName(file.name.replace(/\.[^.]+$/, `.${format === 'jpeg' ? 'jpg' : format}`));

            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new window.Image();
                img.onload = () => {
                    setMaxWidth(img.width);
                    setMaxHeight(img.height);
                    setSelectedImage(event.target?.result as string);
                };
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);

            toast.success("Image loaded!");
        } else {
            toast.error("Please select a valid image file");
        }
    };

    const compressImage = () => {
        if (!selectedImage) {
            toast.error("Please select an image first");
            return;
        }

        const img = new window.Image();
        img.onload = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            // Calculate dimensions (respect max width/height if set)
            let width = img.width;
            let height = img.height;

            if (maxWidth && width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }

            if (maxHeight && height > maxHeight) {
                width = (width * maxHeight) / height;
                height = maxHeight;
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Enable image smoothing for better quality
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        setCompressedSize(blob.size);
                        const url = URL.createObjectURL(blob);
                        setCompressedImage(url);
                        toast.success("Image compressed successfully!");
                    }
                },
                `image/${format}`,
                quality / 100
            );
        };

        img.src = selectedImage;
    };

    const downloadCompressed = () => {
        if (!compressedImage) {
            toast.error("Please compress the image first");
            return;
        }

        const link = document.createElement('a');
        link.href = compressedImage;
        link.download = fileName;
        link.click();

        toast.success("Compressed image downloaded!");
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const savingsPercentage = originalSize && compressedSize
        ? ((1 - compressedSize / originalSize) * 100).toFixed(1)
        : '0';

    return (
        <ToolLayout
            title="Advanced Image Size Reducer"
            description="Compress images with full control over quality, format, and dimensions. Reduce file size by up to 90% while maintaining visual quality. Supports JPG, PNG, and WebP."
            category="Image Tools"
            instructions={[
                "Upload your image (JPG, PNG, WebP, etc.)",
                "Choose output format and quality level",
                "Optionally resize by setting max width/height",
                "Click 'Compress Image' to process",
                "Preview and download the compressed image"
            ]}
            relatedTools={[
                { name: "Image Resizer", path: "/tools/image-resizer" },
                { name: "PNG to JPG", path: "/tools/png-to-jpg" },
                { name: "WebP to PNG", path: "/tools/webp-to-png" }
            ]}
        >
            <div className="flex gap-4">
                {/* Left Sidebar Ad */}
                <div className="hidden xl:block w-40 flex-shrink-0">
                    <SidebarAd position="left" />
                </div>

                <div className="flex-1 grid gap-6">
                    <Card>
                        <CardContent className="p-6 space-y-6">
                            {/* Image Upload */}
                            <div>
                                <Label htmlFor="image-upload">Upload Image</Label>
                                <div className="mt-2">
                                    <label
                                        htmlFor="image-upload"
                                        className="flex items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors overflow-hidden"
                                    >
                                        {selectedImage ? (
                                            <img
                                                src={selectedImage}
                                                alt="Original"
                                                className="max-h-full max-w-full object-contain"
                                            />
                                        ) : (
                                            <div className="text-center">
                                                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                                <p className="text-sm text-muted-foreground">Click to upload image</p>
                                                <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP, etc.</p>
                                            </div>
                                        )}
                                        <Input
                                            id="image-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                                {originalSize > 0 && (
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Original: {formatFileSize(originalSize)}
                                    </p>
                                )}
                            </div>

                            {selectedImage && (
                                <>
                                    {/* Format and Quality Settings */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Output Format</Label>
                                            <Select value={format} onValueChange={(value: 'jpeg' | 'png' | 'webp') => {
                                                setFormat(value);
                                                setFileName(fileName.replace(/\.[^.]+$/, `.${value === 'jpeg' ? 'jpg' : value}`));
                                            }}>
                                                <SelectTrigger className="mt-2">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="jpeg">JPG (Best Compression)</SelectItem>
                                                    <SelectItem value="png">PNG (Lossless)</SelectItem>
                                                    <SelectItem value="webp">WebP (Modern)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label htmlFor="file-name">File Name</Label>
                                            <Input
                                                id="file-name"
                                                value={fileName}
                                                onChange={(e) => setFileName(e.target.value)}
                                                placeholder="image.jpg"
                                                className="mt-2"
                                            />
                                        </div>
                                    </div>

                                    {/* Quality Slider */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <Label>Quality: {quality}%</Label>
                                            <span className="text-xs text-muted-foreground">
                                                {quality >= 90 ? "Excellent" : quality >= 70 ? "Good" : quality >= 50 ? "Medium" : "Low"}
                                            </span>
                                        </div>
                                        <Slider
                                            value={[quality]}
                                            onValueChange={(value) => setQuality(value[0])}
                                            min={10}
                                            max={100}
                                            step={5}
                                            className="mt-2"
                                        />
                                    </div>

                                    {/* Dimension Controls */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="max-width">Max Width (optional)</Label>
                                            <Input
                                                id="max-width"
                                                type="number"
                                                value={maxWidth || ''}
                                                onChange={(e) => setMaxWidth(parseInt(e.target.value) || 0)}
                                                placeholder="Auto"
                                                className="mt-2"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="max-height">Max Height (optional)</Label>
                                            <Input
                                                id="max-height"
                                                type="number"
                                                value={maxHeight || ''}
                                                onChange={(e) => setMaxHeight(parseInt(e.target.value) || 0)}
                                                placeholder="Auto"
                                                className="mt-2"
                                            />
                                        </div>
                                    </div>

                                    {/* Compress Button */}
                                    <Button onClick={compressImage} size="lg" className="w-full">
                                        <ImageIcon className="h-4 w-4 mr-2" />
                                        Compress Image
                                    </Button>

                                    {/* Results */}
                                    {compressedImage && (
                                        <>
                                            <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span>Original Size:</span>
                                                    <span className="font-medium">{formatFileSize(originalSize)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span>Compressed Size:</span>
                                                    <span className="font-medium text-primary">{formatFileSize(compressedSize)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm font-semibold border-t pt-2">
                                                    <span>Size Reduction:</span>
                                                    <span className="text-green-600">{savingsPercentage}%</span>
                                                </div>
                                            </div>

                                            {/* Preview Compressed */}
                                            <div>
                                                <Label>Compressed Preview</Label>
                                                <div className="mt-2 border rounded-lg overflow-hidden">
                                                    <img
                                                        src={compressedImage}
                                                        alt="Compressed"
                                                        className="w-full h-auto"
                                                    />
                                                </div>
                                            </div>

                                            <Button onClick={downloadCompressed} size="lg" className="w-full">
                                                <Download className="h-4 w-4 mr-2" />
                                                Download Compressed Image
                                            </Button>
                                        </>
                                    )}
                                </>
                            )}

                            <canvas ref={canvasRef} className="hidden" />
                        </CardContent>
                    </Card>

                    {/* Features */}
                    <Card>
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold mb-4">Advanced Compression Features</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex items-start gap-2">
                                    <span className="text-primary">✓</span>
                                    <span><strong>Multiple Formats:</strong> Save as JPG, PNG, or WebP</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary">✓</span>
                                    <span><strong>Quality Control:</strong> Adjust compression level from 10% to 100%</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary">✓</span>
                                    <span><strong>Smart Resizing:</strong> Optionally resize while compressing</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary">✓</span>
                                    <span><strong>Live Preview:</strong> See results before downloading</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary">✓</span>
                                    <span><strong>100% Private:</strong> All processing in your browser</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Bottom Ad Row */}
                    <AdRow />
                </div>

                {/* Right Sidebar Ad */}
                <div className="hidden xl:block w-40 flex-shrink-0">
                    <SidebarAd position="right" />
                </div>
            </div>
        </ToolLayout>
    );
};

export default AdvancedImageSizeReducer;
