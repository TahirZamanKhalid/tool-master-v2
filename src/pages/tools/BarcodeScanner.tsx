import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Barcode, Upload, Copy } from "lucide-react";
import { toast } from "sonner";
import Quagga from "@ericblade/quagga2";
import { supabase } from "@/integrations/supabase/client";

const BarcodeScanner = () => {
  const [result, setResult] = useState("");
  const [format, setFormat] = useState("");
  const [productInfo, setProductInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [manualBarcode, setManualBarcode] = useState("");

  const fetchProductInfo = async (barcode: string) => {
    setLoading(true);
    setProductInfo(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('lookup-barcode', {
        body: { barcode }
      });

      if (error) throw error;

      if (data) {
        setProductInfo(data);
      }
    } catch (error) {
      console.error("Error fetching product info:", error);
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

  const scanFile = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        const imageSrc = event.target?.result as string;
        
        try {
          await Quagga.decodeSingle({
            src: imageSrc,
            numOfWorkers: 0,
            decoder: {
              readers: [
                "ean_reader",
                "ean_8_reader",
                "code_128_reader",
                "code_39_reader",
                "code_39_vin_reader",
                "codabar_reader",
                "upc_reader",
                "upc_e_reader",
                "i2of5_reader",
              ],
            },
            locate: true,
          }, (data) => {
            if (data && data.codeResult && data.codeResult.code) {
              setResult(data.codeResult.code);
              setFormat(data.codeResult.format || "Detected from image");
              fetchProductInfo(data.codeResult.code);
              toast.success("Barcode decoded successfully!");
            } else {
              toast.error("No barcode found in image. Try a clearer photo.");
            }
          });
        } catch (error) {
          console.error(error);
          toast.error("Failed to decode barcode from image");
        }
      };
      reader.readAsDataURL(file);
    };

    input.click();
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result);
    toast.success("Copied to clipboard!");
  };

  return (
    <ToolLayout
      title="Barcode Lookup"
      description="Look up product information by entering a barcode number or uploading an image"
      category="QR & Barcodes"
      instructions={[
        "Enter a barcode number (8-14 digits) and click Lookup",
        "Or upload an image containing a barcode",
        "View detailed product information from various databases",
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
              <Label>Manual Barcode Entry</Label>
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  placeholder="Enter barcode number (e.g., 012345678912)"
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => e.key === 'Enter' && handleManualLookup()}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  maxLength={14}
                />
                <Button onClick={handleManualLookup} size="lg">
                  Lookup
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Enter 8-14 digit barcode number</p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or scan from image</span>
              </div>
            </div>

            <div>
              <Label>Upload Barcode Image</Label>
              <Button onClick={scanFile} size="lg" variant="secondary" className="w-full mt-2">
                <Upload className="h-4 w-4 mr-2" />
                Upload Image
              </Button>
              <p className="text-xs text-muted-foreground mt-1">Upload an image containing a barcode</p>
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
                <p className="text-sm text-muted-foreground">{productInfo.message}</p>
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
    </ToolLayout>
  );
};

export default BarcodeScanner;
