import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Barcode, Camera, Upload, Copy } from "lucide-react";
import { toast } from "sonner";
import { Html5Qrcode } from "html5-qrcode";

const BarcodeScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState("");
  const [format, setFormat] = useState("");
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
      const barcodeScanner = new Html5Qrcode("barcode-reader");
      setHtml5QrCode(barcodeScanner);

      await barcodeScanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText, decodedResult) => {
          setResult(decodedText);
          setFormat(decodedResult.result.format?.formatName || "Unknown");
          stopCamera();
          toast.success("Barcode scanned successfully!");
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
        const barcodeScanner = new Html5Qrcode("barcode-reader");
        const decodedText = await barcodeScanner.scanFile(file, true);
        setResult(decodedText);
        setFormat("Detected from image");
        toast.success("Barcode decoded successfully!");
      } catch (error) {
        console.error(error);
        toast.error("Failed to decode barcode from image");
      }
    };

    input.click();
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result);
    toast.success("Copied to clipboard!");
  };

  return (
    <ToolLayout
      title="Barcode Scanner"
      description="Scan various types of barcodes using your camera or upload an image"
      category="QR & Barcodes"
      instructions={[
        "Click 'Start Camera' to scan barcodes in real-time",
        "Or upload an image containing a barcode",
        "Supports UPC, EAN, Code128, Code39, and more",
        "The decoded content will appear below",
      ]}
      relatedTools={[
        { name: "QR Code Scanner", path: "/tools/qr-scanner" },
        { name: "Barcode Generator", path: "/tools/barcode-generator" },
        { name: "QR Code Generator", path: "/tools/qr-code-generator" },
      ]}
    >
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
              <div id="barcode-reader" className="w-full min-h-[300px]"></div>
              {!scanning && (
                <div className="flex items-center justify-center h-[300px]">
                  <div className="text-center text-muted-foreground">
                    <Barcode className="h-16 w-16 mx-auto mb-4 opacity-50" />
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
            <div className="mt-2 p-4 bg-muted rounded-lg min-h-[100px] break-all">
              {result ? (
                <>
                  <p className="font-mono text-sm mb-2">{result}</p>
                  {format && (
                    <p className="text-xs text-muted-foreground">Format: {format}</p>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No barcode scanned yet
                </p>
              )}
            </div>
          </div>

          {result && (
            <Button onClick={copyResult} size="lg" className="w-full" variant="secondary">
              <Copy className="h-4 w-4 mr-2" />
              Copy Result
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
    </ToolLayout>
  );
};

export default BarcodeScanner;
