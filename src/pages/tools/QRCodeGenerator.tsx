import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/Header";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, QrCode } from "lucide-react";
import { toast } from "sonner";
import QRCodeLib from "qrcode";
import { AdSpace } from "@/components/AdSpace";

const QRCodeGenerator = () => {
  const [text, setText] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [color, setColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<"L" | "M" | "Q" | "H">("M");
  const [size, setSize] = useState(300);
  const [margin, setMargin] = useState(4);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateQR = async () => {
    if (!text) {
      setQrCode("");
      return;
    }

    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      await QRCodeLib.toCanvas(canvas, text, {
        width: size,
        margin: margin,
        errorCorrectionLevel: errorCorrectionLevel,
        color: {
          dark: color,
          light: bgColor,
        },
      });

      const dataUrl = canvas.toDataURL("image/png");
      setQrCode(dataUrl);

      toast.success("QR code generated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate QR code. Check your input.");
    }
  };

  // Auto-generate QR code when parameters change
  useEffect(() => {
    if (text) {
      const timer = setTimeout(() => {
        generateQR();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setQrCode("");
    }
  }, [text, color, bgColor, errorCorrectionLevel, size, margin]);

  const downloadQR = () => {
    if (!qrCode) return;

    const link = document.createElement("a");
    link.download = "qr-code.png";
    link.href = qrCode;
    link.click();
  };

  return (
    <>
      <Header />
      <ToolLayout
        title="QR Code Generator"
        description="Advanced QR code generator with real-time preview and customization"
        category="QR & Barcodes"
        instructions={[
          "Enter your text, URL, or any content",
          "QR code generates automatically as you type",
          "Customize colors, size, error correction, and margin",
          "Higher error correction allows damaged codes to be read",
          "Download your QR code as PNG image",
        ]}
        relatedTools={[
          { name: "Barcode Generator", path: "/tools/barcode-generator" },
          { name: "WiFi QR Generator", path: "/tools/wifi-qr" },
          { name: "QR Scanner", path: "/tools/qr-scanner" },
        ]}
      >
        <AdSpace size="leaderboard" className="mb-6" />
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="text">Text or URL</Label>
                <textarea
                  id="text"
                  placeholder="Enter text, URL, or any content..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2 resize-none"
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {text.length > 0 ? `${text.length} characters` : "Real-time generation"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="color">QR Color</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="color"
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-16 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      placeholder="#000000"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bgcolor">Background</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="bgcolor"
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-16 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      placeholder="#FFFFFF"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="errorCorrection">Error Correction Level</Label>
                <Select value={errorCorrectionLevel} onValueChange={(value: "L" | "M" | "Q" | "H") => setErrorCorrectionLevel(value)}>
                  <SelectTrigger id="errorCorrection" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">Low (7% recovery)</SelectItem>
                    <SelectItem value="M">Medium (15% recovery)</SelectItem>
                    <SelectItem value="Q">Quartile (25% recovery)</SelectItem>
                    <SelectItem value="H">High (30% recovery)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Higher levels = more damage tolerance
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="size">Size: {size}px</Label>
                  <Input
                    id="size"
                    type="range"
                    min="200"
                    max="600"
                    step="50"
                    value={size}
                    onChange={(e) => setSize(Number(e.target.value))}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="margin">Margin: {margin}</Label>
                  <Input
                    id="margin"
                    type="range"
                    min="0"
                    max="10"
                    value={margin}
                    onChange={(e) => setMargin(Number(e.target.value))}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 flex flex-col items-center justify-center">
            <canvas ref={canvasRef} className="hidden" />

            {qrCode ? (
              <div className="space-y-4 w-full">
                <div className="flex justify-center p-4 bg-white rounded-lg">
                  <img
                    src={qrCode}
                    alt="Generated QR Code"
                    className="border rounded-lg shadow-card"
                    style={{ maxWidth: `${size}px` }}
                  />
                </div>
                <div className="text-center text-sm text-muted-foreground space-y-1">
                  <p>Size: {size}x{size}px</p>
                  <p>Error Correction: {errorCorrectionLevel}</p>
                  <p className="text-xs">Updates in real-time as you type</p>
                </div>
                <Button onClick={downloadQR} size="lg" className="w-full" variant="secondary">
                  <Download className="h-4 w-4 mr-2" />
                  Download PNG
                </Button>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                <QrCode className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="font-medium">Your QR code will appear here</p>
                <p className="text-sm mt-2">Start typing to generate instantly</p>
              </div>
            )}
          </Card>
        </div>

        <AdSpace size="leaderboard" className="mt-6" />
      </ToolLayout>
    </>
  );
};

export default QRCodeGenerator;
