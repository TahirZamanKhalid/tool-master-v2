import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdSpace } from "@/components/AdSpace";
import { Copy, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ColorPaletteGenerator = () => {
  const { toast } = useToast();
  const [palette, setPalette] = useState<string[]>([]);

  const generateRandomColor = () => {
    return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
  };

  const generatePalette = () => {
    const colors = Array.from({ length: 5 }, () => generateRandomColor());
    setPalette(colors);
  };

  const copyColor = (color: string) => {
    navigator.clipboard.writeText(color);
    toast({ description: `Copied ${color}` });
  };

  return (
    <ToolLayout
      title="Color Palette Generator"
      description="Generate beautiful random color palettes"
      category="Image Tools"
    >
      <AdSpace size="leaderboard" className="mb-6" />
      <Card>
        <CardContent className="p-6 space-y-4">
          <Button onClick={generatePalette} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Generate Palette
          </Button>
          {palette.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {palette.map((color, idx) => (
                <div key={idx} className="space-y-2">
                  <div
                    className="h-32 rounded-lg cursor-pointer hover:scale-105 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => copyColor(color)}
                  />
                  <div className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="font-mono text-sm">{color}</span>
                    <Copy
                      className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground"
                      onClick={() => copyColor(color)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </ToolLayout>
  );
};

export default ColorPaletteGenerator;
