import { useState, useEffect, useRef } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Copy, Camera, Upload, ScanLine, CheckCircle2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Html5Qrcode } from "html5-qrcode";
import { AdSpace } from "@/components/AdSpace";
import { isRasterImageFile } from "@/utils/imageFiles";

const BarcodeScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState("");
  const [format, setFormat] = useState("");
  const [html5QrCode, setHtml5QrCode] = useState<Html5Qrcode | null>(null);
  const [capturedImage, setCapturedImage] = useState<string>("");
  const [isDetecting, setIsDetecting] = useState(false);
  const [productInfo, setProductInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [manualBarcode, setManualBarcode] = useState("");

  useEffect(() => {
    return () => {
      if (html5QrCode?.isScanning) {
        html5QrCode.stop().catch(() => undefined);
      }
    };
  }, [html5QrCode]);

  // Capture screenshot from video element
  const captureScreenshot = () => {
    const video = document.querySelector("#barcode-reader video") as HTMLVideoElement;
    if (!video) return;

    try {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL("image/png");
        setCapturedImage(imageData);
      }
    } catch {
      // Ignore screenshot capture errors.
    }
  };

  const startCamera = async () => {
    try {
      const barcodeScanner = new Html5Qrcode("barcode-reader");
      setHtml5QrCode(barcodeScanner);

      // Configure for barcode-only scanning (exclude QR codes)
      await barcodeScanner.start(
        { facingMode: "environment" },
        {
          fps: 30, // High FPS for fast detection
          qrbox: { width: 350, height: 150 }, // Wider box for barcodes
          aspectRatio: 2.33,
          disableFlip: false
        },
        (decodedText, decodedResult) => {
          // Barcode detected - immediate stop to prevent continuous scanning
          const formatName = decodedResult.result.format?.formatName || "Barcode";

          if (barcodeScanner.isScanning) {
            barcodeScanner.stop().then(() => {
              setScanning(false);
              setIsDetecting(true);
              setResult(decodedText);
              setFormat(formatName);
              captureScreenshot();

              setTimeout(() => {
                setIsDetecting(false);
                toast.success(`${formatName} scanned successfully!`);

                // Auto lookup product info for retail barcodes
                if (decodedText.length >= 8 && /^\d+$/.test(decodedText)) {
                  fetchProductInfo(decodedText);
                }
              }, 500);
            }).catch(() => undefined);
          }
        },
        (errorMessage) => {
          // Suppress console errors during active scanning
        }
      );

      setScanning(true);
      toast.success("Camera started - Place barcode in the scanning area");
    } catch {
      toast.error("Failed to access camera. Please grant camera permissions.");
    }
  };

  const stopCamera = async () => {
    if (html5QrCode?.isScanning) {
      try {
        await html5QrCode.stop();
        setScanning(false);
        toast.info("Camera stopped");
      } catch {
        setScanning(false);
      }
    }
  };

  const scanFile = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      if (!isRasterImageFile(file) || file.size > 10 * 1024 * 1024) {
        toast.error("Please upload a JPG, PNG, WebP, GIF, or BMP image under 10 MB");
        return;
      }

      try {
        const barcodeScanner = new Html5Qrcode("barcode-reader");
        const decodedText = await barcodeScanner.scanFile(file, true);
        setResult(decodedText);
        setFormat("Image Scan");
        toast.success("Barcode decoded successfully!");

        // Auto lookup if numeric barcode
        if (decodedText.length >= 8 && /^\d+$/.test(decodedText)) {
          fetchProductInfo(decodedText);
        }
      } catch {
        toast.error("Failed to decode barcode from image");
      }
    };

    input.click();
  };

  const fetchProductInfo = async (barcode: string) => {
    setLoading(true);
    setProductInfo(null);

    try {
      const response = await fetch("/api-proxy.php", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'lookup-barcode',
          barcode
        }),
      });

      if (!response.ok) throw new Error("Proxy error");
      const data = await response.json();

      if (data.error) throw new Error(data.error);

      if (data) {
        setProductInfo(data);
      }
    } catch {
      setProductInfo({
        source: "Error",
        message: "Failed to fetch product information. Please try again.",
      });
    }

    setLoading(false);
  };

  const handleManualLookup = () => {
    const trimmed = manualBarcode.trim();
    if (!trimmed) {
      toast.error("Please enter a barcode number");
      return;
    }
    if (!/^\d+$/.test(trimmed)) {
      toast.error("Barcode must contain only numbers");
      return;
    }
    if (trimmed.length < 8 || trimmed.length > 14) {
      toast.error("Barcode must be between 8 and 14 digits");
      return;
    }
    setResult(trimmed);
    setFormat("Manual Entry");
    fetchProductInfo(trimmed);
    toast.success("Looking up barcode...");
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result);
    toast.success("Copied to clipboard!");
  };

  return (
    <ToolLayout
      title="Barcode Scanner"
      description="Powerful barcode scanner with camera, automatic detection and product lookup"
      category="QR & Barcodes"
      instructions={[
        "Click 'Start Camera' to activate powerful barcode scanner",
        "Place barcode horizontally in front of camera within scanning box",
        "Scanner automatically detects CODE128, CODE39, EAN-13, UPC, and more",
        "View barcode format, captured image, and product information",
        "Or upload an image containing a barcode",
        "Manual entry available for quick lookups",
      ]}
      relatedTools={[
        { name: "QR Code Scanner", path: "/tools/qr-scanner" },
        { name: "Barcode Generator", path: "/tools/barcode-generator" },
        { name: "QR Code Generator", path: "/tools/qr-code-generator" },
      ]}
    >
      <AdSpace size="leaderboard" className="mb-6" />
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <Label>Scan Method</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {!scanning ? (
                  <>
                    <Button onClick={startCamera} size="lg" className="w-full">
                      <Camera className="h-4 w-4 mr-2" />
                      Camera
                    </Button>
                    <Button onClick={scanFile} size="lg" variant="secondary" className="w-full">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </>
                ) : (
                  <Button onClick={stopCamera} size="lg" variant="destructive" className="col-span-2">
                    Stop Camera
                  </Button>
                )}
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden bg-black/5 relative">
              <div
                id="barcode-reader"
                className={`w-full min-h-[300px] transition-all ${isDetecting ? 'ring-4 ring-green-500' : ''}`}
              ></div>
              {!scanning && (
                <div className="flex items-center justify-center h-[300px]">
                  <div className="text-center text-muted-foreground">
                    <ScanLine className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Camera preview will appear here</p>
                  </div>
                </div>
              )}

              {/* Live Instructions Overlay */}
              {scanning && !isDetecting && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-black/80 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
                  <div className="flex items-center space-x-2">
                    <ScanLine className="h-5 w-5" />
                    <p className="font-medium text-sm">Place barcode horizontally in front of camera</p>
                  </div>
                  <p className="text-xs mt-1 text-center opacity-75">Align within the scanning box</p>
                </div>
              )}

              {/* Detection Success Overlay */}
              {isDetecting && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 bg-green-500 text-white px-8 py-4 rounded-lg shadow-2xl">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="h-8 w-8 animate-bounce" />
                    <div>
                      <p className="font-bold text-lg">Barcode Detected!</p>
                      <p className="text-sm">Capturing automatically...</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label>Manual Entry (Optional)</Label>
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  placeholder="Enter barcode number..."
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => e.key === 'Enter' && handleManualLookup()}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  maxLength={14}
                />
                <Button onClick={handleManualLookup} size="sm">
                  Lookup
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">8-14 digit barcode</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-6">
          <div>
            <Label>Scanned Result</Label>
            <div className="mt-2 p-4 bg-muted rounded-lg min-h-[100px] break-all">
              {result ? (
                <div className="space-y-3">
                  <div>
                    <p className="font-mono text-lg font-bold">{result}</p>
                    {format && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Format: <span className="font-semibold">{format}</span>
                      </p>
                    )}
                  </div>
                  {capturedImage && (
                    <div className="mt-4">
                      <Label className="text-xs text-muted-foreground">Captured Image</Label>
                      <img
                        src={capturedImage}
                        alt="Captured Barcode"
                        className="mt-2 w-full rounded-lg border-2 border-green-500/30"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No barcode scanned yet
                </p>
              )}
            </div>
          </div>

          {loading && (
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Loading product information...</p>
            </div>
          )}

          {productInfo && !loading && (
            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <h4 className="font-semibold text-sm">Product Information:</h4>

              {productInfo.image && (
                <img
                  src={productInfo.image}
                  alt="Product"
                  className="w-full max-w-[200px] mx-auto rounded-lg"
                />
              )}

              {productInfo.source !== "Not Found" && productInfo.source !== "Error" ? (
                <>
                  {productInfo.name && (
                    <div>
                      <p className="text-xs text-muted-foreground">Name:</p>
                      <p className="text-sm font-medium">{productInfo.name}</p>
                    </div>
                  )}

                  {productInfo.brand && (
                    <div>
                      <p className="text-xs text-muted-foreground">Brand:</p>
                      <p className="text-sm">{productInfo.brand}</p>
                    </div>
                  )}

                  {productInfo.price && (
                    <div>
                      <p className="text-xs text-muted-foreground">Price:</p>
                      <p className="text-sm">{productInfo.currency} {productInfo.price}</p>
                      {productInfo.merchant && (
                        <p className="text-xs text-muted-foreground">at {productInfo.merchant}</p>
                      )}
                    </div>
                  )}

                  {productInfo.category && (
                    <div>
                      <p className="text-xs text-muted-foreground">Category:</p>
                      <p className="text-sm">{productInfo.category}</p>
                    </div>
                  )}

                  {productInfo.categories && (
                    <div>
                      <p className="text-xs text-muted-foreground">Categories:</p>
                      <p className="text-sm">{productInfo.categories}</p>
                    </div>
                  )}

                  {productInfo.description && (
                    <div>
                      <p className="text-xs text-muted-foreground">Description:</p>
                      <p className="text-sm">{productInfo.description}</p>
                    </div>
                  )}

                  {productInfo.ingredients && (
                    <div>
                      <p className="text-xs text-muted-foreground">Ingredients:</p>
                      <p className="text-sm">{productInfo.ingredients}</p>
                    </div>
                  )}

                  {productInfo.nutrition && Object.values(productInfo.nutrition).some(v => v) && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Nutrition (per 100g):</p>
                      <div className="text-sm space-y-1">
                        {productInfo.nutrition.energy && <p>Energy: {productInfo.nutrition.energy} kcal</p>}
                        {productInfo.nutrition.fat && <p>Fat: {productInfo.nutrition.fat}g</p>}
                        {productInfo.nutrition.carbohydrates && <p>Carbs: {productInfo.nutrition.carbohydrates}g</p>}
                        {productInfo.nutrition.proteins && <p>Protein: {productInfo.nutrition.proteins}g</p>}
                      </div>
                    </div>
                  )}

                  {productInfo.labels && (
                    <div>
                      <p className="text-xs text-muted-foreground">Labels:</p>
                      <p className="text-sm">{productInfo.labels}</p>
                    </div>
                  )}

                  {productInfo.packaging && (
                    <div>
                      <p className="text-xs text-muted-foreground">Packaging:</p>
                      <p className="text-sm">{productInfo.packaging}</p>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground mt-2">Source: {productInfo.source}</p>
                </>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-amber-600">{productInfo.message}</p>
                  {productInfo.suggestion && (
                    <div className="text-xs text-muted-foreground whitespace-pre-line">
                      {productInfo.suggestion}
                    </div>
                  )}
                  {productInfo.searchUrl && (
                    <a
                      href={productInfo.searchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Search on Google
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          {result && (
            <Button onClick={copyResult} size="lg" className="w-full" variant="secondary">
              <Copy className="h-4 w-4 mr-2" />
              Copy Barcode
            </Button>
          )}

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold mb-2 text-sm">Supported Formats:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• UPC-A, UPC-E</li>
              <li>• EAN-8, EAN-13</li>
              <li>• Code 128, Code 39, Code 93</li>
              <li>• ITF, Codabar, Data Matrix</li>
            </ul>
          </div>
        </Card>
      </div>

      <AdSpace size="leaderboard" className="mt-6" />
    </ToolLayout>
  );
};

export default BarcodeScanner;
