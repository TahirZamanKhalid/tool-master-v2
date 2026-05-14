import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pipette } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ImageEditorColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  isPickerActive: boolean;
  onTogglePicker: () => void;
}

const PRESET_COLORS = [
  "#000000", "#FFFFFF", "#FF0000", "#00FF00", "#0000FF",
  "#FFFF00", "#FF00FF", "#00FFFF", "#FFA500", "#800080",
  "#FFC0CB", "#A52A2A", "#808080", "#00FF7F", "#DC143C"
];

export const ImageEditorColorPicker = ({
  selectedColor,
  onColorChange,
  isPickerActive,
  onTogglePicker,
}: ImageEditorColorPickerProps) => {
  const [customColor, setCustomColor] = useState(selectedColor);

  const handleCustomColorChange = (color: string) => {
    setCustomColor(color);
    onColorChange(color);
  };

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Color</h3>
        <Button
          size="sm"
          variant={isPickerActive ? "default" : "outline"}
          onClick={onTogglePicker}
          className="h-7 px-2"
        >
          <Pipette className="h-3 w-3 mr-1" />
          Pick
        </Button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div
            className="w-10 h-10 rounded border-2 border-border"
            style={{ backgroundColor: selectedColor }}
          />
          <Input
            type="color"
            value={customColor}
            onChange={(e) => handleCustomColorChange(e.target.value)}
            className="flex-1 h-10 cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-5 gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              className={`w-full aspect-square rounded border-2 transition-all hover:scale-110 ${
                selectedColor === color ? "border-primary ring-2 ring-primary/50" : "border-border"
              }`}
              style={{ backgroundColor: color }}
              onClick={() => onColorChange(color)}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>

        <Input
          type="text"
          value={selectedColor}
          onChange={(e) => handleCustomColorChange(e.target.value)}
          placeholder="#000000"
          className="h-8 text-xs font-mono"
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Click <strong>Pick</strong> to sample colors from the image
      </p>
    </Card>
  );
};
