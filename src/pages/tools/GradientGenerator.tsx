import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AdSpace } from "@/components/AdSpace";

const GradientGenerator = () => {
  const [color1, setColor1] = useState("#3b82f6");
  const [color2, setColor2] = useState("#8b5cf6");
  const [angle, setAngle] = useState("90");

  const gradient = `linear-gradient(${angle}deg, ${color1}, ${color2})`;

  const copyCSS = () => {
    navigator.clipboard.writeText(`background: ${gradient};`);
    toast.success("CSS copied to clipboard!");
  };

  return (
    <ToolLayout
      title="Gradient Generator"
      description="Create beautiful CSS gradients"
      category="Image Tools"
    >
      <AdSpace size="leaderboard" className="mb-6" />
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Color 1</Label>
              <Input
                type="color"
                value={color1}
                onChange={(e) => setColor1(e.target.value)}
              />
            </div>
            <div>
              <Label>Color 2</Label>
              <Input
                type="color"
                value={color2}
                onChange={(e) => setColor2(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label>Angle: {angle}°</Label>
            <Input
              type="range"
              min="0"
              max="360"
              value={angle}
              onChange={(e) => setAngle(e.target.value)}
            />
          </div>
          <div
            className="w-full h-48 rounded border"
            style={{ background: gradient }}
          />
          <Input value={gradient} readOnly className="font-mono text-sm" />
          <Button onClick={copyCSS} className="w-full">
            Copy CSS
          </Button>
        </CardContent>
      </Card>
    </ToolLayout>
  );
};

export default GradientGenerator;
