import { useState, useEffect, useRef } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ScanLine, Camera, Upload, Copy, ExternalLink, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Html5Qrcode } from "html5-qrcode";
import { AdSpace } from "@/components/AdSpace";

const QRScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState("");
  const [html5QrCode, setHtml5QrCode] = useState<Html5Qrcode | null>(null);
  const [capturedImage, setCapturedImage] = useState<string>("");
  const [isDetecting, setIsDetecting] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    return () => {
      if (html5QrCode?.isScanning) {
        html5QrCode.stop().catch(console.error);
      }
    };
  }, [html5QrCode]);

  // Capture screenshot from video element
  const captureScreenshot = () => {
    const video = document.querySelector("#qr-reader video") as HTMLVideoElement;
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
    } catch (error) {
      console.error("Failed to capture screenshot:", error);
    }
  };

  const startCamera = async () => {
    try {
      const qrCodeScanner = new Html5Qrcode("qr-reader");
      setHtml5QrCode(qrCodeScanner);

      // Configure for QR codes only (not barcodes)
      await qrCodeScanner.start(
        { facingMode: "environment" },
        {
          fps: 30, // Higher FPS for faster detection
          qrbox: { width: 300, height: 300 }, // Square box for QR codes
          aspectRatio: 1.0,
          disableFlip: false,
          formatsToSupport: [0], // 0 = QR_CODE only (not barcodes)
          videoConstraints: {
            facingMode: "environment",
            focusMode: "continuous",
            advanced: [{ zoom: 1.0 }]
          }
        },
        (decodedText, decodedResult) => {
          // QR Code detected - immediate stop to prevent continuous scanning
          if (html5QrCode?.isScanning) {
            html5QrCode.stop().then(() => {
              setScanning(false);
              setIsDetecting(true);
              setResult(decodedText);
              captureScreenshot();

              setTimeout(() => {
                setIsDetecting(false);
                toast.success("QR Code scanned successfully!");
              }, 500);
            }).catch(console.error);
          }
        },
        (errorMessage) => {
          // Suppress console errors - these are normal during scanning
        }
      );

      setScanning(true);
      toast.success("Camera started - Place QR code in the scanning area");
    } catch (error) {
      console.error(error);
      toast.error("Failed to access camera. Please grant camera permissions.");
    }
  };

  const stopCamera = async () => {
    if (html5QrCode?.isScanning) {
      try {
        await html5QrCode.stop();
        setScanning(false);
        toast.info("Camera stopped");
      } catch (error) {
        console.error(error);
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

      try {
        const qrCodeScanner = new Html5Qrcode("qr-reader");
        const decodedText = await qrCodeScanner.scanFile(file, true);
        setResult(decodedText);
        toast.success("QR Code decoded successfully!");
      } catch (error) {
        console.error(error);
        toast.error("Failed to decode QR code from image");
      }
    };

    input.click();
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result);
    toast.success("Copied to clipboard!");
  };

  const openLink = () => {
    if (result.startsWith("http://") || result.startsWith("https://")) {
      window.open(result, "_blank");
    } else {
      toast.error("Result is not a valid URL");
    }
  };

  const isURL = result.startsWith("http://") || result.startsWith("https://");

  return (
    <ToolLayout
      title="QR Code Scanner"
      description="Powerful QR code scanner with automatic detection and capture"
      category="QR & Barcodes"
      instructions={[
        "Click 'Start Camera' to activate the powerful QR scanner",
        "Place the QR code in front of your camera within the scanning box",
        "The scanner will automatically detect and capture the QR code",
        "View the decoded content and captured image instantly",
        "Upload images containing QR codes for instant decoding",
      ]}
      relatedTools={[
        { name: "QR Code Generator", path: "/tools/qr-code-generator" },
        { name: "Barcode Scanner", path: "/tools/barcode-scanner" },
        { name: "Barcode Generator", path: "/tools/barcode-generator" },
      ]}
    >
      <AdSpace size="leaderboard" className="mb-6" />
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <Label>Scan Method</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {!scanning ? (
                  <>
                    <Button onClick={startCamera} size="lg" className="w-full">
                      <Camera className="h-4 w-4 mr-2" />
                      Start Camera
                    </Button>
                    <Button onClick={scanFile} size="lg" variant="secondary" className="w-full">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Image
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
                id="qr-reader"
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
                    <p className="font-medium text-sm">Place QR code in front of camera</p>
                  </div>
                  <p className="text-xs mt-1 text-center opacity-75">Position within the scanning box</p>
                </div>
              )}

              {/* Detection Success Overlay */}
              {isDetecting && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 bg-green-500 text-white px-8 py-4 rounded-lg shadow-2xl">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="h-8 w-8 animate-bounce" />
                    <div>
                      <p className="font-bold text-lg">QR Code Detected!</p>
                      <p className="text-sm">Capturing automatically...</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-6">
          <div>
            <Label>Scanned Result</Label>
            <div className="mt-2 p-4 bg-muted rounded-lg min-h-[200px] break-all">
              {result ? (
                <div className="space-y-3">
                  <p className="font-mono text-sm">{result}</p>
                  {capturedImage && (
                    <div className="mt-4">
                      <Label className="text-xs text-muted-foreground">Captured Image</Label>
                      <img
                        src={capturedImage}
                        alt="Captured QR Code"
                        className="mt-2 w-full rounded-lg border-2 border-green-500/30"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-16">
                  No QR code scanned yet
                </p>
              )}
            </div>
          </div>

          {result && (
            <div className="space-y-3">
              <Button onClick={copyResult} size="lg" className="w-full" variant="secondary">
                <Copy className="h-4 w-4 mr-2" />
                Copy Result
              </Button>
              {isURL && (
                <Button onClick={openLink} size="lg" className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Link
                </Button>
              )}
            </div>
          )}
        </Card>
      </div>
      
      <AdSpace size="leaderboard" className="mt-6" />
    </ToolLayout>
  );
};

export default QRScanner;
