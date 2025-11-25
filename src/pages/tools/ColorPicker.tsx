import { useState } from "react";
import { Header } from "@/components/Header";
import { ToolLayout } from "@/components/ToolLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Copy } from "lucide-react";

const ColorPicker = () => {
  const [color, setColor] = useState("#3b82f6");
  const { toast } = useToast();

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  const hexToHsl = (hex: string) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return null;
    
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  };

  const rgb = hexToRgb(color);
  const hsl = hexToHsl(color);

  const copyToClipboard = (text: string, format: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: `${format} value copied successfully`,
    });
  };

  const generateShades = () => {
    const hslColor = hexToHsl(color);
    if (!hslColor) return [];
    
    return [10, 20, 30, 40, 50, 60, 70, 80, 90].map(lightness => {
      const h = hslColor.h;
      const s = hslColor.s;
      const l = lightness;
      
      const hslToHex = (h: number, s: number, l: number) => {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = (n: number) => {
          const k = (n + h / 30) % 12;
          const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
          return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
      };
      
      return hslToHex(h, s, l);
    });
  };

  const shades = generateShades();

  return (
    <>
      <Header />
      <ToolLayout
        title="Color Picker"
        description="Pick colors and generate color palettes with HEX, RGB, and HSL values"
        category="Developer Tools"
        instructions={[
          "Use the color picker to select your desired color",
          "Copy color values in different formats (HEX, RGB, HSL)",
          "View and copy generated color shades",
        ]}
        relatedTools={[
          { name: "JSON Formatter", path: "/tools/json-formatter" },
          { name: "Image Compressor", path: "/tools/image-compressor" },
        ]}
      >
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <Label className="text-lg mb-4 block">Pick a Color</Label>
                <div className="space-y-4">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full h-64 rounded-lg cursor-pointer border-2"
                  />
                  <Input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="font-mono text-center text-lg"
                  />
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <Label className="text-lg mb-4 block">Color Values</Label>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <Label className="text-sm text-muted-foreground">HEX</Label>
                        <Input value={color.toUpperCase()} readOnly className="font-mono" />
                      </div>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => copyToClipboard(color, "HEX")}
                        className="mt-6"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>

                    {rgb && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <Label className="text-sm text-muted-foreground">RGB</Label>
                          <Input
                            value={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`}
                            readOnly
                            className="font-mono"
                          />
                        </div>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => copyToClipboard(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, "RGB")}
                          className="mt-6"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    {hsl && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <Label className="text-sm text-muted-foreground">HSL</Label>
                          <Input
                            value={`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`}
                            readOnly
                            className="font-mono"
                          />
                        </div>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => copyToClipboard(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`, "HSL")}
                          className="mt-6"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <Label className="text-lg mb-4 block">Color Shades</Label>
            <div className="grid grid-cols-9 gap-2">
              {shades.map((shade, index) => (
                <div
                  key={index}
                  className="aspect-square rounded-lg cursor-pointer hover:scale-105 transition-smooth border"
                  style={{ backgroundColor: shade }}
                  onClick={() => {
                    setColor(shade);
                    copyToClipboard(shade, "Shade");
                  }}
                  title={shade}
                />
              ))}
            </div>
          </Card>
        </div>
      </ToolLayout>
    </>
  );
};

export default ColorPicker;
