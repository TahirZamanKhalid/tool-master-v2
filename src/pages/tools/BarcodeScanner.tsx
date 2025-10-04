import { useState, useEffect, useRef } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Barcode, Camera, Upload, Copy } from "lucide-react";
import { toast } from "sonner";
import Quagga from "@ericblade/quagga2";

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
      // Try Open Food Facts API first (works for food products)
      const foodResponse = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const foodData = await foodResponse.json();
      
      if (foodData.status === 1 && foodData.product) {
        setProductInfo({
          source: "Open Food Facts",
          name: foodData.product.product_name || "Unknown",
          brand: foodData.product.brands || "Unknown",
          categories: foodData.product.categories || "Unknown",
          image: foodData.product.image_url,
          ingredients: foodData.product.ingredients_text,
          nutrition: {
            energy: foodData.product.nutriments?.energy_value,
            fat: foodData.product.nutriments?.fat,
            carbohydrates: foodData.product.nutriments?.carbohydrates,
            proteins: foodData.product.nutriments?.proteins,
          },
          labels: foodData.product.labels,
          packaging: foodData.product.packaging,
        });
        setLoading(false);
        return;
      }

      // Try UPCItemDB API for general products
      const upcResponse = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`);
      const upcData = await upcResponse.json();
      
      if (upcData.items && upcData.items.length > 0) {
        const item = upcData.items[0];
        setProductInfo({
          source: "UPC Database",
          name: item.title || "Unknown",
          brand: item.brand || "Unknown",
          description: item.description,
          category: item.category,
          image: item.images?.[0],
          price: item.offers?.[0]?.price,
          currency: item.offers?.[0]?.currency,
          merchant: item.offers?.[0]?.merchant,
        });
      } else {
        setProductInfo({
          source: "Not Found",
          message: "Product information not available for this barcode",
        });
      }
    } catch (error) {
      console.error("Error fetching product info:", error);
      setProductInfo({
        source: "Error",
        message: "Failed to fetch product information",
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
            width: { ideal: 1280 },
            height: { ideal: 720 },
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
          patchSize: "medium",
          halfSample: true,
        },
        numOfWorkers: 4,
        frequency: 10,
      }, (err) => {
        if (err) {
          console.error(err);
          toast.error("Failed to access camera. Please grant camera permissions.");
          return;
        }
        Quagga.start();
        setScanning(true);
        toast.success("Camera started - hold barcode steady");
      });

      Quagga.onDetected((data) => {
        if (data.codeResult.code && data.codeResult.code !== lastScanRef.current) {
          // Prevent duplicate scans
          if (scanTimeoutRef.current) {
            clearTimeout(scanTimeoutRef.current);
          }
          
          lastScanRef.current = data.codeResult.code;
          setResult(data.codeResult.code);
          setFormat(data.codeResult.format || "Unknown");
          fetchProductInfo(data.codeResult.code);
          
          // Stop camera after successful scan
          scanTimeoutRef.current = setTimeout(() => {
            stopCamera();
            toast.success("Barcode scanned successfully!");
          }, 100);
        }
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to start camera");
    }
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
        "Click 'Start Camera' to scan barcodes in real-time",
        "Hold the barcode steady and centered for best results",
        "Or manually enter the barcode number below",
        "Or upload an image containing a barcode",
        "Supports UPC, EAN, Code128, Code39, and more",
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
                  <Button onClick={stopCamera} size="lg" variant="destructive" className="col-span-2">
                    Stop Camera
                  </Button>
                )}
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden bg-black relative">
              <div ref={videoRef} id="barcode-reader" className="w-full min-h-[400px]"></div>
              {!scanning && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                  <div className="text-center text-white">
                    <Barcode className="h-16 w-16 mx-auto mb-4 opacity-70" />
                    <p>Camera preview will appear here</p>
                    <p className="text-xs mt-2 opacity-70">Position barcode in center of screen</p>
                  </div>
                </div>
              )}
              {scanning && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="border-4 border-primary w-64 h-40 rounded-lg"></div>
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
