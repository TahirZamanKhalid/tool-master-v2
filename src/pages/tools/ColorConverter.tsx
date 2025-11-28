import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdSpace } from "@/components/AdSpace";

const ColorConverter = () => {
  const [hex, setHex] = useState("#3b82f6");

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})`
      : "";
  };

  const hexToHsl = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return "";
    
    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;
    
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
    
    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  };

  return (
    <ToolLayout
      title="Color Converter"
      description="Convert between HEX, RGB, and HSL color formats"
      category="Image Tools"
    >
      <AdSpace size="leaderboard" className="mb-6" />
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <Label>HEX Color</Label>
            <Input
              value={hex}
              onChange={(e) => setHex(e.target.value)}
              placeholder="#3b82f6"
            />
          </div>
          <div
            className="w-full h-32 rounded border"
            style={{ backgroundColor: hex }}
          />
          <div className="space-y-2">
            <div>
              <Label>RGB</Label>
              <Input value={hexToRgb(hex)} readOnly className="bg-muted" />
            </div>
            <div>
              <Label>HSL</Label>
              <Input value={hexToHsl(hex)} readOnly className="bg-muted" />
            </div>
          </div>
        </CardContent>
      </Card>
    </ToolLayout>
  );
};

export default ColorConverter;
