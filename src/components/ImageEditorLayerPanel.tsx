import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  imageData: ImageData | null;
}

interface ImageEditorLayerPanelProps {
  layers: Layer[];
  activeLayerId: string;
  onLayerSelect: (layerId: string) => void;
  onLayerToggle: (layerId: string) => void;
  onLayerAdd: () => void;
  onLayerDelete: (layerId: string) => void;
  onLayerRename: (layerId: string, name: string) => void;
}

export const ImageEditorLayerPanel = ({
  layers,
  activeLayerId,
  onLayerSelect,
  onLayerToggle,
  onLayerAdd,
  onLayerDelete,
  onLayerRename,
}: ImageEditorLayerPanelProps) => {
  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Layers</h3>
        <Button
          size="sm"
          variant="outline"
          onClick={onLayerAdd}
          className="h-7 px-2"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add
        </Button>
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {layers.map((layer, index) => (
          <div
            key={layer.id}
            className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
              layer.id === activeLayerId
                ? "border-primary bg-primary/10"
                : "border-border hover:bg-accent"
            }`}
            onClick={() => onLayerSelect(layer.id)}
          >
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onLayerToggle(layer.id);
              }}
            >
              {layer.visible ? (
                <Eye className="h-3 w-3" />
              ) : (
                <EyeOff className="h-3 w-3 opacity-50" />
              )}
            </Button>

            <Input
              value={layer.name}
              onChange={(e) => onLayerRename(layer.id, e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="h-6 text-xs flex-1 px-2"
            />

            {layers.length > 1 && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onLayerDelete(layer.id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Click layer to select • Eye to toggle visibility
      </p>
    </Card>
  );
};
