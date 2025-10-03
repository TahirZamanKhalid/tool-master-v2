import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/Header";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import QRCodeLib from "qrcode";

const QRCodeGenerator = () => {
  const [text, setText] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [color, setColor] = useState("#2563eb");
  const [bgColor, setBgColor] = useState("#ffffff");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const generateQR = async () => {
    if (!text) {
      toast({
        title: "Error",
        description: "Please enter text or URL",
        variant: "destructive",
      });
      return;
    }

    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      await QRCodeLib.toCanvas(canvas, text, {
        width: 300,
        margin: 2,
        color: {
          dark: color,
          light: bgColor,
        },
      });

      const dataUrl = canvas.toDataURL("image/png");
      setQrCode(dataUrl);

      toast({
        title: "Success!",
        description: "QR code generated successfully",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      });
    }
  };

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
        description="Create custom QR codes with colors and download instantly"
        category="QR & Barcodes"
        instructions={[
          "Enter your text, URL, or any content",
          "Customize colors if desired",
          "Click 'Generate QR Code'",
          "Download your QR code as PNG",
        ]}
        relatedTools={[
          { name: "Barcode Generator", path: "/tools/barcode-generator" },
          { name: "WiFi QR Generator", path: "/tools/wifi-qr" },
        ]}
      >
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="text">Text or URL</Label>
                <Input
                  id="text"
                  placeholder="Enter text, URL, or any content..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="mt-2"
                />
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
            </div>

            <Button
              onClick={generateQR}
              size="lg"
              className="w-full gradient-primary border-0"
            >
              <QrCode className="h-4 w-4 mr-2" />
              Generate QR Code
            </Button>
          </Card>

          <Card className="p-6 flex flex-col items-center justify-center">
            <canvas ref={canvasRef} className="hidden" />
            
            {qrCode ? (
              <div className="space-y-4 w-full">
                <div className="flex justify-center">
                  <img
                    src={qrCode}
                    alt="Generated QR Code"
                    className="border rounded-lg shadow-card"
                  />
                </div>
                <Button onClick={downloadQR} size="lg" className="w-full" variant="secondary">
                  <Download className="h-4 w-4 mr-2" />
                  Download QR Code
                </Button>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                <QrCode className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Your QR code will appear here</p>
              </div>
            )}
          </Card>
        </div>
      </ToolLayout>
    </>
  );
};

export default QRCodeGenerator;
