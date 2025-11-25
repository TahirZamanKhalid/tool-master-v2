import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ScanLine, Camera, Upload, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Html5Qrcode } from "html5-qrcode";
import { AdSpace } from "@/components/AdSpace";

const QRScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState("");
  const [html5QrCode, setHtml5QrCode] = useState<Html5Qrcode | null>(null);

  useEffect(() => {
    return () => {
      if (html5QrCode?.isScanning) {
        html5QrCode.stop().catch(console.error);
      }
    };
  }, [html5QrCode]);

  const startCamera = async () => {
    try {
      const qrCodeScanner = new Html5Qrcode("qr-reader");
      setHtml5QrCode(qrCodeScanner);

      await qrCodeScanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          setResult(decodedText);
          stopCamera();
          toast.success("QR Code scanned successfully!");
        },
        (errorMessage) => {
          // Ignore errors during scanning
        }
      );

      setScanning(true);
      toast.success("Camera started");
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
      description="Scan QR codes using your camera or upload an image"
      category="QR & Barcodes"
      instructions={[
        "Click 'Start Camera' to scan QR codes in real-time",
        "Or upload an image containing a QR code",
        "The decoded content will appear below",
        "Copy the result or open URLs directly",
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

            <div className="border rounded-lg overflow-hidden bg-black/5">
              <div id="qr-reader" className="w-full min-h-[300px]"></div>
              {!scanning && (
                <div className="flex items-center justify-center h-[300px]">
                  <div className="text-center text-muted-foreground">
                    <ScanLine className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Camera preview will appear here</p>
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
                <p className="font-mono text-sm">{result}</p>
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
