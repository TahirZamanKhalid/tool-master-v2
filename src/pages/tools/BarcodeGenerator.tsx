import { useState, useRef, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Barcode } from "lucide-react";
import { toast } from "sonner";
import JsBarcode from "jsbarcode";
import { AdSpace } from "@/components/AdSpace";

const BarcodeGenerator = () => {
  const [text, setText] = useState("");
  const [format, setFormat] = useState("CODE128");
  const [width, setWidth] = useState(2);
  const [height, setHeight] = useState(100);
  const [displayValue, setDisplayValue] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [barcodeGenerated, setBarcodeGenerated] = useState(false);

  const formats = [
    {
      value: "CODE128",
      label: "CODE128 (Universal)",
      description: "Alphanumeric + special characters",
      example: "ABC-12345"
    },
    {
      value: "CODE39",
      label: "CODE39",
      description: "A-Z, 0-9, and special chars",
      example: "CODE39"
    },
    {
      value: "EAN13",
      label: "EAN-13 (Retail)",
      description: "13 digits exactly",
      example: "5901234123457"
    },
    {
      value: "EAN8",
      label: "EAN-8 (Small Retail)",
      description: "8 digits exactly",
      example: "96385074"
    },
    {
      value: "UPC",
      label: "UPC-A (US Retail)",
      description: "12 digits exactly",
      example: "123456789012"
    },
    {
      value: "CODE93",
      label: "CODE93",
      description: "Similar to CODE39, more compact",
      example: "CODE93"
    },
    {
      value: "ITF14",
      label: "ITF-14 (Shipping)",
      description: "14 digits exactly",
      example: "12345678901231"
    },
    {
      value: "MSI",
      label: "MSI",
      description: "Numeric only",
      example: "1234567890"
    },
    {
      value: "pharmacode",
      label: "Pharmacode",
      description: "Pharmaceutical - 3-131070",
      example: "12345"
    },
    {
      value: "codabar",
      label: "Codabar",
      description: "Logistics - 0-9, $, -, :, /, ., +",
      example: "A123456B"
    },
  ];

  const generateBarcode = () => {
    if (!text) {
      setBarcodeGenerated(false);
      return;
    }

    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Clear canvas before drawing
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      JsBarcode(canvas, text, {
        format: format,
        width: width,
        height: height,
        displayValue: displayValue,
        fontSize: 16,
        margin: 10,
        background: "#ffffff",
        lineColor: "#000000",
      });

      setBarcodeGenerated(true);
    } catch (error) {
      console.error(error);
      setBarcodeGenerated(false);
      toast.error("Invalid input for this barcode format. Check requirements.");
    }
  };

  // Auto-generate on text/settings change
  useEffect(() => {
    if (text) {
      const timer = setTimeout(() => {
        generateBarcode();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setBarcodeGenerated(false);
    }
  }, [text, format, width, height, displayValue]);

  const downloadBarcode = () => {
    if (!barcodeGenerated) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = "barcode.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast.success("Barcode downloaded!");
  };

  const selectedFormat = formats.find(f => f.value === format);

  return (
    <ToolLayout
      title="Barcode Generator"
      description="Advanced barcode generator with real-time preview and 10+ formats"
      category="QR & Barcodes"
      instructions={[
        "Enter the text or number you want to encode",
        "Select the barcode format (CODE128, EAN13, UPC, etc.)",
        "Barcode generates automatically in real-time",
        "Each format has specific requirements - check the hints",
        "Customize width, height, and display options",
        "Download your barcode as PNG image",
      ]}
      relatedTools={[
        { name: "QR Code Generator", path: "/tools/qr-code-generator" },
        { name: "QR Scanner", path: "/tools/qr-scanner" },
        { name: "Barcode Scanner", path: "/tools/barcode-scanner" },
      ]}
    >
      <AdSpace size="leaderboard" className="mb-6" />
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="format">Barcode Format</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger id="format" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {formats.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedFormat && (
                <div className="mt-2 p-3 bg-muted/50 rounded-md text-xs space-y-1">
                  <p className="text-muted-foreground">{selectedFormat.description}</p>
                  <p className="font-mono text-primary">Example: {selectedFormat.example}</p>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="text">Barcode Content</Label>
              <Input
                id="text"
                placeholder={selectedFormat?.example || "Enter text or number..."}
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="mt-2 font-mono"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {text.length > 0 ? `${text.length} characters` : "Real-time generation"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="width">Line Width: {width}</Label>
                <Input
                  id="width"
                  type="range"
                  min="1"
                  max="5"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="height">Height: {height}px</Label>
                <Input
                  id="height"
                  type="range"
                  min="50"
                  max="200"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="displayValue"
                checked={displayValue}
                onChange={(e) => setDisplayValue(e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="displayValue" className="cursor-pointer">
                Display text below barcode
              </Label>
            </div>
          </div>
        </Card>

        <Card className="p-6 flex flex-col items-center justify-center">
          {barcodeGenerated ? (
            <div className="space-y-4 w-full">
              <div className="flex justify-center p-4 bg-white rounded-lg">
                <canvas ref={canvasRef} />
              </div>
              <div className="text-center text-sm text-muted-foreground space-y-1">
                <p>Format: <span className="font-semibold">{selectedFormat?.label}</span></p>
                <p className="text-xs">Updates in real-time as you type</p>
              </div>
              <Button onClick={downloadBarcode} size="lg" className="w-full" variant="secondary">
                <Download className="h-4 w-4 mr-2" />
                Download PNG
              </Button>
            </div>
          ) : (
            <>
              <canvas ref={canvasRef} className="hidden" />
              <div className="text-center text-muted-foreground py-12">
                <Barcode className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="font-medium">Your barcode will appear here</p>
                <p className="text-sm mt-2">Start typing to generate instantly</p>
              </div>
            </>
          )}
        </Card>
      </div>

      <AdSpace size="leaderboard" className="mt-6" />
    </ToolLayout>
  );
};

export default BarcodeGenerator;
