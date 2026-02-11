// components/FontInfoPanel.tsx
import { FontInfo } from "../../utils/pdfTextExtractor";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Type, Check } from "lucide-react";

interface FontInfoPanelProps {
    fonts: Map<string, FontInfo>;
}

export const FontInfoPanel = ({ fonts }: FontInfoPanelProps) => {
    const fontList = Array.from(fonts.values());

    if (fontList.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <Type className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No fonts detected</p>
            </div>
        );
    }

    return (
        <ScrollArea className="h-[300px]">
            <div className="space-y-3 p-4">
                <div className="text-xs text-muted-foreground mb-2">
                    {fontList.length} font{fontList.length !== 1 ? "s" : ""} detected
                </div>

                {fontList.map((font, index) => (
                    <div
                        key={index}
                        className="p-3 bg-muted/50 rounded-lg space-y-2"
                    >
                        <div className="flex items-center justify-between">
                            <span
                                className="font-medium"
                                style={{ fontFamily: font.family }}
                            >
                                {font.name}
                            </span>
                            <div className="flex gap-1">
                                {font.weight === "bold" && (
                                    <Badge variant="secondary" className="text-xs">Bold</Badge>
                                )}
                                {font.style === "italic" && (
                                    <Badge variant="secondary" className="text-xs">Italic</Badge>
                                )}
                            </div>
                        </div>

                        <div className="text-xs text-muted-foreground space-y-1">
                            <div className="flex justify-between">
                                <span>Web Font:</span>
                                <span className="font-mono">{font.family.split(",")[0]}</span>
                            </div>
                            <div className="flex gap-3">
                                {font.isSerif && (
                                    <span className="flex items-center gap-1">
                                        <Check className="h-3 w-3 text-green-500" />
                                        Serif
                                    </span>
                                )}
                                {font.isMonospace && (
                                    <span className="flex items-center gap-1">
                                        <Check className="h-3 w-3 text-green-500" />
                                        Monospace
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Preview */}
                        <div
                            className="p-2 bg-white dark:bg-gray-800 rounded text-sm border"
                            style={{
                                fontFamily: font.family,
                                fontWeight: font.weight,
                                fontStyle: font.style,
                            }}
                        >
                            The quick brown fox jumps over the lazy dog. 0123456789
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
    );
};