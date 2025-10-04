import { useState, useEffect, useRef } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Barcode, Camera, Upload, Copy, X } from "lucide-react";
import { toast } from "sonner";
import Quagga from "@ericblade/quagga2";
import { supabase } from "@/integrations/supabase/client";

const BarcodeScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState("");
  const [format, setFormat] = useState("");
  const [productInfo, setProductInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [manualBarcode, setManualBarcode] = useState("");
  const videoRef = useRef<HTMLDivElement>(null);
  const lastScanRef = useRef<string>("");
  const scanTimeoutRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (scanning) {
        Quagga.stop();
      }
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, [scanning]);

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

  const startCamera = async () => {
    try {
      lastScanRef.current = "";
      await Quagga.init({
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: videoRef.current!,
          constraints: {
            facingMode: "environment",
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        },
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
          multiple: false,
        },
        locate: true,
        locator: {
          patchSize: "large",
          halfSample: false,
        },
        numOfWorkers: 0,
      }, (err) => {
        if (err) {
          console.error(err);
          toast.error("Failed to access camera. Please grant camera permissions.");
          return;
        }
        Quagga.start();
        setScanning(true);
        toast.success("Camera ready - position barcode and click Capture");
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to start camera");
    }
  };

  const captureBarcode = () => {
    if (!scanning) return;

    // Take a single frame and decode it
    Quagga.onProcessed((result) => {
      if (result && result.codeResult && result.codeResult.code) {
        const code = result.codeResult.code;
        
        // Check if this is a different code than the last one
        if (code !== lastScanRef.current) {
          lastScanRef.current = code;
          setResult(code);
          setFormat(result.codeResult.format || "Unknown");
          fetchProductInfo(code);
          stopCamera();
          toast.success("Barcode captured successfully!");
        }
      }
    });

    // Also try onDetected for immediate capture
    Quagga.onDetected((data) => {
      if (data.codeResult.code && data.codeResult.code !== lastScanRef.current) {
        lastScanRef.current = data.codeResult.code;
        setResult(data.codeResult.code);
        setFormat(data.codeResult.format || "Unknown");
        fetchProductInfo(data.codeResult.code);
        stopCamera();
        toast.success("Barcode captured successfully!");
      }
    });
  };

  const stopCamera = () => {
    if (scanning) {
      Quagga.stop();
      setScanning(false);
      toast.info("Camera stopped");
    }
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
      title="Barcode Scanner"
      description="Scan various types of barcodes using your camera or upload an image"
      category="QR & Barcodes"
      instructions={[
        "Click 'Start Camera' to activate your camera",
        "Position the barcode in the center frame",
        "Click 'Capture' button to scan the barcode",
        "Or manually enter the barcode number below",
        "Or upload an image containing a barcode",
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
                <span className="bg-background px-2 text-muted-foreground">Or scan</span>
              </div>
            </div>

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
                  <>
                    <Button onClick={captureBarcode} size="lg" className="w-full">
                      <Barcode className="h-4 w-4 mr-2" />
                      Capture
                    </Button>
                    <Button onClick={stopCamera} size="lg" variant="destructive" className="w-full">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden bg-black relative h-[500px]">
              {!scanning && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/90">
                  <div className="text-center text-white">
                    <Barcode className="h-16 w-16 mx-auto mb-4 opacity-70" />
                    <p className="font-semibold">Camera Not Active</p>
                    <p className="text-sm mt-2 opacity-70">Click "Start Camera" above</p>
                  </div>
                </div>
              )}
              <div 
                ref={videoRef} 
                id="barcode-reader" 
                className={`w-full h-full ${!scanning ? 'hidden' : ''}`}
              ></div>
              {scanning && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="border-4 border-primary w-80 h-48 rounded-lg shadow-lg bg-transparent"></div>
                  <p className="text-white bg-black/80 px-6 py-3 rounded-lg mt-4 text-sm font-semibold shadow-lg">
                    Position barcode in frame and click Capture
                  </p>
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
