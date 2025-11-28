import { useState, useRef } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Wifi, QrCode } from "lucide-react";
import { toast } from "sonner";
import QRCodeLib from "qrcode";
import { AdSpace } from "@/components/AdSpace";

const WiFiQRGenerator = () => {
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [encryption, setEncryption] = useState("WPA");
  const [hidden, setHidden] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateWiFiString = () => {
    // WiFi QR code format: WIFI:T:WPA;S:mynetwork;P:mypass;H:false;;
    const hiddenFlag = hidden ? "true" : "false";
    return `WIFI:T:${encryption};S:${ssid};P:${password};H:${hiddenFlag};;`;
  };

  const generateQR = async () => {
    if (!ssid) {
      toast.error("Please enter WiFi network name (SSID)");
      return;
    }

    if (encryption !== "nopass" && !password) {
      toast.error("Please enter WiFi password");
      return;
    }

    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const wifiString = generateWiFiString();
      
      await QRCodeLib.toCanvas(canvas, wifiString, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });

      const dataUrl = canvas.toDataURL("image/png");
      setQrCode(dataUrl);

      toast.success("WiFi QR code generated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate WiFi QR code");
    }
  };

  const downloadQR = () => {
    if (!qrCode) return;

    const link = document.createElement("a");
    link.download = `wifi-${ssid}-qr.png`;
    link.href = qrCode;
    link.click();
    toast.success("QR code downloaded!");
  };

  return (
    <ToolLayout
      title="WiFi QR Code Generator"
      description="Generate QR codes to share WiFi credentials instantly"
      category="QR & Barcodes"
      instructions={[
        "Enter your WiFi network name (SSID)",
        "Enter the WiFi password",
        "Select encryption type (WPA/WEP/None)",
        "Mark if network is hidden (optional)",
        "Generate and share the QR code",
        "Others can scan to connect automatically",
      ]}
      relatedTools={[
        { name: "QR Code Generator", path: "/tools/qr-code-generator" },
        { name: "QR Scanner", path: "/tools/qr-scanner" },
        { name: "Barcode Generator", path: "/tools/barcode-generator" },
      ]}
    >
      <AdSpace className="mb-6" />
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="ssid">Network Name (SSID)</Label>
              <div className="relative mt-2">
                <Wifi className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="ssid"
                  placeholder="Enter WiFi network name..."
                  value={ssid}
                  onChange={(e) => setSsid(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="encryption">Encryption Type</Label>
              <Select value={encryption} onValueChange={setEncryption}>
                <SelectTrigger id="encryption" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WPA">WPA/WPA2</SelectItem>
                  <SelectItem value="WEP">WEP</SelectItem>
                  <SelectItem value="nopass">No Password</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {encryption !== "nopass" && (
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter WiFi password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2"
                />
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="hidden"
                checked={hidden}
                onChange={(e) => setHidden(e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="hidden" className="cursor-pointer">
                Hidden Network
              </Label>
            </div>
          </div>

          <Button onClick={generateQR} size="lg" className="w-full">
            <QrCode className="h-4 w-4 mr-2" />
            Generate WiFi QR Code
          </Button>
        </Card>

        <Card className="p-6 flex flex-col items-center justify-center">
          <canvas ref={canvasRef} className="hidden" />
          
          {qrCode ? (
            <div className="space-y-4 w-full">
              <div className="flex justify-center">
                <img
                  src={qrCode}
                  alt="WiFi QR Code"
                  className="border rounded-lg shadow-card"
                />
              </div>
              <div className="text-center text-sm text-muted-foreground">
                <p className="font-semibold">Network: {ssid}</p>
                <p className="text-xs mt-1">Scan to connect automatically</p>
              </div>
              <Button onClick={downloadQR} size="lg" className="w-full" variant="secondary">
                <Download className="h-4 w-4 mr-2" />
                Download QR Code
              </Button>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-12">
              <Wifi className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Your WiFi QR code will appear here</p>
            </div>
          )}
        </Card>
      </div>
      
      <AdSpace className="mt-6" />
    </ToolLayout>
  );
};

export default WiFiQRGenerator;
