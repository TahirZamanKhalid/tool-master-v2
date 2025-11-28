import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdSpace } from "@/components/AdSpace";

const RGBConverter = () => {
  const [r, setR] = useState(0);
  const [g, setG] = useState(0);
  const [b, setB] = useState(0);
  const [hex, setHex] = useState("#000000");

  const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + [r, g, b].map(x => {
      const h = x.toString(16);
      return h.length === 1 ? "0" + h : h;
    }).join("");
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      setR(parseInt(result[1], 16));
      setG(parseInt(result[2], 16));
      setB(parseInt(result[3], 16));
    }
  };

  const updateFromRGB = (r: number, g: number, b: number) => {
    setHex(rgbToHex(r, g, b));
  };

  return (
    <ToolLayout
      title="RGB to Hex Converter"
      description="Convert between RGB and Hex color formats"
      category="Design Tools"
    >
      <AdSpace className="mb-6" />
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Red</Label>
              <Input
                type="number"
                min="0"
                max="255"
                value={r}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  setR(val);
                  updateFromRGB(val, g, b);
                }}
              />
            </div>
            <div>
              <Label>Green</Label>
              <Input
                type="number"
                min="0"
                max="255"
                value={g}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  setG(val);
                  updateFromRGB(r, val, b);
                }}
              />
            </div>
            <div>
              <Label>Blue</Label>
              <Input
                type="number"
                min="0"
                max="255"
                value={b}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  setB(val);
                  updateFromRGB(r, g, val);
                }}
              />
            </div>
          </div>
          <div>
            <Label>Hex Color</Label>
            <Input
              value={hex}
              onChange={(e) => {
                setHex(e.target.value);
                hexToRgb(e.target.value);
              }}
            />
          </div>
          <div
            className="h-32 rounded-lg border-2"
            style={{ backgroundColor: hex }}
          />
        </CardContent>
      </Card>
    </ToolLayout>
  );
};

export default RGBConverter;
