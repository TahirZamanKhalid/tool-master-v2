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

const BarcodeGenerator = () => {
  const [text, setText] = useState("");
  const [format, setFormat] = useState("CODE128");
  const [width, setWidth] = useState(2);
  const [height, setHeight] = useState(100);
  const [displayValue, setDisplayValue] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [barcodeGenerated, setBarcodeGenerated] = useState(false);

  const formats = [
    { value: "CODE128", label: "CODE128 (Default)" },
    { value: "CODE39", label: "CODE39" },
    { value: "EAN13", label: "EAN-13" },
    { value: "EAN8", label: "EAN-8" },
    { value: "UPC", label: "UPC" },
    { value: "ITF14", label: "ITF-14" },
    { value: "MSI", label: "MSI" },
    { value: "pharmacode", label: "Pharmacode" },
  ];

  const generateBarcode = () => {
    if (!text) {
      toast.error("Please enter text to generate barcode");
      return;
    }

    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      JsBarcode(canvas, text, {
        format: format,
        width: width,
        height: height,
        displayValue: displayValue,
        fontSize: 16,
        margin: 10,
      });

      setBarcodeGenerated(true);
      toast.success("Barcode generated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate barcode. Check your input format.");
    }
  };

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

  return (
    <ToolLayout
      title="Barcode Generator"
      description="Generate various types of barcodes instantly"
      category="QR & Barcodes"
      instructions={[
        "Enter the text or number you want to encode",
        "Select the barcode format (CODE128, EAN13, etc.)",
        "Customize width and height if needed",
        "Click 'Generate Barcode' to create",
        "Download your barcode as PNG",
      ]}
      relatedTools={[
        { name: "QR Code Generator", path: "/tools/qr-code-generator" },
        { name: "QR Scanner", path: "/tools/qr-scanner" },
        { name: "Barcode Scanner", path: "/tools/barcode-scanner" },
      ]}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="text">Barcode Text/Number</Label>
              <Input
                id="text"
                placeholder="Enter text or number..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="mt-2"
              />
            </div>

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

          <Button onClick={generateBarcode} size="lg" className="w-full">
            <Barcode className="h-4 w-4 mr-2" />
            Generate Barcode
          </Button>
        </Card>

        <Card className="p-6 flex flex-col items-center justify-center">
          {barcodeGenerated ? (
            <div className="space-y-4 w-full">
              <div className="flex justify-center p-4 bg-white rounded-lg">
                <canvas ref={canvasRef} />
              </div>
              <Button onClick={downloadBarcode} size="lg" className="w-full" variant="secondary">
                <Download className="h-4 w-4 mr-2" />
                Download Barcode
              </Button>
            </div>
          ) : (
            <>
              <canvas ref={canvasRef} className="hidden" />
              <div className="text-center text-muted-foreground py-12">
                <Barcode className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Your barcode will appear here</p>
              </div>
            </>
          )}
        </Card>
      </div>
    </ToolLayout>
  );
};

export default BarcodeGenerator;
